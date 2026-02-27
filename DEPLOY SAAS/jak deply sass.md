# Hubso.social — Deployment SaaS na Hetzner + Coolify

> Dokument referencyjny: architektura deploymentu, multi-tenancy, aktualizacje.
> Data utworzenia: 23 lutego 2026

---

## 1. Stack Infrastruktury

```
Hetzner VPS (rekomendacja: CCX33 — 8 vCPU, 32GB RAM)
└── Coolify (self-hosted PaaS, zarządza deploymentem)
    ├── Traefik (reverse proxy + auto SSL via Let's Encrypt)
    ├── hubso-web     → Next.js 15 container (port 3000)
    ├── hubso-api     → NestJS container (port 4000)
    ├── PostgreSQL 16 → baza danych
    ├── Redis         → cache + sessions + BullMQ
    ├── Meilisearch   → full-text search
    └── MinIO         → S3-compatible storage (zdjęcia, pliki)
```

**Coolify** = self-hosted Heroku/Vercel. Podajesz repo → on buduje Docker obrazy i deployuje automatycznie.

---

## 2. Model Multi-tenant (Single-instance)

### Zasada działania

**Jeden serwer obsługuje WSZYSTKICH klientów.**

```
hubso.social (marketing)
klient1.hubso.social  → communityId: abc123
klient2.hubso.social  → communityId: def456
firmaxyz.com          → custom domain → CNAME → Twój serwer
```

- Jedna baza danych PostgreSQL
- Jeden Next.js app — routing po subdomenie/custom domain
- Jeden NestJS API
- Izolacja danych przez `communityId` (row-level isolation)

### Wildcard DNS (Cloudflare)

```
*.hubso.social → A record → IP Hetzner
hubso.social   → A record → IP Hetzner
```

Traefik obsługuje wildcard SSL automatycznie (`*.hubso.social`).

### Jak działa rejestracja nowego klienta

1. Klient wypełnia formularz na `hubso.social/start`
2. API tworzy rekord w tabeli `communities` (slug = subdomena)
3. Traefik dynamicznie obsługuje nową subdomenę (wildcard)
4. Klient dostaje e-mail z linkiem → gotowe w ~5 sekund
5. **Zero konfiguracji po stronie infrastruktury**

---

## 3. Prisma Schema — Multi-tenant

```prisma
// packages/database/schema.prisma

model Community {
  id           String   @id @default(cuid())
  slug         String   @unique  // → klient1.hubso.social
  customDomain String?  @unique  // → community.klient.com
  name         String
  plan         Plan     @default(FREE)
  createdAt    DateTime @default(now())

  members CommunityMember[]
  posts   Post[]
  spaces  Space[]
}

model Post {
  id          String    @id @default(cuid())
  communityId String    // ← ZAWSZE filtruj po tym!
  community   Community @relation(fields: [communityId], references: [id])
  // ...

  @@index([communityId]) // ← kluczowy indeks wydajności
}
```

**Zasada złota: każde zapytanie w NestJS musi mieć `communityId` w WHERE.**

---

## 4. Kod — Tenant Resolution

### Next.js Middleware (subdomain routing)

```typescript
// apps/web/middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''

  // "klient1.hubso.social" → "klient1"
  const subdomain = hostname
    .replace('.hubso.social', '')
    .replace('www.', '')

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-community-slug', subdomain)

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ['/((?!_next|api|favicon).*)'],
}
```

### NestJS Guard — tenant isolation

```typescript
// apps/api/src/common/guards/tenant.guard.ts
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const slug = request.headers['x-community-slug']

    const community = await this.prisma.community.findUnique({
      where: { slug },
    })

    if (!community) throw new NotFoundException('Community not found')

    request.community = community // dostępne w każdym kontrolerze
    return true
  }
}
```

---

## 5. Docker — Pliki

### Dockerfile.api

```dockerfile
# docker/Dockerfile.api
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
RUN pnpm turbo build --filter=api

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/packages/database ./packages/database
COPY --from=builder /app/node_modules ./node_modules

# Automatyczna migracja + start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
```

### Dockerfile.web

```dockerfile
# docker/Dockerfile.web
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
RUN pnpm turbo build --filter=web

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/node_modules ./node_modules

CMD ["node", "server.js"]
```

### docker-compose.yml (produkcja)

