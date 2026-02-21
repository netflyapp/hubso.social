import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function CallToAction() {
  return (
    <section id="cta">
      <div className="px-5 py-14 lg:px-0">
        <Card className="mx-auto max-w-5xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="relative aspect-video md:aspect-auto md:h-full">
              <img
                alt="Promotional image"
                className="h-full w-full object-cover object-center"
                src="https://images.unsplash.com/photo-1583071299210-c6c113f4ac91?q=80&w=1970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              />
            </div>
            <CardContent className="flex flex-col justify-center gap-y-3.5 p-7 md:p-10">
              <blockquote className="text-balance text-lg font-semibold leading-snug lg:text-xl lg:leading-normal xl:text-2xl">
                "One of the best and{" "}
                <span className="bg-lime-400 px-2 text-primary dark:bg-lime-500">
                  unique react animated library
                </span>{" "}
                component I have seen and it boosed my productivity in no time."
              </blockquote>
              <div className="py-2.5">
                <p className="font-semibold">Jane Smith</p>
                <p className="text-sm text-muted-foreground">
                  CEO, Acme Corporation
                </p>
              </div>
              <Button className="w-full" variant="default">
                Buy now
              </Button>
            </CardContent>
          </div>
        </Card>
      </div>
    </section>
  );
}
