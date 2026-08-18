import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useUser } from "./context/UserContext.jsx";
import AppLayout from "./components/AppLayout.jsx";
import logo from "./assets/logo.png";
import Analytics from "./pages/Analytics.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import History from "./pages/History.jsx";
import Landing from "./pages/Landing.jsx";
import LiveInspection from "./pages/LiveInspection.jsx";
import Settings from "./pages/Settings.jsx";
import VideoUpload from "./pages/VideoUpload.jsx";
import Profile from "./pages/Profile.jsx";
import AccountSettings from "./pages/AccountSettings.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import ActivityLogs from "./pages/ActivityLogs.jsx";
import SignIn from "./pages/SignIn.jsx";
import LogIn from "./pages/LogIn.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { token } = useUser();
  return token ? children : <Navigate to="/log-in" replace />;
}

export default function App() {
  const { token } = useUser();
  const location = useLocation();

  useEffect(() => {
    try { console.log('[Route] location changed', { pathname: location.pathname }); } catch (e) {}
  }, [location]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/sign-in" element={token ? <Navigate to="/app" replace /> : <SignIn />} />
      <Route path="/log-in" element={token ? <Navigate to="/app" replace /> : <LogIn />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected routes */}
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/account-settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
      <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
      <Route path="/activity-logs" element={<ProtectedRoute><ActivityLogs /></ProtectedRoute>} />

      {/* Dashboard and app routes */}
      <Route path="/app" element={<ProtectedRoute><AppLayout logo={logo} /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="live" element={<LiveInspection />} />
        <Route path="upload" element={<VideoUpload />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="history" element={<History />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
