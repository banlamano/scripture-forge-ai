"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "ai/react";
import {
  Send,
  Sparkles,
  Loader2,
  RefreshCw,
  Copy,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  History,
  Trash2,
  Plus,
  Share2,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  RotateCcw,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChatSidebar } from "./chat-sidebar";
import { SuggestedPrompts } from "./suggested-prompts";
import { MessageContent } from "./message-content";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/components/providers/language-provider";
import { ShareModal } from "@/components/ui/share-modal";
import { useChatHistory } from "@/lib/hooks/use-chat-history";

export function ChatInterface() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const word = searchParams.get("word");
  const verse = searchParams.get("verse");
  const query = searchParams.get("q");
  const conversationIdParam = searchParams.get("c");
  const t = useTranslations("chat");
  const tCommon = useTranslations("common");
  const { locale } = useLanguage();
  
  // Chat history management
  const {
    conversations,
    currentConversation,
    isAuthenticated,
    createConversation,
    loadConversation,
    addMessage,
    deleteConversation,
    clearCurrentConversation,
    fetchConversations,
  } = useChatHistory();

  const [activeConversationId, setActiveConversationId] = useState<string | null>(conversationIdParam);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Build the initial query based on parameters - using translated templates
  let initialQuery = "";
  if (word && verse) {
    // Word explanation mode - explain just the word in context (in user's language)
    initialQuery = t("questionTemplates.explainWord", { word, verse });
  } else if (verse) {
    // Verse explanation mode (in user's language)
    initialQuery = t("questionTemplates.explainVerse", { verse });
  } else if (query) {
    initialQuery = query;
  }
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareContent, setShareContent] = useState("");

  // Check for speech recognition support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      setSpeechSupported(!!SpeechRecognition);
    }
  }, []);

  // Load conversation from URL param
  useEffect(() => {
    if (conversationIdParam && isAuthenticated && !isInitialized) {
      loadConversation(conversationIdParam);
      setActiveConversationId(conversationIdParam);
      setIsInitialized(true);
    }
  }, [conversationIdParam, isAuthenticated, loadConversation, isInitialized]);

  const {
    messages,
    input,
    setInput,
    handleSubmit: originalHandleSubmit,
    isLoading,
    reload,
    stop,
    error,
    setMessages,
  } = useChat({
    api: "/api/chat",
    initialInput: initialQuery,
    body: {
      lang: locale, // Pass the user's language to the API
    },
    onFinish: async (message) => {
      // Save assistant message to database
      if (activeConversationId && isAuthenticated) {
        await addMessage(activeConversationId, "assistant", message.content);
      }
    },
    onError: (err) => {
      // Show user-friendly error message
      const errorMsg = err.message || "Failed to get response";
      const isRateLimit = errorMsg.includes("busy") || errorMsg.includes("rate");
      
      toast.error(isRateLimit ? t("serviceBusy") : t("errorOccurred"), {
        description: isRateLimit ? t("tryAgainLater") : errorMsg,
        action: {
          label: t("retry"),
          onClick: () => reload(),
        },
        duration: 5000,
      });
    },
  });

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversation?.messages && currentConversation.messages.length > 0) {
      const formattedMessages = currentConversation.messages.map((msg) => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));
      setMessages(formattedMessages);
    }
  }, [currentConversation, setMessages]);

  // Custom submit handler that saves to history
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    let convId = activeConversationId;

    // If authenticated and no active conversation, create one
    if (isAuthenticated && !convId) {
      const newConv = await createConversation();
      if (newConv) {
        convId = newConv.id;
        setActiveConversationId(convId);
        // Update URL with conversation ID
        router.push(`/chat?c=${convId}`, { scroll: false });
      }
    }

    // Save user message to database
    if (convId && isAuthenticated) {
      await addMessage(convId, "user", input);
    }

    // Call the original submit handler
    originalHandleSubmit(e);
  };

  // Auto-scroll to bottom - using scrollIntoView for reliability
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, []);

  // Scroll when messages array changes (new message added)
  useEffect(() => {
    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 50);
    return () => clearTimeout(timer);
  }, [messages, scrollToBottom]);

  // Continuous scroll during streaming - keeps the latest content visible
  useEffect(() => {
    if (isLoading) {
      // Initial scroll
      scrollToBottom();
      
      // Keep scrolling during generation
      const interval = setInterval(() => {
        scrollToBottom();
      }, 150);
      return () => clearInterval(interval);
    }
  }, [isLoading, scrollToBottom]);

  // Also scroll when the last message content changes (streaming)
  const lastMessageContent = messages[messages.length - 1]?.content;
  useEffect(() => {
    if (isLoading && lastMessageContent) {
      scrollToBottom();
    }
  }, [lastMessageContent, isLoading, scrollToBottom]);

  // Auto-submit if there's an initial query
  useEffect(() => {
    if (initialQuery && messages.length === 0) {
      const form = document.querySelector("form");
      if (form) {
        setTimeout(() => form.requestSubmit(), 100);
      }
    }
  }, [initialQuery, messages.length]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast.success(tCommon("copied"));
  };

  const handleShare = (content: string) => {
    setShareContent(content);
    setShowShareModal(true);
  };

  const handleNewChat = () => {
    // Clear current conversation state
    clearCurrentConversation();
    setActiveConversationId(null);
    setMessages([]);
    setInput("");
    // Navigate to clean chat URL
    router.push("/chat");
  };

  // Handle selecting a conversation from sidebar
  const handleSelectConversation = async (conversationId: string) => {
    if (conversationId === activeConversationId) return;
    
    setActiveConversationId(conversationId);
    await loadConversation(conversationId);
    router.push(`/chat?c=${conversationId}`, { scroll: false });
    setShowSidebar(false);
  };

  // Handle deleting a conversation
  const handleDeleteConversation = async (conversationId: string) => {
    const success = await deleteConversation(conversationId);
    if (success) {
      toast.success(t("conversationDeleted") || "Conversation deleted");
      if (conversationId === activeConversationId) {
        handleNewChat();
      }
    } else {
      toast.error(t("errorOccurred") || "Failed to delete conversation");
    }
  };

  // Voice input (speech-to-text)
  const startListening = () => {
    if (!speechSupported) {
      toast.error(t("speechNotSupported"));
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Map locale to speech recognition language
    const speechLangMap: Record<string, string> = {
      en: "en-US",
      fr: "fr-FR",
      de: "de-DE",
      es: "es-ES",
      pt: "pt-BR",
      zh: "zh-CN",
      it: "it-IT",
    };
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = speechLangMap[locale] || 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast.info(t("listening"));
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setInput(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      toast.error(t("speechError"));
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Retry/regenerate last response
  const handleRetry = () => {
    if (messages.length > 0) {
      reload();
      toast.info(t("regenerating"));
    }
  };

  return (
    <>
    <ShareModal
      isOpen={showShareModal}
      onClose={() => setShowShareModal(false)}
      text={shareContent}
      title="ScriptureForge AI"
      translations={{
        shareTitle: tCommon("share"),
        copyLink: tCommon("copy"),
        copied: tCommon("copied"),
      }}
    />
    <div className="flex-1 flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <ChatSidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        onNewChat={handleNewChat}
        conversations={conversations}
        selectedId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        isAuthenticated={isAuthenticated}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Messages area */}
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="max-w-3xl mx-auto px-4 py-6">
            {messages.length === 0 ? (
              <EmptyState onSelectPrompt={setInput} />
            ) : (
              <div className="space-y-6">
                <AnimatePresence initial={false}>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChatMessage
                        role={message.role as "user" | "assistant" | "system"}
                        content={message.content}
                        onCopy={() => handleCopy(message.content)}
                        onShare={() => handleShare(message.content)}
                        onRetry={message.role === "assistant" ? handleRetry : undefined}
                        isLatest={index === messages.length - 1}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Loading indicator */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-scripture-gold/20">
                        <Sparkles className="w-4 h-4 text-scripture-gold" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">{t("searching")}</span>
                    </div>
                  </motion.div>
                )}
                
                {/* Scroll anchor - this element is scrolled into view */}
                <div ref={messagesEndRef} className="h-1" />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input area */}
        <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? t("listening") : t("placeholder")}
                className={cn(
                  "min-h-[60px] max-h-[200px] pr-28 resize-none",
                  isListening && "border-primary ring-2 ring-primary/20"
                )}
                disabled={isLoading}
              />
              <div className="absolute right-2 bottom-2 flex gap-1">
                {/* Voice input button */}
                {speechSupported && (
                  <Button
                    type="button"
                    size="icon"
                    variant={isListening ? "default" : "ghost"}
                    onClick={isListening ? stopListening : startListening}
                    disabled={isLoading}
                    className={cn(
                      "rounded-lg",
                      isListening && "bg-red-500 hover:bg-red-600 animate-pulse"
                    )}
                    title={isListening ? t("stopListening") : t("voiceInput")}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                )}
                
                {isLoading ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    onClick={stop}
                    className="rounded-lg"
                    title={t("stopGenerating")}
                  >
                    <Square className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!input.trim()}
                    className="rounded-lg"
                    title={t("send")}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </form>

            {/* Voice input hint */}
            {isListening && (
              <p className="text-xs text-primary text-center mt-2 animate-pulse">
                🎤 {t("listening")}
              </p>
            )}

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground text-center mt-3">
              {t("disclaimer")}
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  onCopy: () => void;
  onShare: () => void;
  onRetry?: () => void;
  isLatest: boolean;
}

