"use client";

import BlurFade from "@/components/magicui/blur-fade";
import Section from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/lib/i18n/locale-context";
import { MonitorSmartphone, CircleDollarSign, DatabaseZap } from "lucide-react";

const icons = [MonitorSmartphone, CircleDollarSign, DatabaseZap];

export default function Component() {
  const t = useT();
  return (
    <Section
      title={t.problem.title}
      subtitle={t.problem.subtitle}
      description={t.problem.description}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        {t.problem.items.map((problem, index) => {
          const Icon = icons[index];
          return (
            <BlurFade key={index} delay={0.2 + index * 0.2} inView>
              <Card className="bg-background border-none shadow-none">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{problem.title}</h3>
                  <p className="text-muted-foreground">{problem.description}</p>
                </CardContent>
              </Card>
            </BlurFade>
          );
        })}
      </div>
    </Section>
  );
}
