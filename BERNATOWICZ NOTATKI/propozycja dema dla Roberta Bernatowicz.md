# Analiza strony Nautilus.org.pl i plan demo platformy Hubso dla Roberta Bernatowicza

## Kontekst

Chcemy przenieść stronę <https://nautilus.org.pl/start.html> na platformę Hubso i stworzyć dodatkowe funkcje. Robert Bernatowicz prowadzi **Fundację Naukowo-Badawczą Nautilus** zajmującą się zjawiskami niewyjaśnionymi, ufologią, tajemnicami ludzkiej egzystencji i szeroko pojętą alternatywną nauką. Strona ma klasyczny layout portalowy z artykułami, galerią, filmami i projektami. Posiada kanał RSS (<https://nautilus.org.pl/rss>), co ułatwi migrację treści.

Całość w klimacie **Łodzi**.

---

## Moje przemyślenia — co by się przydało jego społeczności

- [ ] podstawowe funkcje
- [ ] baza tej wiedzy z AI <https://nautilus.org.pl/nautilus-hd.html> Filmy
- [ ] zgłoś zjawisko i opisz + historie zgłoszone przez załogantów <https://nautilus.org.pl/xxi-pietro.html>
- [ ] <https://nautilus.org.pl> dodać te wpisy na stronę
- [ ] kategorie ze strony <https://nautilus.org.pl> to będą grupy
- [ ] książka + zaproszenie na platformę
- [ ] newsy z innych portali agregowane w jednym miejscu
- [ ] klon głosu Bernatowicza który o tym opowiada - wygenerować audycje
- [ ] *Organizowanie spotkań, konferencji i sympozjów naukowych i oświatowych związanych z działalnością Fundacji i prowadzonymi pracami badawczymi, zakładka WYDARZENIA*
- [ ] *spotkania na żywo raz w miesiącu*
- [ ] *Stworzenie archiwum dotyczącego zjawisk niewyjaśnionych, zagadnień dotyczących pochodzenia człowieka i spraw związanych z tajemnicą ludzkiej egzystencji — open source GITHUB np*
- [ ] **Archiwalne audycje FN — radio**
- [ ] **UFO24 — zgłaszanie na bieżąco ale z mapą**
- [ ] **Dokumenty**
- [ ] **Zdjęcia** <https://nautilus.org.pl/galerie.html>
- [ ] Projekty to będą Szkolenia może <https://nautilus.org.pl/artykuly,0,nasze-projekty.html?cat_id=153>
- [ ] dodać partnerów np Jackowski
- [ ] Dodać Firecrawl MCP i [kie.ai](http://kie.ai) do generowania grafik
- [ ] Ma kanał RSS <https://nautilus.org.pl/rss>

---

## Mapowanie funkcji Nautilus → Hubso

| Nautilus (obecna strona) | Hubso (nowa platforma) | Priorytet |
|---|---|---|
| Kategorie artykułów (start.html) | **Spaces / Grupy tematyczne** | 🔴 Wysoki |
| Nautilus HD (filmy) | **Baza wiedzy z AI + sekcja Video** | 🔴 Wysoki |
| XXI Piętro (zgłoszenia zjawisk) | **Moduł "Zgłoś zjawisko" + mapa UFO24** | 🔴 Wysoki |
| Galerie zdjęć | **Galeria / Zdjęcia** | 🟡 Średni |
| Artykuły / wpisy | **Feed / Posty w grupach** | 🔴 Wysoki |
| Nasze projekty | **Szkolenia / Kursy** | 🟡 Średni |
| Archiwalne audycje FN | **Sekcja Radio / Podcasty** | 🟡 Średni |
| Kontakt / społeczność | **Członkowie + Wiadomości** | 🔴 Wysoki |
| Wydarzenia / spotkania | **Wydarzenia (online + offline)** | 🔴 Wysoki |
| RSS z innych portali | **Agregator newsów** | 🟢 Niski (faza 2) |
| Archiwum badawcze | **Dokumenty + GitHub open-source** | 🟢 Niski (faza 2) |

---

## Proponowane Spaces (Grupy) — bazujące na kategoriach Nautilus

1. **🛸 UFO i obserwacje** — zgłoszenia, dyskusje, UFO24 z mapą
2. **🔬 Nauka i badania** — artykuły naukowe, archiwum badawcze
3. **👽 Zjawiska paranormalne** — XXI Piętro, historie użytkowników
4. **🎬 Nautilus HD** — baza filmów z AI przeszukiwaniem
5. **📻 Radio Nautilus** — archiwalne audycje, nowe podcasty
6. **📚 Książki i publikacje** — książka Bernatowicza, recenzje
7. **🌍 Starożytne cywilizacje** — archeologia alternatywna
8. **🧬 Tajemnice egzystencji** — filozofia, duchowość, pochodzenie człowieka
9. **📸 Galeria** — zdjęcia, dokumentacja wizualna
10. **🤝 Partnerzy** — Jackowski i inni współpracownicy

---

## Klimat Łodzi — personalizacja wizualna

Propozycje brandingu:

- **Kolorystyka**: Ciemny motyw domyślny (kosmiczny klimat) z akcentami w kolorach:
  - Główny: `#1B3A5C` (głęboki granat/nocne niebo)
  - Akcent: `#FFB800` (złoty — nawiązanie do łódzkiej secesji/przemysłu)
  - Drugorzędny: `#2D8F4E` (Hubso green — pozostaje jako element platformy)
- **Typografia**: zachować Inter, ale dodać opcję bardziej "tajemniczego" headera
- **Tło**: subtelna tekstura gwiazdozbioru / mapy starej Łodzi
- **Logo**: Fundacja Nautilus + "powered by Hubso"
- **Elementy Łodzi**: ikony nawiązujące do Manufaktury, Piotrkowskiej, EC1

---

## Unikalne moduły do zbudowania

### 1. UFO24 — Zgłoszenia na żywo z mapą

```
┌──────────────────────────────────────┐
│  🗺️ MAPA ZGŁOSZEŃ                    │
│  ┌──────────────────────────────────┐ │
│  │         [Mapa Polski]            │ │
│  │      📍 📍    📍                  │ │
│  │   📍        📍                    │ │
│  │             📍  📍               │ │
│  └──────────────────────────────────┘ │
│  [+ Zgłoś obserwację]  Filtruj: ▼    │
│                                      │
│  Ostatnie zgłoszenia:                │
│  🔴 Łódź, 20.02.2026 — "Jasne..."  │
│  🟡 Warszawa, 19.02 — "Trójkąt..."  │
└──────────────────────────────────────┘
```

**Funkcje:**

- Mapa interaktywna (Leaflet/Mapbox)
- Formularz zgłoszenia: data, lokalizacja, opis, zdjęcia/video
- Kategorie: UFO, zjawisko świetlne, dźwięk, inne
- Weryfikacja przez moderatorów (zaufani załoganci)
- Timeline zgłoszeń

### 2. Nautilus HD — Baza wiedzy z AI

- Wgrywanie filmów (lub embed YouTube)
- **AI transkrypcja** filmów → pełnotekstowe przeszukiwanie
- **AI podsumowania** odcinków
- Tagowanie, kategorie
- Sugestie "Podobne filmy"
- Możliwość komentowania z timestampem

### 3. Klon głosu Bernatowicza — AI Audycje

- ElevenLabs / inny TTS z klonowaniem głosu
- Automatyczne generowanie "audycji" na bazie nowych artykułów/newsów
- Player w stylu podcastowym osadzony w platformie
- Sekcja "Radio Nautilus AI"

### 4. Agregator newsów

- Pobieranie z RSS innych portali (ufologiczne, naukowe)
- AI podsumowania artykułów
- Użytkownicy mogą zgłaszać ciekawe źródła
- Feed z filtrami tematycznymi

### 5. Archiwum badawcze (Open Source)

- Połączenie z GitHub repo
- Pliki, dokumenty, raporty
- Wiki-styl z edycją przez społeczność
- Wersjonowanie dokumentów

---

## Struktura nawigacji platformy (dostosowana)

```
HEADER: Logo Nautilus | Feed | Spaces | Dyskusje | Baza Wiedzy | UFO24 | Wydarzenia | Radio | Członkowie | Wiadomości

SIDEBAR:
├── Osobisty
│   ├── Profil
│   ├── Oś czasu
│   ├── Skrzynka
│   └── Powiadomienia
├── Społeczność
│   ├── Spaces (grupy tematyczne)
│   ├── Członkowie ("Załoganci")
│   ├── Dyskusje
│   ├── Szkolenia / Projekty
│   └── Wydarzenia
├── Baza wiedzy
│   ├── 🎬 Nautilus HD (filmy)
│   ├── 📻 Radio Nautilus
│   ├── 📰 Agregator newsów
│   └── 📚 Książki
├── UFO24
│   ├── 🗺️ Mapa zgłoszeń
│   ├── ➕ Zgłoś zjawisko
│   └── 📋 Historia zgłoszeń
├── Multimedia
│   ├── Galeria
│   └── Dokumenty / Archiwum
├── Partnerzy
│   └── Jackowski, inni
└── Administracja
    └── Ustawienia
```

---

## Korzyści dla Bernatowicza — argumenty do prezentacji

| Problem teraz | Rozwiązanie Hubso |
|---|---|
| Utrzymanie serwera, aktualizacje CMS | ✅ Hubso bierze na siebie utrzymanie infrastruktury |
| Brak społeczności (komentarze pod artykułami to za mało) | ✅ Pełna platforma społecznościowa z grupami, DM, profilem |
| Rozproszenie treści (YT, strona, FB) | ✅ Wszystko w jednym miejscu |
| Brak moderacji społeczności | ✅ Zaufani pasjonaci jako moderatorzy |
| Brak interakcji między członkami | ✅ Wiadomości, dyskusje, komentarze |
| Brak monetyzacji | ✅ Szkolenia płatne, subskrypcje, książka na platformie |
| Treści giną w internecie | ✅ AI indeksuje, transkrybuje, podsumowuje |
| Brak narzędzi do zgłoszeń | ✅ UFO24 z mapą, formularzem, historią |
| Stara strona, słaby UX | ✅ Nowoczesny, responsywny interfejs z dark mode |

---

## Plan realizacji demo

### Faza 1 — Demo MVP (1-2 tygodnie)

- [ ] Dostosowanie kolorystyki i brandingu (Nautilus + Łódź)
- [ ] Stworzenie przykładowych Spaces z kategoriami Nautilus
- [ ] Feed z zaimportowanymi wpisami (z RSS)
- [ ] Podstrona UFO24 z mockupem mapy
- [ ] Podstrona Nautilus HD z przykładowymi filmami
- [ ] Profil Bernatowicza jako admin/założyciel
- [ ] Sekcja Wydarzenia z 2-3 przykładami

### Faza 2 — Funkcjonalność (2-4 tygodnie)

- [ ] Działający moduł zgłoszeń z mapą (Leaflet)
- [ ] AI transkrypcja filmów (Whisper API)
- [ ] Agregator RSS newsów
- [ ] Sekcja Radio z playerem
- [ ] Klon głosu (ElevenLabs)
- [ ] Integracja z GitHub (archiwum)

### Faza 3 — Polish & Launch

- [ ] Migracja treści ze starej strony
- [ ] Zaproszenia dla społeczności (z książką?)
- [ ] Szkolenie moderatorów
- [ ] Partnerzy (Jackowski etc.)

---

## Narzędzia do użycia

- **Firecrawl MCP** — scraping treści z nautilus.org.pl do migracji
- **Kie.ai** — generowanie grafik (bannery spaces, okładki wydarzeń, elementy Łodzi)
- **ElevenLabs** — klon głosu Bernatowicza
- **OpenAI Whisper** — transkrypcja filmów Nautilus HD
- **Leaflet.js / Mapbox** — mapa UFO24
- **RSS Parser** — agregator newsów