function ChatMessage({ role, content, onCopy, onShare, onRetry, isLatest }: ChatMessageProps) {
  const isUser = role === "user";
  const [liked, setLiked] = useState<boolean | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setSpeechSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
    return () => {
      // Cleanup: stop speech when component unmounts
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const t = useTranslations("chat");

  const handleLike = () => {
    setLiked(liked === true ? null : true);
    if (liked !== true) {
      toast.success(t("thanksFeedback"));
    }
  };

  const handleDislike = () => {
    setLiked(liked === false ? null : false);
    if (liked !== false) {
      toast.success(t("thanksFeedback"));
    }
  };

  // Text-to-speech for AI responses
  const handlePlayAudio = () => {
    if (!speechSupported) {
      toast.error(t("ttsNotSupported"));
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(content);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Map locale to speech language prefix
    const langPrefixMap: Record<string, string> = {
      en: "en",
      fr: "fr",
      de: "de",
      es: "es",
      pt: "pt",
      zh: "zh",
      it: "it",
    };
    
    // Get locale from document or default to 'en'
    const currentLocale = typeof document !== 'undefined' 
      ? document.documentElement.lang || 'en' 
      : 'en';
    const langPrefix = langPrefixMap[currentLocale] || 'en';
    
    // Try to find a good voice for the current language
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith(langPrefix) && voice.name.includes('Google')
    ) || voices.find(voice => voice.lang.startsWith(langPrefix));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => {
      setIsPlaying(false);
      toast.error(t("audioError"));
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <Avatar className="w-8 h-8 flex-shrink-0">
        {isUser ? (
          <AvatarFallback className="bg-primary/20">
            <span className="text-sm">👤</span>
          </AvatarFallback>
        ) : (
          <AvatarFallback className="bg-scripture-gold/20">
            <Sparkles className="w-4 h-4 text-scripture-gold" />
          </AvatarFallback>
        )}
      </Avatar>

      <div className={cn("flex flex-col gap-2 max-w-[85%]", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-muted rounded-bl-sm"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <MessageContent content={content} />
          )}
        </div>

        {/* Message actions - always visible like ChatGPT */}
        {!isUser && (
          <div className="flex items-center gap-1 text-muted-foreground">
            {/* Audio playback */}
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "h-8 w-8 hover:bg-muted hover:text-foreground",
                isPlaying && "text-primary"
              )}
              onClick={handlePlayAudio}
              title={isPlaying ? t("stopAudio") : t("playAudio")}
            >
              {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:bg-muted hover:text-foreground" 
              onClick={onCopy}
              title={t("copyResponse")}
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "h-8 w-8 hover:bg-muted",
                liked === true && "text-green-500 hover:text-green-600"
              )}
              onClick={handleLike}
              title={t("goodResponse")}
            >
              <ThumbsUp className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "h-8 w-8 hover:bg-muted",
                liked === false && "text-red-500 hover:text-red-600"
              )}
              onClick={handleDislike}
              title={t("badResponse")}
            >
              <ThumbsDown className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:bg-muted hover:text-foreground" 
              onClick={onShare}
              title={t("shareResponse")}
            >
              <Share2 className="w-4 h-4" />
            </Button>
            {/* Retry button - only show on latest assistant message */}
            {isLatest && onRetry && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:bg-muted hover:text-foreground" 
                onClick={onRetry}
                title={t("regenerate")}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ onSelectPrompt }: { onSelectPrompt: (prompt: string) => void }) {
  const t = useTranslations("chat");
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-16 h-16 rounded-2xl bg-scripture-gold/20 flex items-center justify-center mb-6 mx-auto">
          <Sparkles className="w-8 h-8 text-scripture-gold" />
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {t("welcome")}
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          {t("welcomeDescription")}
        </p>
      </motion.div>

      <SuggestedPrompts onSelect={onSelectPrompt} />
    </div>
  );
}
