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
import { Check, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useDiscoverProfiles } from "@/hooks/useDiscoverProfiles";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tables } from "@/integrations/supabase/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin } from "lucide-react";
import { useConnectionRequests } from "@/hooks/useConnectionRequests";

const EmptyDiscoverState = () => (
  <div className="text-center py-16 px-6 bg-muted/20 rounded-lg animate-fade-in">
    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
      <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold mb-2">No profiles to discover</h3>
    <p className="text-muted-foreground max-w-sm mx-auto mb-6">
      We're currently building our network. Check back soon for new connections!
    </p>
  </div>
);

type Profile = Tables<"profiles">;

const ProfileCard = ({ profile }: { profile: Profile }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showFullProfile, setShowFullProfile] = useState(false);
  const { sendConnectionRequest, checkConnectionStatus } = useConnectionRequests();
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'accepted' | 'rejected'>('none');

  useEffect(() => {
    if (user) {
      setConnectionStatus(checkConnectionStatus(profile.id));
    }
  }, [user, profile.id, checkConnectionStatus]);

  const handleConnectionRequest = async () => {
    if (!user) {
      toast.error("Please sign in to send connection requests");
      return;
    }

    if (connectionStatus !== 'none') {
      toast.error("A connection request already exists");
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendConnectionRequest(profile.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        setConnectionStatus('pending');
        toast.success("Connection request sent!");
      }
    } catch (error) {
      console.error("Error sending connection request:", error);
      toast.error("Failed to send connection request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback>{profile.full_name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{profile.full_name}</CardTitle>
            <CardDescription>{profile.title || profile.stage}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {profile.bio && (
            <p className="text-sm text-muted-foreground">{profile.bio}</p>
          )}
          
          {profile.project_description && (
            <div>
              <h4 className="text-sm font-medium mb-1">Project</h4>
              <p className="text-sm text-muted-foreground">{profile.project_description}</p>
            </div>
          )}

          {profile.skills && profile.skills.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-1">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {profile.location && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              {profile.location}
            </div>
          )}

          {profile.looking_for && profile.looking_for.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-1">Looking For</h4>
              <div className="flex flex-wrap gap-2">
                {profile.looking_for.map((item) => (
                  <Badge key={item} variant="outline">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setShowFullProfile(true)}
        >
          View Profile
        </Button>
        <Button
          onClick={handleConnectionRequest}
          disabled={isLoading || connectionStatus !== 'none'}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : connectionStatus === 'pending' ? (
            "Request Sent"
          ) : connectionStatus === 'accepted' ? (
            "Connected"
          ) : (
            "Connect"
          )}
        </Button>
      </CardFooter>

      {showFullProfile && (
        <Dialog open={showFullProfile} onOpenChange={setShowFullProfile}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Full Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback>{profile.full_name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{profile.full_name}</h2>
                  <p className="text-muted-foreground">{profile.title || profile.stage}</p>
                </div>
              </div>

              {profile.bio && (
                <div>
                  <h3 className="font-medium mb-2">About</h3>
                  <p className="text-muted-foreground">{profile.bio}</p>
                </div>
              )}

              {profile.project_description && (
                <div>
                  <h3 className="font-medium mb-2">Project</h3>
                  <p className="text-muted-foreground">{profile.project_description}</p>
                  {profile.project_stage && (
                    <Badge className="mt-2">{profile.project_stage}</Badge>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {profile.skills && profile.skills.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.looking_for && profile.looking_for.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Looking For</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.looking_for.map((item) => (
                        <Badge key={item} variant="outline">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {profile.motivation && (
                <div>
                  <h3 className="font-medium mb-2">Motivation</h3>
                  <p className="text-muted-foreground">{profile.motivation}</p>
                </div>
              )}

              <div className="flex space-x-4">
                {profile.linkedin_url && (
                  <Button variant="outline" asChild>
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                      LinkedIn
                    </a>
                  </Button>
                )}
                {profile.portfolio_url && (
                  <Button variant="outline" asChild>
                    <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer">
                      Portfolio
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default function DiscoverPage() {
  const { profiles, loading, error, refetchProfiles } = useDiscoverProfiles();
  const { user } = useAuth();
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<"left" | "right" | "">("");
  const { sendConnectionRequest } = useConnectionRequests();

  useEffect(() => {
    if (animationDirection) {
      const timer = setTimeout(() => {
        setAnimationDirection("");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [animationDirection]);

  const handleConnectionRequest = async (recipientId: string, action: 'accept' | 'reject') => {
    if (!user) {
      toast.error('You must be logged in to send connection requests');
      return;
    }

    setActionLoading(true);
    try {
      setAnimationDirection(action === 'accept' ? 'right' : 'left');

      if (action === 'accept') {
        const result = await sendConnectionRequest(recipientId);
        if (result.error) {
          toast.error(result.error);
          setActionLoading(false);
          setAnimationDirection("");
          return;
        }
        toast.success('Connection request sent!');
      } else {
        toast.info('Profile passed');
      }

      setTimeout(() => {
        handleNextProfile();
        setActionLoading(false);
      }, 300);
    } catch (err) {
      console.error('Connection request error:', err);
      toast.error('Failed to process connection request');
      setActionLoading(false);
      setAnimationDirection("");
    }
  };

  const handleNextProfile = () => {
    if (currentProfileIndex < profiles.length - 1) {
      setCurrentProfileIndex(currentProfileIndex + 1);
    } else {
      toast.info("You've seen all available profiles!");
      refetchProfiles();
    }
  };

  const handlePreviousProfile = () => {
    if (currentProfileIndex > 0) {
      setCurrentProfileIndex(currentProfileIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Discover Collaborators</h1>
        <div className="max-w-3xl mx-auto">
          <Card className="border-2 shadow-lg">
            <CardHeader className="flex flex-col items-center text-center">
              <Skeleton className="w-32 h-32 rounded-full mb-4" />
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-4 w-3/4 mb-6" />
              
              <Skeleton className="h-4 w-24 mb-2" />
              <div className="flex flex-wrap gap-2 mb-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-6 w-16" />
                ))}
              </div>
              
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
            <CardFooter className="flex justify-center gap-4">
              <Skeleton className="h-14 w-14 rounded-full" />
              <Skeleton className="h-14 w-14 rounded-full" />
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Discover Collaborators</h1>
        <div className="max-w-3xl mx-auto p-8 border rounded-lg text-center">
          <p className="text-destructive text-lg mb-4">Error loading profiles</p>
          <Button onClick={refetchProfiles}>Try Again</Button>
        </div>
      </div>
    );
  }
  
  if (profiles.length === 0) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Discover Collaborators</h1>
        <EmptyDiscoverState />
      </div>
    );
  }

  const currentProfile = profiles[currentProfileIndex];

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 animate-fade-in">Discover Collaborators</h1>
        
        <div className="flex justify-center mb-8">
          <div className="w-full">
            <Card className={`border-2 shadow-lg transition-all duration-300 hover-scale
              ${animationDirection === "left" ? "animate-slide-out-left" : 
                animationDirection === "right" ? "animate-slide-out-right" : ""}
            `}>
              <CardHeader className="flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-full overflow-hidden mb-4 ring-4 ring-background border-2 border-primary/20">
                  <Avatar className="w-full h-full">
                    <AvatarImage
                      src={currentProfile.avatar_url || '/placeholder.svg'}
                      alt={currentProfile.full_name || 'User avatar'}
                      className="w-full h-full object-cover"
                    />
                    <AvatarFallback className="text-xl bg-gradient-to-br from-primary/20 to-secondary/20">
                      {(currentProfile.full_name || 'U')[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {currentProfile.full_name}
                </CardTitle>
                <CardDescription className="text-lg font-medium">
                  {currentProfile.title}
                </CardDescription>
                <div className="text-sm text-muted-foreground">
                  {currentProfile.location}
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6 bg-muted/30 p-4 rounded-lg">
                  <p className="text-muted-foreground italic">{currentProfile.bio}</p>
                </div>
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2 text-primary">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentProfile.skills?.map((skill) => (
                      <Badge key={skill} variant="secondary" className="animate-fade-in bg-secondary/10 text-secondary hover:bg-secondary/20">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2 text-primary">Experience</h3>
                  <p className="text-sm">{currentProfile.experience || "No experience listed"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2 text-primary">Looking for</h3>
                  <p className="text-sm">{currentProfile.looking_for || "Not specified"}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center gap-4 p-6">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-14 w-14 border-2 border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors"
                  onClick={() => handleConnectionRequest(currentProfile.id, 'reject')}
                  disabled={actionLoading}
                >
                  {actionLoading && animationDirection === "left" ? <Loader2 className="h-6 w-6 animate-spin" /> : <X className="h-6 w-6" />}
                </Button>
                <Button
                  variant="default"
                  size="icon"
                  className="rounded-full bg-green-500 hover:bg-green-600 h-14 w-14 transition-colors"
                  onClick={() => handleConnectionRequest(currentProfile.id, 'accept')}
                  disabled={actionLoading}
                >
                  {actionLoading && animationDirection === "right" ? <Loader2 className="h-6 w-6 animate-spin" /> : <Check className="h-6 w-6" />}
                </Button>
              </CardFooter>
            </Card>
              
            <div className="flex justify-between mt-4">
              <Button
                variant="ghost"
                onClick={handlePreviousProfile}
                disabled={currentProfileIndex === 0 || actionLoading}
                className="transition-colors hover:bg-primary/10"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                {currentProfileIndex + 1} of {profiles.length}
              </div>
              <Button
                variant="ghost"
                onClick={handleNextProfile}
                disabled={currentProfileIndex === profiles.length - 1 || actionLoading}
                className="transition-colors hover:bg-primary/10"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
