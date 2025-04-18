
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type Project = Tables<"projects">;
export type Profile = Tables<"profiles">;

export const useProjects = (
  selectedCategory: string | null,
  selectedIndustry: string | null,
  selectedLocation: string | null,
  selectedSkill: string | null
) => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [creators, setCreators] = useState<Record<string, Profile>>({});

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        
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
        
        const { data: projectsData, error } = await query;
        
        if (error) throw error;
        
        if (projectsData && projectsData.length > 0) {
          setProjects(projectsData);
          
          const userIds = [...new Set(projectsData.map(project => project.user_id))];
          
          if (userIds.length > 0) {
            const { data: profilesData, error: profilesError } = await supabase
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
