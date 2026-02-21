"use client";

import Marquee from "@/components/magicui/marquee";
import Section from "@/components/section";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/locale-context";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Image from "next/image";

export const Highlight = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <span
      className={cn(
        "bg-primary/20 p-1 py-0.5 font-bold text-primary dark:bg-primary/20 dark:text-primary",
        className
      )}
    >
      {children}
    </span>
  );
};

export interface TestimonialCardProps {
  name: string;
  role: string;
  img?: string;
  description: React.ReactNode;
  className?: string;
  [key: string]: any;
}

export const TestimonialCard = ({
  description,
  name,
  img,
  role,
  className,
  ...props // Capture the rest of the props
}: TestimonialCardProps) => (
  <div
    className={cn(
      "mb-4 flex w-full cursor-pointer break-inside-avoid flex-col items-center justify-between gap-6 rounded-xl p-4",
      // light styles
      " border border-neutral-200 bg-white",
      // dark styles
      "dark:bg-black dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
      className
    )}
    {...props} // Spread the rest of the props here
  >
    <div className="select-none text-sm font-normal text-neutral-700 dark:text-neutral-400">
      {description}
      <div className="flex flex-row py-1">
        <Star className="size-4 text-yellow-500 fill-yellow-500" />
        <Star className="size-4 text-yellow-500 fill-yellow-500" />
        <Star className="size-4 text-yellow-500 fill-yellow-500" />
        <Star className="size-4 text-yellow-500 fill-yellow-500" />
        <Star className="size-4 text-yellow-500 fill-yellow-500" />
      </div>
    </div>

    <div className="flex w-full select-none items-center justify-start gap-5">
      <Image
        width={40}
        height={40}
        src={img || ""}
        alt={name}
        className="h-10 w-10 rounded-full ring-1 ring-border ring-offset-4"
      />

      <div>
        <p className="font-medium text-neutral-500">{name}</p>
        <p className="text-xs font-normal text-neutral-400">{role}</p>
      </div>
    </div>
  </div>
);

