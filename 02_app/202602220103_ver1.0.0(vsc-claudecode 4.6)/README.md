# Hubso.social — Setup & Development Guide

## Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Setup Database
```bash
# Generate Prisma Client
pnpm -F @hubso/database prisma generate

# Create database and run migrations
pnpm -F @hubso/database db:push

# Seed database (optional)
pnpm -F @hubso/database db:seed
```

### 3. Start Docker Services
```bash
# Start PostgreSQL, Redis, MinIO, Meilisearch, imgproxy
docker compose -f docker/docker-compose.dev.yml up -d
```

### 4. Environment Setup
Create `.env.local` files:

**apps/web/.env.local**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**apps/api/.env.local**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hubso
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRATION=15m
REFRESH_TOKEN_SECRET=refresh-secret-key
REFRESH_TOKEN_EXPIRATION=7d
REDIS_URL=redis://localhost:6379
API_PORT=3001
```

### 5. Start Development Servers

**Terminal 1 - Backend**
```bash
pnpm -F @hubso/api dev
# API runs on http://localhost:3001
# Swagger docs: http://localhost:3001/api/docs
```

**Terminal 2 - Frontend**
```bash
pnpm -F @hubso/web dev
# Web app runs on http://localhost:3000
```

## Project Structure

```
hubso/
├── apps/
│   ├── web/              → Next.js 15 frontend (SPA + SSR)
│   ├── api/              → NestJS backend API
│   └── docs/             → Documentation (Docusaurus)
├── packages/
│   ├── ui/               → shadcn/ui component library
│   ├── shared/           → Zod schemas, types, constants
│   ├── config/           → Shared TypeScript/Tailwind configs
│   ├── database/         → Prisma ORM + schema
│   └── plugin-sdk/       → Plugin developer SDK (planned)
├── plugins/              → Official plugins (planned)
│   ├── courses/
│   ├── shop/
│   └── gamification/
├── docker-compose.yml    → Production stack
└── turbo.json           → Turborepo configuration
```

## Available Commands

### Root Level
```bash
pnpm install              # Install all dependencies
pnpm typecheck           # Check TypeScript errors
pnpm build               # Build all apps
pnpm dev                 # Start all dev servers (if supported)
pnpm clean               # Clean all build outputs
```

### Workspace Specific
```bash
pnpm -F @hubso/web dev       # Start Next.js
pnpm -F @hubso/api dev       # Start NestJS
pnpm -F @hubso/database db:push  # Apply Prisma migrations
```

## Tech Stack

### Frontend
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- Zustand (state)
- TanStack Query (server state)
- React Hook Form + Zod (forms)
- Framer Motion (animations)
- Solar Icons (@iconify/react)

### Backend
- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL 16
- Redis 7
- JWT Authentication
- Helmet (security)
- Swagger/OpenAPI

### Infrastructure
- Docker & Docker Compose
- PostgreSQL (database)
- Redis (cache/sessions)
- MinIO (S3-compatible storage)
- Meilisearch (full-text search)
- imgproxy (image optimization)

## Key Features

### Design System
- **Primary Color:** `#4262F0` (Indigo)
- **Dark Mode:** CSS Custom Properties with HSL
- **Components:** 15+ shadcn/ui primitives
- **Icons:** Solar Icons via @iconify/react
- **Responsive:** Mobile-first, SM/MD/LG/XL breakpoints

### Authentication
- JWT tokens (15min access + 7d refresh)
- Passport.js strategies
- Role-based access control (RBAC)

### Database
- 18 Prisma models
- Multi-tenant architecture
- Full data model matching PRD

## Debugging

### Frontend
```bash
# Run type check
pnpm -F @hubso/web typecheck

# Build for production
pnpm -F @hubso/web build
```

### Backend
```bash
# Run type check
pnpm -F @hubso/api typecheck

# Watch mode with debugging
pnpm -F @hubso/api start:debug
```

### Database
```bash
# Open Prisma Studio (GUI)
pnpm -F @hubso/database db:studio

# Check migrations
pnpm -F @hubso/database prisma migrate status
```

## Next Steps

1. ✅ Monorepo setup
2. ✅ UI components foundation
3. ✅ Auth pages skeleton
4. ⏳ Mock data completion
5. ⏳ Convert 9 HTML pages to JSX
6. ⏳ API endpoint implementation
7. ⏳ WebSocket integration
8. ⏳ E2E tests

## Contributing

See [GIT_WORKFLOW.md](../GIT_WORKFLOW.md) for branching strategy and commit conventions.

## Support

For setup issues, check `/01_plan/PRD.md` for technical requirements and `/03_ui/brandbook.md` for design system details.
