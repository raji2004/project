import React, { createContext, useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  Users,
  FileText,
  MessageSquare,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { path: "/admin/analytics", icon: BarChart3,    label: "Analytics" },
  { path: "/admin/users",     icon: Users,         label: "Users"     },
  { path: "/admin/resources", icon: FileText,     label: "Resources" },
  { path: "/admin/forum",     icon: MessageSquare, label: "Forum"     },
];

export const AdminLoadingContext = createContext<{
  setGlobalLoading: (loading: boolean) => void;
  globalLoading: boolean;
}>({ setGlobalLoading: () => {}, globalLoading: false });

export default function AdminLayout() {
  const location = useLocation();
  const [globalLoading, setGlobalLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen]       = useState(false);

  return (
    <AdminLoadingContext.Provider value={{ setGlobalLoading, globalLoading }}>
      <div className="relative min-h-screen flex gap-x-4">
        {/* Global loading overlay */}
        {globalLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700" />
          </div>
        )}

        {/* Mobile hamburger */}
        <button
          className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded shadow"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu className="h-6 w-6 text-purple-700" />
        </button>

        {/* Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 w-64 bg-white border-r border-purple-100 z-40
            transform transition-transform duration-200
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0 md:static md:inset-0 md:block
          `}
        >
          <div className="flex flex-col h-full">
            <div className="p-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-purple-700">Admin Panel</h1>
              <button
                className="md:hidden p-2"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <X className="h-6 w-6 text-purple-700" />
              </button>
            </div>

            <nav className="flex-1 px-4 space-y-1">
              {navItems.map(({ path, icon: Icon, label }) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${isActive
                        ? "bg-purple-100 text-purple-700"
                        : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"}
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-purple-100">
              <Link
                to="/dashboard"
                className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Back to User View</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar overlay"
          />
        )}

        {/* Main content area */}
        <main className="flex-1 bg-purple-50 px-4 md:px-8 pt-2 pb-4">
          <Outlet />
        </main>
      </div>
    </AdminLoadingContext.Provider>
  );
}
