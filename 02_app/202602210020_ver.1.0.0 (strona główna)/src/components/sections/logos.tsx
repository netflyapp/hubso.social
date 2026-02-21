"use client";

import { motion } from "framer-motion";
import { useT } from "@/lib/i18n/locale-context";
import {
  GraduationCap,
  Stethoscope,
  Dumbbell,
  Briefcase,
  Code,
  Palette,
  Church,
  Users,
} from "lucide-react";

const icons = [GraduationCap, Stethoscope, Dumbbell, Briefcase, Code, Palette, Church, Users];

export default function Logos() {
  const t = useT();
  return (
    <section id="logos">
      <div className="container mx-auto px-4 md:px-8 py-12">
        <h3 className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {t.logos.heading}
        </h3>
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6">
          {t.logos.audiences.map((label, idx) => {
            const Icon = icons[idx];
            return (
              <motion.div
                key={idx}
                className="flex flex-col items-center gap-2 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                viewport={{ once: true }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
