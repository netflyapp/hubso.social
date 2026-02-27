# Changelog — Hubso.social

## [0.30.0] — 2026-02-28

### 🔧 Sprint XI: Platform Polish

**Backend (`apps/api`):**
- **14 błędów TypeScript → 0** — audit i naprawa typów:
  - `auth.service.ts` — nullish coalescing dla `split('@')[0]`
  - `communities.service.ts` — `Array.isArray()` guard dla warunkowego select Prisma
  - `courses.controller.ts` — 8× explicit typing `@Request() req`
  - `courses.service.ts` — `Prisma.JsonNull` / `InputJsonValue` cast
  - `events.gateway.ts` — non-null assert na `socket.userId` po JWT verify
  - `presence.service.ts` — safe pipeline result destructuring
- **Nowy endpoint `GET /users`** — publiczna, paginowana lista członków z wyszukiwaniem

**Frontend (`apps/web`) — UX & Accessibility:**
- **~46 mutacji z toast notifications** — dodano `toast.success/error` z Sonner:
  - `useSpaces.ts` (8 mutacji), `useGamification.ts` (12), `useCourses.ts` (14), `usePlugins.ts` (10), `useVideo.ts` (2)
- **PostCard accessibility** — alt texty na avatarach (autor, komentarze, composer), `aria-label` na przyciskach (udostępnij, zapisz, wyślij komentarz), share button kopiuje link do schowka
- **Error handling** — try/catch + toast w admin/users (`handleRoleChange`, `handleStatusChange`, `load()`), admin/moderation (`load()`), search (`.catch(console.error)` → toast)
- **Members page** — zastąpiono mockMembers prawdziwym API (`GET /users`), TanStack Query, paginacja, wyszukiwanie, loading/error/empty states
- **Profil** — usunięto hardcoded cover photo (Unsplash), zostawiono gradient, `aria-label` na icon-only buttons
- **Reset hasła** — tłumaczenie EN→PL (10 stringów), error handling z catch + toast

**Bezpieczeństwo & Cleanup:**
- Usunięto `console.log("Reset password attempt:", data)` — wyciek email do konsoli przeglądarki
- Usunięto 3× debug `console.log` z `socket.ts` (connect/disconnect)
- Usunięto `console.error` z admin i moderation catch-ów (zastąpione toastami)

**Build:** ✅ API 0 TS errors, ✅ Next.js build OK

---

## [0.26.0] — 2026-02-27

### ✨ Sprint VII: Courses MVP (LMS)

**Baza danych (`packages/database`):**
- **5 nowych modeli Prisma:** `Course`, `CourseModule`, `Lesson`, `Enrollment`, `LessonProgress`
- **3 enumy:** `CourseStatus` (DRAFT/PUBLISHED/ARCHIVED), `CourseAccessType` (FREE/PAID/MEMBERS_ONLY), `EnrollmentStatus`
- Migracja `20260227075409_add_lms_courses` zastosowana
- Relacje: Course → Modules → Lessons, Course → Enrollments → LessonProgress, powiązanie z Community i User

**Backend (`apps/api`):**
- **CoursesService** (~684 linii) — pełna logika biznesowa LMS:
  - CRUD kursów z `slugify`, filtrowanie po statusie, stronicowanie
  - CRUD modułów z reorderowaniem (zmiana pozycji)
  - CRUD lekcji z sortowaniem po pozycji
  - Enrollment: zapisywanie/wypisywanie z kursów
  - Progress tracking: oznaczanie lekcji jako ukończonych, śledzenie watch time
  - `recalculateCourseProgress()` — automatyczne przeliczanie procentu ukończenia
- **CoursesController** (`/communities/:slug/courses`) — pełny REST API dla kursów, modułów, lekcji
- **EnrollmentsController** (`/enrollments/my`) — endpoint do pobierania zapisów użytkownika
- **CoursesModule** zarejestrowany w `AppModule`

