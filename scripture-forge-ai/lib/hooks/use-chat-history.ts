"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

export interface ChatConversation {
  id: string;
  title: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  isArchived: boolean;
  preview?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date | string;
  metadata?: {
    verseReferences?: string[];
    promptType?: string;
    model?: string;
    tokensUsed?: number;
  };
}

export interface ConversationWithMessages extends ChatConversation {
  messages: ChatMessage[];
}

const STORAGE_KEY = "scripture-forge-chat-history";

// Generate a unique ID
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// LocalStorage helpers
const getStoredConversations = (): ConversationWithMessages[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveConversationsToStorage = (conversations: ConversationWithMessages[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (err) {
    console.error("Failed to save to localStorage:", err);
  }
};

export function useChatHistory() {
  const { data: session, status } = useSession();
  const [conversations, setConversations] = useState<ConversationWithMessages[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ConversationWithMessages | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const isAuthenticated = status === "authenticated" && !!session?.user;

  // Load conversations from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined" && !isInitialized) {
      const stored = getStoredConversations();
      setConversations(stored);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Save to localStorage whenever conversations change
  useEffect(() => {
    if (isInitialized && conversations.length >= 0) {
      saveConversationsToStorage(conversations);
    }
  }, [conversations, isInitialized]);

  // Fetch conversations (for API-based storage when authenticated)
  const fetchConversations = useCallback(async () => {
    // For now, we use localStorage for everyone
    // In the future, this could sync with the server for authenticated users
    const stored = getStoredConversations();
    setConversations(stored);
  }, []);

  // Create a new conversation
  const createConversation = useCallback(async (title?: string): Promise<ConversationWithMessages | null> => {
    const now = new Date().toISOString();
    const newConversation: ConversationWithMessages = {
      id: generateId(),
      title: title || null,
      createdAt: now,
      updatedAt: now,
      isArchived: false,
      preview: "",
      messages: [],
    };

    setConversations((prev) => [newConversation, ...prev]);
    setCurrentConversation(newConversation);
    
    return newConversation;
  }, []);

  // Load a specific conversation
  const loadConversation = useCallback(async (conversationId: string): Promise<ConversationWithMessages | null> => {
    const conversation = conversations.find((c) => c.id === conversationId);
    if (conversation) {
      setCurrentConversation(conversation);
      return conversation;
    }
    return null;
  }, [conversations]);

  // Add a message to a conversation
  const addMessage = useCallback(async (
    conversationId: string,
    role: "user" | "assistant",
    content: string,
    metadata?: ChatMessage["metadata"]
  ): Promise<ChatMessage | null> => {
    const now = new Date().toISOString();
    const newMessage: ChatMessage = {
      id: generateId(),
      role,
      content,
      createdAt: now,
      metadata,
    };

    setConversations((prev) => {
      return prev.map((conv) => {
        if (conv.id === conversationId) {
          const updatedMessages = [...conv.messages, newMessage];
          const updatedConv = {
            ...conv,
            messages: updatedMessages,
            updatedAt: now,
            preview: role === "user" ? content.substring(0, 100) : conv.preview,
            // Auto-generate title from first user message
            title: role === "user" && !conv.title
              ? content.substring(0, 50) + (content.length > 50 ? "..." : "")
              : conv.title,
          };
          
          // Also update current conversation if it's the same
          if (currentConversation?.id === conversationId) {
            setCurrentConversation(updatedConv);
          }
          
          return updatedConv;
        }
        return conv;
      });
    });

    return newMessage;
  }, [currentConversation?.id]);

  // Update conversation metadata
  const updateConversation = useCallback(async (
    conversationId: string,
    updates: { title?: string; isArchived?: boolean }
  ): Promise<boolean> => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          const updated = {
            ...conv,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          if (currentConversation?.id === conversationId) {
            setCurrentConversation(updated);
          }
          return updated;
        }
        return conv;
      })
    );
    return true;
  }, [currentConversation?.id]);

  // Delete a conversation
  const deleteConversation = useCallback(async (conversationId: string): Promise<boolean> => {
    setConversations((prev) => prev.filter((conv) => conv.id !== conversationId));
    
    if (currentConversation?.id === conversationId) {
      setCurrentConversation(null);
    }
    
    return true;
  }, [currentConversation?.id]);

  // Clear current conversation (for new chat)
  const clearCurrentConversation = useCallback(() => {
    setCurrentConversation(null);
  }, []);

  return {
    conversations,
    currentConversation,
    isLoading,
    error,
    isAuthenticated,
    fetchConversations,
    createConversation,
    loadConversation,
    addMessage,
    updateConversation,
    deleteConversation,
    clearCurrentConversation,
    setCurrentConversation,
  };
}
