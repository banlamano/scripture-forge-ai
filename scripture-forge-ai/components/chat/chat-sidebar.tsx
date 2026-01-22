"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Plus, History, Trash2, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChatConversation {
  id: string;
  title: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  preview?: string;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  conversations: ChatConversation[];
  selectedId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

export function ChatSidebar({ 
  isOpen, 
  onClose, 
  onNewChat,
  conversations,
  selectedId,
  onSelectConversation,
  onDeleteConversation,
}: ChatSidebarProps) {
  const t = useTranslations("chat");

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return t("justNow") || "Just now";
    if (hours < 24) return `${hours}h ${t("ago") || "ago"}`;
    if (days === 1) return t("yesterday") || "Yesterday";
    return `${days} ${t("daysAgo") || "days ago"}`;
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
            {conversations.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8 px-4">
                <MessageCircle className="w-8 h-8 mx-auto mb-3 opacity-50" />
                <p>{t("noHistory") || "No chat history yet"}</p>
                <p className="text-xs mt-1">{t("startConversation") || "Start a conversation to see it here"}</p>
              </div>
            ) : (
              conversations.map((chat) => (
                <div
                  key={chat.id}
                  className={cn(
                    "group p-3 rounded-lg cursor-pointer transition-colors",
                    selectedId === chat.id
                      ? "bg-primary/10"
                      : "hover:bg-muted"
                  )}
                  onClick={() => onSelectConversation(chat.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <h3 className="font-medium text-sm truncate">
                          {chat.title || t("newChat") || "New Chat"}
                        </h3>
                      </div>
                      {chat.preview && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {chat.preview}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {formatTime(chat.updatedAt)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(chat.id);
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
