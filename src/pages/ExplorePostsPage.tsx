
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { Plus } from "lucide-react";
import { useConnectionRequests } from "@/hooks/useConnectionRequests";
import { FilterDropdowns } from "@/components/explore/FilterDropdowns";
import { ProjectList } from "@/components/explore/ProjectList";
import { useProjects } from "@/hooks/useProjects";
import { motion } from "framer-motion";

export default function ExplorePostsPage() {
  const { user } = useAuth();
  const { refresh: refreshConnections } = useConnectionRequests();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const { projects, creators, loading } = useProjects(
    selectedCategory,
    selectedIndustry,
    selectedLocation,
    selectedSkill
  );

  return (
    <div className="container py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary">Explore Projects</h1>
          <p className="text-muted-foreground mt-1">
            Discover projects and collaborate with others
          </p>
        </div>
        <Button className="shrink-0 bg-primary hover:bg-primary/90 transition-all shadow hover:shadow-md hover:scale-105">
          <Plus className="h-4 w-4 mr-2" />
          Create Project
        </Button>
      </motion.div>

      <div className="mb-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6 bg-muted/50 backdrop-blur-sm">
            <TabsTrigger value="all" className="transition-all data-[state=active]:bg-primary data-[state=active]:text-white">All Projects</TabsTrigger>
            <TabsTrigger value="startup" className="transition-all data-[state=active]:bg-primary data-[state=active]:text-white">Startup Ideas</TabsTrigger>
            <TabsTrigger value="freelance" className="transition-all data-[state=active]:bg-primary data-[state=active]:text-white">Freelance Tasks</TabsTrigger>
            <TabsTrigger value="hackathon" className="transition-all data-[state=active]:bg-primary data-[state=active]:text-white">Hackathon</TabsTrigger>
            <TabsTrigger value="research" className="transition-all data-[state=active]:bg-primary data-[state=active]:text-white">Research</TabsTrigger>
          </TabsList>
          
          <FilterDropdowns
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedIndustry={selectedIndustry}
            setSelectedIndustry={setSelectedIndustry}
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
            selectedSkill={selectedSkill}
            setSelectedSkill={setSelectedSkill}
          />
          
          <TabsContent value="all" className="mt-0">
            <ProjectList
              loading={loading}
              projects={projects}
              creators={creators}
            />
          </TabsContent>
          
          <TabsContent value="startup">
            <ProjectList
              loading={loading}
              projects={projects.filter(p => p.duration === "startup")}
              creators={creators}
            />
          </TabsContent>
          
          <TabsContent value="freelance">
            <ProjectList
              loading={loading}
              projects={projects.filter(p => p.duration === "freelance")}
              creators={creators}
            />
          </TabsContent>
          
          <TabsContent value="hackathon">
            <ProjectList
              loading={loading}
              projects={projects.filter(p => p.duration === "hackathon")}
              creators={creators}
            />
          </TabsContent>
          
          <TabsContent value="research">
            <ProjectList
              loading={loading}
              projects={projects.filter(p => p.duration === "research")}
              creators={creators}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
