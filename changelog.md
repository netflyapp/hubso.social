Changelog – Hubso
==================

Ten dokument śledzi istotne zmiany w projekcie Hubso – od fazy discovery, przez planowanie, aż po kolejne iteracje produktu. 

Konwencja wersjonowania: semver (`MAJOR.MINOR.PATCH`). Wersje `0.x.x` opisują prace przed pierwszym publicznym MVP.

## 0.12.0 - Reactions System: emoji picker + backend toggle + 84/84 testy (2026-02-23)

### Dodano

- **ReactionsModule — backend NestJS:**
  - [x] reactions.service.ts: toggle() z logiką create/update/delete + denormalizacja `Post.reactionsCount`
  - [x] Batch fetch `getUserReactionsForPosts()` dla efektywnego ładowania feedu
  - [x] reactions.controller.ts: POST /reactions/toggle (wymaga JWT)
  - [x] reactions.module.ts + rejestracja w AppModule

- **Shared types i schema:**
  - [x] reactionTypes: `['LIKE','LOVE','WOW','FIRE','SAD','ANGRY']`
  - [x] toggleReactionSchema (Zod) + ToggleReactionInput interface
  - [x] Zaktualizowane schemas.js

- **PostsService/Controller — userReaction:**
  - [x] `findFeed()` + `findOne()` przyjmują opcjonalne `userId`
  - [x] Batch query reakcji użytkownika zwracany w odpowiedzi feedu
  - [x] `mapPost()` wzbogacony o `userReaction: string | null`

- **Frontend — PostCard.tsx:**
  - [x] Uproszczony interfejs: `PostCardProps = { post: PostItem }` (usunięto liked/bookmarked props)
  - [x] Lokalny state: `localReactions`, `localUserReaction`, `reactionLoading`, `bookmarked`
  - [x] `handleReact(type)` z optymistycznym UI + rollback przy błędzie
  - [x] Emoji picker popup na hover (6 emoji: 👍❤️😮🔥😢😡)
  - [x] Aktywna reakcja podświetlona, emoji zastępuje ikonę w przycisku

- **Frontend — page.tsx:**
  - [x] Usunięto `likedPosts`, `bookmarkedPosts`, `toggleLike`, `toggleBookmark`
  - [x] `<PostCard key={post.id} post={post} />` — uproszczone użycie

- **api.ts:**
  - [x] `PostItem.userReaction: string | null`
  - [x] `reactionsApi.toggle()` — endpoint klienta

- **Playwright E2E:** 84/84 ✅ (+6 nowych testów reakcji API)
  - [x] Naprawiony selektor przycisku komentarzy (CSS child combinator odporny na liczbę komentarzy)

---

## 0.11.0 - Comments System: backend + UI + 78/78 testy (2026-02-23)

### Dodano

- **CommentsModule - backend NestJS:**
  - [x] comments.service.ts: getByPost(), create(), delete() (owner/admin)
  - [x] comments.controller.ts: GET /posts/:id/comments (pub), POST (auth), DELETE /comments/:id (auth)
  - [x] comments.module.ts + rejestracja w AppModule
  - [x] Guard: AuthGuard('jwt') z @nestjs/passport

- **Shared types i schema:**
  - [x] createCommentSchema (content min 1/max 2000, parentId opcjonalne)
  - [x] CommentAuthor, CommentItem, CommentWithReplies w types.ts

- **Frontend - PostCard.tsx (nowy komponent):**
  - [x] Ekstrakcja z page.tsx, propsy: post/liked/bookmarked/onToggle*
  - [x] Lazy-loading komentarzy (kliknij Komentuj)
  - [x] CommentRow z rekurencyjnymi odpowiedziami (depth=1)
  - [x] Inline composer: Enter to submit
  - [x] replyingTo state + parentId w create
  - [x] Optymistyczny licznik localCommentsCount

---

## 0.10.0 – Composer UX: realny user, community picker, toasty, Cmd+Enter, auto-resize (2026-02-23)

### Dodano

