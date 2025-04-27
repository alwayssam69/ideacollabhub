
import { useParams, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Icons } from "@/components/ui/icons";
import AuthForm from "@/components/auth/AuthForm";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function AuthPage() {
  const { mode } = useParams<{ mode?: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);
  
  // Validate mode parameter, default to signin if invalid
  const validMode = mode === "signup" ? "signup" : "signin";

  // If no mode is specified in URL, redirect to the signin page
  if (!mode) {
    return <Navigate to="/auth/signin" replace />;
  }
  
  // If user is loading, show minimal loading interface
  if (loading) {
    return (
      <div className="container flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Icons.logo className="mx-auto h-10 w-10" />
          <h1 className="text-2xl font-semibold tracking-tight">
            {validMode === "signin" ? "Welcome back" : "Create an account"}
          </h1>
        </div>
        <AuthForm mode={validMode} />
      </div>
    </div>
  );
}
