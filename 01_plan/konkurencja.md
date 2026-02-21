Circle.so — nowoczesny UI, Spaces, automacje, AI. Ale: SaaS, $89-399/mies., prowizje od transakcji, zero kontroli nad danymi, brak self-hostingu.
Skool — prostota, gamifikacja, $99/mies. flat. Ale: brak white-label, brak customizacji, jeden feed jak Facebook Group, $99 za KAŻDĄ społeczność, nie Twoja marka.
BuddyBoss — self-hosted, ownership, white-label app. Ale: oparty na WordPress (wolny, ciężki, problemy z bezpieczeństwem, spaghetti-architektura). Setup to koszmar.
Mighty Networks — mobile-first, ładne appki. Ale: SaaS, drogi, zamknięty ekosystem.
Discourse / Flarum — open source forums, ale to NIE są platformy społecznościowe — brakuje kursów, eventów, monetyzacji, messagingu.

Fluent community.

---

Dobra, mam pełny obraz rynku na luty 2026. Oto analiza tego, co wziąć z każdej platformy:

---

## Co brać z każdej platformy — analiza 2026

### 🎮 Ze Skool — **gamifikacja i prostota**

To jest ich killer feature. Leaderboardy z punktami za engagement sprawiają, że pasywni członkowie nagle stają się aktywnymi kontrybutorami — ludzie publikują więcej bo widzą swój progres i status. Bierz:

- **System punktów** za posty, komentarze, lajki, ukończenie kursu
- **Leaderboard** widoczny dla wszystkich
- **Unlock content** — odblokowywanie materiałów po osiągnięciu poziomu
- **Discovery engine** — katalog społeczności do organicznego znajdowania nowych członków (to Skool zbudował, innych nie ma)
- **Flat pricing bez prowizji** — psychologicznie ważne dla builderów

❌ Nie bierz: jeden feed dla wszystkich (bottleneck przy wzroście), brak white-label.

---

### 🏗️ Z Circle — **Spaces i automatyzacja**

Circle pozwala tworzyć osobne przestrzenie dla różnych typów członków, tematów, formatów — każdy Space z własnymi regułami i ustawieniami. Bierz:

- **Spaces / subspaces** z osobnymi permission levels (beginner/pro/VIP/announcements)
- **Workflow automation** (if-then, jak wbudowany Zapier) — welcome message, onboarding, triggery po zachowaniach
- **Native live streaming** bez zewnętrznych narzędzi
- **AI moderation** — keyword blocklist, auto-flagging, granularne role adminów
- **Białe etykiety + custom domain** na każdym planie
- **Stripe-native** — subskrypcje i one-time payments

❌ Nie bierz: SaaS pricing, prowizje od transakcji, brak self-hostingu.

---

### 📱 Z Mighty Networks — **mobile-first i AI matchmaking**

Mighty Networks ma "People Magic AI" które pomaga członkom się połączyć — algorytm sugeruje kogo warto poznać na podstawie profilu i aktywności. Bierz:

- **AI member matching** — "poznaj te osoby, bo macie wspólne cele"
- **Native branded app** (iOS/Android) — własna marka, nie "Powered by X"
- **Algorytmiczny feed** opcjonalny (nie tylko chronologiczny)

❌ Nie bierz: zamknięty ekosystem, wysoka cena, brak self-hostingu.

---

### 🔧 Z BuddyBoss — **ownership i architektura**

Sama idea jest słuszna — self-hosted, zero prowizji, dane na swoim serwerze. Ale implementacja na WordPress jest koszmarną architekturą. Bierz filozofię, nie kod:

- **Zero transaction fees** jako propozycja wartości
- **Member data ownership** jako marketing argument
- **White-label app** bez subdomeny zewnętrznej platformy
- **Roczny licensing model** zamiast miesięcznego

❌ Nie bierz: WordPress jako core (spaghetti-architektura, bezpieczeństwo, performance).

---

### ⚡ Z FluentCommunity — **aktualny state-of-the-art self-hosted**

To twój najbliższy konkurent i jednocześnie inspiracja. FluentCommunity jest self-hosted, dane żyją na twoim serwerze — nie na zewnętrznych platformach. Ich przewaga to speed — zbudowali od zera na WordPress, omijając BuddyBoss legacy. Bierz:

- **Architekturę: oddzielny React frontend + REST API** (a nie WordPress template hell)
- **Real-time chat z retention periods** — pokoje, wątki, rich media
- **LMS wbudowany** — kursy, lekcje, quizy, certyfikaty, w jednym miejscu
- **Follow/Block system** (dodany Oct 2025)
- **Deep CRM integration** — Fluent Ecosystem (CRM + Forms + Booking + Support)

❌ Problemem jest nadal WordPress jako backend — performance ceiling.

---

## 🎯 Twoja unikalna propozycja — co masz, czego inni nie mają

Analizując luki rynkowe na 2026:

| Feature | Skool | Circle | BuddyBoss | FluentCommunity |
|---|---|---|---|---|
| Self-hosted | ❌ | ❌ | ✅ (WP) | ✅ (WP) |
| Gamification | ✅✅ | ✅ | ❌ | ✅ |
| Spaces/subspaces | ❌ | ✅✅ | ✅ | ✅ |
| Automation engine | ❌ | ✅✅ | ❌ | partial |
| Native mobile app | ✅ | ✅ | ✅ | ❌ |
| Zero transaction fees | ❌ (2.9%) | ❌ (0.5-2%) | ✅ | ✅ |
| AI matching | ❌ | basic | ❌ | ❌ |
| Discovery engine | ✅✅ | ❌ | ❌ | ❌ |
| Content library | ❌ | ❌ | partial | partial |
| Non-WP backend | ✅ | ✅ | ❌ | ❌ |

**Luki które możesz wypełnić:** self-hosted + nowoczesny stack (nie WP) + discovery engine + gamification + automation + zero fees. Nikt nie ma tego wszystkiego naraz.

Twoje Coolify + Hetzner + własny stack (np. Laravel/Next.js) to idealna baza. Chcesz żebym pomógł zaplanować architekturę techniczną?