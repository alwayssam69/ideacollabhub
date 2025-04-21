
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type Project = Tables<"projects">;
export type Profile = Tables<"profiles">;

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

        // Use explicit type annotation to avoid deep instantiation issues
        let query = supabase.from("projects").select();

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

        const { data: rawProjects, error } = await query;

        if (error) throw error;

        // Explicit cast to avoid type issues
        const projectsData = rawProjects as Project[] || [];
        setProjects(projectsData);

        const userIds = [...new Set(projectsData.map((p) => p.user_id))];

        if (userIds.length > 0) {
          const { data: rawProfiles, error: profileError } = await supabase
            .from("profiles")
            .select()
            .in("id", userIds);

          if (profileError) throw profileError;

          // Explicit cast to avoid type issues
          const profilesData = rawProfiles as Profile[] || [];
          
          // Create a map of user IDs to profiles
          const profilesMap: Record<string, Profile> = {};
          profilesData.forEach((profile) => {
            profilesMap[profile.id] = profile;
          });

          setCreators(profilesMap);
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
