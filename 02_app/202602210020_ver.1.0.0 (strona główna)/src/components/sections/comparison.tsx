"use client";

import Section from "@/components/section";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/locale-context";
import { motion } from "framer-motion";
import { Check, X, Minus } from "lucide-react";

type CellValue = boolean | "partial" | string;

interface ComparisonRow {
  hubso: CellValue;
  circle: CellValue;
  skool: CellValue;
  buddyboss: CellValue;
}

const comparisonValues: ComparisonRow[] = [
  { hubso: true, circle: false, skool: false, buddyboss: true },
  { hubso: true, circle: "partial", skool: false, buddyboss: true },
  { hubso: true, circle: false, skool: false, buddyboss: true },
  { hubso: true, circle: false, skool: false, buddyboss: "partial" },
  { hubso: true, circle: "partial", skool: false, buddyboss: false },
  { hubso: true, circle: true, skool: true, buddyboss: true },
  { hubso: true, circle: false, skool: false, buddyboss: false },
  { hubso: true, circle: true, skool: true, buddyboss: "partial" },
];

const competitors = [
  { name: "Hubso", highlight: true },
  { name: "Circle.so", highlight: false },
  { name: "Skool", highlight: false },
  { name: "BuddyBoss", highlight: false },
];

function CellIcon({ value }: { value: CellValue }) {
  if (value === true)
    return <Check className="h-5 w-5 text-primary mx-auto" />;
  if (value === false)
    return <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />;
  if (value === "partial")
    return <Minus className="h-5 w-5 text-yellow-500 mx-auto" />;
  return <span className="text-sm text-muted-foreground">{value}</span>;
}

export default function Comparison() {
  const t = useT();
  return (
    <Section
      title={t.comparison.title}
      subtitle={t.comparison.subtitle}
      description={t.comparison.description}
    >
      <motion.div
        className="mt-12 overflow-x-auto"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="py-4 px-4 text-sm font-medium text-muted-foreground w-1/3">
                {t.comparison.featureLabel}
              </th>
              {competitors.map((c) => (
                <th
                  key={c.name}
                  className={cn(
                    "py-4 px-4 text-center text-sm font-semibold",
                    c.highlight && "text-primary"
                  )}
                >
                  {c.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {t.comparison.features.map((featureName, idx) => {
              const row = comparisonValues[idx];
              return (
                <tr
                  key={idx}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <td className="py-3.5 px-4 text-sm font-medium text-foreground">
                    {featureName}
                  </td>
                  <td className={cn("py-3.5 px-4 text-center", "bg-primary/5")}>
                    <CellIcon value={row.hubso} />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <CellIcon value={row.circle} />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <CellIcon value={row.skool} />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <CellIcon value={row.buddyboss} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </motion.div>
    </Section>
  );
}
