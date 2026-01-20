"use client";

import { useTranslations } from "next-intl";
import { Code, Book, Zap, Lock, Globe, Terminal } from "lucide-react";

export function ApiDocsContent() {
  const t = useTranslations("resources.apiDocs");

  const endpoints = t.raw("endpoints") as Array<{
    method: string;
    path: string;
    description: string;
    example: string;
  }>;

  return (
    <div className="container px-4 md:px-6 py-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
        <p className="text-xl text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Quick Start */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <div className="border rounded-lg p-6">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{t("features.fast.title")}</h3>
          <p className="text-muted-foreground">{t("features.fast.description")}</p>
        </div>
        <div className="border rounded-lg p-6">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{t("features.secure.title")}</h3>
          <p className="text-muted-foreground">{t("features.secure.description")}</p>
        </div>
        <div className="border rounded-lg p-6">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{t("features.global.title")}</h3>
          <p className="text-muted-foreground">{t("features.global.description")}</p>
        </div>
      </div>

      {/* Authentication */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Lock className="w-6 h-6" />
          {t("auth.title")}
        </h2>
        <div className="bg-muted/50 rounded-lg p-6">
          <p className="text-muted-foreground mb-4">{t("auth.description")}</p>
          <div className="bg-background rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <pre>{t("auth.example")}</pre>
          </div>
        </div>
      </section>

      {/* Base URL */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Globe className="w-6 h-6" />
          {t("baseUrl.title")}
        </h2>
        <div className="bg-muted/50 rounded-lg p-6">
          <p className="text-muted-foreground mb-4">{t("baseUrl.description")}</p>
          <div className="bg-background rounded-lg p-4 font-mono text-sm">
            <code>https://api.scriptureforge.ai/v1</code>
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Terminal className="w-6 h-6" />
          {t("endpointsTitle")}
        </h2>
        <div className="space-y-6">
          {endpoints.map((endpoint, index) => (
            <div key={index} className="border rounded-lg overflow-hidden">
              <div className="bg-muted/50 p-4 flex items-center gap-4">
                <span className={`px-3 py-1 rounded text-sm font-mono font-bold ${
                  endpoint.method === "GET" ? "bg-green-500/20 text-green-600" :
                  endpoint.method === "POST" ? "bg-blue-500/20 text-blue-600" :
                  "bg-yellow-500/20 text-yellow-600"
                }`}>
                  {endpoint.method}
                </span>
                <code className="font-mono">{endpoint.path}</code>
              </div>
              <div className="p-4">
                <p className="text-muted-foreground mb-4">{endpoint.description}</p>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre>{endpoint.example}</pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Rate Limits */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">{t("rateLimits.title")}</h2>
        <div className="bg-muted/50 rounded-lg p-6">
          <p className="text-muted-foreground mb-4">{t("rateLimits.description")}</p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">{t("rateLimits.plan")}</th>
                  <th className="text-left p-3">{t("rateLimits.requests")}</th>
                  <th className="text-left p-3">{t("rateLimits.burst")}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3">Free</td>
                  <td className="p-3">100/day</td>
                  <td className="p-3">10/minute</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">Pro</td>
                  <td className="p-3">10,000/day</td>
                  <td className="p-3">100/minute</td>
                </tr>
                <tr>
                  <td className="p-3">Enterprise</td>
                  <td className="p-3">Unlimited</td>
                  <td className="p-3">Custom</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SDKs */}
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Code className="w-6 h-6" />
          {t("sdks.title")}
        </h2>
        <p className="text-muted-foreground mb-6">{t("sdks.description")}</p>
        <div className="grid md:grid-cols-3 gap-4">
          {["JavaScript", "Python", "Go"].map((lang) => (
            <div key={lang} className="border rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer">
              <p className="font-semibold">{lang}</p>
              <p className="text-sm text-muted-foreground">{t("sdks.comingSoon")}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
