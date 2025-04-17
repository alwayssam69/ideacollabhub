import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, ChevronRight, Edit, ExternalLink, Eye, MessageSquare, User, UserCheck, UserPlus, Users } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { toast } from "sonner";
import { Link } from "react-router-dom";

type Profile = Tables<"profiles">;
type Connection = Tables<"connections">;

export default function DashboardPage() {
  const { user } = useAuth();
  const [lastActive, setLastActive] = useState<string | null>(null);
  const [availability, setAvailability] = useState<string>("Available");
  const [connections, setConnections] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [profileViews, setProfileViews] = useState(0);
  const [connectionRequests, setConnectionRequests] = useState<Profile[]>([]);
  const [recentConnections, setRecentConnections] = useState<(Connection & { profile: Profile })[]>([]);
  const [notifications, setNotifications] = useState<{ id: string, type: string, content: string, time: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        // Simulate real data fetching
        setLastActive("2 hours ago");
        
        // Fetch connections count
        const { count: connectionsCount } = await supabase
          .from("connections")
          .select("*", { count: "exact" })
          .eq("requester_id", user.id)
          .eq("status", "accepted");
          
        if (connectionsCount !== null) {
          setConnections(connectionsCount);
        }

        // Fetch pending requests count
        const { count: pendingCount } = await supabase
          .from("connections")
          .select("*", { count: "exact" })
          .eq("recipient_id", user.id)
          .eq("status", "pending");
          
        if (pendingCount !== null) {
          setPendingRequests(pendingCount);
        }

        // Fetch unread messages count
        const { count: messagesCount } = await supabase
          .from("messages")
          .select("*", { count: "exact" })
          .eq("recipient_id", user.id)
          .eq("read", false);
          
        if (messagesCount !== null) {
          setUnreadMessages(messagesCount);
        }

        // Simulate profile views
        setProfileViews(Math.floor(Math.random() * 20) + 5);

        // Fetch pending connection requests
        const { data: pendingRequests } = await supabase
          .from("connections")
          .select(`
            *,
            profiles!requester_id(*)
          `)
          .eq("recipient_id", user.id)
          .eq("status", "pending")
          .limit(3);
          
        if (pendingRequests) {
          // Extract just the profile data
          const profiles = pendingRequests.map(request => request.profiles);
          setConnectionRequests(profiles as unknown as Profile[]);
        }

        // Fetch recent connections
        const { data: connections } = await supabase
          .from("connections")
          .select(`
            *,
            profile:profiles!recipient_id(*)
          `)
          .eq("requester_id", user.id)
          .eq("status", "accepted")
          .order("created_at", { ascending: false })
          .limit(3);

        if (connections) {
          setRecentConnections(connections as any);
        }

        // Set demo notifications
        setNotifications([
          { id: "1", type: "connection", content: "John Doe accepted your connection request", time: "2 hours ago" },
          { id: "2", type: "message", content: "You have a new message from Sarah Smith", time: "Yesterday" },
          { id: "3", type: "profile", content: "Your profile was viewed by 3 people", time: "3 days ago" }
        ]);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const acceptConnectionRequest = async (profileId: string) => {
    // Handle accepting connection request
    try {
      await supabase
        .from("connections")
        .update({ status: "accepted" })
        .eq("requester_id", profileId)
        .eq("recipient_id", user?.id);
        
      // Refresh connection requests
      const updatedRequests = connectionRequests.filter(profile => profile.id !== profileId);
      setConnectionRequests(updatedRequests);
      setPendingRequests(prev => prev - 1);
      setConnections(prev => prev + 1);
      
      toast.success("Connection accepted");
    } catch (error) {
      console.error("Error accepting connection:", error);
      toast.error("Failed to accept connection");
    }
  };

  const declineConnectionRequest = async (profileId: string) => {
    // Handle declining connection request
    try {
      await supabase
        .from("connections")
        .update({ status: "rejected" })
        .eq("requester_id", profileId)
        .eq("recipient_id", user?.id);
        
      // Refresh connection requests
      const updatedRequests = connectionRequests.filter(profile => profile.id !== profileId);
      setConnectionRequests(updatedRequests);
      setPendingRequests(prev => prev - 1);
      
      toast.success("Connection declined");
    } catch (error) {
      console.error("Error declining connection:", error);
      toast.error("Failed to decline connection");
    }
  };

  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      {/* Section A: Top Summary Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}!
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <Badge variant="outline" className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
              {availability}
            </Badge>
            <p className="text-muted-foreground text-sm">Last active: {lastActive}</p>
          </div>
        </div>
        <Button className="mt-3 sm:mt-0" size="sm" variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      {/* Section B: Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Connections</p>
                <h3 className="text-2xl font-bold mt-1">{connections}</h3>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                <h3 className="text-2xl font-bold mt-1">{pendingRequests}</h3>
              </div>
              <div className="bg-amber-500/10 p-3 rounded-full">
                <UserPlus className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unread Messages</p>
                <h3 className="text-2xl font-bold mt-1">{unreadMessages}</h3>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-full">
                <MessageSquare className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Profile Views</p>
                <h3 className="text-2xl font-bold mt-1">{profileViews}</h3>
              </div>
              <div className="bg-purple-500/10 p-3 rounded-full">
                <Eye className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Connection Requests and CTA */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section C: New Connection Requests */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>New Connection Requests</CardTitle>
                {pendingRequests > 0 && (
                  <Button variant="link" size="sm" asChild className="p-0">
                    <Link to="/pending-requests">
                      View All
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                )}
              </div>
              <CardDescription>People who want to connect with you</CardDescription>
            </CardHeader>
            <CardContent>
              {connectionRequests.length > 0 ? (
                <div className="space-y-4">
                  {connectionRequests.map((profile) => (
                    <div 
                      key={profile.id} 
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={profile.avatar_url || ""} />
                          <AvatarFallback>{profile.full_name?.substring(0, 2) || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{profile.full_name}</p>
                          <p className="text-sm text-muted-foreground">{profile.title || "No title"}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {profile.skills?.slice(0, 3).map((skill, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => declineConnectionRequest(profile.id)}
                        >
                          Decline
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => acceptConnectionRequest(profile.id)}
                        >
                          Accept
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserCheck className="mx-auto h-12 w-12 text-muted-foreground/30" />
                  <h3 className="mt-2 font-medium text-lg">No new requests</h3>
                  <p className="text-sm text-muted-foreground">
                    When someone wants to connect, they'll appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section F: CTA Banner */}
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-xl font-semibold">Not finding what you need?</h3>
                  <p className="text-muted-foreground">
                    Update your filters or explore new connections.
                  </p>
                </div>
                <Button asChild>
                  <Link to="/discover">
                    Find Connections
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Section D: Recent Connections */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Recent Connections</CardTitle>
                {connections > 0 && (
                  <Button variant="link" size="sm" asChild className="p-0">
                    <Link to="/connections">
                      View All
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                )}
              </div>
              <CardDescription>Your newly connected peers</CardDescription>
            </CardHeader>
            <CardContent>
              {recentConnections.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-4">
                  {recentConnections.map((connection) => (
                    <div 
                      key={connection.id} 
                      className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors flex flex-col"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={connection.profile.avatar_url || ""} />
                          <AvatarFallback>
                            {connection.profile.full_name?.substring(0, 2) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{connection.profile.full_name}</p>
                          <p className="text-xs text-muted-foreground">{connection.profile.title || "No title"}</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-xs text-muted-foreground mb-2">
                          {connection.profile.skills && connection.profile.skills.length > 0 ? (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {connection.profile.skills.slice(0, 2).map((skill, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {connection.profile.skills.length > 2 && (
                                <span className="text-xs text-muted-foreground">+{connection.profile.skills.length - 2} more</span>
                              )}
                            </div>
                          ) : (
                            <span>No skills listed</span>
                          )}
                        </div>
                        <Button size="sm" variant="outline" className="w-full" asChild>
                          <Link to="/messages">
                            <MessageSquare className="mr-1 h-3 w-3" />
                            Message
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground/30" />
                  <h3 className="mt-2 font-medium text-lg">No connections yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Start connecting with others to see them here.
                  </p>
                  <Button variant="link" className="mt-2" asChild>
                    <Link to="/discover">Find people to connect with</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Notifications */}
        <div>
          {/* Section E: Notifications */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CardTitle>Notifications</CardTitle>
                  {notifications.length > 0 && (
                    <Badge className="ml-2 bg-primary">{notifications.length}</Badge>
                  )}
                </div>
                <Button variant="link" size="sm" className="p-0" asChild>
                  <Link to="/notifications">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {notifications.length > 0 ? (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-3 hover:bg-accent/5 rounded-md">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full 
                          ${notification.type === 'connection' ? 'bg-green-500/10' : 
                            notification.type === 'message' ? 'bg-blue-500/10' : 'bg-amber-500/10'}`}>
                          {notification.type === 'connection' ? (
                            <UserCheck className={`h-4 w-4 ${notification.type === 'connection' ? 'text-green-500' : 
                              notification.type === 'message' ? 'text-blue-500' : 'text-amber-500'}`} />
                          ) : notification.type === 'message' ? (
                            <MessageSquare className="h-4 w-4 text-blue-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{notification.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="mx-auto h-12 w-12 text-muted-foreground/30" />
                  <h3 className="mt-2 font-medium">No notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Stay tuned for updates and alerts.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity summary */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Summary</CardTitle>
              <CardDescription>Your recent platform activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Profile Completion</span>
                  </div>
                  <span className="font-medium">75%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Connection Rate</span>
                  </div>
                  <span className="font-medium">85%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MessageSquare className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Response Time</span>
                  </div>
                  <span className="font-medium">2 hours</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
