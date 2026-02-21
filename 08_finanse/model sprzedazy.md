# Hubso.social — Model dystrybucji i sprzedaży

> **Wersja:** 1.0  
> **Data:** 2026-02-20  
> **Status:** Zatwierdzony  
> **Decyzja:** Model D — Hybrid SaaS-first + Self-hosted option  

---

## 1. Kontekst decyzji

Przed startem implementacji konieczne było ustalenie modelu dystrybucji platformy. Rozważane były 4 opcje:

| Model | Przykład rynkowy | Opis |
|-------|-----------------|------|
| **A) Pure SaaS** | Circle.so, Skool | Tylko nasze serwery, subskrypcja miesięczna |
| **B) Self-hosted + klucz API** | BuddyBoss + license | Klient hostuje, musi mieć nasz klucz |
| **C) Pure self-hosted (open-core)** | Discourse, GitLab CE | Kod otwarty, enterprise płatne |
| **D) Hybrid: SaaS default + self-hosted option** | Supabase, Cal.com, Plausible | Domyślnie SaaS, opcjonalnie self-hosted |

---

## 2. Analiza porównawcza

| Kryterium | A) Pure SaaS | B) Self-hosted + API | C) Open-core | D) Hybrid |
|-----------|:------------:|:-------------------:|:------------:|:---------:|
| **Recurring revenue** | ✅✅✅ | ✅ | ✅ | ✅✅✅ |
| **Bariera wejścia dla klienta** | Niska | Wysoka | Bardzo wysoka | Niska (SaaS) / Wysoka (self) |
| **Kontrola danych klienta** | ❌ U nas | ✅ U klienta | ✅ U klienta | ✅ Wybór |
| **Koszty DevOps klienta** | Zero | Wysokie | Bardzo wysokie | Zero (SaaS) / Wysokie (self) |
| **Koszty supportu** | Niskie | Bardzo wysokie | Wysokie | Średnie |
| **Skalowalność biznesu** | ✅✅✅ | ✅ | ✅✅ | ✅✅✅ |
| **Zgodność z UVP Hubso** | ❌ Częściowa | ✅ Pełna | ✅ Pełna | ✅✅ Pełna |
| **Plugin Marketplace** | Łatwe | Trudne | Średnie | Łatwe (SaaS) + API key (self) |
| **AI features (OpenRouter)** | Kontrola kosztów | Klient płaci / API | Klient płaci | Kontrola + opcja klienta |
| **Czas do rynku** | Szybki | Wolny | Wolny | Szybki (SaaS first) |
| **Wyróżnienie vs Circle/Skool** | ❌ Słabe | ✅✅ Mocne | ✅✅ Mocne | ✅✅ Mocne |

---

## 3. Decyzja: Model D — Hybrid SaaS-first

### Dlaczego Hybrid?

```
┌─────────────────────────────────────────────────────────┐
│                    HUBSO.SOCIAL                          │
├─────────────────────────┬───────────────────────────────┤
│   ŚCIEŻKA DOMYŚLNA     │   ŚCIEŻKA ZAAWANSOWANA       │
│   (95% klientów)        │   (5% klientów)               │
│                         │                               │
│   ☁️ Managed SaaS       │   🏠 Self-hosted              │
│   (Hubso Cloud)         │   (Hubso Self-Hosted)         │
│                         │                               │
│   - Nasze serwery       │   - Serwery klienta           │
│   - Zero DevOps         │   - Docker + Coolify/k8s      │
│   - Subskrypcja/mies.   │   - Licencja roczna           │
│   - Auto updates        │   - Self-managed updates      │
│   - Custom domain ✅     │   - Pełna kontrola danych ✅  │
│   - White-label ✅       │   - Modyfikacja kodu ✅        │
│                         │   - WYMAGANY klucz API Hubso  │
│                         │     (licencja + marketplace    │
│                         │      + AI + updates)           │
├─────────────────────────┴───────────────────────────────┤
│              PLUGIN MARKETPLACE (wspólny)                │
│              AI FEATURES (via OpenRouter)                │
│              ZERO TRANSACTION FEES                       │
└─────────────────────────────────────────────────────────┘
```