- **Composer — pełny UX na stronie głównego feeda (`/`):**
  - [x] Realny avatar i imię zalogowanego użytkownika z `useAuthStore` — zastąpiono `PLACEHOLDER_AVATAR`
  - [x] Spersonalizowany placeholder: „O czym myślisz, [displayName]?"
  - [x] Community Selector — pill buttons ładowane z `communitiesApi.list()` przy pierwszym otwarciu; wybrana community trafia do `postsApi.create(slug)` (zastąpiono fragile `posts[0]?.communitySlug`)
  - [x] **Sonner toast** `„Post opublikowany w „[nazwa]"!"` przy sukcesie / `„Nie udało się opublikować…"` przy błędzie
  - [x] **Cmd+Enter** (macOS) / **Ctrl+Enter** (Win/Linux) do wysyłania postu z klawiatury
  - [x] **Auto-resize textarea** — `scrollHeight` po każdym keystroke (eliminuje pionowy scroll)
  - [x] **Limit 500 znaków** z kolorowanym licznikiem: szary → amber (>400) → czerwony (500), `maxLength` na `<textarea>`, przycisk Opublikuj disabled
  - [x] Hint klawiszowy `⌘↵ aby wysłać` widoczny na sm+ ekranach
  - [x] `openComposer()` / `closeComposer()` — czyste helpery zamiast inline setterów
  - [x] Naprawiony shadow variable naming w `posts.map()` (`postAuthorName`, `postAuthorAvatar`)

