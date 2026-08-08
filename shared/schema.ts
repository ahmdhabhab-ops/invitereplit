import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Export auth models
export * from "./models/auth";

// Order submissions for digital invitations
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  packageType: text("package_type").notNull(), // essential, premium, royal
  eventType: text("event_type").notNull(), // wedding, event, birthday
  
  // Step 1: Event Details
  names: text("names").notNull(),
  eventDate: text("event_date").notNull(),
  locations: jsonb("locations").$type<{ name: string; address: string; mapLink?: string }[]>().notNull(),
  
  // Step 2: Media (stored as JSON array of file paths/URLs)
  mediaUrls: jsonb("media_urls").$type<string[]>().default([]),
  
  // Step 3: Customizations
  songChoice: text("song_choice"),
  rsvpPreference: text("rsvp_preference"), // yes, no, maybe
  additionalNotes: text("additional_notes"),
  addOnQrCode: boolean("add_on_qr_code").default(false),
  addOnLanguage: boolean("add_on_language").default(false),

  // Step 4: Contact & Payment
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone").notNull(),
  paymentMethod: text("payment_method").notNull(), // stripe, whatsapp
  paymentStatus: text("payment_status").default("pending"), // pending, completed, failed
  referralCode: text("referral_code"), // optional: affiliate referral code
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Partnership requests for event planners
export const partnershipRequests = pgTable("partnership_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  website: text("website"),
  eventsPerYear: text("events_per_year").notNull(), // 1-10, 11-50, 51-100, 100+
  eventTypes: jsonb("event_types").$type<string[]>().notNull(), // weddings, corporate, birthdays, etc.
  message: text("message"),
  status: text("status").default("pending"), // pending, contacted, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPartnershipRequestSchema = createInsertSchema(partnershipRequests).omit({
  id: true,
  status: true,
  createdAt: true,
});

export type InsertPartnershipRequest = z.infer<typeof insertPartnershipRequestSchema>;
export type PartnershipRequest = typeof partnershipRequests.$inferSelect;

