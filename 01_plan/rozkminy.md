# Prompt: Budowa Platformy Społecznościowej

> **Cel:** Stworzenie self-hosted platformy społecznościowej inspirowanej Circle.so, BuddyBoss i Facebook.  
> **Deployment:** Coolify na Hetzner Cloud  
> **Faza 1:** Aplikacja webowa (przeglądarka)  
> **Docelowo:** Web + Desktop (Electron/Tauri) + iOS + Android (React Native / Expo)

-----

## KONTEKST PROJEKTU

Buduję platformę społecznościową typu white-label, self-hosted, która łączy funkcjonalności:

- **Circle.so** — Spaces (przestrzenie tematyczne), kursy, eventy, gamifikacja, monetyzacja
- **BuddyBoss** — profile członków, grupy publiczne/prywatne/ukryte, activity feed, messaging, forums
- **Facebook** — news feed, reakcje, komentarze, live streaming, stories, marketplace

Platforma będzie hostowana na **Coolify** (Hetzner Cloud), musi być skalowalna i gotowa do obsługi wielu niezależnych społeczności (multi-tenant).

-----

## TECH STACK

### Frontend (Web)

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui (komponenty bazowe)
- **State Management:** Zustand (client state) + TanStack Query (server state)
- **Forms:** React Hook Form + Zod (walidacja)
- **Rich Text Editor:** Tiptap (rozszerzalny, headless, Markdown + WYSIWYG)
- **Real-time:** Socket.io lub Ably/Pusher (WebSocket)
- **URL State:** nuqs (typed URL params)
- **Animacje:** Framer Motion

### Mobile (Faza 2)

- **Framework:** React Native + Expo (SDK 52+)
- **Navigation:** Expo Router
- **Styling:** NativeWind (Tailwind for RN)
- **Shared logic:** Wspólne hooki, typy, walidacje z monorepo

### Desktop (Faza 3)

- **Tauri 2** (lekki wrapper nad web app) lub Electron

### Backend

- **Runtime:** Node.js 22 LTS
- **Framework:** NestJS (modularny, TypeScript, DI, guards, interceptors)
- **API:** REST + GraphQL (Apollo lub Mercurius) — REST dla prostych CRUD, GraphQL dla złożonych zapytań z relacjami
- **Auth:** Passport.js + JWT + Refresh Tokens + OAuth2 (Google, Apple, Facebook)
- **Permissions:** CASL.js (attribute-based access control)
- **File Upload:** Presigned URLs → S3-compatible storage (MinIO self-hosted lub Cloudflare R2)
- **Email:** Nodemailer + MJML templates (lub Resend API)
- **Background Jobs:** BullMQ + Redis
- **Notifications:** Push (FCM/APNs), Email, In-App (WebSocket)

### Baza danych

- **Primary:** PostgreSQL 16 (via Prisma ORM lub Drizzle ORM)
- **Cache:** Redis 7 (sessions, cache, queues, rate limiting, real-time presence)
- **Search:** Meilisearch (self-hosted, full-text search, typo-tolerant)
- **Media metadata:** opcjonalnie MongoDB dla nieustrukturyzowanych danych

### Infrastruktura (Coolify + Hetzner)

- **Reverse Proxy:** Traefik (auto SSL via Let’s Encrypt) — zarządzany przez Coolify
- **Containerization:** Docker + Docker Compose
- **CI/CD:** GitHub Actions → deploy do Coolify via webhook
- **Object Storage:** MinIO (self-hosted S3) lub Cloudflare R2
- **CDN:** Cloudflare (darmowy plan na start)
- **Monitoring:** Grafana + Prometheus + Loki (logi)
- **Error Tracking:** Sentry (self-hosted lub SaaS)

### Monorepo

- **Tool:** Turborepo (lub pnpm workspaces)
- **Struktura:**

```
apps/
  web/          → Next.js (frontend web)
  mobile/       → Expo (React Native)
  desktop/      → Tauri wrapper
  api/          → NestJS (backend)
packages/
  ui/           → Shared UI components (shadcn/ui based)
  shared/       → Typy, walidacje Zod, utils, constants
  config/       → ESLint, TypeScript, Tailwind configs
  database/     → Prisma schema + migrations + seeds
docker/
  docker-compose.yml
  docker-compose.dev.yml
  Dockerfile.api
  Dockerfile.web
```

-----

## MODUŁY FUNKCJONALNE (MVP — Faza 1)