```yaml
# docker/docker-compose.yml
version: '3.9'

services:
  web:
    build:
      context: ..
      dockerfile: docker/Dockerfile.web
    restart: unless-stopped
    environment:
      - NEXT_PUBLIC_API_URL=${API_URL}
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.web.rule=HostRegexp(`{subdomain:[a-z0-9-]+}.hubso.social`)"
      - "traefik.http.routers.web.tls.certresolver=letsencrypt"

  api:
    build:
      context: ..
      dockerfile: docker/Dockerfile.api
    restart: unless-stopped
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: hubso
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data

  meilisearch:
    image: getmeili/meilisearch:latest
    restart: unless-stopped
    volumes:
      - meili_data:/meili_data

  minio:
    image: minio/minio:latest
    restart: unless-stopped
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  redis_data:
  meili_data:
  minio_data:
```

---

## 6. Aktualizacje — Jak to działa

### Jeden deploy = aktualizacja dla WSZYSTKICH klientów

```
git push origin main
      ↓
GitHub Actions (CI/CD)
      ↓
Coolify wykrywa zmianę → buduje nowy Docker image
      ↓
Uruchamia nowy kontener (health check)
      ↓
Prisma migrate deploy (automatycznie, dla całej DB)
      ↓
Traefik przełącza ruch → stary kontener zatrzymany
      ↓
Downtime: ~0 sekund
Wszyscy klienci zaktualizowani jednocześnie ✅
```

### GitHub Actions (CI/CD)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy via Coolify webhook
        run: |
          curl -X POST ${{ secrets.COOLIFY_WEBHOOK_URL }} \
            -H "Authorization: Bearer ${{ secrets.COOLIFY_TOKEN }}"
```

---

## 7. Roadmapa Skalowania

| Etap | Klientów | Infrastruktura | Koszt/mies. |
|------|----------|----------------|-------------|
| MVP | 0–50 | 1x Hetzner CCX33 + Coolify | ~€40 |
| Growth | 50–500 | 2–3x VPS + Coolify cluster | ~€120 |
| Scale | 500–2000 | Dedykowane DB + Redis cluster | ~€400 |
| Enterprise | 2000+ | K8s (K3s lub Hetzner managed) | €1000+ |

**Kubernetes wchodzi dopiero przy 2000+ aktywnych communities** lub gdy potrzebujesz auto-skalowania pod ruchem.

---

## 8. Porównanie z Circle.so / Skool.com

| Aspekt | Circle.so | Skool.com | **Hubso** |
|--------|-----------|-----------|-----------|
| Routing | `nazwa.circle.so` | `skool.com/nazwa` | `nazwa.hubso.social` |
| Custom domain | ✅ | ❌ | ✅ |
| Izolacja | communityId | communityId | communityId |
| Infrastruktura | AWS multi-region | AWS | Hetzner + Coolify |
| Model | Single-instance | Single-instance | **Single-instance** |
| Skalowanie | K8s | K8s | Docker → K8s gdy trzeba |

**Circle.so i Skool używają dokładnie tego samego modelu** — jeden serwer, wiele klientów przez `communityId`.

---

## 9. Custom Domains (opcjonalne)

Klient chce `community.mojafirma.com` zamiast `klient.hubso.social`:

```
1. Klient dodaje CNAME: community.mojafirma.com → hubso.social
2. W dashboardzie Hubso wpisuje custom domain
3. API aktualizuje pole customDomain w tabeli communities
4. Traefik automatycznie pobiera certyfikat SSL dla tej domeny
5. Middleware rozpoznaje custom domain → mapuje na communityId
```

```typescript
// apps/web/middleware.ts — rozszerzone o custom domains
const isHubsoDomain = hostname.endsWith('.hubso.social')

if (isHubsoDomain) {
  slug = hostname.replace('.hubso.social', '')
} else {
  // Custom domain — sprawdź w DB lub cache (Redis)
  slug = await resolveCustomDomain(hostname)
}
```

---

## 10. Checklist przed pierwszym deploymentem

- [ ] Hetzner VPS skonfigurowany (Ubuntu 22.04)
- [ ] Coolify zainstalowany (`curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash`)
- [ ] Cloudflare DNS: `*.hubso.social` → IP serwera
- [ ] Zmienne środowiskowe ustawione w Coolify
- [ ] GitHub Actions webhook skonfigurowany
- [ ] Backup PostgreSQL skonfigurowany (np. Hetzner Volumes + cron)
- [ ] Uptime Kuma uruchomiony (monitoring)
- [ ] Sentry DSN ustawiony (error tracking)

---

*Ostatnia aktualizacja: 23 lutego 2026*