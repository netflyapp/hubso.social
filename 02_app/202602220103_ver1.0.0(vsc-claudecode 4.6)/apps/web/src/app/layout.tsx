import type { Metadata } from "next"
import { Providers } from "@/components/providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "Hubso.social - Community Platform",
  description: "Modular, white-label community platform for connecting like-minded people",
  keywords: ["community", "platform", "social", "engagement"],
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  creator: "Hubso Team",
  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
