import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import {
  Calendar,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Users,
  GraduationCap,
  LayoutDashboard,
  Compass,
  Book,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { getAvatarUrl } from "../utils/avatar";
import NotificationBell from "./NotificationBell";

interface NavItem {
  path: string;
  label: string;
  hasNotification?: boolean;
  icon?: React.ElementType;
}

export default function Navbar() {
  const { user, signOut } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [hasUpcomingEvents, setHasUpcomingEvents] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user?.avatar_url) {
      setAvatarUrl(getAvatarUrl(user.avatar_url));
    }
  }, [user?.avatar_url]);

  useEffect(() => {
    checkUpcomingEvents();
  }, []);

  const checkUpcomingEvents = async () => {
    try {
      const now = new Date();
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .gt("start", now.toISOString())
        .order("start", { ascending: true })
        .limit(1);

      if (error) throw error;
      setHasUpcomingEvents(data && data.length > 0);
    } catch (error) {
      console.error("Error checking upcoming events:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const isAdmin = user?.role === "admin";

  const navItems: NavItem[] = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      path: "/schedule",
      label: "Schedule",
      icon: Calendar,
      hasNotification: hasUpcomingEvents,
    },
    {
      path: "/orientation",
      label: "Orientation",
      icon: Compass,
    },
    {
      path: "/resources",
      label: "Resources",
      icon: Book,
    },
    { path: "/chat-forum", label: "Forum", icon: MessageSquare },
  ];

  if (isAdmin) {
    navItems.push({ path: "/admin", label: "Admin", icon: Users });
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <GraduationCap className="h-8 w-8 text-purple-700" />
                <span className="text-xl font-bold text-purple-700">
                  Freshers
                </span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium
                    ${
                      location.pathname === item.path
                        ? "border-purple-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }
                  `}
                >
                  {item.icon && <item.icon className="h-4 w-4 mr-1" />}
                  {item.label}
                  {item.hasNotification && (
                    <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Desktop profile section */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <NotificationBell />
            <Link
              to="/profile"
              className="flex items-center space-x-2 text-gray-500 hover:text-gray-700"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-purple-200 flex items-center justify-center">
                  <span className="text-purple-700 font-medium">
                    {user?.email?.[0].toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-sm font-medium">Profile</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="text-gray-500 hover:text-gray-700"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center px-3 py-2 text-base font-medium
                  ${
                    location.pathname === item.path
                      ? "bg-purple-50 text-purple-700"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }
                `}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.icon && <item.icon className="h-5 w-5 mr-2" />}
                {item.label}
                {item.hasNotification && (
                  <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </Link>
            ))}
            <div className="px-3 py-2">
              <NotificationBell />
            </div>
            <Link
              to="/profile"
              className="flex items-center px-3 py-2 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="h-6 w-6 rounded-full mr-2"
                />
              ) : (
                <div className="h-6 w-6 rounded-full bg-purple-200 flex items-center justify-center mr-2">
                  <span className="text-purple-700 font-medium">
                    {user?.email?.[0].toUpperCase()}
                  </span>
                </div>
              )}
              Profile
            </Link>
            <button
              onClick={() => {
                handleSignOut();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
