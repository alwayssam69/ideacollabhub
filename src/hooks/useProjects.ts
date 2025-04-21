
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { Tables } from '@/integrations/supabase/types';

export type Project = {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
  status: 'active' | 'completed' | 'archived';
  tags: string[];
  repository_url?: string;
  website_url?: string;
  thumbnail_url?: string;
  // Add properties from the database schema
  title?: string;
  user_id?: string;
  duration?: string;
  looking_for?: string;
  required_skills?: string[];
};

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
          creatorsMap[profile.id] = profile as unknown as Profile;
        });
        setCreators(creatorsMap);
      }
    }

    // Use type assertion to fix infinite type instantiation
    return data as unknown as Project[];
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
    creators
  };
}
