
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/project';
import { toast } from 'sonner';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*');

      if (error) throw error;
      
      setProjects(data || []);
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Failed to fetch projects', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          looking_for: projectData.looking_for || '',
        })
        .select()
        .single();

      if (error) throw error;
      
      setProjects(prev => [...prev, data]);
      toast.success('Project created successfully');
      return data;
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to create project', { description: error.message });
      throw error;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setProjects(prev => 
        prev.map(project => project.id === id ? data : project)
      );
      toast.success('Project updated successfully');
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to update project', { description: error.message });
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProjects(prev => prev.filter(project => project.id !== id));
      toast.success('Project deleted successfully');
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to delete project', { description: error.message });
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects, 
    loading, 
    error, 
    createProject, 
    updateProject, 
    deleteProject 
  };
};
