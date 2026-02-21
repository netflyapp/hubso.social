# Rekomendacje narzędzi — hubso.social

> Data: 21 lutego 2026  
> **Stack:** Next.js 15 (Web, SPA + SSR) + React Native (Mobile, Faza 2) + NestJS + PostgreSQL

---

## 🖥️ Wymagane oprogramowanie (zainstaluj na Macu)

### Fundamenty — MUSISZ MIEĆ

| # | Co zainstalować | Jak | Po co | Rozmiar |
|---|----------------|-----|-------|---------|
| 1 | **Homebrew** | `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"` | Menadżer pakietów macOS — instaluje resztę | ~500 MB |
| 2 | **Node.js 22 LTS** | `brew install node@22` | Next.js, NestJS, narzędzia buildowe | ~100 MB |
| 3 | **pnpm** | `brew install pnpm` | Menadżer pakietów Node.js (fast, disk-efficient) | ~20 MB |
| 4 | **Docker Desktop** | `brew install --cask docker` | Backend: PostgreSQL, Redis, MinIO, Meilisearch | ~2 GB |
| 5 | **VS Code** | Już masz | IDE — z rozszerzeniami | — |
| 6 | **Chrome** | Już masz | Debugging, React DevTools, Lighthouse | — |
| 7 | **Git** | Wbudowany (macOS) lub `brew install git` | Version control | — |

> **Łączny rozmiar:** ~3 GB. Dużo mniej niż przy Flutter (nie potrzebujesz Xcode, Android Studio, SDK).

### Opcjonalnie (Faza 2 — React Native)

| # | Co zainstalować | Kiedy | Po co |
|---|----------------|-------|-------|
| 1 | **Xcode** (z App Store) | Faza 2 (mobile) | iOS Simulator + build iOS (~12 GB) |
| 2 | **Android Studio** | Faza 2 (mobile) | Android Emulator + SDK (~3 GB) |
| 3 | **CocoaPods** | Faza 2 (mobile) | Zależności iOS |

### VS Code Extensions — ZAINSTALUJ

| Extension | ID | Po co |
|-----------|-----|------|
| **ESLint** | `dbaeumer.vscode-eslint` | Linting JavaScript/TypeScript |
| **Prettier** | `esbenp.prettier-vscode` | Formatowanie kodu |
| **Tailwind CSS IntelliSense** | `bradlc.vscode-tailwindcss` | Autocomplete klas Tailwind, preview kolorów |
| **Error Lens** | `usernamehw.errorlens` | Inline errors/warnings |
| **GitLens** | `eamodio.gitlens` | Git integration |
| **Docker** | `ms-azuretools.vscode-docker` | Docker management |
| **Prisma** | `Prisma.prisma` | Prisma schema highlighting |
| **REST Client** | `humao.rest-client` | Testowanie API endpointów |
| **shadcn/ui** | `rajshirolkar.shadcn-ui-snippets` | Snippety komponentów shadcn/ui |

### Jak uruchomić Next.js — development

```bash
# 1. Sklonuj repo i zainstaluj zależności
git clone <repo-url> hubso
cd hubso
pnpm install

# 2. Uruchom infra (Docker)
docker compose -f docker/docker-compose.dev.yml up -d

# 3. Uruchom dev server (Next.js)
cd apps/web
pnpm dev          # → http://localhost:3000

# 4. Uruchom backend (NestJS)
cd apps/api
pnpm dev          # → http://localhost:3001
```

### Hot Reload = natychmiastowy podgląd

Next.js ma **Fast Refresh** — zmiany w kodzie React widać **natychmiast** (<1s) w przeglądarce. Zachowuje state komponentów. Działa z `pnpm dev`.

### Pierwszy setup — krok po kroku

```bash
# 1. Zainstaluj Node.js + pnpm + Docker
brew install node@22 pnpm
brew install --cask docker

# 2. Sprawdź wersje
node --version    # v22.x.x
pnpm --version    # 9.x.x
docker --version  # Docker Desktop

# 3. Zainstaluj Turborepo globally
pnpm add -g turbo

# 4. Stwórz projekt
pnpm create next-app@latest apps/web --typescript --tailwind --app --src-dir
cd apps/web
pnpm dev          # → otwiera się http://localhost:3000, działa!
```

