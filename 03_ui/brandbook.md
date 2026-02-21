# Hubso.social — Brandbook

> **Wersja:** 1.0  
> **Data:** 2026-02-20  
> **Typ produktu:** SaaS — platforma społecznościowa white-label, self-hosted  
> **Styl:** Flat Design + Minimalizm, clean, professional, z dark mode

---

## 1. Marka

### 1.1 Nazwa

**Hubso** (hub + social) — centrum społeczności.

### 1.2 Tagline

> *„Twoja społeczność. Twoje zasady."*  
> Alternatywy: *„Community-first platform"* · *„Build. Engage. Grow."*

### 1.3 Wartości marki

| Wartość | Opis |
|---------|------|
| **Ownership** | Użytkownik jest właścicielem swoich danych i społeczności |
| **Modularność** | Rozszerzalność przez marketplace wtyczek (jak WordPress/Raycast) |
| **Prostota** | Czytelny interfejs, zero szumu, szybkie onboardowanie |
| **Profesjonalizm** | Estetyka na poziomie Circle.so/Notion — nie „kolejny BuddyBoss" |
| **Elastyczność** | White-label: klient zmienia kolory, logo, czcionki — to jego marka |

### 1.4 Głos marki (Tone of Voice)

- **Bezpośredni** — krótkie zdania, konkrety, zero korpomowy
- **Pomocny** — onboarding krok-po-kroku, tooltopy, empty states z podpowiedziami
- **Pewny siebie** — nie „spróbuj", lecz „zbuduj swoją społeczność"
- **Techniczny, ale przystępny** — dokumentacja API czytelna dla dev i no-coder

---

## 2. Logo

### 2.1 Konstrukcja

Logo składa się z ikony (symbol) + logotypu (tekst).

| Element | Specyfikacja |
|---------|-------------|
| **Ikona** | Abstrakcyjny kształt sieci/połączeń — okrąg z wewnętrznymi liniami (hub) |
| **Logotyp** | „hubso" — lowercase, font **Inter** weight 700 |
| **Domena** | „.social" — weight 400, kolor secondary |

### 2.2 Wersje logo

| Wersja | Użycie |
|--------|--------|
| **Pełne** (ikona + tekst) | Strona główna, landing page, dokumentacja |
| **Ikona** (sam symbol) | Favicon, mobile app icon, małe przestrzenie |
| **Logotyp** (sam tekst) | Footer, konteksty inline |

### 2.3 Przestrzeń ochronna (Clear Space)

Minimalna przestrzeń wokół logo = wysokość litery „h" w logotypie ze wszystkich stron.

### 2.4 Minimalne rozmiary

| Kontekst | Min. szerokość |
|----------|---------------|
| Pełne logo | 120px |
| Ikona | 24px |
| Favicon | 16×16px |

### 2.5 Niedozwolone użycie

- Nie rozciągaj / nie deformuj proporcji
- Nie zmieniaj kolorów logo poza zatwierdzone wersje (color / white / dark)
- Nie dodawaj cieni, obwódek, gradientów
- Nie umieszczaj na zbyt kontrastowym / niespójnym tle

---

## 3. Paleta kolorów

### 3.1 Kolory główne (Brand Colors)

Platforma jest white-label — poniższa paleta to **domyślna** (default theme, inspirowana Circle.so). Każdy klient może ją nadpisać.

| Rola | Nazwa | HEX | HSL | Tailwind token | Użycie |
|------|-------|-----|-----|----------------|--------|
| **Primary** | Indigo | `#4262F0` | 227° 86% 60% | `brand-primary` | CTA, aktywne elementy, ikony nawigacji, badges |
| **Primary Light** | Indigo 50 | `#EEF2FF` | 226° 100% 97% | `brand-primary-light` | Tła aktywnych elementów, hover states |
| **Primary Dark** | Indigo 800 | `#3730A3` | 244° 51% 42% | `brand-primary-dark` | Tekst na jasnym tle primary |
| **Secondary** | Teal 400 | `#7FE4DA` | 172° 64% 70% | `brand-secondary` | Akcenty, wyróżnienia, wskaźniki aktywności |

### 3.2 Kolory neutralne (Light Mode)

