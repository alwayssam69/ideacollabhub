
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

// Empty state for discover page
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

export default function DiscoverPage() {
  const { profiles, loading, error, refetchProfiles } = useDiscoverProfiles();
  const { user } = useAuth();
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<"left" | "right" | "">("");

  useEffect(() => {
    // Reset animation after card slide effect
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
      // Set animation direction based on action
      setAnimationDirection(action === 'accept' ? 'right' : 'left');

      const { data, error } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          recipient_id: recipientId,
          status: action === 'accept' ? 'pending' : 'rejected'
        })
        .select();

      if (error) throw error;

      toast.success(
        action === 'accept' 
          ? 'Connection request sent!' 
          : 'Profile passed'
      );

      // Move to next profile
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
      refetchProfiles(); // Try to get new profiles
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