### FAQ

| Pytanie | Odpowiedź |
|---------|-----------|
| **Czy potrzebuję Xcode od razu?** | **NIE** — Xcode tylko w Fazie 2 (React Native mobile). Web development nie wymaga Xcode. |
| **Czy potrzebuję Android Studio?** | **NIE** — tylko w Fazie 2. Cały web development to Node.js + przeglądarka. |
| **Ile RAM potrzebuję?** | Min 8 GB (wygodnie 16 GB). Next.js + Docker jest lżejszy niż Flutter + emulatoria. |
| **Jak testować mobile bez telefonu?** | Chrome DevTools → Device Mode (responsive preview). W Fazie 2: iOS Simulator + Android Emulator. |
| **Czy mogę deployować z Docker?** | TAK — Next.js standalone build w Docker container → Coolify/Hetzner. |

---

## ✅ Co już mam (posiadam / opłacone)

### Narzędzia & Subskrypcje

| Kategoria | Narzędzie | Typ | Pokrywa |
|-----------|-----------|-----|---------|
| **Design** | Figma Pro | Subskrypcja | Prototypy, handoff, design tokens, pliki white-label dla klientów |
| **Design** | Canva | Subskrypcja | Grafiki marketingowe, social media posty, prezentacje |
| **AI Coding** | GitHub Copilot (VSC) | Subskrypcja | Autouzupełnianie kodu, generowanie komponentów w edytorze |
| **AI Coding** | Claude Code (terminal) | Subskrypcja | Konwersja demo HTML → Next.js/React, refaktory, architektura — zastępuje v0.dev |
| **AI Grafika** | Kie.ai | Subskrypcja | Generowanie grafik, ikon, ilustracji (różne modele AI) |
| **Testing** | Playwright MCP | Darmowe | E2E testy — podłączony jako MCP do VSC |

### Zasoby w projekcie

| Zasób | Lokalizacja | Co zawiera |
|-------|-------------|------------|
| **Brandbook** | `03_ui/brandbook.md` | Kompletny design system — kolory, typografia, komponenty, spacing |
| **Demo HTML** | `03_ui/demo-platofrmy-dr-bartek/` | **19 kompletnych widoków platformy** (~7 500 linii HTML + Tailwind CDN), ~40 unikalnych wzorów UI, dark mode, responsive — patrz audyt poniżej |
| **ShadCnKit** | `03_ui/ShadCnKit/` | Bazowe komponenty shadcn/ui (.fig + Next.js starter) — **użyjemy bezpośrednio** (shadcn/ui = nasz komponent system) |
| **Magic UI Pro** | `03_ui/Magic-UI-Pro-5-2025/` | 14 Page Sections (Hero, CTA, Pricing, FAQ...) + 6 Templates (SaaS, Portfolio, Agent, Mobile, DevTool, Startup) |
| **UI/UX Pro Max** | `03_ui/ui-ux-pro-max-skill-main/` | AI skill — 67 stylów UI, 100 reguł reasoning, generator design systemów. Zainstalowany jako Copilot Skill |
| **Dokumentacja** | `01_plan/` | PRD, architektura, technologia, konkurencja |
| **App** | `02_app/` | Szkielet aplikacji (w trakcie) |

### Audyt demo platformy (`demo-platofrmy-dr-bartek/`)

> **Ocena jakości: 7.5/10** — spójny design system, kompletny dark mode, responsive. **~80% kodu HTML+Tailwind jest bezpośrednio reusable w Next.js** (HTML → JSX, klasy Tailwind zostają). Konwersja ~1:1.

#### 19 gotowych stron

