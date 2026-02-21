"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useSpring, useTransform } from "motion/react";

import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { value: 3400, label: "Downloads" },
  { value: 1500, label: "Users" },
  { value: 84, label: "Subscribers" },
  { value: 7, label: "Products" },
];

export function Component() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="stats" ref={ref}>
      <div className="container px-4 md:px-6 py-12 md:py-24">
        <div className="text-center space-y-4 py-6 mx-auto">
          <h2 className="text-[14px] text-primary font-mono font-medium tracking-tight">
            STATS
          </h2>
          <h4 className="text-[42px] font-medium mb-2 text-balance max-w-3xl mx-auto tracking-tighter">
            Our numbers speak for themselves
          </h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {stats.map((stat, index) => (
            <AnimatedCard
              key={index}
              value={stat.value}
              label={stat.label}
              isInView={isInView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
interface AnimatedCardProps {
  value: number;
  label: string;
  isInView: boolean;
}

function AnimatedCard({ value, label, isInView }: AnimatedCardProps) {
  const spring = useSpring(0, { duration: 2000 });
  const displayValue = useTransform(spring, (current) =>
    Math.floor(current).toLocaleString(),
  );

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, spring, value]);

  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-4 text-center">
        <motion.div
          className="text-4xl md:text-5xl font-bold mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <motion.span>{displayValue}</motion.span>
          {value > 1000 && "+"}
        </motion.div>
        <div className="text-sm md:text-base text-muted-foreground">
          {label}
        </div>
      </CardContent>
    </Card>
  );
}
