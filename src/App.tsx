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
import Onboarding from '@/pages/Onboarding';

import MainLayout from "./components/layout/MainLayout";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import DiscoverPage from "./pages/DiscoverPage";
import ProjectsPage from "./pages/ProjectsPage";
import ConnectionsPage from "./pages/ConnectionsPage";
import MessagesPage from "./pages/MessagesPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import OnboardingPage from "./pages/OnboardingPage";
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

const queryClient = new QueryClient();

const App = () => {
  const { loading } = useOnboarding();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <AuthProvider>
          <ConnectionProvider>
            <MessageProvider>
              <BrowserRouter>
                <TooltipProvider>
                  <Routes>
                    <Route path="/" element={<MainLayout />}>
                      <Route index element={<Index />} />
                      <Route path="discover" element={<ProtectedRoute><DiscoverPage /></ProtectedRoute>} />
                      <Route path="projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
                      <Route path="connections" element={<ProtectedRoute><ConnectionsPage /></ProtectedRoute>} />
                      <Route path="messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
                      <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                      <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                      <Route path="notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                      <Route path="pending-requests" element={<ProtectedRoute><PendingRequestsPage /></ProtectedRoute>} />
                      <Route path="explore-posts" element={<ProtectedRoute><ExplorePostsPage /></ProtectedRoute>} />
                      <Route path="settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                      <Route path="about" element={<AboutPage />} />
                      <Route path="privacy" element={<PrivacyPage />} />
                      <Route path="terms" element={<TermsPage />} />
                      <Route path="contact" element={<ContactPage />} />
                      <Route path="faq" element={<FAQPage />} />
                    </Route>
                    <Route path="/auth/:mode" element={<AuthPage />} />
                    <Route path="/onboarding" element={<OnboardingPage />} />
                    <Route path="/login" element={<Login />} />
                  </Routes>
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