### 1. AUTH & USERS

- Rejestracja: email/hasło, OAuth (Google, Facebook, Apple)
- Login: email/hasło, magic link, OAuth
- 2FA (TOTP — Google Authenticator)
- Email verification, password reset
- Profile użytkownika: avatar, bio, custom fields, social links, cover photo
- Member directory z filtrami i wyszukiwarką
- Role systemowe: Super Admin, Admin, Moderator, Member, Guest
- Account settings: notification preferences, privacy, blocked users

### 2. SPACES (Przestrzenie) — wzór Circle.so

- Typy przestrzeni: Posts, Chat, Events, Courses, Links, Files
- Organizacja: Space Groups (foldery przestrzeni)
- Kontrola dostępu: Public, Private, Secret (hidden)
- Każda przestrzeń ma własny: feed, ustawienia, moderatorów
- Lock Screen (paywall) — blokowanie dostępu za płatność
- Custom branding per space (kolor akcentu, ikona)

### 3. ACTIVITY FEED & POSTS

- Globalny feed + feed per space + feed per profil
- Typy postów: tekst, zdjęcia, video, linki, pliki, polls, embedy
- Rich text editor (Tiptap): formatowanie, mention @user, #hashtag, emoji
- Reakcje (like, love, wow, etc.) — konfigurowane per community
- Komentarze z threading (zagnieżdżone)
- Pin post, feature post
- Scheduled posts (publikacja z opóźnieniem)
- Draft posts
- Content moderation: auto-flag, manual review queue, spam filter

### 4. MESSAGING (DM & Group Chat)

- 1:1 Direct Messages
- Group chats (do N osób)
- Real-time via WebSocket
- Read receipts, typing indicators
- Media sharing (zdjęcia, pliki, voice messages)
- Message search
- Mute/block conversations
- Threaded replies w konwersacjach

### 5. GROUPS — wzór BuddyBoss/Facebook

- Typy: Public, Private, Hidden
- Osobny feed per grupa
- Group roles: Owner, Admin, Moderator, Member
- Group invite system
- Group cover photo, description, rules
- Discussion forums wewnątrz grup
- Subgroups (opcjonalnie)

### 6. EVENTS

- Tworzenie eventów: tytuł, opis, data/czas, lokalizacja (online/offline)
- RSVP system (Going, Maybe, Not Going)
- Recurring events
- Calendar view (miesiąc, tydzień, lista)
- Integracja z Zoom/Google Meet lub wbudowany live stream
- Event reminders (email + push + in-app)
- Ticket/access management (free vs paid events)

### 7. COURSES / LMS (Faza 1.5)

- Course builder: moduły → lekcje → quizy
- Content types: video, tekst, PDF, audio
- Progress tracking per student
- Completion certificates (PDF generation)
- Discussion per lekcja
- Drip content (udostępnianie lekcji wg harmonogramu)
- Enrollments (free / paid / subscription)

### 8. NOTIFICATIONS

- In-app (bell icon, dropdown list, mark as read)
- Email (digest: instant, daily, weekly)
- Push (mobile + desktop PWA)
- Configurable per user: co chcę dostawać i jak
- Notification grouping (np. “5 osób polubiło twój post”)

### 9. SEARCH

- Globalny search bar: users, posts, spaces, groups, events, files
- Full-text search z Meilisearch
- Filtrowanie i sortowanie wyników
- Recent searches, search suggestions

### 10. ADMIN PANEL

- Dashboard: metryki społeczności (MAU, DAU, posty, retencja)
- User management: lista, ban, suspend, role assignment
- Content moderation queue
- Space/Group management
- Community settings: branding, registration, custom fields
- Email templates management
- Analytics: engagement, growth, retention charts
- Audit log (kto co zmienił)
- Import/Export (CSV, JSON)

### 11. MONETYZACJA (Faza 1.5)

- Membership levels (free, paid tiers)
- Stripe integration (subscriptions, one-time payments)
- Paywall na spaces/courses
- Coupons & discounts
- Revenue dashboard
- Affiliate/referral system (opcjonalnie)

### 12. MEDIA & FILES

- Image upload z kompresją (Sharp)
- Video upload + transcoding (FFmpeg)
- File attachments (PDF, docs, etc.)
- Media gallery per user/group/space
- Storage: MinIO (S3-compatible) z CDN layer
- Image CDN z transformacjami (resize, crop, webp)

-----

