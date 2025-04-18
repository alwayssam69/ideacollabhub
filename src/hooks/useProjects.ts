
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type Project = Tables<"projects">;
export type Profile = Tables<"profiles">;

// Define explicit return type for the hook
interface UseProjectsResult {
  projects: Project[];
  creators: Record<string, Profile>;
  loading: boolean;
}

export const useProjects = (
  selectedCategory: string | null,
  selectedIndustry: string | null,
  selectedLocation: string | null,
  selectedSkill: string | null
): UseProjectsResult => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [creators, setCreators] = useState<Record<string, Profile>>({});

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        
        // Explicitly type the query result with correct generic syntax
        type ProjectQueryResult = Awaited<ReturnType<typeof supabase.from<"projects">.select>>;
        
        // Build the query
        let query = supabase
          .from("projects")
          .select("*");
          
        if (selectedCategory) {
          query = query.eq("duration", selectedCategory);
        }
        
        if (selectedIndustry) {
          query = query.eq("industry", selectedIndustry);
        }
        
        if (selectedLocation) {
          query = query.eq("location", selectedLocation);
        }
        
        if (selectedSkill) {
          query = query.contains("required_skills", [selectedSkill]);
        }
        
        // Execute query with explicit typing
        const { data: projectsData, error }: ProjectQueryResult = await query;
        
        if (error) throw error;
        
        if (projectsData && projectsData.length > 0) {
          setProjects(projectsData);
          
          const userIds = [...new Set(projectsData.map(project => project.user_id))];
          
          if (userIds.length > 0) {
            // Explicitly type the profiles query result with correct generic syntax
            type ProfileQueryResult = Awaited<ReturnType<typeof supabase.from<"profiles">.select>>;
            
            const { data: profilesData, error: profilesError }: ProfileQueryResult = await supabase
              .from("profiles")
              .select("*")
              .in("id", userIds);
              
            if (profilesError) throw profilesError;
              
            if (profilesData) {
              const profilesMap: Record<string, Profile> = {};
              profilesData.forEach((profile: Profile) => {
                profilesMap[profile.id] = profile;
              });
              setCreators(profilesMap);
            }
          }
        } else {
          setProjects([]);
          setCreators({});
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [selectedCategory, selectedIndustry, selectedLocation, selectedSkill]);

  return { projects, creators, loading };
};
