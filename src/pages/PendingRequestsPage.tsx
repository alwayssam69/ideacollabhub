import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, Loader2, UserPlus, X } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Profile = Tables<"profiles">;
type Connection = Tables<"connections"> & {
  profiles: Profile;
};

export default function PendingRequestsPage() {
  const { user } = useAuth();
  const [incomingRequests, setIncomingRequests] = useState<Connection[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<Connection[]>([]);
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPendingRequests = async () => {
      if (!user) return;
      
      try {
        // Fetch incoming connection requests (requests sent to you)
        const { data: incoming, error: incomingError } = await supabase
          .from("connections")
          .select(`
            *,
            profiles!requester_id(*)
          `)
          .eq("recipient_id", user.id)
          .eq("status", "pending");
          
        if (incomingError) throw incomingError;
        
        // Fetch outgoing connection requests (requests sent by you)
        const { data: outgoing, error: outgoingError } = await supabase
          .from("connections")
          .select(`
            *,
            profiles!recipient_id(*)
          `)
          .eq("requester_id", user.id)
          .eq("status", "pending");
          
        if (outgoingError) throw outgoingError;
        
        console.log("Fetched incoming requests:", incoming);
        console.log("Fetched outgoing requests:", outgoing);
        
        setIncomingRequests(incoming as unknown as Connection[]);
        setOutgoingRequests(outgoing as unknown as Connection[]);
      } catch (error) {
        console.error("Error fetching connection requests:", error);
        toast.error("Failed to load connection requests");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPendingRequests();
    
    // Set up a realtime subscription to keep the requests up-to-date
    const channel = supabase
      .channel('connections-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'connections',
          filter: `or(recipient_id=eq.${user?.id},requester_id=eq.${user?.id})` 
        }, 
        (payload) => {
          console.log('Connection change in PendingRequestsPage:', payload);
          fetchPendingRequests();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  const handleAccept = async (connectionId: string) => {
    try {
      setProcessingIds(prev => [...prev, connectionId]);
      
      const { error } = await supabase
        .from("connections")
        .update({ status: "accepted", updated_at: new Date().toISOString() })
        .eq("id", connectionId);
      
      if (error) throw error;
      
      // Update local state
      setIncomingRequests(prev => prev.filter(req => req.id !== connectionId));
      toast.success("Connection request accepted");
    } catch (error) {
      console.error("Error accepting connection:", error);
      toast.error("Failed to accept connection");
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== connectionId));
    }
  };
  
  const handleDecline = async (connectionId: string) => {
    try {
      setProcessingIds(prev => [...prev, connectionId]);
      
      const { error } = await supabase
        .from("connections")
        .update({ status: "rejected", updated_at: new Date().toISOString() })
        .eq("id", connectionId);
      
      if (error) throw error;
      
      // Update local state
      setIncomingRequests(prev => prev.filter(req => req.id !== connectionId));
      toast.success("Connection request declined");
    } catch (error) {
      console.error("Error declining connection:", error);
      toast.error("Failed to decline connection");
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== connectionId));
    }
  };
  
  const handleCancel = async (connectionId: string) => {
    try {
      setProcessingIds(prev => [...prev, connectionId]);
      
      const { error } = await supabase
        .from("connections")
        .delete()
        .eq("id", connectionId);
      
      if (error) throw error;
      
      // Update local state
      setOutgoingRequests(prev => prev.filter(req => req.id !== connectionId));
      toast.success("Connection request cancelled");
    } catch (error) {
      console.error("Error cancelling connection:", error);
      toast.error("Failed to cancel connection request");
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== connectionId));
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
      <h1 className="text-3xl font-bold mb-6">Pending Requests</h1>
      
      <Tabs defaultValue="incoming" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="incoming">
            Incoming {incomingRequests.length > 0 && `(${incomingRequests.length})`}
          </TabsTrigger>
          <TabsTrigger value="outgoing">
            Outgoing {outgoingRequests.length > 0 && `(${outgoingRequests.length})`}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="incoming">
          <Card>
            <CardHeader>
              <CardTitle>Incoming Connection Requests</CardTitle>
              <CardDescription>People who want to connect with you</CardDescription>
            </CardHeader>
            <CardContent>
              {incomingRequests.length > 0 ? (
                <div className="space-y-4">
                  {incomingRequests.map((request) => (
                    <div 
                      key={request.id} 
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-start md:items-center gap-4 mb-4 md:mb-0">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.profiles.avatar_url || ""} />
                          <AvatarFallback>{request.profiles.full_name?.substring(0, 2) || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{request.profiles.full_name}</p>
                          <p className="text-sm text-muted-foreground">{request.profiles.title || "No title"}</p>
                          {request.profiles.skills && request.profiles.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {request.profiles.skills.slice(0, 3).map((skill, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {request.profiles.skills.length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                  +{request.profiles.skills.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 self-end md:self-center">
                        <Button 
                          variant="outline" 
                          className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleDecline(request.id)}
                          disabled={processingIds.includes(request.id)}
                        >
                          {processingIds.includes(request.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <X className="h-4 w-4 mr-1" />
                          )}
                          Decline
                        </Button>
                        <Button 
                          onClick={() => handleAccept(request.id)}
                          disabled={processingIds.includes(request.id)}
                        >
                          {processingIds.includes(request.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <Check className="h-4 w-4 mr-1" />
                          )}
                          Accept
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <UserPlus className="mx-auto h-12 w-12 text-muted-foreground/30" />
                  <h3 className="mt-4 text-lg font-medium">No pending requests</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    When someone sends you a connection request, it will appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="outgoing">
          <Card>
            <CardHeader>
              <CardTitle>Outgoing Connection Requests</CardTitle>
              <CardDescription>People you've invited to connect</CardDescription>
            </CardHeader>
            <CardContent>
              {outgoingRequests.length > 0 ? (
                <div className="space-y-4">
                  {outgoingRequests.map((request) => (
                    <div 
                      key={request.id} 
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-start md:items-center gap-4 mb-4 md:mb-0">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.profiles.avatar_url || ""} />
                          <AvatarFallback>{request.profiles.full_name?.substring(0, 2) || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{request.profiles.full_name}</p>
                          <p className="text-sm text-muted-foreground">{request.profiles.title || "No title"}</p>
                          {request.profiles.skills && request.profiles.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {request.profiles.skills.slice(0, 3).map((skill, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {request.profiles.skills.length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                  +{request.profiles.skills.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Sent {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div>
                        <Button 
                          variant="outline"
                          onClick={() => handleCancel(request.id)}
                          disabled={processingIds.includes(request.id)}
                        >
                          {processingIds.includes(request.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : "Cancel Request"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <UserPlus className="mx-auto h-12 w-12 text-muted-foreground/30" />
                  <h3 className="mt-4 text-lg font-medium">No outgoing requests</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    You haven't sent any connection requests yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
