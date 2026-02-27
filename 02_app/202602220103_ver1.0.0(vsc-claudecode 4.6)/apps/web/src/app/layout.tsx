import type { Metadata, Viewport } from "next"
import { Providers } from "@/components/providers"
import "./globals.css"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://hubso.social"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#6366f1" },
    { media: "(prefers-color-scheme: dark)", color: "#4f46e5" },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Hubso.social — Platforma Społecznościowa",
    template: "%s | Hubso.social",
  },
  description:
    "Modularna platforma społecznościowa white-label. Buduj angażujące społeczności, kursy i wydarzenia.",
  keywords: ["społeczność", "community", "platforma", "kursy", "wydarzenia", "hubso"],
  creator: "Hubso Team",
  authors: [{ name: "Hubso Team", url: APP_URL }],
  manifest: "/manifest.webmanifest",
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: APP_URL,
    siteName: "Hubso.social",
    title: "Hubso.social — Platforma Społecznościowa",
    description:
      "Modularna platforma społecznościowa white-label. Buduj angażujące społeczności, kursy i wydarzenia.",
    images: [
      {
        url: `${APP_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Hubso.social — Platforma Społecznościowa",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hubso.social — Platforma Społecznościowa",
    description:
      "Modularna platforma społecznościowa white-label. Buduj angażujące społeczności, kursy i wydarzenia.",
    images: [`${APP_URL}/og-image.png`],
    creator: "@hubsosocial",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Hubso",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <head />
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
