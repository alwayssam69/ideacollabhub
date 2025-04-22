import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { Spinner } from '@/components/ui/spinner';
import AuthPage from '@/pages/AuthPage';
import DashboardPage from '@/pages/DashboardPage';
import OnboardingPage from '@/pages/OnboardingPage';
import VerifyEmailPage from '@/pages/VerifyEmailPage';
import ExplorePostsPage from '@/pages/ExplorePostsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const { isOnboardingComplete, isLoading: onboardingLoading } = useOnboarding();

  if (loading || onboardingLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" />;
  }

  if (!session.user.email_confirmed_at) {
    return <Navigate to="/verify-email" />;
  }

  if (!isOnboardingComplete) {
    return <Navigate to="/onboarding" />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Toaster position="top-center" />
      <Router>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/explore"
            element={
              <ProtectedRoute>
                <ExplorePostsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