| # | Plik | Opis |
|---|------|------|
| 1 | `index.html` | **Kanał aktywności** — 3-kolumnowy layout, feed, widgety (profil, wyzwanie 30-dniowe, blog) |
| 2 | `home.html` | **Oś czasu** — uproszczony feed 1-kolumnowy z composerami postów |
| 3 | `profile.html` | **Profil** — cover, bio, statystyki, 10 tabów (Timeline, Info, Connections, Groups, Photos, Docs, Courses, Badges, Affiliate) |
| 4 | `courses.html` | **Kursy** — 13 kursów (kohortowy + ebook + video), filtry, widok grid/list |
| 5 | `course-detail.html` | **Szczegóły kursu** — 4 moduły accordion, progress, podgląd lekcji, osiągnięcia |
| 6 | `messages.html` | **Wiadomości** — split-panel chat, lista konwersacji, bąbelki, typing indicator |
| 7 | `shop.html` | **Sklep** — 15 produktów z cenami PLN, filtry kategorii, siatka 3-kolumnowa |
| 8 | `events.html` | **Wydarzenia** — 8 wydarzeń (LIVE Q&A, wyzwania, webinary), mini-kalendarz |
| 9 | `forums.html` | **Forum** — 5 kategorii (Dieta, Suplementacja, Aktywność, Zdrowie Psychiczne, Feedback) |
| 10 | `groups.html` | **Grupy** — 6 grup (publiczne, Premium, Kohortowa) |
| 11 | `group-detail.html` | **Szczegóły grupy** — cover, 5 tabów (Feed/Members/Photos/Discussions/Info) |
| 12 | `apps.html` | **Aplikacje** — kalkulator BMI, WHR, kalorie (DZIAŁAJĄCY JS!), AI planer, quiz |
| 13 | `health-journal.html` | **Dziennik zdrowia** — formularz, historia 7 dni, AI sugestie |
| 14 | `recipes.html` | **Przepisy** — 9 kart z info kalorycznym, tagi dietetyczne |
| 15 | `video.html` | **Video** — featured + lista, transkrypcja, AI chatbot |
| 16 | `documents.html` | **Dokumenty** — tabela 15 ebooków, 3 checklisty, 3 poradniki |
| 17 | `photos.html` | **Zdjęcia** — 4 albumy + galeria 15 zdjęć, paginacja |
| 18 | `notifications.html` | **Powiadomienia** — grupowane (dziś/wczoraj/tydzień), filtrowanie |
| 19 | `members.html` | **Członkowie** — ranking TOP 5 z odznakami/streakami, 9 kart członków |

#### ~40 unikalnych komponentów UI

Post card, post composer, course card, product card, recipe card, group card, member card, event card, forum thread row, notification item, photo grid, album card, chat conversation, chat bubble, video list item, document table row, checklist card, health journal form, history table, kalkulator (BMI/WHR/Calorie), AI meal planner, quiz widget, shopping list, profile cover, tab system, badge card, affiliate dashboard, leaderboard, progress circle (SVG), challenge widget, AI suggestion panel, AI chatbot, transcription panel, mini calendar, filter pills/tabs.

#### Mocne strony
- Spójny design system — jednolite karty, cienie, border-radius, typografia
- Pełny dark mode (class-based + localStorage)
- Responsive (sm/md/lg/xl breakpoints)
- Tailwind custom config (brand colors, custom shadows)
- Semantyka kolorów (emerald=brand, violet=AI, red=LIVE, amber=wyzwania)
- Mikro-interakcje (hover, transitions, animate-pulse)
- Prawdziwe dane (realne kursy, ceny PLN, treści zdrowotne)
- Działający JS na apps.html (kalkulatory BMI, WHR, kalorie)

#### Czego brakuje (do zbudowania w Next.js)

| Brakujące | Trudność |
|-----------|----------|
| Auth pages (login, rejestracja, reset hasła) | Łatwe — shadcn/ui Form + Zod |
| Ustawienia / Settings | Łatwe — shadcn/ui Tabs + Forms |
| Admin panel / Dashboard twórcy | Średnie — Recharts + shadcn/ui Table |
| Koszyk / Checkout / Potwierdzenie | Łatwe — 2-3 strony |
| Wyniki wyszukiwania | Łatwe |
| Strony błędów (404, 500) | Trywialne — Next.js not-found.tsx / error.tsx |
| Onboarding / Welcome flow | Średnie — multi-step form (shadcn/ui Steps) |
| Loading / skeleton states | shadcn/ui Skeleton |
| Empty states | Kie.ai wygeneruje ilustracje, SVG w React |
| Error states (form validation) | Wbudowane w React Hook Form + Zod |
| Bottom sheets / dialogi | shadcn/ui Sheet + Dialog |
| Mobile drawer / navigation | shadcn/ui Sheet + Sidebar |
| Odtwarzacz video | ReactPlayer / Plyr |
| Rich text editor | Tiptap |
| Upload plików | react-dropzone + TanStack Query upload |

