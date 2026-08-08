CREATE TABLE "admin_users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'sales' NOT NULL,
	"is_active" text DEFAULT 'true',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "gallery_photos" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"uploader_name" text,
	"file_url" text NOT NULL,
	"uploaded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gallery_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" varchar NOT NULL,
	"event_name" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_number" text NOT NULL,
	"order_id" varchar,
	"client_name" text NOT NULL,
	"client_email" text NOT NULL,
	"client_phone" text,
	"client_address" text,
	"issue_date" text NOT NULL,
	"due_date" text,
	"items" jsonb NOT NULL,
	"subtotal" integer NOT NULL,
	"discount_type" text DEFAULT 'percentage',
	"discount_value" integer DEFAULT 0,
	"discount_amount" integer DEFAULT 0,
	"tax_rate" integer DEFAULT 0,
	"tax_amount" integer DEFAULT 0,
	"total" integer NOT NULL,
	"status" text DEFAULT 'draft',
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "job_applications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" varchar NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"resume_url" text,
	"portfolio_url" text,
	"linkedin_url" text,
	"cover_letter" text,
	"years_of_experience" text,
	"status" text DEFAULT 'new',
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "job_openings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"department" text NOT NULL,
	"location" text NOT NULL,
	"type" text NOT NULL,
	"description" text NOT NULL,
	"requirements" jsonb NOT NULL,
	"responsibilities" jsonb NOT NULL,
	"benefits" jsonb,
	"salary_range" text,
	"is_active" text DEFAULT 'true',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"package_type" text NOT NULL,
	"event_type" text NOT NULL,
	"names" text NOT NULL,
	"event_date" text NOT NULL,
	"locations" jsonb NOT NULL,
	"media_urls" jsonb DEFAULT '[]'::jsonb,
	"song_choice" text,
	"rsvp_preference" text,
	"additional_notes" text,
	"add_on_qr_code" boolean DEFAULT false,
	"add_on_language" boolean DEFAULT false,
	"contact_name" text NOT NULL,
	"contact_email" text NOT NULL,
	"contact_phone" text NOT NULL,
	"payment_method" text NOT NULL,
	"payment_status" text DEFAULT 'pending',
	"referral_code" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "partnership_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_name" text NOT NULL,
	"contact_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"website" text,
	"events_per_year" text NOT NULL,
	"event_types" jsonb NOT NULL,
	"message" text,
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "proposals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposal_number" text NOT NULL,
	"client_name" text NOT NULL,
	"client_email" text NOT NULL,
	"client_phone" text,
	"proposal_date" text NOT NULL,
	"valid_until" text,
	"event_type" text,
	"package_recommendation" text,
	"intro_message" text,
	"items" jsonb NOT NULL,
	"subtotal" integer NOT NULL,
	"discount_type" text DEFAULT 'percentage',
	"discount_value" integer DEFAULT 0,
	"discount_amount" integer DEFAULT 0,
	"tax_rate" integer DEFAULT 0,
	"tax_amount" integer DEFAULT 0,
	"total" integer NOT NULL,
	"terms" text,
	"notes" text,
	"status" text DEFAULT 'draft',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "referral_commissions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referral_user_id" varchar NOT NULL,
	"order_id" varchar NOT NULL,
	"client_name" text DEFAULT '' NOT NULL,
	"order_amount" integer NOT NULL,
	"commission_rate" integer DEFAULT 30 NOT NULL,
	"commission_amount" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "referral_users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"referral_code" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "referral_users_email_unique" UNIQUE("email"),
	CONSTRAINT "referral_users_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" varchar PRIMARY KEY DEFAULT 'main' NOT NULL,
	"phone_number" text DEFAULT '+961 81 82 47 82',
	"email" text DEFAULT 'info@einvite.me',
	"whatsapp_number" text DEFAULT '+96181824782',
	"facebook_url" text DEFAULT 'https://facebook.com/einviteme',
	"instagram_url" text DEFAULT 'https://instagram.com/einviteme',
	"twitter_url" text DEFAULT 'https://twitter.com/einviteme',
	"linkedin_url" text,
	"tiktok_url" text,
	"essential_price" integer DEFAULT 49,
	"essential_features" jsonb DEFAULT '["Single-page invitation design","Mobile responsive","Custom date & location","Shareable link","3 design revisions"]'::jsonb,
	"premium_price" integer DEFAULT 99,
	"premium_features" jsonb DEFAULT '["Multi-page interactive design","Photo gallery integration","Background music","RSVP tracking","5 design revisions","Custom animations"]'::jsonb,
	"royal_price" integer DEFAULT 199,
	"royal_features" jsonb DEFAULT '["Everything in Premium","Video backgrounds","Guest messaging","Live countdown timer","Unlimited revisions","Priority support","Custom domain option"]'::jsonb,
	"hero_title" text DEFAULT 'Transform Your Celebrations',
	"hero_subtitle" text DEFAULT 'Beautiful, interactive digital invitations for your weddings, events, and celebrations. Share your special moments with elegance and style.',
	"hero_badge" text DEFAULT '#1 Digital Invitations in Lebanon',
	"happy_couples_count" text DEFAULT '500+',
	"events_created_count" text DEFAULT '1000+',
	"customer_rating" text DEFAULT '4.9',
	"non_refundable_notice" text DEFAULT 'All fees are non-refundable. By selecting a package, you acknowledge that no refunds will be issued once your order is placed.',
	"admin_emails" jsonb DEFAULT '[]'::jsonb,
	"event_planners_hero_title" text DEFAULT 'Partner With Einvite',
	"event_planners_hero_subtitle" text DEFAULT 'Join our exclusive partner program and offer your clients stunning digital invitations at special rates. Grow your business while providing premium service.',
	"event_planners_badge" text DEFAULT 'For Event Professionals',
	"event_planners_hero_features" jsonb DEFAULT '["Up to 40% Discount","Priority Support","White Label Options"]'::jsonb,
	"event_planners_benefits" jsonb DEFAULT '[{"title":"Exclusive Discounts","description":"Up to 40% off on all invitation packages for your clients"},{"title":"Priority Support","description":"Dedicated account manager and 24/7 priority customer support"},{"title":"Fast Turnaround","description":"Rush delivery options with guaranteed 24-48 hour turnaround"},{"title":"White Label Options","description":"Co-branded invitations with your company logo and branding"},{"title":"Premium Features","description":"Access to exclusive templates and design elements"},{"title":"Partner Recognition","description":"Featured in our partner directory and referral program"}]'::jsonb,
	"event_planners_silver_name" text DEFAULT 'Silver Partner',
	"event_planners_silver_events" text DEFAULT '1-10 events/year',
	"event_planners_silver_discount" text DEFAULT '15%',
	"event_planners_silver_features" jsonb DEFAULT '["10% discount on all packages","Standard support","Partner badge"]'::jsonb,
	"event_planners_gold_name" text DEFAULT 'Gold Partner',
	"event_planners_gold_events" text DEFAULT '11-50 events/year',
	"event_planners_gold_discount" text DEFAULT '25%',
	"event_planners_gold_features" jsonb DEFAULT '["25% discount on all packages","Priority support","White label option","Custom templates"]'::jsonb,
	"event_planners_platinum_name" text DEFAULT 'Platinum Partner',
	"event_planners_platinum_events" text DEFAULT '50+ events/year',
	"event_planners_platinum_discount" text DEFAULT '40%',
	"event_planners_platinum_features" jsonb DEFAULT '["40% discount on all packages","Dedicated account manager","Free rush delivery","Co-marketing opportunities","API access"]'::jsonb,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "spin_entries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"wedding_date" text NOT NULL,
	"prize_name" text NOT NULL,
	"prize_emoji" text DEFAULT '🎁' NOT NULL,
	"discount_code" text NOT NULL,
	"ip_address" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "spin_entries_discount_code_unique" UNIQUE("discount_code")
);
--> statement-breakpoint
CREATE TABLE "spin_prizes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"emoji" text DEFAULT '🎁' NOT NULL,
	"probability" integer DEFAULT 14 NOT NULL,
	"color" text DEFAULT '#9333ea' NOT NULL,
	"is_enabled" text DEFAULT 'true' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");