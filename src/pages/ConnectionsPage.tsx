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
import { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type Connection = Tables<"connections"> & {
  profile: Profile;
};

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
        
        // Fetch accepted connections
        const { data: acceptedConnections, error: acceptedError } = await supabase
          .from("connections")
          .select(`
            *,
            profile:profiles!recipient_id(*)
          `)
          .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .eq("status", "accepted");

        if (acceptedError) throw acceptedError;

        // Fetch pending requests received
        const { data: pendingRequests, error: pendingError } = await supabase
          .from("connections")
          .select(`
            *,
            profile:profiles!requester_id(*)
          `)
          .eq("recipient_id", user.id)
          .eq("status", "pending");

        if (pendingError) throw pendingError;

        setConnections(acceptedConnections as Connection[]);
        setPendingRequests(pendingRequests as Connection[]);
      } catch (error) {
        console.error("Error fetching connections:", error);
        toast.error("Failed to load connections");
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
                    <div className="h-12 w-12 rounded-full overflow-hidden">
                      <img
                        src={connection.profile.avatar_url || "/default-avatar.png"}
                        alt={connection.profile.full_name || "User"}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{connection.profile.full_name}</CardTitle>
                      <CardDescription>{connection.profile.title}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {connection.profile.skills && (
                      <div>
                        <div className="text-xs font-medium mb-1">Skills:</div>
                        <div className="flex flex-wrap gap-1">
                          {connection.profile.skills.map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {connection.profile.location && (
                      <div>
                        <div className="text-xs font-medium mb-1">Location:</div>
                        <div className="text-sm">{connection.profile.location}</div>
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
                    <div className="h-12 w-12 rounded-full overflow-hidden">
                      <img
                        src={request.profile.avatar_url || "/default-avatar.png"}
                        alt={request.profile.full_name || "User"}
                        className="h-full w-full object-cover"
                      />
                    </div>
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
