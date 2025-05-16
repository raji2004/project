import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AuthCallback from "./pages/auth/AuthCallback";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ChatForum from "./pages/chatforum";
import Orientation from "./pages/OrientationSub/Orientation";
import OrientationGuide from "./pages/OrientationSub/OrientationGuide";
import OrientationVids from "./pages/OrientationSub/OrientationVids";
import Resources from "./pages/ResourceSub/Resources";
import ResourcesLibrary from "./pages/ResourceSub/ResourcesLibrary";
import ResourcesPQ from "./pages/ResourceSub/ResourcesPQ";
import { useAuthStore } from "./stores/authStore";
import Schedule from "./pages/Schedule";
import Homepage from "./pages/Homepage/page";
import AdminLogin from "./pages/admin/AdminLogin";
import UploadResources from "./pages/admin/UploadResources";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminForum from "./pages/admin/AdminForum";

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin")
    return (
      <div className="p-8 text-center text-red-600">
        Access denied. Admins only.
      </div>
    );
  return <>{children}</>;
}

function App() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Router>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Route>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Homepage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/chat-forum" element={<ChatForum />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/orientation" element={<Orientation />} />
          <Route path="/orientationguide" element={<OrientationGuide />} />
          <Route path="/orientationvids" element={<OrientationVids />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/resourceslibrary" element={<ResourcesLibrary />} />
          <Route path="/resourcespq" element={<ResourcesPQ />} />
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/upload-resources"
          element={
            <AdminRoute>
              <UploadResources />
            </AdminRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        >
          <Route
            index
            element={
              <div className="text-2xl font-bold text-purple-700">
                Welcome to the Admin Dashboard
              </div>
            }
          />
          <Route path="users" element={<AdminUsers />} />
          <Route path="upload-resources" element={<UploadResources />} />
          <Route path="forum" element={<AdminForum />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