### Kluczowe argumenty za Hybrid (D):

1. **Spójność z wizją produktu** — PRD obiecuje "self-hosted z zero transaction fees" + "managed hosting jako revenue stream". Model D realizuje oba obietnice jednocześnie.

2. **Najszersza grupa docelowa** — Coach/dietetyk (SaaS, zero DevOps) + developer/enterprise (self-hosted, kontrola danych) — to 100% segmentów z sekcji 5 PRD.

3. **Plugin Marketplace wymaga centralizacji** — Marketplace z 70/30 revenue share potrzebuje centralnego rejestru. Na SaaS to trywialne. Self-hosted łączy się przez API key.

4. **AI wymaga kontroli kosztów** — OpenRouter, embeddings, moderacja — na SaaS kontrolujemy usage limits per plan. Self-hosted klient używa naszego API key (płatne) lub własnego klucza OpenRouter.

5. **Szybki czas do rynku** — Startujemy TYLKO z SaaS (Faza 1). Self-hosted dodajemy w Fazie 2+. Jedno środowisko, jedna infrastruktura, zero instalatorów na start.

6. **Referencje rynkowe** — Ten model działa:

| Produkt | SaaS | Self-hosted | Przybliżony ARR |
|---------|:----:|:-----------:|:----------------:|
| Supabase | ✅ | ✅ (Docker) | ~$80M |
| Cal.com | ✅ | ✅ (enterprise) | ~$25M |
| Plausible | ✅ | ✅ | ~$2.5M |
| PostHog | ✅ | ✅ (open source) | ~$35M |

---

## 4. Dlaczego NIE inne modele?

### ❌ A) Pure SaaS (jak Circle.so)

- **Sprzeczne z UVP** — obiecujemy "self-hosted" i "kontrola danych", pure SaaS tego nie dostarcza
- **Zero wyróżnienia** — walka ceną z Circle ($89/mies.) i Skool ($99/mies.), którzy mają $100M+ funding
- **Tracony segment** — enterprise, GDPR-sensitive, devops-savvy klienci odpadają

### ❌ B) Self-hosted + klucz API (bez SaaS)

- **Ogromna bariera wejścia** — 95% twórców (coachowie, dietetycy, influencerzy) nie chce zarządzać serwerami
- **Kosztowny support** — każdy klient ma inny hosting, inne problemy, inne wersje
- **Wolny growth** — nie da się zrobić "signup → społeczność w 5 minut"
- **Brak viral loop** — bez centralnej platformy nie ma discovery engine

### ❌ C) Pure open-core (jak Discourse)

- **Najtrudniejszy do monetyzacji** — darmowy core, enterprise feature paywalled, długi cykl sprzedaży
- **Fork risk** — ktoś forkuje kod i sprzedaje taniej/za darmo
- **Brak recurring revenue z free tier** — dopóki klient nie przejdzie na enterprise, zarabiasz $0
- **Wymaga dużej skali** — potrzebujesz tysięcy instalacji zanim enterprise zaczyna płacić

---

## 5. Pricing

### Hubso Cloud (SaaS) — domyślna ścieżka

| Plan | Cena | Members | Zawiera |
|------|------|---------|---------|
| **Free** | $0/mies. | do 50 | Core features, hubso.social subdomena, basic branding |
| **Pro** | $29/mies. | do 1,000 | Custom domain, white-label, basic AI, 10GB storage |
| **Business** | $79/mies. | do 10,000 | Advanced AI, automation, analytics, 100GB storage, priority support |
| **Enterprise Cloud** | Custom | Unlimited | Dedicated infra, SLA 99.99%, custom dev, onboarding, SSO/SAML |

### Hubso Self-Hosted — ścieżka zaawansowana

| Plan | Cena | Zawiera |
|------|------|---------|
| **Self-Hosted Pro** | $499/rok | Licencja, updates, marketplace access, community support |
| **Self-Hosted Enterprise** | Custom | Source access, priority support, custom SLA, dedicated account manager |

> **Wymóg:** Self-hosted wymaga aktywnego klucza API Hubso do:
> - Weryfikacji licencji (anti-piracy)
> - Dostępu do Plugin Marketplace  
> - AI features (opcjonalnie własny klucz OpenRouter)
> - Automatycznych aktualizacji

