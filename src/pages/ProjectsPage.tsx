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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, PlusCircle, ThumbsUp, User } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";

type Project = Tables<"projects">;
type Profile = Tables<"profiles">;

interface ProjectWithCreator extends Project {
  creator: Profile | { [key: string]: any }; // Allow fallback for error handling
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectWithCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    required_skills: [] as string[],
    looking_for: "",
    duration: "",
    project_type: "",
  });

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select(`
          *,
          creator:profiles!user_id(*)
        `)
        .order("created_at", { ascending: false });

      if (projectsError) throw projectsError;

      // Handle possible error cases with profile relationships
      const safeProjects = (projectsData || []).map(project => {
        return {
          ...project,
          creator: project.creator || {
            id: project.user_id,
            full_name: 'Unknown',
            avatar_url: '/default-avatar.png'
          }
        };
      }) as ProjectWithCreator[];

      setProjects(safeProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!user) {
      toast.error("Please sign in to create a project");
      return;
    }

    try {
      setIsSubmitting(true);

      const projectData = {
        title: newProject.title,
        description: newProject.description,
        required_skills: newProject.required_skills,
        looking_for: newProject.looking_for,
        duration: newProject.duration,
        project_type: newProject.project_type,
        user_id: user.id,
        status: "active",
      };

      const { data: project, error } = await supabase
        .from("projects")
        .insert(projectData)
        .select(`
          *,
          creator:profiles!user_id(*)
        `)
        .single();

      if (error) throw error;

      setProjects(prev => [project as ProjectWithCreator, ...prev]);
      setDialogOpen(false);
      toast.success("Project created successfully!");

      // Reset form
      setNewProject({
        title: "",
        description: "",
        required_skills: [],
        looking_for: "",
        duration: "",
        project_type: "",
      });
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project");
    } finally {
      setIsSubmitting(false);
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
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">Create or join exciting projects</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Share details about your project to find the right collaborators.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  placeholder="Enter a descriptive title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Describe your project, goals, and vision"
                  rows={4}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="skills">Required Skills (comma separated)</Label>
                <Input
                  id="skills"
                  value={newProject.required_skills.join(", ")}
                  onChange={(e) => setNewProject({ 
                    ...newProject, 
                    required_skills: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="React, Design, Marketing, etc."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="lookingFor">Looking For</Label>
                  <Select
                    onValueChange={(value) => setNewProject({ ...newProject, looking_for: value })}
                    value={newProject.looking_for}
                  >
                    <SelectTrigger id="lookingFor">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Co-founder">Co-founder</SelectItem>
                      <SelectItem value="Developer">Developer</SelectItem>
                      <SelectItem value="Designer">Designer</SelectItem>
                      <SelectItem value="Marketing">Marketing Expert</SelectItem>
                      <SelectItem value="Project Manager">Project Manager</SelectItem>
                      <SelectItem value="Advisor">Advisor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="projectType">Project Type</Label>
                  <Select
                    onValueChange={(value) => setNewProject({ ...newProject, project_type: value })}
                    value={newProject.project_type}
                  >
                    <SelectTrigger id="projectType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="startup">Startup</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                      <SelectItem value="hackathon">Hackathon</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                      <SelectItem value="open-source">Open Source</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Select
                    onValueChange={(value) => setNewProject({ ...newProject, duration: value })}
                    value={newProject.duration}
                  >
                    <SelectTrigger id="duration">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="< 1 month">Less than 1 month</SelectItem>
                      <SelectItem value="1-3 months">1-3 months</SelectItem>
                      <SelectItem value="3-6 months">3-6 months</SelectItem>
                      <SelectItem value="6-12 months">6-12 months</SelectItem>
                      <SelectItem value="> 12 months">Over 12 months</SelectItem>
                      <SelectItem value="Ongoing">Ongoing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                onClick={handleCreateProject}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Project"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to create a project and find collaborators!
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Your First Project
              </Button>
            </div>
          </div>
        ) : (
          projects.map((project) => (
            <Card key={project.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-8 rounded-full overflow-hidden">
                    <img
                      src={project.creator.avatar_url || "/default-avatar.png"}
                      alt={project.creator.full_name || "User"}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="text-sm font-medium">{project.creator.full_name}</div>
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
                  onClick={() => navigate(`/profile/${project.creator.id}`)}
                >
                  <User className="h-4 w-4" />
                  View Profile
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => navigate(`/messages?userId=${project.creator.id}`)}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