**Frontend — Admin (`apps/web`, route group `(admin)`):**
- **Lista kursów** (`/admin/courses`) — selektor społeczności, filtry statusu (Draft/Published/Archived), karty kursów z akcjami
- **Tworzenie kursu** (`/admin/courses/new`) — formularz z auto-slug, cena, typ dostępu, miniatura
- **Edytor kursu** (`/admin/courses/[courseId]`) — zakładki Content/Settings, Course Builder z ModuleCard, drag & drop modułów/lekcji
- **Edytor lekcji** (`/admin/courses/lesson/[lessonId]`) — Tiptap rich text editor, URL wideo, toggleFree
- Nawigacja: ikona BookOpen + „Kursy" w sidebar admina

**Frontend — Learner (`apps/web`, route group `(platform)`):**
- **Katalog kursów** (`/courses`) — dwie zakładki:
  - „Moje kursy" — zapisane kursy z paskiem postępu, przycisk „Kontynuuj"
  - „Przeglądaj" — eksploracja kursów z selektorem społeczności, ceny, liczba modułów/uczestników
- **Strona kursu** (`/courses/[communitySlug]/[courseSlug]`) — hero z gradientem, statystyki (moduły, lekcje, uczestnicy), przycisk zapisu, ModuleAccordion z konspektem
- **Player kursu** (`/courses/[communitySlug]/[courseSlug]/learn`) — pełny interfejs nauki:
  - Zwijany sidebar z nawigacją po modułach/lekcjach, checkmarki ukończenia, progress bar
  - Odtwarzacz wideo, TiptapRenderer dla treści rich text
  - „Oznacz jako ukończone" z auto-przejściem do następnej lekcji
  - Nawigacja poprzednia/następna lekcja

**TanStack Query hooks (`useCourses.ts`):**
- Query hooks: `useCourses`, `useCourse`, `useMyEnrollments`, `useCourseProgress`
- Mutation hooks: `useCreateCourse`, `useUpdateCourse`, `useDeleteCourse`, `useCreateModule`, `useUpdateModule`, `useDeleteModule`, `useReorderModules`, `useCreateLesson`, `useUpdateLesson`, `useDeleteLesson`, `useEnroll`, `useUnenroll`, `useMarkLessonComplete`, `useUpdateWatchTime`
- `courseKeys` factory do zarządzania kluczami cache

**API (`coursesApi` w `api.ts`):**
- 18 endpointów RESTful z pełnymi interfejsami TypeScript
- Interfejsy: `Course`, `CourseModule`, `Lesson`, `Enrollment`, `LessonProgress`

**Fixes:**
- Next.js 15: Suspense boundary wrappers dla `useSearchParams()` w 3 stronach admina
- TypeScript strict: optional chaining na `useParams()`, `useSearchParams()`, non-null assertions na dostępie do tablic
- Iconify: `title` prop przeniesiony do wrapping `<span>`

---

## [0.25.0] — 2026-02-27

### ✨ Sprint VI: MinIO/S3 Storage System

**Backend (`apps/api`):**
- **S3StorageService** — pełna obsługa MinIO/S3-compatible storage:
  - `onModuleInit()` — automatyczne tworzenie bucketa przy starcie
  - `getPresignedUploadUrl(folder, filename, contentType)` — generuje URL do direct upload
  - `getPresignedDownloadUrl(storageKey)` — signed URL do pobierania
  - `uploadFile(folder, filename, buffer, contentType)` — server-side upload
  - `deleteFile(storageKey)`, `deleteByUrl(publicUrl)` — usuwanie plików
  - `healthCheck()` — monitoring dostępności storage
  - Graceful degradation gdy MinIO niedostępne (`_available` flag)
- **Presigned URL Endpoints** (`upload.controller.ts`):
  - `GET /upload/presigned?filename=&contentType=&folder=` — pobiera presigned URL
  - `POST /upload/confirm` — potwierdza upload i tworzy rekord MediaFile
  - `GET /upload/health` — health check S3/MinIO
  - Legacy `POST /upload` multipart zachowany dla backward compatibility
- **UpdateProfileInput** — dodano `avatarUrl?: string` do obsługi avatarów przez presigned URL

