import React from "react";
import { CheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Plan {
  name: string;
  price?: string;
  description: string;
  features?: string[];
  buttonText: string;
  popular: boolean;
}

const plans: Plan[] = [
  {
    name: "Standard",
    price: "$29",
    description: "Perfect for small teams and startups.",
    features: ["Up to 5 users", "10GB storage", "Basic support"],
    buttonText: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$59",
    description: "Ideal for growing teams and businesses.",
    features: ["Unlimited users", "100GB storage", "Priority support"],
    buttonText: "Get Started",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "Tailored pricing for large teams and enterprises.",
    buttonText: "Contact Sales",
    popular: false,
  },
];

const PlanCard: React.FC<{ plan: Plan }> = ({ plan }) => (
  <Card className={`relative ${plan.popular ? "border-2 border-primary" : ""}`}>
    {plan.popular && (
      <div className="absolute right-0 top-0 rounded-bl-lg rounded-tr-lg bg-primary px-3 py-1 text-primary-foreground">
        Most Popular
      </div>
    )}
    <CardHeader>
      <CardTitle>{plan.name}</CardTitle>
      <CardDescription>{plan.description}</CardDescription>
    </CardHeader>
    <CardContent>
      {plan.price && (
        <div className="mb-6 flex items-baseline">
          <span className="text-4xl font-bold">{plan.price}</span>
          <span className="ml-2 text-sm text-muted-foreground">/month</span>
        </div>
      )}
      {plan.features && (
        <ul className="mb-8 space-y-2">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-center">
              <CheckIcon className="mr-2 h-5 w-5 text-primary" />
              <span className="font-medium">{feature}</span>
            </li>
          ))}
        </ul>
      )}
      <Button className="w-full">{plan.buttonText}</Button>
    </CardContent>
  </Card>
);

export function Pricing() {
  return (
    <section id="pricing">
      <div className="mx-auto space-y-4 py-6 text-center">
        <h2 className="font-mono text-[14px] font-medium tracking-tight text-primary">
          Pricing Plans
        </h2>
        <h4 className="mx-auto mb-2 max-w-3xl text-balance text-[42px] font-medium tracking-tighter">
          Choose the perfect plan for your needs
        </h4>
      </div>
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-y-5 py-12 md:py-20">
        <div className="w-full px-4 md:px-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {plans.slice(0, 2).map((plan, index) => (
              <PlanCard key={index} plan={plan} />
            ))}
          </div>
        </div>
        <div className="w-full px-4 md:px-6">
          <Card className="flex items-center justify-between overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <CardTitle className="mb-2 text-2xl">{plans[2].name}</CardTitle>
              <CardDescription className="mb-6">
                {plans[2].description}
              </CardDescription>
              <Button>{plans[2].buttonText}</Button>
            </CardContent>
            <div className="before:content-[''] relative isolate hidden h-[240px] w-full before:absolute before:left-32 before:top-0 before:z-[-1] before:h-full before:w-full before:skew-x-[-45deg] before:border-l before:border-muted before:bg-muted md:block lg:w-2/3">
              <div className="ml-12 flex h-full w-full flex-col items-center justify-center gap-y-0.5">
                <h1 className="text-4xl font-bold">50% off</h1>
                <p>for the first 100 customers</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
