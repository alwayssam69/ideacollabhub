import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

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
};

export function useProjects() {
  const [filter, setFilter] = useState<string | null>(null);

  const fetchProjects = async (): Promise<Project[]> => {
    let query = supabase.from('projects').select('*');

    if (filter) {
      query = query.eq('status', filter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching projects:', error);
      throw new Error('Failed to fetch projects');
    }

    // Use type assertion to fix infinite type instantiation
    return data as Project[];
  };

  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects', filter],
    queryFn: fetchProjects,
    // Use type assertion to avoid infinite type instantiation
    initialData: [] as Project[],
  });

  return {
    projects,
    isLoading,
    error,
    setFilter,
    filter
  };
}
