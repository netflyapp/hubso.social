Changelog – Hubso
==================

Ten dokument śledzi istotne zmiany w projekcie Hubso – od fazy discovery, przez planowanie, aż po kolejne iteracje produktu. 

Konwencja wersjonowania: semver (`MAJOR.MINOR.PATCH`). Wersje `0.x.x` opisują prace przed pierwszym publicznym MVP.

## 0.29.0 - Sprint X: Video Hosting — Bunny Stream (2026-02-28)

### Dodano
- **Bunny Stream Service** (`apps/api/src/video/bunny-stream.service.ts` ~280 linii):
  - Pełna integracja z Bunny Stream API (`https://video.bunnycdn.com`)
  - Zarządzanie cyklem życia wideo: `createVideo()`, `getVideoStatus()`, `deleteVideo()`, `listVideos()`
  - Upload: `getUploadCredentials()` (TUS protocol — bezpośredni upload z przeglądarki) + `uploadVideoBuffer()` (server-side)
  - URL builders: `getHlsUrl()`, `getThumbnailUrl()`, `getPreviewUrl()`, `getEmbedUrl()`, `getMp4Url()`
  - Mapowanie statusów: CREATED → UPLOADED → PROCESSING → TRANSCODING → FINISHED / ERROR
  - Konfiguracja: `BUNNY_STREAM_API_KEY`, `BUNNY_STREAM_LIBRARY_ID`, `BUNNY_STREAM_CDN_HOSTNAME`

- **Video Controller** (`apps/api/src/video/video.controller.ts` ~360 linii):
  - `POST /video/create` — tworzy placeholder + zwraca TUS upload credentials
  - `GET /video/:videoId/status` — polling statusu przetwarzania (aktualizuje DB)
  - `GET /video/:videoId` — info o wideo (z lokalnej bazy)
  - `DELETE /video/:videoId` — kasuje z Bunny + DB (owner-only)
  - `GET /video` — lista wideo z paginacją i filtrem community
  - `POST /video/webhook` — webhook Bunny Stream (encoding complete/error)
  - `GET /video/health` — status integracji

- **Video Module** (`apps/api/src/video/video.module.ts`):
  - Zarejestrowany w AppModule (29. moduł)
  - Eksportuje `BunnyStreamService` do użycia w innych modułach

- **Prisma Schema — rozszerzenia**:
  - `MediaFile`: `bunnyVideoId` (unique), `thumbnailUrl`, `hlsUrl`, `previewUrl`, `processingProgress`, `duration`, index na `[bunnyVideoId]`
  - `Lesson`: `bunnyVideoId`, `thumbnailUrl`, `hlsUrl` — denormalizacja dla szybkiego dostępu

- **Frontend API + Hooks** (`apps/web/src/lib/`):
  - `videoApi` w `api.ts` — `create()`, `getStatus()`, `getVideo()`, `deleteVideo()`, `listVideos()`, `health()`
  - Interfejsy: `VideoCreateResponse`, `VideoStatusResponse`, `VideoInfoResponse`, `VideoListResponse`
  - `useVideo.ts` — hooki TanStack Query: `useVideo()`, `useVideoStatus()` (auto-polling 3s), `useVideoList()`, `useVideoHealth()`, `useCreateVideo()`, `useDeleteVideo()`

- **Video Player** (`apps/web/src/components/video/video-player.tsx`):
  - `VideoPlayer` — Bunny embed (iframe) z fallback na natywny `<video>` + HLS
  - `VideoProcessing` — overlay z progress barem podczas kodowania
  - `SmartVideoPlayer` — auto-przełącza między PROCESSING/READY/FAILED
  - Click-to-play z poster/thumbnail

- **Video Upload** (`apps/web/src/components/video/video-upload.tsx`):
  - Pełny flow: wybór pliku → tworzenie placeholder → TUS upload z progress → polling statusu → gotowe
  - Drag & drop + click-to-select
  - Walidacja: formaty (MP4/WebM/MOV/AVI/MKV), max 2 GB
  - Stany: idle → creating → uploading → processing → ready / error
  - Anulowanie uploadu

- **Integracja z kursami**:
  - Edytor lekcji (`admin/courses/lesson/[lessonId]`) — `VideoUpload` zamiast pola URL
  - Istniejące wideo wyświetlane przez `SmartVideoPlayer`
  - Fallback: ręczne podanie URL (YouTube, Vimeo)
  - `updateLesson` + `createLesson` — obsługa `bunnyVideoId`, `thumbnailUrl`, `hlsUrl`

### Zmieniono
- `Lesson` interface (api.ts) — dodano `bunnyVideoId`, `thumbnailUrl`, `hlsUrl`
- `coursesApi.updateLesson` — rozszerzony o pola Bunny Stream
- `CoursesService` — `CreateLessonInput` + `UpdateLessonInput` z polami Bunny

### Konfiguracja
- `.env` — dodano sekcję `# Bunny Stream (Video Hosting)` z 3 zmiennymi env

---

## 0.28.0 - Sprint IX: Plugin System & SDK (2026-02-27)

