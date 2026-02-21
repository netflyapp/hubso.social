# Hubso.social — Koszty infrastruktury i operacyjne

> **Wersja:** 1.0  
> **Data:** 2026-02-20  
> **Stack:** Hetzner Cloud + Coolify + Cloudflare  
> **Model:** SaaS-first (Hubso Cloud)  

---

## 1. Rekomendacja: Hetzner + Coolify — TAK, zostajemy

**Hetzner to najlepszy wybór** dla Hubso na dzisiaj. Oto dlaczego:

| Kryterium | Hetzner | DigitalOcean | AWS/GCP | Fly.io |
|-----------|:-------:|:------------:|:-------:|:------:|
| **Cena za 8 vCPU / 16GB** | **€9.49/mies.** | ~$96/mies. | ~$120+/mies. | ~$80+/mies. |
| **Lokalizacja EU** | ✅ Falkenstein, Helsinki, Ashburn | ✅ Frankfurt | ✅ | ✅ |
| **GDPR-friendly** | ✅✅ Niemiecka firma | ✅ | ⚠️ US-based | ⚠️ US-based |
| **Object Storage (S3)** | ✅ €5/TB | ✅ $5/250GB | ✅ S3 | ❌ |
| **Coolify support** | ✅✅ Native | ✅ | ⚠️ | ❌ |
| **Skalowanie** | ✅ Resize VPS w minuty | ✅ | ✅✅✅ | ✅ |
| **Stosunek cena/wydajność** | ✅✅✅ | ✅ | ✅ | ✅✅ |

**Hetzner jest 8-12x tańszy** niż DO/AWS przy tej samej specyfikacji. Przy bootstrapped SaaS to krytyczne.

### Kiedy rozważyć migrację z Hetzner?

- **100K+ userów** → rozważ dedicated servers Hetzner (AX-line) lub k3s cluster
- **Multi-region** potrzebny → dodaj Fly.io edge / Cloudflare Workers jako warstwę cache
- **Enterprise SLA 99.99%** → Hetzner oferuje 99.9% SLA, dla 99.99% potrzeba multi-AZ (k8s na kilku Hetzner DC)

**Wniosek: Hetzner + Coolify to idealny stack na Fazy 1-3. Nie zmieniaj.**

---

## 2. Koszty — Faza 1 (MVP, miesiąc 1-3)

### Cel: < 100 communities, < 1K userów

| Kategoria | Usługa | Specyfikacja | Koszt/mies. |
|-----------|--------|-------------|:-----------:|
| **VPS — App** | Hetzner CX43 | 8 vCPU, 16GB RAM, 160GB SSD | **€9.49** |
| **Deployment** | Coolify | Self-hosted na tym samym VPS | **€0** |
| **Reverse Proxy** | Traefik (via Coolify) | Auto SSL, routing | **€0** |
| **CDN** | Cloudflare Free | DNS, DDoS, cache, SSL | **€0** |
| **Object Storage** | Cloudflare R2 | 10GB free → ~50GB na start | **~$0.60** |
| **Wideo** | Bunny Stream | $5 base + ~10h video storage | **~$8** |
| **Backups** | Hetzner Backup | 20% ceny VPS, daily snapshots | **€1.90** |
| **Email transakcyjny** | Resend | 3K emails/mies. free → 50K = $20 | **$0–20** |
| **Domena** | hubso.social | Roczna | **~€2/mies.** |
| **Monitoring** | Uptime Kuma | Self-hosted na VPS | **€0** |
| **Error Tracking** | Sentry Free | 5K events/mies. | **€0** |
| **AI — OpenRouter** | GPT-4o-mini / Claude Haiku | ~50K requests/mies. | **~$5–15** |
| **Stripe** | Payment processing | 2.9% + 30¢ per transaction | **variable** |
| | | | |
| | | **ŁĄCZNIE FAZA 1** | **~€27–55/mies.** |

### Breakdown w EUR (przy kursie 1 USD ≈ 0.92 EUR):

```
Realny koszt Faza 1:  ~€30-50/mies.  (~$33-55/mies.)

Break-even:  2 klientów na planie Pro ($29) = $58 MRR
             Próg rentowności infra = ~2 płacących klientów
```

---

## 3. Koszty — Faza 1.5 (Growth, miesiąc 4-6)

### Cel: 100-500 communities, 1K-5K userów

