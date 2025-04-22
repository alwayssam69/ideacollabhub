
import { Project, Profile } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProjectCardProps {
  project: Project;
  creator?: Profile;
}

export function ProjectCard({ project, creator }: ProjectCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={creator?.avatar_url} alt={creator?.full_name} />
            <AvatarFallback>{creator?.full_name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{project.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {creator?.full_name || 'Unknown Creator'}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {project.description}
        </p>
        {project.required_skills && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.required_skills.map((skill) => (
              <Badge key={skill} variant="secondary">{skill}</Badge>
            ))}
          </div>
        )}
        <Badge variant="outline">{project.looking_for}</Badge>
      </CardContent>
      <CardFooter className="justify-between">
        {project.duration && (
          <span className="text-xs text-muted-foreground">
            Duration: {project.duration}
          </span>
        )}
      </CardFooter>
    </Card>
  );
}