**Frontend (`apps/web`):**
- **FileUpload Component** (`components/upload/FileUpload.tsx`):
  - Drag-and-drop z react-dropzone
  - 3-krokowy flow: get presigned URL → PUT do S3 → confirm
  - Progress indicator z możliwością anulowania
  - Image preview dla plików graficznych
  - Error handling (za duży plik, nieprawidłowy typ)
  - Tryb circular dla avatarów
- **AvatarUpload Component** (`components/upload/AvatarUpload.tsx`):
  - Specjalizowany wrapper dla uploadów avatarów
  - Warianty rozmiarów: sm (64px), md (96px), lg (128px), xl (160px)
  - Accept: tylko obrazy, max 5MB, folder="avatars"
- **Upload API helpers** (`lib/api.ts`):
  - `uploadApi.getPresignedUrl()` — pobiera URL do direct upload
  - `uploadApi.confirmUpload()` — potwierdza upload
  - `uploadApi.uploadPresigned()` — pełny flow helper
  - `uploadApi.health()` — sprawdzanie dostępności storage
  - `usersApi.updateMe()` — dodano `avatarUrl` field

**Packages:**
- `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` — API
- `react-dropzone` — Web

**Docker (`docker/docker-compose.dev.yml`):**
- MinIO container: ports 9000 (API) + 9001 (console)
- Credentials: minioadmin/minioadmin
- Bucket: hubso-media

