import { Metadata } from "next";
import { Suspense } from "react";
import { ChatInterface } from "@/components/chat/chat-interface";
import { Navbar } from "@/components/layout/navbar";

export const metadata: Metadata = {
  title: "AI Chat",
  description: "Chat with our AI Bible companion. Get scripture-based answers, explanations, and spiritual guidance.",
};

export default function ChatPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex">
        <Suspense fallback={<ChatLoadingSkeleton />}>
          <ChatInterface />
        </Suspense>
      </main>
    </div>
  );
}

function ChatLoadingSkeleton() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">
        {/* Loading indicator - no text needed */}
      </div>
    </div>
  );
}
