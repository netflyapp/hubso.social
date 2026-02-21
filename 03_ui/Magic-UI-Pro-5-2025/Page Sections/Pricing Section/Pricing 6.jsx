import React from "react";

type Feature = {
  text: string;
  available: boolean;
};

type Plan = {
  name: string;
  price: string;
  features: Feature[];
  buttonText: string;
};

const plans: Plan[] = [
  {
    name: "Basic",
    price: "$9 / month",
    features: [
      { text: "Integrations", available: true },
      { text: "Shared links", available: true },
      { text: "Importing and exporting", available: false },
      { text: "Team members", available: false },
    ],
    buttonText: "Buy plan",
  },
  {
    name: "Premium",
    price: "$59 / month",
    features: [
      { text: "Integrations", available: true },
      { text: "Shared links", available: true },
      { text: "Importing and exporting", available: true },
      { text: "Team members", available: true },
    ],
    buttonText: "Buy plan",
  },
];

const CheckIcon = React.memo((props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
));

const XIcon = React.memo((props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
));

const FeatureList = React.memo(({ features }: { features: Feature[] }) => (
  <div className="mt-2">
    <h4 className="font-semibold">Features</h4>
    <ul className="mt-2 space-y-2">
      {features.map((feature, i) => (
        <li key={i} className="flex items-center">
          {feature.available ? (
            <CheckIcon className="mr-2 text-green-500" />
          ) : (
            <XIcon className="mr-2 text-neutral-700/30 dark:text-neutral-300/30" />
          )}
          <span
            className={
              feature.available
                ? "font-medium text-neutral-900 dark:text-white"
                : "font-medium text-neutral-700/30 dark:text-neutral-300/30"
            }
          >
            {feature.text}
          </span>
        </li>
      ))}
    </ul>
  </div>
));

const PlanCard = React.memo(({ plan }: { plan: Plan }) => (
  <div className="flex flex-col gap-y-5 rounded-lg border p-5">
    <div className="flex flex-col gap-y-1">
      <h3 className="text-lg font-semibold">{plan.name}</h3>
      <p className="text-2xl font-bold">{plan.price}</p>
    </div>
    <button className="inline-flex h-11 w-full items-center justify-center whitespace-nowrap rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
      {plan.buttonText}
    </button>
    <FeatureList features={plan.features} />
  </div>
));

export function Pricing() {
  return (
    <section id="pricing">
      <div className="mx-auto max-w-4xl px-5 py-10">
        <div className="text-center">
          <h4 className="text-xl font-bold tracking-tight text-black dark:text-white">
            Pricing
          </h4>
          <h2 className="text-5xl font-bold tracking-tight text-black dark:text-white sm:text-6xl">
            Simple pricing for everyone.
          </h2>
          <p className="mt-6 text-balance text-xl leading-8 text-black/80 dark:text-white">
            Choose an <strong>affordable plan</strong> that&apos;s packed with
            the best features for engaging your audience, creating customer
            loyalty, and driving sales.
          </p>
        </div>
        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          {plans.map((plan, index) => (
            <PlanCard key={index} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}