#### Bugi do naprawienia w demo
- `notifications.html` linie 222, 268 — zepsuty `<img src>` (escaped cudzysłowy)
- `group-detail.html` — treść o kawie zamiast tematyki zdrowotnej
- Niespójne ścieżki avatarów (mix `/media/` vs `media/`)

#### Werdykt

> **Demo jest WYSTARCZAJĄCE jako baza kodu platformy.** Pokrywa ~90% typowej platformy community. **~80% HTML+Tailwind konwertuje się bezpośrednio do JSX+Tailwind** (~1:1). Przenieś: layout HTML → JSX, klasy Tailwind (zostają!), design tokens (kolory, cienie, border-radius), struktury danych. Refaktoruj na: React Server Components, shadcn/ui, composable pieces.

---

### Podsumowanie — co pokrywam BEZ dodatkowych zakupów

| Potrzeba | Pokryte przez | Dodatkowy zakup? |
|----------|---------------|------------------|
| Prototypy & Design | Figma Pro | ❌ Nie |
| Generowanie komponentów React | Claude Code + Copilot | ❌ Nie (zastępuje v0.dev) |
| Animowane sekcje (landing, SaaS) | Magic UI Pro (14 sekcji + 6 templates) | ❌ Nie |
| UI Blocks & komponenty | ShadCnKit + shadcn/ui (bezpośrednio używamy!) | ❌ Nie |
| **Platforma (app UI)** | **Demo HTML (19 stron, ~40 komponentów) — ~80% reusable** | **❌ Nie** |
| Grafiki & ilustracje | Kie.ai + Canva | ❌ Nie |
| Testing E2E | Playwright MCP | ❌ Nie |
| Design intelligence | UI/UX Pro Max Skill | ❌ Nie |

---

## Co jeszcze dokupić / skonfigurować

### 1. Komponenty & UI Blocks

| Pakiet | Cena | Po co | Priorytet |
|--------|------|-------|-----------|
| **TailGrids** | Darmowe (open source) | 500+ komponentów Tailwind — **przydatne do landing page i app UI** (Next.js + Tailwind = bezpośrednio używamy) | 🟢 Wysoki |

> **Ocena:** Demo HTML pokrywa UI platformy (~90%) i **~80% konwertuje się bezpośrednio do JSX+Tailwind**. TailGrids = dodatkowe bloki do uzupełnienia. shadcn/ui = bazowe komponenty.

### 2. Ikony & Ilustracje

Mamy Solar Icons (brandbook) + Kie.ai (generowanie). Uzupełnienie:

