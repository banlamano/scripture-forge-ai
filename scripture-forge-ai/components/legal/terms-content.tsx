"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

export function TermsContent() {
  const t = useTranslations("legal.terms");
  const tLegal = useTranslations("legal");

  return (
    <div className="container px-4 md:px-6 py-12 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">{t("title")}</h1>
      <p className="text-muted-foreground mb-8">{tLegal("lastUpdated")}</p>
      
      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("section1Title")}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {t("section1Text")}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("section2Title")}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {t("section2Text")}
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
            {(t.raw("section2Items") as string[]).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("section3Title")}</h2>
          <h3 className="text-xl font-medium mb-3">{t("section3_1Title")}</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            {t("section3_1Text")}
          </p>
          <h3 className="text-xl font-medium mb-3">{t("section3_2Title")}</h3>
          <p className="text-muted-foreground leading-relaxed">
            {t("section3_2Text")}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("section4Title")}</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            {t("section4Text")}
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            {(t.raw("section4Items") as string[]).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("section5Title")}</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            <strong>{t("section5Text")}</strong>
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            {(t.raw("section5Items") as string[]).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("section6Title")}</h2>
          <h3 className="text-xl font-medium mb-3">{t("section6_1Title")}</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            {t("section6_1Text")}
          </p>
          <h3 className="text-xl font-medium mb-3">{t("section6_2Title")}</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            {t("section6_2Text")}
          </p>
          <h3 className="text-xl font-medium mb-3">{t("section6_3Title")}</h3>
          <p className="text-muted-foreground leading-relaxed">
            {t("section6_3Text")}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("section7Title")}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {t("section7Text")} <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("section8Title")}</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            {t("section8Text")}
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            {(t.raw("section8Items") as string[]).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("section9Title")}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {t("section9Text")}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("section10Title")}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {t("section10Text")}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("section11Title")}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {t("section11Text")}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("section12Title")}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {t("section12Text")}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("section13Title")}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {t("section13Text")}
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            <strong>Email:</strong> {t("contactEmail")}<br />
            <strong>Website:</strong> https://scriptureforge.ai/contact
          </p>
        </section>
      </div>
    </div>
  );
}
