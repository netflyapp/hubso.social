"use client";

import { siteConfig } from "@/lib/config";
import { useT } from "@/lib/i18n/locale-context";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const t = useT();
  return (
    <footer>
      <div className="max-w-6xl mx-auto py-16 sm:px-10 px-5 pb-0">
        <a
          href="/"
          title={siteConfig.name}
          className="relative mr-6 flex items-center space-x-2"
        >
          <span className="font-bold text-xl">
            hubso<span className="text-primary">.social</span>
          </span>
        </a>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          {t.footer.tagline}
        </p>

        <div className="grid md:grid-cols-3 lg:grid-cols-4 sm:grid-cols-2 mt-8">
          {siteConfig.footer.map((section, index) => {
            const sectionT = t.footer.sections[index];
            return (
              <div key={index} className="mb-5">
                <h2 className="font-semibold">{sectionT?.title ?? section.title}</h2>
                <ul>
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex} className="my-2">
                      <Link
                        href={link.href}
                        className="group inline-flex cursor-pointer items-center justify-start gap-1 text-muted-foreground duration-200 hover:text-foreground hover:opacity-90"
                      >
                        {link.icon && link.icon}
                        {sectionT?.links[linkIndex] ?? link.text}
                        <ChevronRight className="h-4 w-4 translate-x-0 transform opacity-0 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <div className="max-w-6xl mx-auto border-t py-2 grid md:grid-cols-2 h-full justify-between w-full grid-cols-1 gap-1">
          <span className="text-sm tracking-tight text-foreground">
            Copyright © {new Date().getFullYear()}{" "}
            <Link href="/" className="cursor-pointer">
              hubso<span className="text-primary">.social</span>
            </Link>{" "}
            — {t.footer.copyright}
          </span>
          <ul className="flex justify-start md:justify-end text-sm tracking-tight text-foreground">
            <li className="mr-3 md:mx-4">
              <Link href="#" target="_blank" rel="noopener noreferrer">
                {t.footer.privacyPolicy}
              </Link>
            </li>
            <li className="mr-3 md:mx-4">
              <Link href="#" target="_blank" rel="noopener noreferrer">
                {t.footer.termsOfService}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
