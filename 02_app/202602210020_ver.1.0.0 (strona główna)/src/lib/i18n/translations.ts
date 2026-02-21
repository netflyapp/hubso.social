export type Locale = "en" | "pl";

export const translations = {
  en: {
    // Header
    header: {
      login: "Log in",
      startFree: "Start free",
      features: "Features",
      solutions: "Solutions",
      pricing: "Pricing",
      // Mobile drawer
      drawerLogin: "Login",
      drawerGetStarted: "Get Started for Free",
    },

    // Header menu content
    headerMenu: {
      main: {
        title: "All-in-One Platform",
        description:
          "Community, courses, events, messaging, AI and plugin marketplace — everything under your brand.",
      },
      items: [
        {
          title: "Community Spaces",
          description:
            "Discussion forums, activity feeds, and rich media posts.",
        },
        {
          title: "Courses & LMS",
          description:
            "Create and sell online courses with quizzes and certificates.",
        },
        {
          title: "AI & Automation",
          description:
            "AI moderation, member matching, smart summaries, and auto-translation.",
        },
        {
          title: "Plugin Marketplace",
          description:
            "Extend with plugins — or build and sell your own (70/30 revenue share).",
        },
      ],
      solutions: [
        {
          title: "For Educators & Coaches",
          description:
            "Build course communities with integrated LMS and payment.",
        },
        {
          title: "For Influencers",
          description:
            "Monetize your audience with memberships and exclusive content.",
        },
        {
          title: "For SaaS Companies",
          description:
            "Customer communities that drive retention and reduce churn.",
        },
        {
          title: "For Healthcare Experts",
          description:
            "HIPAA-ready communities for doctors, dietitians, and coaches.",
        },
        {
          title: "For Developers",
          description:
            "Build plugins, earn revenue, and extend Hubso with full API access.",
        },
        {
          title: "For Organizations & NGOs",
          description:
            "Manage members, events, and communications in one place.",
        },
      ],
    },

    // Hero
    hero: {
      pill: "🚀 Coming Q3 2026",
      pillCta: "Join the waitlist",
      titleWords: ["Your", "Community.", "Your", "Rules."],
      subtitle:
        "The modular, AI-native community platform with a plugin marketplace. Zero transaction fees. Full white-label. Self-hosted or cloud.",
      ctaPrimary: "Start free — no credit card",
      ctaSecondary: "See how it works",
      badgeModern: "Modern Stack",
      badgeFees: "Zero Transaction Fees",
      badgeAI: "AI-Native",
    },

    // Logos / Audiences
    logos: {
      heading: "Built for every community",
      audiences: [
        "Online Educators",
        "Health Professionals",
        "Fitness Coaches",
        "Business Communities",
        "Developer Groups",
        "Creative Collectives",
        "Faith Communities",
        "Membership Orgs",
      ],
    },

    // Problem
    problem: {
      title: "Problem",
      subtitle: "Community platforms are broken.",
      description:
        "Creators and businesses are stuck choosing between outdated tools and locked-in SaaS platforms.",
      items: [
        {
          title: "WordPress is outdated",
          description:
            "Stitching together 20 plugins, fighting with PHP themes and praying the next update won't break your site. Your community deserves a modern stack.",
        },
        {
          title: "Platforms take your fees",
          description:
            "Circle, Skool and others charge up to 10% on every transaction. That's your revenue — not theirs. With Hubso, transaction fees are zero.",
        },
        {
          title: "Your data isn't yours",
          description:
            "When you build on someone else's platform, they own your members, content and monetization. One policy change and everything disappears.",
        },
      ],
    },

    // Solution
    solution: {
      title: "Solution",
      subtitle: "Community platform, reimagined.",
      description:
        "Hubso is modular, AI-native and built for creators who refuse to compromise on ownership, design and revenue.",
      items: [
        {
          title: "Modern Stack, Zero Legacy",
          description:
            "Built on Next.js, React and a headless architecture. Blazing-fast performance, SEO-optimized, and ready for the modern web — no PHP, no plugin hell.",
        },
        {
          title: "Zero Transaction Fees",
          description:
            "Keep 100% of your revenue. Sell courses, memberships, and digital products with Stripe & PayPal — Hubso never takes a cut.",
        },
        {
          title: "Plugin Marketplace",
          description:
            "Extend your platform with a growing ecosystem of community-built plugins. Add features like gamification, analytics, polls, booking — whatever your community needs.",
        },
        {
          title: "Full White-Label & Self-Hosting",
          description:
            "Your brand, your domain, your data. Deploy on your own infrastructure or use our managed cloud. Complete control with zero vendor lock-in.",
        },
      ],
    },

    // Features
    features: {
      title: "Features",
      subtitle: "Everything your community needs. Nothing it doesn't.",
      items: [
        {
          title: "Community Spaces",
          content:
            "Discussion forums, topic channels, and activity feeds — all in one place. Threaded conversations, reactions, mentions and rich media.",
        },
        {
          title: "Real-Time Messaging",
          content:
            "1-on-1 DMs, group chats and live rooms with WebSocket-powered real-time delivery. Typing indicators, read receipts and file sharing.",
        },
        {
          title: "Courses & LMS",
          content:
            "Drip content, quizzes, certificates and progress tracking. Sell individual courses or bundle them into memberships.",
        },
        {
          title: "Events & Live Streams",
          content:
            "Host webinars, AMAs, workshops and virtual meetups. Calendar integration, RSVP, reminders and Zoom/Meet embedding.",
        },
        {
          title: "Plugin Marketplace",
          content:
            "Extend with community-built plugins: gamification, analytics, polls, booking, custom integrations and more.",
        },
        {
          title: "AI & Automation",
          content:
            "AI-powered moderation, smart recommendations, automated onboarding flows, content summarization and member insights.",
        },
      ],
    },

    // How It Works
    howItWorks: {
      title: "How it works",
      subtitle: "Live in 5 minutes. Scale to millions.",
      steps: [
        {
          title: "1. Create your community",
          content:
            "Pick a plan, connect your domain and you're live in under 5 minutes. Import members from Circle, Skool or CSV with one click.",
        },
        {
          title: "2. Customize everything",
          content:
            "Choose your theme and colors, install plugins from the marketplace, set up courses, events, groups and monetization — all from a drag-and-drop admin panel.",
        },
        {
          title: "3. Grow & monetize",
          content:
            "Launch paid memberships, sell courses, run live events and let AI handle moderation, recommendations and analytics. Scale from 10 to 100k+ members.",
        },
      ],
    },

    // Comparison
    comparison: {
      title: "Compare",
      subtitle: "See how Hubso stacks up.",
      description:
        "Feature-by-feature comparison with the most popular community platforms.",
      featureLabel: "Feature",
      features: [
        "Self-hosted option",
        "White-label / custom domain",
        "Zero transaction fees",
        "Plugin / extension marketplace",
        "AI-native features",
        "Courses & LMS built-in",
        "Modern headless architecture",
        "Real-time messaging",
      ],
    },

    // Testimonials
    testimonials: {
      title: "Testimonials",
      subtitle: "Loved by community builders worldwide",
    },

    // Pricing
    pricing: {
      title: "Pricing",
      subtitle: "Transparent pricing. No hidden fees. Ever.",
      monthly: "Monthly",
      yearly: "Yearly",
      popular: "Popular",
      billedMonthly: "billed monthly",
      billedAnnually: "billed annually",
      plans: [
        {
          name: "FREE",
          features: [
            "Up to 50 members",
            "Core community features",
            "Hubso subdomain",
            "Basic analytics",
            "Community support",
          ],
          description: "Perfect for getting started and testing the waters",
          buttonText: "Start free",
        },
        {
          name: "PRO",
          features: [
            "Up to 1,000 members",
            "Custom domain",
            "White-label branding",
            "AI moderation & matching",
            "10 GB storage",
            "Email support",
          ],
          description: "For growing communities and creators",
          buttonText: "Start free trial",
        },
        {
          name: "BUSINESS",
          features: [
            "Up to 10,000 members",
            "Advanced AI features",
            "Automation engine",
            "Advanced analytics",
            "100 GB storage",
            "Plugin marketplace access",
            "Priority support",
          ],
          description: "For professional communities and businesses",
          buttonText: "Start free trial",
        },
        {
          name: "ENTERPRISE",
          features: [
            "Unlimited members",
            "Dedicated infrastructure",
            "99.99% SLA",
            "SSO / SAML",
            "Custom integrations",
            "Dedicated account manager",
            "On-premise option",
          ],
          description: "For large-scale operations requiring full control",
          buttonText: "Contact sales",
        },
      ],
    },

    // FAQ
    faq: {
      title: "FAQ",
      subtitle: "Frequently asked questions",
      stillHaveQuestions: "Still have questions? Email us at",
      items: [
        {
          question: "What is Hubso?",
          answer:
            "Hubso is a modular, AI-native community platform built on a modern stack (Next.js + NestJS). It combines community spaces, courses, events, messaging, and a plugin marketplace — all under your own brand with zero transaction fees.",
        },
        {
          question: "How does Hubso compare to Circle.so or Skool?",
          answer:
            "Unlike Circle.so and Skool, Hubso offers a plugin marketplace (like WordPress but modern), native AI features, zero transaction fees (only standard Stripe ~2.9%), full white-label, and the option to self-host on your own infrastructure. No other platform combines all of these.",
        },
        {
          question: "What AI features are included?",
          answer:
            "Hubso includes AI-powered moderation, intelligent member matching, post summaries, semantic search, auto-translation, writing assistant, and community analytics. All powered through OpenRouter, giving you access to GPT-4o, Claude, Gemini, and more.",
        },
        {
          question: "Can I self-host Hubso?",
          answer:
            "Yes! Starting from Phase 2 (Q4 2026), Hubso will offer self-hosted deployment via Docker. You'll have full control over your data, infrastructure, and can run it on any cloud provider or on-premise.",
        },
        {
          question: "How does the plugin marketplace work?",
          answer:
            "Developers can build and publish plugins using our SDK and API. Plugins are reviewed and listed on the marketplace. Revenue is split 70/30 (developer/Hubso). Community admins can browse, install, and configure plugins with one click.",
        },
        {
          question: "Is there a free plan?",
          answer:
            "Yes! The Free plan supports up to 50 members with all core community features. No credit card required. Upgrade to Pro ($29/mo) or Business ($79/mo) when you're ready to scale.",
        },
        {
          question: "What about data migration?",
          answer:
            "We provide migration tools and dedicated support for moving from Circle.so, Skool, BuddyBoss, Discourse, and other platforms. Enterprise plans include white-glove migration assistance.",
        },
        {
          question: "What tech stack does Hubso use?",
          answer:
            "Hubso is built with Next.js 15 (App Router), NestJS, PostgreSQL 16, Redis 7, Meilisearch, and Tailwind CSS + shadcn/ui. Mobile apps use React Native + Expo. Everything is designed for sub-200ms TTFB and 99.9% uptime.",
        },
      ],
    },

    // CTA
    cta: {
      title: "Ready to own your community?",
      subtitle: "Start building for free today.",
      ctaPrimary: "Start free — no credit card",
      ctaSecondary: "Talk to sales",
      note: "Free forever for up to 50 members. Upgrade anytime.",
    },

    // Footer
    footer: {
      tagline:
        "The modular, AI-native community platform. Own your audience, your data and your revenue.",
      copyright: "All rights reserved.",
      privacyPolicy: "Privacy Policy",
      termsOfService: "Terms of Service",
      sections: [
        {
          title: "Product",
          links: ["Features", "Pricing", "Plugin Marketplace", "Roadmap", "Changelog"],
        },
        {
          title: "Company",
          links: ["About", "Blog", "Careers", "Contact"],
        },
        {
          title: "Resources",
          links: ["Documentation", "API Reference", "Community", "Status"],
        },
        {
          title: "Connect",
          links: ["Twitter", "GitHub", "Discord", "LinkedIn"],
        },
      ],
    },

    // Locale switcher
    localeSwitcher: {
      label: "Language",
    },
  },

  pl: {
    // Header
    header: {
      login: "Zaloguj się",
      startFree: "Zacznij za darmo",
      features: "Funkcje",
      solutions: "Rozwiązania",
      pricing: "Cennik",
      drawerLogin: "Zaloguj się",
      drawerGetStarted: "Zacznij za darmo",
    },

    // Header menu content
    headerMenu: {
      main: {
        title: "Platforma All-in-One",
        description:
          "Społeczność, kursy, wydarzenia, wiadomości, AI i marketplace pluginów — wszystko pod Twoją marką.",
      },
      items: [
        {
          title: "Przestrzenie społeczności",
          description:
            "Fora dyskusyjne, feedy aktywności i posty z multimediami.",
        },
        {
          title: "Kursy i LMS",
          description:
            "Twórz i sprzedawaj kursy online z quizami i certyfikatami.",
        },
        {
          title: "AI i automatyzacja",
          description:
            "Moderacja AI, dopasowywanie członków, inteligentne podsumowania i auto-tłumaczenie.",
        },
        {
          title: "Marketplace pluginów",
          description:
            "Rozszerzaj pluginami — lub twórz i sprzedawaj własne (podział przychodów 70/30).",
        },
      ],
      solutions: [
        {
          title: "Dla edukatorów i coachów",
          description:
            "Buduj społeczności kursowe ze zintegrowanym LMS i płatnościami.",
        },
        {
          title: "Dla influencerów",
          description:
            "Monetyzuj swoją publiczność subskrypcjami i ekskluzywnymi treściami.",
        },
        {
          title: "Dla firm SaaS",
          description:
            "Społeczności klientów, które zwiększają retencję i redukują churn.",
        },
        {
          title: "Dla ekspertów zdrowia",
          description:
            "Społeczności gotowe na HIPAA dla lekarzy, dietetyków i coachów.",
        },
        {
          title: "Dla deweloperów",
          description:
            "Twórz pluginy, zarabiaj i rozszerzaj Hubso z pełnym dostępem do API.",
        },
        {
          title: "Dla organizacji i NGO",
          description:
            "Zarządzaj członkami, wydarzeniami i komunikacją w jednym miejscu.",
        },
      ],
    },

    // Hero
    hero: {
      pill: "🚀 Start Q3 2026",
      pillCta: "Dołącz do listy",
      titleWords: ["Twoja", "Społeczność.", "Twoje", "Zasady."],
      subtitle:
        "Modularna, natywna AI platforma społecznościowa z marketplace pluginów. Zero prowizji od transakcji. Pełny white-label. Self-hosted lub chmura.",
      ctaPrimary: "Zacznij za darmo — bez karty",
      ctaSecondary: "Zobacz jak to działa",
      badgeModern: "Nowoczesny Stack",
      badgeFees: "Zero Prowizji",
      badgeAI: "Natywne AI",
    },

    // Logos / Audiences
    logos: {
      heading: "Stworzone dla każdej społeczności",
      audiences: [
        "Edukatorzy online",
        "Specjaliści zdrowia",
        "Trenerzy fitness",
        "Społeczności biznesowe",
        "Grupy deweloperów",
        "Kolektywy kreatywne",
        "Wspólnoty religijne",
        "Organizacje członkowskie",
      ],
    },

    // Problem
    problem: {
      title: "Problem",
      subtitle: "Platformy społecznościowe są zepsute.",
      description:
        "Twórcy i firmy muszą wybierać między przestarzałymi narzędziami a zamkniętymi platformami SaaS.",
      items: [
        {
          title: "WordPress jest przestarzały",
          description:
            "Składanie 20 wtyczek, walka z motywami PHP i modlenie się, żeby kolejna aktualizacja niczego nie zepsuła. Twoja społeczność zasługuje na nowoczesny stack.",
        },
        {
          title: "Platformy zabierają Twoje prowizje",
          description:
            "Circle, Skool i inne pobierają do 10% od każdej transakcji. To Twój przychód — nie ich. W Hubso prowizje od transakcji wynoszą zero.",
        },
        {
          title: "Twoje dane nie są Twoje",
          description:
            "Gdy budujesz na cudzej platformie, to oni posiadają Twoich członków, treści i monetyzację. Jedna zmiana polityki i wszystko znika.",
        },
      ],
    },

    // Solution
    solution: {
      title: "Rozwiązanie",
      subtitle: "Platforma społecznościowa, od nowa.",
      description:
        "Hubso jest modularne, natywne AI i stworzone dla twórców, którzy nie godzą się na kompromisy w kwestii własności, designu i przychodów.",
      items: [
        {
          title: "Nowoczesny Stack, Zero Legacy",
          description:
            "Zbudowane na Next.js, React i architekturze headless. Błyskawiczna wydajność, optymalizacja SEO i gotowość na nowoczesny web — bez PHP, bez piekła wtyczek.",
        },
        {
          title: "Zero Prowizji od Transakcji",
          description:
            "Zatrzymaj 100% swoich przychodów. Sprzedawaj kursy, subskrypcje i produkty cyfrowe przez Stripe i PayPal — Hubso nigdy nie pobiera prowizji.",
        },
        {
          title: "Marketplace Pluginów",
          description:
            "Rozszerzaj platformę rosnącym ekosystemem pluginów tworzonych przez społeczność. Dodawaj funkcje jak grywalizacja, analityka, ankiety, rezerwacje — cokolwiek potrzebuje Twoja społeczność.",
        },
        {
          title: "Pełny White-Label i Self-Hosting",
          description:
            "Twoja marka, Twoja domena, Twoje dane. Wdróż na własnej infrastrukturze lub korzystaj z naszej chmury zarządzanej. Pełna kontrola bez uzależnienia od dostawcy.",
        },
      ],
    },

    // Features
    features: {
      title: "Funkcje",
      subtitle: "Wszystko, czego potrzebuje Twoja społeczność. I nic więcej.",
      items: [
        {
          title: "Przestrzenie społeczności",
          content:
            "Fora dyskusyjne, kanały tematyczne i feedy aktywności — wszystko w jednym miejscu. Wątki, reakcje, wzmianki i multimedia.",
        },
        {
          title: "Wiadomości w czasie rzeczywistym",
          content:
            "DM-y 1-na-1, czaty grupowe i pokoje live z dostarczaniem w czasie rzeczywistym przez WebSocket. Wskaźniki pisania, potwierdzenia odczytu i udostępnianie plików.",
        },
        {
          title: "Kursy i LMS",
          content:
            "Treści drip, quizy, certyfikaty i śledzenie postępów. Sprzedawaj pojedyncze kursy lub łącz je w subskrypcje.",
        },
        {
          title: "Wydarzenia i transmisje na żywo",
          content:
            "Prowadź webinary, AMA, warsztaty i spotkania online. Integracja z kalendarzem, RSVP, przypomnienia i osadzanie Zoom/Meet.",
        },
        {
          title: "Marketplace pluginów",
          content:
            "Rozszerzaj pluginami społeczności: grywalizacja, analityka, ankiety, rezerwacje, niestandardowe integracje i więcej.",
        },
        {
          title: "AI i automatyzacja",
          content:
            "Moderacja AI, inteligentne rekomendacje, automatyczne onboardingi, podsumowania treści i insights o członkach.",
        },
      ],
    },

    // How It Works
    howItWorks: {
      title: "Jak to działa",
      subtitle: "Na żywo w 5 minut. Skaluj do milionów.",
      steps: [
        {
          title: "1. Stwórz swoją społeczność",
          content:
            "Wybierz plan, podłącz domenę i jesteś online w mniej niż 5 minut. Importuj członków z Circle, Skool lub CSV jednym kliknięciem.",
        },
        {
          title: "2. Dostosuj wszystko",
          content:
            "Wybierz motyw i kolory, zainstaluj pluginy z marketplace, skonfiguruj kursy, wydarzenia, grupy i monetyzację — wszystko z panelu drag-and-drop.",
        },
        {
          title: "3. Rozwijaj i monetyzuj",
          content:
            "Uruchom płatne członkostwa, sprzedawaj kursy, organizuj wydarzenia na żywo i pozwól AI zająć się moderacją, rekomendacjami i analityką. Skaluj od 10 do 100k+ członków.",
        },
      ],
    },

    // Comparison
    comparison: {
      title: "Porównanie",
      subtitle: "Zobacz jak Hubso wypada na tle konkurencji.",
      description:
        "Porównanie funkcji z najpopularniejszymi platformami społecznościowymi.",
      featureLabel: "Funkcja",
      features: [
        "Opcja self-hosted",
        "White-label / własna domena",
        "Zero prowizji od transakcji",
        "Marketplace pluginów / rozszerzeń",
        "Natywne funkcje AI",
        "Wbudowane kursy i LMS",
        "Nowoczesna architektura headless",
        "Wiadomości w czasie rzeczywistym",
      ],
    },

    // Testimonials
    testimonials: {
      title: "Opinie",
      subtitle: "Cenione przez twórców społeczności na całym świecie",
    },

    // Pricing
    pricing: {
      title: "Cennik",
      subtitle: "Przejrzyste ceny. Bez ukrytych opłat. Nigdy.",
      monthly: "Miesięcznie",
      yearly: "Rocznie",
      popular: "Popularny",
      billedMonthly: "rozliczane miesięcznie",
      billedAnnually: "rozliczane rocznie",
      plans: [
        {
          name: "DARMOWY",
          features: [
            "Do 50 członków",
            "Podstawowe funkcje społeczności",
            "Subdomena Hubso",
            "Podstawowa analityka",
            "Wsparcie społeczności",
          ],
          description: "Idealny na start i testowanie",
          buttonText: "Zacznij za darmo",
        },
        {
          name: "PRO",
          features: [
            "Do 1 000 członków",
            "Własna domena",
            "Branding white-label",
            "Moderacja i matching AI",
            "10 GB przestrzeni",
            "Wsparcie e-mail",
          ],
          description: "Dla rosnących społeczności i twórców",
          buttonText: "Rozpocznij trial",
        },
        {
          name: "BUSINESS",
          features: [
            "Do 10 000 członków",
            "Zaawansowane funkcje AI",
            "Silnik automatyzacji",
            "Zaawansowana analityka",
            "100 GB przestrzeni",
            "Dostęp do marketplace pluginów",
            "Wsparcie priorytetowe",
          ],
          description: "Dla profesjonalnych społeczności i biznesów",
          buttonText: "Rozpocznij trial",
        },
        {
          name: "ENTERPRISE",
          features: [
            "Nielimitowani członkowie",
            "Dedykowana infrastruktura",
            "99.99% SLA",
            "SSO / SAML",
            "Niestandardowe integracje",
            "Dedykowany account manager",
            "Opcja on-premise",
          ],
          description: "Dla dużych operacji wymagających pełnej kontroli",
          buttonText: "Skontaktuj się",
        },
      ],
    },

    // FAQ
    faq: {
      title: "FAQ",
      subtitle: "Najczęściej zadawane pytania",
      stillHaveQuestions: "Masz więcej pytań? Napisz do nas na",
      items: [
        {
          question: "Czym jest Hubso?",
          answer:
            "Hubso to modularna, natywna AI platforma społecznościowa zbudowana na nowoczesnym stacku (Next.js + NestJS). Łączy przestrzenie społeczności, kursy, wydarzenia, wiadomości i marketplace pluginów — wszystko pod Twoją marką z zerowymi prowizjami od transakcji.",
        },
        {
          question: "Jak Hubso wypada w porównaniu do Circle.so lub Skool?",
          answer:
            "W przeciwieństwie do Circle.so i Skool, Hubso oferuje marketplace pluginów (jak WordPress, ale nowoczesny), natywne funkcje AI, zero prowizji od transakcji (tylko standardowy Stripe ~2.9%), pełny white-label i opcję self-hostingu na własnej infrastrukturze. Żadna inna platforma nie łączy tego wszystkiego.",
        },
        {
          question: "Jakie funkcje AI są dostępne?",
          answer:
            "Hubso zawiera moderację AI, inteligentne dopasowywanie członków, podsumowania postów, wyszukiwanie semantyczne, auto-tłumaczenie, asystenta pisania i analitykę społeczności. Zasilane przez OpenRouter, zapewniając dostęp do GPT-4o, Claude, Gemini i innych.",
        },
        {
          question: "Czy mogę hostować Hubso samodzielnie?",
          answer:
            "Tak! Od fazy 2 (Q4 2026), Hubso będzie oferować self-hosted deployment przez Docker. Będziesz mieć pełną kontrolę nad danymi, infrastrukturą i możesz uruchomić platformę na dowolnym dostawcy chmury lub on-premise.",
        },
        {
          question: "Jak działa marketplace pluginów?",
          answer:
            "Deweloperzy mogą tworzyć i publikować pluginy używając naszego SDK i API. Pluginy są weryfikowane i umieszczane w marketplace. Przychody są dzielone 70/30 (deweloper/Hubso). Administratorzy społeczności mogą przeglądać, instalować i konfigurować pluginy jednym kliknięciem.",
        },
        {
          question: "Czy jest darmowy plan?",
          answer:
            "Tak! Darmowy plan obsługuje do 50 członków ze wszystkimi podstawowymi funkcjami społeczności. Bez wymaganej karty kredytowej. Upgrade do Pro (29$/mies.) lub Business (79$/mies.) gdy będziesz gotowy do skalowania.",
        },
        {
          question: "A co z migracją danych?",
          answer:
            "Zapewniamy narzędzia migracji i dedykowane wsparcie przy przenoszeniu z Circle.so, Skool, BuddyBoss, Discourse i innych platform. Plany Enterprise obejmują asystę migracji white-glove.",
        },
        {
          question: "Jaki stack technologiczny wykorzystuje Hubso?",
          answer:
            "Hubso jest zbudowane z Next.js 15 (App Router), NestJS, PostgreSQL 16, Redis 7, Meilisearch i Tailwind CSS + shadcn/ui. Aplikacje mobilne używają React Native + Expo. Wszystko zaprojektowane na sub-200ms TTFB i 99.9% uptime.",
        },
      ],
    },

    // CTA
    cta: {
      title: "Gotowy, by mieć własną społeczność?",
      subtitle: "Zacznij budować za darmo już dziś.",
      ctaPrimary: "Zacznij za darmo — bez karty",
      ctaSecondary: "Porozmawiaj ze sprzedażą",
      note: "Darmowe na zawsze dla max 50 członków. Upgrade w każdej chwili.",
    },

    // Footer
    footer: {
      tagline:
        "Modularna, natywna AI platforma społecznościowa. Posiadaj swoją publiczność, dane i przychody.",
      copyright: "Wszelkie prawa zastrzeżone.",
      privacyPolicy: "Polityka prywatności",
      termsOfService: "Regulamin",
      sections: [
        {
          title: "Produkt",
          links: ["Funkcje", "Cennik", "Marketplace pluginów", "Roadmapa", "Changelog"],
        },
        {
          title: "Firma",
          links: ["O nas", "Blog", "Kariera", "Kontakt"],
        },
        {
          title: "Zasoby",
          links: ["Dokumentacja", "API Reference", "Społeczność", "Status"],
        },
        {
          title: "Social",
          links: ["Twitter", "GitHub", "Discord", "LinkedIn"],
        },
      ],
    },

    // Locale switcher
    localeSwitcher: {
      label: "Język",
    },
  },
} as const;

