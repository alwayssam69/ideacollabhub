
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from '@/context/AuthContext';
import { ConnectionProvider } from '@/context/ConnectionContext';
import { MessageProvider } from '@/context/MessageContext';
import PrivateRoute from '@/components/PrivateRoute';
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
// Import OnboardingPage as a default import
import OnboardingPage from '@/pages/OnboardingPage';

import MainLayout from "./components/layout/MainLayout";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import DiscoverPage from "./pages/DiscoverPage";
import ProjectsPage from "./pages/ProjectsPage";
import ConnectionsPage from "./pages/ConnectionsPage";
import MessagesPage from "./pages/MessagesPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import DashboardPage from "./pages/DashboardPage";
import NotificationsPage from "./pages/NotificationsPage";
import PendingRequestsPage from "./pages/PendingRequestsPage";
import ExplorePostsPage from "./pages/ExplorePostsPage";
import SettingsPage from "./pages/SettingsPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AboutPage from "./pages/AboutPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import ContactPage from "./pages/ContactPage";
import FAQPage from "./pages/FAQPage";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/auth/AuthForm';
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient();

const AppContent = () => {
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
        element={user ? <Navigate to="/dashboard" /> : <AuthForm />}
      />
      <Route
        path="/onboarding"
        element={user ? <OnboardingPage /> : <Navigate to="/auth" />}
      />
      <Route
        path="/dashboard"
        element={user ? <DashboardPage /> : <Navigate to="/auth" />}
      />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <AuthProvider>
          <ConnectionProvider>
            <MessageProvider>
              <BrowserRouter>
                <TooltipProvider>
                  <AppContent />
                  <Toaster />
                  <Sonner />
                </TooltipProvider>
              </BrowserRouter>
            </MessageProvider>
          </ConnectionProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
