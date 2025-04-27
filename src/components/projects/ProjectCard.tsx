
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";
import type { Profile } from "@/types/project";

type Project = Tables<"projects">;

interface ProjectCardProps {
  project: Project;
  creator: Profile;
  onInteraction?: () => void;
}

export function ProjectCard({ project, creator, onInteraction }: ProjectCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleJoinRequest = async () => {
    if (!user) {
      toast.error("Please sign in to join projects");
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from("project_interactions")
        .insert({
          project_id: project.id,
          user_id: user.id,
          type: "join_request"
        });

      if (error) throw error;

      toast.success("Join request sent!");
      if (onInteraction) onInteraction();
    } catch (error) {
      console.error("Error sending join request:", error);
      toast.error("Failed to send join request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={creator?.avatar_url} alt={creator?.full_name} />
            <AvatarFallback>{creator?.full_name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className="text-sm font-medium">{creator?.full_name}</div>
        </div>
        <CardTitle className="line-clamp-2">{project.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-muted-foreground line-clamp-3 mb-4">
          {project.description}
        </p>
        <div className="space-y-3">
          <div>
            <div className="text-xs font-medium mb-1">Required Skills:</div>
            <div className="flex flex-wrap gap-1">
              {project.required_skills?.map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs font-medium mb-1">Looking for:</div>
              <div className="text-sm">{project.looking_for}</div>
            </div>
            <div>
              <div className="text-xs font-medium mb-1">Duration:</div>
              <div className="text-sm">{project.duration}</div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => navigate(`/profile/${creator?.id}`)}
        >
          <User className="h-4 w-4" />
          View Profile
        </Button>
        {user?.id !== project.user_id && (
          <Button 
            variant="default" 
            size="sm"
            onClick={handleJoinRequest}
            disabled={isSubmitting}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Request to Join
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
