
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from '@/context/AuthContext';
import { ConnectionProvider } from '@/context/ConnectionContext';
import { MessageProvider } from '@/context/MessageContext';
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import OnboardingPage from '@/pages/OnboardingPage';
import VerifyEmailPage from '@/pages/VerifyEmailPage';

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
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/auth/AuthForm';
import { Loader2 } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';

// Create a QueryClient for React Query
const queryClient = new QueryClient();

// Default export for App component
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <AuthProvider>
            <ConnectionProvider>
              <MessageProvider>
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<MainLayout />}>
                      <Route index element={<Index />} />
                      <Route path="auth/:mode" element={<AuthPage />} />
                      <Route path="login" element={<Login />} />
                      <Route path="onboarding" element={<OnboardingPage />} />
                      <Route path="verify-email" element={<VerifyEmailPage />} />
                      <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                      <Route path="dashboard-v2" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                      <Route path="discover" element={<DiscoverPage />} />
                      <Route path="projects" element={<ProjectsPage />} />
                      <Route path="connections" element={<ProtectedRoute><ConnectionsPage /></ProtectedRoute>} />
                      <Route path="pending-requests" element={<ProtectedRoute><PendingRequestsPage /></ProtectedRoute>} />
                      <Route path="messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
                      <Route path="profile/:userId" element={<ProfilePage />} />
                      <Route path="notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                      <Route path="explore" element={<ExplorePostsPage />} />
                      <Route path="settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                      <Route path="about" element={<AboutPage />} />
                      <Route path="privacy" element={<PrivacyPage />} />
                      <Route path="terms" element={<TermsPage />} />
                      <Route path="contact" element={<ContactPage />} />
                      <Route path="faq" element={<FAQPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Routes>
                </BrowserRouter>
                <Toaster />
                <Sonner />
              </MessageProvider>
            </ConnectionProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
