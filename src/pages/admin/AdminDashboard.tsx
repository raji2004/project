import React, { useState, useEffect } from "react";
import AdminUsers from "./AdminUsers";
import UploadResources from "./UploadResources";
import AdminForum from "./AdminForum";
import {
  Users,
  FileText,
  MessageSquare,
  LayoutDashboard,
  Menu,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

interface Stats {
  totalUsers: number;
  totalPosts: number;
  totalResources: number;
  totalDownloads: number;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: "users",
      label: "User Management",
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: "upload-resources",
      label: "Resource Management",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      id: "forum",
      label: "Forum Moderation",
      icon: <MessageSquare className="w-5 h-5" />,
    },
  ];

  useEffect(() => {
    if (activeTab === "dashboard") fetchStats();
    // eslint-disable-next-line
  }, [activeTab]);

  async function fetchStats() {
    setLoading(true);
    // Fetch analytics (example: total users, posts, resources, downloads)
    const [
      { count: totalUsers },
      { count: totalPosts },
      { count: totalResources },
      { count: totalDownloads },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("forum_posts").select("*", { count: "exact", head: true }),
      supabase.from("resources").select("*", { count: "exact", head: true }),
      supabase
        .from("resource_downloads")
        .select("*", { count: "exact", head: true }),
    ]);
    setStats({
      totalUsers: totalUsers || 0,
      totalPosts: totalPosts || 0,
      totalResources: totalResources || 0,
      totalDownloads: totalDownloads || 0,
    });
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-purple-50">
      {/* Mobile Hamburger */}
      <div className="md:hidden relative z-50">
        <button
          className="bg-white p-2 rounded shadow m-4"
          onClick={() => setDropdownOpen((open) => !open)}
          aria-label="Open navigation menu"
        >
          <Menu className="w-6 h-6 text-purple-700" />
        </button>
        {/* Mobile Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute left-4 mt-2 w-56 bg-white rounded-lg shadow-lg z-50 border border-purple-100 animate-fade-in">
            <nav className="flex flex-col py-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setDropdownOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors text-purple-800 hover:bg-purple-100 hover:text-purple-900 ${
                    activeTab === tab.id
                      ? "bg-purple-100 text-purple-900 font-bold"
                      : ""
                  }`}
                >
                  {tab.icon}
                  <span className="inline-block">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        )}
        {/* Overlay to close dropdown when clicking outside */}
        {dropdownOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setDropdownOpen(false)}
            aria-label="Close navigation menu"
          />
        )}
      </div>
      {/* Sidebar for desktop */}
      <aside
        className="hidden md:flex md:fixed md:inset-y-0 md:left-0 md:w-64 bg-white shadow-lg flex-col py-8 px-4 z-40"
        style={{ minHeight: "100vh" }}
      >
        <h2 className="text-2xl font-bold text-purple-700 mb-8 text-center">
          Admin
        </h2>
        <nav className="flex-1 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors w-full text-left text-purple-800 hover:bg-purple-100 hover:text-purple-900 ${
                activeTab === tab.id
                  ? "bg-purple-100 text-purple-900 font-bold"
                  : ""
              }`}
            >
              {tab.icon}
              <span className="inline-block">{tab.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 md:ml-64">
        <div className="space-y-8">
          <h1 className="text-2xl font-bold text-purple-700">
            {tabs.find((tab) => tab.id === activeTab)?.label}
          </h1>
          <div className="mt-4">
            {activeTab === "dashboard" && (
              <div>
                <h2 className="text-xl font-bold mb-4 text-purple-700">
                  System Analytics
                </h2>
                {loading ? (
                  <div className="text-gray-500">Loading analytics...</div>
                ) : stats ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
                      <Users className="h-8 w-8 text-purple-500 mb-2" />
                      <div className="text-3xl font-bold text-purple-900">
                        {stats.totalUsers}
                      </div>
                      <div className="text-gray-600 mt-1">Total Users</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
                      <MessageSquare className="h-8 w-8 text-purple-500 mb-2" />
                      <div className="text-3xl font-bold text-purple-900">
                        {stats.totalPosts}
                      </div>
                      <div className="text-gray-600 mt-1">Forum Posts</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
                      <FileText className="h-8 w-8 text-purple-500 mb-2" />
                      <div className="text-3xl font-bold text-purple-900">
                        {stats.totalResources}
                      </div>
                      <div className="text-gray-600 mt-1">Resources</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
                      <LayoutDashboard className="h-8 w-8 text-purple-500 mb-2" />
                      <div className="text-3xl font-bold text-purple-900">
                        {stats.totalDownloads}
                      </div>
                      <div className="text-gray-600 mt-1">
                        Resource Downloads
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">No analytics data.</div>
                )}
              </div>
            )}
            {activeTab === "users" && <AdminUsers />}
            {activeTab === "upload-resources" && <UploadResources />}
            {activeTab === "forum" && <AdminForum />}
          </div>
        </div>
      </main>
    </div>
  );
}
