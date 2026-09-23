import express from "express";
import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, insertSiteSettingsSchema, insertPartnershipRequestSchema, insertJobOpeningSchema, insertJobApplicationSchema, insertInvoiceSchema, insertProposalSchema, insertAdminUserSchema, insertSpinPrizeSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";
import session from "express-session";
import connectPg from "connect-pg-simple";
import multer from "multer";
import path from "path";
import fs from "fs";
import QRCode from "qrcode";
import { broadcastNewPhoto } from "./gallery-ws";
import { sendGalleryQrEmail } from "./email";

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

// Extend session type
declare module "express-session" {
  interface SessionData {
    isAdmin?: boolean;
    adminEmail?: string;
    adminRole?: string;
    adminUserId?: string;
    referralUserId?: string;
  }
}

// Referral auth middleware
const isReferralUser: RequestHandler = (req, res, next) => {
  if (req.session?.referralUserId) return next();
  return res.status(401).json({ error: "Not authenticated" });
};

// Generate unique 8-char referral code (letters + digits)
function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const COMMISSION_RATE = 30; // percent

// Middleware: any authenticated admin/sales user
const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.session?.isAdmin) {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized. Please log in." });
};

// Middleware: only admin role
const isAdminRole: RequestHandler = (req, res, next) => {
  if (req.session?.isAdmin && req.session?.adminRole === "admin") {
    return next();
  }
  return res.status(403).json({ error: "Forbidden. Admin access required." });
};

// Keep backward compat - isAdmin means any authenticated user for existing routes
const isAdmin: RequestHandler = isAuthenticated;

async function seedInitialAdmin() {
  const existingUsers = await storage.getAdminUsers();
  if (existingUsers.length === 0) {
    const password = process.env.ADMIN_PASSWORD;
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await storage.createAdminUser({
        name: "Admin",
        email: process.env.ADMIN_EMAIL || "info@einvite.me",
        passwordHash: hash,
        role: "admin",
        isActive: "true",
      });
      console.log("Initial admin user created from environment variables.");
    } else {
      console.warn("Warning: No admin users exist and ADMIN_PASSWORD not set. Admin login will not work.");
    }
  }
}