**Environment (`.env`):**
```
MINIO_ENDPOINT=http://localhost:9000
MINIO_PUBLIC_ENDPOINT=http://localhost:9000
MINIO_BUCKET=hubso-media
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

---

## [0.24.0] — 2026-02-27

### ✨ Sprint V: CASL Permissions, Meilisearch, Rich Text Mentions

**Backend (`apps/api`):**
- **CASL.js Permissions** — granularna kontrola dostępu:
  - Moduł `AbilitiesModule` z `CaslAbilityFactory`
  - Akcje: manage, create, read, update, delete, moderate, pin, feature
  - Role: SUPER_ADMIN, ADMIN, MODERATOR, MEMBER, GUEST
  - Zintegrowane z PostsController, CommentsController, CommunitiesController
- **Meilisearch Integration** — pełne wyszukiwanie full-text:
  - `SearchService` skonfigurowany z Meilisearch
  - Indeksy: posts, users, communities
  - Real-time sync przy create/update/delete
  - Filterable i sortable attributes

**Frontend (`apps/web`):**
- **Tiptap @Mentions** — mentions w rich text:
  - Extension `@tiptap/extension-mention` w TiptapEditor
  - Autocomplete popup z debounce search
  - Render mentionów jako styled chips
  - Parsowanie mentions przy tworzeniu postów

---

## [0.23.0] — 2026-02-26

### ✨ Sprint IV: Notifications, Search, Branding, Profile

**Backend (`apps/api`):**
- **Real-time Notifications** — `NotificationsModule` importuje `GatewayModule`:
  - `NotificationsService.create()` automatycznie emituje WebSocket event `notifications:receive`
  - Push natychmiastowy — nowe powiadomienia trafiają do klienta w czasie rzeczywistym
- **Post Search** — pełne wyszukiwanie postów:
  - Nowe pole `searchableText String?` w modelu `Post` (Prisma schema)
  - Helper `extractTextFromTiptap()` — rekurencyjna ekstrakcja tekstu z Tiptap JSON
  - `create()` i `createInSpace()` automatycznie populują `searchableText`
  - `SearchService` — ILIKE query na `searchableText` z relacjami (author, space, community)
  - Skrypt backfill `scripts/backfill-searchable.cjs` (jednorazowy)
- **User Posts Endpoint** — `GET /users/:id/posts`:
  - Nowa metoda `PostsService.findByUser(userId, page, limit)`
  - Filtr: `status: PUBLISHED`, `isFlagged: false`, posortowane `createdAt DESC`
  - Paginacja: `{ data, total, page, limit, pages }`

**Frontend (`apps/web`):**
- **Real-time Notification Bell** (`app-header.tsx`):
  - Dynamiczny badge z rzeczywistą liczbą nieprzeczytanych (cap: 99+)
  - `useQuery(['notifications-unread'])` z `refetchInterval: 60s`
  - WebSocket listener: `notifications:receive` → auto-invalidate + toast
- **Post Search UI** (`search/page.tsx`):
  - Nowa zakładka "Posty" w globalnym wyszukiwaniu
  - Karty wyników: avatar autora, snippet (120 znaków), community/space breadcrumb, data
  - `PostResult` interface z pełnym typowaniem
- **White-label Branding** (`/admin/branding`):
  - Panel branding z live preview (cover, logo, przyciski w kolorze marki)
  - Paleta 12 preset kolorów + custom color picker + hex input
  - Selektor fontów (6 opcji: Inter, Plus Jakarta Sans, DM Sans, Manrope, Outfit, Poppins)
  - Pola: Logo URL, Cover URL, Description
  - Community selector dla multi-community
  - Zapis przez `adminApi.updateBranding(slug, data)` + toast
- **Profile User Posts Tab** (`/profile/[id]`):
  - Komponent `UserPostsTab` — fetch `postsApi.byUser(userId)`
  - Karty postów: community link, space name, snippet (200 znaków), komentarze/reakcje, data
  - Statystyka "Posty" w profilu — rzeczywisty count z API (zamiast placeholder)
  - Empty state dla użytkowników bez postów

**API Client (`lib/api.ts`):**
- `notificationsApi.unreadCount()` — alias do getCount
- `postsApi.byUser(userId, page, limit)` — nowy endpoint
- `searchApi.search()` — pełne typowanie `posts` w odpowiedzi (zamiast `unknown[]`)

**Build & infra:**
- API build: ✅ NestJS compiled successfully
- Frontend build: ✅ Next.js 15 — 21 stron, 0 błędów
- Testy curl: `GET /users/:id/posts` ✅, `GET /search?q=TypeScript` ✅

---

## [0.22.0] — 2026-02-25

### ✨ Sprint III: Spaces System

**Backend (`apps/api`):**
- **SpacesModule** — kompletny moduł NestJS z 14 endpointami
- Space Groups CRUD: `GET/POST /communities/:slug/space-groups`, `PATCH/DELETE /space-groups/:id`
- Spaces CRUD: `GET/POST /communities/:slug/spaces`, `GET/PATCH/DELETE /spaces/:id`
- Membership: `POST /spaces/:id/join`, `DELETE /spaces/:id/leave`, `GET /spaces/:id/members`
- Space Posts: `GET /spaces/:id/posts` (paginated, pinned-first), `POST /spaces/:id/posts`
- `posts.service.ts` — `createInSpace()` i `findBySpace()` metody
- Guards: `OptionalJwtAuthGuard` dla reads, `AuthGuard('jwt')` dla writes
- Walidacja ról: owner/admin dla create/update/delete spaces i groups

**Frontend (`apps/web`):**
- **Spaces Tab** w Community Detail (`communities/[slug]`) — nowa zakładka:
  - Collapsible SpaceGroups z zagnieżdżonymi SpaceCards
  - Sekcja "Bez grupy" dla niezgrupowanych spaces
  - Create Space dialog — nazwa, opis, typ (POSTS/CHAT/EVENTS/LINKS/FILES), widoczność, grupa
  - Create Group dialog (admin-only)
  - Ikony typów + widoczności, Join/Leave/Owner buttons per space
- **Space Detail Page** (`/spaces/[id]`) — dedykowana strona space:
  - `SpacePostComposer` — inline Tiptap editor
  - `PostsView` — infinite-scroll feed z `useSpacePosts` hook
  - `PlaceholderView` — "coming soon" dla CHAT/EVENTS/LINKS/FILES
  - `MembersSidebar` — lista członków z role badges (max 20)
  - Header: back link, typ, nazwa, opis, statystyki, join/leave
  - Two-column layout: content + sidebar
- **Dynamic Sidebar Navigation** — `CommunitySpacesNav`:
  - Kontekstowe wyświetlanie (tylko w `/communities/:slug` context)
  - Collapsible grupy z ikonami typów i member counts
  - Active state highlighting dla `/spaces/:id`
- **API Client** — `spacesApi` (pełne CRUD + membership), `postsApi.bySpace()`, `postsApi.createInSpace()`
- **Hooks** — `useSpaces.ts` (12 TanStack Query hooks), `useSpacePosts()` infinite query

**TypeScript fixes:**
- `string | undefined` → icon fallback z `||` operator
- `useState<unknown>` → `useState<Record<string, unknown> | undefined>` (TiptapEditor)
- Regex match `match[1]` → `match[1] ?? null` (sidebar)

**Build:** ✅ API compiled, ✅ Next.js production build (20 stron, `/spaces/[id]` 264 kB)
**API Tests:** 14 endpoints spaces ✅, 2 endpoints space posts ✅ (curl verified)

---

## [0.21.0] — 2026-02-25

### ✨ Sprint II: Communities CRUD + Calendar View

**Backend (`apps/api`):**
- `PATCH /communities/:slug` — aktualizacja name/description/logoUrl/coverUrl/brandColor/brandFont (owner/admin only)
- `DELETE /communities/:slug` — usuwanie community z cascade (owner only)
- Walidacja ról: owner/admin dla update, owner-only dla delete
- `ForbiddenException` + `NotFoundException` z czytelnymi komunikatami

**Frontend (`apps/web`):**
- **Community Detail Page** (`communities/[slug]`) — 3 zakładki:
  - Posty — `useCommunityPosts` + `PostCard` + `PostComposer` z `fixedCommunitySlug`
  - Członkowie — grid z role badges, linki do profili, punkty + level
  - O nas — opis, właściciel, plan, data utworzenia
  - Header: cover image/gradient, logo/inicjały, member count, plan badge, Join/Leave/Owner
- **Community Settings Page** (`communities/[slug]/settings`) — edycja community:
  - Formularz: nazwa, opis, kolor marki (color picker + hex input)
  - Strefa zagrożenia — dwuetapowe usuwanie community (owner-only)
  - Guard: dostęp tylko dla OWNER/ADMIN
- **Calendar View** na Events page — toggle lista/kalendarz:
  - Siatka miesięczna z polskimi nazwami miesięcy i dni tygodnia
  - Nawigacja między miesiącami (prev/next)
  - Eventy renderowane jako kolorowe kafelki na dniach
  - Kliknięcie na dzień pokazuje szczegóły eventów (tytuł, czas, RSVP, iCal)
  - Obsługa pustych dni, "+N więcej" dla dni z wieloma eventami
- **API Client** — dodane `communitiesApi.update()` i `communitiesApi.remove()`
- **CommunityItem** interface — rozszerzony o `coverUrl`, `brandColor`, `brandFont`
- **PostComposer** — prop `fixedCommunitySlug` ukrywa selector community
- Link do ustawień (ikona ⚙️) w headerze community detail (warunkowo: owner/admin)

**Build fixes:**
- `PostCard` import → named export (`{ PostCard }`)
- Optional chaining na `useParams()`, `displayName`
- `force-dynamic` na `not-found.tsx`, admin layout
- Clean build: ✅ wszystkie 21 stron, zero błędów

**Build:** ✅ API compiled, ✅ Next.js production build
**API Tests:** PATCH community ✅, DELETE community ✅, Events page ✅

---

## [0.20.0] — 2026-02-25

### ✨ Sprint I: Tiptap Editor + Feed Rewrite + File Upload

**Backend (`apps/api`):**
- `UploadController` — `POST /upload` endpoint: JWT-protected, 10MB limit, obsługuje JPEG/PNG/WebP/GIF/SVG/MP4/WebM/PDF
- Tworzenie `MediaFile` w Prisma z metadanymi (originalName, size, mimetype)
- Automatyczna kategoryzacja plików do folderów: images/videos/files

**Frontend (`apps/web`):**
- **TiptapEditor** component — rich text editor z toolbar (bold, italic, strike, H2/H3, listy, blockquote, code, link)
- **TiptapRenderer** component — read-only renderer postów, fallback na plain text dla starszych formatów
- **PostComposer** component — tworzenie postów z community selector + TiptapEditor + publish button
- **PostCard** zaktualizowany — renderuje posty przez `TiptapRenderer` zamiast plain text
- **usePosts hooks** — kompletny rewrite z mock data na real API:
  - `useFeed()` — `useInfiniteQuery` z paginacją
  - `useCommunityPosts()` — `useInfiniteQuery` per community
  - `useCreatePost()`, `useDeletePost()`, `useToggleReaction()` — mutations z invalidation
- **Feed page** — kompletny rewrite:
  - PostComposer dla zalogowanych użytkowników
  - Infinite scroll z "Załaduj więcej"
  - Loading skeleton, error state, empty state
- **Upload API client** — `uploadApi.upload(file, communityId?)` w `api.ts`
- **UI components** — `Button` (6 wariantów, 4 rozmiary), `Skeleton` (animated)

**Build fixes:**
- Custom `pages/_error.tsx` — workaround dla Next.js 15 standalone build bug
- `not-found.tsx` — usunięto zależność od `asChild` (native `<Link>`)
- `global-error.tsx` → usunięte (konflikt z Next.js internal `_error`)
- Optional chaining na `pathname` i `searchParams` (5 plików)
- `force-dynamic` na 15 stronach klienckich (admin + platform)
- Zamiana `lucide-react` → `@iconify/react` w error pages
- Kolizja nazw `dynamic` w profile/[id] → `nextDynamic`

**Pakiety:**
- Zainstalowane: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-placeholder`, `@tiptap/extension-mention`, `@tiptap/extension-link`, `@tiptap/extension-image`, `@tiptap/extension-code-block-lowlight`, `@tiptap/pm`, `lowlight`