| Zasób | Cena | Po co |
|-------|------|-------|
| **Lucide Icons** | Darmowe | Domyślny set shadcn/ui — mamy go automatycznie |
| **Boring Avatars** | Darmowe | Generowane avatary dla użytkowników bez zdjęcia → [boringavatars.com](https://boringavatars.com) |
| **Illustrations (undraw)** | Darmowe | Empty states, onboarding, error pages — SVG ilustracje |
| **Solar Icons Pro** | $30 | Pełny zestaw (2000+ ikon) — opcjonalnie, jeśli darmowy podzbiór nie wystarczy |

### 3. MCP — warto podłączyć

| MCP | Po co | Priorytet |
|-----|-------|-----------|
| **Figma MCP** | Odczyt komponentów z Figma → generowanie kodu React bezpośrednio z designu | 🔴 Wysoki |
| **Firecrawl MCP** | Scraping stron konkurencji, research UI patterns | 🟡 Średni |
| **GitKraken/Git MCP** | Git workflow z AI — commits, branches, PR review | 🟡 Średni |

> **Rekomendacja:** Figma MCP to game-changer. Masz Figma Pro → podłącz MCP → Claude Code / Copilot czyta Twoje projekty Figma i generuje komponenty 1:1.

### 4. Dev Tools (darmowe — skonfiguruj)

| Narzędzie | Po co |
|-----------|-------|
| **React DevTools** | Profiling, component tree, state inspection — rozszerzenie Chrome |
| **Storybook** | Katalog komponentów React — testuj każdy komponent w izolacji |
| **Chromatic** | Visual regression testing — screenshot comparison (Storybook integration) |
| **ESLint + Prettier** | Strict lint rules + formatowanie — spójny kod |
| **@typescript-eslint** | TypeScript-specific lint rules (strict mode) |

### 5. Email & Komunikacja

| Narzędzie | Cena | Po co |
|-----------|------|-------|
| **MJML** + **Nodemailer** | Darmowe | Email templates — server-side w NestJS |
| **Resend** | Darmowe (do 3000/mies.) | Wysyłka emaili — API, integracja z NestJS |

### 6. Media & Storage

| Narzędzie | Cena | Po co |
|-----------|------|-------|
| **MinIO** | Darmowe (self-hosted) | S3-compatible storage — pliki, obrazy, wideo |
| **imgproxy** | Darmowe (self-hosted) | Transformacje obrazów on-the-fly (resize, WebP, crop) |
| **Cloudinary** | Darmowe (25GB) | Alternatywa dla imgproxy — CDN + transformacje |

### 7. Video Hosting

| Narzędzie | Cena | Po co | Faza |
|-----------|------|-------|------|
| **Bunny Stream** | ~$5/mies. base + $0.005/min | Transkodowanie + CDN out-of-box, zero DevOps wideo | Faza 1 |
| **FFmpeg** (via BullMQ) | Darmowe (self-hosted) | Własny pipeline: MP4 → HLS (1080p/720p/480p/360p) | Faza 2 |
| **Video.js / Plyr** | Darmowe | Player HLS, adaptive bitrate, custom skin | Faza 1 |
| **Hetzner Object Storage** | €5/TB/mies. | Storage dla wideo (S3-compatible) | Faza 2 |
| **Cloudflare R2** | $0.015/GB, zero egress | Alternatywa storage — zero opłat za transfer | Faza 2 |

### 8. Monitoring & Observability

| Narzędzie | Cena | Po co | Priorytet |
|-----------|------|-------|----------|
| **Sentry** | Darmowe (do 5K events/mies.) lub self-hosted | Error tracking frontend + backend | 🔴 Sprint 6 |
| **Grafana + Prometheus + Loki** | Darmowe (self-hosted, Docker) | Dashboardy: CPU, RAM, DB queries, API latency, error rates | 🟡 Deploy |
| **Uptime Kuma** | Darmowe (self-hosted, Docker: `louislam/uptime-kuma`) | Uptime monitoring + alerting (Slack/Discord) | 🟡 Deploy |
| **Pino + pino-pretty** | Darmowe (`pnpm add pino pino-pretty` w api/) | Structured JSON logging w NestJS | 🔴 Sprint 1 |

### 9. Security (NestJS backend)

| Narzędzie | Cena | Po co | Priorytet |
|-----------|------|-------|----------|
| **Helmet.js** | Darmowe (`pnpm add @nestjs/helmet helmet` w api/) | Security headers: CSP, HSTS, X-Frame-Options | 🔴 Sprint 1 |
| **ClamAV** | Darmowe (self-hosted, Docker) | Malware scan uploadów plików | 🟡 Faza 1.5 |
| **rate-limiter-flexible** | Darmowe | Redis-based rate limiting per IP/user/API key | 🔴 Sprint 1 |

### 10. Pakiety npm — do zainstalowania przy starcie dev

#### apps/web (Next.js)

| Pakiet | Komenda | Po co |
|--------|---------|-------|
| **next-themes** | `pnpm add next-themes` | Dark/Light mode z CSS Custom Properties |
| **sonner** | `pnpm dlx shadcn@latest add sonner` | Toast notifications (shadcn/ui) |
| **recharts** | `pnpm add recharts` | Wykresy dashboardów, analytics |
| **framer-motion** | `pnpm add framer-motion` | Animacje, layout transitions |
| **@iconify/react** | `pnpm add @iconify/react` | Solar Icons via Iconify |
| **tiptap** | `pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-mention` | Rich text editor |
| **socket.io-client** | `pnpm add socket.io-client` | WebSocket client (real-time) |

#### apps/api (NestJS)

| Pakiet | Komenda | Po co |
|--------|---------|-------|
| **pino + pino-pretty** | `pnpm add pino pino-pretty nestjs-pino` | Structured JSON logging |
| **@nestjs/helmet** | `pnpm add @nestjs/helmet helmet` | Security headers |
| **@nestjs/bullmq** | `pnpm add @nestjs/bullmq bullmq` | Background jobs |
| **socket.io** | `pnpm add @nestjs/websockets @nestjs/platform-socket.io socket.io` | WebSocket server |
| **casl** | `pnpm add @casl/ability @casl/prisma` | Permissions (ABAC) |

#### packages/shared

| Pakiet | Komenda | Po co |
|--------|---------|-------|
| **zod** | `pnpm add zod` | Shared validation schemas (frontend + backend) |

#### Dev dependencies (root)

| Pakiet | Komenda | Po co |
|--------|---------|-------|
| **vitest** | `pnpm add -D vitest @testing-library/react @testing-library/jest-dom` | Unit + component tests (zamiast Jest) |
| **playwright** | `pnpm add -D @playwright/test` | E2E testy |

---

## 💰 Zaktualizowany plan zakupów

### To co już masz oszczędza Ci ~$420+/rok

| Wcześniejsza rekomendacja | Koszt | Pokryte przez |
|---------------------------|-------|---------------|
| ~~Tailwind UI~~ | ~~$299~~ | Magic UI Pro + TailGrids (darmowe) |
| ~~v0.dev Pro~~ | ~~$20/mies.~~ | Claude Code + Copilot |
| ~~Figma Pro~~ | ~~$15/mies.~~ | Już masz |
| ~~Cursor IDE~~ | ~~$20/mies.~~ | Claude Code + Copilot (VSC) |
| ~~Generator grafik~~ | ~~varies~~ | Kie.ai |

### Jedyne sensowne zakupy (opcjonalne)

| Pakiet | Cena | Kiedy |
|--------|------|-------|
| **Solar Icons Pro** | $30 jednorazowo | Jeśli darmowy set nie wystarczy |
| **Apple Developer Program** | $99/rok | **WYMAGANY** do publikacji na App Store (Faza 2 — React Native) |
| **Google Play Developer** | $25 jednorazowo | **WYMAGANY** do publikacji na Play Store (Faza 2 — React Native) |

**Max wydatek: $154 (w tym $99/rok za Apple) — ale dopiero w Fazie 2 (mobile)**

### Darmowe — skonfiguruj teraz

| Priorytet | Co zrobić |
|-----------|-----------|
| 🔴 **Teraz** | `brew install node@22 pnpm` + `node --version` |
| 🔴 **Teraz** | `brew install --cask docker` → uruchom Docker Desktop |
| 🔴 **Teraz** | Zainstaluj VS Code extensions: Tailwind CSS IntelliSense + ESLint + Prettier + Prisma |
| 🔴 **Teraz** | Podłącz Figma MCP do VSC |
| 🔴 **Teraz** | Zainstaluj UI/UX Pro Max skill (jeśli jeszcze nie aktywowany) |
| 🟡 **Przy starcie dev** | `pnpm create next-app@latest` + Turborepo setup |
| 🟡 **Przy starcie dev** | Docker Compose: PostgreSQL + Redis + MinIO + Meilisearch + imgproxy |
| 🟡 **Przy starcie dev** | Zainstaluj pakiety npm (sekcja 10 powyżej) |
| 🟡 **Przy starcie dev** | Skonfiguruj Helmet.js + Pino + rate limiting (NestJS) |
| 🟡 **Przy starcie dev** | Skonfiguruj Storybook (katalog komponentów) |
| 🟡 **Przy starcie dev** | Skonfiguruj Resend (emails) |
| 🟡 **Przy starcie dev** | Załóż konto Bunny Stream (~$5/mies.) — video hosting |
| 🟢 **Przy CI/CD** | ESLint + Vitest + Playwright + GitHub Actions |
| 🟢 **Przy deploy** | Sentry + Grafana + Prometheus + Loki + Uptime Kuma (Docker) |
| 🟢 **Faza 2 (Mobile)** | Apple Developer Program ($99) + Google Play ($25) |

---

## 🔄 Zaktualizowany workflow

```
1. DESIGN
   brandbook.md → Figma Pro (prototypy, design tokens)
                → Canva (marketing, social media)
                → Realtime Colors (walidacja palety)

2. KONWERSJA demo → Next.js/React
   demo HTML (~80% reusable) → Claude Code (terminal: HTML → JSX + React Components)
                              → Copilot (VSC: dopracowanie komponentów)
                              → Figma MCP (odczyt designu → React code)
                              → shadcn/ui + Tailwind CSS (bazowe komponenty)

3. LANDING PAGE (zintegrowana w Next.js)
   Next.js App Router → Magic UI Pro (sekcje Hero, CTA, Pricing, FAQ)
                      → TailGrids (dodatkowe bloki, layouty)
                      → ShadCnKit (komponenty shadcn/ui)
                      → SSR/SSG dla SEO (Server Components)

4. GRAFIKA & MEDIA
   Kie.ai → generowanie ikon, ilustracji, grafik
   Canva → social media, banery, prezentacje
   imgproxy / MinIO → hosting + transformacje obrazów

5. DEVELOPMENT (Next.js — Web)
   VSC + Tailwind IntelliSense + Copilot + Claude Code
   → shadcn/ui + Tailwind CSS (komponenty)
   → next-themes (dark/light mode)
   → Zustand (client state)
   → TanStack Query v5 (server state + data fetching)
   → React Hook Form + Zod (formularze + walidacja)
   → Tiptap (rich text editor)
   → Framer Motion (animacje)
   → Recharts (dashboardy, analytics)
   → Sonner (toast notifications)
   → Socket.io (real-time)
   → UI/UX Pro Max Skill (design intelligence)
   → Storybook (katalog komponentów)

6. DEVELOPMENT (Backend — NestJS)
   → NestJS + Prisma + PostgreSQL
   → Pino (structured JSON logging)
   → Helmet.js (security headers: CSP, HSTS, X-Frame-Options)
   → Swagger/OpenAPI → auto TypeScript API client
   → BullMQ (background jobs)
   → Socket.io (real-time)
   → CASL.js (permissions)
   → Zod (shared validation z frontendem)

7. TESTING
   → Vitest + Testing Library (unit + component tests)
   → Playwright (E2E testy — wszystkie strony)
   → Chromatic (visual regression — screenshot comparison)

8. DEPLOY
   → Next.js standalone build → Docker → Coolify/Hetzner
   → NestJS API → Docker → Coolify
   → Traefik (reverse proxy, auto SSL)
   → Resend (emails)
   → MinIO + imgproxy (media)
   → Bunny Stream (video hosting — Faza 1)
   → Sentry (error tracking)
   → Grafana + Prometheus + Loki (monitoring)
   → Uptime Kuma (uptime monitoring)
   → Cloudflare (CDN + DDoS protection)
   → [Faza 2] React Native → iOS App Store ($99/rok) + Android Play Store ($25)
   → [Faza 2] Własny video pipeline: FFmpeg + HLS + Hetzner Object Storage / Cloudflare R2
```

---

> **Podsumowanie:** Masz bardzo mocny zestaw. Demo HTML (19 stron, ~40 komponentów) pokrywa ~90% UI platformy — **~80% kodu HTML+Tailwind konwertuje się bezpośrednio do JSX+Tailwind (~1:1)**. Nie musisz budować od zera. **Zainstaluj teraz:** Node.js 22 + pnpm + Docker Desktop + VS Code extensions (Tailwind CSS IntelliSense, ESLint, Prettier, Prisma). Uruchom `pnpm create next-app@latest` — i możesz zacząć kodować natychmiast. Xcode + Android Studio dopiero w Fazie 2 (React Native mobile).
