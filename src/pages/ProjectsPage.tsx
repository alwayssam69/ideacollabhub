import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { PlusCircle } from "lucide-react";
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
import { useNavigate } from "react-router-dom";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectFilters } from "@/components/projects/ProjectFilters";
import type { Tables } from "@/integrations/supabase/types";
import type { Profile } from "@/types/project";

type Project = Tables<"projects">;

interface ProjectWithCreator extends Project {
  creator: Profile;
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectWithCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    required_skills: [] as string[],
    looking_for: "",
    duration: "",
  });

  const fetchProjects = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select('*')
        .order("created_at", { ascending: sortBy === "oldest" });

      if (projectsError) throw projectsError;

      if (!projectsData) {
        setProjects([]);
        setLoading(false);
        return;
      }

      // Fetch profiles for the projects
      const userIds = projectsData.map(project => project.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select('*')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Create a map of profiles by user_id
      const profilesMap: Record<string, Profile> = {};
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap[profile.id] = profile as Profile;
        });
      }

      // Combine projects with their creators
      const filteredProjects = projectsData
        .map(project => ({
          ...project,
          creator: profilesMap[project.user_id] || {
            id: project.user_id,
            full_name: 'Unknown User',
          } as Profile
        }))
        .filter(project => 
          project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase())
        );

      setProjects(filteredProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user, searchTerm, sortBy]);

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
        user_id: user.id,
      };

      const { data: project, error } = await supabase
        .from("projects")
        .insert(projectData)
        .select()
        .single();

      if (error) throw error;

      // Fetch the creator profile
      const { data: creatorData, error: creatorError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (creatorError) throw creatorError;

      // Add to projects list with creator data
      const newProjectWithCreator = {
        ...project,
        creator: creatorData as Profile,
      } as ProjectWithCreator;

      setProjects(prev => [newProjectWithCreator, ...prev]);
      setDialogOpen(false);
      toast.success("Project created successfully!");

      // Reset form
      setNewProject({
        title: "",
        description: "",
        required_skills: [],
        looking_for: "",
        duration: "",
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

      <ProjectFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

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
            <ProjectCard 
              key={project.id} 
              project={project} 
              creator={project.creator}
              onInteraction={fetchProjects}
            />
          ))
        )}
      </div>
    </div>
  );
}
