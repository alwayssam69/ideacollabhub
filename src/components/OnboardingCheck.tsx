
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

export function OnboardingCheck({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { profile, loading } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && profile) {
      const isOnboardingComplete = Boolean(
        profile.industry &&
        profile.role &&
        profile.skills?.length > 0
      );

      if (!isOnboardingComplete) {
        navigate("/onboarding");
      }
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
