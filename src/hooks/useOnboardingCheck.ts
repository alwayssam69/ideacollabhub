
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useOnboardingCheck() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return; // User is not logged in
      }

      try {
        // Check if onboarding is completed
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking onboarding status:', error);
          return;
        }

        // If profile exists but onboarding not completed, redirect to onboarding
        if (profile && profile.onboarding_completed === false) {
          navigate('/onboarding');
        }
      } catch (error) {
        console.error('Error in onboarding check:', error);
        toast.error('Failed to check onboarding status');
      }
    };

    checkOnboardingStatus();
  }, [navigate]);
}
