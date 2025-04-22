import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useOnboarding() {
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    async function checkOnboardingStatus() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (!data?.onboarding_completed) {
          setNeedsOnboarding(true);
          navigate('/onboarding');
        } else {
          setNeedsOnboarding(false);
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setLoading(false);
      }
    }

    checkOnboardingStatus();
  }, [user, navigate]);

  return { loading, needsOnboarding };
} 