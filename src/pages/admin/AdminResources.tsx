import React, { useEffect, useState } from "react";
import { Search, Upload, FileText } from "lucide-react";
import { useResourcesAdminStore } from "./stores/resourcesAdminStore";
import { getResourceIcon } from "./utils/resourceUtils";
import { supabase } from "../../lib/supabase";
import { Resource } from "./types/resourceTypes";

interface ValidationErrors {
  department?: string;
  title?: string;
  file?: string;
  type?: string;
}

interface Department {
  id: string;
  name: string;
}

export default function AdminResources() {
  const {
    resources,
    error,
    fetchResources,
    uploadResource,
    editResource: editResourceFn,
    deleteResource,
  } = useResourcesAdminStore();
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Batch upload state
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchDepartment, setBatchDepartment] = useState("");
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchDetails, setBatchDetails] = useState<BatchDetail[]>([]);
  const [batchUploading, setBatchUploading] = useState(false);
  const [batchError, setBatchError] = useState("");
  const [batchSuccess, setBatchSuccess] = useState("");

  const [flowFilter, setFlowFilter] = useState<string>("all");

  // Add upload form state and logic
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<"pdf" | "video" | "link">("pdf");
  const [flow, setFlow] = useState<string>("resources");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  // Add resourceType state for single upload
  const [resourceType, setResourceType] = useState<
    "resource" | "past_question"
  >("resource");
  const [year, setYear] = useState<string>("");
  const [course, setCourse] = useState("");
  const [semester, setSemester] = useState("");

  // Add state for editing
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Add local state for edit modal fields
  const [editResource, setEditResource] = useState<Resource | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editType, setEditType] = useState<"pdf" | "video" | "link">("pdf");
  const [editFlow, setEditFlow] = useState<string>("resources");

  interface BatchDetail {
    title: string;
    description: string;
    type: "pdf" | "video" | "link";
    resourceType?: "resource" | "past_question";
    year?: string;
    course?: string;
    semester?: string;
    flow: string;
  }

  // Use local state and fetch for departments
  const [departments, setDepartments] = useState<Department[]>([]);
  const fetchDepartments = async () => {
    const { data, error } = await supabase.from("departments").select("*");
    if (!error) setDepartments(data || []);
  };

  useEffect(() => {
    fetchResources(flowFilter);
    fetchDepartments();
  }, []);

  const filteredResources = resources.filter(
    (resource) =>
      resource.title.toLowerCase().includes(search.toLowerCase()) ||
      resource.description.toLowerCase().includes(search.toLowerCase())
  );

  // When files are selected, initialize details
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
        console.log("[DEBUG] Batch upload resource object:", {
          department_id: batchDepartment,
          title: details.title,
          description: details.description,
          file,
          type: details.type,
        });
        await uploadResource({
          department_id: batchDepartment,
          title: details.title,
          description: details.description,
          file,
          type: details.type as "pdf" | "video" | "link",
          flow: details.flow,
          resource_type: details.resourceType || "resource",
          url: "",
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

  function validateForm() {
    const errors: ValidationErrors = {};
    if (!selectedDepartment) errors.department = "Please select a department";
    if (!title.trim()) errors.title = "Title is required";
    if (!file && type !== "link") errors.file = "Please select a file";
    if (!type) errors.type = "Please select a resource type";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleUploadSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationErrors({});
    setUploadError("");
    setUploadSuccess("");
    if (!validateForm() || !file) return;
    setUploading(true);
    try {
      // Use the store's uploadResource function which includes notification logic
      await uploadResource({
        department_id: selectedDepartment,
        title,
        description: description || "",
        file,
        type,
        flow,
        resource_type: resourceType,
        url: "",
      });
      
      setUploadSuccess("Resource uploaded successfully!");
      setTitle("");
      setDescription("");
      setFile(null);
      setType("pdf");
      setFlow("resources");
      setSelectedDepartment("");
      setResourceType("resource");
      setYear("");
      setCourse("");
      setSemester("");
      fetchResources(flowFilter);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    }
    setUploading(false);
  }

  // When opening the edit modal, populate local state
  const openEditModal = (resource: Resource) => {
    setEditResource(resource);
    setEditTitle(resource.title);
    setEditDescription(resource.description);
    setEditType(resource.type);
    setEditFlow(resource.flow);
    setShowEditModal(true);
  };

  // When saving edits, call editResource(id, updates)
  async function handleEditSave() {
    if (!editResource) return;
    setEditLoading(true);
    await editResourceFn(editResource.id, {
      title: editTitle,
      description: editDescription,
      type: editType,
      flow: editFlow,
    });
    setEditLoading(false);
    setShowEditModal(false);
    setEditResource(null);
    fetchResources(flowFilter);
  }

  return (
    <div className="p-0 bg-gradient-to-br from-purple-50 to-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold mb-8 text-purple-700 flex items-center gap-2">
          <FileText className="h-7 w-7 text-purple-500" /> Resource Management
        </h1>
        {/* Upload Resource Form */}
        <form
          onSubmit={handleUploadSubmit}
          className="mb-10 bg-white p-8 rounded-2xl shadow-lg border border-purple-100"
        >
          <h2 className="text-2xl font-bold mb-6 text-purple-700">
            Upload Resource
          </h2>
          {uploadError && (
            <div className="text-red-600 mb-2">{uploadError}</div>
          )}
          {uploadSuccess && (
            <div className="text-green-600 mb-2">{uploadSuccess}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Flow
            </label>
            <select
              value={flow}
              onChange={(e) => setFlow(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="resources">Resources</option>
              <option value="orientation">Orientation</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className={`mt-1 block w-full rounded-md border ${
                validationErrors.department
                  ? "border-red-500"
                  : "border-gray-300"
              } px-3 py-2`}
            >
              <option value="">Select a department</option>
              {departments.map((dept: Department) => (
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
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`mt-1 block w-full rounded-md border ${
                validationErrors.title ? "border-red-500" : "border-gray-300"
              } px-3 py-2`}
            />
            {validationErrors.title && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.title}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Resource Type
            </label>
            <select
              value={resourceType}
              onChange={(e) =>
                setResourceType(e.target.value as "resource" | "past_question")
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="resource">Resource</option>
              <option value="past_question">Past Question</option>
            </select>
          </div>
          {resourceType === "past_question" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Year
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required={resourceType === "past_question"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Course
                </label>
                <input
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required={resourceType === "past_question"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required={resourceType === "past_question"}
                >
                  <option value="">Select</option>
                  <option value="First">First</option>
                  <option value="Second">Second</option>
                </select>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              File
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500"
            />
            {validationErrors.file && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.file}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload Resource"}
          </button>
        </form>

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
                  {departments.map((dept: Department) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block font-medium mb-1">Flow</label>
                <select
                  value={flow}
                  onChange={(e) => setFlow(e.target.value)}
                  className="w-full rounded border px-3 py-2"
                >
                  <option value="resources">Resources</option>
                  <option value="orientation">Orientation</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block font-medium mb-1">Select Files</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setBatchFiles(files);
                    setBatchDetails(
                      files.map((f) => ({
                        title: f.name.replace(/\.[^/.]+$/, ""),
                        description: "",
                        type: "pdf",
                        flow,
                      }))
                    );
                  }}
                  className="block w-full"
                />
              </div>
              {batchDetails.length > 0 && (
                <div className="space-y-4">
                  {batchDetails.map((detail, idx) => (
                    <div
                      key={idx}
                      className="p-4 border rounded mb-2 bg-purple-50"
                    >
                      <div className="flex flex-col md:flex-row gap-4 items-center">
                        <input
                          type="text"
                          placeholder="Title"
                          value={detail.title}
                          onChange={(e) =>
                            handleBatchDetailChange(
                              idx,
                              "title",
                              e.target.value
                            )
                          }
                          className="flex-1 rounded border px-2 py-1 mb-2 md:mb-0"
                        />
                        <input
                          type="text"
                          placeholder="Description (optional)"
                          value={detail.description}
                          onChange={(e) =>
                            handleBatchDetailChange(
                              idx,
                              "description",
                              e.target.value
                            )
                          }
                          className="flex-1 rounded border px-2 py-1 mb-2 md:mb-0"
                        />
                        <select
                          value={detail.type}
                          onChange={(e) =>
                            handleBatchDetailChange(idx, "type", e.target.value)
                          }
                          className="rounded border px-2 py-1 mb-2 md:mb-0"
                        >
                          <option value="pdf">PDF Document</option>
                          <option value="video">Youtube Link</option>
                          <option value="link">External Link</option>
                        </select>
                        <button
                          className="text-red-500 hover:underline ml-2"
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
        <div className="flex flex-wrap gap-4 items-center mb-6">
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
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="rounded-md border border-purple-200 px-4 py-2 bg-purple-50 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          <select
            value={flowFilter}
            onChange={(e) => setFlowFilter(e.target.value)}
            className="rounded-md border border-purple-200 px-4 py-2 bg-purple-50 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
          >
            <option value="all">All Flows</option>
            <option value="resources">Resources</option>
            <option value="orientation">Orientation</option>
          </select>
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
                  {getResourceIcon(resource.type)}
                  <div>
                    <h3 className="font-semibold text-purple-900">
                      {resource.title}
                    </h3>
                    <div className="text-sm text-gray-600 mt-1">
                      {resource.description}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                      <span>
                        {new Date(resource.created_at).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span className="uppercase">{resource.type}</span>
                      <span>•</span>
                      <span className="capitalize">{resource.flow}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete this resource?"
                        )
                      ) {
                        setActionLoading(resource.id);
                        deleteResource(resource.id);
                      }
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete"
                    disabled={actionLoading === resource.id}
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => openEditModal(resource)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="Edit"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Edit modal */}
        {showEditModal && !!editResource && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative">
              <h2 className="text-xl font-bold mb-4 text-purple-700">
                Edit Resource
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEditSave();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full rounded border px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full rounded border px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    value={editType}
                    onChange={(e) =>
                      setEditType(e.target.value as "pdf" | "video" | "link")
                    }
                    className="w-full rounded border px-3 py-2"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="video">Youtube Link</option>
                    <option value="link">External Link</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Flow
                  </label>
                  <select
                    value={editFlow}
                    onChange={(e) => setEditFlow(e.target.value)}
                    className="w-full rounded border px-3 py-2"
                  >
                    <option value="resources">Resources</option>
                    <option value="orientation">Orientation</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="px-4 py-2 rounded bg-purple-600 text-white font-bold hover:bg-purple-700"
                  >
                    {editLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