| Rola | Nazwa | HEX | Tailwind | Użycie |
|------|-------|-----|----------|--------|
| **Background** | Snow | `#F7F8FA` | `bg-[#F7F8FA]` | Główne tło aplikacji |
| **Surface** | White | `#FFFFFF` | `bg-white` | Karty, sidebar, header |
| **Border** | Slate 200 | `#E2E8F0` | `border-slate-200` | Obramowania, separatory |
| **Text Primary** | Slate 900 | `#0F172A` | `text-slate-900` | Nagłówki, ważne etykiety |
| **Text Secondary** | Slate 600 | `#475569` | `text-slate-600` | Tekst pomocniczy, opisy |
| **Text Muted** | Slate 400 | `#94A3B8` | `text-slate-400` | Placeholders, meta-info |

### 3.3 Kolory neutralne (Dark Mode)

| Rola | Nazwa | HEX | Tailwind | Użycie |
|------|-------|-----|----------|--------|
| **Background** | Near Black | `#050505` | `dark:bg-dark-bg` | Główne tło aplikacji |
| **Surface** | Dark Surface | `#0F1115` | `dark:bg-dark-surface` | Karty, sidebar, header |
| **Border** | Dark Border | `#222226` | `dark:border-dark-border` | Obramowania, separatory |
| **Scrollbar** | Slate 700 | `#334155` | — | Scrollbar thumb |
| **Text Primary** | Slate 100 | `#F1F5F9` | `dark:text-slate-100` | Nagłówki |
| **Text Secondary** | Slate 400 | `#94A3B8` | `dark:text-slate-400` | Tekst pomocniczy |
| **Text Muted** | Slate 500 | `#64748B` | `dark:text-slate-500` | Placeholders |

### 3.4 Kolory semantyczne

| Rola | HEX | Użycie |
|------|-----|--------|
| **Success** | `#22C55E` | Potwierdzenia, ukończone, online status (niezmienny — semantyczny) |
| **Warning** | `#F59E0B` | Ostrzeżenia, pending, expiring |
| **Error** | `#EF4444` | Błędy, usuwanie, wymagane pola |
| **Info** | `#3B82F6` | Linki, podpowiedzi, informacje |

### 3.5 Konfiguracja Tailwind

```js
// tailwind.config.js — sekcja theme.extend.colors
colors: {
  brand: {
    primary:       '#4262F0',
    'primary-light': '#EEF2FF',
    'primary-dark':  '#3730A3',
    secondary:     '#7FE4DA',
  },
  dark: {
    bg:      '#050505',
    surface: '#0F1115',
    border:  '#222226',
  },
},
boxShadow: {
  soft:        '0 2px 10px rgba(0,0,0,0.03)',
  card:        '0 0 0 1px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.04)',
  'dark-card': '0 0 0 1px rgba(255,255,255,0.06), 0 4px 8px rgba(0,0,0,0.2)',
},
```

### 3.6 White-label — nadpisywanie kolorów

Klient zmienia token `brand-primary` (i pochodne) w ustawieniach admin panelu. Cała paleta neutralna i semantyczna pozostaje stała. System generuje odcienie automatycznie na bazie primary HEX.

---

## 4. Typografia

### 4.1 Font systemowy

| Rola | Czcionka | Weight | Fallback |
|------|----------|--------|----------|
| **Heading & Body** | **Inter** | 300–700 | `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` |

Inter to font zaprojektowany dla interfejsów — doskonała czytelność w małych rozmiarach, obsługa ligatur, tabular numbers.

