
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

// Mock data for projects
const mockProjects = [
  {
    id: 1,
    title: "AI-Powered Task Management App",
    description:
      "Looking to build a task management app that uses AI to prioritize and suggest tasks for users. Need developers and UI/UX designers.",
    createdBy: "Alex Johnson",
    userImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    requiredSkills: ["React Native", "Machine Learning", "UI/UX Design"],
    lookingFor: "Co-founder",
    duration: "3-6 months",
    likes: 24,
    comments: 8,
  },
  {
    id: 2,
    title: "Sustainable Fashion Marketplace",
    description:
      "Building a platform to connect sustainable fashion brands with conscious consumers. Need someone with marketing and e-commerce experience.",
    createdBy: "Sarah Lee",
    userImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    requiredSkills: ["Marketing", "E-commerce", "Sustainability"],
    lookingFor: "Marketing Expert",
    duration: "Ongoing",
    likes: 32,
    comments: 12,
  },
  {
    id: 3,
    title: "Blockchain-based Voting System",
    description:
      "Developing a secure voting system using blockchain technology for organizational decision making. Looking for blockchain developers and security experts.",
    createdBy: "Michael Chen",
    userImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    requiredSkills: ["Blockchain", "Smart Contracts", "Security"],
    lookingFor: "Developer",
    duration: "6-12 months",
    likes: 18,
    comments: 5,
  },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState(mockProjects);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    requiredSkills: "",
    lookingFor: "",
    duration: "",
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateProject = () => {
    // In a real app, this would connect to Supabase to save the project
    const skills = newProject.requiredSkills.split(",").map(skill => skill.trim());
    
    const project = {
      id: projects.length + 1,
      title: newProject.title,
      description: newProject.description,
      createdBy: "You", // In a real app, this would be the current user
      userImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80", // Placeholder
      requiredSkills: skills,
      lookingFor: newProject.lookingFor,
      duration: newProject.duration,
      likes: 0,
      comments: 0,
    };
    
    setProjects([project, ...projects]);
    setDialogOpen(false);
    toast.success("Project created successfully!");
    
    // Reset form
    setNewProject({
      title: "",
      description: "",
      requiredSkills: "",
      lookingFor: "",
      duration: "",
    });
  };

  const handleLike = (projectId: number) => {
    setProjects(
      projects.map((project) => {
        if (project.id === projectId) {
          return { ...project, likes: project.likes + 1 };
        }
        return project;
      })
    );
    toast.success("Project liked!");
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
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
                  value={newProject.requiredSkills}
                  onChange={(e) => setNewProject({ ...newProject, requiredSkills: e.target.value })}
                  placeholder="React, Design, Marketing, etc."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="lookingFor">Looking For</Label>
                  <Select
                    onValueChange={(value) => setNewProject({ ...newProject, lookingFor: value })}
                    defaultValue={newProject.lookingFor}
                  >
                    <SelectTrigger id="lookingFor">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Co-founder">Co-founder</SelectItem>
                      <SelectItem value="Developer">Developer</SelectItem>
                      <SelectItem value="Designer">Designer</SelectItem>
                      <SelectItem value="Marketing Expert">Marketing Expert</SelectItem>
                      <SelectItem value="Project Manager">Project Manager</SelectItem>
                      <SelectItem value="Advisor">Advisor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Select
                    onValueChange={(value) => setNewProject({ ...newProject, duration: value })}
                    defaultValue={newProject.duration}
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
              <Button type="submit" onClick={handleCreateProject}>
                Create Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-full overflow-hidden">
                  <img
                    src={project.userImage}
                    alt={project.createdBy}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-sm font-medium">{project.createdBy}</div>
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
                    {project.requiredSkills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs font-medium mb-1">Looking for:</div>
                    <div className="text-sm">{project.lookingFor}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium mb-1">Duration:</div>
                    <div className="text-sm">{project.duration}</div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => handleLike(project.id)}
              >
                <ThumbsUp className="h-4 w-4" />
                <span>{project.likes}</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>{project.comments}</span>
              </Button>
              <Button variant="default" size="sm">
                <User className="mr-2 h-4 w-4" />
                Connect
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
