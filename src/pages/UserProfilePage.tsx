import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useConnectionRequests } from "@/hooks/useConnectionRequests";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Send, UserPlus, Check, X, User, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sendConnectionRequest, checkConnectionStatus, getConnectionId, respondToRequest, refresh: refreshConnections } = useConnectionRequests();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'accepted' | 'rejected'>('none');
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState(false);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [id]);

  // Check connection status with this user
  useEffect(() => {
    if (user && id) {
      refreshConnections();
      const status = checkConnectionStatus(id);
      console.log('Connection status with user:', status);
      setConnectionStatus(status);
      
      const connId = getConnectionId(id);
      console.log('Connection ID:', connId);
      setConnectionId(connId);
    }
  }, [user, id, checkConnectionStatus, getConnectionId, refreshConnections]);

  const handleConnectRequest = async () => {
    if (!user || !profile) return;
    setProcessingAction(true);
    
    try {
      const result = await sendConnectionRequest(profile.id);
      
      if (result.error) {
        toast.error(result.error);
        setProcessingAction(false);
        return;
      }
      
      setConnectionStatus('pending');
      toast.success('Connection request sent');
      refreshConnections();
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast.error('Failed to send connection request');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleAcceptConnection = async () => {
    if (!connectionId) return;
    setProcessingAction(true);
    
    try {
      const result = await respondToRequest(connectionId, 'accepted');
      
      if (result.error) {
        toast.error(result.error);
        setProcessingAction(false);
        return;
      }
      
      setConnectionStatus('accepted');
      toast.success('Connection accepted');
      refreshConnections();
    } catch (error) {
      console.error('Error accepting connection:', error);
      toast.error('Failed to accept connection');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectConnection = async () => {
    if (!connectionId) return;
    setProcessingAction(true);
    
    try {
      const result = await respondToRequest(connectionId, 'rejected');
      
      if (result.error) {
        toast.error(result.error);
        setProcessingAction(false);
        return;
      }
      
      setConnectionStatus('rejected');
      toast.success('Connection declined');
      refreshConnections();
    } catch (error) {
      console.error('Error declining connection:', error);
      toast.error('Failed to decline connection');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleMessage = () => {
    navigate(`/messages?userId=${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>User Not Found</CardTitle>
            <CardDescription>
              The user profile you're looking for doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate(-1)} variant="outline">
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile sidebar */}
        <div className="md:w-1/3">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || "User"} />
                  <AvatarFallback className="text-2xl">
                    {profile.full_name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle>{profile.full_name || "User"}</CardTitle>
              <CardDescription className="text-md">{profile.title || ""}</CardDescription>
              
              {/* Location */}
              {profile.location && (
                <p className="text-sm text-muted-foreground mt-2">{profile.location}</p>
              )}
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Connection/Messaging Actions */}
              <div className="flex flex-col gap-3">
                {user && user.id !== profile?.id && (
                  <>
                    {connectionStatus === 'none' && (
                      <Button 
                        onClick={handleConnectRequest} 
                        disabled={processingAction}
                        className="w-full"
                      >
                        {processingAction ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Connect
                          </>
                        )}
                      </Button>
                    )}
                    
                    {connectionStatus === 'pending' && connectionId && (
                      <div className="flex flex-col gap-2">
                        <p className="text-sm text-center text-muted-foreground">This user has sent you a connection request</p>
                        <div className="flex gap-2">
                          <Button 
                            onClick={handleAcceptConnection} 
                            disabled={processingAction} 
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            {processingAction ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Accept
                              </>
                            )}
                          </Button>
                          <Button 
                            onClick={handleRejectConnection} 
                            disabled={processingAction}
                            variant="outline"
                            className="flex-1 border-red-200 hover:bg-red-50 hover:text-red-700"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {connectionStatus === 'pending' && !connectionId && (
                      <Button 
                        disabled
                        variant="outline"
                        className="w-full"
                      >
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Request Pending
                      </Button>
                    )}
                    
                    {connectionStatus === 'accepted' && (
                      <Button 
                        onClick={handleMessage} 
                        variant="default"
                        className="w-full"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                    )}
                    
                    {connectionStatus === 'rejected' && (
                      <Button 
                        onClick={handleConnectRequest} 
                        variant="outline"
                        className="w-full"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Request Connection Again
                      </Button>
                    )}
                  </>
                )}
              </div>

              {/* Links */}
              <div className="flex gap-2">
                {profile.linkedin_url && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    asChild 
                    className="flex-1"
                  >
                    <a href={profile.linkedin_url} target="_blank" rel="noreferrer">
                      LinkedIn
                    </a>
                  </Button>
                )}
                {profile.portfolio_url && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    asChild 
                    className="flex-1"
                  >
                    <a href={profile.portfolio_url} target="_blank" rel="noreferrer">
                      Portfolio
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Profile main content */}
        <div className="md:w-2/3">
          <Tabs defaultValue="about">
            <TabsList className="mb-4">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="skills">Skills & Experience</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Bio</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{profile.bio || "No bio provided."}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Interests</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.looking_for && profile.looking_for.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.looking_for.map((interest, i) => (
                        <Badge key={i} variant="secondary">{interest}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No interests specified.</p>
                  )}
                </CardContent>
              </Card>
              
              {profile.motivation && (
                <Card>
                  <CardHeader>
                    <CardTitle>Motivation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{profile.motivation}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="skills" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.skills && profile.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, i) => (
                        <Badge key={i}>{skill}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No skills specified.</p>
                  )}
                </CardContent>
              </Card>
              
              {profile.experience && (
                <Card>
                  <CardHeader>
                    <CardTitle>Experience</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{profile.experience}</p>
                  </CardContent>
                </Card>
              )}
              
              <Card>
                <CardHeader>
                  <CardTitle>Preferred Industries</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.preferred_industries && profile.preferred_industries.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.preferred_industries.map((industry, i) => (
                        <Badge key={i} variant="outline">{industry}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No preferred industries specified.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="projects">
              <Card>
                <CardHeader>
                  <CardTitle>Current Project</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.project_description ? (
                    <>
                      <p>{profile.project_description}</p>
                      {profile.project_stage && (
                        <div>
                          <p className="text-sm font-medium mb-1">Stage:</p>
                          <Badge>{profile.project_stage}</Badge>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-muted-foreground">No current project details available.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