### Dodano
- **Plugin SDK** (`packages/plugin-sdk/`):
  - `types.ts` (~350 linii) — pełne typowania SDK:
    - `PluginCategory` (13 wartości: LMS, E_COMMERCE, CRM, BOOKING, SOCIAL, ANALYTICS, AI, ...)
    - `PluginManifest` — manifest z wersją, autorem, zależnościami, cenami, zrzutami ekranu
    - `PluginRouter` + `PluginRouteDefinition` — rejestracja tras z auth i rolami
    - `SidebarAPI` + `SidebarItem` — dodawanie pozycji do sidebara (main/community/admin)
    - `SettingsAPI` + `SettingField` (8 typów: text/number/boolean/select/textarea/color/url/json)
    - `HookAPI` + `HubsoEvent` (30+ event'ów: user.*, community.*, post.*, comment.*, reaction.*, message.*, event.*, course.*, points.*, badge.*, level.*, challenge.*, plugin.*)
    - `WidgetAPI` + `WidgetDefinition` (6 placement'ów: dashboard.main/sidebar, profile, community, post.sidebar, footer)
    - `PermissionAPI`, `DatabaseAPI` (key-value store), `NotificationAPI`, `StorageAPI`, `UIRegistryAPI`
    - `HubsoPlugin` — główny interfejs (lifecycle: onInstall/Uninstall/Activate/Deactivate + registration methods)
    - `PluginContext` — kontekst iniekcji z settings, hooks, notifications, storage, database, logger
    - `PluginManifestSchema` — walidacja Zod
  - `index.ts` — eksporty + helpery: `definePlugin()`, `defineManifest()`, `validateManifest()`

- **Prisma Schema** — 4 nowe modele + 3 enum'y:
  - `Plugin` — katalog marketplace: pluginId (unique), name, category, pricing, price, icon, screenshots, tags, author*, downloads, rating, featured; indeksy na [category], [official], [featured]
  - `InstalledPlugin` — instalacja per community: pluginId FK→Plugin, communityId FK, status, version, config(Json); unique [pluginId, communityId]
  - `PluginSetting` — key-value store per zainstalowanej wtyczki; unique [installedPluginId, key]
  - `PluginHook` — subskrypcje event'ów per wtyczki; unique [pluginId, communityId, event]
  - Enum'y: `PluginStatus` (ACTIVE/INACTIVE/ERROR/INSTALLING/UPDATING), `PluginCategory` (13), `PluginPricing` (FREE/PAID/FREEMIUM)

- **PluginsService** (~450 linii):
  - Marketplace: `listPlugins()` (search/filter/paginate/sort), `getPlugin()`, `registerPlugin()`, `updatePlugin()`, `deletePlugin()`, `getMarketplaceStats()`
  - Instalacja: `installPlugin()` (walidacja zależności, inkrement downloads), `uninstallPlugin()` (dependency check), `getInstalledPlugins()`, `togglePluginStatus()`, `updatePluginConfig()`
  - Settings: `getPluginSettings()`, `setPluginSetting()` (upsert), `deletePluginSetting()`
  - Hooks: `registerHook()`, `getHooksForEvent()`, `getPluginHooks()`
  - Seed: `seedOfficialPlugins()` — 6 oficjalnych wtyczek (courses, gamification, shop, booking, analytics-pro, health-diary)

- **PluginsController** — 3 kontrolery:
  - `PluginsMarketplaceController` — publiczne przeglądanie: GET /plugins/marketplace, GET /stats, GET /:pluginId
  - `PluginsAdminController` — zarządzanie: POST /register, PATCH /:pluginId, DELETE /:pluginId, POST /seed
  - `CommunityPluginsController` — per community: GET/POST/DELETE/PATCH installed, settings, hooks

- **PluginsModule** — zarejestrowany w AppModule

- **Frontend API** (`api.ts`):
  - Interfejsy: `PluginItem`, `InstalledPluginItem`, `PluginSettingItem`, `MarketplaceStats`, `PaginatedPluginsResponse`
  - `pluginsApi` — marketplace (list/get/stats), admin (register/update/delete/seed), community (install/uninstall/toggle/config/settings/hooks)

- **React Hooks** (`usePlugins.ts`):
  - Query hooks: `useMarketplacePlugins()`, `usePlugin()`, `useMarketplaceStats()`, `useInstalledPlugins()`, `useInstalledPlugin()`, `usePluginSettings()`
  - Mutation hooks: `useInstallPlugin()`, `useUninstallPlugin()`, `useTogglePluginStatus()`, `useUpdatePluginConfig()`, `useSetPluginSetting()`, `useDeletePluginSetting()`, `useSeedOfficialPlugins()`, `useRegisterPlugin()`, `useDeletePlugin()`

- **Admin UI** (`/admin/plugins`):
  - Sekcja "Marketplace" — karty wtyczek z search, filter po kategorii/cenie, badge'ami (FREE/PAID/FREEMIUM), ikoną official, downloads, rating
  - Sekcja "Zainstalowane" — lista z toggle status (ACTIVE/INACTIVE), uninstall
  - Statystyki: total/official/free/installed
  - Przycisk "Załaduj oficjalne" — seed 6 wtyczek
  - Pełny dark mode support
  - Nawigacja w admin sidebar

### Zmiany
- Admin layout — dodano link "Wtyczki" (ikona Puzzle) w sidebar nawigacji
- Prisma schema — usunięto stary model Plugin (z communityId/slug), zastąpiono nowym systemem Plugin + InstalledPlugin

## 0.27.0 - Sprint VIII: Gamification System (2026-02-27)

### Dodano
- **Prisma Schema** — 7 nowych modeli gamifikacji:
  - `PointTransaction` — historia punktów z powodem, referencją i wartością
  - `Badge` — odznaki z kategorią, kolorem, kryteriami auto-przyznawania
  - `UserBadge` — relacja user↔badge z datą przyznania
  - `UserLevel` — poziom użytkownika w community (7 tier'ów: Nowicjusz → Legenda)
  - `UserStreak` — śledzenie daily streak z longest streak i bonusami
  - `Challenge` — wyzwania (STREAK/CUMULATIVE/ONE_TIME) z nagrodami
  - `ChallengeParticipation` — uczestnictwo w wyzwaniach z progress tracking
  - 6 enum'ów: `PointReason`, `BadgeCategory`, `UserLevelTitle`, `ChallengeType`, `ChallengeParticipationStatus`
  - Indeksy wydajnościowe: `[userId,communityId]`, `[totalPoints DESC]`, `[currentStreak DESC]`

- **GamificationService** (~750 linii):
  - System punktów: `awardPoints()` z auto-recalculate level + `deductPoints()`
  - 7 poziomów: NEWBIE(0) → BEGINNER(100) → INTERMEDIATE(300) → ADVANCED(700) → PRO(1500) → MASTER(3000) → LEGEND(6000)
  - Leaderboard z paginacją + `getUserRank()`
  - Streak tracking: consecutive day login, 7-day bonus (+5 pkt)
  - Badge system: auto-badges (criteria-based) + manual award/revoke
  - Challenges: CRUD + join/leave + progress tracking z auto-reward
  - `getGamificationProfile()` — pełny profil z level, streak, badges, recent points
  - `getGamificationStats()` — agregaty dla panelu admina

- **GamificationController** — 2 kontrolery:
  - User endpoints: leaderboard, profile, points history, badges, challenges, streak, stats
  - Admin endpoints: CRUD badges/challenges, grant/deduct points, award/revoke badges
  - Ścieżka: `/communities/:slug/gamification/[admin/]`

- **Frontend API Client** — `gamificationApi` (22 metody) + 12 interfejsów TypeScript
- **TanStack Query Hooks** — 11 query hooks + 10 mutation hooks w `useGamification.ts`

- **Strona Leaderboard** (`/leaderboard`) — hub gamifikacji z 4 zakładkami:
  - Ranking: podium top-3 + pełna tabela z medalami, avatarami, badge'ami poziomów
  - Odznaki: pogrupowane wg kategorii, earned vs unearned (grayscale)
  - Wyzwania: karty z dołącz/opuść, progress, nagrody punktowe
  - Profil: pasek postępu poziomu, streak, zdobyte odznaki, historia punktów

- **Panel Admin Gamifikacji** (`/communities/[slug]/gamification`) — 4 zakładki:
  - Przegląd: 5 kart statystyk (punkty, odznaki, wyzwania, aktywni)
  - Odznaki CRUD: formularz z color picker, kategoria, auto/manual, punkty
  - Wyzwania CRUD: typ, czas trwania, max uczestników, nagroda
  - Punkty: przyznaj/odejmij z opisem

- **Integracja punktów w serwisach**:
  - `PostsService.create()` / `createInSpace()` → `POST_CREATED` (+10 pkt)
  - `CommentsService.create()` → `COMMENT_CREATED` (+5 pkt)
  - `ReactionsService.toggle()` → `REACTION_GIVEN` (+1 pkt) + `REACTION_RECEIVED` (+2 pkt dla autora)
  - Fire & forget pattern z `.catch(() => {})` — błędy gamifikacji nie blokują core flow

- **Nawigacja** — dodano "Ranking" (solar:cup-star-linear) do sekcji "Wspólnota" w sidebarze

### Zmieniono
- `PostsModule`, `CommentsModule`, `ReactionsModule` — import `GamificationModule`
- `PostsService`, `CommentsService`, `ReactionsService` — `@Optional()` injection `GamificationService`

### Techniczne
- Build API: 0 błędów
- Build Web: 24 strony, 0 błędów
- Migracja: `20260227085805_add_gamification`

## 0.25.0 - Sprint VI: MinIO/S3 Storage System (2026-02-27)

### Dodano
- **S3StorageService** — pełna obsługa MinIO/S3-compatible storage:
  - `onModuleInit()` — automatyczne tworzenie bucketa przy starcie
  - `getPresignedUploadUrl(folder, filename, contentType)` — generuje URL do direct upload
  - `getPresignedDownloadUrl(storageKey)` — signed URL do pobierania
  - `uploadFile()`, `deleteFile()`, `deleteByUrl()` — operacje na plikach
  - `healthCheck()` — monitoring dostępności storage
  - Graceful degradation gdy MinIO niedostępne (`_available` flag)

- **Presigned URL Endpoints** (`upload.controller.ts`):
  - `GET /upload/presigned?filename=&contentType=&folder=` — pobiera presigned URL
  - `POST /upload/confirm` — potwierdza upload i tworzy rekord MediaFile
  - `GET /upload/health` — health check S3/MinIO
  - Legacy `POST /upload` multipart zachowany dla backward compatibility

- **FileUpload Component** (`components/upload/FileUpload.tsx`):
  - Drag-and-drop z react-dropzone
  - 3-krokowy flow: get presigned URL → PUT do S3 → confirm
  - Progress indicator z możliwością anulowania
  - Image preview, error handling, circular mode

- **AvatarUpload Component** (`components/upload/AvatarUpload.tsx`):
  - Specjalizowany wrapper dla uploadów avatarów
  - Warianty rozmiarów: sm, md, lg, xl
  - Accept: tylko obrazy, max 5MB

- **Upload API helpers** (`lib/api.ts`):
  - `uploadApi.getPresignedUrl()`, `uploadApi.confirmUpload()`, `uploadApi.uploadPresigned()`
  - `usersApi.updateMe()` — dodano `avatarUrl` field

### Pakiety dodane
- `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` — API
- `react-dropzone` — Web

### Docker
- MinIO container: ports 9000 (API) + 9001 (console)
- Bucket: `hubso-media`, Credentials: minioadmin/minioadmin

---

## 0.24.0 - Sprint V: CASL Permissions, Meilisearch, Mentions (2026-02-27)

### Dodano
- **CASL.js Permission System** — granularne uprawnienia na backendzie i frontendzie:
  - `CaslModule` (global) — `casl-ability.factory.ts` z 11 akcji × 21 subjects
  - `buildPlatformAbility(user)` — hierarchia ról GUEST → SUPER_ADMIN
  - `buildCommunityAbility(user, ctx)` — role w kontekście community (MEMBER → ADMIN)
  - `CaslAbilityService` z `forUser()`, `forCommunityMember()`, `forCommunityMemberBySlug()`
  - `@CheckPolicies(action, subject)` dekorator + `PoliciesGuard`
  - Migracja `AdminController` → CASL guards (odejście od ręcznego `role === 'ADMIN'`)
  - Migracja `CommunitiesService` — update/remove z CASL
  - Migracja `SpacesService` — 6 metod z `requireAdminRole()` → CASL `ability.can()`
  - Migracja `GroupsService` — fallback: sprawdza rolę w grupie, potem CASL community admin
  - JWT payload rozszerzony o `role`
  - `GET /auth/me/permissions` — endpoint zwracający CASL rules
  - Frontend: `@casl/ability` + `usePermissions()` / `useCommunityPermissions()` hooks
  - Frontend: `<Can action="..." subject="...">` — deklaratywny komponent uprawnień

- **Meilisearch Integration** — pełnotekstowe wyszukiwanie:
  - Docker container `hubso-meilisearch` (port 7700)
  - `MeilisearchService` — 3 indeksy: `posts`, `users`, `communities`
  - Konfiguracja searchable/filterable/sortable attributes per indeks
  - Meilisearch-first search z automatycznym fallback na PostgreSQL ILIKE
  - `GET /search/health` — status Meilisearch
  - `POST /search/reindex` — pełna reindeksacja (admin-only via CASL)
  - Graceful degradation — `_available` flag, brak crash gdy Meilisearch niedostępny
  - Response zawiera `"source": "meilisearch"` / `"source": "postgres"`

- **Rich Text @Mentions** — Tiptap mention extension:
  - `MentionList.tsx` — dropdown z awatarem, display name, @username
  - `mention-extension.ts` — konfiguracja `@tiptap/extension-mention` + `tippy.js`
  - Integracja z `TiptapEditor.tsx` — wpisanie `@` odpala suggestions z `/search/suggestions`
  - CSS styling `.mention` + `.mention-suggestion` — theme-aware (HSL variables)

### Zbudowano / zweryfikowano
- API: NestJS `nest build` ✅
- Frontend: Next.js `next build` — 21+ stron, 0 błędów ✅
- `GET /search/health` → `{"meilisearch":{"available":true,"healthy":true}}` ✅
- `POST /search/reindex` → `{"indexed":{"users":6,"communities":5,"posts":8}}` ✅
- `GET /search?q=test` → wyniki z `"source":"meilisearch"` ✅
- `GET /auth/me/permissions` → CASL rules ✅

### Pakiety dodane
- `@casl/ability` (API + Web), `@casl/prisma` (API)
- `meilisearch` (API)
- `tippy.js` (Web)

## 0.23.0 - Sprint IV: Notifications, Search, Branding, Profile (2026-02-26)

### Dodano
- **Real-time Notifications** — WebSocket push via `EventsGateway`:
  - Automatyczny push `notifications:receive` po utworzeniu powiadomienia
  - Dynamiczny badge w headerze (rzeczywista liczba nieprzeczytanych, cap 99+)
  - `useQuery` z `refetchInterval: 60s` + WebSocket auto-invalidation
- **Post Search** — pełne wyszukiwanie pełnotekstowe postów:
  - Pole `searchableText` w modelu `Post` (Prisma schema)
  - `extractTextFromTiptap()` — recurencyjna ekstrakcja tekstu z Tiptap JSON
  - ILIKE query w `SearchService` z relacjami (author, space, community)
  - Zakładka "Posty" w globalnym wyszukiwaniu z kartami wyników
  - Skrypt backfill dla istniejących danych (`scripts/backfill-searchable.cjs`)
- **User Posts Endpoint** — `GET /users/:id/posts`:
  - `PostsService.findByUser()` z paginacją i filtrami (PUBLISHED, nie flagged)
- **White-label Branding UI** — `/admin/branding`:
  - Live preview (cover, logo, przyciski w brand color)
  - 12 preset kolorów + custom color picker + hex input
  - Font selector (6 fontów z preview)
  - Logo URL, Cover URL, Description
  - Multi-community selector + save via API
- **Profile User Posts Tab** — `/profile/[id]`:
  - Komponent `UserPostsTab` z kartami postów
  - Rzeczywisty post count w statystykach profilu
  - Empty state

### Zbudowano / zweryfikowano
- API: NestJS `nest build` ✅
- Frontend: Next.js `next build` — 21 stron, 0 błędów ✅
- `GET /users/:id/posts` — curl test ✅
- `GET /search?q=TypeScript` — curl test ✅ (zwraca posty z searchableText)

## 0.22.0 - Sprint III: Spaces System (2026-02-25)

### Dodano
- **SpacesModule** — kompletny NestJS moduł z 14 endpointami:
  - Space Groups CRUD: `GET/POST /communities/:slug/space-groups`, `PATCH/DELETE /space-groups/:id`
  - Spaces CRUD: `GET/POST /communities/:slug/spaces`, `GET/PATCH/DELETE /spaces/:id`
  - Membership: `POST /spaces/:id/join`, `DELETE /spaces/:id/leave`, `GET /spaces/:id/members`
  - Space Posts: `GET /spaces/:id/posts`, `POST /spaces/:id/posts`
- **Spaces Tab** w Community Detail — zakładka "Spaces" z:
  - Collapsible SpaceGroups z zagnieżdżonymi SpaceCards
  - Sekcja "Bez grupy" dla niezgrupowanych spaces
  - Create Space dialog (nazwa, opis, typ, widoczność, przypisanie do grupy)
  - Create Group dialog (admin-only)
  - Ikony typów: POSTS, CHAT, EVENTS, LINKS, FILES
  - Join/Leave/Owner buttons per space
- **Space Detail Page** (`/spaces/[id]`) — pełna strona space:
  - `SpacePostComposer` — inline Tiptap editor do tworzenia postów w space
  - `PostsView` — infinite-scroll feed z `useSpacePosts` hook
  - `PlaceholderView` — "coming soon" dla CHAT/EVENTS/LINKS/FILES
  - `MembersSidebar` — lista członków z role badges
  - Header: typ, nazwa, opis, statystyki, join/leave
  - Two-column layout: content + sidebar
- **Dynamic Sidebar Navigation** — `CommunitySpacesNav` w app-sidebar:
  - Kontekstowe wyświetlanie — pojawia się gdy user jest w `/communities/:slug`
  - Collapsible grupy z ikonami typów i member counts
  - Active state highlighting dla `/spaces/:id`
  - Link "Wszystkie" do community detail
- `spacesApi` w frontend API client — pełne metody CRUD + membership
- `useSpaces.ts` — 12 TanStack Query hooks (queries + mutations)
- `useSpacePosts()` — infinite query dla postów w space
- `postsApi.bySpace()` i `postsApi.createInSpace()` w API client

### Backend
- `posts.service.ts`: `createInSpace()` — tworzenie posta bezpośrednio w space
- `posts.service.ts`: `findBySpace()` — paginated posts z pinned-first ordering
- `posts.controller.ts`: 2 nowe endpointy (GET/POST `/spaces/:id/posts`)
- Guards: `OptionalJwtAuthGuard` dla reads, `AuthGuard('jwt')` dla writes
- Walidacja ról: owner/admin dla create/update/delete spaces i groups

### Naprawiono
- TypeScript: `string | undefined` → icon prop fix z `||` fallback
- TypeScript: `useState<unknown>` → `useState<Record<string, unknown> | undefined>` dla TiptapEditor content
- TypeScript: `match[1]` → `match[1] ?? null` dla regex nullable group w sidebar

### Build
- ✅ API: `npx nest build` — success
- ✅ Frontend: `npx next build` — 20 stron, w tym `/spaces/[id]` (264 kB)
- ✅ Testy curl: wszystkie 14 endpointów spaces + 2 endpointy space posts

## 0.21.0 - Sprint II: Communities CRUD + Calendar View (2026-02-25)

### Dodano
- `PATCH /communities/:slug` — aktualizacja name/description/logoUrl/coverUrl/brandColor/brandFont (owner/admin)
- `DELETE /communities/:slug` — usuwanie community z cascade (owner-only)
- Community Detail Page (`communities/[slug]`) — 3 zakładki: Posty, Członkowie, O nas
- Community Settings Page (`communities/[slug]/settings`) — edycja + strefa zagrożenia z dwuetapowym usuwaniem
- Calendar View na Events page — siatka miesięczna z nawigacją, eventami na dniach, szczegółami po kliknięciu
- Toggle lista/kalendarz z persystentnym widokiem
- `communitiesApi.update()` i `communitiesApi.remove()` w API client
- `CommunityItem` interface rozszerzony o `coverUrl`, `brandColor`, `brandFont`
- `PostComposer` prop `fixedCommunitySlug` ukrywa selector community

### Naprawiono
- `PostCard` import zmieniony na named export
- Optional chaining na `useParams()`, `displayName` w community pages
- `force-dynamic` na `not-found.tsx` i admin layout (build fix)
- Clean production build: 21 stron, zero błędów

## 0.19.0 - Sprint H: Polish & Deploy: 19/19 testów (2026-02-24)

### Dodano
- `GlobalExceptionFilter` — ujednolicony format błędów API: `{statusCode, error, message, timestamp, path}`
- `ValidationPipe` globalny — whitelisting + transform dla wszystkich endpointów
- Next.js `global-error.tsx` — root-level error boundary z `<html><body>` (wymagane przez Next.js)
- Next.js `not-found.tsx` — polska strona 404 z przyciskami nawigacyjnymi
- Next.js `(platform)/error.tsx` — error boundary dziedziczący layout platformy
- Next.js `(platform)/loading.tsx` — skeleton loading: `PostCardSkeleton` × 5
- `apps/web/src/app/sitemap.ts` — dynamiczny sitemap (statyczne + `/communities/:slug` z API)
- `apps/web/src/app/robots.ts` — robots.txt: allow `/`, disallow `/api/`, `/admin/`, `/_next/`
- `apps/web/src/app/manifest.ts` — PWA manifest: `start_url: '/feed'`, ikony 192/512, `lang: 'pl'`
- Root `layout.tsx`: `lang="pl"`, metadataBase, OpenGraph (`pl_PL`), Twitter card, `themeColor`, `appleWebApp`
- `packages/database/prisma/seed.mjs` — dane demo: 5 użytkowników, 5 społeczności, 6 postów, 5 komentarzy, 2 wydarzenia, 1 grupa
- Dane testowe: `test@hubso.pl` / `Test1234!` (rola ADMIN)

### Techniczne
- `packages/database/package.json`: dodano `bcryptjs` (ESM), `tsx`, script `db:seed` → `node prisma/seed.mjs`
- `seed.mjs` jako pure ES module — workaround dla ts-node/esm broken na Node.js 25.x
- API kompiluje się do `dist/apps/api/src/main.js` (Turborepo monorepo path structure)
- Uruchamianie API: `node dist/apps/api/src/main.js` z katalogu `apps/api/` (wczytuje `.env`)

### Testy (19/19 ✅)
- Health, Swagger `/api/docs` + `/api/docs-json`
- GlobalExceptionFilter: `statusCode`, `message`, `timestamp`, `path` w błędach 404
- Auth: login → accessToken, `/users/me` → 401 bez tokena, 200 z tokenem
- Seed data: 5+ społeczności z `brandColor`
- Helmet: `x-content-type-options`, `x-frame-options`
- CORS: `localhost:3000` dozwolony

## 0.18.0 - Sprint G: Admin Panel + Global Search: 25/25 testów (2026-02-24)

### Dodano

- **Sprint G — Admin Panel (backend):**
  - [x] `AdminService`: `getStats()` (totalUsers, totalPosts, totalCommunities, flaggedPosts, postsActivity 7d, userGrowth 30d), `getUsers()` (paginacja, search, filtr roli/statusu), `updateUser()`, `deleteUser()`, `getModerationQueue()`, `flagPost()`, `approvePost()`, `rejectPost()`, `updateCommunityBranding()`
  - [x] `AdminController`: 11 endpointów — `GET /admin/stats`, `GET/PATCH/DELETE /admin/users/:id`, `GET /admin/moderation`, `POST /admin/moderation/:id/flag|approve|reject|unflag`, `PATCH /admin/communities/:slug/branding`
  - [x] `AdminModule` zarejestrowany w `AppModule`
  - [x] `AdminGuard` — sprawdza role `ADMIN | SUPER_ADMIN | MODERATOR`; 401 bez tokena, 403 bez uprawnień

- **Sprint G — Global Search (backend):**
  - [x] `SearchService`: `search()` (ILIKE po users + communities), `searchMembers()` (paginowana lista z filtrami), `suggestions()` (top-5 dla Cmd+K)
  - [x] `SearchController`: 3 endpointy — `GET /search?q=&type=all|users|communities|posts&limit=`, `GET /search/suggestions?q=` (JWT), `GET /search/members/:communityId?q=&role=&page=&limit=` (JWT)
  - [x] `SearchModule` zarejestrowany w `AppModule`
  - [x] Minimalna długość query: 2 znaki — krótsze zwracają puste tablice (bez błędu)

- **Sprint G — Rozszerzenia serwisów:**
  - [x] `UsersService`: `socialLinks` dodany do `UpdateProfileInput` i wszystkich 4 select-ów (`findMe`, `findById`, `updateMe`, `updateAvatar`)
  - [x] `CommunitiesService`: `coverUrl`, `brandColor`, `brandFont` dodane do `findAll()` i `findBySlug()` select-ów

- **Sprint G — Prisma schema:**
  - [x] `User.socialLinks Json?` — przechowuje obiekt `{ twitter, github, linkedin, ... }`
  - [x] `Community.brandColor String?`, `brandFont String?`, `coverUrl String?`
  - [x] `Post.isFlagged Boolean @default(false)` — flaga moderacji
  - [x] Migracja: `20260224110833_sprint_g_admin_search`

- **Sprint G — Frontend (Admin Panel):**
  - [x] `apps/web/src/app/(admin)/layout.tsx` — Admin sidebar: Dashboard / Użytkownicy / Moderacja / Branding + link "Powrót do aplikacji"
  - [x] `apps/web/src/app/(admin)/admin/page.tsx` — Dashboard: 4 stat-karty + `BarChart` (postsActivity 7d) + `LineChart` (userGrowth 30d) via Recharts
  - [x] `apps/web/src/app/(admin)/admin/users/page.tsx` — Tabela użytkowników (paginacja 20/stronę), search + filtr roli/statusu (debounce 300ms), inline edycja roli i statusu
  - [x] `apps/web/src/app/(admin)/admin/moderation/page.tsx` — Kolejka moderacji: podgląd treści z Tiptap JSON, przyciski Approve / Reject / Unflag

- **Sprint G — Frontend (Search + CommandPalette):**
  - [x] `apps/web/src/app/(platform)/search/page.tsx` — Strona wyników z debounce, zakładki Wszystko/Użytkownicy/Społeczności, karty wyników
  - [x] `apps/web/src/components/CommandPalette.tsx` — Overlay Cmd+K (⌘K / Ctrl+K), nawigacja klawiaturą (↑↓↵ESC), suggestions via `searchApi.suggestions()`
  - [x] `apps/web/src/hooks/use-debounce.ts` — hook `useDebounce<T>(value, delay)` — 300ms domyślnie
  - [x] `apps/web/src/lib/utils.ts` — helper `cn(...inputs)` via clsx
  - [x] `apps/web/src/app/(platform)/layout.tsx` — dodano `<CommandPalette />`

- **Sprint G — API client (`apps/web/src/lib/api.ts`):**
  - [x] `adminApi`: `stats()`, `users(params)`, `updateUser(id, data)`, `deleteUser(id)`, `moderation(params)`, `flagPost(id)`, `unflagPost(id)`, `approvePost(id)`, `rejectPost(id)`, `updateBranding(slug, data)`
  - [x] `searchApi`: `search(q, type, limit)`, `suggestions(q)`, `members(communityId, params)`

### Naprawiono

- `sprint-g-tests.js`: poprawiono wzorzec auth — `register` zwraca `{ id, email, username }` bez `accessToken`; wszystkie funkcje testowe wykonują teraz osobny krok `login` po rejestracji
- `admin.controller.ts`: dodano brakujący endpoint `POST /admin/moderation/:postId/unflag` → `adminService.flagPost(postId, false)`
- Deployment: `search/page.tsx` wymaga owinięcia w `<Suspense>` ze względu na `useSearchParams()` w Next.js App Router

### Zmiany

- Liczba testów Sprint G: **25/25** (10 search, 4 socialLinks, 3 branding, 8 admin security) — plik `/tmp/pw-hubso/sprint-g-tests.js`
- Wszystkie 25/25 testów Sprint G przechodzi pomyślnie
- Uwaga: główny plik testowy `/tmp/pw-hubso/auth-test.js` (Sprinty A-F, 160 testów) został przypadkowo wyczyszczony podczas sesji (0 bajtów) — testy Sprint G przetestowane jako standalone

## 0.17.0 - Sprint F: Groups & Events: 160/160 testów (2026-02-24)

### Dodano

- **Sprint F — Groups (backend):**
  - [x] `GroupsService`: `findByCommunity()`, `findById()`, `create()`, `update()`, `delete()`, `join()`, `leave()`, `getMembers()`, `removeMember()`
  - [x] `GroupsController`: 9 endpointów — `GET /groups?communityId`, `POST /groups`, `GET /groups/:id`, `PATCH /groups/:id`, `DELETE /groups/:id`, `POST /groups/:id/join`, `DELETE /groups/:id/leave`, `GET /groups/:id/members`, `DELETE /groups/:id/members/:userId`
  - [x] `GroupsModule` zarejestrowany w `AppModule`

- **Sprint F — Events (backend):**
  - [x] `EventsService`: `findBySpace()`, `findUpcoming()`, `findById()`, `create()`, `update()`, `delete()`, `rsvp()`, `cancelRsvp()`, `listAttendees()`, `buildIcal()`
  - [x] `EventsController`: 10 endpointów — `GET /events?spaceId`, `GET /events/upcoming`, `GET /events/:id`, `GET /events/:id/ical`, `GET /events/:id/attendees`, `POST /events`, `PATCH /events/:id`, `DELETE /events/:id`, `POST /events/:id/rsvp`, `DELETE /events/:id/rsvp`
  - [x] `EventsModule` zarejestrowany w `AppModule`
  - [x] iCal export (`text/calendar` VCALENDAR format)
  - [x] Email notification przy tworzeniu eventu
  - [x] `EventsService.create()` obsługuje zarówno `spaceId` jak i `communityId` (fallback: auto-resolve pierwszej przestrzeni w community)

- **Sprint F — Frontend:**
  - [x] `apps/web/src/app/(platform)/groups/page.tsx` — przepisano z mock data na TanStack Query + `GroupsApi`; `CreateGroupDialog`, join/leave mutations, skeleton loader
  - [x] `apps/web/src/app/(platform)/events/page.tsx` — przepisano z mock data na TanStack Query + `EventsApi`; `CreateEventDialog` (z polem endsAt), RSVP mutations, iCal download
  - [x] `packages/shared/src/api.ts` — dodano typy `GroupItem`, `GroupMemberItem`, `EventItem` + `groupsApi` (9 metod) + `eventsApi` (10 metod)

### Naprawiono

- `EventsService.create()` — gdy podany `spaceId` nie istnieje jako Space.id, serwis automatycznie szuka pierwszej przestrzeni w community o danym `communityId`, aby umożliwić proste tworzenie eventów z frontendu
- Test E2E "Communities page — lista zawiera co najmniej 1 community z API" — zmieniono z `waitUntil: 'networkidle'` na `waitUntil: 'load'` (Socket.io blokował networkidle), dodano fallback na dowolne karty community (nie tylko seed data)
- Test `POST /groups → 201` — fix błędu "Body has already been read" (usunięto `await r.text()` ze stringa asercji)

### Zmiany

- Liczba testów: 135 → **160** (dodano 25 testów Sprint F: 12 Groups + 13 Events)
- Wszystkie 160/160 testów przechodzi pomyślnie

## 0.16.0 - Sprint E: Group Chat + Online Presence + Read Receipts + Email Notifications: 135/135 testów (2026-02-24)

### Dodano

- **Sprint E — Group Chat:**
  - [x] `MessagesService`: `createGroup()` (tworzy konwersację GROUP, min. 2 uczestników), `updateGroup()` (patch name/avatarUrl, tylko dla GROUP), `addParticipant()` (idempotent), `removeParticipant()`, `leaveGroup()` (self-removal)
  - [x] `MessagesService`: `markConversationRead()` — REST endpoint do oznaczania wiadomości jako przeczytanych, zwraca `{ markedRead, conversationId }`
  - [x] `MessagesController`: 6 nowych endpointów — `POST /conversations/group`, `POST /conversations/:id/read`, `PATCH /conversations/:id/group`, `POST /conversations/:id/participants`, `DELETE /conversations/:id/participants/:userId`, `DELETE /conversations/:id/leave`
  - [x] Prisma schema: dodano `avatarUrl String?` do modelu `Conversation`; migracja `20260223221635_sprint_e_group_chat`

- **Sprint E — Online Presence (Redis):**
  - [x] `PresenceService`: `setOnline()`, `setOffline()`, `isOnline()`, `getPresence()` (batch), `heartbeat()` (TTL refresh), `getOnlineUserIds()` — Redis SETEX + ZADD, TTL 60s, graceful degradation przy niedostępności Redis
  - [x] `PresenceController` (`@Controller('presence')`): `GET /presence?ids=...` → `Record<string, boolean>`, `GET /presence/me` → `{ userId, online }`
  - [x] `PresenceModule` + rejestracja w `app.module.ts` i `GatewayModule`
  - [x] `EventsGateway`: `handleConnection` wywołuje `setOnline()` + emituje `presence:update` (nowe) i `user:online` (legacy); `handleDisconnect` analogicznie z `setOffline()`; handler `presence:heartbeat` — odświeża TTL; handler `messages:read` — wywołuje `markConversationRead()` przez WebSocket

- **Sprint E — Email Notifications (Nodemailer + MJML):**
  - [x] `MailService`: Nodemailer z Ethereal SMTP w dev / real SMTP w prod; `sendNewMessageNotification()` i `sendNotificationEmail()` z MJML templates; fire-and-forget, nigdy nie rzuca błędem
  - [x] `MailModule` + rejestracja w `MessagesModule` i `app.module.ts`
  - [x] Nowe zależności: `ioredis`, `nodemailer`, `mjml`, `@types/nodemailer`, `@types/mjml`

- **Sprint E — Frontend:**
  - [x] `api.ts`: `ConversationItem.avatarUrl`, `conversationsApi` — nowe metody: `createGroup`, `updateGroup`, `addParticipant`, `removeParticipant`, `leaveGroup`, `markRead`; nowy obiekt `presenceApi` (`get`, `me`)
  - [x] `messages/page.tsx`: przepisany z Group Chat UI — `CreateGroupDialog` (modal z nazwą + lista ID uczestników), `OnlineIndicator` (zielona/szara kropka), wskaźnik online/offline w nagłówku DM, badge "G" (Users icon) dla grup, batch presence fetch przy ładowaniu listy, listener `presence:update` przez Socket.io, `presence:heartbeat` co 30s, `markRead` przy otwarciu konwersacji, sender avatar dla wiadomości grupowych

- **Sprint E — Naprawiono:**
  - [x] `PresenceController`: zmiana prefix z `users/presence` na `presence` — rozwiązuje kolizję z `GET /users/:id` w `UsersController`
  - [x] `start-api.sh`: helper script `/tmp/start-api.sh` dla uruchamiania API z env variables (bez problemów ze spacjami w ścieżce)

### Testy
  - [x] 16 nowych testów E2E Sprint E: group create/validate, group messages, PATCH group name, add/remove participant, leave, mark read, DM guard, presence GET/me, 401 guards
  - [x] Łącznie: **135/135 testów ✅** (było 119/119)

---

## 0.15.0 - Direct Messages (DM Sprint): 119/119 testów (2026-02-23)

### Dodano

- **Sprint D — Direct Messages (1:1, real-time):**
  - [x] `MessagesService`: `getConversations()`, `getOrCreateDm()`, `getMessages()` (cursor pagination + auto-markRead), `sendMessage()`, `deleteMessage()`, `getUnreadCounts()` — helper `_assertParticipant()` do autoryzacji
  - [x] `MessagesController`: 6 endpointów (GET/POST /conversations, POST /conversations/dm, GET /conversations/unread, GET/POST /conversations/:id/messages, DELETE /messages/:id)
  - [x] `MessagesModule`: zarejestrowany w `app.module.ts` i `GatewayModule`
  - [x] `EventsGateway` — aktualizacja: `handleSendMessage()` jest teraz `async`, persystuje wiadomości do bazy przez `MessagesService.sendMessage()`, emituje prawdziwy obiekt DB do rozmowy, obsługuje błędy przez `socket.emit('messages:error', ...)`
  - [x] Frontend `api.ts`: typy `MessageSender`, `MessageItem`, `ConversationItem`, `MessagesResponse` + `conversationsApi` (6 metod)
  - [x] Frontend `messages/page.tsx`: przepisany z mocków na prawdziwe API — `useQuery` dla conversations/messages, `useMutation` REST fallback, Socket.io events (`messages:receive`, `messages:typing-indicator`), skeleton loading, empty state, auto-scroll, typing indicator "pisze..."
  - [x] 9 nowych testów E2E: DM creation, idempotency, list, send/get messages, unread counts, delete, 401 guards

### Naprawiono
  - [x] Playwright browser testy (Comments + Feed): dodano fallback injection tokenów JWT przez localStorage + cookies gdy redirect do /login w dev mode
  - [x] TypeScript: `messages/page.tsx` — poprawne importy `useAuthStore`, `socketService`, `socketService.connect(token)`

## 0.14.0 - Follow/Unfollow + Notifications + Community Members: 110/110 testów (2026-02-23)

### Dodano

- **Sprint A — Follow system:**
  - [x] Prisma schema: model `Follow` (composite PK: followerId+followingId) z indeksami
  - [x] User model: pola `followersCount Int @default(0)`, `followingCount Int @default(0)`, relacje `following`/`followers`
  - [x] Migracja: `20260223164126_add_follow_notifications`
  - [x] `FollowsService`: `follow()`, `unfollow()`, `getFollowers()`, `getFollowing()`, `isFollowing()` — transakcyjne aktualizacje liczników
  - [x] `FollowsController`: POST /users/:id/follow, DELETE /users/:id/follow, GET /users/:id/followers, GET /users/:id/following
  - [x] `FollowsModule`: zarejestrowany w `app.module.ts`, importuje `NotificationsModule`
  - [x] Self-follow guard (400), idempotentność (409 przy podwójnym follow)
  - [x] `OptionalJwtAuthGuard` na GET /users/:id → `isFollowedByMe` w odpowiedzi

- **Sprint B — Notifications:**
  - [x] `NotificationType` enum: nowe wartości `FOLLOW`, `COMMUNITY_JOIN`
  - [x] `NotificationsService`: `create()`, `findAll()`, `getUnreadCount()`, `markRead()`, `markAllRead()`
  - [x] `NotificationsController`: GET /notifications, GET /notifications/count, PATCH /notifications/:id/read, POST /notifications/read-all
  - [x] `NotificationsModule`: zarejestrowany w `app.module.ts`
  - [x] Follow → automatyczne powiadomienie FOLLOW dla obserwowanego użytkownika
  - [x] Frontend: `notifications/page.tsx` — pełny UI z oznaczaniem przeczytanych, 9 typów ikon, polling co 30s

- **Sprint C — Community Members:**
  - [x] `CommunitiesService.getMembers(slug)` — zwraca tablicę `{...user, role, joinedAt, points, level}`
  - [x] GET /communities/:slug/members (opcjonalny JWT)
  - [x] Frontend: `CommunityMemberItem` interface i `communitiesApi.getMembers()` w api.ts

- **Frontend:**
  - [x] `MeResponse` zaktualizowany: `followersCount`, `followingCount`, `isFollowedByMe?`
  - [x] `followsApi`, `notificationsApi` w `apps/web/src/lib/api.ts`
  - [x] Profile page przepisany: przycisk follow/unfollow z optymistycznym updatem (TanStack Mutation), zakładka `FollowersTab`
  - [x] Realny `followersCount`/`followingCount` w profilach

- **Testy:** 110/110 ✅ (93 → 110 +17 nowych testów: 8 follows + 5 notifications + 4 community members)

---

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

