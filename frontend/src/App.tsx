import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import SignIn        from "./pages/AuthPages/SignIn";
import SignUp        from "./pages/AuthPages/SignUp";
import NotFound      from "./pages/OtherPage/NotFound";
import Videos        from "./pages/UiElements/Videos";
import Images        from "./pages/UiElements/Images";
import Alerts        from "./pages/UiElements/Alerts";
import Badges        from "./pages/UiElements/Badges";
import Avatars       from "./pages/UiElements/Avatars";
import Buttons       from "./pages/UiElements/Buttons";
import LineChart     from "./pages/Charts/LineChart";
import BarChart      from "./pages/Charts/BarChart";
import Calendar      from "./pages/Calendar";
import BasicTables   from "./pages/Tables/BasicTables";
import FormElements  from "./pages/Forms/FormElements";
import Blank         from "./pages/Blank";
import AppLayout     from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home          from "./pages/Dashboard/Home";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import EditCoursePage from "./pages/Admin/EditCoursePage";
import CoursesPage   from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import AdminCoursesPage from "./pages/Admin/AdminCoursesPage";
import CreateCoursePage from "./pages/Admin/CreateCoursePage";
import AdminPanel    from "./pages/Admin/AdminPanel";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import CreateAnnouncementPage from "./pages/CreateAnnouncementsPage";
import CourseChatPage from "./components/chat/CourseChatPage";
import EditAnnouncementPage from "./pages/EditAnnouncementPage";
import ProfilePage from './pages/Profile/ProfilePage';
import AdminSettingsPage from "./pages/Admin/AdminSettingsPage";

// ── NEW ──────────────────────────────────────────────────────
import AdminStudentsEnrollmentsPage from "./pages/Admin/AdminStudentsEnrollmentsPage";
import DynamicReport from "./pages/professor/DynamicReport";

import Dashboard      from "./pages/professor/Dashboard";
import Assignments    from "./pages/professor/Assignments";
import AssignmentForm from "./pages/professor/AssignmentForm";
import AssignmentDetail from "./pages/professor/AssignmentDetail";
import AssignmentSubs from "./pages/professor/AssignmentSubs";
import Stats          from "./pages/professor/Stats";
import DataTools      from "./pages/professor/DataTools";
import SubmissionForm from "./pages/student/SubmissionForm";
import CourseFeedbackManagementPage
from './pages/Admin/CourseFeedbackManagementPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
      <span className="text-sm text-gray-400">Loading...</span>
    </div>
  );
  if (!user) return <Navigate to="/signin" replace />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
      <span className="text-sm text-gray-400">Loading...</span>
    </div>
  );
  if (!user) return <Navigate to="/signin" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
      <span className="text-sm text-gray-400">Loading...</span>
    </div>
  );

  return (
    <Routes>
      {/* Auth */}
      <Route path="/signin" element={!user ? <SignIn />  : <Navigate to="/" replace />} />
      <Route path="/signup" element={!user ? <SignUp />  : <Navigate to="/" replace />} />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminRoute><AppLayout /></AdminRoute>}>
        <Route index                element={<AdminPanel />} />
        <Route path="professors"    element={<AdminDashboard />} />
        <Route path="courses"       element={<AdminCoursesPage />} />
        <Route path="students"      element={<AdminStudentsEnrollmentsPage />} />  {/* ← NEW */}
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>
      <Route path="/admin/courses/create"   element={<CreateCoursePage />} />
      <Route path="/admin/courses/edit/:id" element={<EditCoursePage />} />
      <Route path="/courses/:id/announcements" element={<AnnouncementsPage />} />
      <Route path="/courses/:id/announcements/create" element={<CreateAnnouncementPage />} />
      <Route path="/courses/:id/announcements/edit/:announcementId" element={<EditAnnouncementPage />} />
      <Route path="/profile" element={<ProfilePage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index path="/"              element={<Home />} />
        <Route path="/courses"             element={<CoursesPage />} />
        <Route path="/courses/:id"         element={<CourseDetailPage />} />
        <Route path="/calendar"            element={<Calendar />} />
        <Route path="/blank"               element={<Blank />} />
        <Route path="/form-elements"       element={<FormElements />} />
        <Route path="/basic-tables"        element={<BasicTables />} />
        <Route path="/alerts"              element={<Alerts />} />
        <Route path="/avatars"             element={<Avatars />} />
        <Route path="/badge"               element={<Badges />} />
        <Route path="/buttons"             element={<Buttons />} />
        <Route path="/images"              element={<Images />} />
        <Route path="/videos"              element={<Videos />} />
        <Route path="/line-chart"          element={<LineChart />} />
        <Route path="/bar-chart"           element={<BarChart />} />
        <Route path="/assignments/:assignmentId/submit" element={<SubmissionForm />} />
        <Route path="/dashboard"           element={<Dashboard />} />
        <Route path="/assignments"         element={<Assignments />} />
        <Route path="/assignments/new"     element={<AssignmentForm />} />
        <Route path="/assignments/:id"     element={<AssignmentDetail />} />
        <Route path="/assignments/:id/edit" element={<AssignmentForm />} />
        <Route path="/assignments/:id/submissions" element={<AssignmentSubs />} />
        <Route path="/stats"               element={<Stats />} />
        <Route path="/data-tools"          element={<DataTools />} />
        <Route path="/courses/:id/chat" element={<CourseChatPage />} />
        <Route
  path="/admin/course-feedback"
  element={
    <CourseFeedbackManagementPage />
  }
/>
        
        {/* MBROJTJA NGA STUDENTI (Nëse është student, e kthen në / ) */}
        <Route 
          path="/dynamic-report" 
          element={user?.role === "student" ? <Navigate to="/" replace /> : <DynamicReport />} 
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}