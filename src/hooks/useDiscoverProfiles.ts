
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type DiscoverProfile = Tables<'profiles'> & {
  skills: string[];
};

export const useDiscoverProfiles = () => {
  const [profiles, setProfiles] = useState<DiscoverProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = async () => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(10);

      if (error) throw error;

      setProfiles(profileData as DiscoverProfile[]);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching profiles:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  // Add refetchProfiles function to return value
  return { 
    profiles, 
    loading, 
    error, 
    refetchProfiles: fetchProfiles 
  };
};
