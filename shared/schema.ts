import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Order submissions for digital invitations
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  packageType: text("package_type").notNull(), // essential, premium, royal
  eventType: text("event_type").notNull(), // wedding, event, birthday
  
  // Step 1: Event Details
  names: text("names").notNull(),
  eventDate: text("event_date").notNull(),
  eventLocation: text("event_location").notNull(),
  mapLink: text("map_link"),
  
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

// Form validation schemas for multi-step form
export const eventDetailsSchema = z.object({
  names: z.string().min(2, "Please enter the names"),
  eventDate: z.string().min(1, "Please select a date"),
  eventLocation: z.string().min(2, "Please enter the location"),
  mapLink: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
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

// Pricing tiers
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