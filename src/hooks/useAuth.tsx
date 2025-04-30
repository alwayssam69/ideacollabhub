
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // If user just signed up or signed in, check their profile status
        if ((event === 'SIGNED_IN' || event === 'SIGNED_UP') && session) {
          // Using setTimeout to avoid Supabase deadlock
          setTimeout(() => {
            checkProfileStatus(session.user.id);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Using setTimeout to avoid Supabase deadlock
        setTimeout(() => {
          checkProfileStatus(session.user.id);
        }, 0);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const checkProfileStatus = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('onboarding_completed, full_name, industry, role, skills, stage, looking_for')
      .eq('id', userId)
      .single();

    console.log('Profile check:', data);

    if (!error && data) {
      // Check if required profile fields are completed
      const isComplete = data.onboarding_completed || Boolean(
        data.full_name && 
        data.industry && 
        data.role && 
        data.skills?.length > 0 && 
        data.stage && 
        data.looking_for?.length > 0
      );

      // If profile is not complete, redirect to onboarding
      if (!isComplete) {
        navigate('/onboarding');
      }
    } else if (error) {
      console.error('Error checking profile status:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to sign in'
      };
    }
  };

  const signUp = async (email: string, password: string, metadata?: { full_name?: string }) => {
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { 
        success: false,
        error: error.message || 'Failed to sign up' 
      };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to sign out'
      };
    }
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut
  };
};