// Site settings for admin panel
export const siteSettings = pgTable("site_settings", {
  id: varchar("id").primaryKey().default("main"),
  
  // Contact Info
  phoneNumber: text("phone_number").default("+961 81 82 47 82"),
  email: text("email").default("info@einvite.me"),
  whatsappNumber: text("whatsapp_number").default("+96181824782"),
  
  // Social Media Links
  facebookUrl: text("facebook_url").default("https://facebook.com/einviteme"),
  instagramUrl: text("instagram_url").default("https://instagram.com/einviteme"),
  twitterUrl: text("twitter_url").default("https://twitter.com/einviteme"),
  linkedinUrl: text("linkedin_url"),
  tiktokUrl: text("tiktok_url"),
  
  // Pricing
  essentialPrice: integer("essential_price").default(49),
  essentialFeatures: jsonb("essential_features").$type<string[]>().default([
    "Single-page invitation design",
    "Mobile responsive",
    "Custom date & location",
    "Shareable link",
    "3 design revisions",
  ]),
  
  premiumPrice: integer("premium_price").default(99),
  premiumFeatures: jsonb("premium_features").$type<string[]>().default([
    "Multi-page interactive design",
    "Photo gallery integration",
    "Background music",
    "RSVP tracking",
    "5 design revisions",
    "Custom animations",
  ]),
  
  royalPrice: integer("royal_price").default(199),
  royalFeatures: jsonb("royal_features").$type<string[]>().default([
    "Everything in Premium",
    "Video backgrounds",
    "Guest messaging",
    "Live countdown timer",
    "Unlimited revisions",
    "Priority support",
    "Custom domain option",
  ]),
  
  // Hero Section
  heroTitle: text("hero_title").default("Transform Your Celebrations"),
  heroSubtitle: text("hero_subtitle").default("Beautiful, interactive digital invitations for your weddings, events, and celebrations. Share your special moments with elegance and style."),
  heroBadge: text("hero_badge").default("#1 Digital Invitations in Lebanon"),
  
  // Stats
  happyCouplesCount: text("happy_couples_count").default("500+"),
  eventsCreatedCount: text("events_created_count").default("1000+"),
  customerRating: text("customer_rating").default("4.9"),
  
  // Non-refundable notice text (shown in pricing section and order form)
  nonRefundableNotice: text("non_refundable_notice").default("All fees are non-refundable. By selecting a package, you acknowledge that no refunds will be issued once your order is placed."),
  
  // Admin emails (users who can access admin panel)
  adminEmails: jsonb("admin_emails").$type<string[]>().default([]),
  
  // Event Planners Page Content
  eventPlannersHeroTitle: text("event_planners_hero_title").default("Partner With Einvite"),
  eventPlannersHeroSubtitle: text("event_planners_hero_subtitle").default("Join our exclusive partner program and offer your clients stunning digital invitations at special rates. Grow your business while providing premium service."),
  eventPlannersBadge: text("event_planners_badge").default("For Event Professionals"),
  eventPlannersHeroFeatures: jsonb("event_planners_hero_features").$type<string[]>().default([
    "Up to 40% Discount",
    "Priority Support",
    "White Label Options",
  ]),
  
  // Partner Benefits
  eventPlannersBenefits: jsonb("event_planners_benefits").$type<{ title: string; description: string }[]>().default([
    { title: "Exclusive Discounts", description: "Up to 40% off on all invitation packages for your clients" },
    { title: "Priority Support", description: "Dedicated account manager and 24/7 priority customer support" },
    { title: "Fast Turnaround", description: "Rush delivery options with guaranteed 24-48 hour turnaround" },
    { title: "White Label Options", description: "Co-branded invitations with your company logo and branding" },
    { title: "Premium Features", description: "Access to exclusive templates and design elements" },
    { title: "Partner Recognition", description: "Featured in our partner directory and referral program" },
  ]),
  
  // Partner Tiers
  eventPlannersSilverName: text("event_planners_silver_name").default("Silver Partner"),
  eventPlannersSilverEvents: text("event_planners_silver_events").default("1-10 events/year"),
  eventPlannersSilverDiscount: text("event_planners_silver_discount").default("15%"),
  eventPlannersSilverFeatures: jsonb("event_planners_silver_features").$type<string[]>().default([
    "10% discount on all packages",
    "Standard support",
    "Partner badge",
  ]),
  
  eventPlannersGoldName: text("event_planners_gold_name").default("Gold Partner"),
  eventPlannersGoldEvents: text("event_planners_gold_events").default("11-50 events/year"),
  eventPlannersGoldDiscount: text("event_planners_gold_discount").default("25%"),
  eventPlannersGoldFeatures: jsonb("event_planners_gold_features").$type<string[]>().default([
    "25% discount on all packages",
    "Priority support",
    "White label option",
    "Custom templates",
  ]),
  
  eventPlannersPlatinumName: text("event_planners_platinum_name").default("Platinum Partner"),
  eventPlannersPlatinumEvents: text("event_planners_platinum_events").default("50+ events/year"),
  eventPlannersPlatinumDiscount: text("event_planners_platinum_discount").default("40%"),
  eventPlannersPlatinumFeatures: jsonb("event_planners_platinum_features").$type<string[]>().default([
    "40% discount on all packages",
    "Dedicated account manager",
    "Free rush delivery",
    "Co-marketing opportunities",
    "API access",
  ]),
  
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({
  id: true,
  updatedAt: true,
});

export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type SiteSettings = typeof siteSettings.$inferSelect;

// Location schema for multiple venues
export const locationSchema = z.object({
  name: z.string().min(1, "Please enter a location name"),
  address: z.string().min(2, "Please enter the address"),
  mapLink: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

export type Location = z.infer<typeof locationSchema>;

// Form validation schemas for multi-step form
export const eventDetailsSchema = z.object({
  names: z.string().min(2, "Please enter the names"),
  eventDate: z.string().min(1, "Please select a date"),
  locations: z.array(locationSchema).min(1, "Please add at least one location"),
});

export const customizationsSchema = z.object({
  songChoice: z.string().optional(),
  rsvpPreference: z.enum(["yes", "no", "maybe"]).optional(),
  additionalNotes: z.string().optional(),
});

export const contactPaymentSchema = z.object({
  contactName: z.string().min(2, "Please enter your name"),
  contactEmail: z.string().email("Please enter a valid email"),
  contactPhone: z.string().min(8, "Please enter a valid phone number"),
  paymentMethod: z.enum(["stripe", "whatsapp"]),
});

export type EventDetails = z.infer<typeof eventDetailsSchema>;
export type Customizations = z.infer<typeof customizationsSchema>;
export type ContactPayment = z.infer<typeof contactPaymentSchema>;

// Job openings for careers page
export const jobOpenings = pgTable("job_openings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  department: text("department").notNull(), // design, development, marketing, operations
  location: text("location").notNull(), // Beirut, Remote, Hybrid
  type: text("type").notNull(), // full-time, part-time, contract, internship
  description: text("description").notNull(),
  requirements: jsonb("requirements").$type<string[]>().notNull(),
  responsibilities: jsonb("responsibilities").$type<string[]>().notNull(),
  benefits: jsonb("benefits").$type<string[]>(),
  salaryRange: text("salary_range"), // e.g., "$40k-$60k"
  isActive: text("is_active").default("true"), // true or false as string
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertJobOpeningSchema = createInsertSchema(jobOpenings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertJobOpening = z.infer<typeof insertJobOpeningSchema>;
export type JobOpening = typeof jobOpenings.$inferSelect;

// Job applications from candidates
export const jobApplications = pgTable("job_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  resumeUrl: text("resume_url"), // URL to uploaded resume
  portfolioUrl: text("portfolio_url"),
  linkedinUrl: text("linkedin_url"),
  coverLetter: text("cover_letter"),
  yearsOfExperience: text("years_of_experience"),
  status: text("status").default("new"), // new, reviewed, interviewing, offered, hired, rejected
  notes: text("notes"), // Admin notes
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({
  id: true,
  status: true,
  notes: true,
  createdAt: true,
});

export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type JobApplication = typeof jobApplications.$inferSelect;

// Invoice line items type
export type InvoiceItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

// Invoices for billing
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: text("invoice_number").notNull(), // e.g., INV-2024-001
  orderId: varchar("order_id"), // Optional link to order
  
  // Client info
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  clientPhone: text("client_phone"),
  clientAddress: text("client_address"),
  
  // Invoice details
  issueDate: text("issue_date").notNull(), // YYYY-MM-DD format
  dueDate: text("due_date"), // YYYY-MM-DD format
  
  // Line items (array of items with description, quantity, price)
  items: jsonb("items").$type<InvoiceItem[]>().notNull(),
  
  // Pricing
  subtotal: integer("subtotal").notNull(), // In cents
  discountType: text("discount_type").default("percentage"), // percentage or fixed
  discountValue: integer("discount_value").default(0), // Percentage (0-100) or fixed amount in cents
  discountAmount: integer("discount_amount").default(0), // Calculated discount in cents
  taxRate: integer("tax_rate").default(0), // Tax percentage (0-100)
  taxAmount: integer("tax_amount").default(0), // Calculated tax in cents
  total: integer("total").notNull(), // Final total in cents
  
  // Status
  status: text("status").default("draft"), // draft, sent, paid, cancelled
  notes: text("notes"), // Additional notes on invoice
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

// Proposals for clients
export const proposals = pgTable("proposals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  proposalNumber: text("proposal_number").notNull(), // e.g., PRO-2024-001

  // Client info
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  clientPhone: text("client_phone"),

  // Proposal metadata
  proposalDate: text("proposal_date").notNull(), // YYYY-MM-DD
  validUntil: text("valid_until"), // YYYY-MM-DD

  // Event context
  eventType: text("event_type"), // Wedding, Birthday, Corporate, etc.
  packageRecommendation: text("package_recommendation"), // Essential, Premium, Royal, Custom

  // Custom intro message
  introMessage: text("intro_message"),

  // Line items (services/packages)
  items: jsonb("items").$type<InvoiceItem[]>().notNull(),

  // Pricing (in cents)
  subtotal: integer("subtotal").notNull(),
  discountType: text("discount_type").default("percentage"),
  discountValue: integer("discount_value").default(0),
  discountAmount: integer("discount_amount").default(0),
  taxRate: integer("tax_rate").default(0),
  taxAmount: integer("tax_amount").default(0),
  total: integer("total").notNull(),

  // Terms and notes
  terms: text("terms"),
  notes: text("notes"),

  // Status: draft, sent, accepted, rejected
  status: text("status").default("draft"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProposalSchema = createInsertSchema(proposals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProposal = z.infer<typeof insertProposalSchema>;
export type Proposal = typeof proposals.$inferSelect;

// ── Live Gallery ─────────────────────────────────────────────────────────────

export const gallerySessions = pgTable("gallery_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull(),
  eventName: text("event_name").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const galleryPhotos = pgTable("gallery_photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  uploaderName: text("uploader_name"),
  fileUrl: text("file_url").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const insertGallerySessionSchema = createInsertSchema(gallerySessions).omit({
  id: true,
  createdAt: true,
});
export const insertGalleryPhotoSchema = createInsertSchema(galleryPhotos).omit({
  id: true,
  uploadedAt: true,
});

export type InsertGallerySession = z.infer<typeof insertGallerySessionSchema>;
export type GallerySession = typeof gallerySessions.$inferSelect;
export type InsertGalleryPhoto = z.infer<typeof insertGalleryPhotoSchema>;
export type GalleryPhoto = typeof galleryPhotos.$inferSelect;

// Spin the Wheel - Prize configuration
export const spinPrizes = pgTable("spin_prizes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  emoji: text("emoji").notNull().default("🎁"),
  probability: integer("probability").notNull().default(14),
  color: text("color").notNull().default("#9333ea"),
  isEnabled: text("is_enabled").notNull().default("true"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSpinPrizeSchema = createInsertSchema(spinPrizes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSpinPrize = z.infer<typeof insertSpinPrizeSchema>;
export type SpinPrize = typeof spinPrizes.$inferSelect;

// Spin the Wheel - User entries (one per IP)
export const spinEntries = pgTable("spin_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().default(""),
  phone: text("phone").notNull().default(""),
  weddingDate: text("wedding_date").notNull(),
  prizeName: text("prize_name").notNull(),
  prizeEmoji: text("prize_emoji").notNull().default("🎁"),
  discountCode: text("discount_code").notNull().unique(),
  ipAddress: text("ip_address").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSpinEntrySchema = createInsertSchema(spinEntries).omit({
  id: true,
  createdAt: true,
});
export type InsertSpinEntry = z.infer<typeof insertSpinEntrySchema>;
export type SpinEntry = typeof spinEntries.$inferSelect;

// Admin users with role-based access
export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("sales"), // admin, sales
  isActive: text("is_active").default("true"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  passwordHash: true,
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
export type AdminUserSafe = Omit<AdminUser, "passwordHash">;

// Pricing tiers (static defaults, can be overridden by site settings)
export const pricingTiers = [
  {
    id: "essential",
    name: "Essential",
    price: 49,
    description: "Perfect for simple, elegant invitations",
    features: [
      "Single-page invitation design",
      "Mobile responsive",
      "Custom date & location",
      "Shareable link",
      "3 design revisions",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 99,
    description: "Most popular for memorable events",
    features: [
      "Multi-page interactive design",
      "Photo gallery integration",
      "Background music",
      "RSVP tracking",
      "5 design revisions",
      "Custom animations",
    ],
    popular: true,
  },
  {
    id: "royal",
    name: "Royal",
    price: 199,
    description: "The ultimate celebration experience",
    features: [
      "Everything in Premium",
      "Video backgrounds",
      "Guest messaging",
      "Live countdown timer",
      "Unlimited revisions",
      "Priority support",
      "Custom domain option",
    ],
  },
] as const;

// Sample invitations for the gallery
export const sampleInvitations = {
  weddings: [
    { id: "emma-and-lucas", name: "Emma & Lucas", url: "https://app.einvite.me/emma-and-lucas" },
    { id: "georges-rita", name: "Georges & Rita", url: "https://app.einvite.me/georges-rita" },
    { id: "yyouhanna-vanessa", name: "Youhanna & Vanessa", url: "https://app.einvite.me/yyouhanna-vanessa" },
    { id: "john-jane", name: "John & Jane", url: "https://app.einvite.me/john-jane" },
    { id: "ahmad-rim", name: "Ahmad & Rim", url: "https://app.einvite.me/ahmad-rim" },
  ],
  events: [
    { id: "dj-camp", name: "DJ Camp 2024", url: "https://app.einvite.me/dj-camp" },
  ],
  birthdays: [
    { id: "itta", name: "Itta's Birthday", url: "https://app.einvite.me/itta" },
  ],
  baptisms: [
    { id: "roy", name: "Roy's Baptism", url: "https://app.einvite.me/roy" },
  ],
} as const;

// ─── Referral / Affiliate Program ────────────────────────────────────────────

export const referralUsers = pgTable("referral_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  referralCode: text("referral_code").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReferralUserSchema = createInsertSchema(referralUsers).omit({
  id: true,
  createdAt: true,
  isActive: true,
});
export type InsertReferralUser = z.infer<typeof insertReferralUserSchema>;
export type ReferralUser = typeof referralUsers.$inferSelect;

export const referralCommissions = pgTable("referral_commissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referralUserId: varchar("referral_user_id").notNull(),
  orderId: varchar("order_id").notNull(),
  clientName: text("client_name").notNull().default(""),
  orderAmount: integer("order_amount").notNull(), // in cents or whole USD
  commissionRate: integer("commission_rate").notNull().default(30), // percent
  commissionAmount: integer("commission_amount").notNull(), // order_amount * rate / 100
  status: text("status").notNull().default("pending"), // pending | approved | paid
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReferralCommissionSchema = createInsertSchema(referralCommissions).omit({
  id: true,
  createdAt: true,
});
export type InsertReferralCommission = z.infer<typeof insertReferralCommissionSchema>;
export type ReferralCommission = typeof referralCommissions.$inferSelect;
