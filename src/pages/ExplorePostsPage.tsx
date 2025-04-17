
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Button,
  Card,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger 
} from "@/components/ui";
import { 
  ChevronDown,
  Filter,
  Plus,
} from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { EmptyPostsState } from "@/components/explore/EmptyState";
import { LoadingSkeleton } from "@/components/explore/LoadingSkeleton";
import { ProjectCard } from "@/components/explore/ProjectCard";
import { useConnectionRequests } from "@/hooks/useConnectionRequests";

type Project = Tables<"projects">;
type Profile = Tables<"profiles">;

export default function ExplorePostsPage() {
  const { user } = useAuth();
  const { refresh: refreshConnections } = useConnectionRequests();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [creators, setCreators] = useState<Record<string, Profile>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

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
              const profilesMap: Record<string, Profile> = {};
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
    refreshConnections();
  }, [user, selectedCategory, selectedIndustry, selectedLocation, selectedSkill, refreshConnections]);

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
                <Button variant="outline" size="sm" className="transition-all hover:scale-105">
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
                <Button variant="outline" size="sm" className="transition-all hover:scale-105">
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
                <Button variant="outline" size="sm" className="transition-all hover:scale-105">
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
                <Button variant="outline" size="sm" className="transition-all hover:scale-105">
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
                    <ProjectCard 
                      key={project.id} 
                      project={project} 
                      creator={creator}
                    />
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