**Build:** ✅ API compiled, ✅ Next.js production build, ✅ Dev server (feed page kompiluje w 4.9s)
**API Tests:** Feed ✅ (7 postów), Post creation z Tiptap JSON ✅, Upload ✅

---

## [0.13.0] — 2026-02-23

### ✨ Sprint: Profile + Avatar Upload

**Backend (`apps/api`):**
- `StorageService` — disk-based file storage, swap-ready dla S3/MinIO
- `PATCH /users/me` — aktualizacja displayName, bio, username (conflict check na username)
- `POST /users/me/avatar` — multipart file upload (JPEG/PNG/WebP/GIF, limit 5 MB)
- Static file serving via `express.static` pod `/uploads`
- `API_URL` env var dodane do `.env`
- `@types/multer` zainstalowane jako devDependency

**Shared (`packages/shared`):**
- `updateProfileSchema` — walidacja Zod dla pól profilu (displayName, bio, username)

**Frontend (`apps/web`):**
- `usersApi.getById()`, `updateMe()`, `uploadAvatar()` w `api.ts`
- `EditProfileModal.tsx` — react-hook-form + Zod, avatar drag-and-drop upload z podglądem
- Strona profilu `[id]/page.tsx` — real API via TanStack Query, przycisk „Edytuj profil" dla własnego profilu, zakładki

