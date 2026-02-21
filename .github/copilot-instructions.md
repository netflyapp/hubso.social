# Hubso.social — Instrukcje dla GitHub Copilot

## Projekt

**Hubso.social** — modularna platforma społecznościowa white-label, SaaS-first + Self-hosted.
Pełna specyfikacja: `01_plan/PRD.md`

## Tech Stack

### Frontend (Faza 1 — Web App + Landing)
- **Next.js 15** (App Router) + TypeScript — SPA + SSR hybrid
- **Tailwind CSS 4** + **shadcn/ui** + **next-themes** (dark/light)
- **Zustand** (client state)
- **TanStack Query v5** (server state)
- **React Hook Form** + **Zod** (formularze)
- **Tiptap** (rich text editor)
- **Socket.io** (real-time)
- **Framer Motion** (animacje)
- **Solar Icons** via Iconify, **Recharts** (dashboards), **Sonner** (toasts)
- **Vitest** + **Testing Library** (unit/component), **Playwright** (E2E)

### Backend
- **NestJS** + TypeScript
- **REST** + **GraphQL** (Apollo)
- **Prisma** ORM + PostgreSQL 16
- **Passport.js** + JWT + Refresh Tokens
- **CASL.js** (permissions)
- **BullMQ** + Redis (background jobs)
- **Nodemailer** + MJML (email)
- **Socket.io** (WebSocket)
- **Pino** (structured logging), **Helmet.js** (security headers)
- **Zod** (shared validation client/server)

### Frontend (Faza 2 — Mobile)
- **React Native** + **Expo** (iOS + Android)
- **NativeWind** (Tailwind for RN), **Expo Router**, **MMKV**
- Współdzielone pakiety z web (Zustand, TanStack Query, Zod schemas)

### Infrastruktura
- **Docker** + Docker Compose
- **Turborepo** (monorepo)
- **Meilisearch** (full-text search)
- **MinIO** (S3-compatible storage)
- **Redis** (cache + sessions + queue)
- **Sentry** (error tracking), **Grafana** + **Prometheus** + **Loki** (monitoring)
- **Traefik** (reverse proxy, auto SSL), **Cloudflare** (CDN)
- **Uptime Kuma** (uptime monitoring)

### Payments
- **Stripe** (subscriptions, one-time payments)

### Video
- **Bunny Stream** (Faza 1) → własny pipeline **FFmpeg** + **HLS** (Faza 2)

## Konwencje kodowania

1. **TypeScript strict mode** — zawsze
2. **Server Components domyślnie** — `'use client'` tylko gdy potrzebne (useState, useEffect, event handlers)
3. **Tailwind utility-first** — unikaj custom CSS, korzystaj z design tokens
4. **shadcn/ui** — bazowe komponenty, nie wymyślaj od nowa
5. **Zod** — walidacja na frontendzie i backendzie, jedne schema
6. **Prisma schema-first** — migracje jako source of truth
7. **NestJS modułowy** — odpowiednie guards, interceptors, pipes
8. **REST dla CRUD, GraphQL dla relacji** — nie mieszaj bez potrzeby
9. **BullMQ** do ciężkich operacji — nigdy w request handler
10. **Testy** — Vitest (unit/component) + Playwright (E2E) dla krytycznych ścieżek
11. **Pino** — structured JSON logging w NestJS
12. **Helmet.js** + CORS + rate limiting — security od Sprint 1
13. **next-themes** — dark/light mode z CSS Custom Properties
14. **Web-first (Circle.so approach)** — 100% feature'ów na Next.js, mobile (React Native) to companion app ~70%

## Struktura monorepo

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

## Design System

- **Styl:** Flat Design + Minimalizm (inspiracja: Linear, Notion, Vercel)
- **Kolory:** Neutralne (slate) + 1 akcent konfigurowalny per community
- **Typografia:** Inter (UI) / Plus Jakarta Sans (headings)
- **Shadows:** Subtle (0-2px blur)
- **Border radius:** 8px (cards), 6px (buttons), 4px (inputs)
- **Spacing:** 4px grid system
- **Animacje:** Framer Motion, sub-300ms, ease-out
- **Breakpoints:** 375px → 768px → 1024px → 1280px → 1536px

## Bezpieczeństwo