## SCHEMAT BAZY DANYCH (Kluczowe Encje)

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
├── settings (JSONB: branding, registration, features)
├── owner_id → User
└── plan, status

CommunityMember
├── community_id → Community
├── user_id → User
├── role (admin, moderator, member)
├── joined_at, status

Space
├── id, community_id → Community
├── name, slug, description, icon, color
├── type (posts, chat, events, courses, links, files)
├── visibility (public, private, secret)
├── space_group_id → SpaceGroup (nullable)
├── settings (JSONB), position (sort order)

SpaceGroup
├── id, community_id, name, position

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
└── metadata (JSONB: link_preview, poll_options, etc.)

Comment
├── id, post_id → Post, author_id → User
├── parent_id → Comment (nullable, for threading)
├── content (JSONB), reactions_count (JSONB)
├── created_at, updated_at

Reaction
├── id, user_id → User
├── target_type (post, comment), target_id
├── type (like, love, wow, etc.)
├── UNIQUE(user_id, target_type, target_id)

Group
├── id, community_id → Community
├── name, slug, description, cover_url, rules
├── visibility (public, private, hidden)
├── member_count, created_by → User

GroupMember
├── group_id → Group, user_id → User
├── role (owner, admin, moderator, member)

Conversation (DM / Group Chat)
├── id, type (direct, group)
├── name (nullable, for group chats)
├── created_at, updated_at

ConversationParticipant
├── conversation_id → Conversation, user_id → User
├── last_read_at, muted

Message
├── id, conversation_id → Conversation
├── sender_id → User
├── content, type (text, image, file, voice)
├── parent_id → Message (nullable, for threads)
├── created_at

Event
├── id, space_id → Space, created_by → User
├── title, description, location_type (online/offline)
├── location_url, location_address
├── starts_at, ends_at, timezone
├── recurring_rule (RRULE string)
├── max_attendees, ticket_price
├── status (draft, published, cancelled, completed)

EventAttendee
├── event_id → Event, user_id → User
├── status (going, maybe, not_going)

Notification
├── id, user_id → User
├── type, title, body
├── data (JSONB: link, actor_id, target_type, target_id)
├── read_at, created_at

Course
├── id, space_id → Space
├── title, description, cover_url
├── status (draft, published)
├── price, enrollment_type (free, paid, subscription)

CourseModule
├── id, course_id → Course
├── title, position

Lesson
├── id, module_id → CourseModule
├── title, content (JSONB), type (video, text, quiz)
├── position, duration_minutes

Enrollment
├── id, course_id → Course, user_id → User
├── status (active, completed, cancelled)
├── progress_percent, enrolled_at, completed_at