### Zasada: Zero Transaction Fees

Hubso **nie pobiera prowizji od transakcji** wewnątrz społeczności (membership, courses, shop). Opłaty tylko ze strony payment processora (Stripe: 2.9% + 30¢).

---

## 6. Revenue Streams

| Źródło | Model | Prognoza % Revenue (rok 1) | Prognoza % Revenue (rok 3) |
|--------|-------|:--------------------------:|:--------------------------:|
| **SaaS subscriptions** | MRR | 70% | 55% |
| **Plugin marketplace** | 30% rev share | 5% | 15% |
| **Self-hosted licenses** | ARR | 5% | 12% |
| **AI usage (overage)** | Pay-per-use | 10% | 10% |
| **Professional services** | One-time | 8% | 3% |
| **Certyfikacje** | One-time | 2% | 5% |

### Prognoza MRR

| Milestone | Timeline | Active communities | Estymowany MRR |
|-----------|----------|--------------------|----------------|
| Launch | Miesiąc 1 | 10 (beta) | ~$300 |
| Traction | Miesiąc 6 | 100 | ~$3,000 |
| Growth | Miesiąc 12 | 500 | ~$15,000 |
| Scale | Miesiąc 24 | 2,000 | ~$60,000 |

> Założenie: avg $30/community (mix Free + Pro + Business)

---

## 7. Roadmap dystrybucji

| Faza | Timeline | Model | Deliverables |
|------|----------|-------|-------------|
| **Faza 1 (MVP)** | Miesiąc 1-3 | **Tylko SaaS** | Hubso Cloud na Hetzner/Coolify, Stripe billing, Free + Pro plan |
| **Faza 1.5** | Miesiąc 4-5 | SaaS + Marketplace | Plugin Marketplace, Business plan, AI pay-per-use |
| **Faza 2** | Miesiąc 6-9 | + **Self-hosted Docker** | Docker image, license/API key system, self-hosted docs |
| **Faza 3** | Miesiąc 10+ | + Enterprise | Enterprise Cloud + Enterprise Self-Hosted, Kubernetes helm chart |

### Faza 1 — co NIE robimy:

- ❌ Self-hosted Docker image
- ❌ License key management system
- ❌ Self-hosted documentation
- ❌ Enterprise plan  
- ❌ Kubernetes/Helm  

### Faza 1 — co ROBIMY:

- ✅ Multi-tenant SaaS na jednej infrastrukturze (Coolify + Hetzner)
- ✅ Stripe subscriptions (Free + Pro)
- ✅ Custom domain per community
- ✅ White-label branding per community
- ✅ Core modules (Auth, Spaces, Posts, Feed, Chat, Notifications, Admin)

---

## 8. Self-hosted — szczegóły techniczne (Faza 2+)

### Wymagania klienta:
- Docker + Docker Compose (minimum)
- 2 vCPU, 4GB RAM, 40GB SSD (minimum)
- PostgreSQL 16+, Redis 7+
- Domena + SSL

### Klucz API — co robi:
```
App start → Check license key → 
  ✅ Valid → Boot normally, connect to Marketplace API, AI proxy
  ❌ Invalid/expired → Boot in "grace mode" (30 days), then read-only
```

### Aktualizacje:
- Auto-check na nową wersję (via API)
- Klient decyduje kiedy aktualizuje (pull nowy Docker image)
- Breaking changes = 90 dni deprecation notice

---

## 9. Podsumowanie

| Pytanie | Odpowiedź |
|---------|-----------|
| SaaS czy self-hosted? | **Oba — SaaS domyślnie, self-hosted opcjonalnie** |
| Self-hosted wymaga API key? | **Tak — licencja, marketplace, AI, updates** |
| Jak Circle.so (pure SaaS)? | **Nie — dodajemy self-hosted jako wyróżnik** |
| Inny model? | **Hybrid (SaaS-first) — jak Supabase, Cal.com** |
| Co na start (MVP)? | **Tylko SaaS — self-hosted od Fazy 2 (miesiąc 6+)** |

---

*Model sprzedaży v1.0 — Hubso.social — Luty 2026*