- JWT z short-lived access tokens (15min) + refresh tokens (7d)
- Rate limiting na wszystkich endpointach
- Input sanitization (DOMPurify na frontendzie, Zod + class-validator na backendzie)
- Helmet.js (CSP, HSTS, X-Frame-Options)
- CORS z whitelist
- CSP headers
- SQL injection protection via Prisma
- XSS prevention via React + sanitization

## Umiejętności (Skills)

Projekt korzysta z **60 agentic skills** z antigravity-awesome-skills.
Pliki skilli dostępne w `.claude/skills/` (symlinki do `03_ui/antigravity-awesome-skills-main/skills/`).

**Jak korzystać z umiejętności w VS Code Copilot:**
1. Odwołaj się do pliku SKILL.md w czacie: `#file:.claude/skills/nazwa-skill/SKILL.md`
2. Lub poproś: „Zastosuj wzorce z pliku .claude/skills/nazwa-skill/SKILL.md"
3. Możesz łączyć kilka umiejętności w jednym promptcie

### Frontend
| Skill | Plik | Zakres |
|-------|------|--------|
| nextjs-best-practices | `.claude/skills/nextjs-best-practices/SKILL.md` | App Router, Server Components, data fetching |
| nextjs-app-router-patterns | `.claude/skills/nextjs-app-router-patterns/SKILL.md` | SSR, streaming, layouts, routing |
| react-best-practices | `.claude/skills/react-best-practices/SKILL.md` | React patterns, hooks, performance |
| react-patterns | `.claude/skills/react-patterns/SKILL.md` | Zaawansowane wzorce React |
| react-state-management | `.claude/skills/react-state-management/SKILL.md` | Stan globalny i lokalny |
| react-ui-patterns | `.claude/skills/react-ui-patterns/SKILL.md` | Wzorce komponentów UI |
| zustand-store-ts | `.claude/skills/zustand-store-ts/SKILL.md` | Zustand stores w TypeScript |
| tailwind-patterns | `.claude/skills/tailwind-patterns/SKILL.md` | Tailwind CSS v4, container queries |
| tailwind-design-system | `.claude/skills/tailwind-design-system/SKILL.md` | Design system, tokens, komponenty |
| frontend-design | `.claude/skills/frontend-design/SKILL.md` | Projektowanie frontendu |
| frontend-developer | `.claude/skills/frontend-developer/SKILL.md` | Frontend development |
| ui-ux-designer | `.claude/skills/ui-ux-designer/SKILL.md` | UI/UX design |
| ui-ux-pro-max | `.claude/skills/ui-ux-pro-max/SKILL.md` | Zaawansowany UI/UX |

### Mobile (React Native + Expo — Faza 2)
| Skill | Plik | Zakres |
|-------|------|--------|
| react-native-architecture | `.claude/skills/react-native-architecture/SKILL.md` | Architektura React Native |
| expo-deployment | `.claude/skills/expo-deployment/SKILL.md` | Expo deployment patterns |
| mobile-design | `.claude/skills/mobile-design/SKILL.md` | Projektowanie UI mobile |
| mobile-developer | `.claude/skills/mobile-developer/SKILL.md` | Development mobile |


### Backend
| Skill | Plik | Zakres |
|-------|------|--------|
| nestjs-expert | `.claude/skills/nestjs-expert/SKILL.md` | NestJS modules, DI, guards |
| backend-architect | `.claude/skills/backend-architect/SKILL.md` | Architektura backendu |
| senior-fullstack | `.claude/skills/senior-fullstack/SKILL.md` | Full-stack patterns |
| graphql | `.claude/skills/graphql/SKILL.md` | GraphQL schema, resolvers |
| graphql-architect | `.claude/skills/graphql-architect/SKILL.md` | GraphQL architecture |
| api-design-principles | `.claude/skills/api-design-principles/SKILL.md` | API design |
| api-patterns | `.claude/skills/api-patterns/SKILL.md` | REST/GraphQL patterns |
| openapi-spec-generation | `.claude/skills/openapi-spec-generation/SKILL.md` | OpenAPI/Swagger spec generation |
| bullmq-specialist | `.claude/skills/bullmq-specialist/SKILL.md` | Background jobs, queues |
| auth-implementation-patterns | `.claude/skills/auth-implementation-patterns/SKILL.md` | JWT, OAuth2, refresh tokens |
| nodejs-best-practices | `.claude/skills/nodejs-best-practices/SKILL.md` | Node.js best practices |
| nodejs-backend-patterns | `.claude/skills/nodejs-backend-patterns/SKILL.md` | Node.js backend patterns |

