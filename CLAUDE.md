# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EasyFit is a full-stack e-commerce platform built with a Node.js/Express backend and Next.js frontend. The system supports real-time features through WebSocket connections for order tracking, rider assignments, and live delivery updates.

## Development Commands

### Backend (Node.js/Express/TypeScript)
```bash
cd backend
npm run dev        # Start development server with hot reload
npm run build      # Compile TypeScript to JavaScript 
npm start          # Run production build
```

### Frontend (Next.js/React/TypeScript)
```bash
cd frontend
npm run dev        # Start Next.js development server with Turbopack
npm run build      # Build for production
npm start          # Start production server
npm run lint       # Run ESLint
```

## Architecture Overview

### Backend Structure

**Entry Points:**
- `src/server.ts` - Main server entry point with WebSocket initialization
- `src/app.ts` - Express application setup and middleware configuration

**Key Architecture Patterns:**
- **MVC Pattern**: Controllers handle HTTP requests, services contain business logic
- **Service Layer**: Complex business logic organized in service modules (auth/, checkout/, payment/, etc.)
- **WebSocket Orchestrator**: Centralized real-time communication system (`src/sockets/websocket.orchestrator.ts`)
- **Mongoose ODM**: MongoDB integration with schema definitions in `src/models/`

**Core Services:**
- Authentication system with JWT tokens (`src/services/auth/`)
- Multi-stage checkout process (`src/services/checkout/`)
- MercadoPago payment integration (`src/services/payment/`)
- Real-time order tracking and rider assignment
- Try-before-buy period management
- Return/damage handling workflow

**Database:**
- MongoDB with Mongoose ODM
- Connection configured in `src/config/db.ts`
- Models in `src/models/` (User, Order, Product, Store, etc.)

**Real-time Features:**
- Socket.IO WebSocket server for live updates
- Comprehensive channel system for different user roles
- Automatic channel joining based on user roles (merchants, riders, customers, admins)
- Detailed WebSocket API documented in `backend/WEBSOCKET_API_DOCUMENTATION.md`

### Frontend Structure

**Framework**: Next.js 15 with React 19 (App Router)
**Styling**: Tailwind CSS v4 with Radix UI components
**State Management**: Zustand for global state, React Query for server state
**Type Safety**: Full TypeScript integration with shared type definitions

**Key Architecture Patterns:**
- **Provider Pattern**: Centralized providers for auth, WebSocket, and React Query (`src/providers/`)
- **Hook-based API Layer**: Custom hooks wrapping API clients for type-safe data fetching (`src/hooks/api/`)
- **Component Architecture**: Radix UI primitives with custom compositions in `src/components/ui/`
- **Route Protection**: Next.js middleware for authentication and role-based access control

**Authentication & Authorization:**
- HTTP-only cookie-based authentication with automatic token refresh
- Role-based access control (customer, merchant, rider, admin)
- Protected routes with automatic redirect handling in `middleware.ts`
- Context-based auth state management with `AuthProvider`

**Real-time Features:**
- WebSocket client singleton with automatic reconnection (`src/lib/websocket/websocket-client.ts`)
- Role-based channel subscriptions and event handling
- Type-safe WebSocket event definitions in `src/types/websockets.d.ts`

**API Integration:**
- Base API client with automatic token refresh and error handling (`src/lib/api/base-client.ts`)
- Service-specific clients (auth, products, orders, cart, etc.)
- React Query hooks for caching and synchronization
- Environment-based configuration in `src/config/env.ts`

**UI Components:**
- Custom component library built on Radix UI primitives
- Consistent theming with Tailwind CSS classes
- Form handling with React Hook Form and Zod validation
- Toast notifications with Sonner integration

## Environment Configuration

**Backend Environment Variables:**
- Database: `MONGO_URI`, `DATABASE_PASSWORD`
- JWT: `JWT_SECRET`, `REFRESH_TOKEN_SECRET`
- External APIs: `SENDGRID_API_KEY`, `MP_ACCESS_TOKEN` (MercadoPago)
- Storage: R2 (Cloudflare) configuration for file uploads
- KYC: Sumsub integration for identity verification

**Frontend Environment Variables:**
- API: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SOCKET_URL`
- Maps: `GOOGLE_MAPS_API_KEY`, `GOOGLE_MAPS_SECRET_KEY`
- Auth: `JWT_SECRET` (for middleware validation)

**Configuration Files:**
- Backend: `src/config/env.ts` - Centralized environment variable management
- Frontend: `src/config/env.ts` - Frontend-specific configuration

## Key Integrations

**Payment Processing:**
- MercadoPago integration for Latin American markets
- Webhook handling for payment status updates
- Payment settlement system for multi-party transactions

**File Storage:**
- Cloudflare R2 for product images, return documentation, and assets
- Pre-signed URL generation for secure uploads

**External Services:**
- SendGrid for transactional emails
- Sumsub for KYC/identity verification
- MongoDB Atlas for database hosting

## API Structure

**Routes Organization:**
- RESTful API endpoints organized by resource (`/api/v1/`)
- Dedicated webhook handlers (`/webhooks/`)
- Authentication middleware with role-based access control
- Comprehensive error handling with custom AppError class

**WebSocket Events:**
- Role-based event handling (customers, merchants, riders, admins)
- Real-time order status updates and delivery tracking
- Rider availability and assignment system
- Return flow coordination between all parties

## Development Notes

**Code Patterns:**
- Async/await with custom `catchAsync` wrapper for error handling (backend)
- Service layer separation for testable business logic  
- Type-safe API clients with shared TypeScript definitions
- Comprehensive error handling with structured error responses
- React Query for server state management with automatic caching and revalidation
- Custom hooks pattern for reusable logic and API integration
- Component composition with Radix UI for accessible, customizable components

**WebSocket Implementation:**
- Channel-based messaging system with automatic role-based subscriptions
- Event handlers organized by functional area (delivery, orders, returns)
- Authentication middleware for all WebSocket connections
- Fallback strategies and error recovery for critical operations

**Frontend Routing & Middleware:**
- Next.js App Router with nested layouts and route groups
- Role-based route protection in `middleware.ts` with automatic redirects
- Dynamic routes for store/product pages (`[storeSlug]/[productSlug]`)
- API routes for server-side integration (places autocomplete, geocoding)

**Database Patterns:**
- Mongoose schemas with TypeScript integration
- Counter system for generating sequential order IDs
- Geospatial queries for rider location and assignment
- Embedded documents for order items and complex nested data