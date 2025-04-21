
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Project = {
  id: string;
  title: string;
  description: string;
  user_id: string;
  duration: string | null;
  looking_for: string;
  required_skills: string[] | null;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  title: string | null;
  bio: string | null;
  skills: string[] | null;
  [key: string]: any; // To allow for other potential fields
};

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

        const { data, error } = await query;

        if (error) throw error;

        const projectsData = data || [];
        setProjects(projectsData as Project[]);

        const userIds = [...new Set(projectsData.map((p) => p.user_id))];

        if (userIds.length > 0) {
          const { data: profilesData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .in("id", userIds);

          if (profileError) throw profileError;

          const profilesMap: Record<string, Profile> = {};
          if (profilesData) {
            profilesData.forEach((profile) => {
              profilesMap[profile.id] = profile as Profile;
            });
          }

          setCreators(profilesMap);
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
