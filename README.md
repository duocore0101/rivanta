# Rivanta - Premium Hotel Management System (HMS)

Rivanta is an end-to-end luxury hospitality management and operational platform built for modern hotel administration, front desk operations, guest stays, reservations, and billing workflows.

---

## Architecture Overview

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: NestJS, TypeScript, Prisma ORM, PostgreSQL, Passport JWT Authentication
- **Monorepo Structure**:
  - `frontend/` - Modern dashboard and responsive UI for admin and front desk staff
  - `backend/` - REST API with role-based access control, booking engine, room management, and billing service

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL database
- npm / yarn / pnpm

### Environment Setup

1. Copy environment variable templates:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   ```
2. Update `backend/.env` with your PostgreSQL database credentials and JWT secret.

### Installation

Install dependencies across the monorepo:
```bash
npm --prefix backend install
npm --prefix frontend install
```

### Database Migration & Seeding

```bash
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

### Running Locally

To run both frontend and backend or run them individually:

```bash
# Run backend development server (Port 4000)
npm run dev:backend

# Run frontend development server (Port 3000)
npm run dev:frontend
```

---

## Features

- **Front Desk Operations**: Express check-in/check-out, live room rack, guest directory.
- **Room & Inventory Management**: Deluxe, Suite, Executive categories with status monitoring (Clean, Occupied, Maintenance).
- **Billing & Folio Engine**: Instant invoicing, PDF receipt generation, taxes and addon tracking.
- **Admin Dashboard**: Real-time revenue analytics, occupancy rates, and staff audit logs.
- **Enterprise Security**: Role-based access control (Admin, Front Desk, Manager) with JWT authentication.
