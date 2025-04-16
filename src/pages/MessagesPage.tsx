
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Message = {
  id: number;
  content: string;
  sender: "user" | "other";
  timestamp: string;
};

type Conversation = {
  id: number;
  user: {
    id: number;
    name: string;
    image: string;
    status: "online" | "offline";
    lastSeen?: string;
  };
  messages: Message[];
  unreadCount: number;
};

// Mock conversations data
const mockConversations: Conversation[] = [
  {
    id: 1,
    user: {
      id: 1,
      name: "Alex Johnson",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      status: "online",
    },
    messages: [
      {
        id: 1,
        content: "Hey! I saw your project post about the AI task manager. I'd love to collaborate.",
        sender: "other",
        timestamp: "10:30 AM",
      },
      {
        id: 2,
        content: "Hi Alex! Thanks for reaching out. I'd love to chat about it.",
        sender: "user",
        timestamp: "10:35 AM",
      },
      {
        id: 3,
        content: "Great! What specific skills are you looking for in a collaborator?",
        sender: "other",
        timestamp: "10:36 AM",
      },
    ],
    unreadCount: 0,
  },
  {
    id: 2,
    user: {
      id: 2,
      name: "Sarah Lee",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      status: "offline",
      lastSeen: "2 hours ago",
    },
    messages: [
      {
        id: 1,
        content: "I'd like to discuss the UI design for your marketplace idea.",
        sender: "other",
        timestamp: "Yesterday",
      },
      {
        id: 2,
        content: "That would be wonderful! Do you have a portfolio I can look at?",
        sender: "user",
        timestamp: "Yesterday",
      },
    ],
    unreadCount: 1,
  },
];

export default function MessagesPage() {
  const [conversations, setConversations] = useState(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(mockConversations[0]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now(),
      content: newMessage,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedConversation = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, message],
    };

    setConversations(
      conversations.map((conv) =>
        conv.id === selectedConversation.id ? updatedConversation : conv
      )
    );
    setSelectedConversation(updatedConversation);
    setNewMessage("");
  };

  const selectConversation = (conversation: Conversation) => {
    // Mark messages as read
    const updatedConversation = {
      ...conversation,
      unreadCount: 0,
    };

    setConversations(
      conversations.map((conv) =>
        conv.id === conversation.id ? updatedConversation : conv
      )
    );
    setSelectedConversation(updatedConversation);
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Messages</h1>

      <div className="border rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-16rem)]">
        {/* Conversation List */}
        <div className="border-r">
          <div className="p-4 border-b">
            <Input placeholder="Search conversations..." />
          </div>
          <ScrollArea className="h-[calc(100vh-16rem-65px)]">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={cn(
                  "flex items-center gap-4 p-4 border-b hover:bg-muted cursor-pointer",
                  selectedConversation?.id === conversation.id && "bg-muted"
                )}
                onClick={() => selectConversation(conversation)}
              >
                <div className="relative">
                  <div className="h-12 w-12 rounded-full overflow-hidden">
                    <img
                      src={conversation.user.image}
                      alt={conversation.user.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {conversation.user.status === "online" && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium truncate">
                      {conversation.user.name}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {conversation.messages.length > 0
                        ? conversation.messages[
                            conversation.messages.length - 1
                          ].timestamp
                        : ""}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.messages.length > 0
                      ? conversation.messages[
                          conversation.messages.length - 1
                        ].content
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
            ))}
          </ScrollArea>
        </div>

        {/* Message Area */}
        <div className="col-span-2 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center gap-4">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full overflow-hidden">
                    <img
                      src={selectedConversation.user.image}
                      alt={selectedConversation.user.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {selectedConversation.user.status === "online" && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white"></span>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">
                    {selectedConversation.user.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedConversation.user.status === "online"
                      ? "Online"
                      : `Last seen ${selectedConversation.user.lastSeen}`}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {selectedConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.sender === "user"
                          ? "justify-end"
                          : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-lg px-4 py-2 max-w-[80%]",
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                        <span
                          className={cn(
                            "text-xs block text-right mt-1",
                            message.sender === "user"
                              ? "text-primary-foreground/80"
                              : "text-muted-foreground"
                          )}
                        >
                          {message.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t">
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
                  />
                  <Button type="submit" size="icon">
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
