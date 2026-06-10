import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AppLayout     from "./layout/AppLayout";
import { NotificationProvider } from "./context/NotificationContext";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { ZustandSync } from "./store/ZustandSync";

// ── Static imports (auth + layout kritik) ─────────────────────
import SignIn   from "./pages/AuthPages/SignIn";
import SignUp   from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";

import { Toaster } from "react-hot-toast";

// ── Lazy imports (route-based code splitting) ─────────────────
const Videos        = lazy(() => import("./pages/UiElements/Videos"));
const Images        = lazy(() => import("./pages/UiElements/Images"));
const Alerts        = lazy(() => import("./pages/UiElements/Alerts"));
const Badges        = lazy(() => import("./pages/UiElements/Badges"));
const Avatars       = lazy(() => import("./pages/UiElements/Avatars"));
const Buttons       = lazy(() => import("./pages/UiElements/Buttons"));
const LineChart     = lazy(() => import("./pages/Charts/LineChart"));
const BarChart      = lazy(() => import("./pages/Charts/BarChart"));
const Calendar      = lazy(() => import("./pages/Calendar"));
const BasicTables   = lazy(() => import("./pages/Tables/BasicTables"));
const FormElements  = lazy(() => import("./pages/Forms/FormElements"));
const Blank         = lazy(() => import("./pages/Blank"));

const Home          = lazy(() => import("./pages/Dashboard/Home"));
const AdminDashboard     = lazy(() => import("./pages/Admin/AdminDashboard"));
const EditCoursePage     = lazy(() => import("./pages/Admin/EditCoursePage"));
const CoursesPage        = lazy(() => import("./pages/CoursesPage"));
const CourseDetailPage   = lazy(() => import("./pages/CourseDetailPage"));
const AdminCoursesPage   = lazy(() => import("./pages/Admin/AdminCoursesPage"));
const CreateCoursePage   = lazy(() => import("./pages/Admin/CreateCoursePage"));
const AdminPanel         = lazy(() => import("./pages/Admin/AdminPanel"));
const AnnouncementsPage  = lazy(() => import("./pages/AnnouncementsPage"));
const CreateAnnouncementPage = lazy(() => import("./pages/CreateAnnouncementsPage"));
const CourseChatPage     = lazy(() => import("./components/chat/CourseChatPage"));
const EditAnnouncementPage   = lazy(() => import("./pages/EditAnnouncementPage"));
const ProfilePage        = lazy(() => import("./pages/Profile/ProfilePage"));
const AdminSettingsPage  = lazy(() => import("./pages/Admin/AdminSettingsPage"));
const CourseFAQs         = lazy(() => import("./pages/professor/CourseFAQs"));
const CourseFAQAccordion = lazy(() => import("./pages/student/CourseFAQAccordion"));
const ContactUs          = lazy(() => import("./pages/ContactUs"));
const ContactMessages    = lazy(() => import("./pages/Admin/ContactMessages"));

const AdminStudentsEnrollmentsPage = lazy(() => import("./pages/Admin/AdminStudentsEnrollmentsPage"));
const DynamicReport      = lazy(() => import("./pages/professor/DynamicReport"));
const Dashboard          = lazy(() => import("./pages/professor/Dashboard"));
const Assignments        = lazy(() => import("./pages/professor/Assignments"));
const AssignmentForm     = lazy(() => import("./pages/professor/AssignmentForm"));
const AssignmentDetail   = lazy(() => import("./pages/professor/AssignmentDetail"));
const AssignmentSubs     = lazy(() => import("./pages/professor/AssignmentSubs"));
const Stats              = lazy(() => import("./pages/professor/Stats"));
const DataTools          = lazy(() => import("./pages/professor/DataTools"));
const SubmissionForm     = lazy(() => import("./pages/student/SubmissionForm"));
const CourseFeedbackManagementPage = lazy(() => import("./pages/Admin/CourseFeedbackManagementPage"));
const AdminAuditLogsPage = lazy(
  () => import('./pages/Admin/AdminAuditLogsPage')
);

// ── Fallback spinner ──────────────────────────────────────────
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
    <span className="text-sm text-gray-400">Loading...</span>
  </div>
);

// ── Route guards ──────────────────────────────────────────────
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/signin" replace />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/signin" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return <>{children}</>;
};

// ── Routes ────────────────────────────────────────────────────
const AppRoutes = () => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;


return (
  <Suspense fallback={<PageLoader />}>
    <>
    <Toaster 
  position="top-right" 
  reverseOrder={false} 
  containerStyle={{
    zIndex: 999999,
  }}
/>

      <Routes>
        {/* Auth */}
        <Route path="/signin" element={!user ? <SignIn /> : <Navigate to="/" replace />} />
        <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/" replace />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminRoute><AppLayout /></AdminRoute>}>
          <Route index element={<AdminPanel />} />
          <Route path="professors" element={<AdminDashboard />} />
          <Route path="courses" element={<AdminCoursesPage />} />
          <Route path="students" element={<AdminStudentsEnrollmentsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="/admin/courses/create" element={<CreateCoursePage />} />
          <Route path="/admin/courses/edit/:id" element={<EditCoursePage />} />
          <Route path="audit-logs" element={<AdminAuditLogsPage />} />
        </Route>

        <Route path="/courses/:id/announcements" element={<AnnouncementsPage />} />
        <Route path="/courses/:id/announcements/create" element={<CreateAnnouncementPage />} />
        <Route path="/courses/:id/announcements/edit/:announcementId" element={<EditAnnouncementPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        <Route
          path="/contact"
          element={user?.role === "student" ? <ContactUs /> : <Navigate to="/" replace />}
        />
        <Route path="/admin/messages" element={<ContactMessages />} />

        <Route path="/faqs/:courseId" element={<CourseFAQs />} />
        <Route path="/faq-accordion/:courseId" element={<CourseFAQAccordion />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index path="/" element={<Home />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/blank" element={<Blank />} />
          <Route path="/form-elements" element={<FormElements />} />
          <Route path="/basic-tables" element={<BasicTables />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/avatars" element={<Avatars />} />
          <Route path="/badge" element={<Badges />} />
          <Route path="/buttons" element={<Buttons />} />
          <Route path="/images" element={<Images />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/line-chart" element={<LineChart />} />
          <Route path="/bar-chart" element={<BarChart />} />
          <Route path="/assignments/:assignmentId/submit" element={<SubmissionForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/assignments/new" element={<AssignmentForm />} />
          <Route path="/assignments/:id" element={<AssignmentDetail />} />
          <Route path="/assignments/:id/edit" element={<AssignmentForm />} />
          <Route path="/assignments/:id/submissions" element={<AssignmentSubs />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/data-tools" element={<DataTools />} />
          <Route path="/courses/:id/chat" element={<CourseChatPage />} />
          <Route path="/admin/course-feedback" element={<CourseFeedbackManagementPage />} />

          {/* Mbrojtja nga studenti */}
          <Route
            path="/dynamic-report"
            element={
              user?.role === "student"
                ? <Navigate to="/" replace />
                : <DynamicReport />
            }
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  </Suspense>
);
}


export default function App() {
  return (
     <Router>
      <AuthProvider>
        <NotificationProvider>
          <ZustandSync />
          <ScrollToTop />
          <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}