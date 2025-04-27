
import { useParams, Navigate } from "react-router-dom";
import { Icons } from "@/components/ui/icons";
import AuthForm from "@/components/auth/AuthForm";

export default function AuthPage() {
  const { mode } = useParams<{ mode?: string }>();
  
  // Validate mode parameter, default to signin if invalid
  const validMode = mode === "signup" ? "signup" : "signin";

  // If no mode is specified in URL, redirect to the signin page
  if (!mode) {
    return <Navigate to="/auth/signin" replace />;
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
