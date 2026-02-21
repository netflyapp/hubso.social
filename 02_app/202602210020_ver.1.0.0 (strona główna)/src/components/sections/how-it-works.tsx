"use client";

import Features from "@/components/features-vertical";
import Section from "@/components/section";
import { useT } from "@/lib/i18n/locale-context";
import { Palette, Puzzle, Rocket } from "lucide-react";

const icons = [
  <Rocket key="r" className="w-6 h-6 text-primary" />,
  <Palette key="p" className="w-6 h-6 text-primary" />,
  <Puzzle key="z" className="w-6 h-6 text-primary" />,
];

export default function Component() {
  const t = useT();
  const data = t.howItWorks.steps.map((step, idx) => ({
    id: idx + 1,
    title: step.title,
    content: step.content,
    image: "/dashboard.png",
    icon: icons[idx],
  }));

  return (
    <Section title={t.howItWorks.title} subtitle={t.howItWorks.subtitle}>
      <Features data={data} />
    </Section>
  );
}