MediaFile
├── id, uploaded_by → User
├── filename, mime_type, size_bytes
├── storage_key (S3 path), cdn_url
├── width, height (for images/video)
├── status (processing, ready, failed)
├── created_at
```

-----

## DESIGN SYSTEM & UI

### Inspiracje wizualne

- **Circle.so** — czysty, minimalistyczny sidebar + content area, Spaces w sidebar
- **BuddyBoss** — social network feel, activity feed centralny, profile cards
- **Discord** — sidebar z kanałami, real-time chat, server switching

### Generowanie UI

Użyj **aura.build** (AI website builder) do szybkiego generowania layoutów. Aura generuje **HTML + Tailwind CSS** i wspiera eksport do Figma.

**Prompt do aura.build na główny layout:**

```
Create a modern community platform layout with:
- Left sidebar (240px): community logo, navigation with icons (Home, Spaces, Groups, Events, Messages, Courses), space groups with collapsible sections, user profile at bottom
- Top header (64px): search bar (centered), notification bell with badge, user avatar dropdown
- Main content area: activity feed with post cards, rich text post composer at top
- Right sidebar (300px, optional): member list, upcoming events widget, trending topics
Style: Clean, modern, dark mode support. Colors: neutral grays with customizable accent color. Font: Inter. Rounded corners (8px). Subtle shadows.
```

### Komponenty UI (shadcn/ui based)

- **Layout:** AppShell, Sidebar, Header, ContentArea
- **Navigation:** NavItem, SpaceList, SpaceGroupAccordion
- **Feed:** PostCard, PostComposer, CommentThread, ReactionBar
- **Profile:** UserAvatar, UserCard, ProfileHeader, MemberList
- **Messaging:** ChatWindow, MessageBubble, ConversationList
- **Modals:** CreateSpace, CreateGroup, CreateEvent, InviteMembers
- **Forms:** LoginForm, RegisterForm, SettingsForm
- **Data Display:** DataTable, StatsCard, Chart (Recharts)
- **Feedback:** Toast, AlertDialog, Badge, Skeleton

-----

## WYMAGANIA NIEFUNKCJONALNE

### Performance

- Time to First Byte < 200ms
- Largest Contentful Paint < 2.5s
- First Input Delay < 100ms
- Lazy loading images + infinite scroll feeds
- Server-side rendering dla SEO (landing pages, public profiles)
- Static generation dla dokumentacji/help center
- Database query optimization: indeksy, eager loading, pagination (cursor-based)

### Security

- HTTPS everywhere (Traefik + Let’s Encrypt)
- CSRF protection
- Rate limiting (Redis-based)
- Input sanitization (DOMPurify dla user content)
- SQL injection prevention (ORM parameterized queries)
- XSS prevention (Content Security Policy headers)
- File upload validation (MIME type, size, malware scan)
- GDPR compliance: data export, data deletion, consent management
- Audit logging dla admin actions
- Helmet.js (security headers)

### Scalability

- Horizontal scaling: stateless API servers za load balancerem
- Database: read replicas, connection pooling (PgBouncer)
- Redis Cluster dla cache i sessions
- Object storage (MinIO) oddzielony od compute
- Background jobs (BullMQ) na osobnych worker nodes
- CDN dla static assets i media

### Monitoring & Observability

- Structured logging (pino/winston)
- Health check endpoints
- Grafana dashboards: CPU, RAM, DB queries, API latency
- Sentry error tracking (frontend + backend)
- Uptime monitoring (UptimeRobot lub Uptime Kuma self-hosted)

-----

## PLAN IMPLEMENTACJI

### Sprint 1 (Tydzień 1-2): Fundament

- [ ] Monorepo setup (Turborepo + pnpm)
- [ ] Docker Compose: PostgreSQL, Redis, MinIO, Meilisearch
- [ ] NestJS boilerplate: auth module, users module
- [ ] Prisma schema: User, Community, CommunityMember
- [ ] Next.js boilerplate: auth pages, layout, sidebar
- [ ] CI/CD pipeline (GitHub Actions → Coolify)

### Sprint 2 (Tydzień 3-4): Core Social

- [ ] Spaces CRUD + SpaceGroups
- [ ] Post CRUD (z Tiptap editor)
- [ ] Activity Feed (infinite scroll, cursor pagination)
- [ ] Reactions + Comments (threading)
- [ ] File upload flow (presigned URLs → MinIO)

### Sprint 3 (Tydzień 5-6): Communication

- [ ] Direct Messages (1:1)
- [ ] Group Chat
- [ ] WebSocket infrastructure (Socket.io)
- [ ] In-app notifications (bell, dropdown)
- [ ] Email notifications (templates, digests)

### Sprint 4 (Tydzień 7-8): Groups & Events

- [ ] Groups CRUD (public/private/hidden)
- [ ] Group feeds + membership
- [ ] Events CRUD + RSVP
- [ ] Calendar view
- [ ] Event reminders

### Sprint 5 (Tydzień 9-10): Admin & Polish

- [ ] Admin panel: dashboard, user management
- [ ] Content moderation queue
- [ ] Global search (Meilisearch)
- [ ] Member directory + filters
- [ ] Profile customization
- [ ] Dark mode

### Sprint 6 (Tydzień 11-12): Monetyzacja & Launch

- [ ] Stripe integration
- [ ] Membership levels + paywalls
- [ ] Courses MVP (basic builder + progress)
- [ ] Performance optimization
- [ ] Security audit
- [ ] Deployment na Coolify produkcyjnie

-----

## KOMENDY STARTOWE

```bash
# 1. Inicjalizacja monorepo
mkdir community-platform && cd community-platform
pnpm init
npx create-turbo@latest

# 2. Apps
npx create-next-app@latest apps/web --typescript --tailwind --app --src-dir
npx @nestjs/cli new apps/api --strict --skip-git --package-manager pnpm
npx create-expo-app apps/mobile --template tabs

# 3. Shared packages
mkdir -p packages/{ui,shared,config,database}