### 4.2 Import (Google Fonts)

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
```

```css
:root {
  --font-inter: 'Inter', sans-serif;
}
body {
  font-family: var(--font-inter);
}
```

### 4.3 Skala typograficzna

| Token | Rozmiar | Line Height | Weight | Użycie |
|-------|---------|-------------|--------|--------|
| `text-xxs` | 10px (0.625rem) | 1.4 | 600–700 | Badges, micro-labels |
| `text-xs` | 12px (0.75rem) | 1.5 | 400–500 | Meta info, timestamps |
| `text-sm` | 14px (0.875rem) | 1.5 | 400–600 | Etykiety, nawigacja, sidebar |
| `text-base` | 16px (1rem) | 1.6 | 400 | Tekst body, posty, komentarze |
| `text-lg` | 18px (1.125rem) | 1.6 | 600 | Podtytuły sekcji |
| `text-xl` | 20px (1.25rem) | 1.5 | 600–700 | Tytuły kart, nazwy modułów |
| `text-2xl` | 24px (1.5rem) | 1.4 | 700 | Nagłówki stron |
| `text-3xl` | 30px (1.875rem) | 1.3 | 700 | Hero, landing nagłówki |

### 4.4 Zasady typograficzne

- **Minimum body:** 16px na mobile, 14px na desktop (sidebar, meta)
- **Kontrast:** tekst slate-900 na białym tle = ratio ≥ 12:1 (WCAG AAA)
- **Tracking:** `tracking-tight` dla nagłówków; default dla body
- **Line length:** max 65–75 znaków na linię w obszarze content (max-w-prose)

---

## 5. Ikony

### 5.1 Zestaw ikon

| Biblioteka | Styl | Użycie |
|-----------|------|--------|
| **Solar Icons** (Iconify) | Linear (outline) | Nawigacja, sidebar, toolbar — domyślny |
| **Solar Icons** (Iconify) | Bold (filled) | Aktywny stan, akcenty, wyróżnienia |

### 5.2 Rozmiary

| Kontekst | Rozmiar | Przykład |
|----------|---------|---------|
| Nawigacja główna (header) | 24×24px | `<iconify-icon icon="solar:feed-linear" width="24">` |
| Toolbar / kontrolki | 22×22px | Search, bell, cart |
| Inline w tekście | 20×20px | Sidebar items |
| Micro (badge, indicator) | 16×16px | Ikony w badge'ach |

### 5.3 Zasady

- **Jeden zestaw** — wyłącznie Solar Icons (spójność)
- **Bez emoji** — nigdy nie używaj 🎨 🚀 jako ikon UI
- **Stany:** linear = inactive, bold = active/selected
- **Kolor ikon:** `text-slate-400` (inactive) → `text-brand-primary` (indigo) lub `text-slate-600` (hover/active)

---

## 6. Layout & Siatka

### 6.1 Struktura aplikacji

```
┌──────────────────────────────────────────────────────────┐
│  HEADER (h-16, sticky top-0, z-50)                       │
├───────────┬──────────────────────────────┬───────────────┤
│ SIDEBAR   │  MAIN CONTENT                │  RIGHT PANEL  │
│ (w-260px) │  (flex-1, overflow-y-auto)   │  (w-320px)    │
│ xl:flex   │                              │  hidden lg:   │
│           │                              │               │
└───────────┴──────────────────────────────┴───────────────┘
```

### 6.2 Breakpoints

| Breakpoint | Szerokość | Zachowanie |
|-----------|-----------|------------|
| `sm` | ≥640px | Ukryj/pokaż drobne elementy |
| `md` | ≥768px | Header nav widoczna |
| `lg` | ≥1024px | Right panel widoczny |
| `xl` | ≥1280px | Sidebar widoczny |
| `2xl` | ≥1536px | Szerszy content area |

### 6.3 Spacing

System bazuje na Tailwind 4px grid:

| Token | Wartość | Użycie |
|-------|---------|--------|
| `p-2` | 8px | Wewnętrzne paddingi small |
| `p-3` | 12px | Padding elementów nawigacji |
| `p-4` | 16px | Standardowy padding kart |
| `p-6` | 24px | Padding sekcji, sidebar |
| `gap-1` | 4px | Odstępy ikony w nawigacji |
| `gap-2` | 8px | Odstępy w listach |
| `gap-3` | 12px | Odstępy w kartach |
| `gap-4` | 16px | Odstępy między sekcjami |
| `gap-6` | 24px | Odstępy między komponentami |

### 6.4 Z-Index

| Warstwa | Z-Index | Element |
|---------|---------|---------|
| Base | `z-0` | Content, karty |
| Badges / overlays | `z-10` | Wskaźniki, badge |
| Dropdown / popover | `z-30` | Menu context, tooltip |
| Sticky header | `z-50` | Header, navbar |
| Modal overlay | `z-40` | Modal backdrop |
| Modal content | `z-50` | Modal dialog |
| Toast / notification | `z-[100]` | Floating toasts |

---

## 7. Komponenty

### 7.1 Karty (Cards)

```
Light:  bg-white shadow-card rounded-xl border border-gray-200
Dark:   bg-dark-surface shadow-dark-card rounded-xl border border-dark-border
```

- Padding wewnętrzny: `p-4` do `p-6`
- Border radius: `rounded-xl` (12px) — standard dla kart
- Hover (jeśli klikalne): `hover:shadow-lg transition-shadow cursor-pointer`

### 7.2 Przyciski (Buttons)

| Wariant | Light Mode | Dark Mode |
|---------|-----------|-----------|
| **Primary** | `bg-brand-primary text-white hover:bg-brand-primary-dark` | Bez zmian |
| **Secondary** | `bg-slate-100 text-slate-700 hover:bg-slate-200` | `bg-slate-800 text-slate-200 hover:bg-slate-700` |
| **Ghost** | `text-slate-600 hover:bg-slate-100` | `text-slate-400 hover:bg-slate-800` |
| **Danger** | `bg-red-500 text-white hover:bg-red-600` | Bez zmian |

Rozmiary:
| Rozmiar | Klasy |
|---------|-------|
| **sm** | `px-3 py-1.5 text-sm rounded-md` |
| **md** | `px-4 py-2 text-sm rounded-lg` |
| **lg** | `px-6 py-3 text-base rounded-lg` |

Wszystkie: `font-medium transition-colors duration-200 cursor-pointer`

### 7.3 Formularze (Inputs)

```
Light: bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm
       focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary
