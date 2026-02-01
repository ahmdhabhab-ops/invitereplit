import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, insertSiteSettingsSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

// Middleware to check if user is admin
const isAdmin: RequestHandler = async (req: any, res, next) => {
  try {
    const userEmail = req.user?.claims?.email;
    if (!userEmail) {
      return res.status(403).json({ error: "Not authorized" });
    }
    
    const settings = await storage.getSiteSettings();
    const adminEmails = settings?.adminEmails || [];
    
    // Allow if no admins set yet (first user becomes admin) or user is in admin list
    if (adminEmails.length === 0 || adminEmails.includes(userEmail)) {
      return next();
    }
    
    return res.status(403).json({ error: "Not authorized to access admin resources" });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return res.status(500).json({ error: "Failed to verify admin status" });
  }
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // Get all orders (for admin dashboard - protected with admin check)
  app.get("/api/orders", isAuthenticated, isAdmin, async (req, res) => {
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
  app.patch("/api/orders/:id/payment", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { status } = req.body;
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
  app.patch("/api/settings", isAuthenticated, isAdmin, async (req: any, res) => {
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

  // Check if user is admin
  app.get("/api/admin/check", isAuthenticated, async (req: any, res) => {
    try {
      const userEmail = req.user?.claims?.email;
      const settings = await storage.getSiteSettings();
      const adminEmails = settings?.adminEmails || [];
      
      // First authenticated user becomes admin if no admins exist
      const isAdmin = adminEmails.length === 0 || adminEmails.includes(userEmail);
      
      res.json({ isAdmin, email: userEmail });
    } catch (error) {
      console.error("Error checking admin status:", error);
      res.status(500).json({ error: "Failed to check admin status" });
    }
  });

  return httpServer;
}
