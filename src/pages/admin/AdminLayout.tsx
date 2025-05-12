import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  BarChart3,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const navItems = [
  {
    path: "/admin",
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    path: "/admin/users",
    icon: Users,
    label: "Users",
  },
  {
    path: "/admin/resources",
    icon: FileText,
    label: "Resources",
  },
  {
    path: "/admin/forum",
    icon: MessageSquare,
    label: "Forum",
  },
  {
    path: "/admin/analytics",
    icon: BarChart3,
    label: "Analytics",
  },
];

export default function AdminLayout() {
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-purple-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-purple-100">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6">
            <h1 className="text-2xl font-bold text-purple-700">Admin Panel</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-purple-100 text-purple-700"
                      : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-purple-100">
            <button
              onClick={() => signOut()}
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}
