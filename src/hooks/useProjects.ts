
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Project {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchProjects() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setProjects(data as Project[]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [user]);

  const createProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const newProject = {
        ...projectData,
        user_id: user.id
      };
      
      const { data, error } = await supabase
        .from('projects')
        .insert([newProject])
        .select();
        
      if (error) throw error;
      
      // Type assertion to avoid deep instantiation
      setProjects(prev => [data[0] as Project, ...prev]);
      return data[0] as Project;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create project');
    }
  };

  const updateProject = async (id: string, updates: Partial<Omit<Project, 'id' | 'created_at' | 'user_id'>>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select();
        
      if (error) throw error;
      
      // Type assertion to avoid deep instantiation
      setProjects(prev => prev.map(p => p.id === id ? (data[0] as Project) : p));
      return data[0] as Project;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update project');
    }
  };

  const deleteProject = async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete project');
    }
  };

  return { projects, loading, error, createProject, updateProject, deleteProject };
}
