import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useConnections } from './ConnectionContext';
import { toast } from 'sonner';

interface DatabaseMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read: boolean;
  sender: {
    id: string;
    full_name: string;
    avatar_url: string;
  } | null;
  recipient: {
    id: string;
    full_name: string;
    avatar_url: string;
  } | null;
}

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read: boolean;
  sender: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  recipient: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
}

interface Conversation {
  userId: string;
  messages: Message[];
  unreadCount: number;
}

interface MessageContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  loading: boolean;
  sendMessage: (recipientId: string, content: string) => Promise<void>;
  setActiveConversation: (userId: string) => void;
  markAsRead: (userId: string) => Promise<void>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { connections } = useConnections();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConversations();
      setupRealtimeSubscription();
    }
    return () => {
      // Cleanup subscription
    };
  }, [user, connections]);

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          if (payload.new) {
            const newMessage = payload.new as Message;
            if (newMessage.recipient_id === user?.id) {
              handleNewMessage(newMessage);
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleNewMessage = (message: Message) => {
    setConversations((prev) => {
      const conversationIndex = prev.findIndex(
        (conv) => conv.userId === message.sender_id
      );

      if (conversationIndex === -1) {
        return [
          ...prev,
          {
            userId: message.sender_id,
            messages: [message],
            unreadCount: 1,
          },
        ];
      }

      const updatedConversations = [...prev];
      updatedConversations[conversationIndex] = {
        ...updatedConversations[conversationIndex],
        messages: [...updatedConversations[conversationIndex].messages, message],
        unreadCount: updatedConversations[conversationIndex].unreadCount + 1,
      };

      return updatedConversations;
    });
  };

  const fetchConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          sender_id,
          recipient_id,
          content,
          created_at,
          read,
          sender:profiles!sender_id(id, full_name, avatar_url),
          recipient:profiles!recipient_id(id, full_name, avatar_url)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const conversationsMap = new Map<string, Conversation>();

      data.forEach((message: DatabaseMessage) => {
        if (!message.sender || !message.recipient) return; // Skip messages with missing sender/recipient data
        
        const otherUserId =
          message.sender_id === user.id ? message.recipient_id : message.sender_id;
        const conversation = conversationsMap.get(otherUserId) || {
          userId: otherUserId,
          messages: [],
          unreadCount: 0,
        };

        conversation.messages.push(message);
        if (message.recipient_id === user.id && !message.read) {
          conversation.unreadCount++;
        }

        conversationsMap.set(otherUserId, conversation);
      });

      setConversations(Array.from(conversationsMap.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (recipientId: string, content: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        recipient_id: recipientId,
        content,
        read: false,
      });

      if (error) throw error;

      // Update local state
      const newMessage: Message = {
        id: Date.now().toString(), // Temporary ID
        sender_id: user.id,
        recipient_id: recipientId,
        content,
        created_at: new Date().toISOString(),
        read: false,
        sender: {
          id: user.id,
          full_name: user.user_metadata.full_name || '',
          avatar_url: user.user_metadata.avatar_url || '',
        },
        recipient: {
          id: recipientId,
          full_name: '', // Will be updated when the real message comes through
          avatar_url: '',
        },
      };

      setConversations((prev) => {
        const conversationIndex = prev.findIndex(
          (conv) => conv.userId === recipientId
        );

        if (conversationIndex === -1) {
          return [
            ...prev,
            {
              userId: recipientId,
              messages: [newMessage],
              unreadCount: 0,
            },
          ];
        }

        const updatedConversations = [...prev];
        updatedConversations[conversationIndex] = {
          ...updatedConversations[conversationIndex],
          messages: [...updatedConversations[conversationIndex].messages, newMessage],
        };

        return updatedConversations;
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const markAsRead = async (userId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('recipient_id', user.id)
        .eq('sender_id', userId)
        .eq('read', false);

      if (error) throw error;

      setConversations((prev) =>
        prev.map((conv) =>
          conv.userId === userId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSetActiveConversation = (userId: string) => {
    const conversation = conversations.find((conv) => conv.userId === userId);
    if (conversation) {
      setActiveConversation(conversation);
      markAsRead(userId);
    }
  };

  return (
    <MessageContext.Provider
      value={{
        conversations,
        activeConversation,
        loading,
        sendMessage,
        setActiveConversation: handleSetActiveConversation,
        markAsRead,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
} 