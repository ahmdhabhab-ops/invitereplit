# einvite.me - Premium Digital Invitations Landing Page

## Overview
A high-conversion landing page for "einvite.me" - a professional digital invitation service. The site features an elegant design with the official Einvite purple/violet brand colors.

## Key Features
- **Hero Section**: Animated hero with floating Lottie decorative elements and CTAs
- **Sample Gallery**: Interactive mobile phone frame showcase with tabs for Weddings, Events, and Birthdays
- **How It Works**: 4-step process visualization (Pick Plan → Fill Form → Design Review → Go Live)
- **Featured Events**: Showcase of event participation (Youth Leadership Forum 2024, Web Summit Qatar 2025)
- **Pricing Section**: Three tiers (Essential $49, Premium $99, Royal $199)
- **Multi-Step Order Form**: 4-step form for order submissions with WhatsApp payment integration
- **Event Planners Page**: Partnership program for event professionals with tiered discounts (15%, 25%, 40%)
- **Careers Page**: Job listings with application form for candidates to apply
- **Admin Dashboard**: Full content management for site settings, pricing, jobs, candidates, partnerships, and orders
- **EN/FR Bilingual Support**: Full English/French i18n with auto-detection from browser locale; EN/FR toggle in Header stores preference in localStorage

## Tech Stack
- **Frontend**: React with TypeScript, Wouter for routing, TanStack Query for data fetching
- **Styling**: Tailwind CSS with custom design tokens, Framer Motion for animations
- **Animations**: Lottie-react for interactive vector animations
- **Backend**: Express.js API with PostgreSQL database using Drizzle ORM
- **Authentication**: Multi-user admin system with role-based access (Admin/Sales)
- **UI Components**: Shadcn/ui component library

## Project Structure
```
client/
├── src/
│   ├── components/      # React components
│   │   ├── Header.tsx          # Sticky navigation header
│   │   ├── HeroSection.tsx     # Main hero section
│   │   ├── PhoneGallery.tsx    # Interactive mobile frame gallery
│   │   ├── HowItWorks.tsx      # 4-step process section
│   │   ├── PricingSection.tsx  # Pricing tiers
│   │   ├── OrderForm.tsx       # Multi-step order form modal
│   │   └── Footer.tsx          # Site footer with dynamic settings
│   ├── pages/
│   │   ├── LandingPage.tsx     # Main landing page
│   │   └── AdminDashboard.tsx  # Admin content management
│   ├── hooks/
│   │   └── use-auth.ts         # Authentication hook for Replit Auth
│   ├── lib/
│   │   └── auth-utils.ts       # Auth utility functions
│   └── index.css               # Design tokens and theme
server/
├── db.ts                       # Database connection
├── storage.ts                  # Storage interface with order/settings operations
├── routes.ts                   # API endpoints with auth middleware
├── replit_integrations/auth/   # Replit Auth integration files
shared/
├── schema.ts                   # Data models, Zod schemas, pricing/sample data
└── models/auth.ts              # Auth-related Drizzle models (users, sessions)
```

## API Endpoints

### Public Endpoints
- `GET /api/settings` - Get site settings (for frontend)
- `POST /api/orders` - Create new order (form submission)
- `GET /api/orders/:id` - Get single order
- `GET /api/jobs` - Get active job openings
- `GET /api/jobs/:id` - Get single job opening
- `POST /api/applications` - Submit job application
- `POST /api/partnership-requests` - Submit partnership request

### Protected Endpoints (require Admin Login)
- `GET /api/orders` - List all orders (admin)
- `PATCH /api/orders/:id/payment` - Update payment status
- `PATCH /api/settings` - Update site settings (admin only)
- `GET /api/jobs` - Get all job openings including inactive (admin)
- `POST /api/jobs` - Create new job opening
- `PATCH /api/jobs/:id` - Update job opening
- `DELETE /api/jobs/:id` - Delete job opening
- `GET /api/applications` - Get all job applications
- `PATCH /api/applications/:id/status` - Update application status
- `GET /api/partnership-requests` - Get all partnership requests
- `PATCH /api/partnership-requests/:id/status` - Update partnership status

