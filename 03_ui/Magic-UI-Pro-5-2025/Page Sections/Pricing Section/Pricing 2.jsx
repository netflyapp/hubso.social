"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";

const pricingOptions = [
  {
    name: "Free",
    price: "$0",
    yearlyPrice: "$0",
    description:
      "Let top creative talent come to you by posting your job listing on #1 Design Jobs Board.",
    features: [
      "Access to All Features",
      "20% discount on backorders",
      "Domain name Appraisal",
      "10 Social Profiles",
    ],
  },
  {
    name: "Pro",
    price: "$499",
    yearlyPrice: "$1,228",
    description:
      "Get your roles filled faster with unlimited access to Dribbble's Job Board and Designer search.",
    features: [
      "Access to All Features",
      "20% discount on backorders",
      "Domain name Appraisal",
      "10 Social Profiles",
    ],
    extraBenefits: "Everything in free plan, plus",
  },
];

export function Component() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing">
      <div className="container mx-auto max-w-5xl py-10">
        <div className="mx-auto space-y-4 py-6 text-center">
          <h2 className="font-mono text-[14px] font-medium tracking-tight text-primary">
            Pricing
          </h2>
          <h4 className="mx-auto mb-2 max-w-3xl text-balance text-[42px] font-medium tracking-tighter">
            Simple pricing for everyone.
          </h4>
        </div>
        <p className="mt-6 text-center text-xl leading-8 text-muted-foreground">
          Choose an <strong>affordable plan</strong> that&apos;s packed with the
          best features for engaging your audience, creating customer loyalty,
          and driving sales.
        </p>
        <div className="mt-5 flex items-center justify-center space-x-2">
          <span
            className={`font-bold ${!isYearly ? "" : "text-muted-foreground"}`}
          >
            Monthly
          </span>
          <Switch checked={isYearly} onCheckedChange={setIsYearly} />
          <span
            className={`font-bold ${isYearly ? "" : "text-muted-foreground"}`}
          >
            Yearly
          </span>
        </div>
        <div className="mx-auto grid gap-6 px-10 py-8 lg:grid-cols-2">
          {pricingOptions.map((option, index) => (
            <Card key={index} className="flex flex-col shadow-none">
              <CardHeader>
                <CardTitle>{option.name}</CardTitle>
                <p className="text-muted-foreground">{option.description}</p>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-3xl font-bold">
                  {isYearly ? option.yearlyPrice : option.price}
                  <span className="text-sm font-medium text-muted-foreground">
                    {isYearly ? "/year" : "/month"}
                  </span>
                </div>
                {option.extraBenefits && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    {option.extraBenefits}
                  </p>
                )}
                <ul className="mt-4 space-y-2">
                  {option.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  Choose Plan
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