| Kategoria | Usługa | Zmiana vs Faza 1 | Koszt/mies. |
|-----------|--------|-------------------|:-----------:|
| **VPS — App** | Hetzner CX43 | Bez zmian (8 vCPU, 16GB) | **€9.49** |
| **VPS — Worker** | Hetzner CX33 | Osobny VPS na BullMQ + FFmpeg | **€5.49** |
| **CDN** | Cloudflare Free | Bez zmian | **€0** |
| **Object Storage** | Cloudflare R2 | ~200GB storage | **~$2.85** |
| **Wideo** | Bunny Stream | $5 + ~100h video | **~$25** |
| **Backups** | Hetzner Backup | 2x VPS | **~€3** |
| **Email** | Resend | ~20K emails | **$20** |
| **Monitoring** | Grafana Cloud Free | 10K metrics, 50GB logs | **€0** |
| **Error Tracking** | Sentry Free | Dalej w limicie | **€0** |
| **AI — OpenRouter** | Więcej modeli | ~200K requests | **~$20–40** |
| **Domena + SSL** | Cloudflare | Bez zmian | **~€2** |
| | | | |
| | | **ŁĄCZNIE FAZA 1.5** | **~€65–105/mies.** |

### Break-even Faza 1.5:

```
~€85/mies. ÷ ~$29 avg = ~3 płacących klientów Pro
Przy 500 communities (mix Free + Pro): estymowane $3,000 MRR
Marża: ~97%
```

---

## 4. Koszty — Faza 2 (Scale, miesiąc 6-12)

### Cel: 500-2,000 communities, 5K-50K userów

| Kategoria | Usługa | Specyfikacja | Koszt/mies. |
|-----------|--------|-------------|:-----------:|
| **VPS — App (x2)** | 2x Hetzner CX43 | Load balanced, 2 instancje API | **€18.98** |
| **VPS — DB** | Hetzner CX53 | Dedicated PostgreSQL, 16 vCPU, 32GB | **€17.49** |
| **VPS — Worker** | Hetzner CX33 | BullMQ + FFmpeg transcoding | **€5.49** |
| **VPS — Redis** | Hetzner CX33 | Dedicated Redis + cache | **€5.49** |
| **Load Balancer** | Hetzner LB | L4/L7 balancing | **€5.49** |
| **CDN** | Cloudflare Pro | $25/mies., WAF, better cache | **$25** |
| **Object Storage** | Cloudflare R2 | ~1TB storage | **~$15** |
| **Wideo** | Bunny Stream | $5 + ~500h video storage | **~$55** |
| **Backups** | Hetzner Backup + Storage Box | DB dumps + snapshots | **~€8** |
| **Email** | Resend Pro | ~100K emails | **$50** |
| **Monitoring** | Grafana + Prometheus | Self-hosted na VPS | **€0** |
| **Error Tracking** | Sentry Team | 50K events | **$29** |
| **AI — OpenRouter** | Full AI suite | ~1M requests | **~$80–150** |
| **Domena + DNS** | Cloudflare | Bez zmian | **~€2** |
| **Meilisearch** | Na DB VPS | Full-text search | **€0** (included) |
| | | | |
| | | **ŁĄCZNIE FAZA 2** | **~€230–380/mies.** |

### Break-even Faza 2:

```
~€300/mies. ÷ ~$35 avg revenue per community = ~9 płacących klientów
Przy 2,000 communities: estymowane $15,000 MRR
Marża: ~98%
```

---

## 5. Koszty — Faza 3 (Enterprise, miesiąc 12+)

### Cel: 2,000-10,000 communities, 50K-500K userów

| Kategoria | Usługa | Specyfikacja | Koszt/mies. |
|-----------|--------|-------------|:-----------:|
| **Cluster** | 5-8x Hetzner CX53 + k3s | API, workers, DB replicas | **~€100–140** |
| **Dedicated DB** | Hetzner AX52 (dedicated) | 8C/64GB, NVMe, PG primary + replica | **~€60** |
| **Load Balancer** | Hetzner LB x2 | Redundant | **€10.98** |
| **CDN** | Cloudflare Business | $250/mies., advanced WAF, custom rules | **$250** |
| **Object Storage** | Cloudflare R2 | ~5TB storage | **~$75** |
| **Wideo** | Własny pipeline + R2 | FFmpeg cluster + R2 + Cloudflare CDN | **~$100** |
| **Backups** | Hetzner Storage Box BX41 | 4TB encrypted backups | **€16.49** |
| **Email** | Resend Scale | ~500K emails | **$100** |
| **Monitoring** | Grafana + Prometheus + Loki | Self-hosted cluster | **€0** |
| **Error Tracking** | Sentry Business | 500K events | **$80** |
| **AI — OpenRouter** | High volume | ~5M requests | **~$300–500** |
| **Security** | Cloudflare + audit | WAF, DDoS, penetration tests | **included** |
| | | | |
| | | **ŁĄCZNIE FAZA 3** | **~€800–1,400/mies.** |

