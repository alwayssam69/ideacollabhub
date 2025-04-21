import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type Profile = Tables<'profiles'>;

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    try {
      setLoading(true);
      
      // Validate required fields
      if (updates.full_name && updates.full_name.length < 2) {
        throw new Error('Full name must be at least 2 characters long');
      }

      if (updates.bio && updates.bio.length > 500) {
        throw new Error('Bio must not exceed 500 characters');
      }

      // Prepare the update data
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      // Update the profile
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }

      // Refresh profile data
      await fetchProfile();
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      toast.error(errorMessage);
      throw err;
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