
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export function useOnboardingCheck() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;
      
      // Don't redirect if the user is already on the onboarding page
      if (location.pathname === '/onboarding') return;

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (!profile?.onboarding_completed) {
          navigate('/onboarding');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };

    checkOnboardingStatus();
  }, [user, navigate, location.pathname]);
} 