### Break-even Faza 3:

```
~€1,100/mies. ÷ ~$45 avg = ~25 płacących klientów
Przy 5,000+ communities: estymowane $60,000+ MRR
Marża: ~98%
```

---

## 6. Podsumowanie kosztów — wszystkie fazy

| Faza | Timeline | Users | Koszt/mies. | Break-even | Est. MRR | Marża |
|------|----------|-------|:-----------:|:----------:|:--------:|:-----:|
| **1 — MVP** | Mies. 1-3 | < 1K | **~€40** | 2 klientów Pro | ~$300 | ~87% |
| **1.5 — Growth** | Mies. 4-6 | 1-5K | **~€85** | 3 klientów Pro | ~$3,000 | ~97% |
| **2 — Scale** | Mies. 6-12 | 5-50K | **~€300** | 9 klientów | ~$15,000 | ~98% |
| **3 — Enterprise** | Mies. 12+ | 50-500K | **~€1,100** | 25 klientów | ~$60,000 | ~98% |

### Kluczowy insight:

```
Faza 1 kosztuje mniej niż 1 klient na planie Pro ($29).
Faza 2 kosztuje mniej niż 10 klientów.
Faza 3 kosztuje mniej niż 25 klientów.

SaaS z Hetzner ma ekstremalnie niskie koszty marginalne.
Każdy kolejny klient to ~99% marża po Fazie 2.
```

---

## 7. Koszty stałe (niezależne od fazy)

| Pozycja | Koszt | Częstotliwość |
|---------|:-----:|:-------------:|
| **Domena hubso.social** | ~€20 | Rocznie |
| **Apple Developer Account** | $99 | Rocznie (Faza 2 — mobile) |
| **Google Play Developer** | $25 | Jednorazowo (Faza 2) |
| **Stripe Atlas / firma** | zależy | Jednorazowo |
| **GitHub Pro** | $4/mies. | Miesięcznie |
| **Figma** | $0 (free) | — |
| **Narzędzia AI (Cursor, Copilot)** | ~$20-40/mies. | Miesięcznie |
| | **~€30–60/mies.** | stałe |

---

## 8. Koszty AI — szczegółowy breakdown

AI to zmienny koszt zależny od usage. Estymacja per community:

| Feature AI | Model | Koszt per request | Est. requests/community/mies. | Koszt/community |
|------------|-------|:-----------------:|:----------------------------:|:---------------:|
| **Moderacja treści** | GPT-4o-mini | ~$0.00015 | ~500 | **$0.075** |
| **AI asystent** | Claude 3.5 Haiku | ~$0.001 | ~100 | **$0.10** |
| **Podsumowania** | GPT-4o-mini | ~$0.0003 | ~50 | **$0.015** |
| **Smart matching** | Embeddings (text-3-small) | ~$0.00002 | ~200 | **$0.004** |
| **Tłumaczenia** | GPT-4o-mini | ~$0.0002 | ~100 | **$0.02** |
| | | | **TOTAL/community** | **~$0.21/mies.** |

### AI unit economics:

```
Koszt AI per community:  ~$0.21/mies.
Przychód per community:  ~$29-79/mies.
AI cost as % of revenue: ~0.3-0.7%

Nawet przy 10x więcej usage: ~$2/community = dalej < 7% revenue.
AI jest bardzo tani na obecnych modelach.
```

### Limity AI per plan:

| Plan | AI requests/mies. | Est. koszt AI | Included? |
|------|:------------------:|:-------------:|:---------:|
| **Free** | 100 | ~$0.02 | ✅ Included |
| **Pro** | 5,000 | ~$1 | ✅ Included |
| **Business** | 50,000 | ~$10 | ✅ Included |
| **Enterprise** | Unlimited | variable | ✅ Included + overage |

---

## 9. Koszty wideo — szczegółowy breakdown

Wideo to największy zmienny koszt. Dwie opcje:

### Opcja A: Bunny Stream (Faza 1-2) — REKOMENDOWANA na start

| Metryka | Wartość | Koszt |
|---------|---------|:-----:|
| Base fee | — | **$5/mies.** |
| Storage | $0.005/GB/mies. | ~$0.005/min wideo |
| Bandwidth | $0.01/GB EU | wliczone w base |

**Przykład:** 100h wideo (100 communities × 1h) = ~150GB storage = **~$5.75/mies. total**

### Opcja B: Własny pipeline + R2 (Faza 2+)

