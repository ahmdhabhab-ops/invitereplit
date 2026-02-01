import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, insertSiteSettingsSchema, insertPartnershipRequestSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";
import session from "express-session";
import connectPg from "connect-pg-simple";

// Admin credentials from environment variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "info@einvite.me";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

// Validate admin credentials on startup
if (!ADMIN_PASSWORD) {
  console.warn("Warning: ADMIN_PASSWORD environment variable not set. Admin login will be disabled.");
}

// Extend session type
declare module "express-session" {
  interface SessionData {
    isAdmin?: boolean;
    adminEmail?: string;
  }
}

// Middleware to check if user is admin
const isAdmin: RequestHandler = (req, res, next) => {
  if (req.session?.isAdmin) {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized. Please log in as admin." });
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup session
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  app.set("trust proxy", 1);
  app.use(session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  }));

  // Admin login endpoint
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      
      // Check if admin login is configured
      if (!ADMIN_PASSWORD) {
        return res.status(503).json({ error: "Admin login not configured" });
      }
      
      // Verify credentials
      if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      
      // Set session
      req.session.isAdmin = true;
      req.session.adminEmail = email;
      
      res.json({ success: true, email });
    } catch (error) {
      console.error("Error during admin login:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Admin logout endpoint
  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  // Check admin session
  app.get("/api/admin/session", (req, res) => {
    if (req.session?.isAdmin) {
      res.json({ isAdmin: true, email: req.session.adminEmail });
    } else {
      res.json({ isAdmin: false });
    }
  });

  // Get all orders (for admin dashboard - protected with admin check)
  app.get("/api/orders", isAdmin, async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Get single order
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  // Create new order (public endpoint for form submissions)
  app.post("/api/orders", async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validatedData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      }
      console.error("Error creating order:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Update order payment status (protected with admin check)
  app.patch("/api/orders/:id/payment", isAdmin, async (req, res) => {
    try {
      const status = req.body.status as string;
      if (!status || !["pending", "completed", "failed"].includes(status)) {
        return res.status(400).json({ error: "Invalid payment status" });
      }
      
      const order = await storage.updateOrderPaymentStatus(req.params.id, status);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error updating order payment:", error);
      res.status(500).json({ error: "Failed to update payment status" });
    }
  });

  // Get site settings (public for frontend)
  app.get("/api/settings", async (req, res) => {
    try {
      let settings = await storage.getSiteSettings();
      if (!settings) {
        // Create default settings if none exist
        settings = await storage.upsertSiteSettings({});
      }
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  // Update site settings (protected - admin only)
  app.patch("/api/settings", isAdmin, async (req, res) => {
    try {
      // Create a partial schema for validation
      const updateSettingsSchema = insertSiteSettingsSchema.partial();
      const validatedData = updateSettingsSchema.parse(req.body);
      
      const updated = await storage.upsertSiteSettings(validatedData);
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      }
      console.error("Error updating settings:", error);
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Partnership request endpoints
  // Create new partnership request (public)
  app.post("/api/partnership-requests", async (req, res) => {
    try {
      const validatedData = insertPartnershipRequestSchema.parse(req.body);
      const request = await storage.createPartnershipRequest(validatedData);
      res.status(201).json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      }
      console.error("Error creating partnership request:", error);
      res.status(500).json({ error: "Failed to submit partnership request" });
    }
  });

  // Get all partnership requests (admin only)
  app.get("/api/partnership-requests", isAdmin, async (req, res) => {
    try {
      const requests = await storage.getPartnershipRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching partnership requests:", error);
      res.status(500).json({ error: "Failed to fetch partnership requests" });
    }
  });

  // Update partnership request status (admin only)
  app.patch("/api/partnership-requests/:id/status", isAdmin, async (req, res) => {
    try {
      const status = req.body.status as string;
      if (!status || !["pending", "contacted", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      const request = await storage.updatePartnershipRequestStatus(req.params.id, status);
      if (!request) {
        return res.status(404).json({ error: "Partnership request not found" });
      }
      res.json(request);
    } catch (error) {
      console.error("Error updating partnership request:", error);
      res.status(500).json({ error: "Failed to update partnership request" });
    }
  });

  return httpServer;
}