# 4. Docker infra
mkdir docker && cat > docker/docker-compose.dev.yml << 'EOF'
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: community
      POSTGRES_PASSWORD: community_dev
      POSTGRES_DB: community_platform
    ports: ["5432:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]
    
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    
  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports: ["9000:9000", "9001:9001"]
    volumes: [minio_data:/data]
    
  meilisearch:
    image: getmeili/meilisearch:latest
    environment:
      MEILI_MASTER_KEY: community_search_key
    ports: ["7700:7700"]
    volumes: [meili_data:/meili_data]

volumes:
  postgres_data:
  minio_data:
  meili_data:
EOF

# 5. Start dev infra
cd docker && docker compose -f docker-compose.dev.yml up -d
```

-----

## UWAGI DLA AI / DEVELOPERA

1. **Zacznij od schematu bazy** — Prisma schema jest fundamentem. Najpierw schema, potem API, potem frontend.
1. **API-first** — każdy moduł najpierw jako endpoint, potem UI.
1. **Nie buduj wszystkiego naraz** — MVP to: auth + spaces + posts + feed + messaging. Reszta iteracyjnie.
1. **Testuj na bieżąco** — unit tests dla logiki biznesowej, e2e dla krytycznych flows (auth, posting, messaging).
1. **Nie mockuj danych w dev/prod** — seed database realnym contentem.
1. **Kod < 300 linii per plik** — refaktoryzuj wcześnie.
1. **Coolify deploy** — upewnij się że Docker images budują się poprawnie z multi-stage builds.
1. **Nie nadpisuj .env** — zawsze pytaj przed zmianą.
1. **shadcn/ui** — nie twórz komponentów od zera jeśli shadcn ma odpowiednik.
1. **Real-time od początku** — WebSocket infrastruktura w Sprint 1, nawet jeśli używana dopiero w Sprint 3.

-----

## REFERENCJE UI DO POBRANIA

Użyj Firecrawl (MCP lub CLI) do scrapowania UI referencji:

```bash
# Firecrawl CLI — scrapowanie stron referencyjnych
npx firecrawl scrape https://circle.so --format html --output ./references/circle-so/
npx firecrawl scrape https://buddyboss.com/demo/ --format html --output ./references/buddyboss/
npx firecrawl scrape https://web.facebook.com --format screenshot --output ./references/facebook/

# Lub użyj Firecrawl MCP server w Claude Code:
# 1. Dodaj do .claude/settings.json:
# "mcpServers": {
#   "firecrawl": {
#     "command": "npx",
#     "args": ["-y", "firecrawl-mcp"]
#   }
# }
# 2. W Claude Code: "Scrape circle.so homepage and analyze the layout"
```

### Lokalne referencje (już pobrane):

- BuddyBoss UI: `~/Documents/02_projekty/202602161307_platformy spolecznosciowe/03_ui/wyglad buddy-boss/`
- Nowy layout (aura.build): `~/Documents/02_projekty/202602161307_platformy spolecznosciowe/screenshots/nowy layout platformy.html`

> **Aura.build** generuje czysty HTML + Tailwind CSS. Konwertuj na komponenty React/shadcn przy implementacji.

-----

*Prompt wersja 1.0 — Luty 2026*Chcę zbudować narzędzie do budowania  platfor społecznościowych. Tj Circle Buddyboss, school. Sam zakładałem wiele takich platform dla klientów. Czym się wyróżnićChcę zbudować narzędzie do budowania  platfor społecznościowych. Tj Circle Buddyboss, school. Sam zakładałem wiele takich platform dla klientów. Czym się wyróżnićChcę zbudować narzędzie do budowania  platfor społecznościowych. Tj Circle Buddyboss, school. Sam zakładałem wiele takich platform dla klientów. Czym się wyróżnić. Co zrobić

* Prompt wersja 2.0 core AI. Sterowanie społecznoscia. Co czego nie maja zadne inne  aplikacje społecznosci. 

WarstwaNarzędzieRolaFrontendNext.js + shadcn/uiCały UIBackendNode.js + PrismaAPI, logika biznesowaBaza danychPostgreSQLDane główneRealtimeSoketiCzat, live updatesPowiadomieniaNovu (self-hosted)Email, push, in-appStorageMinIOPliki, media, wideoObrazkiimgproxyResize, crop, WebPWideoFFmpeg (via BullMQ)TranskodowanieWyszukiwarkaMeilisearchFull-text searchQueue / CacheRedis + BullMQJoby w tle, cache
Lub inne najlepsze w 2026 pod mój hosting hetzner

