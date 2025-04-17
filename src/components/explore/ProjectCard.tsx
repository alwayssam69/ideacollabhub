
import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage
} from "@/components/ui/avatar";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from "@/components/ui/hover-card";
import {
  Bookmark,
  Check,
  Loader2,
  MessageCircle,
  ThumbsUp,
  UserCheck,
  UserPlus,
  X
} from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useConnectionRequests } from '@/hooks/useConnectionRequests';
import { useRouter } from 'react-router-dom';
import { toast } from 'sonner';

type ProjectCardProps = {
  project: Tables<'projects'>;
  creator: Tables<'profiles'>;
};

export function ProjectCard({ project, creator }: ProjectCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { sendConnectionRequest, checkConnectionStatus } = useConnectionRequests();
  const router = useRouter();
  const connectionStatus = creator ? checkConnectionStatus(creator.id) : 'none';

  const handleConnectClick = async () => {
    if (!creator) return;
    
    setIsLoading(true);
    const result = await sendConnectionRequest(creator.id);
    setIsLoading(false);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Connection request sent!');
    }
  };
  
  const handleMessageClick = () => {
    if (!creator) return;
    router.push(`/messages?userId=${creator.id}`);
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all border-border/50 hover:border-primary/20 hover:scale-[1.01] duration-300">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className="mb-2 bg-primary/5 hover:bg-primary/10 transition-colors">
            {project.duration || "Project"}
          </Badge>
          <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-colors">
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
        <CardTitle className="text-lg text-gradient-primary">{project.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-1 mb-4">
          {project.required_skills?.slice(0, 5).map((skill: string) => (
            <Badge key={skill} variant="secondary" className="bg-muted/50 animate-fade-in">
              {skill}
            </Badge>
          ))}
          {project.required_skills && project.required_skills.length > 5 && (
            <span className="text-xs text-muted-foreground">+{project.required_skills.length - 5} more</span>
          )}
        </div>
        {creator && (
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer">
                <Avatar className="h-6 w-6 border border-border/50 ring-1 ring-background">
                  <AvatarImage src={creator.avatar_url || ''} />
                  <AvatarFallback>{(creator.full_name || 'U')[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{creator.full_name || 'Unknown User'}</span>
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 bg-background border shadow-lg animate-fade-in">
              <div className="flex justify-between space-x-4">
                <Avatar>
                  <AvatarImage src={creator.avatar_url || ''} />
                  <AvatarFallback>{(creator.full_name || 'U')[0]}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">{creator.full_name}</h4>
                  <p className="text-sm">{creator.title || 'No title'}</p>
                  <div className="flex items-center pt-2">
                    <span className="text-xs text-muted-foreground">
                      {creator.location || 'No location'}
                    </span>
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="flex items-center gap-3">
          <Button size="sm" variant="ghost" className="flex gap-1 items-center h-auto p-1 hover:bg-primary/10 transition-colors">
            <ThumbsUp className="h-3.5 w-3.5" />
            <span className="text-xs">0</span>
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className="flex gap-1 items-center h-auto p-1 hover:bg-primary/10 transition-colors"
            onClick={handleMessageClick}
            disabled={connectionStatus !== 'accepted'}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span className="text-xs">0</span>
          </Button>
        </div>
        {connectionStatus === 'none' && (
          <Button 
            size="sm"
            className="bg-primary hover:bg-primary/90 transition-colors shadow-sm hover:shadow"
            onClick={handleConnectClick}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                Connect
              </>
            )}
          </Button>
        )}
        {connectionStatus === 'pending' && (
          <Button 
            size="sm"
            variant="outline"
            disabled
          >
            <UserPlus className="h-3.5 w-3.5 mr-1.5" />
            Pending
          </Button>
        )}
        {connectionStatus === 'accepted' && (
          <Button 
            size="sm"
            variant="outline"
            className="text-green-500 border-green-200"
            disabled
          >
            <UserCheck className="h-3.5 w-3.5 mr-1.5" />
            Connected
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
