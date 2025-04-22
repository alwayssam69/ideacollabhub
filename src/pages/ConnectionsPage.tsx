
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
import { useConnectionRequests } from "@/hooks/useConnectionRequests";

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
  const { refresh, respondToRequest } = useConnectionRequests();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchConnections = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Make sure connection data is up to date
        await refresh();
        
        const { data: sentConnections, error: sentError } = await supabase
          .from("connections")
          .select(`
            *,
            profile:profiles!recipient_id(*)
          `)
          .eq("requester_id", user.id)
          .eq("status", "accepted");

        const { data: receivedConnections, error: receivedError } = await supabase
          .from("connections")
          .select(`
            *,
            profile:profiles!requester_id(*)
          `)
          .eq("recipient_id", user.id)
          .eq("status", "accepted");
          
        const { data: pendingRequests, error: pendingError } = await supabase
          .from("connections")
          .select(`
            *,
            profile:profiles!requester_id(*)
          `)
          .eq("recipient_id", user.id)
          .eq("status", "pending");

        if (sentError || receivedError || pendingError) throw sentError || receivedError || pendingError;

        const allConnections = [
          ...(sentConnections as unknown as Connection[] || []),
          ...(receivedConnections as unknown as Connection[] || [])
        ];
        
        setConnections(allConnections);
        setPendingRequests(pendingRequests as unknown as Connection[] || []);
      } catch (error) {
        console.error("Error fetching connections:", error);
        toast.error("Failed to fetch connections");
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, [user, refresh]);

  const handleAcceptRequest = async (requestId: string) => {
    try {
      setProcessingIds(prev => [...prev, requestId]);
      
      const result = await respondToRequest(requestId, 'accepted');
      if (result.error) {
        toast.error(result.error);
        return;
      }
      
      // Update local state - move from pending to connections
      const acceptedRequest = pendingRequests.find(req => req.id === requestId);
      if (acceptedRequest) {
        setPendingRequests(prev => prev.filter(req => req.id !== requestId));
        setConnections(prev => [...prev, { ...acceptedRequest, status: "accepted" }]);
      }
      
      toast.success("Connection request accepted!");
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("Failed to accept request");
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== requestId));
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      setProcessingIds(prev => [...prev, requestId]);
      
      const result = await respondToRequest(requestId, 'rejected');
      if (result.error) {
        toast.error(result.error);
        return;
      }
      
      // Update local state
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      toast.success("Connection request declined");
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to decline request");
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== requestId));
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
                    <Avatar className="h-12 w-12 cursor-pointer" onClick={() => navigate(`/profile/${connection.profile.id}`)}>
                      <AvatarImage src={connection.profile.avatar_url} alt={connection.profile.full_name || "User"} />
                      <AvatarFallback className="bg-slate-700 text-slate-300">
                        {connection.profile.full_name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg cursor-pointer hover:text-primary" onClick={() => navigate(`/profile/${connection.profile.id}`)}>
                        {connection.profile.full_name}
                      </CardTitle>
                      <CardDescription>{connection.profile.title}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {connection.profile.bio && (
                      <CardDescription className="mt-2 text-gray-600">
                        {connection.profile.bio.length > 100 
                          ? `${connection.profile.bio.substring(0, 100)}...` 
                          : connection.profile.bio}
                      </CardDescription>
                    )}
                    {connection.profile.skills && connection.profile.skills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {connection.profile.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                        {connection.profile.skills.length > 3 && (
                          <Badge variant="outline">
                            +{connection.profile.skills.length - 3} more
                          </Badge>
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
                    <Avatar className="h-12 w-12 cursor-pointer" onClick={() => navigate(`/profile/${request.profile.id}`)}>
                      <AvatarImage src={request.profile.avatar_url} alt={request.profile.full_name || "User"} />
                      <AvatarFallback className="bg-slate-700 text-slate-300">
                        {request.profile.full_name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg cursor-pointer hover:text-primary" onClick={() => navigate(`/profile/${request.profile.id}`)}>
                        {request.profile.full_name}
                      </CardTitle>
                      <CardDescription>{request.profile.title}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {request.profile.skills && request.profile.skills.length > 0 && (
                      <div>
                        <div className="text-xs font-medium mb-1">Skills:</div>
                        <div className="flex flex-wrap gap-1">
                          {request.profile.skills.slice(0, 5).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {request.profile.skills.length > 5 && (
                            <span className="text-xs text-muted-foreground">
                              +{request.profile.skills.length - 5} more
                            </span>
                          )}
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
                    disabled={processingIds.includes(request.id)}
                  >
                    {processingIds.includes(request.id) ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <X className="mr-2 h-4 w-4" />
                    )}
                    Decline
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleAcceptRequest(request.id)}
                    disabled={processingIds.includes(request.id)}
                  >
                    {processingIds.includes(request.id) ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Check className="mr-2 h-4 w-4" />
                    )}
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
