"use client";

import Link from "next/link";
import { BookOpen, Heart } from "lucide-react";
import { useTranslations } from "next-intl";

const productLinks = [
  { key: "bible", href: "/bible" },
  { key: "chat", href: "/chat" },
  { key: "search", href: "/search" },
  { key: "devotional", href: "/devotional" },
  { key: "reading", href: "/reading" },
  { key: "prayer", href: "/prayer" },
];

const resourceLinks = [
  { key: "helpCenter", href: "/help" },
];

const legalLinks = [
  { key: "privacy", href: "/privacy" },
  { key: "terms", href: "/terms" },
  { key: "cookies", href: "/cookies" },
];

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container px-4 md:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">
                Scripture<span className="text-primary">Forge</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4">{t("footer.product")}</h3>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t(`common.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-semibold mb-4">{t("footer.resources")}</h3>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t(`footer.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-4">{t("footer.legal")}</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t(`footer.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            {t("footer.tagline")}
          </p>
        </div>
      </div>
    </footer>
  );
}
