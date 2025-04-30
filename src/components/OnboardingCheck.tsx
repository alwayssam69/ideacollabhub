
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useConnectionRequests } from "@/hooks/useConnectionRequests";
import { toast } from "sonner";

export function OnboardingCheck({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { profile, loading } = useProfile();
  const { getPendingRequestsCount } = useConnectionRequests();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && user && profile) {
      console.log("Checking onboarding status:", profile);
      
      // Check if onboarding is explicitly completed
      const isOnboardingComplete = profile.onboarding_completed;

      console.log("Is onboarding complete:", isOnboardingComplete);

      // Don't redirect if we're on the profile, onboarding, or auth pages
      if (!isOnboardingComplete && 
          !location.pathname.startsWith("/auth") &&
          location.pathname !== "/onboarding" && 
          location.pathname !== "/profile") {
        toast.info("Please complete your profile before continuing");
        navigate("/onboarding", { replace: true });
      }
      
      // Notify about pending connection requests (only on certain paths)
      const pendingCount = getPendingRequestsCount();
      if (pendingCount > 0 && 
          !['/connections', '/pending-requests'].includes(location.pathname) && 
          !location.pathname.includes('/messages')) {
        toast.info(`You have ${pendingCount} pending connection request${pendingCount > 1 ? 's' : ''}`, {
          action: {
            label: "View",
            onClick: () => navigate("/connections?tab=pending")
          }
        });
      }
    }
  }, [user, profile, loading, navigate, location.pathname, getPendingRequestsCount]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
