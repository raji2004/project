import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  CheckCircle,
  XCircle,
  Download,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { useResourcesStore } from "../../stores/resourcesStore";

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

  // Batch upload state
  const { departments, fetchDepartments, uploadResource } = useResourcesStore();
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchDepartment, setBatchDepartment] = useState("");
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchDetails, setBatchDetails] = useState<BatchDetail[]>([]);
  const [batchUploading, setBatchUploading] = useState(false);
  const [batchError, setBatchError] = useState("");
  const [batchSuccess, setBatchSuccess] = useState("");

  interface BatchDetail {
    title: string;
    description: string;
    type: "pdf" | "video" | "link";
  }

  useEffect(() => {
    fetchResources();
    fetchDepartments();
  }, [fetchDepartments]);

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

  // When files are selected, initialize details
  function handleBatchFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setBatchFiles(files);
    setBatchDetails(
      files.map((f) => ({ title: f.name, description: "", type: "pdf" }))
    );
  }

  function handleBatchDetailChange(idx: number, field: string, value: string) {
    setBatchDetails((details) =>
      details.map((d, i) => (i === idx ? { ...d, [field]: value } : d))
    );
  }

  async function handleBatchUpload() {
    setBatchUploading(true);
    setBatchError("");
    setBatchSuccess("");
    if (!batchDepartment) {
      setBatchError("Please select a department.");
      setBatchUploading(false);
      return;
    }
    let anyError = false;
    for (let i = 0; i < batchFiles.length; i++) {
      const file = batchFiles[i];
      const details = batchDetails[i];
      try {
        await uploadResource({
          department_id: batchDepartment,
          title: details.title,
          description: details.description,
          file,
          type: details.type,
        });
      } catch {
        anyError = true;
      }
    }
    setBatchUploading(false);
    if (anyError) setBatchError("Some files failed to upload.");
    else setBatchSuccess("All files uploaded successfully!");
    setBatchFiles([]);
    setBatchDetails([]);
  }

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

      {/* Batch Upload Section */}
      <div className="mb-4">
        <button
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
          onClick={() => setBatchOpen((open) => !open)}
        >
          {batchOpen ? "Close Batch Upload" : "Batch Upload"}
        </button>
        {batchOpen && (
          <div className="mt-4 p-4 bg-white rounded shadow border border-purple-100">
            <div className="mb-4">
              <label className="block font-medium mb-1">Department</label>
              <select
                value={batchDepartment}
                onChange={(e) => setBatchDepartment(e.target.value)}
                className="w-full rounded border px-3 py-2"
              >
                <option value="">Select a department</option>
                {departments.map((dept: { id: string; name: string }) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Select Files</label>
              <input
                type="file"
                multiple
                onChange={handleBatchFiles}
                className="block w-full"
              />
            </div>
            {batchFiles.length > 0 && (
              <div className="space-y-4">
                {batchFiles.map((file, idx) => (
                  <div key={idx} className="p-2 border rounded mb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{file.name}</span>
                      <button
                        className="ml-auto text-red-500 hover:underline"
                        onClick={() => {
                          setBatchFiles((files) =>
                            files.filter((_, i) => i !== idx)
                          );
                          setBatchDetails((details) =>
                            details.filter((_, i) => i !== idx)
                          );
                        }}
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Title"
                      value={batchDetails[idx]?.title || ""}
                      onChange={(e) =>
                        handleBatchDetailChange(idx, "title", e.target.value)
                      }
                      className="w-full mb-2 rounded border px-2 py-1"
                    />
                    <textarea
                      placeholder="Description (optional)"
                      value={batchDetails[idx]?.description || ""}
                      onChange={(e) =>
                        handleBatchDetailChange(
                          idx,
                          "description",
                          e.target.value
                        )
                      }
                      className="w-full mb-2 rounded border px-2 py-1"
                    />
                    <select
                      value={batchDetails[idx]?.type || "pdf"}
                      onChange={(e) =>
                        handleBatchDetailChange(idx, "type", e.target.value)
                      }
                      className="w-full rounded border px-2 py-1"
                    >
                      <option value="pdf">PDF Document</option>
                      <option value="video">Video</option>
                      <option value="link">External Link</option>
                    </select>
                  </div>
                ))}
              </div>
            )}
            {batchError && (
              <div className="text-red-600 mt-2">{batchError}</div>
            )}
            {batchSuccess && (
              <div className="text-green-600 mt-2">{batchSuccess}</div>
            )}
            <button
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center"
              onClick={handleBatchUpload}
              disabled={
                batchUploading || !batchDepartment || batchFiles.length === 0
              }
            >
              {batchUploading ? (
                "Uploading..."
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload All
                </>
              )}
            </button>
          </div>
        )}
      </div>

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
