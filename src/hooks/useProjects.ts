
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

        // Build query
        let query = supabase.from("projects").select("*");

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

        // Execute query
        const { data: rawProjects, error } = await query;

        if (error) throw error;

        // Safe type casting
        const projectsData = rawProjects ? rawProjects as Project[] : [];
        setProjects(projectsData);

        // Fetch profiles for projects
        if (projectsData.length > 0) {
          const userIds = [...new Set(projectsData.map((p) => p.user_id))];

          if (userIds.length > 0) {
            const { data: rawProfiles, error: profileError } = await supabase
              .from("profiles")
              .select("*")
              .in("id", userIds);

            if (profileError) throw profileError;

            // Safe type casting
            const profilesData = rawProfiles ? rawProfiles as Profile[] : [];
            
            // Build profiles map
            const profilesMap: Record<string, Profile> = {};
            profilesData.forEach((profile) => {
              profilesMap[profile.id] = profile;
            });

            setCreators(profilesMap);
          }
        }

        setLoading(false);
      } catch (error: any) {
        console.error("Error fetching projects:", error);
        toast.error("Failed to load projects");
        setLoading(false);
      }
    };

    fetchProjects();
  }, [selectedCategory, selectedIndustry, selectedLocation, selectedSkill]);

  return { projects, creators, loading };
};