Dark:  bg-dark-surface border-dark-border text-slate-200
       focus:ring-brand-primary/30 focus:border-brand-primary
```

- Label: `text-sm font-medium text-slate-700 dark:text-slate-300 mb-1`
- Error: `text-sm text-red-500 mt-1`
- Placeholder: `text-slate-400 dark:text-slate-500`

### 7.4 Badges / Tagi

```
Default:  bg-slate-100 text-slate-600 text-xs font-medium px-2 py-0.5 rounded-full
Primary:  bg-brand-primary-light text-brand-primary-dark
Success:  bg-green-100 text-green-700
Warning:  bg-amber-100 text-amber-700
Error:    bg-red-100 text-red-700
```

### 7.5 Avatary

| Rozmiar | Klasy | Użycie |
|---------|-------|--------|
| **xs** | `w-6 h-6 rounded-full` | Inline mentions |
| **sm** | `w-8 h-8 rounded-full` | Lista komentarzy |
| **md** | `w-9 h-9 rounded-full` | Header user, sidebar |
| **lg** | `w-12 h-12 rounded-full` | Lista członków |
| **xl** | `w-20 h-20 rounded-full` | Profil użytkownika |

Zawsze: `object-cover border border-gray-200 dark:border-slate-700`

### 7.6 Notyfikacje (Badge Count)

```html
<span class="absolute -top-1.5 -right-1.5 w-4 h-4 bg-brand-primary text-white 
  text-[10px] font-bold flex items-center justify-center rounded-full 
  border-2 border-white dark:border-dark-surface">
  8
