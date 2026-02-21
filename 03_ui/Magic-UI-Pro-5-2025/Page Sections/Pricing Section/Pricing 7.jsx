import { Button } from "@/components/ui/button";

const pricingPlans = [
  {
    name: "Freelancer",
    price: 24,
    description: "The essentials to provide your best work for clients.",
    features: [
      "5 products",
      "Up to 1,000 subscribers",
      "Basic analytics",
      "48-hour support response time",
    ],
  },
  {
    name: "Startup",
    price: 32,
    description: "A plan that scales with your rapidly growing business.",
    features: [
      "25 products",
      "Up to 10,000 subscribers",
      "Advanced analytics",
      "24-hour support response time",
      "Marketing automations",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: 48,
    description: "Dedicated support and infrastructure for your company.",
    features: [
      "Unlimited products",
      "Unlimited subscribers",
      "Advanced analytics",
      "1-hour, dedicated support response time",
    ],
  },
];

export function Component() {
  return (
    <section id="pricing">
      <div className="mx-auto flex max-w-screen-xl flex-col gap-8 px-4 py-14 md:px-8">
        <div className="mx-auto space-y-4 py-6 text-center">
          <h2 className="font-mono text-[14px] font-medium tracking-tight text-primary">
            Pricing
          </h2>
          <h4 className="mx-auto mb-2 max-w-3xl text-balance text-[42px] font-medium tracking-tighter">
            Choose the right plan for your business
          </h4>
        </div>

        <div className="grid gap-8 px-4 md:grid-cols-3 md:px-6">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`flex flex-col justify-between rounded-lg border p-6 ${
                plan.popular ? "border-primary" : "border-gray-200"
              } ${
                index === 1
                  ? "md:origin-bottom md:scale-y-105 md:transform"
                  : ""
              }`}
            >
              <div>
                {plan.popular && (
                  <div className="mb-4 inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Most popular
                  </div>
                )}
                <h3 className="mb-2 text-2xl font-semibold">{plan.name}</h3>
                <p className="mb-4 text-gray-600">{plan.description}</p>
                <div className="mb-6 text-4xl font-bold">
                  ${plan.price}
                  <span className="text-xl font-normal text-gray-600">
                    /month
                  </span>
                </div>
                <ul className="mb-6 space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <svg
                        className="mr-2 h-5 w-5 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                className="mt-auto w-full"
                variant={plan.popular ? "default" : "outline"}
              >
                Buy plan
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