| Komponent | Koszt |
|-----------|:-----:|
| FFmpeg na worker VPS | wliczone w VPS (€5.49) |
| Cloudflare R2 storage | $0.015/GB/mies. |
| R2 egress | **$0 (FREE)** |
| Cloudflare CDN | darmowy cache |

**Przykład:** 500h wideo = ~750GB R2 = **~$11.25/mies.** (taniej niż Bunny przy skali)

### Punkt przejścia Bunny → własny pipeline:

```
Bunny Stream:    $5 + $0.005/GB
Własny (R2):     €5.49 (VPS) + $0.015/GB (ale $0 egress)

Break-even: ~300-500h wideo stored
Rekomendacja: Bunny do Fazy 2, własny pipeline od Fazy 2+
```

---

## 10. Porównanie z konkurencją (koszt hostowania)

Dla kontekstu — co płacą klienci konkurencji vs co Ty płacisz za infra:

| Platform | Co płaci klient | Co płacisz Ty (Hubso infra per community) |
|----------|:---------------:|:------------------------------------------:|
| **Circle.so** | $89–399/mies. | n/a (oni to hostują) |
| **Skool** | $99/mies. | n/a |
| **BuddyBoss** | $299+ jednorazowo + hosting ~$30/mies. | n/a (klient hostuje) |
| **Hubso Cloud** | $0–79/mies. | **~€0.05-0.50/community** (marginal cost) |

**Marginal cost per community na Hetzner to grosze.** Multi-tenant architecture + shared infra = ekstremalnie niski koszt per community.

---

## 11. Kosztorys roczny — pierwsze 12 miesięcy

| Miesiąc | Faza | Koszt infra | Stałe | AI + Video | TOTAL/mies. |
|:-------:|------|:----------:|:-----:|:----------:|:-----------:|
| 1 | MVP build | €9.49 | €30 | €5 | **~€45** |
| 2 | MVP build | €9.49 | €30 | €5 | **~€45** |
| 3 | MVP launch | €9.49 | €30 | €10 | **~€50** |
| 4 | Growth | €15 | €30 | €15 | **~€60** |
| 5 | Growth | €15 | €30 | €20 | **~€65** |
| 6 | Growth | €15 | €30 | €30 | **~€75** |
| 7 | Scale start | €50 | €35 | €40 | **~€125** |
| 8 | Scale | €50 | €35 | €50 | **~€135** |
| 9 | Scale | €55 | €35 | €60 | **~€150** |
| 10 | Scale | €55 | €35 | €70 | **~€160** |
| 11 | Scale | €60 | €35 | €80 | **~€175** |
| 12 | Scale | €65 | €35 | €100 | **~€200** |
| | | | | **ROK 1 TOTAL** | **~€1,285** |

```
Łączny koszt infrastruktury roku 1:  ~€1,285  (~$1,400)
Estymowany MRR w miesiącu 12:        ~$15,000
Estymowany ARR w miesiącu 12:         ~$180,000 (jeśli growth się utrzyma)

Koszt infra jako % of ARR:  < 1%
```

---

## 12. Ścieżka skalowania Hetzner

```
FAZA 1 (< 1K users)
└── 1x CX43 (€9.49) — wszystko na jednym VPS
    ├── Next.js (web)
    ├── NestJS (api)
    ├── PostgreSQL 16
    ├── Redis 7
    ├── Meilisearch
    ├── MinIO (local, small files)
    ├── BullMQ worker
    └── Coolify (deployment)

FAZA 1.5 (1-5K users)
├── 1x CX43 (€9.49) — App (web + api)
└── 1x CX33 (€5.49) — Worker (BullMQ + FFmpeg)

FAZA 2 (5-50K users)
├── 2x CX43 (€18.98) — App x2 (load balanced)
├── 1x CX53 (€17.49) — DB (PostgreSQL + Meilisearch)
├── 1x CX33 (€5.49) — Redis dedicated
├── 1x CX33 (€5.49) — Worker
└── 1x LB   (€5.49) — Load Balancer

FAZA 3 (50-500K users)
├── 3x CX53 (€52.47) — App x3 (k3s cluster)
├── 1x AX52 (~€60)   — DB primary (dedicated server)
├── 1x CX53 (€17.49) — DB replica (read-only)
├── 1x CX43 (€9.49)  — Redis cluster
├── 2x CX33 (€10.98) — Workers
├── 2x LB   (€10.98) — Load Balancers (redundant)
└── k3s orchestration
```

---

*Koszty v1.0 — Hubso.social — Luty 2026*  
*Ceny Hetzner aktualne na 02/2026. Mogą się zmienić.*