</span>
```

### 7.7 Nawigacja

**Header** (top bar):
- Wysokość: `h-16`
- Aktywny link: `border-b-[2px] border-brand-primary text-brand-primary`
- Nieaktywny: `text-slate-400 hover:text-slate-600 dark:hover:text-slate-200`

**Sidebar** (lewy panel):
- Szerokość: `w-[260px]`
- Aktywny item: `text-brand-primary bg-brand-primary-light dark:bg-brand-primary/10 rounded-md`
- Nieaktywny: `text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800`

---

## 8. Cienie & Efekty

### 8.1 Shadow

| Token | Wartość | Użycie |
|-------|---------|--------|
| `shadow-soft` | `0 2px 10px rgba(0,0,0,0.03)` | Subteny shadow na hover |
| `shadow-card` | `0 0 0 1px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.04)` | Karty light mode |
| `shadow-dark-card` | `0 0 0 1px rgba(255,255,255,0.06), 0 4px 8px rgba(0,0,0,0.2)` | Karty dark mode |

### 8.2 Border Radius

| Element | Wartość |
|---------|---------|
| Karty, modale | `rounded-xl` (12px) |
| Przyciski, inputy | `rounded-lg` (8px) |
| Badges, tagi | `rounded-full` |
| Avatary | `rounded-full` |
| Mniejsze elementy | `rounded-md` (6px) |

### 8.3 Transitions

```css
/* Standardowe transition */
transition-colors duration-200    /* kolory przycisków, linków */
transition-colors duration-300    /* dark mode toggle, tła */
transition-shadow duration-200    /* hovery kart */
transition-all duration-200       /* kombinowane efekty */
```

- **Micro-interactions:** 150–200ms
- **Layout transitions:** 200–300ms
- **Ease:** default (ease-in-out)
- **prefers-reduced-motion:** szanuj ustawienia użytkownika

### 8.4 Scrollbar

```css
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 3px; }
.dark ::-webkit-scrollbar-thumb { background: #334155; }
```

---

## 9. Dark Mode

### 9.1 Implementacja

- Kontrolowany klasą `dark` na `<html>` element
- Tailwind `darkMode: 'class'`
- Persystencja: `localStorage.theme`
- Auto-detect: `prefers-color-scheme: dark`
- Toggle: przycisk w header (ikona moon/sun z Solar Icons)

### 9.2 Mapowanie

| Element | Light | Dark |
|---------|-------|------|
| Body bg | `#F7F8FA` | `#050505` |
| Surface | `#FFFFFF` | `#0F1115` |
| Border | `#E2E8F0` (slate-200) | `#222226` |
| Text primary | `#0F172A` (slate-900) | `#F1F5F9` (slate-100) |
| Text secondary | `#475569` (slate-600) | `#94A3B8` (slate-400) |
| Brand primary | `#4262F0` | `#4262F0` (bez zmiany) |
| Active bg | `bg-indigo-50` | `bg-indigo-500/10` |
| Shadow | `shadow-card` | `shadow-dark-card` |

### 9.3 Zasady dark mode

- Brand primary **nie zmienia się** — zawsze `#4262F0`
- Tekst na dark bg: slate-100 / slate-200 (nie biały #FFF — zbyt jaskrawy)
- Tła nigdy nie są czysto czarne `#000` — użyj `#050505` (cieplejszy)
- Surface vs background: delikatny kontrast (`#0F1115` vs `#050505`)

---

## 10. Dostępność (Accessibility)

### 10.1 WCAG AA / AAA

| Kryterium | Wymaganie | Status |
|----------|-----------|--------|
| Kontrast tekstu (body) | ≥ 4.5:1 | ✅ slate-900 na white = 15.4:1 |
| Kontrast tekstu (large) | ≥ 3:1 | ✅ |
| Focus states | Widoczny ring | ✅ `focus:ring-2 focus:ring-brand-primary/20` |
| Touch targets | ≥ 44×44px | ✅ nav items, buttons |
| Alt text | Wszystkie obrazy | ✅ |
| Aria labels | Ikony-only buttons | ✅ |

### 10.2 Keyboard Navigation

- Tab order odpowiada kolejności wizualnej
- Skip-to-content link na początku strony
- Focus trap w modalach
- Escape zamyka modale/dropdowny

### 10.3 Screen Reader

- Semantyczny HTML: `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`
- `aria-label` na przyciskach z ikonami (no text)
- `aria-live` dla dynamicznych notyfikacji
- `role="dialog"` na modalach

---

## 11. Animacje & Motion

### 11.1 Zasady

| Reguła | Wartość |
|--------|---------|
| Micro-interactions | 150–200ms ease |
| Page transitions | 200–300ms ease-in-out |
| Skeleton loading | Pulse animation (Tailwind `animate-pulse`) |
| Notification toast | Slide + fade, 300ms |
| Modal | Fade overlay + scale content, 200ms |

### 11.2 Anti-patterns

- **NIE** animuj `width`, `height`, `margin` — tylko `transform` + `opacity`
- **NIE** używaj animacji dłuższych niż 500ms na elementach UI
- **NIE** autoplay video / audio bez interakcji użytkownika
- **ZAWSZE** respektuj `prefers-reduced-motion: reduce`

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 12. Responsywność

### 12.1 Mobile First

Projektujemy mobile-first. Desktop layout to rozszerzenie.

| Viewport | Layout |
|----------|--------|
| **< 768px** | Header z hamburger menu, brak sidebar, content full-width |
| **768–1023px** | Header nav visible, brak sidebar, brak right panel |
| **1024–1279px** | Header nav, right panel visible, sidebar ukryty |
| **≥ 1280px** | Pełny layout: header + sidebar + content + right panel |

### 12.2 Zasady

- Brak horizontal scroll na żadnym breakpoincie
- Touch targets ≥ 44px na mobile
- Font body ≥ 16px na mobile (zapobiega auto-zoom na iOS)
- Obrazy: `srcset` + lazy loading + WebP format
- Scrollbar hidden klasa: `.no-scrollbar` dla horizontal scrolls

---

## 13. Imagery & Media

### 13.1 Zdjęcia

- **Avatary:** okrągłe (`rounded-full`), `object-cover`, z border
- **Covery:** prostokąt 16:9 lub 3:1, `object-cover`, `rounded-xl`
- **Zdjęcia w postach:** `rounded-lg`, max-width 100%, lazy loading
- **Placeholder:** gradient `from-slate-100 to-slate-200` lub skeleton

### 13.2 Video

- Współczynnik: 16:9 (standard) w kontenerze `aspect-video`
- Player: custom wrapper z brand primary color na controls
- Thumbnail: auto-generated lub custom upload

### 13.3 Empty States

Każdy pusty widok zawiera:
1. Ilustrację (SVG, subtelna, monochromatic brand-primary)
2. Tytuł (co tu będzie)
3. Opis (jak tu coś dodać)
4. CTA button (primary)

---

## 14. White-label — System tematyzacji

### 14.1 Zmienne CSS (klient nadpisuje)

```css
:root {
  --hubso-primary: #4262F0;
  --hubso-primary-light: #EEF2FF;
  --hubso-primary-dark: #3730A3;
  --hubso-font-heading: 'Inter', sans-serif;
  --hubso-font-body: 'Inter', sans-serif;
  --hubso-radius: 12px;
  --hubso-logo-url: url('/logo.svg');
}
```

### 14.2 Co klient może zmienić

| Element | Konfigurowalne? | Gdzie |
|---------|----------------|-------|
| Logo (ikona + tekst) | ✅ | Admin Panel → Branding |
| Primary color | ✅ | Admin Panel → Branding |
| Font heading / body | ✅ | Admin Panel → Branding |
| Favicon | ✅ | Admin Panel → Branding |
| Cover photo community | ✅ | Admin Panel → Branding |
| Email templates (kolory) | ✅ | Admin Panel → Emails |
| Dark mode domyślny? | ✅ | Admin Panel → Appearance |
| Kolory neutralne | ❌ | Stałe — zapewnia spójność |
| Layout struktury | ❌ | Stały — sidebar/header/content |

### 14.3 Automatyczne generowanie odcieni

Na podstawie podanego primary HEX system generuje:
- `primary-50` ... `primary-900` (skala Tailwind)
- `primary-light` (tło aktywnych elementów)
- `primary-dark` (tekst na jasnym primary bg)
- Kontrast tekstu sprawdzany automatycznie (WCAG AA minimum)

---

## 15. Tech Stack — implementacja design systemu

| Warstwa | Technologia |
|---------|------------|
| **Design tokens** | Tailwind CSS 4 config + CSS custom properties |
| **Komponenty UI** | shadcn/ui (bazowe) + custom components |
| **Ikony** | Iconify (Solar Icons set) |
| **Animacje** | Framer Motion + Tailwind transitions |
| **Fonts** | Google Fonts CDN (Inter) |
| **Dark mode** | Tailwind `darkMode: 'class'` + localStorage |
| **Responsive** | Tailwind breakpoints (mobile-first) |
| **Accessibility** | Native HTML semantics + ARIA + focus management |

---

## 16. Checklist — przed każdym deliverable

### Jakość wizualna
- [ ] Brak emoji jako ikon — tylko Solar Icons (Iconify)
- [ ] Spójna skala ikon (16/20/22/24px)
- [ ] Hover states nie powodują layout shift
- [ ] Użyto brand tokens, nie hardcoded kolorów

### Interakcja
- [ ] `cursor-pointer` na kliknialnych elementach
- [ ] Hover z płynnym transition (150–300ms)
- [ ] Focus states widoczne (ring)
- [ ] Loading states (skeleton / spinner)

### Light / Dark Mode
- [ ] Przetestowane oba tryby
- [ ] Tekst spełnia kontrast 4.5:1
- [ ] Bordery widoczne w obu trybach
- [ ] Tła glass/transparent czytelne

### Layout
- [ ] Brak horizontal scroll na mobile (375px)
- [ ] Przetestowane: 375px, 768px, 1024px, 1440px
- [ ] Content nie chowa się za fixed header
- [ ] Sidebar kolapsuje poniżej xl
### Paleta oparta na Circle.so
- [ ] Primary indigo `#4262F0` zweryfikowany na dark/light mode
- [ ] Teal secondary `#7FE4DA` dobrze kontrastuje z ciemnym tłem
- [ ] Brak kolizji z kolorami semantycznymi (success green, error red)
### Dostępność
- [ ] `alt` na obrazach
- [ ] `label` na input fields
- [ ] `aria-label` na icon-only buttons
- [ ] `prefers-reduced-motion` respektowane
- [ ] Tab order logiczny

---

*Dokument utrzymywany przez zespół design & frontend. Aktualizuj przy każdej zmianie design systemu.*