**Testy:** 93/93 ✅ (+9 testów API profilu)

---

## [0.12.0] — 2026-02-22

### ✨ Sprint: Reactions System

**Backend (`apps/api`):**
- `ReactionsModule` — toggle reakcji (like/love/haha/wow/sad/angry) per post
- `GET /posts/:id/reactions` — lista reakcji z grupowaniem per typ
- `POST /posts/:id/reactions` — toggle (add/remove) reakcji zalogowanego użytkownika

**Shared (`packages/shared`):**
- Zod schemas dla reakcji: `reactionSchema`, `ReactionType`

**Frontend (`apps/web`):**
- `PostCard.tsx` pełny rewrite — optimistic update reakcji, live count per emoji
- Persystowane reakcje użytkownika (highlight aktywnej)

**Testy:** 84/84 ✅ (+8 testów reakcji)

---

## [0.11.0] — 2026-02-22

### ✨ Sprint: Comments System

**Backend (`apps/api`):**
- `CommentsModule` — CRUD komentarzy z zagnieżdżonymi odpowiedziami
- `GET /posts/:id/comments` — lista komentarzy z replies
- `POST /posts/:id/comments` — dodanie komentarza (opcjonalnie `parentId` dla odpowiedzi)
- `DELETE /comments/:id` — usunięcie własnego komentarza

