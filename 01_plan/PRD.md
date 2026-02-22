# Hubso.social — Product Requirements Document (PRD)

> **Wersja:** 4.1  
> **Data:** 2026-02-21  
> **Status:** Draft  
> **Autor:** Miłosz Zając  
> **Typ produktu:** Hybrid SaaS-first + Self-hosted — platforma społecznościowa white-label  
> **Model dystrybucji:** SaaS domyślnie (Hubso Cloud) + Self-hosted opcjonalnie (Faza 2+)  
> **Frontend Web:** Next.js 15 (App Router) + Tailwind CSS 4 + shadcn/ui (SPA + SSR)  
> **Frontend Mobile:** React Native + Expo (iOS + Android) — Faza 2  
> **Podejście:** Web-first (jak Circle.so) — 100% feature'ów na Web, ~70% na Mobile  

---

## Spis treści

1. [Wizja produktu](#1-wizja-produktu)
2. [Problem i rynek](#2-problem-i-rynek)
3. [Analiza konkurencji](#3-analiza-konkurencji)
4. [Unique Value Proposition](#4-unique-value-proposition)
5. [Grupy docelowe](#5-grupy-docelowe)
6. [Architektura systemu](#6-architektura-systemu)
7. [Tech Stack](#7-tech-stack)
8. [Architektura modularna — Plugin Marketplace](#8-architektura-modularna--plugin-marketplace)
9. [Moduły Core (MVP)](#9-moduły-core-mvp)
10. [Moduły rozszerzone (Post-MVP)](#10-moduły-rozszerzone-post-mvp)
11. [Integracja AI](#11-integracja-ai)
12. [Integracje zewnętrzne i API](#12-integracje-zewnętrzne-i-api)
13. [White-label i tematyzacja](#13-white-label-i-tematyzacja)
14. [Design System](#14-design-system)
15. [Schemat bazy danych](#15-schemat-bazy-danych)
16. [Infrastruktura i hosting](#16-infrastruktura-i-hosting)
17. [Hosting wideo](#17-hosting-wideo)
18. [Wymagania niefunkcjonalne](#18-wymagania-niefunkcjonalne)
19. [Bezpieczeństwo](#19-bezpieczeństwo)
20. [Plan implementacji](#20-plan-implementacji)
21. [Model biznesowy](#21-model-biznesowy)
22. [Metryki sukcesu](#22-metryki-sukcesu)
23. [Ryzyka i mitygacja](#23-ryzyka-i-mitygacja)
24. [Zasady dla developera / AI](#24-zasady-dla-developera--ai)
25. [Narzędzia AI-assisted development](#25-narzędzia-ai-assisted-development)

---

## 1. Wizja produktu

**Hubso.social** to nowoczesna, modularna platforma społecznościowa typu white-label, self-hosted, łącząca najlepsze cechy Circle.so, BuddyBoss, Skool.com i Fluent Community — ale zbudowana na współczesnym stacku technologicznym (Next.js + NestJS, bez WordPressa), z natywną integracją AI, systemem wtyczek (marketplace), pełnofunkcjonalną aplikacją webową (SPA + SSR) oraz natywną aplikacją mobilną (React Native, Faza 2), i naciskiem na design, szybkość i bezpieczeństwo.

> **Strategia Circle.so:** Web-first — aplikacja webowa zawiera 100% funkcjonalności (admin, tworzenie treści, moderacja). Aplikacja mobilna (React Native, Faza 2) pokrywa ~70% feature'ów (konsumpcja treści, chat, powiadomienia). Desktop via PWA lub Tauri (opcjonalnie, Faza 3).

### Hasło przewodnie

> *„Twoja społeczność. Twoje zasady."*

### Kluczowe wyróżniki

| # | Wyróżnik | Opis |
|---|----------|------|
| 1 | **Nowoczesny stack (nie WordPress)** | Next.js + NestJS + PostgreSQL — web-first SPA/SSR, React Native mobile (Faza 2) |
| 2 | **Architektura modularna (Plugin Marketplace)** | Trzon + marketplace wtyczek — jak WordPress/Raycast, ale nowoczesny |
| 3 | **Natywna integracja AI** | OpenRouter jako gateway, inteligentny matching, moderacja, asystent AI |
| 4 | **White-label z customizacją kolorów** | Klient zmienia branding, kolory, logo — to jego marka |
| 5 | **Self-hosted z zero transaction fees** | Pełna kontrola nad danymi, zero prowizji od transakcji |
| 6 | **Gamifikacja + Discovery Engine** | Leaderboardy, punkty, katalog społeczności — to, czego brakuje konkurencji |
| 7 | **Szybkość i design** | Flat Design + Minimalizm, SSR + SPA hybrid (Next.js), Framer Motion animacje sub-300ms, płynny UX |

---

## 2. Problem i rynek

### Problem

Twórcy społeczności online stoją przed wyborem:

1. **SaaS (Circle.so, Skool, Mighty Networks)** — ładne, ale drogie ($89–399/mies.), prowizje od transakcji, zero kontroli nad danymi, zamknięty ekosystem.
2. **Self-hosted (BuddyBoss, Fluent Community)** — kontrola nad danymi, ale oparty na WordPressie — wolny, ciężki, problemy z bezpieczeństwem, archaiczny stack.
3. **Open-source (Discourse, Flarum)** — fora, nie platformy społecznościowe — brak kursów, eventów, monetyzacji, messagingu.

**Nie istnieje** rozwiązanie self-hosted, zbudowane na nowoczesnym stacku, z marketplace wtyczek, natywnym AI i gamifikacją.

### Rynek

- Globalny rynek platform społecznościowych: **$4.7B (2025)** → **$12.1B (2030)** (CAGR 21%)
- Segment community platforms: **$1.2B (2025)**, rosnący z ekonomią twórców
- Trend: twórcy odchodzą od platform „wynajmowanych" (Facebook Groups, Discord) ku „posiadanym" (own community)
- Self-hosted segment rośnie — świadomość GDPR, data ownership, suwerenność cyfrowa

---

## 3. Analiza konkurencji

### Matryca porównawcza

| Feature | Skool | Circle.so | BuddyBoss | FluentCommunity | **Hubso** |
|---------|-------|-----------|-----------|-----------------|-----------|
| Self-hosted | ❌ | ❌ | ✅ (WP) | ✅ (WP) | ✅ (nowoczesny stack) |
| Nowoczesny backend (nie WP) | ✅ | ✅ | ❌ | ❌ | ✅ |
| Gamifikacja | ✅✅ | ✅ | ❌ | ✅ | ✅✅ |
| Spaces / subspaces | ❌ | ✅✅ | ✅ | ✅ | ✅✅ |
| Automation engine | ❌ | ✅✅ | ❌ | Partial | ✅✅ |
| Plugin Marketplace | ❌ | ❌ | ❌ | ❌ | ✅✅ |
| Native mobile app | ✅ | ✅ | ✅ | ❌ | ✅ (React Native — Faza 2) |
| Zero transaction fees | ❌ (2.9%) | ❌ (0.5-2%) | ✅ | ✅ | ✅ |
| AI natywne | ❌ | Basic | ❌ | ❌ | ✅✅ |
| Discovery engine | ✅✅ | ❌ | ❌ | ❌ | ✅ (Faza 2) |
| Desktop app | ❌ | ❌ | ❌ | ❌ | ✅ (PWA / Tauri — Faza 3, opcjonalnie) |
| White-label | ❌ | ✅ | ✅ | Partial | ✅✅ |
| Custom domain | ❌ | ✅ | ✅ | ✅ | ✅ |

### Co bierzemy od konkurencji

| Źródło | Feature | Implementacja w Hubso |
|--------|---------|----------------------|
| **Skool** | Gamifikacja, leaderboardy, discovery | System punktów, rankingi, unlock content, katalog społeczności |
| **Circle.so** | Spaces, automation, live streaming | Spaces z permission levels, workflow engine (if-then), natywne eventy |
| **Mighty Networks** | AI member matching, mobile-first | AI sugestie „poznaj tę osobę", React Native app (iOS + Android) — Faza 2 |
| **BuddyBoss** | Ownership, zero fees, white-label | Self-hosted, zero prowizji, pełny white-label |
| **FluentCommunity** | Oddzielony frontend + API, real-time chat | Next.js frontend (SPA + SSR) + REST/GraphQL API, WebSocket chat |

### Luka rynkowa którą wypełniamy

**Self-hosted + nowoczesny stack + plugin marketplace + gamifikacja + automation + AI + zero fees** — żaden konkurent nie oferuje tego wszystkiego naraz.

---

## 4. Unique Value Proposition

### Dla twórców społeczności (Community Builders)

> „Zbuduj profesjonalną społeczność na własnym serwerze, z pełną kontrolą nad danymi i marką, bez prowizji od transakcji, z AI które automatyzuje moderację i zwiększa engagement — i rozszerzaj platformę wtyczkami z marketplace."

### Dla developerów (Ecosystem)

> „Buduj i sprzedawaj wtyczki do Hubso — dedykowane API, SDK, dokumentacja, marketplace z revenue share. Jak WordPress plugins, ale na nowoczesnym stacku."

### Dla end-userów (Members)

> „Dołącz do społeczności z płynnym interfejsem, inteligentnym matchingiem, gamifikacją i kursami — wszystko w jednym miejscu, szybkie jak natywna aplikacja."

---

## 5. Grupy docelowe

### Primary — Community Builders

| Segment | Opis | Potrzeba |
|---------|------|---------|
| **Twórcy kursów online** | Edukatorzy, coachowie, mentorzy | Kursy + społeczność + monetyzacja |
| **Eksperci branżowi** | Lekarze, dietetycy, trenerzy, psychologowie | Platforma wiedzy + Q&A + zamknięte materiały |
| **Influencerzy** | YouTuberzy, podcasterzy, blogerzy | Zamknięta społeczność premium |
| **Firmy SaaS** | Customer community, feedback | Wsparcie + forum + onboarding |
| **Organizacje / NGO** | Stowarzyszenia, grupy lokalne | Koordynacja + eventy + komunikacja |

### Secondary — Developerzy

- Twórcy wtyczek i integracji
- Agencje wdrażające Hubso dla klientów
- Freelancerzy customizujący platformę

### Tertiary — End Users (Members)

- Członkowie społeczności szukający wartości, wiedzy, networking
- Uczestnicy kursów i programów

---

## 6. Architektura systemu

### Ogólna architektura

```
┌─────────────────────────────────────────────────────────────┐
│                      KLIENT (USER)                          │
├──────────┬──────────────┬───────────────┬───────────────────┤
│  Web     │  Desktop     │  iOS          │  Android          │
│ (Next.js)│ (Tauri 2)    │ (React Native)│ (React Native)    │
│  Faza 1  │  Faza 3      │  Faza 2       │  Faza 2           │
└────┬─────┴──────┬───────┴───────┬───────┴────────┬──────────┘
     │            │               │                │
     └────────────┴───────┬───────┴────────────────┘
                          │
                    ┌─────▼─────┐
                    │ Cloudflare│  CDN + DDoS + SSL
                    │   Proxy   │
                    └─────┬─────┘
                          │
              ┌───────────▼───────────┐
              │    REVERSE PROXY      │
              │    (Traefik / Caddy)  │
              │    Auto SSL           │
              └───────────┬───────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
   ┌─────▼─────┐   ┌─────▼─────┐   ┌─────▼─────┐
   │  Next.js   │   │  NestJS   │   │  WebSocket │
   │  Frontend  │   │  API      │   │  Server    │
   │  (SSR/SSG) │   │  REST +   │   │ (Socket.io)│
   │            │   │  GraphQL  │   │            │
   └─────┬─────┘   └─────┬─────┘   └─────┬─────┘
         │                │                │
         └────────────────┼────────────────┘
                          │
    ┌─────────┬───────────┼───────────┬──────────┐
    │         │           │           │          │
┌───▼──┐ ┌───▼──┐  ┌─────▼────┐ ┌───▼───┐ ┌───▼────┐
│Postgr│ │Redis │  │Meilisearch│ │ MinIO │ │BullMQ  │
│SQL 16│ │  7   │  │(search)   │ │(S3)   │ │Workers │
└──────┘ └──────┘  └──────────┘ └───────┘ └────────┘
```

### Architektura modułowa

```
┌──────────────────────────────────────────┐
│              HUBSO CORE                  │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌────────┐  │
│  │ Auth │ │Users │ │Spaces│ │  Feed  │  │
│  └──────┘ └──────┘ └──────┘ └────────┘  │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌────────┐  │
│  │ Chat │ │Groups│ │Events│ │Notific.│  │
│  └──────┘ └──────┘ └──────┘ └────────┘  │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌────────┐  │
│  │Search│ │Media │ │Admin │ │  AI    │  │
│  └──────┘ └──────┘ └──────┘ └────────┘  │
├──────────────────────────────────────────┤
│           PLUGIN API / SDK               │
├──────────────────────────────────────────┤
│           MARKETPLACE                    │
│  ┌──────┐ ┌──────┐ ┌───────┐ ┌───────┐  │
│  │Kursy │ │Sklep │ │Randki │ │Booking│  │
│  │(LMS) │ │      │ │       │ │       │  │
│  └──────┘ └──────┘ └───────┘ └───────┘  │
│  ┌──────┐ ┌──────────┐ ┌─────────────┐  │
│  │CRM   │ │Gamifikacja│ │Health Diary │  │
│  └──────┘ └──────────┘ └─────────────┘  │
└──────────────────────────────────────────┘
```

### Monorepo

```
hubso/
├── apps/
│   ├── web/              → Next.js 15 (App Router) — SPA + SSR, główna aplikacja
│   │   ├── src/
│   │   │   ├── app/        → App Router (pages, layouts, loading, error)
│   │   │   ├── components/ → React components (shadcn/ui based)
│   │   │   ├── lib/        → Utils, hooks, stores (Zustand), API client
│   │   │   └── styles/     → Tailwind config, global styles
│   │   ├── public/       → Static assets
│   │   └── package.json
│   ├── mobile/           → React Native + Expo (Faza 2) — iOS + Android
│   │   ├── src/
│   │   │   ├── screens/    → Ekrany (React Navigation)
│   │   │   ├── components/ → Natywne komponenty
│   │   │   └── lib/        → Shared logic, hooks, stores
│   │   ├── ios/          → iOS runner
│   │   ├── android/      → Android runner
│   │   └── package.json
│   ├── api/              → NestJS — backend API
│   └── docs/             → Dokumentacja dla developerów (Docusaurus)
├── packages/
│   ├── ui/               → Shared UI components (shadcn/ui based, React)
│   ├── shared/           → Wspólne typy TypeScript, Zod schemas, kontrakty API
│   ├── config/           → ESLint, tsconfig, Tailwind configs
│   ├── database/         → Prisma schema + migrations + seeds
│   ├── plugin-sdk/       → SDK dla developerów wtyczek
│   └── ai/               → AI utilities, prompts, model configs
├── plugins/
│   ├── courses/          → Moduł LMS (oficjalna wtyczka)
│   ├── shop/             → Moduł sklep (oficjalna wtyczka)
│   └── gamification/     → Moduł gamifikacji (oficjalna wtyczka)
├── docker/
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   ├── Dockerfile.api
│   └── Dockerfile.web      → Next.js build (Node.js / standalone)
├── turbo.json              → Turborepo (monorepo orchestration)
├── package.json
└── pnpm-workspace.yaml
```

---

## 7. Tech Stack

### Frontend Web — Next.js (SPA + SSR) — Faza 1

> **Web-first:** Główna aplikacja webowa zawiera 100% funkcjonalności. Strony publiczne (landing, discovery, profile) renderowane SSR/SSG dla SEO. Strony zalogowane (dashboard, feed, chat, admin) działają jako SPA z client-side routing.

| Warstwa | Technologia | Uzasadnienie |
|---------|------------|--------------|
| Framework | **Next.js 15** (App Router) + **TypeScript** | SSR/SSG + SPA, Server Components, streaming |
| Styling | **Tailwind CSS 4** + **shadcn/ui** | Utility-first, gotowe komponenty, design tokens |
| Client State | **Zustand** | Lekki, TypeScript-first, zero boilerplate |
| Server State | **TanStack Query v5** | Cache, deduplication, optimistic updates |
| Forms | **React Hook Form** + **Zod** | Performant forms, shared validation schemas |
| Rich Text Editor | **Tiptap** (ProseMirror based) | Headless, rozszerzalny, Markdown + WYSIWYG, collaborative editing |
| Real-time | **Socket.io** (client) | WebSocket do NestJS, chat, presence, notifications |
| Animacje | **Framer Motion** | Deklaratywne animacje, layout transitions, sub-300ms |
| Ikony | **Solar Icons** via **Iconify** | Spójny set, linear + bold stany, tree-shakeable |
| Wykresy | **Recharts** | Dashboard, analytics, customizowalne, React-native |
| Auth (client) | **next-auth** / custom JWT | Refresh token rotation, httpOnly cookies |
| Image handling | **next/image** + imgproxy | Automatyczna optymalizacja, lazy loading, WebP |
| Testy | **Vitest** + **Testing Library** + **Playwright** | Unit, component, E2E testy |

### Frontend Mobile — React Native + Expo — Faza 2

> **~70% feature'ów webowych** — konsumpcja treści, chat, powiadomienia push, offline basics. Admin panel i tworzenie treści głównie na webie.

| Warstwa | Technologia | Uzasadnienie |
|---------|------------|--------------|
| Framework | **React Native** + **Expo SDK 52+** | Natywna wydajność, hot reload, OTA updates |
| Navigation | **React Navigation 7** / **Expo Router** | Deep links, native transitions, type-safe |
| State / API | **Zustand** + **TanStack Query** | Współdzielona logika z apps/web (packages/shared) |
| Styling | **NativeWind** (Tailwind for RN) | Zbliżony do web Tailwind, re-use design tokens |
| Push notifications | **Expo Notifications** + FCM/APNs | Native push iOS + Android |
| Storage | **MMKV** / **AsyncStorage** | Offline cache, tokens, settings |
| Rich Text | **React Native Render HTML** | Wyświetlanie treści z Tiptap JSON |
| Real-time | **Socket.io** (client) | Współdzielona logika z web |

### SPA + SSR Hybrid Strategy

> Next.js App Router pozwala na hybrydowe podejście — **najlepsze z obu światów**.

| Typ strony | Rendering | Przykład |
|------------|-----------|---------|
| **Publiczne (SEO)** | SSR / SSG | Landing page, discovery, publiczne profile, help center |
| **Zalogowane (SPA)** | Client-side (CSR) | Dashboard, feed, chat, admin panel, ustawienia |
| **Dynamiczne publiczne** | ISR (Incremental Static Regen) | Strony społeczności, publiczne posty, eventy |

**Kluczowa korzyść SPA:** Po zalogowaniu użytkownik nawiguje błyskawicznie bez przeładowań strony. Dane prefetchowane z TanStack Query, layout zachowany między stronami (no full page reload).

| Warstwa | Technologia | Uzasadnienie |
|---------|------------|--------------|
| Runtime | **Node.js 22 LTS** | Stabilny, LTS, performance |
| Framework | **NestJS** | Modularny, DI, guards, interceptors, TypeScript |
| API | **REST** + **GraphQL** (Apollo) | REST dla CRUD, GraphQL dla relacji |
| ORM | **Prisma** (lub Drizzle) | Type-safe, migracje, schema-first |
| Auth | **Passport.js** + JWT + Refresh Tokens | OAuth2 (Google, Apple, Facebook), magic link |
| Permissions | **CASL.js** | Attribute-based access control |
| Upload | Presigned URLs → S3-compatible | Bezpośredni upload do MinIO/R2 |
| Email | **Nodemailer** + MJML templates (lub Resend) | Transactional + digest emails |
| Background Jobs | **BullMQ** + Redis | Transkodowanie, emails, cron, cleanup |
| Notifications | Push (FCM/APNs) + Email + In-App (WebSocket) | Multi-channel |
| Walidacja | **Zod** (shared z frontendem) | Spójna walidacja client/server |
| Logging | **Pino** | Structured JSON logging |

### Baza danych

| Warstwa | Technologia | Uzasadnienie |
|---------|------------|--------------|
| Primary | **PostgreSQL 16** | JSONB, full-text, transakcje, dojrzały |
| Cache / Sessions | **Redis 7** | Sessions, cache, queues, rate limiting, presence |
| Search | **Meilisearch** | Self-hosted, full-text, typo-tolerant, szybki |
| Obrazki | **imgproxy** | Resize, crop, WebP on-the-fly |
| Wideo | **FFmpeg** (via BullMQ) | Transkodowanie HLS, thumbnails |
| Storage | **MinIO** (self-hosted S3) | Pliki, media, wideo |

### Platformy — Web-first (jak Circle.so)

| Platforma | Technologia | Status | Uwagi |
|-----------|-------------|--------|-------|
| **Web (Desktop)** | Next.js 15 (SSR + SPA) | **Faza 1** | 100% funcji, główna platforma, SEO, admin panel |
| **Web (Mobile)** | Next.js (responsive PWA) | **Faza 1** | Responsywna wersja webowa, add-to-homescreen |
| **iOS** | React Native + Expo | Faza 2 | App Store, push notifications (APNs), biometria |
| **Android** | React Native + Expo | Faza 2 | Play Store, push notifications (FCM), biometria |
| **Desktop** | PWA / Tauri 2 (opcjonalnie) | Faza 3 | Menu bar, system tray, offline (jeśli będzie potrzeba) |

> **Kluczowa strategia (Circle.so model):** 80% użycia platform społecznościowych to web (admin, tworzenie treści, moderacja). Mobile to konsumpcja (feed, chat, notyfikacje). Dlatego web-first — 100% feature'ów od Fazy 1, mobile jako companion app w Fazie 2.

---

## 8. Architektura modularna — Plugin Marketplace

### Filozofia

Hubso działa jak **WordPress/Raycast** — stabilny trzon (core) z dedykowanym API i SDK dla developerów, którzy mogą budować, publikować i sprzedawać wtyczki w marketplace.

### Plugin SDK

```typescript
// packages/plugin-sdk/src/types.ts

interface HubsoPlugin {
  id: string;                    // unikalne ID (np. "hubso-courses")
  name: string;                  // nazwa wyświetlana
  version: string;               // semver
  description: string;
  author: PluginAuthor;
  
  // Hooki lifecycle
  onInstall(): Promise<void>;
  onUninstall(): Promise<void>;
  onActivate(): Promise<void>;
  onDeactivate(): Promise<void>;
  
  // Rejestracja
  registerRoutes?(router: PluginRouter): void;      // nowe strony/endpointy
  registerSidebarItems?(sidebar: SidebarAPI): void;  // elementy nawigacji
  registerSettings?(settings: SettingsAPI): void;     // panel ustawień
  registerHooks?(hooks: HookAPI): void;               // hooki na eventy core
  registerWidgets?(widgets: WidgetAPI): void;          // widgety w dashboardzie
  registerPermissions?(perms: PermissionAPI): void;    // nowe uprawnienia
}

interface PluginManifest {
  id: string;
  name: string;
  version: string;
  hubsoVersion: string;          // minimalna wersja Hubso
  permissions: string[];         // wymagane uprawnienia
  dependencies: string[];        // inne wymagane pluginy
  pricing: 'free' | 'paid';
  price?: number;
  category: PluginCategory;
}
```

### Plugin API — dostępne zasoby

| API | Opis |
|-----|------|
| **Users API** | Odczyt profili, ról, aktywności |
| **Spaces API** | CRUD przestrzeni, membership |
| **Posts API** | CRUD postów, komentarzy, reakcji |
| **Messages API** | Wysyłanie wiadomości, konwersacje |
| **Events API** | CRUD eventów, RSVP |
| **Storage API** | Upload/download plików |
| **Notifications API** | Wysyłanie powiadomień (push, email, in-app) |
| **Settings API** | Odczyt/zapis ustawień pluginu |
| **Billing API** | Integracja z systemem płatności |
| **AI API** | Dostęp do modeli AI (via OpenRouter) |
| **Hooks API** | Subskrypcja na eventy (post.created, user.joined, etc.) |
| **UI API** | Rejestracja komponentów UI, stron, widgetów |

### Marketplace

| Element | Opis |
|---------|------|
| **Katalog** | Przeglądanie wtyczek po kategoriach, ocenach, popularności |
| **Instalacja** | 1-click install z admin panelu |
| **Aktualizacje** | Auto-update lub manual z changelog |
| **Revenue share** | 70% developer / 30% Hubso |
| **Review system** | Oceny, recenzje, screenshot'y |
| **Kategorie** | LMS, E-commerce, CRM, Booking, Social, Analytics, AI, Integrations |

### Oficjalne wtyczki (built by Hubso)

| Wtyczka | Opis | Status |
|---------|------|--------|
| **Courses (LMS)** | Kursy, moduły, lekcje, quizy, certyfikaty, drip content | Faza 1.5 |
| **Shop** | Produkty cyfrowe, fizyczne, subskrypcje, koszyk | Faza 2 |
| **Gamification** | Punkty, leaderboardy, odznaki, unlock content, wyzwania | Faza 1.5 |
| **Booking** | Rezerwacja terminów, kalendarz, Zoom/Meet integration | Faza 2 |
| **Health Diary** | Dziennik zdrowia, parametry, AI sugestie | Faza 2 |
| **Recipes** | Baza przepisów, kategorie, ulubione, oceny | Faza 2 |
| **Affiliate** | Program poleceń, dashboard prowizji, linki afiliacyjne | Faza 2 |
| **Analytics Pro** | Zaawansowane metryki, raporty, eksport | Faza 2 |

---

## 9. Moduły Core (MVP)

### 9.1 Auth & Users

**Rejestracja:**
- Email/hasło
- OAuth2: Google, Facebook, Apple
- Magic link (email)
- Invite-only mode (opcjonalnie)

**Login:**
- Email/hasło + 2FA (TOTP — Google Authenticator)
- OAuth2
- Magic link
- Remember me (refresh tokens)

**Profil użytkownika:**
- Avatar, cover photo, display name, bio
- Custom fields (konfigurowane per community)
- Social links (Twitter/X, LinkedIn, Instagram, YouTube, website)
- Activity feed per profil
- Member since, last seen

**Member Directory:**
- Lista wszystkich członków z filtrami
- Wyszukiwarka (imię, rola, custom fields)
- Sortowanie: najnowsi, najbardziej aktywni, alfabetycznie

**Role systemowe:**

| Rola | Uprawnienia |
|------|-------------|
| **Super Admin** | Pełna kontrola, wielozarządzanie, billing |
| **Admin** | Zarządzanie community, użytkownikami, treścią |
| **Moderator** | Moderacja treści, ban, mute, warn |
| **Member** | Tworzenie postów, komentarzy, uczestnictwo |
| **Guest** | Tylko przeglądanie publicznych treści |

**Account settings:**
- Notification preferences (co i jak chcę dostawać)
- Privacy (profil publiczny/prywatny, widoczność aktywności)
- Blocked users
- Data export (GDPR)
- Account deletion
- Theme (light/dark/auto)
- Language

### 9.2 Spaces (Przestrzenie) — wzór Circle.so

**Typy przestrzeni:**
- **Posts** — klasyczny feed z postami
- **Chat** — real-time rozmowy (kanały jak Discord)
- **Events** — kalendarz i eventy
- **Links** — kolekcja linków / bookmarks
- **Files** — repozytorium plików

**Organizacja:**
- Space Groups (foldery przestrzeni, kolapsowalne w sidebar)
- Drag-and-drop reorder
- Custom ikona i kolor akcentu per space

**Kontrola dostępu:**
- **Public** — widoczne i dostępne dla wszystkich
- **Private** — widoczne, ale wymagają zaproszenia / approval
- **Secret** — ukryte, dostęp tylko z linku / zaproszenia

**Dodatkowe:**
- Lock Screen (paywall) — blokowanie dostępu za płatność
- Space-level roles (space admin, moderator, member)
- Custom branding per space (kolor akcentu, ikona)
- Pinned spaces (przypięte u góry sidebar)

### 9.3 Activity Feed & Posts

**Feed:**
- Globalny feed (wszystkie przestrzenie)
- Feed per space
- Feed per profil
- Algorytmiczny feed (opcjonalny, AI-driven) + chronologiczny

**Typy postów:**
- Tekst (rich text via Tiptap)
- Zdjęcia (grid, galeria)
- Wideo (embedded player, HLS)
- Linki (z auto-preview / OG tags)
- Pliki (attachments)
- Polls (ankiety, jedno/wielokrotny wybór)
- Embeds (YouTube, Vimeo, Twitter, Spotify, etc.)

**Rich text editor (Tiptap):**
- Formatowanie: bold, italic, strikethrough, code, headings
- Listy (bullet, numbered, todo)
- Mention @user, #hashtag
- Emoji picker
- Link embed z podglądem
- Code blocks z syntax highlighting
- Drag-and-drop zdjęć
- Markdown shortcuts

**Interakcje:**
- Reakcje (konfigurowane per community: like, love, wow, fire, etc.)
- Komentarze z threading (zagnieżdżone odpowiedzi)
- Pin post (przypnij na górze feeda)
- Feature post (wyróżnij)
- Bookmark (zapisz na później)
- Share (link, embed)

**Moderacja:**
- Scheduled posts (publikacja z opóźnieniem)
- Draft posts (szkice)
- Auto-flag (AI + keyword filter)
- Manual review queue
- Spam filter
- Report post

### 9.4 Messaging (DM & Group Chat)

- 1:1 Direct Messages
- Group chats (do 50 osób)
- Real-time via WebSocket (Socket.io)
- Read receipts, typing indicators
- Online/offline status (presence)
- Media sharing: zdjęcia, pliki, voice messages
- Message search (full-text)
- Threaded replies w konwersacjach
- Mute/block conversations
- Message reactions
- Link preview w wiadomościach

### 9.5 Groups — wzór BuddyBoss/Facebook

- Typy: Public, Private, Hidden
- Osobny feed per grupa
- Group roles: Owner, Admin, Moderator, Member
- Group invite system (link, email, direct)
- Group cover photo, description, rules
- Discussion threads wewnątrz grup
- Member list z filtrami
- Group settings (moderacja, approval, prywatność)

### 9.6 Events

- Tworzenie: tytuł, opis, data/czas, lokalizacja (online/offline)
- RSVP system: Going, Maybe, Not Going
- Recurring events (daily, weekly, monthly, custom RRULE)
- Calendar view: miesiąc, tydzień, lista, agenda
- Integracja z Zoom/Google Meet (auto-generowanie linku)
- Event reminders: email + push + in-app (przed 24h, 1h, 15min)
- Ticket / access management: free vs paid events
- Event discussion (komentarze, Q&A)
- iCal export / Google Calendar sync
- Event cover image, tags, categories

### 9.7 Notifications

**Kanały:**
- In-app (bell icon, dropdown, mark as read/all read)
- Email (instant, daily digest, weekly digest)
- Push (mobile iOS/Android natywne + Web)

**Konfiguracja per user:**
- Co chcę dostawać (new post, comment, mention, DM, event reminder...)
- Jak chcę dostawać (in-app, email, push — per kategoria)
- Mute per space/group
- Do Not Disturb mode

**Grupowanie:**
- „5 osób polubiło twój post"
- „3 nowe komentarze w przestrzeni X"

### 9.8 Search

- Globalny search bar: users, posts, spaces, groups, events, files, messages
- Powered by Meilisearch: full-text, typo-tolerant, instant
- Filtrowanie: typ (post, user, event...), data, space, autor
- Sortowanie: relevance, date, popularity
- Recent searches (historia)
- Search suggestions / autocomplete
- Cmd+K / Ctrl+K shortcut (command palette)

### 9.9 Media & Files

- Image upload z auto-kompresją (Sharp → WebP)
- Resize on-the-fly (imgproxy)
- Video upload + transkodowanie (FFmpeg → HLS)
- File attachments (PDF, docs, spreadsheets, etc.)
- Media gallery per user / group / space
- Storage: MinIO (S3-compatible) z CDN layer
- Drag-and-drop upload w edytorze
- Paste from clipboard
- Max file size: konfigurowalne (domyślnie 100MB per plik, 2GB per wideo)

### 9.10 Admin Panel

**Dashboard:**
- Metryki: MAU, DAU, nowi członkowie, posty, komentarze, retencja
- Wykresy: engagement trend, growth, aktywność per dzień tygodnia
- Top contributors, trending posts

**User Management:**
- Lista użytkowników z filtrami
- Ban, suspend, warn, mute (z powiadomieniem)
- Role assignment (bulk)
- User details: aktywność, raporty, historia

**Content Moderation:**
- Review queue: flagged posts, reported content
- Keyword blocklist (auto-hide)
- AI moderation (auto-flag toxic content)
- Bulk actions: approve, delete, warn user

**Community Settings:**
- Branding: logo, kolory, font, favicon
- Registration: open, invite-only, approval required
- Custom fields: definiowanie pól profilu
- Email templates: welcome, reset, notification
- Integrations management
- Plugins management (install, config, deactivate)

**Analytics:**
- Engagement: likes, comments, posts per day
- Growth: new users, churn
- Retention: cohort analysis
- Content performance: top posts, most engaged spaces
- Export: CSV, JSON

**Audit Log:**
- Kto, co, kiedy zmienił
- Filtrowanie per admin, typ akcji, data
- Eksport

---

## 10. Moduły rozszerzone (Post-MVP)

### 10.1 Courses / LMS (Oficjalna wtyczka — Faza 1.5)

- Course builder: moduły → lekcje → quizy
- Content types: video, tekst, PDF, audio
- Progress tracking per student
- Completion certificates (PDF generation)
- Discussion per lekcja
- Drip content (udostępnianie lekcji wg harmonogramu)
- Cohort-based courses (kursy kohortowe z grupą)
- Enrollments: free / paid / subscription
- Student dashboard: moje kursy, postęp, certyfikaty

### 10.2 Monetyzacja (Faza 1.5)

- Membership levels: free, paid tiers (monthly/yearly)
- **Stripe** integration: subscriptions, one-time payments
- Paywall na spaces / courses / content
- Coupons & discounts (% lub kwota, limit użyć, data ważności)
- Revenue dashboard: przychody, subskrypcje, churn
- Invoicing (auto-generowane faktury)
- **Zero transaction fees** (Hubso nie pobiera prowizji — tylko Stripe standard)

### 10.3 Gamification (Oficjalna wtyczka — Faza 1.5)

- System punktów za: posty, komentarze, lajki, loginy, ukończenie kursu
- Leaderboard: ogólny + per space
- Odznaki (badges) za osiągnięcia
- Unlock content: odblokowanie materiałów po osiągnięciu poziomu
- Wyzwania: 7/21/30-dniowe, z progress tracking
- Streak tracking (dni z rzędu)
- Level system (newbie → pro → master → legend)
- Custom rewards (definiowane przez admina)

### 10.4 Automation Engine (Faza 2)

- Workflow builder: IF trigger THEN action
- Triggers: user.joined, post.created, course.completed, event.rsvp, membership.upgraded...
- Actions: send email, send DM, add to group, assign role, add points, webhook...
- Templates: welcome sequence, onboarding flow, win-back
- Visual workflow editor (drag-and-drop)

### 10.5 Discovery Engine (Faza 2)

- Katalog społeczności (jak Skool Discover)
- Kategorie, tagi, wyszukiwarka
- Featured communities
- Organic discovery (SEO, recommendations)
- Landing pages per community (public, SEO-optimized)

### 10.6 Live Streaming (Faza 2)

- Native live streaming (WebRTC / RTMP)
- Screen sharing
- Chat overlay
- Recording + auto-publikacja po zakończeniu
- Scheduled live events

---

## 11. Integracja AI

### 11.1 Podejście

AI w Hubso to **first-class citizen**, nie afterthought. Integracja przez **OpenRouter** jako gateway do wielu modeli, z możliwością:
- Łatwej zmiany modeli (GPT-4o, Claude, Gemini, Llama, Mistral...)
- Dopasowania wydajności do ceny per task
- Docelowo: self-hosted modele (np. GLM-5, Kimi) na własnym GPU

### 11.2 AI Features — Core

| Feature | Opis | Model (sugerowany) |
|---------|------|---------------------|
| **AI Moderacja** | Auto-flagowanie toksycznych treści, spamu, NSFW | GPT-4o-mini (szybki, tani) |
| **AI Member Matching** | „Poznaj tę osobę" — sugestie na bazie profilu i aktywności | Embedding model + vector search |
| **AI Post Summary** | Streszczenie długich postów / dyskusji | GPT-4o-mini |
| **AI Search** | Semantic search — wyszukiwanie po znaczeniu, nie tylko słowach kluczowych | Embedding model + Meilisearch |
| **AI Translation** | Auto-tłumaczenie postów na język użytkownika | GPT-4o-mini |
| **AI Writing Assistant** | Podpowiedzi przy pisaniu postów, poprawa stylu | GPT-4o |
| **AI Community Insights** | Analiza trendów, sentiment analysis, churn prediction | GPT-4o + custom pipeline |

### 11.3 AI Features — Plugin-specific

| Feature | Wtyczka | Opis |
|---------|---------|------|
| **AI Course Generator** | Courses | Generowanie outlines kursów z materiałów |
| **AI Quiz Generator** | Courses | Auto-generowanie quizów z lekcji |
| **AI Health Suggestions** | Health Diary | Sugestie na bazie long-term danych zdrowotnych |
| **AI Recipe Suggestions** | Recipes | Dopasowanie przepisów do preferencji / diety |
| **AI GIF Generator** | Core | Generowanie GIF-ów / stickers (darmowy model, np. open-source) |
| **AI Chatbot (Brat bliźniak)** | Custom | Avatar AI bazujący na treściach twórcy — Q&A z bazą wiedzy |

### 11.4 Architektura AI

```
┌─────────────────────────────────┐
│         Hubso AI Service        │
├─────────────────────────────────┤
│  ┌────────────┐ ┌────────────┐  │
│  │   Prompts  │ │  Embeddings│  │
│  │   Manager  │ │  Pipeline  │  │
│  └──────┬─────┘ └──────┬─────┘  │
│         │              │         │
│  ┌──────▼──────────────▼─────┐  │
│  │      OpenRouter Gateway    │  │
│  │  (routing, fallback, cost) │  │
│  └──────────────┬────────────┘  │
│                 │                │
│  ┌──────────────▼────────────┐  │
│  │   Model Selection Logic    │  │
│  │  - GPT-4o (complex tasks)  │  │
│  │  - GPT-4o-mini (simple)    │  │
│  │  - Claude (long context)   │  │
│  │  - Self-hosted (free tier) │  │
│  └────────────────────────────┘  │
├─────────────────────────────────┤
│  Vector DB: pgvector / Qdrant   │
│  (embeddings, semantic search)  │
└─────────────────────────────────┘
```

### 11.5 Konfiguracja AI per community

Admin może w panelu:
- Włączyć/wyłączyć poszczególne AI features
- Wybrać preferowany model (koszt vs jakość)
- Ustawić limity (max zapytań AI per user / miesiąc)
- Podłączyć własny klucz API (OpenRouter / OpenAI / Anthropic)
- Docelowo: podłączyć self-hosted model

---

## 12. Integracje zewnętrzne i API

### 12.1 Webhooks

- Konfigurowane per community w admin panelu
- Events: user.created, post.created, membership.changed, payment.completed, etc.
- Retry policy: 3 retries z exponential backoff
- Webhook logs w admin panelu
- Signature verification (HMAC)

### 12.2 REST API (Public)

Pełne public API dla developerów i integracji:
- Dokumentacja: OpenAPI 3.0 (Swagger)
- Auth: API keys + OAuth2
- Rate limiting: per key
- Versioning: /v1/, /v2/
- SDKs: JavaScript/TypeScript, Python (docelowo)

### 12.3 Natywne integracje

| Integracja | Typ | Opis |
|-----------|-----|------|
| **Stripe** | Payments | Subskrypcje, one-time, checkout |
| **Zoom** | Events | Auto-generowanie linków do spotkań |
| **Google Meet** | Events | Auto-generowanie linków |
| **Google Calendar** | Events | Sync eventów |
| **Notion** | Content | Import/export treści, embeds |
| **MailerLite** | Email marketing | Sync kontaktów, segmenty, kampanie |
| **Mailchimp** | Email marketing | Sync kontaktów, tagi |
| **Zapier** | Automation | Trigger/Action dla 5000+ apps |
| **Make (Integromat)** | Automation | Jak Zapier, alternatywa |
| **Discord** | Notifications | Powiadomienia na kanale Discord |
| **Slack** | Notifications | Powiadomienia na kanale Slack |
| **Google Analytics** | Analytics | Tracking per community |
| **YouTube** | Video | Embed, import transkrypcji |

### 12.4 Embed / iFrame

- Hubso widget: embeddable feed / chat na external website
- oEmbed support: linki do Hubso generują preview

---

## 13. White-label i tematyzacja

### 13.1 Co klient może zmienić

| Element | Konfigurowalne? | Gdzie |
|---------|----------------|-------|
| Logo (ikona + tekst) | ✅ | Admin → Branding |
| Favicon | ✅ | Admin → Branding |
| Primary color (+ auto-generated shades) | ✅ | Admin → Branding |
| Font heading / body | ✅ | Admin → Branding |
| Cover photo community | ✅ | Admin → Branding |
| Custom domain | ✅ | Admin → Domains |
| Email templates (kolory, logo) | ✅ | Admin → Emails |
| Dark mode jako domyślny | ✅ | Admin → Appearance |
| Login page branding | ✅ | Admin → Branding |
| Kolory neutralne | ❌ | Stałe — zapewnia spójność |
| Layout struktury | ❌ | Stały — sidebar/header/content |

### 13.2 Automatyczne generowanie odcieni

Na podstawie primary HEX admin, system generuje:
- primary-50 ... primary-900 (pełna skala Tailwind)
- primary-light (tła aktywnych elementów)
- primary-dark (tekst na jasnym primary bg)
- Kontrast tekstu sprawdzany automatycznie (WCAG AA minimum)

### 13.3 CSS Custom Properties (White-label)

```css
/* packages/ui/src/styles/theme.css */

:root {
  /* Nadpisywane per community via API */
  --primary: 142.1 76.2% 36.3%;
  --primary-foreground: 355.7 100% 97.3%;
  --primary-light: 138.5 76.5% 96.7%;
  --radius: 0.5rem;
  --font-heading: 'Plus Jakarta Sans', sans-serif;
  --font-body: 'Inter', sans-serif;
}

.dark {
  --primary: 142.1 70.6% 45.3%;
  --primary-foreground: 144.9 80.4% 10%;
  --background: 0 0% 2%;
  --card: 0 0% 5.9%;
}
```

---

## 14. Design System

> Pełna specyfikacja: `03_ui/brandbook.md`

### 14.1 Styl

**Flat Design + Minimalizm** — czysty, profesjonalny, z dark mode. Inspiracja: Circle.so, Notion, Linear.

### 14.2 Paleta kolorów (domyślna)

| Rola | HEX | Użycie |
|------|-----|--------|
| Primary | `#2D8F4E` (Emerald) | CTA, aktywne elementy, badges |
| Primary Light | `#ECFDF5` | Tła aktywnych elementów |
| Primary Dark | `#166534` | Tekst na jasnym tle primary |
| Secondary | `#22C55E` | Online status, success |
| Background (Light) | `#F7F8FA` | Główne tło |
| Surface (Light) | `#FFFFFF` | Karty, sidebar |
| Background (Dark) | `#050505` | Główne tło dark |
| Surface (Dark) | `#0F1115` | Karty dark |

### 14.3 Typografia

- **Font:** Inter (300–700)
- **Body:** 16px / 1.6
- **Headings:** semibold/bold, tracking-tight
- **Max line length:** 65–75 znaków

### 14.4 Layout

```
┌──────────────────────────────────────────────────────────┐
│  HEADER (h-16, sticky top-0, z-50)                       │
├───────────┬──────────────────────────────┬───────────────┤
│ SIDEBAR   │  MAIN CONTENT                │  RIGHT PANEL  │
│ (w-260px) │  (flex-1, overflow-y-auto)   │  (w-320px)    │
│ xl:flex   │                              │  hidden lg:   │
└───────────┴──────────────────────────────┴───────────────┘
```

### 14.5 Ikony

- **Solar Icons** (Iconify) — linear (inactive), bold (active)
- Rozmiary: 16/20/22/24px w zależności od kontekstu

### 14.6 Komponenty (shadcn/ui + custom)

- Layout: AppShell, Sidebar, Header, ContentArea, ResponsiveContainer
- Navigation: NavItem, SpaceList, SpaceGroupAccordion, MobileBottomNav
- Feed: PostCard, PostComposer (Tiptap), CommentThread, ReactionBar, InfiniteScrollList
- Profile: UserAvatar, UserCard, ProfileHeader, MemberList
- Messaging: ChatWindow, MessageBubble, ConversationList, TypingIndicator
- Modals: Dialog, Sheet (CreateSpace, CreateGroup, CreateEvent, InviteMembers)
- Forms: LoginForm, RegisterForm, SettingsForm (React Hook Form + Zod)
- Data Display: DataTable, StatsCard, Recharts dashboards
- Feedback: Toast (Sonner), AlertDialog, Badge, Skeleton (loading)
- shadcn/ui base: Button, Input, Select, Tabs, Card, DropdownMenu, Command (Cmd+K)

---

## 15. Schemat bazy danych

### Kluczowe encje

```
User
├── id, email, username, password_hash, avatar_url, cover_url
├── bio, display_name, custom_fields (JSONB)
├── role, status (active/suspended/banned)
├── email_verified, two_factor_enabled
├── created_at, updated_at, last_seen_at
└── settings (JSONB: notification_prefs, privacy, theme)

Community (multi-tenant)
├── id, name, slug, logo_url, description
├── settings (JSONB: branding, registration, features, ai_config)
├── owner_id → User
├── plan, status
└── custom_domain

CommunityMember
├── community_id → Community
├── user_id → User
├── role (admin, moderator, member)
├── joined_at, status
└── points, level (gamification)

Space
├── id, community_id → Community
├── name, slug, description, icon, color
├── type (posts, chat, events, links, files)
├── visibility (public, private, secret)
├── space_group_id → SpaceGroup (nullable)
├── settings (JSONB), position (sort order)
└── paywall_enabled, paywall_price

SpaceGroup
├── id, community_id, name, position, collapsed_default

SpaceMember
├── space_id → Space, user_id → User
├── role, joined_at

Post
├── id, space_id → Space, author_id → User
├── content (JSONB — Tiptap document)
├── type (text, poll, event, link, file)
├── status (draft, published, scheduled, archived)
├── pinned, featured
├── published_at, scheduled_at
├── reactions_count (JSONB: {like: 5, love: 3})
├── comments_count
└── metadata (JSONB: link_preview, poll_options, attachments, etc.)

Comment
├── id, post_id → Post, author_id → User
├── parent_id → Comment (nullable — threading)
├── content (JSONB), reactions_count (JSONB)
└── created_at, updated_at

Reaction
├── id, user_id → User
├── target_type (post, comment), target_id
├── type (like, love, wow, fire, etc.)
└── UNIQUE(user_id, target_type, target_id)

Group
├── id, community_id → Community
├── name, slug, description, cover_url, rules
├── visibility (public, private, hidden)
├── member_count, created_by → User
└── settings (JSONB)

GroupMember
├── group_id → Group, user_id → User
├── role (owner, admin, moderator, member)

Conversation (DM / Group Chat)
├── id, type (direct, group)
├── name (nullable, for group chats)
├── avatar_url (nullable)
└── created_at, updated_at

ConversationParticipant
├── conversation_id → Conversation, user_id → User
├── last_read_at, muted

Message
├── id, conversation_id → Conversation
├── sender_id → User
├── content, type (text, image, file, voice)
├── parent_id → Message (nullable — threads)
└── created_at, edited_at

Event
├── id, space_id → Space, created_by → User
├── title, description, location_type (online/offline)
├── location_url, location_address
├── starts_at, ends_at, timezone
├── recurring_rule (RRULE string)
├── max_attendees, ticket_price
├── status (draft, published, cancelled, completed)
└── cover_url, tags (JSONB)

EventAttendee
├── event_id → Event, user_id → User
├── status (going, maybe, not_going)

Notification
├── id, user_id → User
├── type, title, body
├── data (JSONB: link, actor_id, target_type, target_id)
├── read_at, created_at
└── channel (in_app, email, push)

MediaFile
├── id, uploaded_by → User, community_id → Community
├── filename, mime_type, size_bytes
├── storage_key (S3 path), cdn_url
├── width, height (for images/video)
├── status (processing, ready, failed)
├── type (image, video, file, audio)
└── metadata (JSONB: duration, thumbnail_url, hls_url)

Plugin
├── id, name, slug, version
├── description, author
├── status (active, inactive, error)
├── settings (JSONB — plugin-specific config)
├── installed_at, updated_at

Webhook
├── id, community_id → Community
├── url, secret (HMAC key)
├── events (JSONB array: ["post.created", "user.joined"])
├── status (active, inactive)
└── last_triggered_at, failure_count

AuditLog
├── id, community_id → Community
├── actor_id → User
├── action, target_type, target_id
├── metadata (JSONB: old_value, new_value)
└── created_at, ip_address
```

---

## 16. Infrastruktura i hosting

### Produkcja — Coolify + Hetzner Cloud

| Komponent | Specyfikacja |
|-----------|-------------|
| **VPS** | Hetzner Cloud CX41 (4 vCPU, 16GB RAM, 160GB SSD) — na start |
| **Deployment** | Coolify (self-hosted PaaS, auto-deploy) |
| **Reverse Proxy** | Traefik (auto SSL via Let's Encrypt) — zarządzany przez Coolify |
| **Containerization** | Docker + Docker Compose |
| **CI/CD** | GitHub Actions → webhook do Coolify |
| **Object Storage** | Hetzner Object Storage (S3-compatible) lub Cloudflare R2 |
| **CDN** | Cloudflare (darmowy plan na start) |
| **Monitoring** | Grafana + Prometheus + Loki |
| **Error Tracking** | Sentry (self-hosted lub SaaS) |
| **Uptime** | Uptime Kuma (self-hosted) |
| **Backups** | Automated daily → Hetzner Storage Box |

### Docker Compose (produkcja)

```yaml
services:
  postgres:
    image: postgres:16-alpine
    volumes: [postgres_data:/var/lib/postgresql/data]
    
  redis:
    image: redis:7-alpine
    
  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    volumes: [minio_data:/data]
    
  meilisearch:
    image: getmeili/meilisearch:latest
    volumes: [meili_data:/meili_data]
    
  imgproxy:
    image: darthsim/imgproxy:latest
    
  api:
    build: { context: ., dockerfile: docker/Dockerfile.api }
    depends_on: [postgres, redis, minio, meilisearch]
    
  web:
    build: { context: ., dockerfile: docker/Dockerfile.web }
    depends_on: [api]
    
  worker:
    build: { context: ., dockerfile: docker/Dockerfile.api }
    command: node dist/worker.js
    depends_on: [postgres, redis, minio]
```

### Skalowanie

| Faza | Setup |
|------|-------|
| **Start (< 1K users)** | 1 VPS (CX41), PostgreSQL + Redis + MinIO na tym samym serwerze |
| **Growth (1K–10K)** | Oddzielny DB server, Redis Cluster, CDN, BullMQ workers na osobnym VPS |
| **Scale (10K–100K)** | Load balancer + 2-3 API servers, PostgreSQL read replicas, PgBouncer |
| **Enterprise (100K+)** | Kubernetes (k3s), sharding, multi-region, dedicated GPU for AI |

---

## 17. Hosting wideo

### Pipeline

```
Upload MP4 → MinIO → BullMQ job → FFmpeg →
  → 1080p.m3u8 (HLS)
  → 720p.m3u8
  → 480p.m3u8
  → 360p.m3u8
  → thumbnail.jpg
  → preview.gif (5s)
→ Powrót do MinIO → CDN delivery
```

### Opcje storage

| Opcja | Koszt | Opis |
|-------|-------|------|
| **Hetzner Object Storage** | €5/TB/mies. + €1/TB egress | S3-compatible, elastyczne |
| **Cloudflare R2** | $0.015/GB, **zero egress** | Game changer dla wideo |
| **Bunny Stream** (hybrid) | $5/mies. base + $0.005/min | Transkodowanie + CDN out-of-box |

### Rekomendacja

**Faza 1:** Bunny Stream (pragmatyczny, szybki start, zero DevOps wideo)  
**Faza 2:** Migracja na własny pipeline (Hetzner Object Storage + FFmpeg + Cloudflare CDN)

### Player

**Video.js** lub **Plyr** — HLS, adaptive bitrate, customowy skin z brand colors.

---

## 18. Wymagania niefunkcjonalne

### Performance

| Metryka | Cel |
|---------|-----|
| Time to First Byte (TTFB) | < 200ms |
| Largest Contentful Paint (LCP) | < 2.5s |
| First Input Delay (FID) | < 100ms |
| Cumulative Layout Shift (CLS) | < 0.1 |
| API response time (95th percentile) | < 300ms |
| WebSocket latency | < 50ms |

**Strategie:**
- Next.js SSR/SSG dla publicznych stron (SEO + szybki TTFB)
- SPA routing po zalogowaniu (instant navigation, no full page reload)
- React Server Components — mniej JS na kliencie
- next/image — automatyczna optymalizacja obrazów (WebP, lazy loading)
- Lazy loading + infinite scroll feeds (TanStack Query + cursor pagination)
- Cursor-based pagination (nie offset)
- Database: indeksy, eager loading, query optimization
- Redis cache: hot data, sessions, computed values
- CDN: static assets, media, fonts (Cloudflare)
- Image optimization: WebP, srcset via imgproxy
- Code splitting: Next.js automatic + dynamic imports
- Framer Motion: GPU-accelerated animacje, sub-300ms

### Skalowalność

- Horizontal scaling: stateless API za load balancerem
- Next.js: standalone build + Node.js runtime LUB static export + CDN
- Database: read replicas, PgBouncer (connection pooling)
- Redis Cluster
- Object storage oddzielony od compute
- BullMQ workers na osobnych nodes
- CDN dla static assets i media
- Multi-tenant isolation na poziomie queries (community_id)

### Dostępność (Accessibility)

- WCAG 2.1 AA compliance (minimum)
- Kontrast tekstu ≥ 4.5:1
- Focus states widoczne (ring)
- Touch targets ≥ 44×44px
- Keyboard navigation (tab order, skip-to-content)
- Screen reader: semantic HTML, aria-labels, aria-live
- prefers-reduced-motion: respektowane
- Alt text na obrazach

### Monitoring & Observability

- Structured logging (Pino → JSON)
- Health check endpoints: /health, /ready
- Grafana dashboards: CPU, RAM, DB queries, API latency, error rates
- Sentry: error tracking frontend + backend
- Uptime monitoring: Uptime Kuma
- Alerting: Slack/Discord notifications na downtime / error spike

---

## 19. Bezpieczeństwo

### Infrastruktura

| Warstwa | Mechanizm |
|---------|-----------|
| Transport | HTTPS everywhere (Traefik + Let's Encrypt) |
| DDoS | Cloudflare proxy |
| Headers | Helmet.js (CSP, HSTS, X-Frame-Options, etc.) |
| Rate limiting | Redis-based, per IP + per user + per API key |
| Firewall | UFW + fail2ban na serwerze |

### Aplikacja

| Warstwa | Mechanizm |
|---------|-----------|
| Auth | Bcrypt/Argon2 hashing, JWT + Refresh Tokens (httpOnly cookies) |
| 2FA | TOTP (Google Authenticator), backup codes |
| CSRF | CSRF tokens na form submissions |
| XSS | DOMPurify (user content), Content Security Policy |
| SQL Injection | Prisma ORM (parameterized queries) |
| File Upload | MIME type validation, size limits, malware scan (ClamAV) |
| Input validation | Zod schemas (shared client/server) |
| Permissions | CASL.js (attribute-based access control) |

### Compliance

| Regulacja | Implementacja |
|-----------|---------------|
| **GDPR** | Data export, data deletion, consent management, DPA |
| **Cookie consent** | Banner z kategoriami (necessary, analytics, marketing) |
| **Audit logging** | Wszystkie admin actions logowane |
| **Data encryption** | At rest (PostgreSQL) + in transit (TLS) |
| **Backup** | Daily automated, encrypted, off-site (Hetzner Storage Box) |

### Praktyki

- Dependency scanning: `npm audit`, Snyk, Dependabot
- Security headers audit: securityheaders.com (cel: A+)
- Penetration testing: przed launch (Faza 1 complete)
- Incident response plan: dokumentacja procedur
- Secrets management: .env (never committed), Coolify secrets

---

## 20. Plan implementacji

### Faza 1 — MVP Core Web (12 tygodni)

> **Web-first approach.** Pełna funkcjonalność webowa (Next.js) + API (NestJS) od Sprint 1. Responsive design — działa na desktop i mobile browser.

#### Sprint 1 (Tydzień 1-2): Fundament

- [ ] Monorepo setup (Turborepo + pnpm workspaces)
- [ ] Docker Compose: PostgreSQL, Redis, MinIO, Meilisearch, imgproxy
- [ ] NestJS boilerplate: auth module, users module, config, Swagger/OpenAPI spec
- [ ] Prisma schema: User, Community, CommunityMember
- [ ] Next.js project setup: App Router, Tailwind CSS 4, shadcn/ui, Zustand, TanStack Query
- [ ] Auth pages: login, register, reset password (Server + Client Components)
- [ ] App shell layout: sidebar (desktop), header, responsive navigation
- [ ] CI/CD pipeline (GitHub Actions → Coolify deploy)
- [ ] WebSocket infrastructure (Socket.io) — bazowy setup
- [ ] Helmet.js, CORS, rate limiting setup (NestJS)
- [ ] Dark/Light mode (CSS Custom Properties + next-themes)

#### Sprint 2 (Tydzień 3-4): Core Social

- [ ] Spaces CRUD + SpaceGroups
- [ ] Post CRUD z Tiptap editor (rich text, mentions, embeds, code blocks)
- [ ] Activity Feed: globalny + per space (infinite scroll, TanStack Query + cursor pagination)
- [ ] Reactions + Comments (threading, zagnieżdżone)
- [ ] File upload flow (presigned URLs → MinIO)
- [ ] Image optimization (next/image + imgproxy integration)
- [ ] Responsive testing: mobile (375px) → tablet (768px) → desktop (1440px)

#### Sprint 3 (Tydzień 5-6): Communication

- [ ] Direct Messages (1:1, real-time via Socket.io)
- [ ] Group Chat
- [ ] Online presence (presence system via Redis)
- [ ] Read receipts, typing indicators
- [ ] In-app notifications (bell, dropdown, mark read)
- [ ] Email notifications (Nodemailer + MJML templates)

#### Sprint 4 (Tydzień 7-8): Groups & Events

- [ ] Groups CRUD (public/private/hidden)
- [ ] Group feeds + membership management
- [ ] Events CRUD + RSVP
- [ ] Calendar view (month, week, list)
- [ ] Event reminders (email + push + in-app)
- [ ] iCal export

#### Sprint 5 (Tydzień 9-10): Admin & Search

- [ ] Admin panel: dashboard (metryki, Recharts), user management
- [ ] Content moderation queue
- [ ] Global search (Meilisearch integration) + Cmd+K command palette
- [ ] Member directory + filters
- [ ] Profile customization (custom fields, social links)
- [ ] White-label: branding settings (logo, colors, font — CSS Custom Properties)

#### Sprint 6 (Tydzień 11-12): Polish & Deploy

- [ ] Performance optimization (Core Web Vitals, Lighthouse audit, bundle analysis)
- [ ] Security audit (auth flows, permissions, API, CSP headers)
- [ ] Error handling + fallbacks (error boundaries, loading states, Skeleton UI)
- [ ] Seed database z realistycznym contentem
- [ ] Deployment: Next.js → Coolify (standalone Node.js), API → Coolify
- [ ] Dokumentacja API (Swagger)
- [ ] PWA setup (manifest, service worker dla add-to-homescreen)
- [ ] SEO: meta tags, OG images, sitemap, robots.txt

### Faza 1.5 — Monetyzacja & Rozszerzenia (6 tygodni)

#### Sprint 7-8 (Tydzień 13-16): Monetyzacja + LMS

- [ ] Stripe integration (subscriptions, one-time)
- [ ] Membership levels + paywalls
- [ ] Courses MVP: builder, modules, lessons, progress
- [ ] Video hosting integration (Bunny Stream)
- [ ] Gamification: punkty, leaderboard, odznaki

#### Sprint 9 (Tydzień 17-18): Plugin System

- [ ] Plugin SDK (TypeScript)
- [ ] Plugin registry + lifecycle (install, activate, deactivate)
- [ ] Plugin API: hooks, routes, sidebar items, settings
- [ ] 2-3 oficjalne wtyczki (Courses, Gamification, Shop basics)
- [ ] Plugin marketplace UI (admin panel)

### Faza 2 — Mobile App (React Native) (10 tygodni)

- [ ] React Native + Expo setup (Expo Router, NativeWind, shared packages)
- [ ] Auth screens (login, register) — reuse shared Zod schemas + API client
- [ ] Feed (czytanie, reagowanie, komentowanie)
- [ ] Chat / DM (Socket.io reuse z web)
- [ ] Push notifications (Expo Notifications + FCM/APNs)
- [ ] Offline basics (MMKV local cache)
- [ ] App Store submission (iOS) + Play Store submission (Android)
- [ ] Deep linking (universal links iOS, app links Android)

### Faza 3 — Advanced & Scale (12 tygodni)

- [ ] Automation engine (workflow builder)
- [ ] Discovery engine (katalog społeczności)
- [ ] AI features: moderacja, matching, search, assistant
- [ ] Advanced analytics
- [ ] Webhook system
- [ ] Desktop app (PWA enhanced lub Tauri 2 — opcjonalnie)
- [ ] Live streaming (WebRTC / RTMP)
- [ ] Own video pipeline (FFmpeg + HLS)
- [ ] Self-hosted AI models
- [ ] Developer portal + docs
- [ ] Public API v1 launch
- [ ] Plugin marketplace (full UI + NestJS marketplace API)

---

## 21. Model biznesowy

> **Szczegółowa analiza modelu dystrybucji:** `08_finanse/model sprzedazy.md`

### Model dystrybucji: Hybrid SaaS-first

**Domyślnie:** Managed SaaS (Hubso Cloud) — klient tworzy konto, wybiera plan, buduje społeczność w 5 minut.  
**Opcjonalnie (Faza 2+):** Self-hosted z roczną licencją + wymagany klucz API Hubso (marketplace, AI, updates, weryfikacja licencji).

```
┌─────────────────────────────────────────────────────────┐
│                    HUBSO.SOCIAL                          │
├─────────────────────────┬───────────────────────────────┤
│   ☁️ Hubso Cloud (SaaS)  │   🏠 Self-hosted (Faza 2+)   │
│   95% klientów           │   5% klientów                │
│   Nasze serwery          │   Serwery klienta            │
│   Zero DevOps            │   Docker + Coolify/k8s       │
│   Subskrypcja/mies.      │   Licencja roczna + API key  │
│   Auto updates           │   Self-managed updates       │
├─────────────────────────┴───────────────────────────────┤
│     PLUGIN MARKETPLACE + AI + ZERO TRANSACTION FEES     │
└─────────────────────────────────────────────────────────┘
```

### Pricing — Hubso Cloud (SaaS)

| Plan | Cena | Members | Zawiera |
|------|------|---------|--------|
| **Free** | $0/mies. | do 50 | Core features, hubso.social subdomena, basic branding |
| **Pro** | $29/mies. | do 1,000 | Custom domain, white-label, basic AI, 10GB storage |
| **Business** | $79/mies. | do 10,000 | Advanced AI, automation, analytics, 100GB storage, priority support |
| **Enterprise Cloud** | Custom | Unlimited | Dedicated infra, SLA 99.99%, custom dev, onboarding, SSO/SAML |

### Pricing — Self-Hosted (Faza 2+)

| Plan | Cena | Zawiera |
|------|------|--------|
| **Self-Hosted Pro** | $499/rok | Licencja, updates, marketplace access, community support |
| **Self-Hosted Enterprise** | Custom | Source access, priority support, custom SLA, dedicated account manager |

> **Wymóg:** Self-hosted wymaga aktywnego klucza API Hubso do: weryfikacji licencji, dostępu do Plugin Marketplace, AI features, automatycznych aktualizacji.

### Revenue Streams

| Źródło | Model | Prognoza % (rok 1 → rok 3) |
|--------|-------|----------------------------|
| **SaaS subscriptions** | MRR | 70% → 55% |
| **Plugin marketplace** | 30% rev share | 5% → 15% |
| **Self-hosted licenses** | ARR | 5% → 12% |
| **AI usage (overage)** | Pay-per-use | 10% → 10% |
| **Professional services** | One-time | 8% → 3% |
| **Certyfikacje** | One-time | 2% → 5% |

### Roadmap dystrybucji

| Faza | Timeline | Model |
|------|----------|-------|
| **Faza 1 (MVP)** | Miesiąc 1-3 | Tylko SaaS — Hubso Cloud (Hetzner/Coolify), Free + Pro plan, Next.js Web (SPA + SSR) |
| **Faza 1.5** | Miesiąc 4-5 | + Plugin Marketplace, Business plan, AI pay-per-use |
| **Faza 2** | Miesiąc 6-9 | + React Native mobile (iOS + Android) + Self-hosted Docker image, license/API key system |
| **Faza 3** | Miesiąc 10+ | + Enterprise Cloud + Enterprise Self-Hosted, Kubernetes helm chart |

### Zasada: Zero Transaction Fees

Hubso **nie pobiera prowizji od transakcji** wewnątrz społeczności (membership, courses, shop). Opłaty tylko ze strony payment processora (Stripe: 2.9% + 30¢).

---

## 22. Metryki sukcesu

### North Star Metric

**Weekly Active Communities (WAC)** — ile społeczności ma ≥1 aktywnego członka tygodniowo.

### Metryki produktowe

| Metryka | Cel (6 mies. po launch) |
|---------|--------------------------|
| Active communities | 100 |
| Total members (across all) | 10,000 |
| DAU/MAU ratio | ≥ 30% |
| Average session duration | ≥ 8 min |
| Posts per community per week | ≥ 10 |
| NPS (Net Promoter Score) | ≥ 40 |
| Churn rate (monthly) | ≤ 5% |
| Plugin installs | ≥ 500 total |

### Metryki techniczne

| Metryka | Cel |
|---------|-----|
| Uptime | ≥ 99.9% |
| TTFB | < 200ms |
| LCP | < 2.5s |
| Error rate | < 0.1% |
| API p95 latency | < 300ms |
| Deploy frequency | ≥ 3/tydzień |
| Security incidents | 0 critical |

---

## 23. Ryzyka i mitygacja

| # | Ryzyko | Prawdopodobieństwo | Impact | Mitygacja |
|---|--------|---------------------|--------|-----------|
| 1 | **Scope creep** — za dużo features w MVP | Wysokie | Wysoki | Strict MVP definition, cut ruthlessly, iterate |
| 2 | **Performance na scale** — PostgreSQL bottleneck | Średnie | Wysoki | Read replicas, PgBouncer, cursor pagination, Redis cache |
| 3 | **Koszty AI** — OpenRouter bills przy dużym usage | Średnie | Średni | Usage limits, tiered AI, self-hosted models docelowo |
| 4 | **Plugin security** — malicious plugins | Niskie | Wysoki | Sandboxing, code review, permissions system, marketplace moderation |
| 5 | **Konkurencja** — Circle/Skool copy features | Średnie | Średni | Speed of execution, niche focus (self-hosted + AI + modularity) |
| 6 | **One-person team bottleneck** | Wysokie | Wysoki | AI-assisted development, prioritize ruthlessly, hire early |
| 7 | **Video hosting costs** — storage + bandwidth | Średnie | Średni | Start z Bunny Stream, migrate to own pipeline, Cloudflare R2 |
| 8 | **GDPR compliance gaps** | Niskie | Wysoki | Legal review przed launch, data processing agreements, DPO |

---

## 24. Zasady dla developera / AI

1. **Schema first** — Prisma schema jest fundamentem. Najpierw schema, potem API (NestJS), potem frontend (Next.js).
2. **API-first** — każdy moduł najpierw jako endpoint REST/GraphQL (OpenAPI spec), potem React UI.
3. **MVP = Auth + Spaces + Posts + Feed + Chat + Notifications + Admin** — reszta iteracyjnie.
4. **Web-first (Circle.so approach)** — 100% feature'ów na Next.js. Mobile (React Native, Faza 2) to companion app ~70% feature'ów.
5. **Server Components domyślnie** — `'use client'` tylko gdy potrzebne (useState, useEffect, event handlers, Zustand, TanStack Query).
6. **SPA + SSR hybrid** — strony publiczne SSR/SSG (SEO), strony zalogowane CSR (szybka nawigacja, TanStack Query cache).
7. **Feature-based architecture** — `src/app/(dashboard)/`, `src/components/feed/`, `src/lib/hooks/` — logiczna organizacja.
8. **Kod < 300 linii per plik** — refaktoryzuj wcześnie.
9. **Testy** — Vitest dla logiki, Testing Library dla komponentów, Playwright dla E2E.
10. **Real-time od początku** — WebSocket setup w Sprint 1, nawet jeśli używany w Sprint 3.
11. **Type-safety end-to-end** — Zod schemas shared (packages/shared); TypeScript strict mode everywhere.
12. **Nie mockuj danych** — seed database realnym contentem.
13. **Docker multi-stage builds** — upewnij się że obrazy budują się poprawnie.
14. **Nie nadpisuj .env** — zawsze pytaj przed zmianą.
15. **Brandbook = źródło prawdy** — `03_ui/brandbook.md` to design bible.
16. **Solar Icons only** — zero emoji jako ikony UI, zero random icon sets. Iconify Solar Icons set.
17. **Dark mode = first-class** — CSS Custom Properties + next-themes. Każdy komponent musi działać w obu trybach.
18. **Tailwind utility-first** — unikaj custom CSS, korzystaj z design tokens. shadcn/ui jako baza komponentów.
19. **Plugin architecture od początku** — nawet core modules powinny być plugin-like w strukturze.
20. **Git workflow** — feature branches, PR review, semantic commits, changelog.
21. **Performance budget** — LCP < 2.5s, CLS < 0.1, bundle < 200KB initial JS. Lighthouse audit regularnie.
22. **Zustand + TanStack Query** — Zustand dla client state, TanStack Query dla server state. Nie mieszaj.
23. **Demo HTML = źródło UI** — 19 stron HTML demo (`03_ui/demo-platofrmy-dr-bartek/`) to wizualna specyfikacja. Konwertuj HTML+Tailwind → JSX+Tailwind ~1:1.
24. **Shared packages** — TypeScript types, Zod schemas, API client w `packages/shared` — reuse między web, mobile, API.

---

## 25. Narzędzia AI-assisted development

Projekt korzysta z ekosystemu narzędzi AI wspomagających development. Konfiguracja jest częścią repozytorium.

### MCP Servers (Model Context Protocol)

MCP pozwala AI asystentom (GitHub Copilot, Claude Code) na bezpośredni dostęp do zewnętrznych narzędzi i dokumentacji.

| MCP Server | Pakiet | Zastosowanie |
|------------|--------|-------------|
| **shadcn** | `shadcn@latest mcp` | Przeglądanie, wyszukiwanie i instalacja komponentów shadcn/ui przez AI, dostęp do registry |
| **Context7** | `@upstash/context7-mcp` | Aktualna dokumentacja bibliotek (Next.js, NestJS, Prisma, React Native itp.) w kontekście AI |

Konfiguracja:
- **VS Code (GitHub Copilot):** `.vscode/mcp.json`
- **Claude Code:** `.mcp.json`

### Agentic Skills (60 skilli)

Zestaw 60 specjalistycznych umiejętności z [antigravity-awesome-skills](https://github.com/anthropics/antigravity-awesome-skills) dostępnych w `.claude/skills/` jako symlinki. Pokrywają:

| Kategoria | Przykładowe skille |
|-----------|-------------------|
| Frontend Web | `nextjs-best-practices`, `react-patterns`, `tailwind-patterns`, `zustand-store-ts` |
| Mobile | `react-native-architecture`, `expo-deployment`, `mobile-design` |
| Backend | `nestjs-expert`, `graphql-architect`, `bullmq-specialist`, `nodejs-best-practices` |
| Database | `prisma-expert`, `postgresql`, `database-architect` |
| Testing | `playwright-skill`, `testing-patterns`, `tdd-workflow`, `e2e-testing-patterns` |
| Infrastruktura | `docker-expert`, `monorepo-architect`, `turborepo-caching` |
| Bezpieczeństwo | `security-auditor`, `api-security-best-practices` |
| Architektura | `software-architecture`, `clean-code`, `architecture-decision-records` |

### Instrukcje per narzędzie

| Narzędzie | Plik konfiguracyjny | Zawartość |
|-----------|--------------------|-----------|
| **Claude Code** | `CLAUDE.md` + `.claude/skills/` | Auto-ładowany kontekst projektu + 60 skilli |
| **VS Code Copilot** | `.github/copilot-instructions.md` + `.vscode/settings.json` | Instrukcje code generation, review, testów, commitów |
| **MCP (oba)** | `.vscode/mcp.json` + `.mcp.json` | shadcn + Context7 MCP servers |

---

*PRD v4.1 — Hubso.social — Luty 2026*  
*Stack: Next.js 15 (Web, SPA + SSR) + React Native (Mobile, Faza 2) + NestJS + PostgreSQL*  
*Następna rewizja: po zakończeniu Sprint 1*
