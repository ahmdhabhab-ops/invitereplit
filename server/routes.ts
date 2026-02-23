import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, insertSiteSettingsSchema, insertPartnershipRequestSchema, insertJobOpeningSchema, insertJobApplicationSchema, insertInvoiceSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";
import session from "express-session";
import connectPg from "connect-pg-simple";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage_multer,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.rtf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, TXT, and RTF files are allowed'));
    }
  }
});

const mediaUpload = multer({
  storage: storage_multer,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.heic', '.heif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (PNG, JPG, GIF, WEBP, HEIC) are allowed'));
    }
  }
});

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

  // ========== Job Opening Endpoints ==========
  
  // Get all job openings (public - only active jobs, admin - all jobs)
  app.get("/api/jobs", async (req, res) => {
    try {
      const activeOnly = !req.session?.isAdmin;
      const jobs = await storage.getJobOpenings(activeOnly);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ error: "Failed to fetch job openings" });
    }
  });

  // Get single job opening (public)
  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJobOpening(req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      // Non-admins can only see active jobs
      if (!req.session?.isAdmin && job.isActive !== "true") {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ error: "Failed to fetch job" });
    }
  });

  // Create job opening (admin only)
  app.post("/api/jobs", isAdmin, async (req, res) => {
    try {
      const validatedData = insertJobOpeningSchema.parse(req.body);
      const job = await storage.createJobOpening(validatedData);
      res.status(201).json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Error creating job:", error);
      res.status(500).json({ error: "Failed to create job opening" });
    }
  });

  // Update job opening (admin only)
  app.patch("/api/jobs/:id", isAdmin, async (req, res) => {
    try {
      const updateSchema = insertJobOpeningSchema.partial();
      const validatedData = updateSchema.parse(req.body);
      const job = await storage.updateJobOpening(req.params.id, validatedData);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Error updating job:", error);
      res.status(500).json({ error: "Failed to update job opening" });
    }
  });

  // Delete job opening (admin only)
  app.delete("/api/jobs/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteJobOpening(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting job:", error);
      res.status(500).json({ error: "Failed to delete job opening" });
    }
  });

  // ========== File Upload Endpoint ==========
  
  // Upload resume file (public)
  app.post("/api/upload/resume", upload.single("resume"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ url: fileUrl, filename: req.file.originalname });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  app.post("/api/upload/media", mediaUpload.array("media", 10), (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }
      const urls = files.map(file => `/uploads/${file.filename}`);
      res.json({ urls });
    } catch (error) {
      console.error("Error uploading media:", error);
      res.status(500).json({ error: "Failed to upload media files" });
    }
  });

  // Serve uploaded files
  app.use("/uploads", (req, res, next) => {
    const filePath = path.join(uploadsDir, req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ error: "File not found" });
    }
  });

  // ========== Job Application Endpoints ==========
  
  // Submit job application (public)
  app.post("/api/applications", async (req, res) => {
    try {
      const validatedData = insertJobApplicationSchema.parse(req.body);
      // Verify job exists and is active
      const job = await storage.getJobOpening(validatedData.jobId);
      if (!job || job.isActive !== "true") {
        return res.status(400).json({ error: "Invalid or inactive job posting" });
      }
      const application = await storage.createJobApplication(validatedData);
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Error submitting application:", error);
      res.status(500).json({ error: "Failed to submit application" });
    }
  });

  // Get all applications (admin only)
  app.get("/api/applications", isAdmin, async (req, res) => {
    try {
      const jobId = req.query.jobId as string | undefined;
      const applications = await storage.getJobApplications(jobId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  // Get single application (admin only)
  app.get("/api/applications/:id", isAdmin, async (req, res) => {
    try {
      const application = await storage.getJobApplication(req.params.id);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.json(application);
    } catch (error) {
      console.error("Error fetching application:", error);
      res.status(500).json({ error: "Failed to fetch application" });
    }
  });

  // Update application status (admin only)
  app.patch("/api/applications/:id/status", isAdmin, async (req, res) => {
    try {
      const { status, notes } = req.body;
      if (!status || !["new", "reviewed", "interviewing", "offered", "hired", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      const application = await storage.updateJobApplicationStatus(req.params.id, status, notes);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.json(application);
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(500).json({ error: "Failed to update application" });
    }
  });

  // ==================== INVOICE ROUTES ====================

  // Get all invoices (admin only)
  app.get("/api/invoices", isAdmin, async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  // Get next invoice number (admin only)
  app.get("/api/invoices/next-number", isAdmin, async (req, res) => {
    try {
      const nextNumber = await storage.getNextInvoiceNumber();
      res.json({ invoiceNumber: nextNumber });
    } catch (error) {
      console.error("Error getting next invoice number:", error);
      res.status(500).json({ error: "Failed to get next invoice number" });
    }
  });

  // Get single invoice (admin only)
  app.get("/api/invoices/:id", isAdmin, async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ error: "Failed to fetch invoice" });
    }
  });

  // Create invoice (admin only)
  app.post("/api/invoices", isAdmin, async (req, res) => {
    try {
      const validatedData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(validatedData);
      res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Error creating invoice:", error);
      res.status(500).json({ error: "Failed to create invoice" });
    }
  });

  // Update invoice (admin only)
  app.patch("/api/invoices/:id", isAdmin, async (req, res) => {
    try {
      // Validate the update data with partial schema
      const updateSchema = insertInvoiceSchema.partial();
      const validatedData = updateSchema.parse(req.body);
      
      const invoice = await storage.updateInvoice(req.params.id, validatedData);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Error updating invoice:", error);
      res.status(500).json({ error: "Failed to update invoice" });
    }
  });

  // Delete invoice (admin only)
  app.delete("/api/invoices/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteInvoice(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting invoice:", error);
      res.status(500).json({ error: "Failed to delete invoice" });
    }
  });

  return httpServer;
}