**Frontend (`apps/web`):**
- `PostCard.tsx` — wydzielony komponent, sekcja komentarzy z rozwijaniem
- Optimistic count komentarzy po dodaniu/usunięciu
- Nested replies (1 poziom)

**Testy:** 77/78 ✅ (+7 testów komentarzy)

---

## [0.10.0] — 2026-02-22

### ✨ Sprint: Composer UX

**Frontend (`apps/web`):**
- Real avatar użytkownika w composer (z Zustand store)
- Community selector pills — wybór społeczności przy tworzeniu posta
- Sonner toasty po sukcesie/błędzie
- Skrót `Cmd+Enter` do wysłania posta
- Limit 500 znaków z live counterem

**Testy:** 65/65 ✅

---

## [0.9.0] — 2026-02-21

### ✨ Sprint: Posts API

**Backend (`apps/api`):**
- `PostsModule` — CRUD postów: create/list/get/delete
- `GET /posts/feed` — feed postów (paginacja, filtr per community)
- `POST /posts` — tworzenie posta (content, communityId opcjonalne)
- `DELETE /posts/:id` — usunięcie własnego posta

**Frontend (`apps/web`):**
- Strona feed używa real `postsApi.feed()` (TanStack Query)
- 6 demo postów w seedach

**Testy:** 65/65 ✅ (+6 testów postów)

---

## [0.8.0] — 2026-02-21

### ✨ Sprint: Communities CRUD

**Backend (`apps/api`):**
- `CommunitiesModule` — pełne CRUD społeczności
- `GET /communities` — lista (paginacja, search)
- `POST /communities` — tworzenie (tylko admin)
- `PATCH /communities/:id` — edycja
- `DELETE /communities/:id` — usunięcie

**Frontend (`apps/web`):**
- Strona `/communities` wired do real API
- Formularz tworzenia/edycji społeczności

**Testy:** 51/51 ✅

---

## [0.7.0] — 2026-02-21

### ✨ Sprint: Auth + Real-time Foundation

**Backend (`apps/api`):**
- `AuthModule` — JWT access (15min) + refresh tokens (7d)
- `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`
- `UsersModule` — `GET /users/me`
- WebSocket gateway — Socket.io, auth przez JWT w handshake
- Helmet.js + CORS + rate limiting

**Frontend (`apps/web`):**
- `useAuthStore` (Zustand) — login/logout/refresh
- TanStack Query provider
- Socket.io hook `useSocket`
- Auth pages: `/login`, `/register`

**Infrastruktura:**
- Docker: PostgreSQL 16, Redis 7, MinIO
- Prisma schema + pierwsza migracja

**Testy:** 42/42 ✅

---

## [0.6.0] — 2026-02-21

### ✨ Sprint: Frontend — 14 stron z HTML mockupów

- Konwersja 14 statycznych HTML → Next.js 15 App Router JSX
- Layout platformy: sidebar, topbar, typy tras `(platform)`
- Strony: home, feed, communities, groups, events, forums, courses, members, messages, notifications, profile, settings, admin
- Tailwind v3 + shadcn/ui + Framer Motion szkielet

---

## [0.5.0] — 2026-02-20

### 🎉 Inicjalizacja projektu

- Turborepo monorepo: `apps/web`, `apps/api`, `packages/shared`, `packages/database`
- Next.js 15 (App Router) + TypeScript strict
- NestJS 10 + TypeScript strict
- Prisma ORM + PostgreSQL
- pnpm workspaces
- ESLint + Prettier konfiguracja
