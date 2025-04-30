import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

export function OnboardingCheck({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { profile, loading } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && user && profile) {
      console.log("Checking onboarding status:", profile);
      
      // Check if onboarding is explicitly completed or if all required fields are present
      const isOnboardingComplete = profile.onboarding_completed || Boolean(
        profile.industry &&
        profile.role &&
        profile.skills?.length > 0 &&
        profile.stage &&
        profile.looking_for?.length > 0
      );

      console.log("Is onboarding complete:", isOnboardingComplete);

      // Don't redirect if we're on the profile or onboarding page
      if (!isOnboardingComplete && 
          location.pathname !== "/onboarding" && 
          location.pathname !== "/profile") {
        toast.info("Please complete your profile before continuing");
        navigate("/onboarding", { replace: true });
      }
    }
  }, [user, profile, loading, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