- **Testy:** 65/65 ✅ bez regresji (smoke test wszystkich feature'ów composera w Playwright)

---

## 0.9.0 – Posts API: backend + feed z realnych danych + 65/65 testy (2026-02-23)

### Dodano

- **PostsModule — backend NestJS:**
  - [x] `apps/api/src/posts/posts.service.ts` — `createPost()`, `getFeed()`, `getPost()`, `getPostsByCommunity()`, `deletePost()`; autoryzacja owner/admin przy usuwaniu; auto-resolve `spaceId` z pierwszego Space community
  - [x] `apps/api/src/posts/posts.controller.ts` — 5 endpointów: `GET /posts/feed`, `GET /posts/:id`, `GET /communities/:slug/posts`, `POST /communities/:slug/posts`, `DELETE /posts/:id`
  - [x] `apps/api/src/posts/posts.module.ts` + rejestracja w `AppModule`
  - [x] `apps/api/src/common/pipes/zod-validation.pipe.ts` — generyczny `ZodValidationPipe`
  - [x] `CommunitiesService.create()` — auto-tworzy domyślny Space „Ogólny" (type POSTS) przy każdej nowej community
  - Seeded 6 istniejących communities z default Space (9 par łącznie)

- **Shared types (`packages/shared/src/types.ts`):**
  - [x] `PostItem`, `PostAuthor`, `PostType`, `PostStatus`, `PaginatedPostsResponse`

- **Schema fix (`packages/shared/src/schemas.ts` + `schemas.js`):**
  - [x] `createPostSchema.spaceId` zmienione z `required` na `.optional()` (auto-resolve po stronie API)

- **Frontend Next.js (`apps/web`):**
  - [x] `apps/web/src/lib/api.ts` — `postsApi`: `feed()`, `get()`, `byCommunity()`, `create()`, `delete()`
  - [x] `apps/web/src/app/(platform)/page.tsx` — zastąpiono mock data realnym `postsApi.feed()` + skeleton loading + optimistic like/bookmark

- **Seed data:** 6 demo postów w DB (communities: programisci-indie, design-ux, fotografia-krajobrazowa, zdrowie-wellness)

- **Bugfixy:**
  - [x] `apps/web/src/app/layout.tsx` — `viewport` wyekstrahowany z `metadata` do osobnego `export const viewport: Viewport` (Next.js 15 warning)
  - [x] `apps/web/tailwind.config.ts` — `require()` → `import baseConfig` (Node v25 ESM fix)

- **Testy (13 nowych API + 4 browser = 17 nowych, łącznie 65/65 ✅):**
  - `POST /communities/:slug/posts` z/bez tokenu → 201/401
  - `GET /communities/:slug/posts` → lista + pola autora
  - `GET /posts/feed` → paginacja + dane z różnych communities
  - `GET /posts/:id` → szczegóły postu
  - `DELETE /posts/:id` → owner 200, inny user 403
  - Browser: feed ładuje realne posty, composer widoczny, post tworzony i prepended

---

## 0.8.0 – Communities CRUD: pełne API + strona /communities + 48/48 testy (2026-02-23)

### Dodano

- **Communities CRUD — backend + frontend + testy:**

  **Backend NestJS:**
  - [x] `apps/api/src/communities/communities.service.ts` — pełna implementacja Prisma: `findAll(userId?)`, `findBySlug(slug, userId?)`, `create()`, `join()`, `leave()`
  - [x] `apps/api/src/communities/communities.controller.ts` — `GET /communities`, `GET /communities/:slug`, `POST /communities`, `POST /communities/:slug/join`, `DELETE /communities/:slug/leave`
  - [x] `apps/api/src/auth/guards/optional-jwt.guard.ts` — `OptionalJwtAuthGuard` dla publicznych endpointów z opcjonalnym kontekstem użytkownika
  - [x] `apps/api/src/communities/communities.module.ts` — zaktualizowany o `OptionalJwtAuthGuard`
  - Endpointy publiczne zwracają `isJoined` + `memberRole` gdy podany token (via `OptionalJwtAuthGuard`)
  - Ochrona: owner nie może opuścić własnej community (403), duplikaty slug → 409

  **Shared types:**
  - [x] `packages/shared/src/types.ts` — dodane: `MemberRole`, `CommunityPlan`, `CommunityListItem`, `CommunityDetail`

  **Frontend Next.js:**
  - [x] `apps/web/src/lib/api.ts` — `communitiesApi`: `list()`, `get()`, `create()`, `join()`, `leave()` + typy `CommunityItem`, `CommunityDetailResponse`
  - [x] `apps/web/src/app/(platform)/communities/page.tsx` — pełna strona `/communities`: grid kart, skeleton loading, modal tworzenia, join/leave z optimistic update, filtry (wszystkie/dołączone/odkryj), wyszukiwanie
  - [x] `apps/web/src/components/layout/app-sidebar.tsx` — link "Społeczności" → `/communities` w sekcji "Wspólnota"

  **Seed data:**
  - 6 communities w DB: Fotografia Krajobrazowa, Programiści Indie, Zdrowie i Wellness, Twórcy Treści, Startupy & Biznes, Design & UX

  **Testy (16 nowych = 13 API + 3 Playwright):**
  - `GET /communities` → lista + poprawne pola
  - `POST /communities` z/bez tokenu → 201/401
  - `POST /communities` duplikat slug → 409
  - `GET /communities/:slug` → community z owner
  - `GET /communities/:slug` nieistniejący → 404
  - `POST /:slug/join` z/bez tokenu → 200/401
  - `POST /:slug/join` duplikat → 409
  - `DELETE /:slug/leave` → 200
  - `DELETE /:slug/leave` właściciel → 403
  - `GET /communities` z tokenem → `isJoined` + `memberRole` poprawne
  - Playwright: strona ładuje się, data z API widoczna, przycisk tworzenia

- **Wynik: 48/48 testów ✅ (7 API + 6 refresh + 13 communities API + 22 browser)**

---

## 0.7.0 – Token Refresh End-to-End: interceptor zweryfikowany + 32/32 testy (2026-02-23)

### Dodano

- **Token Refresh E2E — weryfikacja interceptora `api.ts`:**

  **Backend (dev-only endpoint):**
  - [x] `apps/api/src/auth/auth.controller.ts` — `POST /auth/dev/expired-token` — endpoint tylko na potrzeby testów; przyjmuje `refreshToken`, zwraca `{ expiredAccessToken, refreshToken }` z TTL 1ms
  - [x] `apps/api/src/auth/auth.service.ts` — metoda `generateExpiredToken(refreshToken)` — weryfikuje RT, wyszukuje usera, generuje AT z `expiresIn: '1ms'`

  **Testy (`/tmp/pw-hubso/auth-test.js`):**
  - [x] `POST /auth/dev/expired-token → zwraca expiredAccessToken` — weryfikacja dev endpointu
  - [x] `Wygasły accessToken → GET /users/me zwraca 401` — expired token daje HTTP 401
  - [x] `POST /auth/refresh z ważnym refreshToken → nowy accessToken` — pomyślny refresh
  - [x] `POST /auth/refresh z nieprawidłowym refreshToken → 401` — error case
  - [x] `Refresh flow: wygasły AT → refresh → nowy AT → /users/me 200` — pełny cykl manualny
  - [x] `Interceptor api.ts: wygasły AT → automatyczny refresh → 200 (symulacja)` — logika interceptora krok po kroku
  - [x] `Interceptor E2E: wygasły AT + ważny RT → automatyczny refresh → brak redirect do /login` — Playwright browser test
  - [x] `Interceptor E2E: nowy accessToken zapisany w localStorage po auto-refresh` — Playwright: localStorage ma nowy AT

- **Wynik: 32/32 testów ✅ (7 API + 6 refresh + 17 browser + 2 interceptor E2E)**

---

## 0.6.0 – Sprint 1 Faza F Ukończona: Profil użytkownika API + AppHeader + 24/24 testy (2026-02-23)

### Dodano

- **Faza F — GET /users/me + profil w headerze + hydratacja useAuthStore.user:**

  **Backend:**
  - [x] `apps/api/src/users/users.service.ts` — pełna implementacja Prisma: `findMe()`, `findById()`, `findByEmail()`
  - [x] `apps/api/src/users/users.controller.ts` — `GET /users/me` z `@UseGuards(AuthGuard('jwt'))` + `req.user.userId`
  - [x] `packages/database/prisma/schema.prisma` — pole `displayName String?` dodane do modelu User
  - [x] Migracja `20260223103049_add_display_name_to_user` zastosowana

  **Frontend — HTTP client:**
  - [x] `apps/web/src/lib/api.ts` — interceptor 401 + auto-refresh tokena: czyta token z localStorage, 401 → `POST /auth/refresh` → retry, `tokenStore.setAccessToken()` po odświeżeniu
  - [x] `MeResponse` interface — pełny kształt profilu użytkownika z API
  - [x] `usersApi.me()` — bez argumentów (czyta token automatycznie)
  - [x] `apps/web/src/lib/auth.ts` — dodano `setAccessToken()` do flow refresh

  **Frontend — State:**
  - [x] `apps/web/src/stores/useAuthStore.ts` — `hydrate()` zmienione na `async`, wywołuje `usersApi.me()` → `set({ user })`; `login()` pobiera profil po zalogowaniu; typ `user` zmieniony na `MeResponse`

  **Frontend — UI:**
  - [x] `apps/web/src/components/layout/app-header.tsx` — pełny rewrite: pokazuje `user.avatarUrl` lub inicjały (`getInitials()`), dropdown z emailem i displayName/username, functional logout → `router.push('/login')`
  - [x] `packages/ui/src/dropdown-menu.tsx` — dodano `DropdownMenuSeparator`
  - [x] `packages/ui/src/index.ts` — eksport `DropdownMenuSeparator`

  **Testy Playwright:**
  - [x] 24/24 testów przechodzi (było 16, dodano 8 nowych)
  - [x] Nowe testy: `GET /users/me → 401`, `GET /users/me → 200`, `displayName / avatarUrl / bio / role`, AppHeader visible, user menu button, email w dropdownie, Logout redirect do /login

## 0.4.0 – Sprint 1 Faza D Ukończona: Auth Pages + State Management (2026-02-22)

### Dodano

- **Faza D Frontend — Auth Pages Styling & State Management — Ukończona**:
  
  **Krok 18 — Auth Pages Production-Grade Styling:**
  - [x] `(auth)/login/page.tsx` — Gradient brand header z logo, email/password fields z password toggle, remember me checkbox, social auth buttons (Google, GitHub, Apple), responsive design, full dark mode
  - [x] `(auth)/register/page.tsx` — Full name, email, password fields z confirmation, password visibility toggle, terms checkbox z links, social auth option, error validation UX
  - [x] `(auth)/reset-password/page.tsx` — Email input, success state z email display, resend option, back to login link, loading states
  
  **Krok 19 — Zustand State Management Setup:**
  - [x] `useAuthStore.ts` — user state, isAuthenticated, isLoading, error management + setUser, logout, clearError actions
  - [x] `useUIStore.ts` — sidebarOpen, mobileSidebarOpen, mobileBottomNavOpen z toggle/setter actions
  - [x] `useNotificationStore.ts` — unreadCount, notifications array, addNotification, markAsRead, markAllAsRead, removeNotification, clearAll actions
  - All stores configured with `subscribeWithSelector` middleware for optimized re-renders

  **Krok 20 — TanStack Query Hooks Setup:**
  - [x] `useUsers.ts` — useUser, useCurrentUser, useUsers queries + useUpdateUser, useUploadAvatar mutations
  - [x] `usePosts.ts` — usePost, usePosts queries + useCreatePost, useUpdatePost, useDeletePost, useLikePost, useUnlikePost mutations
  - [x] `useMembers.ts` — useMember, useMembers queries (with leaderboard option) + useFollowMember, useUnfollowMember mutations
  - All hooks: mock data placeholders → TODO comments for API integration, proper invalidation patterns, staleTime configured

### Features

- **Auth UX Pattern:** React Hook Form + Zod validation, error feedback with icons, loading spinners, social auth buttons
- **Dark Mode:** 100% coverage on all auth pages — all components have dark: variants
- **Form Validation:** Real-time error display, disabled submit during loading, password visibility toggle
- **Responsive Design:** Mobile-first, adapts to all breakpoints
- **State Sync:** Zustand stores ready for API integration, TanStack Query prepared for backend endpoints

### Status Fazy

- ✅ **Faza A** (Monorepo Scaffold) — Ukończona
- ✅ **Faza B** (NestJS Backend Scaffold) — Ukończona  
- ✅ **Faza C** (Next.js Frontend Shell + 9 Platform Pages) — Ukończona
- ✅ **Faza D** (Auth Pages + Zustand + TanStack Query) — **🎉 UKOŃCZONA**
- 🔄 **Faza E** (WebSocket + CI/CD) — W kolejce

### Notatki

- Wszystkie auth pages są production-ready pod względem UI/UX
- Stores wykorzystują Zustand best practices z `subscribeWithSelector` do selektywnych re-renders
- Query hooks mają TODO markers dla łatwej integracji z backend API
- Kompilacja TypeScript na poziomie 0 błędów
- Aplikacja teraz ma pełną frontend architekturę: routing, forms, state, queries

---

## 0.3.0 – Sprint 1 Phase C Ukończona: Pełna Konwersja HTML→JSX (9 stron) (2026-02-22)

### Dodano

- **Faza C Frontend Shell — Ukończona**: Konwersja wszystkich 9 szablonów HTML na komponenty React JSX z pełnym wsparciem TypeScript i dark mode:
  - `(platform)/page.tsx` — Kanał główny (main feed)
  - `(platform)/feed/page.tsx` — Oś czasu (timeline)
  - `(platform)/profile/[id]/page.tsx` — Profil użytkownika
  - `(platform)/groups/page.tsx` — Katalog grup
  - `(platform)/messages/page.tsx` — Wiadomości 2-panel layout
  - `(platform)/events/page.tsx` — Wydarzenia z gradient sidebars
  - `(platform)/members/page.tsx` — Członkowie z leaderboard (3 rangi medalowe)
  - `(platform)/forums/page.tsx` — Dyskusje (5 kategorii + wątki)
  - `(platform)/courses/page.tsx` — Kursy z featured cohort banner
- **Integrations**: Wszystkie strony korzystają z @iconify/react (Solar Icons), mock data importowane z `lib/mock-data/ts`, dark mode via `dark:` prefix Tailwind
- **Dark Mode 100%**: Każdy komponent ma konsekwentne dark mode styling (`dark:bg-dark-surface`, `dark:border-dark-border`, `dark:text-slate-200`)
- **Build Verification**: `pnpm build` wykonana pomyślnie w 7.7s, "Compiled successfully", wszystkie 9 stron generują HTML statycznie
- **TypeScript Zero Errors**: Wszystkie nowe pliki kompilują się bez błędów, safe property access via optional chaining

### Status Fase

- ✅ **Faza A** (Monorepo Scaffold) — Ukończona
- ✅ **Faza B** (NestJS Backend Scaffold) — Ukończona  
- ✅ **Faza C** (Next.js Frontend Shell + 9 Platform Pages) — **🎉 UKOŃCZONA**
- 🔄 **Faza D** (Auth Pages + Zustand + TanStack Query) — Gotowa do rozpoczęcia
- ⏳ **Faza E** (WebSocket + CI/CD) — W kolejce

### Notatki

- Wszystkie 9 platform pages znajdują się w `/app/(platform)/*/page.tsx`
- Bootstrap aplikacji zapoznawcze (shell z headerem, sidebarem, bottom nav na mobile) już funkcjonalny
- Brakuje: auth pages styling, WebSocket realtime, backend API endpoints
- Dev server: `localhost:3000` HTTP 200 OK, aplikacja responsywna

---

## 0.2.0 – PRD v4.0, Landing Page & Template platformy (2026-02-22)

### Dodano

- Ukończono PRD v4.0 — rozbudowana specyfikacja produktu z pełnym opisem architektury monorepo (Turborepo + pnpm), tech stacku (Next.js 15, NestJS, Prisma, PostgreSQL 16, Redis, BullMQ, Socket.io), systemu wtyczek, roadmapy 8-fazowej i modelu SaaS + self-hosted.
- Przygotowano kompletny landing page hubso.social (Next.js 15 + Tailwind CSS 4 + shadcn/ui + Framer Motion) z sekcjami: Hero, Features, Pricing, FAQ, Blog (MDX), CTA, dark/light mode, responsywność mobile-first.
- Stworzono generyczny szablon platformy („wzór platformy") — 9 stron HTML (index, home, profile, groups, messages, courses, forums, members, events) jako wizualna referencja UI w stylu Circle.so:
  - Design system: indigo (#4F46E5) jako kolor brandowy, Inter font, Solar Icons (Iconify), dark mode z localStorage
  - Layout: sticky header (10 ikon nawigacji) + sidebar (4 sekcje) + responsywna treść główna
  - Treść generyczna (marketing, technologia, produktywność) — gotowy do brandowania pod dowolną społeczność
- Dodano konfigurację GitHub Copilot (`.github/copilot-instructions.md`) i Claude Code (`CLAUDE.md`) z pełnym opisem projektu, konwencji, struktury i 60 agentic skills.
- Skonfigurowano 60 skilli AI (antigravity-awesome-skills) w `.claude/skills/` pokrywających frontend, backend, DB, TypeScript, infrastrukturę, testowanie, bezpieczeństwo i workflow.
- Dodano dokumentację finansową: model sprzedaży, ceny pakietów, analiza kosztów infrastruktury.
- Dodano notatki klienta pilota (Bernatowicz) — inspiracje, propozycja dema, model oferty Nautilus Inner Circle.

### Zmienione

- Rozbudowano strukturę katalogów repozytorium o `05_marketing/`, `06_dokumentacja/`, `08_finanse/`, `BERNATOWICZ NOTATKI/`.
- Zaktualizowano `GIT_WORKFLOW.md` i `task.md`.

### Notatki

- Landing page (`02_app/202602210020_ver.1.0.0 (strona główna)/`) jest w pełni funkcjonalny jako standalone Next.js app.
- Szablon platformy (`03_ui/wzór platoformy/`) to standalone HTML — służy jako referencja wizualna, nie jako kod produkcyjny.
- Implementacja właściwej aplikacji (monorepo Turborepo z apps/web + apps/api) nie została jeszcze rozpoczęta.

---

## 0.2.0 – AI Tooling & Skills Configuration (2026-02-22)

### Dodano

- **PRD v4.1** — nowa sekcja 25: "Narzędzia AI-assisted development" opisująca MCP servers, agentic skills i konfigurację per narzędzie.
- **MCP Servers** — skonfigurowano shadcn MCP (`shadcn@latest mcp`) i Context7 MCP (`@upstash/context7-mcp`) dla VS Code Copilot (`.vscode/mcp.json`) i Claude Code (`.mcp.json`).
- **60 agentic skills** w `.claude/skills/` (symlinki do antigravity-awesome-skills). Nowe skille: `react-native-architecture`, `expo-deployment`, `mobile-design`, `mobile-developer`, `nodejs-best-practices`, `nodejs-backend-patterns`, `openapi-spec-generation`, `playwright-skill`, `turborepo-caching`, `wcag-audit-patterns`.
- Konfiguracja Claude Code: `CLAUDE.md` z kontekstem projektu i rejestrem 60 skilli.
- Konfiguracja VS Code Copilot: `.github/copilot-instructions.md` z tabelami skilli, `.vscode/settings.json` z instrukcjami code generation / review / testów / commitów.

### Zmieniono

- PRD: wersja 4.0 → 4.1, dodano spis treści pkt 25.
- Usunięto `flutter-expert` (Flutter zastąpiony przez React Native w PRD v4.0).
- Zaktualizowano `.vscode/settings.json`: Jest → Vitest + Playwright.

### Notatki

- shadcn MCP umożliwia AI instalację komponentów z registry przez natural language.
- Context7 MCP dostarcza aktualną dokumentację bibliotek (Next.js 15, NestJS, Prisma, React Native) bezpośrednio do kontekstu AI, rozwiązując problem przestarzałej wiedzy modelu.
- Skille pokrywają cały stack: frontend (web + mobile), backend, DB, testing, infra, security, architektura.

---

## 0.2.0 – PRD v4, Brandbook Circle.so, Skills & Tooling (2026-02-22)

### Dodano

- **PRD v4.0** — kompletny Product Requirements Document (1 599 wierszy): wizja, analiza konkurencji, grupy docelowe, architektura monorepo, tech stack (Next.js 15 + NestJS + Prisma + PostgreSQL), moduły Core/Post-MVP, integracja AI, plugin marketplace, schemat bazy danych, plan implementacji (Sprint 1–9 + Fazy 2–3), model biznesowy (SaaS-first + self-hosted), metryki sukcesu, ryzyka.
- **Brandbook v1.0** — pełny design system (650 wierszy): logo, typografia (Inter), paleta kolorów (zmieniona na styl Circle.so: primary `#4262F0` indigo, secondary `#7FE4DA` teal), dark/light mode, spacing 4px grid, komponenty (buttons, cards, inputs, avatary, badges), ikony (Solar Icons), layouty, responsywność, white-label CSS Custom Properties, dostępność WCAG AA.
- **Analiza kosztów** (`08_finanse/koszty.md`) — szczegółowa kalkulacja infrastruktury i narzędzi.
- **Model sprzedaży** (`08_finanse/model sprzedazy.md`) — pricing SaaS Cloud + Self-hosted, revenue streams.
- **Analiza konkurencji** (`01_plan/konkurencja.md`) — Circle.so, Skool, BuddyBoss, FluentCommunity, Mighty Networks.
- **Rekomendacje narzędzi** (`01_plan/rekomendacje narzedzi.md`) — wybór stacku, analiza technologii.
- **CLAUDE.md** — konfiguracja Claude Code z pełnym opisem projektu, konwencji i skilli.
- **`.github/copilot-instructions.md`** — instrukcje dla GitHub Copilot z kompletnym tech stackem i konwencjami.
- **60 agentic skills** (`.claude/skills/`) — symlinki do `antigravity-awesome-skills` obejmujące: frontend (Next.js, React, Tailwind, Zustand), backend (NestJS, GraphQL, BullMQ, auth), bazy danych (Prisma, PostgreSQL), TypeScript, Docker, monorepo, Stripe, testowanie (Vitest, Playwright), bezpieczeństwo, architektura, UI/UX.
- **UI kity referencyjne** — Magic UI Pro, ShadCnKit (Figma + Next.js), UI-UX Pro Max skill.
- **Notatki klienta pilota** (`BERNATOWICZ NOTATKI/`) — inspiracje, propozycja demo, zachowanie dziedzictwa, model oferty.

### Zmieniono

- Zaktualizowano `01_plan/note.md` — usunięto nieaktualne notatki technologiczne.
- Usunięto `01_plan/technologia.md` — zastąpiony przez PRD v4.0 sekcja Tech Stack.

### Notatki

- Paleta kolorów brandbooka zmieniona z emerald/green na indigo/teal (inspiracja Circle.so): primary `#4262F0`, secondary `#7FE4DA`, primary-dark `#3730A3`, primary-light `#EEF2FF`.
- Implementacja aplikacji (frontend Next.js, backend NestJS) jeszcze nie rozpoczęta — kolejny krok to Sprint 1 MVP.

---

## 0.1.0 – Discovery & Foundations (2026-02-21)

### Dodano

- Ukończono PRD v2.1 (draft), opisujące wizję produktu, grupy docelowe, moduły Core/Post-MVP, architekturę monorepo (apps/web, apps/api, packages/ui itp.) oraz koncepcję marketplace'u wtyczek.
- Zebrano i uporządkowano wcześniejsze rozkminy produktowo-architektoniczne (MVP, moduły: Auth, Spaces, Feed, Messaging, Groups, Events, Courses, Notifications, Search, Admin, Monetyzacja, Media).
- Przeprowadzono analizę konkurencji (m.in. Circle.so, Skool, Mighty Networks, BuddyBoss, Discourse/Flarum, FluentCommunity) i zdefiniowano wyróżniki Hubso na ich tle.

- Opracowano szczegółowy research hostowania wideo (self-hosted na Hetzner vs Bunny Stream + Cloudflare) wraz ze szkicem architektury uploadu, transkodowania i dostarczania treści.
- Przeanalizowano technologie dla aplikacji desktop/mobile (Tauri vs Flutter) i spisano rekomendacje dotyczące wyboru stacku na potrzeby aplikacji społecznościowej.

- Ukończono Brandbook v1.0 jako domyślny design system (logo, paleta kolorów z tokenami pod Tailwind i dark mode, typografia, tone of voice, zasady white-labelingu motywów).

- Przygotowano kompletne demo UI platformy dla klienta pilota (ok. 19 widoków, ~40 typów komponentów, dark mode, responsywność), obejmujące m.in. feed, kursy, dziennik zdrowia, przepisy, wideo, grupy, fora, wydarzenia, powiadomienia i profil użytkownika.
- Zdefiniowano, że demo HTML służy jako specyfikacja wizualna i referencja UX/UI pod przyszłą implementację w docelowym stacku (Next.js + Tailwind + shadcn/ui), a nie jako produkcyjny front.

- Zinwentaryzowano i potwierdzono dostępność kluczowych narzędzi i zasobów: Figma Pro, Canva, GitHub Copilot, Claude Code, Kie.ai, Playwright MCP oraz zestawów UI (Magic UI Pro, ShadCnKit, UI-UX Pro Max skill) używanych do budowy interfejsów.
- Udokumentowano stan demo platformy (ocena ~7.5/10) wraz z listą drobnych bugów i UI-fixów do późniejszej korekty.

### Notatki

- Implementacja właściwej aplikacji (frontend w Next.js, backend w NestJS, system wideo, integracje z bazą danych i infrastrukturą) nie została jeszcze rozpoczęta w tym repozytorium.
- Katalogi w `02_app` pełnią na tym etapie rolę placeholderów pod przyszłe snapshoty wersji aplikacji.
- Kolejne wersje changeloga (np. `0.2.0`) będą dotyczyć już implementacji MVP w oparciu o obecne PRD, brandbook oraz demo UI.

---

## 0.2.0 – Landing Page, i18n & Tooling (2026-02-22)

### Dodano

**Landing page (strona główna)**
- Zbudowano kompletną stronę sprzedażową w Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui, oparty na szablonie Magic UI SaaS Template.
- Zaimplementowano 14 sekcji: Header, Hero, Logos, Problem, Solution, Features, How It Works, Comparison, Testimonials, Pricing, FAQ, CTA, Footer + Drawer (mobile menu).
- Dodano animacje z Framer Motion (hero, sekcje, marquee, ripple, flickering grid, border beam).
- Dark mode domyślnie (next-themes), ThemeToggle do przełączania.
- Komponent Safari (browser mockup) do prezentacji dashboardu.
- Blog z obsługą MDX (kategorie, autorzy, routing `/blog/[slug]`).
- Strona logowania i rejestracji (placeholder UI pod przyszłe auth).
- Open Graph image generation (`/og` route z edge runtime).

**Internacjonalizacja (i18n)**
- Własny system tłumaczeń (bez zewnętrznych bibliotek) oparty na React Context: `LocaleProvider`, `useLocale()`, `useT()`.
- Kompletne słowniki EN + PL (~900 linii) pokrywające wszystkie sekcje landing page.
- Komponent `LocaleSwitcher` (przełącznik EN/PL) w headerze i mobile drawer.
- Automatyczne wykrywanie języka przeglądarki (Polish → PL), persistence w `localStorage`.
- Explicit `TranslationTree` interface (rozwiązanie problemu TypeScript literal types z `as const`).

**Paleta kolorów (circle.so inspired)**
- Zmieniono paletę kolorów z emerald/green na niebiesko-fioletowy gradient inspirowany circle.so.
- Primary: `#4262F0` (Circle Blue), CTA gradient: `#408FED` → `#3E1BC9`, Dark BG: `#0A0A0A`, Card dark: `#191A1E`, Accent light: `#E4F6F4`, Foreground light: `#0F0F35`.
- Zaktualizowano CSS custom properties (light + dark mode), layout.tsx meta theme-color, hardcoded kolory w solution.tsx i border-beam.tsx.

**Dokumentacja i planowanie**
- Ukończono PRD v4.0 (~1600 linii) — pełna specyfikacja architektury monorepo, modułów Core, systemu wtyczek, planów sprintów, API i infrastruktury.
- Dodano `CLAUDE.md` — konfigurację dla Claude Code (tech stack, konwencje, struktura, skills).
- Dodano `.github/copilot-instructions.md` — instrukcje GitHub Copilot z pełnym tech stackiem, konwencjami, design systemem i tabelą 60 skilli.
- Dodano `01_plan/rekomendacje narzedzi.md` — research narzędzi (Figma, AI, hosting, CI/CD).
- Zaktualizowano `01_plan/konkurencja.md` z nowymi danymi o konkurentach.
- Usunięto nieaktualne `01_plan/technologia.md` (zastąpione przez PRD v4.0).

**Finanse i oferta**
- Dodano `08_finanse/koszty.md` — szczegółowa kalkulacja kosztów infrastruktury i SaaS.
- Dodano `08_finanse/model sprzedazy.md` — model sprzedaży z segmentacją klientów.
- Dodano `08_finanse/ceny pakietów.md` — placeholder pod cennik.

**Klient pilotażowy (Bernatowicz)**
- Dodano katalog `BERNATOWICZ NOTATKI/` z materiałami do współpracy z klientem pilotażowym: oferta Nautilus Inner Circle, propozycja dema, notatki, inspiracje, analiza rynku ufologów.

**UI Kits i zasoby**
- Dodano uproszczone demo UI platformy (`03_ui/wzór platoformy/`) — 9 widoków HTML (home, courses, events, forums, groups, members, messages, profile, index).
- Dodano UI-UX Pro Max Skill (`03_ui/ui-ux-pro-max-skill-main/`) — zaawansowany system AI do projektowania interfejsów z CLI, danymi CSV (style, kolory, typografia, stacking) i szablonami platform.

**Tooling**
- Dodano 60 agentic skills w `.claude/skills/` (symlinki) pokrywających: frontend, backend, bazy danych, TypeScript, infrastrukturę, płatności, testowanie, architekturę, bezpieczeństwo i workflow.

### Zmieniono

- Zaktualizowano `01_plan/note.md` (drobne korekty).

### Notatki

- Landing page jest gotowa do deploy (`pnpm build` przechodzi bez błędów).
- Backend (NestJS), baza danych (Prisma + PostgreSQL) i infrastruktura (Docker, Redis, Meilisearch) nie zostały jeszcze zaimplementowane.
- Sekcja `logos.tsx` nie została jeszcze podpięta pod system i18n (hardcoded EN strings).
- Menu nawigacyjne (`menu.tsx`) nadal czyta tekst z `siteConfig` zamiast z tłumaczeń.

