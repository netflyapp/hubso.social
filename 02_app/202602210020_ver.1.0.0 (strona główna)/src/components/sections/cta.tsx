"use client";

import Section from "@/components/section";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/locale-context";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CtaSection() {
  const t = useT();
  return (
    <Section
      id="cta"
      title={t.cta.title}
      subtitle={t.cta.subtitle}
      className="bg-primary/10 rounded-xl py-16"
    >
      <div className="flex flex-col w-full sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
        <Link
          href="#"
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "w-full sm:w-auto text-background flex gap-2 text-base px-8"
          )}
        >
          {t.cta.ctaPrimary}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="#"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "w-full sm:w-auto flex gap-2 text-base px-8"
          )}
        >
          {t.cta.ctaSecondary}
        </Link>
      </div>
      <p className="text-center text-sm text-muted-foreground mt-4">
        {t.cta.note}
      </p>
    </Section>
  );
}
