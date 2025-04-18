import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, MessageCircle, User, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { type Tables } from "@/integrations/supabase/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Profile = Tables<"profiles">;

interface Connection {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  profile: Profile;
}

export default function ConnectionsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConnections = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        const { data: sentConnections, error: sentError } = await supabase
          .from("connections")
          .select(`
            *,
            profile:profiles!recipient_id(*)
          `)
          .eq("requester_id", user.id)
          .neq("status", "rejected");

        const { data: receivedConnections, error: receivedError } = await supabase
          .from("connections")
          .select(`
            *,
            profile:profiles!requester_id(*)
          `)
          .eq("recipient_id", user.id)
          .neq("status", "rejected");

        if (sentError || receivedError) throw sentError || receivedError;

        setConnections(sentConnections as unknown as Connection[]);
        setPendingRequests(receivedConnections as unknown as Connection[]);
      } catch (error) {
        console.error("Error fetching connections:", error);
        toast.error("Failed to fetch connections");
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, [user]);

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("connections")
        .update({ status: "accepted" })
        .eq("id", requestId);

      if (error) throw error;

      // Update local state
      const acceptedRequest = pendingRequests.find(req => req.id === requestId);
      if (acceptedRequest) {
        setPendingRequests(prev => prev.filter(req => req.id !== requestId));
        setConnections(prev => [...prev, { ...acceptedRequest, status: "accepted" }]);
      }
      
      toast.success("Connection request accepted!");
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("Failed to accept request");
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("connections")
        .update({ status: "rejected" })
        .eq("id", requestId);

      if (error) throw error;

      // Update local state
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      toast.success("Connection request declined");
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to decline request");
    }
  };

  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[60vh]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading connections...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Your Network</h1>

      <Tabs defaultValue="connections" className="mb-8">
        <TabsList>
          <TabsTrigger value="connections">
            Connections ({connections.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending Requests ({pendingRequests.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="connections">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {connections.map((connection) => (
              <Card key={connection.id}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={connection.profile.avatar_url} alt={connection.profile.full_name || "User"} />
                      <AvatarFallback className="bg-slate-700 text-slate-300">
                        {connection.profile.full_name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{connection.profile.full_name}</CardTitle>
                      <CardDescription>{connection.profile.title}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {connection.profile.bio && (
                      <CardDescription className="mt-2 text-gray-600">
                        {connection.profile.bio}
                      </CardDescription>
                    )}
                    {connection.profile.skills && connection.profile.skills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {connection.profile.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {connection.profile.looking_for && connection.profile.looking_for.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-500">Interested in:</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {connection.profile.looking_for.map((interest, index) => (
                            <Badge key={index} variant="outline">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {(connection.profile.portfolio_url || connection.profile.linkedin_url) && (
                      <div className="mt-4 flex gap-4">
                        {connection.profile.portfolio_url && (
                          <a
                            href={connection.profile.portfolio_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Portfolio
                          </a>
                        )}
                        {connection.profile.linkedin_url && (
                          <a
                            href={connection.profile.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            LinkedIn Profile
                          </a>
                        )}
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-medium mb-1">Connected:</div>
                      <div className="text-sm">
                        {new Date(connection.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigate(`/profile/${connection.profile.id}`)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    View Profile
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => navigate(`/messages?userId=${connection.profile.id}`)}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            {connections.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground mb-4">You don't have any connections yet.</p>
                <Button asChild>
                  <a href="/discover">Find Collaborators</a>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="pending">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pendingRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={request.profile.avatar_url} alt={request.profile.full_name || "User"} />
                      <AvatarFallback className="bg-slate-700 text-slate-300">
                        {request.profile.full_name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{request.profile.full_name}</CardTitle>
                      <CardDescription>{request.profile.title}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {request.profile.skills && (
                      <div>
                        <div className="text-xs font-medium mb-1">Skills:</div>
                        <div className="flex flex-wrap gap-1">
                          {request.profile.skills.map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {request.profile.location && (
                      <div>
                        <div className="text-xs font-medium mb-1">Location:</div>
                        <div className="text-sm">{request.profile.location}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-medium mb-1">Request Date:</div>
                      <div className="text-sm">
                        {new Date(request.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-red-200 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleRejectRequest(request.id)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Decline
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleAcceptRequest(request.id)}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Accept
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            {pendingRequests.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">You don't have any pending connection requests.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
