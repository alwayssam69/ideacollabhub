import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

type SignUpMetadata = {
  full_name?: string;
  stage?: string;
  location?: string;
  title?: string;
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Check onboarding status
          const { data, error } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', session.user.id)
            .single();

          if (!error && data) {
            setOnboardingCompleted(data.onboarding_completed);
          }
        } else {
          setOnboardingCompleted(null);
        }

        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Check onboarding status
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single();

        if (!error && data) {
          setOnboardingCompleted(data.onboarding_completed);
        }
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;

      // Check onboarding status after sign in
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', data.user.id)
          .single();

        if (!profileError && profile) {
          setOnboardingCompleted(profile.onboarding_completed);
        }
      }
      
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const signUp = async (email: string, password: string, metadata?: SignUpMetadata) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata?.full_name,
            stage: metadata?.stage,
            location: metadata?.location,
            title: metadata?.title,
          },
        },
      });
      
      if (error) throw error;

      // Create initial profile if signup was successful
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            full_name: metadata?.full_name || '',
            stage: metadata?.stage || '',
            location: metadata?.location || '',
            title: metadata?.title || '',
            onboarding_completed: false,
            updated_at: new Date().toISOString(),
            skills: [],
            looking_for: [],
            preferred_industries: [],
            preferred_project_types: [],
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          toast.error('Error creating profile. Please try again.');
        } else {
          setOnboardingCompleted(false);
        }
      }
      
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setOnboardingCompleted(null);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  return { user, session, loading, onboardingCompleted, signIn, signUp, signOut };
};
