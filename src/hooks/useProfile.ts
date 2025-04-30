
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type Profile = Tables<'profiles'> & {
  // Additional fields that might not be in the database schema yet
  secondary_skills?: string[];
  education?: string;
  work_history?: string;
  tools?: string[];
  availability?: string;
  work_style?: string;
  location_preference?: string;
  preferred_project_stages?: string[];
  goals?: string[];
  long_term_goal?: string;
  past_startup_experience?: boolean;
  willing_to_relocate?: boolean;
  core_values?: string[];
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*, looking_for, skills, preferred_industries, preferred_project_types, secondary_skills, tools, preferred_project_stages, goals, core_values')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      console.log("Fetched profile:", data);
      setProfile(data as Profile);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      toast.error('User not authenticated');
      return { error: new Error('User not authenticated') };
    }

    try {
      setLoading(true);
      console.log("Updating profile with:", updates);
      
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      console.log("Profile updated successfully:", data);
      
      // Update the local profile state with the new data
      setProfile(prev => prev ? { ...prev, ...data } : data);
      
      return { error: null };
    } catch (err) {
      console.error('Error updating profile:', err);
      return { error: err instanceof Error ? err : new Error('Failed to update profile') };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
  };
};
