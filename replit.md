# einvite.me - Premium Digital Invitations Landing Page

## Overview
A high-conversion landing page for "einvite.me" - a professional digital invitation service. The site features an elegant, wedding-premium design with soft whites, gold accents, and sage greens.

## Key Features
- **Hero Section**: Animated hero with floating decorative elements and CTAs
- **Sample Gallery**: Interactive mobile phone frame showcase with tabs for Weddings, Events, and Birthdays
- **How It Works**: 4-step process visualization (Pick Plan → Fill Form → Design Review → Go Live)
- **Pricing Section**: Three tiers (Essential $49, Premium $99, Royal $199)
- **Multi-Step Order Form**: 4-step form for order submissions with WhatsApp payment integration

## Tech Stack
- **Frontend**: React with TypeScript, Wouter for routing, TanStack Query for data fetching
- **Styling**: Tailwind CSS with custom design tokens, Framer Motion for animations
- **Backend**: Express.js API with PostgreSQL database using Drizzle ORM
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
│   │   └── Footer.tsx          # Site footer
│   ├── pages/
│   │   └── LandingPage.tsx     # Main landing page
│   └── index.css               # Design tokens and theme
server/
├── db.ts               # Database connection
├── storage.ts          # Storage interface with order operations
├── routes.ts           # API endpoints
shared/
└── schema.ts           # Data models, Zod schemas, pricing/sample data
```

## API Endpoints
- `GET /api/orders` - List all orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id/payment` - Update payment status

## Database Schema
- **orders**: id, packageType, eventType, names, eventDate, eventLocation, mapLink, mediaUrls, songChoice, rsvpPreference, additionalNotes, contactName, contactEmail, contactPhone, paymentMethod, paymentStatus, createdAt

## Design Tokens
- **Primary**: Gold accent (HSL 42° 75% 50%)
- **Secondary**: Sage green (HSL 145° 30% 88%)
- **Fonts**: Montserrat (sans), Cormorant Garamond (serif)

## Running the Application
The application runs on port 5000 with `npm run dev`. Database migrations can be pushed with `npm run db:push`.

## Sample Invitations
- **Weddings**: georges-rita, yyouhanna-vanessa, john-jane, ahmad-rim
- **Events**: dj-camp
- **Birthdays**: itta