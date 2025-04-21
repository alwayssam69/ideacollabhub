
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { Tables } from '@/integrations/supabase/types';

// Explicitly define the Project type with all fields that might be used
export type Project = {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  duration?: string | null;
  looking_for: string;
  required_skills?: string[] | null;
  repository_url?: string;
  website_url?: string;
  thumbnail_url?: string;
  status?: 'active' | 'completed' | 'archived';
  tags?: string[];
  owner_id?: string;
  name?: string;
};

// Define the Profile type
export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  title: string | null;
  location: string | null;
};

export function useProjects(
  category?: string | null,
  industry?: string | null, 
  location?: string | null,
  skill?: string | null
) {
  const [filter, setFilter] = useState<string | null>(null);
  const [creators, setCreators] = useState<Record<string, Profile>>({});

  const fetchProjects = async (): Promise<Project[]> => {
    let query = supabase.from('projects').select('*');

    if (filter) {
      query = query.eq('status', filter);
    }

    // Apply additional filters if provided
    if (category) query = query.eq('category', category);
    if (industry) query = query.eq('industry', industry);
    if (skill) query = query.contains('required_skills', [skill]);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching projects:', error);
      throw new Error('Failed to fetch projects');
    }

    // Fetch creators for these projects
    const userIds = [...new Set(data.map(project => project.user_id))];
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, title, location')
        .in('id', userIds);
      
      const creatorsMap: Record<string, Profile> = {};
      if (profiles) {
        profiles.forEach(profile => {
          creatorsMap[profile.id] = {
            id: profile.id,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            title: profile.title,
            location: profile.location
          };
        });
        setCreators(creatorsMap);
      }
    }

    // Cast the data to Project[] to avoid type issues
    return data as Project[];
  };

  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['projects', filter, category, industry, location, skill],
    queryFn: fetchProjects,
  });

  return {
    projects,
    isLoading,
    error,
    setFilter,
    filter,
    creators,
    loading: isLoading, // Add loading alias for backward compatibility
  };
}
