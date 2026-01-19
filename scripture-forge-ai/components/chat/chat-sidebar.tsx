"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Plus, History, Trash2, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChatHistory {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
}

// Mock data - in production, this would come from the database
const mockHistory: ChatHistory[] = [
  {
    id: "1",
    title: "Understanding John 3:16",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    preview: "Explain the meaning of John 3:16...",
  },
  {
    id: "2",
    title: "Daily devotional on hope",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    preview: "Give me a devotional about hope...",
  },
  {
    id: "3",
    title: "Dealing with anxiety",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    preview: "What does the Bible say about anxiety...",
  },
];

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
}

export function ChatSidebar({ isOpen, onClose, onNewChat }: ChatSidebarProps) {
  const t = useTranslations("chat");
  const [history, setHistory] = useState(mockHistory);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const deleteChat = (id: string) => {
    setHistory((prev) => prev.filter((chat) => chat.id !== id));
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? 280 : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        className={cn(
          "border-r bg-muted/30 flex-col h-full overflow-hidden",
          "fixed lg:relative z-50 lg:z-auto",
          isOpen ? "flex" : "hidden lg:flex lg:w-0"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <History className="w-4 h-4" />
            {t("history")}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* New chat button */}
        <div className="p-3 border-b">
          <Button onClick={onNewChat} className="w-full justify-start" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            {t("newChat")}
          </Button>
        </div>

        {/* Chat list */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {history.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                {t("history")}
              </div>
            ) : (
              history.map((chat) => (
                <div
                  key={chat.id}
                  className={cn(
                    "group p-3 rounded-lg cursor-pointer transition-colors",
                    selectedId === chat.id
                      ? "bg-primary/10"
                      : "hover:bg-muted"
                  )}
                  onClick={() => setSelectedId(chat.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <h3 className="font-medium text-sm truncate">
                          {chat.title}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {chat.preview}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {formatTime(chat.timestamp)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </motion.aside>
    </>
  );
}
