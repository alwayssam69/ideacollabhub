
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Calendar, ChevronRight, MessageCircle, User, Users } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type Connection = Tables<"connections">;

export default function DashboardPage() {
  const { user } = useAuth();
  const [profileCompleteness, setProfileCompleteness] = useState(0);
  const [activeStreak, setActiveStreak] = useState(0);
  const [responseStreak, setResponseStreak] = useState(0);
  const [messagesSent, setMessagesSent] = useState(0);
  const [recentConnections, setRecentConnections] = useState<(Connection & { profile: Profile })[]>([]);
  const [dailySuggestions, setDailySuggestions] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<{ id: string, title: string, content: string, time: string }[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        // Fetch profile to calculate completeness
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) {
          // Calculate profile completeness based on filled fields
          const totalFields = Object.keys(profile).length;
          const filledFields = Object.values(profile).filter(val => val !== null && val !== '').length;
          setProfileCompleteness(Math.round((filledFields / totalFields) * 100));
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

        // Fetch daily match suggestions (random profiles for now)
        const { data: suggestions } = await supabase
          .from("profiles")
          .select("*")
          .neq("id", user.id)
          .limit(3);

        if (suggestions) {
          setDailySuggestions(suggestions);
        }

        // Fetch message stats
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact" })
          .eq("sender_id", user.id);

        if (count) {
          setMessagesSent(count);
        }

        // Set dummy streaks data
        setActiveStreak(Math.floor(Math.random() * 10) + 1);
        setResponseStreak(Math.floor(Math.random() * 5) + 1);

        // Set dummy notifications
        setNotifications([
          {
            id: "1",
            title: "New Connection",
            content: "Someone accepted your connection request",
            time: "2 hours ago"
          },
          {
            id: "2",
            title: "New Message",
            content: "You have a new message from a connection",
            time: "Yesterday"
          }
        ]);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Stats Section */}
        <div className="md:col-span-2 space-y-6">
          <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-indigo-900 to-blue-800">
            <CardHeader className="text-white pb-2">
              <CardTitle className="text-xl">Your Progress</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white pb-4">
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">{activeStreak}</div>
                <div className="text-sm text-blue-100">Days Active</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">{responseStreak}</div>
                <div className="text-sm text-blue-100">Response Streak</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">{messagesSent}</div>
                <div className="text-sm text-blue-100">Messages Sent</div>
              </div>
            </CardContent>
            <CardFooter className="bg-white/10 p-4">
              <div className="w-full space-y-1">
                <div className="flex justify-between text-xs text-white">
                  <span>Profile Completion</span>
                  <span>{profileCompleteness}%</span>
                </div>
                <Progress value={profileCompleteness} className="h-2" />
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Daily Match Suggestions</CardTitle>
              <CardDescription>People you might want to connect with</CardDescription>
            </CardHeader>
            <CardContent>
              {dailySuggestions.length > 0 ? (
                <div className="space-y-4">
                  {dailySuggestions.map((profile) => (
                    <HoverCard key={profile.id}>
                      <HoverCardTrigger asChild>
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer">
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarImage src={profile.avatar_url || ""} />
                              <AvatarFallback>{profile.full_name?.substring(0, 2) || "U"}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">{profile.full_name}</h4>
                              <p className="text-sm text-muted-foreground">{profile.title || "No title"}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="flex justify-between space-x-4">
                          <Avatar>
                            <AvatarImage src={profile.avatar_url || ""} />
                            <AvatarFallback>{profile.full_name?.substring(0, 2) || "U"}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold">{profile.full_name}</h4>
                            <p className="text-sm">{profile.title}</p>
                            <div className="flex items-center pt-2">
                              {profile.skills && profile.skills.length > 0 ? (
                                <div className="text-xs text-muted-foreground">
                                  Skills: {profile.skills.slice(0, 3).join(", ")}
                                  {profile.skills.length > 3 && "..."}
                                </div>
                              ) : (
                                <div className="text-xs text-muted-foreground">No skills listed</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No match suggestions available right now</p>
                  <p className="text-sm mt-2">Check back later for new suggestions</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <a href="/discover">See All Suggestions</a>
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Sidebar Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="border-b pb-3 last:border-0 last:pb-0">
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No new notifications</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full">View All</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Recent Connections
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentConnections.length > 0 ? (
                <div className="space-y-4">
                  {recentConnections.map((connection) => (
                    <div key={connection.id} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={connection.profile.avatar_url || ""} />
                        <AvatarFallback>
                          {connection.profile.full_name?.substring(0, 2) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{connection.profile.full_name}</p>
                        <p className="text-xs text-muted-foreground">Connected recently</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No connections yet</p>
                  <Button variant="link" asChild className="mt-2 p-0">
                    <a href="/discover">Find people to connect with</a>
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <a href="/connections">All Connections</a>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Activity Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Profile Views</span>
                  </div>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Messages</span>
                  </div>
                  <span className="font-medium">{messagesSent}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Connection Requests</span>
                  </div>
                  <span className="font-medium">2</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
