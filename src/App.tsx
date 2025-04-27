
import AuthPage from '@/pages/AuthPage';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from "@/components/ui/toaster";
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from '@/pages/DashboardPage';
import ExplorePostsPage from '@/pages/ExplorePostsPage';
import DiscoverPage from '@/pages/DiscoverPage';
import ProjectsPage from '@/pages/ProjectsPage';
import ConnectionsPage from '@/pages/ConnectionsPage';
import MessagesPage from '@/pages/MessagesPage';
import OnboardingPage from '@/pages/OnboardingPage';
import NotificationsPage from '@/pages/NotificationsPage';
import SettingsPage from '@/pages/SettingsPage';
import ProfilePage from '@/pages/ProfilePage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import FAQPage from '@/pages/FAQPage';
import PrivacyPage from '@/pages/PrivacyPage';
import TermsPage from '@/pages/TermsPage';
import PendingRequestsPage from '@/pages/PendingRequestsPage';
import { QueryProvider } from './components/QueryProvider';
import UserProfilePage from '@/pages/UserProfilePage';

function App() {
  return (
    <QueryProvider>
      <Toaster />
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/:mode" element={<AuthPage />} />
            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route index element={<Index />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="explore" element={<ExplorePostsPage />} />
              <Route path="discover" element={<DiscoverPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="connections" element={<ConnectionsPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="onboarding" element={<OnboardingPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="profile/:id" element={<UserProfilePage />} /> 
              <Route path="about" element={<AboutPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="faq" element={<FAQPage />} />
              <Route path="privacy" element={<PrivacyPage />} />
              <Route path="terms" element={<TermsPage />} />
              <Route path="pending-requests" element={<PendingRequestsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryProvider>
  );
}

export default App;
