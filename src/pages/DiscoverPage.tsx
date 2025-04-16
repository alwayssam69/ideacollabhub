
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useDiscoverProfiles } from "@/hooks/useDiscoverProfiles";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function DiscoverPage() {
  const { profiles, loading, error } = useDiscoverProfiles();
  const { user } = useAuth();
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);

  const handleConnectionRequest = async (recipientId: string, action: 'accept' | 'reject') => {
    if (!user) {
      toast.error('You must be logged in to send connection requests');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          recipient_id: recipientId,
          status: action === 'accept' ? 'accepted' : 'rejected'
        })
        .select();

      if (error) throw error;

      toast.success(
        action === 'accept' 
          ? 'Connection request sent!' 
          : 'Profile passed'
      );

      // Move to next profile
      handleNextProfile();
    } catch (err) {
      console.error('Connection request error:', err);
      toast.error('Failed to process connection request');
    }
  };

  const handleNextProfile = () => {
    if (currentProfileIndex < profiles.length - 1) {
      setCurrentProfileIndex(currentProfileIndex + 1);
    } else {
      toast.info("You've seen all available profiles!");
    }
  };

  const handlePreviousProfile = () => {
    if (currentProfileIndex > 0) {
      setCurrentProfileIndex(currentProfileIndex - 1);
    }
  };

  if (loading) return <div>Loading profiles...</div>;
  if (error) return <div>Error loading profiles: {error}</div>;
  if (profiles.length === 0) return <div>No profiles found</div>;

  const currentProfile = profiles[currentProfileIndex];

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Discover Collaborators</h1>
        
        <div className="flex justify-center mb-8">
          <div className="w-full">
            <Card className="border-2 shadow-lg">
              <CardHeader className="flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
                  <img
                    src={currentProfile.avatar_url || '/placeholder.svg'}
                    alt={currentProfile.full_name || 'User avatar'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardTitle className="text-2xl">{currentProfile.full_name}</CardTitle>
                <CardDescription className="text-lg font-medium">
                  {currentProfile.title}
                </CardDescription>
                <div className="text-sm text-muted-foreground">
                  {currentProfile.location}
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-muted-foreground">{currentProfile.bio}</p>
                </div>
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentProfile.skills?.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Experience</h3>
                  <p className="text-sm">{currentProfile.experience}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Looking for</h3>
                  <p className="text-sm">{currentProfile.looking_for}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-14 w-14"
                  onClick={() => handleConnectionRequest(currentProfile.id, 'reject')}
                >
                  <X className="h-6 w-6" />
                </Button>
                <Button
                  variant="default"
                  size="icon"
                  className="rounded-full bg-green-500 hover:bg-green-600 h-14 w-14"
                  onClick={() => handleConnectionRequest(currentProfile.id, 'accept')}
                >
                  <Check className="h-6 w-6" />
                </Button>
              </CardFooter>
            </Card>
              
            <div className="flex justify-between mt-4">
              <Button
                variant="ghost"
                onClick={handlePreviousProfile}
                disabled={currentProfileIndex === 0}
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
                disabled={currentProfileIndex === profiles.length - 1}
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
