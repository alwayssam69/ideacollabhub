
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, UserPlus, AlertCircle, MessageSquare, Search, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { useConnectionRequests } from "@/hooks/useConnectionRequests";
import { AnimatePresence, motion } from "framer-motion";

type Message = Tables<"messages"> & {
  sender_profile?: Tables<"profiles">;
  recipient_profile?: Tables<"profiles">;
};

type Conversation = {
  profile: Tables<"profiles">;
  lastMessage: Message | null;
  unreadCount: number;
};

export default function MessagesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialUserId = searchParams.get('userId');
  const { sentRequests, requests, refresh } = useConnectionRequests();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Filter conversations based on search query
  const filteredConversations = searchQuery
    ? conversations.filter(convo => 
        convo.profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : conversations;

  // Fetch conversations (connections with messages)
  const fetchConversations = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // Make sure we have the latest connections data
      await refresh();
      
      // Get all accepted connections
      const acceptedConnections = [
        ...(sentRequests || []).filter(req => req.status === 'accepted'),
        ...(requests || []).filter(req => req.status === 'accepted')
      ];
      
      // Create array of conversation objects
      const conversationsArray: Conversation[] = [];
      
      for (const connection of acceptedConnections) {
        // Determine the other user in the connection
        const otherUserId = connection.requester_id === user.id 
          ? connection.recipient_id 
          : connection.requester_id;
        
        const profile = connection.requester_id === user.id 
          ? connection.recipient 
          : connection.requester;
          
        if (!profile) continue;
        
        // Get last message for this connection
        const { data: messageData, error: messageError } = await supabase
          .from("messages")
          .select("*")
          .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
          .order("created_at", { ascending: false })
          .limit(1);
          
        if (messageError) throw messageError;
          
        // Get unread count
        const { count: unreadCount, error: countError } = await supabase
          .from("messages")
          .select("*", { count: "exact" })
          .eq("recipient_id", user.id)
          .eq("sender_id", otherUserId)
          .eq("read", false);
          
        if (countError) throw countError;
          
        conversationsArray.push({
          profile,
          lastMessage: messageData && messageData.length > 0 ? messageData[0] as Message : null,
          unreadCount: unreadCount || 0
        });
      }
      
      // Sort conversations by most recent message
      conversationsArray.sort((a, b) => {
        const dateA = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0;
        const dateB = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0;
        return dateB - dateA;
      });
      
      setConversations(conversationsArray);
      
      // Check if we should open a specific conversation from URL param
      if (initialUserId) {
        const foundProfile = conversationsArray.find(c => c.profile.id === initialUserId);
        if (foundProfile) {
          setSelectedConversation(foundProfile);
        } else {
          // If we have a userId but no conversation, try to fetch the user profile
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", initialUserId)
            .single();
            
          if (profileData) {
            // Create a new conversation for this user
            const newConvo = {
              profile: profileData,
              lastMessage: null,
              unreadCount: 0
            };
            setSelectedConversation(newConvo);
            setConversations(prev => [newConvo, ...prev]);
          }
        }
      }
      // If no initial userId but we have conversations, select the first one
      else if (conversationsArray.length > 0 && !selectedConversation) {
        setSelectedConversation(conversationsArray[0]);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  // Effect for fetching conversations
  useEffect(() => {
    fetchConversations();
  }, [user, initialUserId, sentRequests, requests, refresh]);
  
  // Fetch messages for selected conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user || !selectedConversation) return;
      setLoadingMessages(true);
      
      try {
        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select("*")
          .or(`and(sender_id.eq.${user.id},recipient_id.eq.${selectedConversation.profile.id}),and(sender_id.eq.${selectedConversation.profile.id},recipient_id.eq.${user.id})`)
          .order("created_at", { ascending: true });
          
        if (messagesError) throw messagesError;
        
        // Fix: Cast messages data with as unknown first, then as Message[]
        setMessages((messagesData || []) as unknown as Message[]);
        
        // Mark messages as read
        if (selectedConversation.unreadCount > 0) {
          const { error: updateError } = await supabase
            .from("messages")
            .update({ read: true })
            .eq("recipient_id", user.id)
            .eq("sender_id", selectedConversation.profile.id)
            .eq("read", false);
            
          if (updateError) throw updateError;
            
          // Update unread count in conversations
          setConversations(prev => 
            prev.map(conv => 
              conv.profile.id === selectedConversation.profile.id 
                ? { ...conv, unreadCount: 0 }
                : conv
            )
          );
        }
        
        // Scroll to bottom after messages load
        setTimeout(scrollToBottom, 100);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to load messages");
      } finally {
        setLoadingMessages(false);
      }
    };
    
    fetchMessages();
    
    // Set up real-time subscription for messages
    if (user && selectedConversation) {
      const channel = supabase
        .channel(`messages-${selectedConversation.profile.id}`)
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `recipient_id=eq.${user.id}` 
          }, 
          async (payload) => {
            console.log('New message received:', payload);
            
            // Only process if from current conversation
            if (payload.new && payload.new.sender_id === selectedConversation.profile.id) {
              // Add new message to state
              const newMessage = payload.new as Message;
              setMessages(prev => [...prev, newMessage]);
              
              // Mark message as read
              await supabase
                .from("messages")
                .update({ read: true })
                .eq("id", newMessage.id);
                
              // Scroll to bottom to show new message
              setTimeout(scrollToBottom, 100);
            } else {
              // If it's not from the current conversation, refresh conversations to update counts
              fetchConversations();
            }
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, selectedConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;
    setSendingMessage(true);

    try {
      // Insert new message
      const { data: messageData, error: messageError } = await supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          recipient_id: selectedConversation.profile.id,
          content: newMessage,
          read: false
        })
        .select();
        
      if (messageError) throw messageError;
      
      if (messageData && messageData[0]) {
        // Add to messages
        const newMessageWithProfiles = {
          ...messageData[0],
          sender_profile: { id: user.id } as Tables<"profiles">
        };
        
        setMessages(prev => [...prev, newMessageWithProfiles as Message]);
        
        // Update last message in conversations
        setConversations(prev => 
          prev.map(conv => 
            conv.profile.id === selectedConversation.profile.id 
              ? { ...conv, lastMessage: messageData[0] as Message }
              : conv
          )
        );
        
        // Scroll to bottom to show new message
        setTimeout(scrollToBottom, 100);
      }
      
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const selectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  // Format date for messages
  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
        ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  // Empty state for no conversations
  const EmptyConversations = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-fade-in">
      <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        <MessageSquare className="h-8 w-8 text-primary" />
      </div>
      <h3 className="font-medium text-lg">No conversations yet</h3>
      <p className="text-sm text-muted-foreground mt-2 mb-4 max-w-xs">
        Connect with people to start chatting with them
      </p>
      <Button asChild className="bg-primary hover:bg-primary/90 transition-all">
        <a href="/discover">
          <UserPlus className="mr-2 h-4 w-4" />
          Find Connections
        </a>
      </Button>
    </div>
  );

  // Empty state for no messages
  const EmptyMessages = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-fade-in">
      <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        <MessageSquare className="h-8 w-8 text-primary" />
      </div>
      <h3 className="font-medium text-lg">No messages yet</h3>
      <p className="text-muted-foreground text-sm mt-2">
        Send a message to start the conversation
      </p>
    </div>
  );

  // Loading skeleton for conversation list
  const ConversationSkeleton = () => (
    <>
      {Array(3).fill(0).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border-b">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ))}
    </>
  );

  return (
    <div className="container py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">Messages</h1>

      <div className="border rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-16rem)] shadow-md bg-card/20 backdrop-blur-md">
        {/* Conversation List */}
        <div className="border-r">
          <div className="p-4 border-b glass-effect">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input 
                placeholder="Search conversations..." 
                className="pl-9 transition-all focus:border-primary focus:ring-primary bg-background/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="h-[calc(100vh-16rem-65px)]">
            {loading ? (
              <ConversationSkeleton />
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.profile.id}
                  className={cn(
                    "flex items-center gap-4 p-4 border-b hover:bg-muted/50 cursor-pointer transition-all duration-200 hover:scale-[1.01]",
                    selectedConversation?.profile.id === conversation.profile.id && "bg-muted"
                  )}
                  onClick={() => selectConversation(conversation)}
                >
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full overflow-hidden">
                      <Avatar className="h-full w-full border border-border/50 ring-2 ring-background">
                        <AvatarImage src={conversation.profile.avatar_url || ""} />
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {(conversation.profile.full_name || "User")[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">
                        {conversation.profile.full_name || "User"}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {conversation.lastMessage 
                          ? formatMessageDate(conversation.lastMessage.created_at)
                          : ""}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessage 
                        ? conversation.lastMessage.content 
                        : "No messages yet"}
                    </p>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-xs font-medium text-white">
                        {conversation.unreadCount}
                      </span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <EmptyConversations />
            )}
          </ScrollArea>
        </div>

        {/* Message Area */}
        <div className="col-span-2 flex flex-col bg-background/50">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center gap-4 bg-background/95 backdrop-blur-sm sticky top-0 z-10 glass-effect">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full overflow-hidden">
                    <Avatar>
                      <AvatarImage src={selectedConversation.profile.avatar_url || ""} />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {(selectedConversation.profile.full_name || "User")[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">
                    {selectedConversation.profile.full_name || "User"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedConversation.profile.title || "No title"}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-auto"
                  onClick={() => navigate(`/profile/${selectedConversation.profile.id}`)}
                >
                  <User className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                {loadingMessages ? (
                  <div className="space-y-4">
                    {Array(3).fill(0).map((_, i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                        <Skeleton className={`h-16 w-64 rounded-lg ${i % 2 === 0 ? 'bg-muted' : 'bg-primary/20'}`} />
                      </div>
                    ))}
                  </div>
                ) : messages.length > 0 ? (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={cn(
                            "flex",
                            message.sender_id === user?.id
                              ? "justify-end"
                              : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "rounded-lg px-4 py-2 max-w-[80%] transition-all hover:shadow-md",
                              message.sender_id === user?.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted glass-effect"
                            )}
                          >
                            <p className="text-sm">{message.content}</p>
                            <span
                              className={cn(
                                "text-xs block text-right mt-1",
                                message.sender_id === user?.id
                                  ? "text-primary-foreground/80"
                                  : "text-muted-foreground"
                              )}
                            >
                              {formatMessageDate(message.created_at)}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <EmptyMessages />
                )}
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t bg-background/95 backdrop-blur-sm glass-effect">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="transition-all focus:border-primary focus:ring-primary bg-background/50"
                    disabled={sendingMessage}
                  />
                  <Button 
                    type="submit" 
                    size="icon"
                    disabled={sendingMessage || !newMessage.trim()}
                    className="bg-primary hover:bg-primary/90 transition-all"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 animate-fade-in">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-primary/80" />
              </div>
              <p className="text-muted-foreground text-center max-w-md">
                Select a conversation to start chatting or find new connections on the <a href="/discover" className="text-primary hover:underline">Discover page</a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