### Auth Endpoints
- `POST /api/admin/login` - Admin login with email/password
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/session` - Check admin session status

## Database Schema

### Tables
- **sessions**: sid, sess, expire (session storage for admin authentication)
- **orders**: id, packageType, eventType, names, eventDate, locations (JSONB), mediaUrls, songChoice, rsvpPreference, additionalNotes, contactName, contactEmail, contactPhone, paymentMethod, paymentStatus, createdAt
- **site_settings**: id, phoneNumber, email, whatsappNumber, facebookUrl, instagramUrl, twitterUrl, linkedinUrl, tiktokUrl, essentialPrice, essentialFeatures, premiumPrice, premiumFeatures, royalPrice, royalFeatures, heroTitle, heroSubtitle, heroBadge, happyCouplesCount, eventsCreatedCount, customerRating, adminEmails, updatedAt
- **partnership_requests**: id, companyName, contactName, email, phone, website, eventsPerYear, eventTypes (JSONB), message, status, createdAt
- **job_openings**: id, title, department, location, type, description, requirements (JSONB), responsibilities (JSONB), benefits (JSONB), salaryRange, isActive, createdAt, updatedAt
- **job_applications**: id, jobId, fullName, email, phone, resumeUrl, portfolioUrl, linkedinUrl, coverLetter, yearsOfExperience, status, notes, createdAt
- **proposals**: id, proposalNumber, clientName, clientEmail, clientPhone, proposalDate, validUntil, eventType, packageRecommendation, introMessage, items (JSONB), subtotal, discountType, discountValue, discountAmount, taxRate, taxAmount, total, terms, notes, status (draft/sent/accepted/rejected), createdAt, updatedAt
- **admin_users**: id, name, email, passwordHash, role (admin/sales), isActive, createdAt, updatedAt

## Admin Dashboard Features
The admin panel at `/admin` allows managing:
- **General Settings**: Hero section content, statistics (Admin only)
- **Pricing**: Package prices and features for Essential, Premium, Royal tiers (Admin only)
- **Contact Info**: Phone, email, WhatsApp number (Admin only)
- **Social Media**: Facebook, Instagram, X, LinkedIn, TikTok links (Admin only)
- **Orders**: View and manage customer orders with WhatsApp integration (Admin + Sales)
- **Invoices**: Create and manage invoices for clients (Admin + Sales)
- **Proposals**: Create and send professional proposals with PDF export to potential clients (Admin + Sales)
- **Team Members**: User management with role assignment (Admin only)

## Authentication & Roles
- Multi-user admin system stored in `admin_users` database table
- Two roles: **Admin** (full access) and **Sales** (orders + invoices only)
- Initial admin user auto-seeded from ADMIN_EMAIL/ADMIN_PASSWORD env vars on first startup
- Passwords hashed with bcrypt
- Session-based authentication with PostgreSQL session storage
- Sales users cannot access settings, jobs, candidates, partnerships, or user management
- Access admin at `/admin` route (visible link in footer)

## Design Tokens
- **Primary**: Einvite Purple/Violet (HSL 266° 86% 55%)
- **Secondary**: Soft purple (HSL 280° 30% 92%)
- **Fonts**: Montserrat (sans), Cormorant Garabald (serif)
- **Logo**: Official Einvite logo (attached_assets/Logo_1769975575984.png)

## Running the Application
The application runs on port 5000 with `npm run dev`. Database migrations can be pushed with `npm run db:push`.

## Sample Invitations
- **Weddings**: emma-and-lucas (first), georges-rita, yyouhanna-vanessa, john-jane, ahmad-rim
- **Events**: dj-camp
- **Birthdays**: itta
- **Baptisms**: roy
