
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

type Notification = {
  id: string;
  type: 'connection' | 'message' | 'profile';
  content: string;
  time: string;
  read: boolean;
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch notifications (mock data for now)
    const fetchNotifications = () => {
      try {
        // In a real app, this would be a Supabase query
        const mockNotifications: Notification[] = [
          { 
            id: "1", 
            type: "connection", 
            content: "John Doe accepted your connection request", 
            time: "2 hours ago",
            read: false 
          },
          { 
            id: "2", 
            type: "message", 
            content: "You have a new message from Sarah Smith", 
            time: "Yesterday",
            read: false 
          },
          { 
            id: "3", 
            type: "profile", 
            content: "Your profile was viewed by 3 people", 
            time: "3 days ago",
            read: true 
          },
          { 
            id: "4", 
            type: "connection", 
            content: "Michael Johnson wants to connect with you", 
            time: "4 days ago",
            read: true 
          },
          { 
            id: "5", 
            type: "message", 
            content: "Emma Wilson replied to your message", 
            time: "1 week ago",
            read: true 
          }
        ];
        
        setNotifications(mockNotifications);
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
      <div className="container py-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
          className="mt-3 sm:mt-0"
          onClick={markAllAsRead}
          disabled={getUnreadCount() === 0}
        >
          Mark all as read
        </Button>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread {getUnreadCount() > 0 && `(${getUnreadCount()})`}</TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            <CardContent className="p-0">
              {notifications.length > 0 ? (
                <div>
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-4 border-b last:border-0 hover:bg-accent/5 ${!notification.read ? 'bg-primary/5' : ''}`}
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
                            >
                              Mark as read
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground/30" />
                  <h3 className="mt-4 text-lg font-medium">No notifications</h3>
                  <p className="text-sm text-muted-foreground mt-1">You're all caught up!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="unread">
          <Card>
            <CardContent className="p-0">
              {unreadNotifications.length > 0 ? (
                <div>
                  {unreadNotifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className="p-4 border-b last:border-0 hover:bg-accent/5 bg-primary/5"
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
                          >
                            Mark as read
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground/30" />
                  <h3 className="mt-4 text-lg font-medium">No unread notifications</h3>
                  <p className="text-sm text-muted-foreground mt-1">You're all caught up!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="read">
          <Card>
            <CardContent className="p-0">
              {readNotifications.length > 0 ? (
                <div>
                  {readNotifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className="p-4 border-b last:border-0 hover:bg-accent/5"
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
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground/30" />
                  <h3 className="mt-4 text-lg font-medium">No read notifications</h3>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
