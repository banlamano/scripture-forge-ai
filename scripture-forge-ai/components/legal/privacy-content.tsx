"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

export function PrivacyContent() {
  const t = useTranslations("legal.privacy");
  const tLegal = useTranslations("legal");

  return (
    <div className="container px-4 md:px-6 py-12 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">{t("title")}</h1>
      <p className="text-muted-foreground mb-8">{tLegal("lastUpdated")}</p>
      
      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("section1Title")}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {t("intro")}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("section2Title")}</h2>
          <h3 className="text-xl font-medium mb-3">{t("section2_1Title")}</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            {t("section2_1Text")}
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
            {(t.raw("section2_1Items") as string[]).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          
          <h3 className="text-xl font-medium mb-3">{t("section2_2Title")}</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            {t("section2_2Text")}
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            {(t.raw("section2_2Items") as string[]).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("section3Title")}</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            {t("section3Text")}
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            {(t.raw("section3Items") as string[]).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
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
          <p className="text-muted-foreground leading-relaxed">
            {t("section5Text")}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("section6Title")}</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            {t("section6Text")}
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            {(t.raw("section6Items") as string[]).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("section7Title")}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {t("section7Text")}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("section8Title")}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {t("section8Text")}
          </p>
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
          <p className="text-muted-foreground leading-relaxed mt-4">
            <strong>Email:</strong> {t("contactEmail")}<br />
            <strong>Website:</strong> {t("contactWebsite")}
          </p>
        </section>
      </div>
    </div>
  );
}
