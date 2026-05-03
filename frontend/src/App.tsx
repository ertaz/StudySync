import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { AuthProvider, useAuth } from "./context/AuthContext";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import AdminDashboard from "./pages/Admin/AdminDashboard";

// ── Protects routes from unauthenticated users ────────────────
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <span className="text-sm text-gray-400">Loading...</span>
      </div>
    );
  }
  if (!user) return <Navigate to="/signin" replace />;
  return <>{children}</>;
};

// ── Protects routes from non-admin users ──────────────────────
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <span className="text-sm text-gray-400">Loading...</span>
      </div>
    );
  }
  if (!user) return <Navigate to="/signin" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <span className="text-sm text-gray-400">Loading...</span>
      </div>
    );
  }

  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/signin" element={!user ? <SignIn /> : <Navigate to="/" replace />} />
      <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/" replace />} />

      {/* Admin route — protected + admin only */}
      <Route path="/admin" element={
        <AdminRoute>
          <AppLayout />
        </AdminRoute>
      }>
        <Route index element={<AdminDashboard />} />
      </Route>

      {/* Protected dashboard routes */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index path="/" element={<Home />} />
        <Route path="/profile"       element={<UserProfiles />} />
        <Route path="/calendar"      element={<Calendar />} />
        <Route path="/blank"         element={<Blank />} />
        <Route path="/form-elements" element={<FormElements />} />
        <Route path="/basic-tables"  element={<BasicTables />} />
        <Route path="/alerts"        element={<Alerts />} />
        <Route path="/avatars"       element={<Avatars />} />
        <Route path="/badge"         element={<Badges />} />
        <Route path="/buttons"       element={<Buttons />} />
        <Route path="/images"        element={<Images />} />
        <Route path="/videos"        element={<Videos />} />
        <Route path="/line-chart"    element={<LineChart />} />
        <Route path="/bar-chart"     element={<BarChart />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <ScrollToTop />
          <AppRoutes />
        </AuthProvider>
      </Router>
    </>
  );
}
