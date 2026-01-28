# MzansiMove - Route Tracking Application

## Overview

MzansiMove is a South African bus route tracking and notification application. The platform allows commuters to browse bus routes, subscribe to routes for real-time alerts, and receive notifications about delays, cancellations, and service changes. The app supports role-based access for bus drivers and administrators.

The application follows a Material Design-inspired approach with Google Maps styling for navigation contexts, focusing on utility, clarity, and efficient route management workflows.

**Key Design Decision**: No personal data storage or Replit Auth required for basic functionality to avoid privacy policy requirements and not scare African users. Only optional login for subscriptions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state, with custom hooks for data fetching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens (CSS variables for theming)
- **Animations**: Framer Motion for smooth transitions
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints with typed route contracts defined in `shared/routes.ts`
- **Validation**: Zod schemas for request/response validation
- **Authentication**: Replit Auth integration using OpenID Connect with Passport.js

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Migrations**: Drizzle Kit for database schema management (`drizzle-kit push`)
- **Session Storage**: PostgreSQL-backed sessions using `connect-pg-simple`

### Core Data Models
- **Bus Routes**: Route information including name, description, start/end locations, operating company
- **Notifications**: Alerts tied to routes with types (delay, cancellation, info, emergency)
- **Subscriptions**: User-route relationships for personalized alert delivery
- **Reviews**: User reviews with ratings for bus routes
- **Jobs**: Transport job postings (title, description, location, salary, requirements, company, contactInfo)
- **Advertisements**: Sponsored ads tied to routes (sponsorName, message, routeIds, startDate, endDate, placementType)
- **Advertisers**: Company accounts with email + PIN login for self-service ad management
- **Route Analytics**: Daily traffic data per route (dailyPassengers, peakHourPassengers, impressions, clicks)
- **Users/Sessions**: Authentication tables managed by Replit Auth integration

### Role-Based Access (PIN System)
The app uses a triple-role PIN system for role-based access without requiring user accounts:

1. **Driver Mode** (OPERATOR_PIN environment variable)
   - Bus drivers can mark their availability on routes
   - Access via "Driver" button in navigation
   - Endpoints: `/api/verify-driver-pin`, `/api/driver-status`, `/api/exit-driver-mode`

2. **Admin Mode** (ADMIN_PIN environment variable)
   - App owner can manage routes, alerts, job postings, and advertisers
   - Access via "Admin" button in navigation
   - Endpoints: `/api/verify-admin-pin`, `/api/admin-status`, `/api/exit-admin-mode`
   - Protected endpoints use `isAdminVerified` middleware

3. **Advertiser Mode** (email + PIN per advertiser)
   - Advertisers can manage their own ads and view route analytics
   - Access via "Advertiser Portal" in hamburger menu (/advertiser-portal)
   - Endpoints: `/api/verify-advertiser-pin`, `/api/advertiser-status`, `/api/exit-advertiser-mode`
   - Protected endpoints use `isAdvertiserVerified` middleware
   - Demo advertiser: demo@advertiser.com / PIN: 1234

### API Structure
Routes are defined with full type contracts in `shared/routes.ts`:
- `GET /api/routes` - List all bus routes with optional search
- `GET /api/routes/:id` - Get single route details
- `POST /api/routes` - Create route (authenticated)
- `PUT /api/routes/:id` - Update route (authenticated)
- `DELETE /api/routes/:id` - Delete route (authenticated)
- `GET /api/notifications` - List notifications
- `POST /api/notifications` - Create notification (authenticated)
- `GET /api/subscriptions` - Get user's subscriptions
- `POST /api/subscriptions` - Subscribe to route
- `DELETE /api/subscriptions/:routeId` - Unsubscribe from route
- `GET /api/jobs` - List active job postings
- `GET /api/jobs/:id` - Get single job details
- `POST /api/jobs` - Create job (admin only)
- `PUT /api/jobs/:id` - Update job (admin only)
- `DELETE /api/jobs/:id` - Delete job (admin only)

### Authentication Flow
- Replit Auth via OpenID Connect handles user authentication (optional for subscriptions)
- Session-based authentication with PostgreSQL session store
- Protected routes use `isAuthenticated` middleware for user features
- PIN-based verification for driver (`isDriverVerified`) and admin (`isAdminVerified`) features
- User data stored in `users` table with Replit profile information
- **Required Environment Variables**: `OPERATOR_PIN` (for drivers), `ADMIN_PIN` (for admin)

### Project Structure
```
client/           # Frontend React application
  src/
    components/   # Reusable UI components
    hooks/        # Custom React hooks for data fetching
    pages/        # Page components (Home, Routes, Notifications, Subscriptions, Jobs, Reviews)
    lib/          # Utilities and query client setup
server/           # Express backend
  replit_integrations/auth/  # Replit Auth integration
shared/           # Shared types, schemas, and API contracts
  models/         # Database model definitions
  schema.ts       # Drizzle table definitions
  routes.ts       # API contract definitions
```

## External Dependencies

### Database
- **PostgreSQL**: Primary database (requires `DATABASE_URL` environment variable)
- **Drizzle ORM**: Database operations and schema management

### Authentication
- **Replit Auth**: OpenID Connect-based authentication
- **Required Environment Variables**: `ISSUER_URL`, `REPL_ID`, `SESSION_SECRET`, `DATABASE_URL`

### Key NPM Packages
- **Frontend**: React, TanStack Query, Wouter, Radix UI, Tailwind CSS, Framer Motion, date-fns
- **Backend**: Express, Passport, express-session, connect-pg-simple, Zod
- **Shared**: Drizzle ORM, drizzle-zod for schema-to-validation integration

### Build & Development
- **Vite**: Frontend bundler with HMR support
- **esbuild**: Server bundling for production
- **tsx**: TypeScript execution for development