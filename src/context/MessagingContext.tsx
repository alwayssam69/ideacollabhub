
import React, { createContext, useContext, useState } from 'react';
import { useUserMessages, Message, Conversation } from '@/hooks/useUserMessages';

interface MessagingContextType {
  conversations: Conversation[];
  messages: Message[];
  currentConversation: Conversation | null;
  loading: boolean;
  loadingMessages: boolean;
  fetchMessages: (recipientId: string) => Promise<void>;
  sendMessage: (recipientId: string, content: string) => Promise<any>;
  refreshConversations: () => Promise<void>;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export function MessagingProvider({ children }: { children: React.ReactNode }) {
  const {
    conversations,
    messages,
    currentConversation,
    loading,
    loadingMessages,
    fetchConversations,
    fetchMessages,
    sendMessage
  } = useUserMessages();

  return (
    <MessagingContext.Provider
      value={{
        conversations,
        messages,
        currentConversation,
        loading,
        loadingMessages,
        fetchMessages,
        sendMessage,
        refreshConversations: fetchConversations
      }}
    >
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessaging() {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
}
