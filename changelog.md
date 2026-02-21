Changelog – Hubso
==================

Ten dokument śledzi istotne zmiany w projekcie Hubso – od fazy discovery, przez planowanie, aż po kolejne iteracje produktu. 

Konwencja wersjonowania: semver (`MAJOR.MINOR.PATCH`). Wersje `0.x.x` opisują prace przed pierwszym publicznym MVP.

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

