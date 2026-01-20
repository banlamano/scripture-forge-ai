"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

export function CookiesContent() {
  const t = useTranslations("legal.cookies");
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
          <p className="text-muted-foreground leading-relaxed mb-4">
            {t("section2Text")}
          </p>
          
          <h3 className="text-xl font-medium mb-3">{t("section2_1Title")}</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            {t("section2_1Text")}
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
            {(t.raw("section2_1Items") as string[]).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h3 className="text-xl font-medium mb-3">{t("section2_2Title")}</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            {t("section2_2Text")}
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
            {(t.raw("section2_2Items") as string[]).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h3 className="text-xl font-medium mb-3">{t("section2_3Title")}</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            {t("section2_3Text")}
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
            {(t.raw("section2_3Items") as string[]).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          <p className="text-muted-foreground leading-relaxed mb-6">
            {t("section2_3Extra")}
          </p>

          <h3 className="text-xl font-medium mb-3">{t("section2_4Title")}</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            {t("section2_4Text")}
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            {(t.raw("section2_4Items") as string[]).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("section3Title")}</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            {t("section3Text")}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-border mt-4">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border px-4 py-2 text-left">{t("thirdPartyTable.provider")}</th>
                  <th className="border border-border px-4 py-2 text-left">{t("thirdPartyTable.purpose")}</th>
                  <th className="border border-border px-4 py-2 text-left">{t("thirdPartyTable.type")}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border px-4 py-2 text-muted-foreground">{t("thirdPartyTable.vercel.name")}</td>
                  <td className="border border-border px-4 py-2 text-muted-foreground">{t("thirdPartyTable.vercel.purpose")}</td>
                  <td className="border border-border px-4 py-2 text-muted-foreground">{t("thirdPartyTable.vercel.type")}</td>
                </tr>
                <tr>
                  <td className="border border-border px-4 py-2 text-muted-foreground">{t("thirdPartyTable.google.name")}</td>
                  <td className="border border-border px-4 py-2 text-muted-foreground">{t("thirdPartyTable.google.purpose")}</td>
                  <td className="border border-border px-4 py-2 text-muted-foreground">{t("thirdPartyTable.google.type")}</td>
                </tr>
                <tr>
                  <td className="border border-border px-4 py-2 text-muted-foreground">{t("thirdPartyTable.stripe.name")}</td>
                  <td className="border border-border px-4 py-2 text-muted-foreground">{t("thirdPartyTable.stripe.purpose")}</td>
                  <td className="border border-border px-4 py-2 text-muted-foreground">{t("thirdPartyTable.stripe.type")}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("section4Title")}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {t("section4Text")}
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
            {(t.raw("section4Items") as string[]).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-4">
            {t("section4Extra")}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("section5Title")}</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            {t("section5Text")}
          </p>
          
          <h3 className="text-xl font-medium mb-3">{t("section5_1Title")}</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            {t("section5_1Text")}
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
            {(t.raw("section5_1Items") as string[]).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          <p className="text-muted-foreground leading-relaxed mb-6">
            {t("section5_1Extra")}
          </p>

          <h3 className="text-xl font-medium mb-3">{t("section5_2Title")}</h3>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li><strong>Chrome:</strong> {t("browserInstructions.chrome")}</li>
            <li><strong>Firefox:</strong> {t("browserInstructions.firefox")}</li>
            <li><strong>Safari:</strong> {t("browserInstructions.safari")}</li>
            <li><strong>Edge:</strong> {t("browserInstructions.edge")}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("section6Title")}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {t("section6Text")}
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
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
          <p className="text-muted-foreground leading-relaxed mt-4">
            <strong>Email:</strong> privacy@scriptureforge.ai<br />
            <strong>Website:</strong> https://scriptureforge.ai/contact
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("section9Title")}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {t("section9Text")}
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
            <li><Link href="/privacy" className="text-primary hover:underline">{(t.raw("relatedPolicies") as string[])[0]}</Link></li>
            <li><Link href="/terms" className="text-primary hover:underline">{(t.raw("relatedPolicies") as string[])[1]}</Link></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
