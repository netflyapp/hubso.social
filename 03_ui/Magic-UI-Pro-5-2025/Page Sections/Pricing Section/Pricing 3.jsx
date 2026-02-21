"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
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
  },
  {
    name: "Enterprise",
    price: "$499",
    yearlyPrice: "$1228",
    description:
      "Get your roles filled faster with unlimited access to Dribbble's Job Board and Designer search.",
  },
  {
    name: "Pro",
    price: "$499",
    yearlyPrice: "$1228",
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
        <div className="flex items-center justify-center space-x-4">
          <span
            className={`font-bold ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}
          >
            Monthly
          </span>
          <Switch checked={isYearly} onCheckedChange={setIsYearly} />
          <span
            className={`font-bold ${isYearly ? "text-foreground" : "text-muted-foreground"}`}
          >
            Yearly
          </span>
        </div>
        <div className="mx-auto mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {pricingOptions.map((option, index) => (
            <Card
              key={index}
              className={`flex flex-col shadow-none ${option.features ? "md:col-span-2" : ""}`}
            >
              <CardContent className="flex flex-grow flex-col p-6 md:flex-row">
                <div
                  className={`flex flex-col ${option.features ? "md:w-1/2" : "w-full"}`}
                >
                  <CardTitle className="mb-2 text-2xl font-bold">
                    {option.name}
                  </CardTitle>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {option.description}
                  </p>
                  <div className="mb-4 mt-auto text-4xl font-bold">
                    {isYearly ? option.yearlyPrice : option.price}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      {isYearly ? "/year" : "/month"}
                    </span>
                  </div>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    Choose Plan
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                {option.features && (
                  <div className="mt-6 md:mt-0 md:w-1/2 md:pl-6">
                    {option.extraBenefits && (
                      <p className="mb-4 text-sm text-muted-foreground">
                        {option.extraBenefits}
                      </p>
                    )}
                    {option.features.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="mb-2 flex items-center"
                      >
                        <Check className="mr-2 h-5 w-5 text-primary" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
