import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from '@/context/AuthContext';
import { ConnectionProvider } from '@/context/ConnectionContext';
import { MessageProvider } from '@/context/MessageContext';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'sonner';

// Pages
import AuthPage from "./pages/AuthPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import MainLayout from "./components/layout/MainLayout";

const queryClient = new QueryClient();

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { loading: onboardingLoading } = useOnboarding();

  if (authLoading || onboardingLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" /> : <Navigate to="/auth" />}
      />
      <Route
        path="/auth"
        element={user ? <Navigate to="/dashboard" /> : <AuthPage />}
      />
      <Route
        path="/onboarding"
        element={user ? <OnboardingPage /> : <Navigate to="/auth" />}
      />
      <Route
        path="/dashboard"
        element={
          <MainLayout>
            <DashboardPage />
          </MainLayout>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <AuthProvider>
          <ConnectionProvider>
            <MessageProvider>
              <BrowserRouter>
                <AppContent />
                <Toaster />
              </BrowserRouter>
            </MessageProvider>
          </ConnectionProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
