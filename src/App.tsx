import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AuthCallback from "./pages/auth/AuthCallback";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ChatForum from "./pages/chatforum";
import Orientation from "./pages/OrientationSub/Orientation";
import Resources from "./pages/ResourceSub/Resources";
import { useAuthStore } from "./stores/authStore";
import Schedule from "./pages/Schedule";
import Homepage from "./pages/Homepage/page";
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
          <Route path="/resources" element={<Resources />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
