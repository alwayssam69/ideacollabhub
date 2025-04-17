import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Fetch conversations (connections with messages)
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;
      setLoading(true);
      
      try {
        // Get all user connections
        const { data: connectionsData, error: connectionsError } = await supabase
          .from("connections")
          .select(`
            *,
            profile:profiles!recipient_id(*)
          `)
          .eq("requester_id", user.id)
          .eq("status", "accepted");
          
        if (connectionsError) throw connectionsError;
        
        const connections = connectionsData as any[];
        
        if (!connections || connections.length === 0) {
          setLoading(false);
          return;
        }
        
        // Create array of conversation objects
        const conversationsArray: Conversation[] = [];
        
        for (const connection of connections) {
          // Get last message for this connection
          const { data: messageData } = await supabase
            .from("messages")
            .select("*")
            .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
            .or(`sender_id.eq.${connection.profile.id},recipient_id.eq.${connection.profile.id}`)
            .order("created_at", { ascending: false })
            .limit(1);
            
          // Get unread count
          const { count: unreadCount } = await supabase
            .from("messages")
            .select("*", { count: "exact" })
            .eq("recipient_id", user.id)
            .eq("sender_id", connection.profile.id)
            .eq("read", false);
            
          conversationsArray.push({
            profile: connection.profile,
            lastMessage: messageData && messageData.length > 0 ? messageData[0] : null,
            unreadCount: unreadCount || 0
          });
        }
        
        setConversations(conversationsArray);
        
        // Select the first conversation by default if there is one
        if (conversationsArray.length > 0) {
          setSelectedConversation(conversationsArray[0]);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
        toast.error("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };
    
    fetchConversations();
  }, [user]);
  
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
          await supabase
            .from("messages")
            .update({ read: true })
            .eq("recipient_id", user.id)
            .eq("sender_id", selectedConversation.profile.id)
            .eq("read", false);
            
          // Update unread count in conversations
          setConversations(prev => 
            prev.map(conv => 
              conv.profile.id === selectedConversation.profile.id 
                ? { ...conv, unreadCount: 0 }
                : conv
            )
          );
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to load messages");
      } finally {
        setLoadingMessages(false);
      }
    };
    
    fetchMessages();
  }, [user, selectedConversation]);

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
              ? { ...conv, lastMessage: messageData[0] }
              : conv
          )
        );
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

  // Empty state for no conversations
  const EmptyConversations = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Send className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-medium text-lg">No conversations yet</h3>
      <p className="text-muted-foreground text-sm mt-2 mb-4 max-w-xs">
        Connect with people to start chatting with them
      </p>
      <Button asChild>
        <a href="/discover">Find Connections</a>
      </Button>
    </div>
  );

  // Empty state for no messages
  const EmptyMessages = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Send className="h-8 w-8 text-muted-foreground" />
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
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Messages</h1>

      <div className="border rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-16rem)] shadow-md">
        {/* Conversation List */}
        <div className="border-r">
          <div className="p-4 border-b">
            <Input 
              placeholder="Search conversations..." 
              className="transition-all focus:border-primary focus:ring-primary"
            />
          </div>
          <ScrollArea className="h-[calc(100vh-16rem-65px)]">
            {loading ? (
              <ConversationSkeleton />
            ) : conversations.length > 0 ? (
              conversations.map((conversation) => (
                <div
                  key={conversation.profile.id}
                  className={cn(
                    "flex items-center gap-4 p-4 border-b hover:bg-muted cursor-pointer transition-colors",
                    selectedConversation?.profile.id === conversation.profile.id && "bg-muted"
                  )}
                  onClick={() => selectConversation(conversation)}
                >
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full overflow-hidden">
                      <Avatar className="h-full w-full border border-border/50 ring-2 ring-background">
                        <AvatarImage src={conversation.profile.avatar_url || ""} />
                        <AvatarFallback>
                          {(conversation.profile.full_name || "User")[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    {/* We don't have online status so removing this for now */}
                    {/* <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span> */}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">
                        {conversation.profile.full_name || "User"}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {conversation.lastMessage 
                          ? new Date(conversation.lastMessage.created_at).toLocaleDateString() 
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
        <div className="col-span-2 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center gap-4 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full overflow-hidden">
                    <Avatar>
                      <AvatarImage src={selectedConversation.profile.avatar_url || ""} />
                      <AvatarFallback>
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
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
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
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex animate-fade-in",
                          message.sender_id === user?.id
                            ? "justify-end"
                            : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "rounded-lg px-4 py-2 max-w-[80%] shadow-sm hover:shadow-md transition-shadow",
                            message.sender_id === user?.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
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
                            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyMessages />
                )}
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t bg-background/95 backdrop-blur-sm">
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
                    className="transition-all focus:border-primary focus:ring-primary"
                    disabled={sendingMessage}
                  />
                  <Button 
                    type="submit" 
                    size="icon"
                    disabled={sendingMessage || !newMessage.trim()}
                    className="bg-primary hover:bg-primary/90 transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">
                Select a conversation to start chatting
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
