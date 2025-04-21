import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        // If onboarding_completed is false or null, user needs onboarding
        setNeedsOnboarding(!data?.onboarding_completed);
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        // Default to needing onboarding if there's an error
        setNeedsOnboarding(true);
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  useEffect(() => {
    if (needsOnboarding === true && !loading) {
      navigate("/onboarding");
    }
  }, [needsOnboarding, loading, navigate]);

  return {
    needsOnboarding,
    loading,
  };
} 