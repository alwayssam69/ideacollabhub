
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useOnboardingCheck() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function checkOnboarding() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        if (data && !data.onboarding_completed) {
          navigate('/onboarding');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    }

    checkOnboarding();
  }, [user, navigate]);
}