// Retries seeding with capped exponential backoff so a database that isn't
// reachable yet at boot (e.g. cold start on Autoscale) doesn't crash the server.
async function seedDatabaseWithRetry() {
  let attempt = 0;
  while (true) {
    try {
      await seedInitialAdmin();
      await storage.seedSpinPrizesIfEmpty();
      return;
    } catch (err) {
      attempt++;
      const delay = Math.min(1000 * 2 ** attempt, 30_000);
      console.error(`Database seeding failed (attempt ${attempt}), retrying in ${delay}ms:`, err);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

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

  // Serve attached assets for proposals (logo etc.)
  app.use("/proposal-assets", express.static(path.join(process.cwd(), "attached_assets")));

  // Serve white-label proposal HTML
  app.get("/proposal/whitelabel", (req, res) => {
    const proposalPath = path.join(process.cwd(), "proposals", "einvite-whitelabel-proposal.html");
    res.sendFile(proposalPath);
  });

  // Serve Hasan Mokbel white-label contract
  app.get("/contract/hasan-mokbel", (req, res) => {
    const contractPath = path.join(process.cwd(), "proposals", "hasan-mokbel-contract.html");
    res.sendFile(contractPath);
  });

  // Seed initial admin user + spin prizes in the background so a slow or
  // not-yet-ready database doesn't block the server from listening.
  seedDatabaseWithRetry().catch((err) => {
    console.error("Unexpected error during database seeding:", err);
  });

  // Admin login endpoint
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      
      const user = await storage.getAdminUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      if (user.isActive !== "true") {
        return res.status(401).json({ error: "Account is disabled" });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      
      req.session.isAdmin = true;
      req.session.adminEmail = user.email;
      req.session.adminRole = user.role;
      req.session.adminUserId = user.id;
      
      res.json({ success: true, email: user.email, role: user.role, name: user.name });
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
      res.json({ isAdmin: true, email: req.session.adminEmail, role: req.session.adminRole, userId: req.session.adminUserId });
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

      // Auto-create gallery session if Live Event Gallery add-on was selected
      if (validatedData.addOnLiveGallery) {
        try {
          const gallerySession = await storage.createGallerySession({
            orderId: order.id,
            eventName: validatedData.names || "Event Gallery",
            isActive: true,
          });

          // Send QR code email to organizer (non-fatal)
          if (validatedData.contactEmail) {
            sendGalleryQrEmail({
              to: validatedData.contactEmail,
              eventName: gallerySession.eventName,
              sessionId: gallerySession.id,
            }).catch((emailErr) => {
              console.error("Failed to send gallery QR email:", emailErr);
            });
          }
        } catch (galleryErr) {
          // Non-fatal: log but don't fail the order
          console.error("Failed to create gallery session:", galleryErr);
        }
      }

      // If a referral code was provided, record commission (anti-self-referral: check different email)
      if (validatedData.referralCode) {
        const referrer = await storage.getReferralUserByCode(validatedData.referralCode);
        if (referrer && referrer.isActive && referrer.email !== validatedData.contactEmail) {
          const settings = await storage.getSiteSettings();
          // Use the package price from site settings
          const priceMap: Record<string, number> = {
            essential: settings?.essentialPrice ?? 49,
            premium: settings?.premiumPrice ?? 99,
            royal: settings?.royalPrice ?? 199,
          };
          const orderAmount = priceMap[validatedData.packageType] ?? 99;
          const commissionAmount = Math.round(orderAmount * COMMISSION_RATE / 100);
          await storage.createReferralCommission({
            referralUserId: referrer.id,
            orderId: order.id,
            clientName: validatedData.contactName,
            orderAmount,
            commissionRate: COMMISSION_RATE,
            commissionAmount,
            status: "pending",
          });
        }
      }

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

  // Update site settings (protected - admin role only)
  app.patch("/api/settings", isAdminRole, async (req, res) => {
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

  // Create job opening (admin role only)
  app.post("/api/jobs", isAdminRole, async (req, res) => {
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

  // Update job opening (admin role only)
  app.patch("/api/jobs/:id", isAdminRole, async (req, res) => {
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

  // Delete job opening (admin role only)
  app.delete("/api/jobs/:id", isAdminRole, async (req, res) => {
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

  // ==================== PROPOSAL ROUTES ====================

  // Get all proposals (admin + sales)
  app.get("/api/proposals", isAuthenticated, async (req, res) => {
    try {
      const result = await storage.getProposals();
      res.json(result);
    } catch (error) {
      console.error("Error fetching proposals:", error);
      res.status(500).json({ error: "Failed to fetch proposals" });
    }
  });

  // Get next proposal number (admin + sales)
  app.get("/api/proposals/next-number", isAuthenticated, async (req, res) => {
    try {
      const nextNumber = await storage.getNextProposalNumber();
      res.json({ proposalNumber: nextNumber });
    } catch (error) {
      res.status(500).json({ error: "Failed to get next proposal number" });
    }
  });

  // Get single proposal (admin + sales)
  app.get("/api/proposals/:id", isAuthenticated, async (req, res) => {
    try {
      const proposal = await storage.getProposal(req.params.id);
      if (!proposal) return res.status(404).json({ error: "Proposal not found" });
      res.json(proposal);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch proposal" });
    }
  });

  // Create proposal (admin + sales)
  app.post("/api/proposals", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertProposalSchema.parse(req.body);
      const proposal = await storage.createProposal(validatedData);
      res.status(201).json(proposal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Error creating proposal:", error);
      res.status(500).json({ error: "Failed to create proposal" });
    }
  });

  // Update proposal (admin + sales)
  app.patch("/api/proposals/:id", isAuthenticated, async (req, res) => {
    try {
      const updateSchema = insertProposalSchema.partial();
      const validatedData = updateSchema.parse(req.body);
      const proposal = await storage.updateProposal(req.params.id, validatedData);
      if (!proposal) return res.status(404).json({ error: "Proposal not found" });
      res.json(proposal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update proposal" });
    }
  });

  // Delete proposal (admin + sales)
  app.delete("/api/proposals/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteProposal(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete proposal" });
    }
  });

  // ==================== ADMIN USER MANAGEMENT ====================

  // Get all admin users (admin role only)
  app.get("/api/admin/users", isAdminRole, async (req, res) => {
    try {
      const users = await storage.getAdminUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Create admin user (admin role only)
  app.post("/api/admin/users", isAdminRole, async (req, res) => {
    try {
      const { name, email, password, role, isActive } = insertAdminUserSchema.parse(req.body);

      const existing = await storage.getAdminUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: "A user with this email already exists" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await storage.createAdminUser({ name, email, passwordHash, role, isActive });
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Error creating admin user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // Update admin user (admin role only)
  app.patch("/api/admin/users/:id", isAdminRole, async (req, res) => {
    try {
      const { name, email, role, isActive } = req.body;
      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) {
        const existing = await storage.getAdminUserByEmail(email);
        if (existing && existing.id !== req.params.id) {
          return res.status(400).json({ error: "A user with this email already exists" });
        }
        updateData.email = email;
      }
      if (role && ["admin", "sales"].includes(role)) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = isActive;

      if (req.body.password) {
        updateData.passwordHash = await bcrypt.hash(req.body.password, 10);
      }

      const user = await storage.updateAdminUser(req.params.id, updateData);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error updating admin user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Delete admin user (admin role only)
  app.delete("/api/admin/users/:id", isAdminRole, async (req, res) => {
    try {
      if (req.params.id === req.session.adminUserId) {
        return res.status(400).json({ error: "You cannot delete your own account" });
      }
      await storage.deleteAdminUser(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting admin user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // ─── SPIN THE WHEEL ─────────────────────────────────────────────────────────

  // Helper: extract real IP
  function getClientIp(req: any): string {
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) {
      const ips = (forwarded as string).split(",").map(s => s.trim());
      return ips[0];
    }
    return req.ip || req.connection?.remoteAddress || "unknown";
  }

  // Helper: generate discount code
  function generateDiscountCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "WED-";
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  // Helper: weighted random selection
  function pickWeightedPrize(prizes: any[]): { prize: any; index: number } {
    const enabled = prizes.filter(p => p.isEnabled === "true");
    if (enabled.length === 0) throw new Error("No prizes enabled");
    const total = enabled.reduce((sum, p) => sum + p.probability, 0);
    let rand = Math.random() * total;
    for (let i = 0; i < enabled.length; i++) {
      rand -= enabled[i].probability;
      if (rand <= 0) return { prize: enabled[i], index: prizes.indexOf(enabled[i]) };
    }
    return { prize: enabled[enabled.length - 1], index: prizes.indexOf(enabled[enabled.length - 1]) };
  }

  // GET /api/spin/prizes - public: returns active prizes for wheel display
  app.get("/api/spin/prizes", async (req, res) => {
    try {
      const prizes = await storage.getSpinPrizes(true);
      res.json(prizes);
    } catch (error) {
      console.error("Error fetching spin prizes:", error);
      res.status(500).json({ error: "Failed to fetch prizes" });
    }
  });

  // POST /api/spin - public: submit details, pick prize, store entry
  app.post("/api/spin", async (req, res) => {
    try {
      const { fullName, email, phone, weddingDate } = req.body;
      if (!fullName || !email || !weddingDate) {
        return res.status(400).json({ error: "Full name, email, and wedding date are required" });
      }

      const ip = getClientIp(req);

      // Check if IP already spun
      const existing = await storage.getSpinEntryByIp(ip);
      if (existing) {
        return res.json({
          blocked: true,
          message: "You have already used your spin.",
          discountCode: existing.discountCode,
          prizeName: existing.prizeName,
          prizeEmoji: existing.prizeEmoji,
          expiresAt: existing.expiresAt,
        });
      }

      // Get all prizes (active only) for weighted selection
      const allPrizes = await storage.getSpinPrizes(false);
      const activePrizes = allPrizes.filter(p => p.isEnabled === "true");
      if (activePrizes.length === 0) {
        return res.status(500).json({ error: "No prizes configured" });
      }

      // Pick winner using weighted random
      const { prize, index: prizeIndex } = pickWeightedPrize(allPrizes);

      // Generate unique discount code
      let discountCode = generateDiscountCode();
      // Retry if code already exists (extremely rare)
      let attempts = 0;
      while (attempts < 5) {
        try {
          const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
          const entry = await storage.createSpinEntry({
            fullName,
            email,
            phone: phone || "",
            weddingDate,
            prizeName: prize.name,
            prizeEmoji: prize.emoji,
            discountCode,
            ipAddress: ip,
            expiresAt,
          });
          
          // Return winning info + prizeIndex for wheel animation
          const activePrizesList = allPrizes.filter(p => p.isEnabled === "true");
          const activePrizeIndex = activePrizesList.findIndex(p => p.id === prize.id);
          
          return res.json({
            success: true,
            prizeIndex: activePrizeIndex >= 0 ? activePrizeIndex : 0,
            prizeName: entry.prizeName,
            prizeEmoji: entry.prizeEmoji,
            discountCode: entry.discountCode,
            expiresAt: entry.expiresAt,
          });
        } catch (err: any) {
          if (err.code === "23505") {
            // Duplicate code, try again
            const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
            discountCode = "WED-";
            for (let i = 0; i < 6; i++) discountCode += chars[Math.floor(Math.random() * chars.length)];
            attempts++;
          } else {
            throw err;
          }
        }
      }
      res.status(500).json({ error: "Failed to generate unique code" });
    } catch (error) {
      console.error("Error processing spin:", error);
      res.status(500).json({ error: "Failed to process spin" });
    }
  });

  // GET /api/admin/spin/prizes - admin: get all prizes
  app.get("/api/admin/spin/prizes", isAdminRole, async (req, res) => {
    try {
      const prizes = await storage.getSpinPrizes(false);
      res.json(prizes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch prizes" });
    }
  });

  // PATCH /api/admin/spin/prizes/:id - admin: update a prize
  app.patch("/api/admin/spin/prizes/:id", isAdminRole, async (req, res) => {
    try {
      const schema = insertSpinPrizeSchema.partial();
      const data = schema.parse(req.body);
      const updated = await storage.updateSpinPrize(req.params.id, data);
      if (!updated) return res.status(404).json({ error: "Prize not found" });
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update prize" });
    }
  });

  // POST /api/admin/spin/prizes/reset - admin: reset to defaults
  app.post("/api/admin/spin/prizes/reset", isAdminRole, async (req, res) => {
    try {
      const prizes = await storage.resetSpinPrizesToDefaults();
      res.json(prizes);
    } catch (error) {
      res.status(500).json({ error: "Failed to reset prizes" });
    }
  });

  // GET /api/admin/spin/entries - admin: get all spin entries
  app.get("/api/admin/spin/entries", isAdminRole, async (req, res) => {
    try {
      const entries = await storage.getSpinEntries();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch entries" });
    }
  });

  // ── Referral / Affiliate Program Routes ───────────────────────────────────

  // POST /api/referral/register
  app.post("/api/referral/register", async (req, res) => {
    try {
      const { fullName, email, password } = req.body;
      if (!fullName || !email || !password) {
        return res.status(400).json({ error: "fullName, email and password are required" });
      }
      const existing = await storage.getReferralUserByEmail(email);
      if (existing) {
        return res.status(409).json({ error: "An account with this email already exists" });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      // Generate a unique referral code
      let referralCode = generateReferralCode();
      while (await storage.getReferralUserByCode(referralCode)) {
        referralCode = generateReferralCode();
      }
      const user = await storage.createReferralUser({ fullName, email, passwordHash, referralCode });
      req.session.referralUserId = user.id;
      const { passwordHash: _, ...safe } = user;
      res.status(201).json(safe);
    } catch (error) {
      console.error("Referral register error:", error);
      res.status(500).json({ error: "Failed to register" });
    }
  });

  // POST /api/referral/login
  app.post("/api/referral/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
      const user = await storage.getReferralUserByEmail(email);
      if (!user || !user.isActive) return res.status(401).json({ error: "Invalid credentials" });
      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) return res.status(401).json({ error: "Invalid credentials" });
      req.session.referralUserId = user.id;
      const { passwordHash: _, ...safe } = user;
      res.json(safe);
    } catch (error) {
      console.error("Referral login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  // POST /api/referral/logout
  app.post("/api/referral/logout", (req, res) => {
    req.session.referralUserId = undefined;
    res.json({ ok: true });
  });

  // GET /api/referral/me
  app.get("/api/referral/me", isReferralUser, async (req, res) => {
    try {
      const user = await storage.getReferralUserById(req.session.referralUserId!);
      if (!user) return res.status(404).json({ error: "Not found" });
      const { passwordHash: _, ...safe } = user;
      res.json(safe);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  // GET /api/referral/dashboard
  app.get("/api/referral/dashboard", isReferralUser, async (req, res) => {
    try {
      const userId = req.session.referralUserId!;
      const user = await storage.getReferralUserById(userId);
      if (!user) return res.status(404).json({ error: "Not found" });
      const commissions = await storage.getReferralCommissions(userId);
      const total = commissions.reduce((s, c) => s + c.commissionAmount, 0);
      const pending = commissions.filter(c => c.status === "pending").reduce((s, c) => s + c.commissionAmount, 0);
      const paid = commissions.filter(c => c.status === "paid").reduce((s, c) => s + c.commissionAmount, 0);
      const { passwordHash: _, ...safe } = user;
      res.json({ user: safe, commissions, stats: { total, pending, paid, count: commissions.length } });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard" });
    }
  });

  // GET /api/referral/check/:code - public: verify a referral code exists
  app.get("/api/referral/check/:code", async (req, res) => {
    try {
      const user = await storage.getReferralUserByCode(req.params.code);
      if (!user || !user.isActive) return res.status(404).json({ valid: false });
      res.json({ valid: true, referrerName: user.fullName });
    } catch (error) {
      res.status(500).json({ valid: false });
    }
  });

  // Admin referral routes
  // GET /api/admin/referrals/users
  app.get("/api/admin/referrals/users", isAdminRole, async (req, res) => {
    try {
      const users = await storage.getAllReferralUsers();
      res.json(users.map(({ passwordHash: _, ...u }) => u));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch referral users" });
    }
  });

  // GET /api/admin/referrals/commissions
  app.get("/api/admin/referrals/commissions", isAdminRole, async (req, res) => {
    try {
      const commissions = await storage.getReferralCommissions();
      res.json(commissions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch commissions" });
    }
  });

  // PATCH /api/admin/referrals/commissions/:id/status
  app.patch("/api/admin/referrals/commissions/:id/status", isAdminRole, async (req, res) => {
    try {
      const { status } = req.body;
      if (!["pending", "approved", "paid"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      const updated = await storage.updateReferralCommissionStatus(req.params.id, status);
      if (!updated) return res.status(404).json({ error: "Commission not found" });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update commission status" });
    }
  });

  // ========== Live Gallery Endpoints ==========

  // Gallery photo multer (reuse image filter, field name "photo")
  const galleryPhotoUpload = multer({
    storage: storage_multer,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.heic', '.heif'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedTypes.includes(ext)) cb(null, true);
      else cb(new Error('Only image files are allowed'));
    },
  });

  // GET /api/gallery/:sessionId — public: session info + photos
  app.get("/api/gallery/:sessionId", async (req, res) => {
    try {
      const session = await storage.getGallerySession(req.params.sessionId);
      if (!session) return res.status(404).json({ error: "Gallery session not found" });
      const photos = await storage.getGalleryPhotos(session.id);
      res.json({ session, photos });
    } catch (error) {
      console.error("Error fetching gallery session:", error);
      res.status(500).json({ error: "Failed to fetch gallery" });
    }
  });

  // GET /api/gallery/:sessionId/qr — returns QR PNG for the guest upload URL
  app.get("/api/gallery/:sessionId/qr", async (req, res) => {
    try {
      const session = await storage.getGallerySession(req.params.sessionId);
      if (!session) return res.status(404).json({ error: "Gallery session not found" });

      // Build the guest upload URL from the request host
      const rawHost = req.headers["x-forwarded-host"] || req.headers.host;
      const host = Array.isArray(rawHost) ? rawHost[0] : (rawHost || "einvite.me");
      const rawProto = req.headers["x-forwarded-proto"];
      const proto = Array.isArray(rawProto) ? rawProto[0] : (rawProto || (req.secure ? "https" : "http"));
      const guestUrl = `${proto}://${host}/gallery/${session.id}`;

      const qrPng = await QRCode.toBuffer(guestUrl, { width: 400, margin: 2 });
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.send(qrPng);
    } catch (error) {
      console.error("Error generating QR code:", error);
      res.status(500).json({ error: "Failed to generate QR code" });
    }
  });

  // Per-IP rate limiter for guest gallery uploads (runs BEFORE Multer so rejected requests never touch disk)
  // Configurable via env: GALLERY_RATE_LIMIT (default 10) and GALLERY_RATE_WINDOW_MS (default 10 min)
  const GALLERY_RATE_LIMIT = parseInt(process.env.GALLERY_RATE_LIMIT || "10", 10);
  const GALLERY_RATE_WINDOW_MS = parseInt(process.env.GALLERY_RATE_WINDOW_MS || String(10 * 60 * 1000), 10);
  // Map<ip, { count: number; windowStart: number }>
  const galleryUploadCounts = new Map<string, { count: number; windowStart: number }>();

  const galleryRateLimiter: RequestHandler = (req, res, next) => {
    // Admins are never rate-limited
    if (req.session?.isAdmin) return next();

    // req.ip is resolved by Express using the trusted proxy chain (app.set("trust proxy", 1) above)
    const ip = req.ip || "unknown";
    const now = Date.now();
    const entry = galleryUploadCounts.get(ip);
    if (!entry || now - entry.windowStart >= GALLERY_RATE_WINDOW_MS) {
      // New or expired window — reset
      galleryUploadCounts.set(ip, { count: 1, windowStart: now });
      return next();
    }
    if (entry.count >= GALLERY_RATE_LIMIT) {
      const remainingSec = Math.ceil((GALLERY_RATE_WINDOW_MS - (now - entry.windowStart)) / 1000);
      return res.status(429).json({
        error: `Too many uploads. Please slow down and try again in ${remainingSec} second${remainingSec !== 1 ? "s" : ""}.`,
      });
    }
    entry.count += 1;
    return next();
  };

  // POST /api/gallery/:sessionId/photos — public: guests upload photos
  // Rate limiter runs first (before Multer) so rejected requests never write files to disk
  app.post("/api/gallery/:sessionId/photos", galleryRateLimiter, galleryPhotoUpload.single("photo"), async (req, res) => {
    try {
      const session = await storage.getGallerySession(req.params.sessionId);
      if (!session) return res.status(404).json({ error: "Gallery session not found" });
      if (!session.isActive) return res.status(403).json({ error: "This gallery is no longer accepting photos" });
      if (!req.file) return res.status(400).json({ error: "No photo uploaded" });

      const fileUrl = `/uploads/${req.file.filename}`;
      const uploaderName = (req.body.uploaderName as string) || null;

      const photo = await storage.createGalleryPhoto({
        sessionId: session.id,
        uploaderName,
        fileUrl,
      });

      // Broadcast to all display screens watching this session
      broadcastNewPhoto(session.id, {
        id: photo.id,
        fileUrl: photo.fileUrl,
        uploaderName: photo.uploaderName,
        uploadedAt: photo.uploadedAt,
      });

      res.status(201).json(photo);
    } catch (error) {
      console.error("Error uploading gallery photo:", error);
      res.status(500).json({ error: "Failed to upload photo" });
    }
  });

  // GET /api/admin/gallery — admin: list all sessions
  app.get("/api/admin/gallery", isAdmin, async (req, res) => {
    try {
      const sessions = await storage.getAllGallerySessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch gallery sessions" });
    }
  });

  // GET /api/admin/gallery/order/:orderId — admin: session for a specific order
  app.get("/api/admin/gallery/order/:orderId", isAdmin, async (req, res) => {
    try {
      const session = await storage.getGallerySessionByOrderId(req.params.orderId);
      if (!session) return res.status(404).json({ error: "No gallery session for this order" });
      const photos = await storage.getGalleryPhotos(session.id);
      res.json({ session, photos });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch gallery" });
    }
  });

  // POST /api/admin/gallery/create — admin: manually create a gallery for an existing order
  app.post("/api/admin/gallery/create", isAdmin, async (req, res) => {
    try {
      const { orderId } = req.body;
      if (!orderId) return res.status(400).json({ error: "orderId is required" });

      // Verify the order exists
      const order = await storage.getOrder(orderId);
      if (!order) return res.status(404).json({ error: "Order not found" });

      // Prevent duplicate sessions
      const existing = await storage.getGallerySessionByOrderId(orderId);
      if (existing) return res.status(409).json({ error: "A gallery session already exists for this order" });

      const gallerySession = await storage.createGallerySession({
        orderId,
        eventName: (order as any).names || "Event Gallery",
        isActive: true,
      });

      res.status(201).json(gallerySession);
    } catch (error) {
      console.error("Error creating gallery session:", error);
      res.status(500).json({ error: "Failed to create gallery session" });
    }
  });

  // PATCH /api/admin/gallery/:sessionId/active — admin: toggle active
  app.patch("/api/admin/gallery/:sessionId/active", isAdmin, async (req, res) => {
    try {
      const { isActive } = req.body;
      if (typeof isActive !== "boolean") return res.status(400).json({ error: "isActive must be boolean" });
      const session = await storage.updateGallerySessionActive(req.params.sessionId, isActive);
      if (!session) return res.status(404).json({ error: "Gallery session not found" });
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to update gallery session" });
    }
  });

  // DELETE /api/admin/gallery/photos/:photoId — admin: delete a photo
  app.delete("/api/admin/gallery/photos/:photoId", isAdmin, async (req, res) => {
    try {
      await storage.deleteGalleryPhoto(req.params.photoId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete photo" });
    }
  });

  // ========== Public Gallery Access (self-service QR retrieval) ==========
  //
  // Authorization model: caller must supply both orderId (UUID from their order
  // confirmation) AND the contact email they registered with. Either factor alone
  // is insufficient; together they constitute a two-factor ownership check without
  // requiring a separate database token.
  //
  // All invalid/mismatched cases return the same generic message to prevent
  // information leakage about whether an order ID exists.

  const GALLERY_ACCESS_DENIED = "No Live Gallery found. Please check your order ID and email address and try again.";

  // Helper: resolve base URL (mirrors email.ts logic)
  function getGalleryBaseUrl(): string {
    if (process.env.SITE_BASE_URL) return process.env.SITE_BASE_URL.replace(/\/$/, "");
    if (process.env.REPLIT_DOMAINS) return `https://${process.env.REPLIT_DOMAINS.split(",")[0].trim()}`;
    if (process.env.REPLIT_DEV_DOMAIN) return `https://${process.env.REPLIT_DEV_DOMAIN}`;
    return "https://einvite.me";
  }

  // Shared per-IP rate-limit state for both lookup and resend endpoints.
  // Per-IP: max 10 requests per 15 minutes (covers lookup + resend together).
  // Per-order: 5-minute cooldown between resends of the same order.
  const galleryAccessIpCounts = new Map<string, { count: number; windowStart: number }>();
  const resendOrderLastSent = new Map<string, number>(); // orderId → epoch ms
  const GALLERY_IP_MAX = 10;
  const GALLERY_IP_WINDOW_MS = 15 * 60 * 1000;    // 15-minute window
  const RESEND_ORDER_COOLDOWN_MS = 5 * 60 * 1000; // 5-minute per-order cooldown

  function galleryAccessIpRateLimit(req: express.Request, res: express.Response): boolean {
    const ip = (req.ip ?? req.socket.remoteAddress ?? "unknown").replace(/^::ffff:/, "");
    const now = Date.now();
    const entry = galleryAccessIpCounts.get(ip);
    if (entry && now - entry.windowStart < GALLERY_IP_WINDOW_MS) {
      if (entry.count >= GALLERY_IP_MAX) {
        res.status(429).json({ error: "Too many requests. Please try again later." });
        return true; // rate limited
      }
      entry.count += 1;
    } else {
      galleryAccessIpCounts.set(ip, { count: 1, windowStart: now });
    }
    return false; // not rate limited
  }

  // GET /api/gallery-access?orderId=<id>&email=<email>
  // Public: retrieve gallery info after verifying orderId + contact email.
  app.get("/api/gallery-access", async (req, res) => {
    try {
      if (galleryAccessIpRateLimit(req, res)) return;

      const { orderId, email } = req.query;
      if (!orderId || typeof orderId !== "string") {
        return res.status(400).json({ error: "orderId query parameter is required" });
      }
      if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "email query parameter is required" });
      }

      // Look up order — use identical response for all auth-failure cases
      const order = await storage.getOrder(orderId);
      const contactEmail = (order as any)?.contactEmail as string | undefined;

      // Case-insensitive email comparison; always do the comparison even if order
      // was not found to avoid timing-based order-ID enumeration.
      const emailMatches = !!contactEmail && contactEmail.toLowerCase() === email.trim().toLowerCase();
      if (!order || !emailMatches) {
        return res.status(403).json({ error: GALLERY_ACCESS_DENIED });
      }

      const session = await storage.getGallerySessionByOrderId(orderId);
      if (!session) {
        return res.status(403).json({ error: GALLERY_ACCESS_DENIED });
      }

      const baseUrl = getGalleryBaseUrl();
      const uploadUrl = `${baseUrl}/gallery/${session.id}`;
      const displayUrl = `${baseUrl}/gallery/${session.id}/display`;

      const qrDataUrl = await QRCode.toDataURL(uploadUrl, {
        width: 300,
        margin: 2,
        color: { dark: "#1a1a2e", light: "#ffffff" },
      });

      const smtpAvailable = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

      res.json({
        sessionId: session.id,
        eventName: session.eventName,
        isActive: session.isActive,
        uploadUrl,
        displayUrl,
        qrCodeDataUrl: qrDataUrl,
        smtpAvailable,
        // Redact most of the email — show only first char and domain
        contactEmailHint: (() => {
          const [local, domain] = contactEmail.split("@");
          return `${local[0]}***@${domain}`;
        })(),
      });
    } catch (error) {
      console.error("Error fetching gallery access:", error);
      res.status(500).json({ error: "Failed to retrieve gallery information" });
    }
  });

  // POST /api/gallery-access/resend?orderId=<id>&email=<email>
  // Public: re-send QR email after verifying orderId + contact email.
  // Rate-limited: shared IP cap + per-order 5-minute cooldown.
  app.post("/api/gallery-access/resend", async (req, res) => {
    try {
      if (galleryAccessIpRateLimit(req, res)) return;

      const { orderId, email } = req.query;
      if (!orderId || typeof orderId !== "string") {
        return res.status(400).json({ error: "orderId query parameter is required" });
      }
      if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "email query parameter is required" });
      }

      // Per-order resend cooldown
      const now = Date.now();
      const lastSent = resendOrderLastSent.get(orderId);
      if (lastSent && now - lastSent < RESEND_ORDER_COOLDOWN_MS) {
        const waitSec = Math.ceil((RESEND_ORDER_COOLDOWN_MS - (now - lastSent)) / 1000);
        return res.status(429).json({
          error: `A resend was already requested recently. Please wait ${waitSec} seconds before trying again.`,
        });
      }

      // SMTP must be configured — fail explicitly rather than silently
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return res.status(503).json({ error: "Email delivery is not configured on this server. Please contact support." });
      }

      // Verify orderId + email (same uniform error for all auth-failure cases)
      const order = await storage.getOrder(orderId);
      const contactEmail = (order as any)?.contactEmail as string | undefined;
      const emailMatches = !!contactEmail && contactEmail.toLowerCase() === email.trim().toLowerCase();
      if (!order || !emailMatches) {
        return res.status(403).json({ error: GALLERY_ACCESS_DENIED });
      }

      const session = await storage.getGallerySessionByOrderId(orderId);
      if (!session) {
        return res.status(403).json({ error: GALLERY_ACCESS_DENIED });
      }

      resendOrderLastSent.set(orderId, now);
      await sendGalleryQrEmail({
        to: contactEmail,
        eventName: session.eventName,
        sessionId: session.id,
      });

      res.json({ success: true, message: "Gallery QR code email re-sent successfully." });
    } catch (error) {
      console.error("Error resending gallery QR email:", error);
      res.status(500).json({ error: "Failed to re-send gallery email. Please try again." });
    }
  });

  return httpServer;
}
