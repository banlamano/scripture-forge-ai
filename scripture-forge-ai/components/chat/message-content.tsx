"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface MessageContentProps {
  content: string;
}

export function MessageContent({ content }: MessageContentProps) {
  return (
    <div className="prose-scripture text-sm">
      <ReactMarkdown
        components={{
          // Custom paragraph styling
          p: ({ children }) => (
            <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
          ),
          // Style blockquotes as scripture references
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-primary/50 bg-primary/5 py-2 px-3 rounded-r-lg my-3 italic">
              {children}
            </blockquote>
          ),
          // Make links clickable and styled
          a: ({ href, children }) => {
            // Check if it's a Bible reference
            const versePattern = /^([\w\s]+)\s+(\d+):(\d+)(-\d+)?$/;
            const isVerseRef = typeof children === "string" && versePattern.test(children);
            
            if (isVerseRef) {
              return (
                <Link
                  href={`/bible?ref=${encodeURIComponent(String(children))}`}
                  className="text-primary hover:underline font-medium"
                >
                  {children}
                </Link>
              );
            }
            
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {children}
              </a>
            );
          },
          // Style code blocks
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            return (
              <code
                className={cn(
                  isInline
                    ? "bg-muted px-1.5 py-0.5 rounded text-sm"
                    : "block bg-muted p-3 rounded-lg text-sm overflow-x-auto"
                )}
                {...props}
              >
                {children}
              </code>
            );
          },
          // Style lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>
          ),
          // Style headings
          h1: ({ children }) => (
            <h1 className="text-xl font-bold mb-3 mt-4">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-bold mb-2 mt-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold mb-2 mt-3">{children}</h3>
          ),
          // Style strong/bold for verse references
          strong: ({ children }) => {
            const text = String(children);
            const versePattern = /^([\w\s]+)\s+(\d+):(\d+)(-\d+)?$/;
            
            if (versePattern.test(text)) {
              return (
                <Link
                  href={`/bible?ref=${encodeURIComponent(text)}`}
                  className="font-semibold text-primary hover:underline cursor-pointer"
                >
                  {children}
                </Link>
              );
            }
            
            return <strong className="font-semibold">{children}</strong>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
