"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import React from "react";

const pricingPlans = [
  {
    title: "Starter",
    description: "Perfect for individuals and small teams.",
    price: "$9",
    features: [
      "Up to 5 users",
      "10 GB storage",
      "Basic analytics",
      "Email support",
    ],
    popular: false,
  },
  {
    title: "Pro",
    description: "Ideal for growing teams and businesses.",
    price: "$29",
    features: [
      "Up to 25 users",
      "100 GB storage",
      "Advanced analytics",
      "Priority email support",
      "Custom branding",
    ],
    popular: true,
  },
  {
    title: "Enterprise",
    description: "Tailored for large teams and organizations.",
    price: "$99",
    features: [
      "Unlimited users",
      "1 TB storage",
      "Enterprise-grade analytics",
      "Dedicated account manager",
      "Custom integrations",
    ],
    popular: false,
  },
];

const PlanCard: React.FC<{ plan: (typeof pricingPlans)[number] }> = ({
  plan,
}) => (
  <Card
    className={`flex flex-col ${plan.popular ? "border-2 border-primary" : ""}`}
  >
    <CardHeader>
      <CardTitle>{plan.title}</CardTitle>
      <CardDescription>{plan.description}</CardDescription>
    </CardHeader>
    <CardContent className="flex-grow">
      <div className="mb-4 flex items-baseline gap-2">
        <span className="text-5xl font-bold">{plan.price}</span>
        <span className="text-sm text-muted-foreground">/month</span>
      </div>
      {plan.popular && <Badge className="mb-4">Most Popular</Badge>}
      <ul className="space-y-3">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
    </CardContent>
    <CardFooter className="mt-auto">
      <Button className="w-full">Get Started</Button>
    </CardFooter>
  </Card>
);

export function Component() {
  return (
    <section id="pricing">
      <div className="container mx-auto max-w-5xl py-10">
        <div className="mx-auto space-y-4 py-6 text-center">
          <h2 className="font-mono text-[14px] font-medium tracking-tight text-primary">
            Pricing
          </h2>
          <h4 className="mx-auto mb-2 max-w-3xl text-balance text-[42px] font-medium tracking-tighter">
            Choose the perfect plan for your needs
          </h4>
        </div>
        <div className="container grid justify-center gap-6 px-4 md:px-6 lg:grid-cols-3 lg:gap-8">
          {pricingPlans.map((plan, index) => (
            <PlanCard key={index} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}
