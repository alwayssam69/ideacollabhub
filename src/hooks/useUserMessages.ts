import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

export type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read: boolean | null;
  sender_profile?: {
    full_name: string;
    avatar_url: string;
  };
};

export type Conversation = {
  profile: Tables<'profiles'>;
  lastMessage: Message | null;
  unreadCount: number;
};

export function useUserMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);

  // Fetch all conversations for the current user
  const fetchConversations = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get all users the current user has messaged or received messages from
      const { data: messageUsers, error: messageError } = await supabase
        .rpc('get_message_participants', { user_id: user.id });
      
      if (messageError) {
        console.error("Error fetching message participants:", messageError);
        // Fallback method if RPC doesn't exist
        const { data: sentMessages } = await supabase
          .from('messages')
          .select('recipient_id')
          .eq('sender_id', user.id)
          .order('created_at', { ascending: false });
          
        const { data: receivedMessages } = await supabase
          .from('messages')
          .select('sender_id')
          .eq('recipient_id', user.id)
          .order('created_at', { ascending: false });
          
        const userIds = new Set<string>();
        
        sentMessages?.forEach(msg => userIds.add(msg.recipient_id));
        receivedMessages?.forEach(msg => userIds.add(msg.sender_id));
        
        // Fetch profiles for these users
        if (userIds.size > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .in('id', Array.from(userIds));
            
          if (!profiles) return;
          
          const conversationsArray: Conversation[] = [];
          
          for (const profile of profiles) {
            // Get last message
            const { data: lastMessageData } = await supabase
              .from('messages')
              .select('*')
              .or(`and(sender_id.eq.${user.id},recipient_id.eq.${profile.id}),and(sender_id.eq.${profile.id},recipient_id.eq.${user.id})`)
              .order('created_at', { ascending: false })
              .limit(1);
              
            // Get unread count
            const { count } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('sender_id', profile.id)
              .eq('recipient_id', user.id)
              .eq('read', false);
              
            conversationsArray.push({
              profile,
              lastMessage: lastMessageData && lastMessageData.length > 0 ? lastMessageData[0] as Message : null,
              unreadCount: count || 0
            });
          }
          
          // Sort by most recent message
          conversationsArray.sort((a, b) => {
            const dateA = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0;
            const dateB = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0;
            return dateB - dateA;
          });
          
          setConversations(conversationsArray);
          setLoading(false);
          return;
        }
      }
      
      // If RPC call was successful, process the data
      if (messageUsers) {
        const conversationsArray: Conversation[] = [];
        
        for (const userData of messageUsers) {
          const { profile, last_message, unread_count } = userData;
          
          conversationsArray.push({
            profile: profile as Tables<'profiles'>,
            lastMessage: last_message as Message | null,
            unreadCount: unread_count as number
          });
        }
        
        setConversations(conversationsArray);
      }
      
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch messages for a specific conversation
  const fetchMessages = async (recipientId: string) => {
    if (!user) return;
    
    try {
      setLoadingMessages(true);
      
      // Find the conversation in our list
      const conversation = conversations.find(c => c.profile.id === recipientId);
      if (conversation) {
        setCurrentConversation(conversation);
        
        // Fetch messages for this conversation
        const { data, error } = await supabase
          .from('messages')
          .select(`
            *,
            sender_profile:profiles!sender_id(full_name, avatar_url)
          `)
          .or(`and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        
        // Update messages state with proper type casting
        const typedMessages = data.map(msg => ({
          ...msg,
          sender_profile: msg.sender_profile || { full_name: 'Unknown', avatar_url: '' }
        })) as Message[];
        
        setMessages(typedMessages);
        
        // Mark messages as read
        if (conversation.unreadCount > 0) {
          await supabase
            .from('messages')
            .update({ read: true })
            .eq('recipient_id', user.id)
            .eq('sender_id', recipientId)
            .eq('read', false);
            
          // Update unread count in local state
          setConversations(prev => 
            prev.map(conv => 
              conv.profile.id === recipientId 
                ? { ...conv, unreadCount: 0 }
                : conv
            )
          );
        }
        
        // Set up real-time subscription
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe();
        }
        
        const channel = supabase
          .channel(`messages-${recipientId}`)
          .on('postgres_changes', 
            { 
              event: 'INSERT', 
              schema: 'public', 
              table: 'messages',
              filter: `or(and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id}))` 
            }, 
            async (payload) => {
              console.log('New message received:', payload);
              
              // Get the sender profile
              const { data: senderProfile } = await supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('id', payload.new.sender_id)
                .single();
                
              // Add new message to state
              const newMessage = {
                ...payload.new,
                sender_profile: senderProfile
              } as Message;
              
              setMessages(prev => [...prev, newMessage]);
              
              // Mark as read if we're the recipient
              if (payload.new.recipient_id === user.id) {
                await supabase
                  .from('messages')
                  .update({ read: true })
                  .eq('id', payload.new.id);
              }
              
              // Update conversations list
              fetchConversations();
            }
          )
          .subscribe();
          
        subscriptionRef.current = channel;
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  };
  
  // Send a message
  const sendMessage = async (recipientId: string, content: string) => {
    if (!user || !content.trim()) return null;
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content: content.trim(),
          read: false
        })
        .select();
        
      if (error) throw error;
      
      // No need to update messages state as the subscription will handle it
      return data?.[0] || null;
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      return null;
    }
  };
  
  // Listen for new messages
  useEffect(() => {
    if (!user) return;
    
    fetchConversations();
    
    // Set up global subscription for new conversations
    const channel = supabase
      .channel('new-messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `recipient_id.eq.${user.id}` 
        }, 
        (payload) => {
          console.log('New message notification:', payload);
          
          // Only show toast if this isn't part of the current conversation
          if (!currentConversation || currentConversation.profile.id !== payload.new.sender_id) {
            toast.info('You have a new message');
          }
          
          // Refresh conversations list
          fetchConversations();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [user]);
  
  return {
    conversations,
    messages,
    loading,
    loadingMessages,
    currentConversation,
    fetchConversations,
    fetchMessages,
    sendMessage
  };
}
