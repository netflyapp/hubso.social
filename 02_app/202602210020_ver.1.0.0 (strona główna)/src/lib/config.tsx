import { Icons } from "@/components/icons";
import { FaTwitter } from "react-icons/fa";
import { FaYoutube, FaGithub, FaDiscord, FaLinkedin } from "react-icons/fa6";

export const BLUR_FADE_DELAY = 0.15;

export const siteConfig = {
  name: "Hubso",
  description: "Your Community. Your Rules.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://hubso.social",
  keywords: [
    "community platform",
    "white-label",
    "SaaS",
    "self-hosted",
    "plugin marketplace",
    "AI community",
    "online courses",
    "membership",
    "community building",
    "Next.js",
  ],
  links: {
    email: "hello@hubso.social",
    twitter: "https://twitter.com/hubso_social",
    discord: "https://discord.gg/hubso",
    github: "https://github.com/hubso-social",
    linkedin: "https://linkedin.com/company/hubso-social",
  },
  header: [
    {
      trigger: "Features",
      content: {
        main: {
          icon: <Icons.logo className="h-6 w-6" />,
          title: "All-in-One Platform",
          description:
            "Community, courses, events, messaging, AI and plugin marketplace — everything under your brand.",
          href: "#features",
        },
        items: [
          {
            href: "#features",
            title: "Community Spaces",
            description:
              "Discussion forums, activity feeds, and rich media posts.",
          },
          {
            href: "#features",
            title: "Courses & LMS",
            description:
              "Create and sell online courses with quizzes and certificates.",
          },
          {
            href: "#features",
            title: "AI & Automation",
            description:
              "AI moderation, member matching, smart summaries, and auto-translation.",
          },
          {
            href: "#features",
            title: "Plugin Marketplace",
            description:
              "Extend with plugins — or build and sell your own (70/30 revenue share).",
          },
        ],
      },
    },
    {
      trigger: "Solutions",
      content: {
        items: [
          {
            title: "For Educators & Coaches",
            href: "#",
            description:
              "Build course communities with integrated LMS and payment.",
          },
          {
            title: "For Influencers",
            href: "#",
            description:
              "Monetize your audience with memberships and exclusive content.",
          },
          {
            title: "For SaaS Companies",
            href: "#",
            description:
              "Customer communities that drive retention and reduce churn.",
          },
          {
            title: "For Healthcare Experts",
            href: "#",
            description:
              "HIPAA-ready communities for doctors, dietitians, and coaches.",
          },
          {
            title: "For Developers",
            href: "#",
            description:
              "Build plugins, earn revenue, and extend Hubso with full API access.",
          },
          {
            title: "For Organizations & NGOs",
            href: "#",
            description:
              "Manage members, events, and communications in one place.",
          },
        ],
      },
    },
    {
      href: "#pricing",
      label: "Pricing",
    },
  ],
  pricing: [
    {
      name: "FREE",
      href: "#",
      price: "$0",
      period: "month",
      yearlyPrice: "$0",
      features: [
        "Up to 50 members",
        "Core community features",
        "Hubso subdomain",
        "Basic analytics",
        "Community support",
      ],
      description: "Perfect for getting started and testing the waters",
      buttonText: "Start free",
      isPopular: false,
    },
    {
      name: "PRO",
      href: "#",
      price: "$29",
      period: "month",
      yearlyPrice: "$24",
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
      isPopular: false,
    },
    {
      name: "BUSINESS",
      href: "#",
      price: "$79",
      period: "month",
      yearlyPrice: "$66",
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
      isPopular: true,
    },
    {
      name: "ENTERPRISE",
      href: "#",
      price: "Custom",
      period: "",
      yearlyPrice: "Custom",
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
      isPopular: false,
    },
  ],
  faqs: [
    {
      question: "What is Hubso?",
      answer: (
        <span>
          Hubso is a modular, AI-native community platform built on a modern
          stack (Next.js + NestJS). It combines community spaces, courses,
          events, messaging, and a plugin marketplace — all under your own
          brand with zero transaction fees.
        </span>
      ),
    },
    {
      question: "How does Hubso compare to Circle.so or Skool?",
      answer: (
        <span>
          Unlike Circle.so and Skool, Hubso offers a plugin marketplace (like
          WordPress but modern), native AI features, zero transaction fees
          (only standard Stripe ~2.9%), full white-label, and the option to
          self-host on your own infrastructure. No other platform combines all
          of these.
        </span>
      ),
    },
    {
      question: "What AI features are included?",
      answer: (
        <span>
          Hubso includes AI-powered moderation, intelligent member matching,
          post summaries, semantic search, auto-translation, writing assistant,
          and community analytics. All powered through OpenRouter, giving you
          access to GPT-4o, Claude, Gemini, and more.
        </span>
      ),
    },
    {
      question: "Can I self-host Hubso?",
      answer: (
        <span>
          Yes! Starting from Phase 2 (Q4 2026), Hubso will offer self-hosted
          deployment via Docker. You&apos;ll have full control over your data,
          infrastructure, and can run it on any cloud provider or on-premise.
        </span>
      ),
    },
    {
      question: "How does the plugin marketplace work?",
      answer: (
        <span>
          Developers can build and publish plugins using our SDK and API.
          Plugins are reviewed and listed on the marketplace. Revenue is split
          70/30 (developer/Hubso). Community admins can browse, install, and
          configure plugins with one click.
        </span>
      ),
    },
    {
      question: "Is there a free plan?",
      answer: (
        <span>
          Yes! The Free plan supports up to 50 members with all core community
          features. No credit card required. Upgrade to Pro ($29/mo) or
          Business ($79/mo) when you&apos;re ready to scale.
        </span>
      ),
    },
    {
      question: "What about data migration?",
      answer: (
        <span>
          We provide migration tools and dedicated support for moving from
          Circle.so, Skool, BuddyBoss, Discourse, and other platforms.
          Enterprise plans include white-glove migration assistance.
        </span>
      ),
    },
    {
      question: "What tech stack does Hubso use?",
      answer: (
        <span>
          Hubso is built with Next.js 15 (App Router), NestJS, PostgreSQL 16,
          Redis 7, Meilisearch, and Tailwind CSS + shadcn/ui. Mobile apps use
          React Native + Expo. Everything is designed for sub-200ms TTFB and
          99.9% uptime.
        </span>
      ),
    },
  ],
  footer: [
    {
      title: "Product",
      links: [
        { href: "#features", text: "Features", icon: null },
        { href: "#pricing", text: "Pricing", icon: null },
        { href: "#", text: "Plugin Marketplace", icon: null },
        { href: "#", text: "Roadmap", icon: null },
        { href: "#", text: "Changelog", icon: null },
      ],
    },
    {
      title: "Company",
      links: [
        { href: "#", text: "About", icon: null },
        { href: "#", text: "Blog", icon: null },
        { href: "#", text: "Careers", icon: null },
        { href: "#", text: "Contact", icon: null },
      ],
    },
    {
      title: "Resources",
      links: [
        { href: "#", text: "Documentation", icon: null },
        { href: "#", text: "API Reference", icon: null },
        { href: "#", text: "Community", icon: null },
        { href: "#", text: "Status", icon: null },
      ],
    },
    {
      title: "Connect",
      links: [
        {
          href: "https://twitter.com/hubso_social",
          text: "Twitter",
          icon: <FaTwitter />,
        },
        {
          href: "https://github.com/hubso-social",
          text: "GitHub",
          icon: <FaGithub />,
        },
        {
          href: "https://discord.gg/hubso",
          text: "Discord",
          icon: <FaDiscord />,
        },
        {
          href: "https://linkedin.com/company/hubso-social",
          text: "LinkedIn",
          icon: <FaLinkedin />,
        },
      ],
    },
  ],
};

export type SiteConfig = typeof siteConfig;
