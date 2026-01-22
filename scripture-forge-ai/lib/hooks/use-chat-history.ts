"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";

export interface ChatConversation {
  id: string;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
  preview?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
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

export function useChatHistory() {
  const { data: session, status } = useSession();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ConversationWithMessages | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = status === "authenticated" && !!session?.user;

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) {
      setConversations([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat/conversations");
      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }
      const data = await response.json();
      setConversations(data);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError("Failed to load chat history");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Create a new conversation
  const createConversation = useCallback(async (title?: string): Promise<ChatConversation | null> => {
    if (!isAuthenticated) {
      return null;
    }

    try {
      const response = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title || "New Conversation" }),
      });

      if (!response.ok) {
        throw new Error("Failed to create conversation");
      }

      const newConversation = await response.json();
      setConversations((prev) => [newConversation, ...prev]);
      setCurrentConversation({ ...newConversation, messages: [] });
      return newConversation;
    } catch (err) {
      console.error("Error creating conversation:", err);
      setError("Failed to create conversation");
      return null;
    }
  }, [isAuthenticated]);

  // Load a specific conversation with messages
  const loadConversation = useCallback(async (conversationId: string) => {
    if (!isAuthenticated) {
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/chat/conversations/${conversationId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch conversation");
      }
      const data = await response.json();
      setCurrentConversation(data);
      return data;
    } catch (err) {
      console.error("Error loading conversation:", err);
      setError("Failed to load conversation");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Add a message to the current conversation
  const addMessage = useCallback(async (
    conversationId: string,
    role: "user" | "assistant",
    content: string,
    metadata?: ChatMessage["metadata"]
  ): Promise<ChatMessage | null> => {
    if (!isAuthenticated) {
      return null;
    }

    try {
      const response = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, content, metadata }),
      });

      if (!response.ok) {
        throw new Error("Failed to add message");
      }

      const newMessage = await response.json();
      
      // Update current conversation with new message
      setCurrentConversation((prev) => {
        if (!prev || prev.id !== conversationId) return prev;
        return {
          ...prev,
          messages: [...prev.messages, newMessage],
        };
      });

      // Update conversation in list (for title/preview update)
      setConversations((prev) => 
        prev.map((conv) => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              updatedAt: new Date(),
              preview: role === "user" ? content.substring(0, 100) : conv.preview,
              title: role === "user" && (!conv.title || conv.title === "New Conversation")
                ? content.substring(0, 50) + (content.length > 50 ? "..." : "")
                : conv.title,
            };
          }
          return conv;
        })
      );

      return newMessage;
    } catch (err) {
      console.error("Error adding message:", err);
      return null;
    }
  }, [isAuthenticated]);

  // Update conversation (title, archive status)
  const updateConversation = useCallback(async (
    conversationId: string,
    updates: { title?: string; isArchived?: boolean }
  ) => {
    if (!isAuthenticated) {
      return false;
    }

    try {
      const response = await fetch(`/api/chat/conversations/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update conversation");
      }

      const updated = await response.json();
      
      setConversations((prev) =>
        prev.map((conv) => (conv.id === conversationId ? { ...conv, ...updated } : conv))
      );

      if (currentConversation?.id === conversationId) {
        setCurrentConversation((prev) => prev ? { ...prev, ...updated } : null);
      }

      return true;
    } catch (err) {
      console.error("Error updating conversation:", err);
      return false;
    }
  }, [isAuthenticated, currentConversation?.id]);

  // Delete a conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    if (!isAuthenticated) {
      return false;
    }

    try {
      const response = await fetch(`/api/chat/conversations/${conversationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete conversation");
      }

      setConversations((prev) => prev.filter((conv) => conv.id !== conversationId));
      
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
      }

      return true;
    } catch (err) {
      console.error("Error deleting conversation:", err);
      return false;
    }
  }, [isAuthenticated, currentConversation?.id]);

  // Clear current conversation (for new chat)
  const clearCurrentConversation = useCallback(() => {
    setCurrentConversation(null);
  }, []);

  // Load conversations on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated, fetchConversations]);

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
