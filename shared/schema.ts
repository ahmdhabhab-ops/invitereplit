import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
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
  
  // Step 4: Contact & Payment
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone").notNull(),
  paymentMethod: text("payment_method").notNull(), // stripe, whatsapp
  paymentStatus: text("payment_status").default("pending"), // pending, completed, failed
  
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
  
  // Admin emails (users who can access admin panel)
  adminEmails: jsonb("admin_emails").$type<string[]>().default([]),
  
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
} as const;
