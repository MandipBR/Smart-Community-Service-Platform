import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Events from "./pages/Events.jsx";
import EventDetail from "./pages/EventDetail.jsx";
import Login from "./pages/Login.jsx";
import OrgLogin from "./pages/OrgLogin.jsx";
import OrgSignup from "./pages/OrgSignup.jsx";
import Signup from "./pages/Signup.jsx";
import SignupChoice from "./pages/SignupChoice.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import GoogleSuccess from "./pages/GoogleSuccess.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import OrgProfile from "./pages/OrgProfile.jsx";
import OrgPublicProfile from "./pages/OrgPublicProfile.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import VolunteerProfile from "./pages/VolunteerProfile.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import Notifications from "./pages/Notifications.jsx";
import MapView from "./pages/Map.jsx";
import AdminAnalytics from "./pages/AdminAnalytics.jsx";
import AdminLogs from "./pages/AdminLogs.jsx";
import Certificate from "./pages/Certificate.jsx";
import RecommendedEvents from "./pages/RecommendedEvents.jsx";
import NearbyEvents from "./pages/NearbyEvents.jsx";
import ImpactProfile from "./pages/ImpactProfile.jsx";
import ImpactDashboard from "./pages/ImpactDashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";
import { ROLES } from "./constants/roles.js";
import About from "./pages/About.jsx";
import FAQ from "./pages/FAQ.jsx";
import Contact from "./pages/Contact.jsx";
import ProfileHub from "./pages/ProfileHub.jsx";
import MyEvents from "./pages/MyEvents.jsx";
import OrgAnalytics from "./pages/OrgAnalytics.jsx";
import OrgImpact from "./pages/OrgImpact.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import AdminEvents from "./pages/AdminEvents.jsx";
import NotFound from "./pages/NotFound.jsx";
import Settings from "./pages/Settings.jsx";

export default function App() {
  return (
    <BrowserRouter>
      {/* Screen Reader Route Announcer */}
      <div id="route-announcer" className="sr-only" aria-live="assertive" aria-atomic="true"></div>

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/org-login"
          element={
            <PublicRoute>
              <OrgLogin />
            </PublicRoute>
          }
        />
        <Route
          path="/org-signup"
          element={
            <PublicRoute>
              <OrgSignup />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />
        <Route path="/signup-choice" element={<SignupChoice />} />
        <Route path="/verify/:token" element={<VerifyEmail />} />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={[ROLES.VOLUNTEER, ROLES.ORGANIZATION, ROLES.ADMIN]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={[ROLES.VOLUNTEER]}>
              <ProfileHub />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-events"
          element={
            <ProtectedRoute allowedRoles={[ROLES.VOLUNTEER]}>
              <MyEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/org/profile"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ORGANIZATION]}>
              <OrgProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/org/analytics"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ORGANIZATION]}>
              <OrgAnalytics />
            </ProtectedRoute>
          }
        />
        <Route path="/org/:id/impact" element={<OrgImpact />} />
        <Route
          path="/org/:id"
          element={
            <ProtectedRoute>
              <OrgPublicProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/logs"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminLogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminEvents />
            </ProtectedRoute>
          }
        />
        <Route path="/google-success" element={<GoogleSuccess />} />
        <Route
          path="/volunteer/:id"
          element={
            <ProtectedRoute>
              <VolunteerProfile />
            </ProtectedRoute>
          }
        />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={[ROLES.VOLUNTEER, ROLES.ORGANIZATION, ROLES.ADMIN]}>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route path="/map" element={<MapView />} />
        <Route
          path="/certificate/:logId"
          element={
            <ProtectedRoute>
              <Certificate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommended-events"
          element={
            <ProtectedRoute allowedRoles={[ROLES.VOLUNTEER, ROLES.ORGANIZATION, ROLES.ADMIN]}>
              <RecommendedEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nearby-events"
          element={
            <ProtectedRoute allowedRoles={[ROLES.VOLUNTEER, ROLES.ORGANIZATION, ROLES.ADMIN]}>
              <NearbyEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/impact-profile/:id"
          element={
            <ProtectedRoute>
              <ImpactProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/impact"
          element={
            <ProtectedRoute>
              <ImpactDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={[ROLES.VOLUNTEER, ROLES.ORGANIZATION, ROLES.ADMIN]}>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
