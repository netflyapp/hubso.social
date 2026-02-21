# Hubso.social — CLAUDE.md

> Plik konfiguracyjny dla Claude Code. Wczytywany automatycznie przy starcie sesji.

## Projekt

**Hubso.social** — modularna platforma społecznościowa white-label, SaaS-first + Self-hosted.

- Pełna specyfikacja: `01_plan/PRD.md`
- Aktualny kod strony głównej: `02_app/202602210020_ver.1.0.0 (strona główna)/`

## Tech Stack

### Frontend (Faza 1 — Web App + Landing)
- Next.js 15 (App Router) + TypeScript — SPA + SSR hybrid
- Tailwind CSS 4 + shadcn/ui + next-themes (dark/light)
- Zustand (client state), TanStack Query v5 (server state)
- React Hook Form + Zod, Tiptap, Socket.io, Framer Motion
- Solar Icons via Iconify, Recharts (dashboards), Sonner (toasts)
- Vitest + Testing Library (unit/component), Playwright (E2E)

### Backend
- NestJS + TypeScript, REST + GraphQL (Apollo)
- Prisma ORM + PostgreSQL 16
- Passport.js + JWT, CASL.js, BullMQ + Redis
- Nodemailer + MJML, Socket.io
- Pino (structured logging), Helmet.js (security headers)
- Zod (shared validation client/server)

### Frontend (Faza 2 — Mobile)
- React Native + Expo (iOS + Android)
- NativeWind (Tailwind for RN), Expo Router, MMKV
- Współdzielone pakiety z web (Zustand, TanStack Query, Zod schemas)

### Infrastruktura
- Docker + Compose, Turborepo, Meilisearch, MinIO, Redis
- Monitoring: Sentry, Grafana + Prometheus + Loki, Uptime Kuma
- Reverse Proxy: Traefik (auto SSL), CDN: Cloudflare

### Płatności
- Stripe

### Video
- Bunny Stream (Faza 1) → własny pipeline FFmpeg + HLS (Faza 2)

## Konwencje

1. TypeScript strict mode — zawsze
2. Server Components domyślnie — `'use client'` tylko gdy potrzebne
3. Tailwind utility-first — unikaj custom CSS
4. shadcn/ui — bazowe komponenty
5. Zod — walidacja frontend + backend (shared schemas)
6. Prisma schema-first — migracje jako source of truth
7. NestJS modułowy — guards, interceptors, pipes
8. REST dla CRUD, GraphQL dla relacji
9. BullMQ do ciężkich operacji — nigdy w request handler
10. Testy: Vitest (unit/component) + Playwright (E2E) dla krytycznych ścieżek
11. Pino — structured JSON logging w NestJS
12. Helmet.js + CORS + rate limiting — security od Sprint 1
13. next-themes — dark/light mode z CSS Custom Properties
14. Web-first (Circle.so approach) — 100% feature'ów na Next.js, mobile (React Native) to companion app ~70%

## Design System

- Styl: Flat Design + Minimalizm (Linear, Notion, Vercel)
- Kolory: Neutralne (slate) + 1 akcent konfigurowalny
- Typografia: Inter (UI) / Plus Jakarta Sans (headings)
- Border radius: 8px (cards), 6px (buttons), 4px (inputs)
- Spacing: 4px grid, Animacje: Framer Motion sub-300ms
- Breakpoints: 375px → 768px → 1024px → 1280px → 1536px

## Dostępne Skills (60 skilli w `.claude/skills/`)

Używaj `@nazwa-skill` aby aktywować umiejętność w konwersacji.

### Najważniejsze na start (Essentials)
- `@brainstorming` — planuj przed budową
- `@concise-planning` — organizuj zadania
- `@git-pushing` — bezpieczne commity
- `@clean-code` — czysty kod

### Frontend (Web)
- `@nextjs-best-practices` `@nextjs-app-router-patterns`
- `@react-best-practices` `@react-patterns` `@react-state-management` `@react-ui-patterns`
- `@tailwind-patterns` `@tailwind-design-system`
- `@zustand-store-ts` `@frontend-design` `@frontend-developer`
- `@ui-ux-designer` `@ui-ux-pro-max`

### Mobile (React Native + Expo — Faza 2)
- `@react-native-architecture` — architektura React Native
- `@expo-deployment` — Expo deployment patterns
- `@mobile-design` — projektowanie UI mobile
- `@mobile-developer` — development mobile

### Backend
- `@nestjs-expert` `@backend-architect` `@senior-fullstack`
- `@graphql` `@graphql-architect`
- `@api-design-principles` `@api-patterns` `@openapi-spec-generation`
- `@bullmq-specialist` `@auth-implementation-patterns`
- `@nodejs-best-practices` `@nodejs-backend-patterns`

### Database
- `@prisma-expert` `@database-design` `@database-architect`
- `@postgresql` `@postgres-best-practices`

### TypeScript
- `@typescript-expert` `@typescript-pro` `@typescript-advanced-types`

### Infrastruktura & DevOps
- `@docker-expert` `@monorepo-architect` `@turborepo-caching` `@search-specialist`

### Płatności
- `@stripe-integration` `@payment-integration`

### Testowanie
- `@testing-patterns` `@tdd-workflow` `@e2e-testing-patterns` `@playwright-skill`

### Architektura & Jakość
- `@architecture` `@software-architecture` `@architecture-decision-records`
- `@code-review-excellence`

### Bezpieczeństwo
- `@security-auditor` `@api-security-best-practices`

### Dostępność & Inne
- `@wcag-audit-patterns` `@i18n-localization` `@web-performance-optimization`

## Struktura monorepo (zgodna z PRD v4.0)

```
hubso/
├── apps/
│   ├── web/              → Next.js 15 (App Router) — SPA + SSR
│   ├── api/              → NestJS — backend API
│   ├── mobile/           → React Native + Expo (Faza 2)
│   └── docs/             → Dokumentacja (Docusaurus)
├── packages/
│   ├── ui/               → Shared UI components (shadcn/ui)
│   ├── shared/           → TypeScript types, Zod schemas, API client
│   ├── config/           → ESLint, tsconfig, Tailwind configs
│   ├── database/         → Prisma schema + migrations + seeds
│   ├── plugin-sdk/       → SDK dla developerów wtyczek
│   └── ai/               → AI utilities, prompts, model configs
├── plugins/
│   ├── courses/          → LMS (oficjalna wtyczka)
│   ├── shop/             → Sklep (oficjalna wtyczka)
│   └── gamification/     → Gamifikacja (oficjalna wtyczka)
├── docker/
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   ├── Dockerfile.api
│   └── Dockerfile.web
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```
