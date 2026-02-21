"use client";

import Features from "@/components/features-horizontal";
import Section from "@/components/section";
import { useT } from "@/lib/i18n/locale-context";
import { Users, MessageSquare, GraduationCap, CalendarDays, Blocks, Bot } from "lucide-react";

const icons = [
  <Users key="u" className="h-6 w-6 text-primary" />,
  <MessageSquare key="m" className="h-6 w-6 text-primary" />,
  <GraduationCap key="g" className="h-6 w-6 text-primary" />,
  <CalendarDays key="c" className="h-6 w-6 text-primary" />,
  <Blocks key="b" className="h-6 w-6 text-primary" />,
  <Bot key="bt" className="h-6 w-6 text-primary" />,
];

export default function Component() {
  const t = useT();
  const data = t.features.items.map((item, idx) => ({
    id: idx + 1,
    title: item.title,
    content: item.content,
    image: "/dashboard.png",
    icon: icons[idx],
  }));

  return (
    <Section title={t.features.title} subtitle={t.features.subtitle}>
      <Features collapseDelay={5000} linePosition="bottom" data={data} />
    </Section>
  );
}