export type TranslationTree = {
  header: {
    login: string;
    startFree: string;
    features: string;
    solutions: string;
    pricing: string;
    drawerLogin: string;
    drawerGetStarted: string;
  };
  headerMenu: {
    main: { title: string; description: string };
    items: readonly { title: string; description: string }[];
    solutions: readonly { title: string; description: string }[];
  };
  hero: {
    pill: string;
    pillCta: string;
    titleWords: readonly string[];
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    badgeModern: string;
    badgeFees: string;
    badgeAI: string;
  };
  logos: {
    heading: string;
    audiences: readonly string[];
  };
  problem: {
    title: string;
    subtitle: string;
    description: string;
    items: readonly { title: string; description: string }[];
  };
  solution: {
    title: string;
    subtitle: string;
    description: string;
    items: readonly { title: string; description: string }[];
  };
  features: {
    title: string;
    subtitle: string;
    items: readonly { title: string; content: string }[];
  };
  howItWorks: {
    title: string;
    subtitle: string;
    steps: readonly { title: string; content: string }[];
  };
  comparison: {
    title: string;
    subtitle: string;
    description: string;
    featureLabel: string;
    features: readonly string[];
  };
  testimonials: {
    title: string;
    subtitle: string;
  };
  pricing: {
    title: string;
    subtitle: string;
    monthly: string;
    yearly: string;
    popular: string;
    billedMonthly: string;
    billedAnnually: string;
    plans: readonly {
      name: string;
      features: readonly string[];
      description: string;
      buttonText: string;
    }[];
  };
  faq: {
    title: string;
    subtitle: string;
    stillHaveQuestions: string;
    items: readonly { question: string; answer: string }[];
  };
  cta: {
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    note: string;
  };
  footer: {
    tagline: string;
    copyright: string;
    privacyPolicy: string;
    termsOfService: string;
    sections: readonly {
      title: string;
      links: readonly string[];
    }[];
  };
  localeSwitcher: {
    label: string;
  };
};

export type Translations = TranslationTree;
