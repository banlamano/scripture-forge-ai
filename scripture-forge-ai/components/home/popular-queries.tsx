"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

export function PopularQueries() {
  const t = useTranslations("chat.popularQueries");

  const queryKeys = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"] as const;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {queryKeys.map((key, index) => {
        const query = t(key);
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Link
              href={`/chat?q=${encodeURIComponent(query)}`}
              className="group flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/50 hover:border-primary/30 transition-all duration-200"
            >
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors line-clamp-2">
                {query}
              </span>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
