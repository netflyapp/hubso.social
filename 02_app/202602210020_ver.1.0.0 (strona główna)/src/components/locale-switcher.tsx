"use client";

import { useLocale } from "@/lib/i18n/locale-context";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/translations";

export function LocaleSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();

  const toggle = () => {
    setLocale(locale === "en" ? "pl" : "en");
  };

  return (
    <button
      onClick={toggle}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted",
        className
      )}
      aria-label={locale === "en" ? "Switch to Polish" : "Przełącz na angielski"}
      title={locale === "en" ? "Zmień na polski" : "Switch to English"}
    >
      <span className={cn("transition-opacity", locale === "en" ? "opacity-100" : "opacity-50")}>
        EN
      </span>
      <span className="text-muted-foreground">/</span>
      <span className={cn("transition-opacity", locale === "pl" ? "opacity-100" : "opacity-50")}>
        PL
      </span>
    </button>
  );
}
