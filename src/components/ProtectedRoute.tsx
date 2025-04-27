
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { OnboardingCheck } from "./OnboardingCheck";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // If still loading authentication state, show a loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Redirect to auth if not authenticated, preserving the intended destination
  if (!user) {
    return <Navigate to="/auth/signin" state={{ from: location.pathname }} replace />;
  }
  
  // Check onboarding status for authenticated users
  // Special case: don't apply OnboardingCheck to the onboarding page itself
  if (location.pathname === "/onboarding") {
    return <>{children}</>;
  }
  
  // For all other protected routes, check onboarding completion
  return <OnboardingCheck>{children}</OnboardingCheck>;
};

export default ProtectedRoute;