### Baza danych
| Skill | Plik | Zakres |
|-------|------|--------|
| prisma-expert | `.claude/skills/prisma-expert/SKILL.md` | Prisma ORM, migracje |
| database-design | `.claude/skills/database-design/SKILL.md` | Projektowanie schematu |
| database-architect | `.claude/skills/database-architect/SKILL.md` | Architektura DB |
| postgresql | `.claude/skills/postgresql/SKILL.md` | PostgreSQL |
| postgres-best-practices | `.claude/skills/postgres-best-practices/SKILL.md` | PostgreSQL optymalizacja |

### TypeScript
| Skill | Plik | Zakres |
|-------|------|--------|
| typescript-expert | `.claude/skills/typescript-expert/SKILL.md` | TypeScript mastery |
| typescript-pro | `.claude/skills/typescript-pro/SKILL.md` | TypeScript zaawansowany |
| typescript-advanced-types | `.claude/skills/typescript-advanced-types/SKILL.md` | Typy generyczne, utility types |

### Infrastruktura
| Skill | Plik | Zakres |
|-------|------|--------|
| docker-expert | `.claude/skills/docker-expert/SKILL.md` | Docker, Compose, multi-stage |
| monorepo-architect | `.claude/skills/monorepo-architect/SKILL.md` | Turborepo, pnpm workspaces |
| turborepo-caching | `.claude/skills/turborepo-caching/SKILL.md` | Turborepo caching strategies |
| search-specialist | `.claude/skills/search-specialist/SKILL.md` | Meilisearch, full-text search |

### Płatności
| Skill | Plik | Zakres |
|-------|------|--------|
| stripe-integration | `.claude/skills/stripe-integration/SKILL.md` | Stripe subscriptions |
| payment-integration | `.claude/skills/payment-integration/SKILL.md` | Payment flows |

### Testowanie
| Skill | Plik | Zakres |
|-------|------|--------|
| testing-patterns | `.claude/skills/testing-patterns/SKILL.md` | Vitest, mocking, factories |
| tdd-workflow | `.claude/skills/tdd-workflow/SKILL.md` | Red-green-refactor |
| e2e-testing-patterns | `.claude/skills/e2e-testing-patterns/SKILL.md` | E2E testy |
| playwright-skill | `.claude/skills/playwright-skill/SKILL.md` | Playwright E2E testing |

### Jakość i architektura
| Skill | Plik | Zakres |
|-------|------|--------|
| clean-code | `.claude/skills/clean-code/SKILL.md` | Czysty kod, SOLID |
| code-review-excellence | `.claude/skills/code-review-excellence/SKILL.md` | Code review |
| architecture | `.claude/skills/architecture/SKILL.md` | Decyzje architektoniczne |
| software-architecture | `.claude/skills/software-architecture/SKILL.md` | Architektura software |
| architecture-decision-records | `.claude/skills/architecture-decision-records/SKILL.md` | ADR |

### Bezpieczeństwo
| Skill | Plik | Zakres |
|-------|------|--------|
| security-auditor | `.claude/skills/security-auditor/SKILL.md` | Audyt bezpieczeństwa |
| api-security-best-practices | `.claude/skills/api-security-best-practices/SKILL.md` | API security |

### Workflow
| Skill | Plik | Zakres |
|-------|------|--------|
| brainstorming | `.claude/skills/brainstorming/SKILL.md` | Planowanie, ideation |
| concise-planning | `.claude/skills/concise-planning/SKILL.md` | Zwięzłe plany |
| git-pushing | `.claude/skills/git-pushing/SKILL.md` | Git workflow |

### Inne
| Skill | Plik | Zakres |
|-------|------|--------|
| wcag-audit-patterns | `.claude/skills/wcag-audit-patterns/SKILL.md` | Audyt dostępności WCAG |
| i18n-localization | `.claude/skills/i18n-localization/SKILL.md` | Internationalizacja |
| web-performance-optimization | `.claude/skills/web-performance-optimization/SKILL.md` | Web performance |