const testimonials = [
  {
    name: "Anna Kowalska",
    role: "Online Educator & Course Creator",
    img: "https://randomuser.me/api/portraits/women/44.jpg",
    description: (
      <p>
        Switching from Circle to Hubso saved me over $400/month in transaction
        fees alone.
        <Highlight>
          Zero fees means my revenue is actually mine.
        </Highlight>{" "}
        The LMS is miles ahead of what I had before.
      </p>
    ),
  },
  {
    name: "Marek Nowak",
    role: "Fitness Coach & Community Leader",
    img: "https://randomuser.me/api/portraits/men/12.jpg",
    description: (
      <p>
        I needed a platform that felt like mine — my brand, my domain.
        <Highlight>Hubso&apos;s white-label is the real deal.</Highlight>{" "}
        My members think I built a custom app.
      </p>
    ),
  },
  {
    name: "Sarah Mitchell",
    role: "Founder at DevCommunity",
    img: "https://randomuser.me/api/portraits/women/12.jpg",
    description: (
      <p>
        The plugin marketplace is brilliant. I added gamification, polls and
        a custom leaderboard in one afternoon.
        <Highlight>No developer needed.</Highlight> Hubso grows with us.
      </p>
    ),
  },
  {
    name: "Dr. Tomasz Wiśniewski",
    role: "Health Professional & Author",
    img: "https://randomuser.me/api/portraits/men/45.jpg",
    description: (
      <p>
        After years on WordPress with 15 plugins,
        <Highlight>Hubso replaced everything in one platform.</Highlight>{" "}
        Courses, community, events — all with better performance.
      </p>
    ),
  },
  {
    name: "Emma Rodriguez",
    role: "Creative Director at ArtSpace",
    img: "https://randomuser.me/api/portraits/women/83.jpg",
    description: (
      <p>
        The AI moderation saves me hours every week.
        <Highlight>Smart recommendations keep my members engaged.</Highlight>{" "}
        It&apos;s like having an extra team member.
      </p>
    ),
  },
  {
    name: "James Chen",
    role: "CEO at TechMasters Academy",
    img: "https://randomuser.me/api/portraits/men/1.jpg",
    description: (
      <p>
        Self-hosting means we own our data and infrastructure.
        <Highlight>
          No more worrying about platform policy changes.
        </Highlight>{" "}
        True independence for our 5K+ members.
      </p>
    ),
  },
  {
    name: "Katarzyna Zielińska",
    role: "Life Coach & Podcaster",
    img: "https://randomuser.me/api/portraits/women/5.jpg",
    description: (
      <p>
        Setting up took 10 minutes. Importing my Skool members took 2 clicks.
        <Highlight>
          The migration was painless.
        </Highlight>{" "}
        Now I have a platform that actually looks professional.
      </p>
    ),
  },
  {
    name: "David Park",
    role: "Head of Community at SaaS Corp",
    img: "https://randomuser.me/api/portraits/men/14.jpg",
    description: (
      <p>
        We evaluated Circle, Skool, Mighty Networks and BuddyBoss.
        <Highlight>
          Hubso won on every metric that mattered to us.
        </Highlight>{" "}
        Modern stack, fair pricing, real ownership.
      </p>
    ),
  },
  {
    name: "Olivia Thompson",
    role: "Membership Site Owner",
    img: "https://randomuser.me/api/portraits/women/56.jpg",
    description: (
      <p>
        Real-time messaging changed how my community interacts.
        <Highlight>
          It feels like Slack and Circle had a baby — but better.
        </Highlight>{" "}
        Members are more active than ever.
      </p>
    ),
  },
  {
    name: "Piotr Adamski",
    role: "B2B Community Manager",
    img: "https://randomuser.me/api/portraits/men/18.jpg",
    description: (
      <p>
        The events system with built-in Zoom integration is a game-changer.
        <Highlight>
          We run 4 webinars a week seamlessly.
        </Highlight>{" "}
        RSVPs, reminders, recordings — all automated.
      </p>
    ),
  },
  {
    name: "Lisa Wang",
    role: "E-learning Consultant",
    img: "https://randomuser.me/api/portraits/women/73.jpg",
    description: (
      <p>
        The drip content and quiz builder rival dedicated LMS platforms.
        <Highlight>
          Certificates look stunning and professional.
        </Highlight>{" "}
        My students love the learning experience.
      </p>
    ),
  },
  {
    name: "Michael Brown",
    role: "Nonprofit Director",
    img: "https://randomuser.me/api/portraits/men/25.jpg",
    description: (
      <p>
        As a nonprofit, every dollar matters. Zero transaction fees and
        the free tier for 50 members made Hubso a no-brainer.
        <Highlight>Finally, a platform that respects our budget.</Highlight>
      </p>
    ),
  },
];

export default function Testimonials() {
  const t = useT();
  return (
    <Section
      title={t.testimonials.title}
      subtitle={t.testimonials.subtitle}
      className="max-w-8xl"
    >
      <div className="relative mt-6 max-h-screen overflow-hidden">
        <div className="gap-4 md:columns-2 xl:columns-3 2xl:columns-4">
          {Array(Math.ceil(testimonials.length / 3))
            .fill(0)
            .map((_, i) => (
              <Marquee
                vertical
                key={i}
                className={cn({
                  "[--duration:60s]": i === 1,
                  "[--duration:30s]": i === 2,
                  "[--duration:70s]": i === 3,
                })}
              >
                {testimonials.slice(i * 3, (i + 1) * 3).map((card, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: Math.random() * 0.8,
                      duration: 1.2,
                    }}
                  >
                    <TestimonialCard {...card} />
                  </motion.div>
                ))}
              </Marquee>
            ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 w-full bg-gradient-to-t from-background from-20%"></div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 w-full bg-gradient-to-b from-background from-20%"></div>
      </div>
    </Section>
  );
}
