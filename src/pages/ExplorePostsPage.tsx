
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ChevronDown,
  Filter,
  Loader2,
  MessageCircle,
  Plus,
  ThumbsUp,
  UserPlus
} from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Empty state for no posts
function EmptyPostsState() {
  return (
    <div className="text-center py-16 px-6 bg-muted/20 rounded-lg animate-fade-in">
      <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        <Plus className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
      <p className="text-muted-foreground max-w-sm mx-auto mb-6">
        Be the first to share your project or idea with the community.
      </p>
      <Button className="bg-primary hover:bg-primary/90 transition-colors shadow hover:shadow-md">Create a Post</Button>
    </div>
  );
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(6).fill(0).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            
            <div className="flex flex-wrap gap-1 mb-4">
              {Array(3).fill(0).map((_, j) => (
                <Skeleton key={j} className="h-6 w-16" />
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

type Project = Tables<"projects">;

export default function ExplorePostsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [creators, setCreators] = useState<Record<string, Tables<"profiles">>>({});

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        
        // Fetch projects
        let query = supabase
          .from("projects")
          .select("*");
          
        // Apply filters if selected
        if (selectedCategory) {
          query = query.eq("category", selectedCategory);
        }
        
        // Apply other filters when we add these columns to the projects table
        
        const { data: projectsData, error } = await query;
        
        if (error) throw error;
        
        if (projectsData) {
          setProjects(projectsData);
          
          // Fetch creators for each project
          const userIds = [...new Set(projectsData.map(project => project.user_id))];
          
          if (userIds.length > 0) {
            const { data: profilesData } = await supabase
              .from("profiles")
              .select("*")
              .in("id", userIds);
              
            if (profilesData) {
              const profilesMap: Record<string, Tables<"profiles">> = {};
              profilesData.forEach(profile => {
                profilesMap[profile.id] = profile;
              });
              setCreators(profilesMap);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user, selectedCategory, selectedIndustry, selectedLocation, selectedSkill]);

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold animate-fade-in">Explore Projects</h1>
          <p className="text-muted-foreground mt-1">
            Discover projects and collaborate with others
          </p>
        </div>
        <Button className="shrink-0 bg-primary hover:bg-primary/90 transition-all shadow hover:shadow-md">
          <Plus className="h-4 w-4 mr-2" />
          Create Project
        </Button>
      </div>

      <div className="mb-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all" className="transition-all">All Projects</TabsTrigger>
            <TabsTrigger value="startup" className="transition-all">Startup Ideas</TabsTrigger>
            <TabsTrigger value="freelance" className="transition-all">Freelance Tasks</TabsTrigger>
            <TabsTrigger value="hackathon" className="transition-all">Hackathon</TabsTrigger>
            <TabsTrigger value="research" className="transition-all">Research</TabsTrigger>
          </TabsList>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="transition-all hover-scale">
                  <Filter className="h-4 w-4 mr-2" />
                  Category
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background border shadow-md animate-fade-in">
                <DropdownMenuItem onClick={() => setSelectedCategory(null)}>All Categories</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedCategory("startup")}>Startup Idea</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedCategory("freelance")}>Freelance Task</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedCategory("hackathon")}>Hackathon</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedCategory("research")}>Research</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedCategory("other")}>Other</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="transition-all hover-scale">
                  <Filter className="h-4 w-4 mr-2" />
                  Industry
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background border shadow-md animate-fade-in">
                <DropdownMenuItem onClick={() => setSelectedIndustry(null)}>All Industries</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedIndustry("technology")}>Technology</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedIndustry("healthcare")}>Healthcare</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedIndustry("finance")}>Finance</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedIndustry("education")}>Education</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="transition-all hover-scale">
                  <Filter className="h-4 w-4 mr-2" />
                  Location
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background border shadow-md animate-fade-in">
                <DropdownMenuItem onClick={() => setSelectedLocation(null)}>All Locations</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedLocation("Mumbai")}>Mumbai</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedLocation("Delhi")}>Delhi</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedLocation("Bangalore")}>Bangalore</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedLocation("Remote")}>Remote</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="transition-all hover-scale">
                  <Filter className="h-4 w-4 mr-2" />
                  Skills Needed
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background border shadow-md animate-fade-in">
                <DropdownMenuItem onClick={() => setSelectedSkill(null)}>All Skills</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedSkill("development")}>Development</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedSkill("design")}>Design</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedSkill("marketing")}>Marketing</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedSkill("business")}>Business</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <TabsContent value="all" className="mt-0">
            {loading ? (
              <LoadingSkeleton />
            ) : projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => {
                  const creator = creators[project.user_id];
                  return (
                    <Card key={project.id} className="overflow-hidden hover:shadow-md transition-all border-border/50 hover:border-primary/20 hover-scale">
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
                          <Button size="sm" variant="ghost" className="flex gap-1 items-center h-auto p-1 hover:bg-primary/10 transition-colors">
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span className="text-xs">0</span>
                          </Button>
                        </div>
                        <Button 
                          size="sm"
                          className="bg-primary hover:bg-primary/90 transition-colors shadow-sm hover:shadow"
                        >
                          <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                          Connect
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <EmptyPostsState />
            )}
          </TabsContent>
          
          <TabsContent value="startup">
            <EmptyPostsState />
          </TabsContent>
          
          <TabsContent value="freelance">
            <EmptyPostsState />
          </TabsContent>
          
          <TabsContent value="hackathon">
            <EmptyPostsState />
          </TabsContent>
          
          <TabsContent value="research">
            <EmptyPostsState />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
