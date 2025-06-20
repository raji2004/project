import React, { useState, useEffect, useContext } from "react";
import { useResourcesStore } from "../../stores/resourcesStore";
import { useAuthStore } from "../../stores/authStore";
import { Upload, Trash2, FileUp } from "lucide-react";
import { AdminLoadingContext } from "./AdminLayout";

interface ValidationErrors {
  department?: string;
  title?: string;
  file?: string;
  type?: string;
}

// Add a new function to simulate backend upload
async function uploadResourceToBackend(resource: {
  department_id: string;
  title: string;
  description: string | null;
  file: File | null;
  type: "pdf" | "video" | "link";
  flow: string;
}) {
  // Simulate API call
  console.log("Uploading resource to backend:", resource);
  // In a real app, you would call your API here, e.g.:
  // await fetch('/api/resources', { method: 'POST', body: JSON.stringify(resource) });
  return Promise.resolve();
}

export default function UploadResources() {
  const { user } = useAuthStore();
  const {
    departments,
    resources,
    loading,
    error,
    fetchDepartments,
    fetchResourcesByDepartment,
    uploadResource,
    deleteResource,
  } = useResourcesStore();
  const { setGlobalLoading } = useContext(AdminLoadingContext);

  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<"pdf" | "video" | "link">("pdf");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  // Batch upload states
  const [showBatchUpload, setShowBatchUpload] = useState(false);
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchDetails, setBatchDetails] = useState<
    { title: string; description: string; type: "pdf" | "video" | "link" }[]
  >([]);
  const [batchType, setBatchType] = useState<"pdf" | "video" | "link">("pdf");
  const [batchUploading, setBatchUploading] = useState(false);
  const [batchError, setBatchError] = useState("");
  const [batchSuccess, setBatchSuccess] = useState("");
  const [batchUrls, setBatchUrls] = useState<
    { title: string; description: string; url: string }[]
  >([]);

  const [flow, setFlow] = useState<string>("resources");

  useEffect(() => {
    setGlobalLoading(true);
    fetchDepartments().finally(() => setGlobalLoading(false));
  }, [fetchDepartments]);

  useEffect(() => {
    if (selectedDepartment) {
      setGlobalLoading(true);
      fetchResourcesByDepartment(selectedDepartment).finally(() =>
        setGlobalLoading(false)
      );
    }
  }, [selectedDepartment, fetchResourcesByDepartment]);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!selectedDepartment) {
      errors.department = "Please select a department";
    }

    if (!title.trim()) {
      errors.title = "Title is required";
    }

    if (!file && type !== "link") {
      errors.file = "Please select a file";
    }

    if (!type) {
      errors.type = "Please select a resource type";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    if (!validateForm() || !file) return;

    try {
      console.log("Uploading resource with:", {
        department_id: selectedDepartment,
        title,
        description: description || null,
        file,
        type
      });
      await uploadResource({
        department_id: selectedDepartment,
        title,
        description: description || null,
        file,
        type
      });
      console.log("Resource upload completed");
      // Reset form
      setTitle("");
      setDescription("");
      setFile(null);
      setType("pdf");
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  const handleDelete = async (resourceId: string) => {
    if (!selectedDepartment) return;
    if (window.confirm("Are you sure you want to delete this resource?")) {
      try {
        await deleteResource(resourceId, selectedDepartment);
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  const handleBatchFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setBatchFiles(files);
    setBatchDetails(
      files.map((f) => ({ title: f.name, description: "", type: "pdf" }))
    );
  };

  const handleBatchDetailChange = (
    idx: number,
    field: string,
    value: string
  ) => {
    setBatchDetails((details) =>
      details.map((d, i) => (i === idx ? { ...d, [field]: value } : d))
    );
  };

  const addBatchUrl = () => {
    setBatchUrls([...batchUrls, { title: "", description: "", url: "" }]);
  };

  const updateBatchUrl = (idx: number, field: string, value: string) => {
    setBatchUrls((urls) =>
      urls.map((url, i) => (i === idx ? { ...url, [field]: value } : url))
    );
  };

  const removeBatchUrl = (idx: number) => {
    setBatchUrls((urls) => urls.filter((_, i) => i !== idx));
  };

  const handleBatchUpload = async () => {
    setBatchUploading(true);
    setBatchError("");
    setBatchSuccess("");
    if (!selectedDepartment) {
      setBatchError("Please select a department.");
      setBatchUploading(false);
      return;
    }
    let anyError = false;
    if (batchType === "pdf") {
      for (let i = 0; i < batchFiles.length; i++) {
        const file = batchFiles[i];
        const details = batchDetails[i];
        try {
          await uploadResourceToBackend({
            department_id: selectedDepartment,
            title: details.title,
            description: details.description,
            file,
            type: details.type,
            flow,
          });
        } catch {
          anyError = true;
        }
      }
    } else {
      // Handle video/link URLs
      for (const urlEntry of batchUrls) {
        try {
          await uploadResourceToBackend({
            department_id: selectedDepartment,
            title: urlEntry.title,
            description: urlEntry.description,
            file: new File([], "dummy.txt"), // Dummy file for video/link
            type: batchType,
            flow,
          });
        } catch {
          anyError = true;
        }
      }
    }
    setBatchUploading(false);
    if (anyError) setBatchError("Some uploads failed.");
    else setBatchSuccess("All uploads successful!");
    setBatchFiles([]);
    setBatchDetails([]);
    setBatchUrls([]);
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          Please sign in to access this page.
        </div>
      </div>
    );
  }

  if (loading) {
    return null; // spinner is now global
  }

  return (
    <div className="max-w-5xl w-full p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Upload Lecture Resources
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={() => setShowBatchUpload(!showBatchUpload)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
        >
          <FileUp className="h-4 w-4" />
          {showBatchUpload ? "Hide Batch Upload" : "Show Batch Upload"}
        </button>
      </div>

      {showBatchUpload && (
        <div className="mb-8 p-4 bg-white rounded-lg shadow border border-purple-100">
          <h2 className="text-lg font-semibold text-purple-900 mb-4">
            Batch Upload
          </h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resource Type
            </label>
            <select
              value={batchType}
              onChange={(e) =>
                setBatchType(e.target.value as "pdf" | "video" | "link")
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="pdf">PDF Document</option>
              <option value="video">Youtube Link</option>
              <option value="link">External Link</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Flow
            </label>
            <select
              value={flow}
              onChange={(e) => setFlow(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="resources">Resources</option>
              <option value="orientation">Orientation</option>
            </select>
          </div>
          {batchType === "pdf" ? (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Files
              </label>
              <input
                type="file"
                multiple
                onChange={handleBatchFiles}
                className="w-full"
                accept=".pdf"
              />
              {batchFiles.length > 0 && (
                <div className="space-y-4 mb-4">
                  {batchFiles.map((file, idx) => (
                    <div key={idx} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <input
                          type="text"
                          value={batchDetails[idx]?.title || ""}
                          onChange={(e) =>
                            handleBatchDetailChange(
                              idx,
                              "title",
                              e.target.value
                            )
                          }
                          className="flex-1 mr-2 rounded-md border border-gray-300 px-3 py-2"
                          placeholder="Title"
                        />
                        <button
                          onClick={() => {
                            setBatchFiles((files) =>
                              files.filter((_, i) => i !== idx)
                            );
                            setBatchDetails((details) =>
                              details.filter((_, i) => i !== idx)
                            );
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      <textarea
                        value={batchDetails[idx]?.description || ""}
                        onChange={(e) =>
                          handleBatchDetailChange(
                            idx,
                            "description",
                            e.target.value
                          )
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                        placeholder="Description (optional)"
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add URLs
              </label>
              <button
                onClick={addBatchUrl}
                className="mb-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
              >
                Add URL
              </button>
              {batchUrls.length > 0 && (
                <div className="space-y-4 mb-4">
                  {batchUrls.map((urlEntry, idx) => (
                    <div key={idx} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <input
                          type="text"
                          value={urlEntry.title}
                          onChange={(e) =>
                            updateBatchUrl(idx, "title", e.target.value)
                          }
                          className="flex-1 mr-2 rounded-md border border-gray-300 px-3 py-2"
                          placeholder="Title"
                        />
                        <button
                          onClick={() => removeBatchUrl(idx)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={urlEntry.url}
                        onChange={(e) =>
                          updateBatchUrl(idx, "url", e.target.value)
                        }
                        className="w-full mb-2 rounded-md border border-gray-300 px-3 py-2"
                        placeholder="URL"
                      />
                      <textarea
                        value={urlEntry.description}
                        onChange={(e) =>
                          updateBatchUrl(idx, "description", e.target.value)
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                        placeholder="Description (optional)"
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {batchError && <div className="text-red-600 mt-2">{batchError}</div>}
          {batchSuccess && (
            <div className="text-green-600 mt-2">{batchSuccess}</div>
          )}
          <button
            onClick={handleBatchUpload}
            disabled={
              batchUploading ||
              !selectedDepartment ||
              (batchType === "pdf"
                ? batchFiles.length === 0
                : batchUrls.length === 0)
            }
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {batchUploading ? "Uploading..." : "Upload All"}
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="flow"
            className="block text-sm font-medium text-gray-700"
          >
            Flow
          </label>
          <select
            id="flow"
            value={flow}
            onChange={(e) => setFlow(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          >
            <option value="resources">Resources</option>
            <option value="orientation">Orientation</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="department"
            className="block text-sm font-medium text-gray-700"
          >
            Department
          </label>
          <select
            id="department"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className={`mt-1 block w-full rounded-md border ${
              validationErrors.department ? "border-red-500" : "border-gray-300"
            } px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500`}
          >
            <option value="">Select a department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          {validationErrors.department && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.department}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`mt-1 block w-full rounded-md border ${
              validationErrors.title ? "border-red-500" : "border-gray-300"
            } px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500`}
          />
          {validationErrors.title && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.title}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description (optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700"
          >
            Resource Type
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) =>
              setType(e.target.value as "pdf" | "video" | "link")
            }
            className={`mt-1 block w-full rounded-md border ${
              validationErrors.type ? "border-red-500" : "border-gray-300"
            } px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500`}
          >
            <option value="pdf">PDF Document</option>
            <option value="video">Youtube Link</option>
            <option value="link">External Link</option>
          </select>
          {validationErrors.type && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.type}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="file"
            className="block text-sm font-medium text-gray-700"
          >
            File
          </label>
          <div className="mt-1 flex items-center">
            <input
              id="file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
          {validationErrors.file && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.file}</p>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              "Uploading..."
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Resource
              </>
            )}
          </button>
        </div>
      </form>

      {selectedDepartment && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Uploaded Resources
          </h2>
          {loading ? (
            <p className="text-gray-500">Loading resources...</p>
          ) : resources.length > 0 ? (
            <div className="space-y-4">
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  className="bg-white rounded-lg shadow-sm p-4 flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {resource.title}
                    </h3>
                    {resource.description && (
                      <p className="text-gray-600 mt-1">
                        {resource.description}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      Type: {resource.type} • Uploaded:{" "}
                      {new Date(resource.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(resource.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No resources uploaded yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
