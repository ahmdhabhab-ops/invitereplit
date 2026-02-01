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
- **Admin Dashboard**: Full content management for all site settings, pricing, contact info, and orders

## Tech Stack
- **Frontend**: React with TypeScript, Wouter for routing, TanStack Query for data fetching
- **Styling**: Tailwind CSS with custom design tokens, Framer Motion for animations
- **Animations**: Lottie-react for interactive vector animations
- **Backend**: Express.js API with PostgreSQL database using Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect) for admin access
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

### Protected Endpoints (require Replit Auth)
- `GET /api/orders` - List all orders (admin)
- `PATCH /api/orders/:id/payment` - Update payment status
- `PATCH /api/settings` - Update site settings (admin only)
- `GET /api/admin/check` - Check if user is admin
- `GET /api/auth/user` - Get current authenticated user

### Auth Endpoints
- `/api/login` - Begin login flow
- `/api/logout` - Begin logout flow
- `/api/callback` - OAuth callback

## Database Schema

### Tables
- **users**: id, email, firstName, lastName, profileImageUrl, createdAt, updatedAt (Replit Auth)
- **sessions**: sid, sess, expire (session storage)
- **orders**: id, packageType, eventType, names, eventDate, locations (JSONB), mediaUrls, songChoice, rsvpPreference, additionalNotes, contactName, contactEmail, contactPhone, paymentMethod, paymentStatus, createdAt
- **site_settings**: id, phoneNumber, email, whatsappNumber, facebookUrl, instagramUrl, twitterUrl, linkedinUrl, tiktokUrl, essentialPrice, essentialFeatures, premiumPrice, premiumFeatures, royalPrice, royalFeatures, heroTitle, heroSubtitle, heroBadge, happyCouplesCount, eventsCreatedCount, customerRating, adminEmails, updatedAt

## Admin Dashboard Features
The admin panel at `/admin` allows managing:
- **General Settings**: Hero section content, statistics, admin user emails
- **Pricing**: Package prices and features for Essential, Premium, Royal tiers
- **Contact Info**: Phone, email, WhatsApp number
- **Social Media**: Facebook, Instagram, X, LinkedIn, TikTok links
- **Orders**: View and manage customer orders with WhatsApp integration

## Authentication
- Uses username/password login for admin access
- Admin credentials: info@einvite.me (configured in server/routes.ts)
- Session-based authentication with PostgreSQL session storage
- Access admin at `/admin` route (visible link in footer)

## Design Tokens
- **Primary**: Einvite Purple/Violet (HSL 266° 86% 55%)
- **Secondary**: Soft purple (HSL 280° 30% 92%)
- **Fonts**: Montserrat (sans), Cormorant Garabald (serif)
- **Logo**: Official Einvite logo (attached_assets/Logo_1769975575984.png)

## Running the Application
The application runs on port 5000 with `npm run dev`. Database migrations can be pushed with `npm run db:push`.

## Sample Invitations
- **Weddings**: georges-rita, yyouhanna-vanessa, john-jane, ahmad-rim
- **Events**: dj-camp
- **Birthdays**: itta
