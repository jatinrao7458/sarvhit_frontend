import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './layouts/AppLayout/AppLayout';
import LandingPage from './pages/Landing/LandingPage';
import AuthPage from './pages/Auth/AuthPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ActivityDetailPage from './pages/Dashboard/ActivityDetailPage';
import EventsPage from './pages/Events/EventsPage';
import EventDetailPage from './pages/Events/EventDetailPage';
import MyEventsPage from './pages/Events/MyEventsPage';
import ProfilePage from './pages/Profile/ProfilePage';
import ImpactMapPage from './pages/ImpactMap/ImpactMapPage';
import LeaderboardPage from './pages/Leaderboard/LeaderboardPage';
import UserProfilePage from './pages/UserProfile/UserProfilePage';
import DiscoverPage from './pages/Discover/DiscoverPage';
import DiscoverDetailPage from './pages/Discover/DiscoverDetailPage';
import MessagesPage from './pages/Messages/MessagesPage';
// NGO pages
import CreateEventPage from './pages/NGO/CreateEventPage';
import ReportsPage from './pages/NGO/ReportsPage';
import ManageTeamPage from './pages/NGO/ManageTeamPage';
import HostedEventsPage from './pages/NGO/HostedEventsPage';
import EventReportPage from './pages/NGO/EventReportPage';
// Volunteer pages
import LogHoursPage from './pages/Volunteer/LogHoursPage';
import BadgesPage from './pages/Volunteer/BadgesPage';
import MyNgoPage from './pages/Volunteer/MyNgoPage';
// Sponsor pages
import BrowseProjectsPage from './pages/Sponsor/BrowseProjectsPage';
import ImpactReportPage from './pages/Sponsor/ImpactReportPage';
import TaxReceiptsPage from './pages/Sponsor/TaxReceiptsPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/app/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
      <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="activity/:id" element={<ActivityDetailPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="events/:id" element={<EventDetailPage />} />
        <Route path="my-events" element={<MyEventsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="impact-map" element={<ImpactMapPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="user/:id" element={<UserProfilePage />} />
        <Route path="discover" element={<DiscoverPage />} />
        <Route path="discover/:type/:id" element={<DiscoverDetailPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="settings" element={<Navigate to="/app/profile" replace />} />
        {/* NGO routes */}
        <Route path="ngo/create-event" element={<CreateEventPage />} />
        <Route path="ngo/reports" element={<ReportsPage />} />
        <Route path="ngo/manage-team" element={<ManageTeamPage />} />
        <Route path="ngo/hosted-events" element={<HostedEventsPage />} />
        <Route path="ngo/event-report/:eventId" element={<EventReportPage />} />
        {/* Volunteer routes */}
        <Route path="volunteer/log-hours" element={<LogHoursPage />} />
        <Route path="volunteer/badges" element={<BadgesPage />} />
        <Route path="volunteer/my-ngo" element={<MyNgoPage />} />
        {/* Sponsor routes */}
        <Route path="sponsor/browse-projects" element={<BrowseProjectsPage />} />
        <Route path="sponsor/impact-report" element={<ImpactReportPage />} />
        <Route path="sponsor/tax-receipts" element={<TaxReceiptsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
import AIChatbot from './components/AIChatbot/AIChatbot';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <AIChatbot />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
