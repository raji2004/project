import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  FileText,
  CheckCircle,
  XCircle,
  Download,
  Search,
  Filter,
  Trash2,
} from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  downloads: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  author: {
    full_name: string;
  };
}

export default function AdminResources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchResources();
  }, []);

  async function fetchResources() {
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase
        .from("resources")
        .select("*, author:profiles!inner(full_name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (err) {
      setError("Failed to fetch resources");
      console.error(err);
    }
    setLoading(false);
  }

  async function updateResourceStatus(
    resourceId: string,
    status: "approved" | "rejected"
  ) {
    setActionLoading(resourceId);
    try {
      const { error } = await supabase
        .from("resources")
        .update({ status })
        .eq("id", resourceId);

      if (error) throw error;
      await fetchResources();
    } catch (err) {
      setError("Failed to update resource status");
      console.error(err);
    }
    setActionLoading(null);
  }

  async function deleteResource(resourceId: string) {
    setActionLoading(resourceId);
    try {
      const { error } = await supabase
        .from("resources")
        .delete()
        .eq("id", resourceId);

      if (error) throw error;
      await fetchResources();
    } catch (err) {
      setError("Failed to delete resource");
      console.error(err);
    }
    setActionLoading(null);
  }

  async function bulkUpdateStatus(status: "approved" | "rejected") {
    setActionLoading("bulk-update");
    try {
      const { error } = await supabase
        .from("resources")
        .update({ status })
        .in("id", selectedResources);

      if (error) throw error;
      await fetchResources();
      setSelectedResources([]);
    } catch (err) {
      setError("Failed to update resources");
      console.error(err);
    }
    setActionLoading(null);
  }

  async function bulkDelete() {
    setActionLoading("bulk-delete");
    try {
      const { error } = await supabase
        .from("resources")
        .delete()
        .in("id", selectedResources);

      if (error) throw error;
      await fetchResources();
      setSelectedResources([]);
    } catch (err) {
      setError("Failed to delete resources");
      console.error(err);
    }
    setActionLoading(null);
  }

  const filteredResources = resources.filter(
    (resource) =>
      (statusFilter === "all" || resource.status === statusFilter) &&
      (resource.title.toLowerCase().includes(search.toLowerCase()) ||
        resource.description.toLowerCase().includes(search.toLowerCase()) ||
        resource.author.full_name.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-purple-700">
        Resource Management
      </h1>

      {/* Filters and Actions */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources..."
            className="w-full rounded-md border border-purple-200 px-4 py-2 pl-10 bg-purple-50 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
          />
          <Search className="absolute left-2 top-2.5 text-purple-400 h-5 w-5" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="rounded-md border border-purple-200 px-4 py-2 bg-purple-50 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        {selectedResources.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => bulkUpdateStatus("approved")}
              disabled={actionLoading === "bulk-update"}
              className="px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
            >
              Approve Selected
            </button>
            <button
              onClick={() => bulkUpdateStatus("rejected")}
              disabled={actionLoading === "bulk-update"}
              className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              Reject Selected
            </button>
            <button
              onClick={bulkDelete}
              disabled={actionLoading === "bulk-delete"}
              className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {error && <div className="text-red-600">{error}</div>}

      {/* Resources List */}
      <div className="grid gap-4">
        {filteredResources.map((resource) => (
          <div
            key={resource.id}
            className="bg-white rounded-lg shadow-sm border border-purple-100 p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={selectedResources.includes(resource.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedResources([...selectedResources, resource.id]);
                    } else {
                      setSelectedResources(
                        selectedResources.filter((id) => id !== resource.id)
                      );
                    }
                  }}
                  className="mt-1 accent-purple-500"
                />
                <div>
                  <h3 className="font-semibold text-purple-900">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {resource.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>By {resource.author.full_name}</span>
                    <span>•</span>
                    <span>
                      {new Date(resource.created_at).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      {resource.downloads} downloads
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {resource.status === "pending" && (
                  <>
                    <button
                      onClick={() =>
                        updateResourceStatus(resource.id, "approved")
                      }
                      disabled={actionLoading === resource.id}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                      title="Approve"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() =>
                        updateResourceStatus(resource.id, "rejected")
                      }
                      disabled={actionLoading === resource.id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      title="Reject"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => deleteResource(resource.id)}
                  disabled={actionLoading === resource.id}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  resource.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : resource.status === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {resource.status.charAt(0).toUpperCase() +
                  resource.status.slice(1)}
              </span>
              <span className="text-xs text-gray-500">
                {resource.file_type.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
