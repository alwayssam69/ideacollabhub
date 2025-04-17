
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { 
  Eye, 
  MessageSquare, 
  UserCheck, 
  Trash2,
  Bell
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

type Notification = {
  id: string;
  type: 'connection' | 'message' | 'profile';
  content: string;
  time: string;
  read: boolean;
};

// Empty state component
const EmptyState = ({ icon: Icon, title, description }: { 
  icon: any, 
  title: string, 
  description: string 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
      <Icon className="h-12 w-12 text-muted-foreground/30" />
      <h3 className="mt-4 text-lg font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  );
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      
      try {
        // In a real app, we would have a notifications table
        // For now we'll set an empty array to show the empty state
        setNotifications([]);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        toast.error("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, [user]);
  
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    toast.success("Notification marked as read");
  };
  
  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    toast.success("Notification deleted");
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
    toast.success("All notifications marked as read");
  };
  
  const getUnreadCount = () => notifications.filter(n => !n.read).length;
  
  const getIcon = (type: string) => {
    switch(type) {
      case 'connection':
        return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'message':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      default:
        return <Eye className="h-4 w-4 text-amber-500" />;
    }
  };
  
  const getBgColor = (type: string) => {
    switch(type) {
      case 'connection':
        return 'bg-green-500/10';
      case 'message':
        return 'bg-blue-500/10';
      default:
        return 'bg-amber-500/10';
    }
  };
  
  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-3xl font-bold">Notifications</h1>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-start gap-3 pb-4 border-b last:border-0">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);
  
  return (
    <div className="container py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold">Notifications</h1>
          {getUnreadCount() > 0 && (
            <span className="ml-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
              {getUnreadCount()} unread
            </span>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-3 sm:mt-0 hover-scale transition-colors"
          onClick={markAllAsRead}
          disabled={getUnreadCount() === 0}
        >
          Mark all as read
        </Button>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all" className="transition-all">All</TabsTrigger>
          <TabsTrigger value="unread" className="transition-all">Unread {getUnreadCount() > 0 && `(${getUnreadCount()})`}</TabsTrigger>
          <TabsTrigger value="read" className="transition-all">Read</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="animate-fade-in">
          <Card className="border border-border/50 hover:shadow-md transition-all">
            <CardContent className="p-0">
              {notifications.length > 0 ? (
                <div>
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-4 border-b last:border-0 hover:bg-accent/5 transition-all ${!notification.read ? 'bg-primary/5' : ''}`}
                    >
                      <div className="flex items-start">
                        <div className={`p-2 rounded-full mr-3 ${getBgColor(notification.type)}`}>
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <p className={`${!notification.read ? 'font-medium' : ''}`}>
                            {notification.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                        </div>
                        <div className="flex space-x-1">
                          {!notification.read && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => markAsRead(notification.id)}
                              className="hover:bg-primary/10 transition-colors"
                            >
                              Mark as read
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteNotification(notification.id)}
                            className="hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon={Bell}
                  title="No notifications"
                  description="You're all caught up!"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="unread" className="animate-fade-in">
          <Card className="border border-border/50 hover:shadow-md transition-all">
            <CardContent className="p-0">
              {unreadNotifications.length > 0 ? (
                <div>
                  {unreadNotifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className="p-4 border-b last:border-0 hover:bg-accent/5 bg-primary/5 transition-all"
                    >
                      <div className="flex items-start">
                        <div className={`p-2 rounded-full mr-3 ${getBgColor(notification.type)}`}>
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            {notification.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                        </div>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => markAsRead(notification.id)}
                            className="hover:bg-primary/10 transition-colors"
                          >
                            Mark as read
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteNotification(notification.id)}
                            className="hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon={Bell}
                  title="No unread notifications"
                  description="You're all caught up!"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="read" className="animate-fade-in">
          <Card className="border border-border/50 hover:shadow-md transition-all">
            <CardContent className="p-0">
              {readNotifications.length > 0 ? (
                <div>
                  {readNotifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className="p-4 border-b last:border-0 hover:bg-accent/5 transition-all"
                    >
                      <div className="flex items-start">
                        <div className={`p-2 rounded-full mr-3 ${getBgColor(notification.type)}`}>
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <p>
                            {notification.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                        </div>
                        <div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteNotification(notification.id)}
                            className="hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon={Bell}
                  title="No read notifications"
                  description=""
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
