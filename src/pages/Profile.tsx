import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../stores/authStore";
import { useResourcesStore } from "../stores/resourcesStore";
import { supabase } from "../lib/supabase";
import { User as UserIcon, Camera, Image as ImageIcon } from "lucide-react";
import { getAvatarUrl } from "../utils/avatar";

export default function Profile() {
  const { user, updateProfile } = useAuthStore();
  const { departments, fetchDepartments } = useResourcesStore();
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    department_id: user?.department_id || "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [avatar, setAvatar] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [uploading, setUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraError, setCameraError] = useState("");

  // Initialize and load data
  useEffect(() => {
    fetchDepartments();
    // Load avatar from user data on first render
    if (user?.avatar_url) {
      const url = getAvatarUrl(user.avatar_url);
      setAvatar(url);
      console.log("Initial avatar URL:", url);
    }
  }, [fetchDepartments]);

  // Refresh avatar when user data changes
  useEffect(() => {
    if (user?.avatar_url) {
      const url = getAvatarUrl(user.avatar_url);
      setAvatar(url);
      console.log("Refreshed avatar URL:", url);
    }
  }, [user?.avatar_url]);

  // Cleanup object URLs on unmount and when they change
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Add back the camera stream setup
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (showCamera && videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(() => setCameraError("Unable to access camera."));
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [showCamera]);

  // Completely rewritten image validation function
  const checkImageURL = (url: string) => {
    console.log("Checking image URL:", url);
    if (!url) {
      console.log("No URL provided");
      return false;
    }

    // Check if it's a Blob URL (preview) or normal URL
    const isValid =
      url.startsWith("blob:") ||
      url.startsWith("http") ||
      url.startsWith("data:");

    console.log("URL valid?", isValid);
    return isValid;
  };

  // Completely rewritten avatar change handler
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log("Selected file:", file.name, file.type, file.size);

      // Revoke any existing preview URL to prevent memory leaks
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }

      // Create new object URL for preview
      const newPreviewUrl = URL.createObjectURL(file);
      console.log("Created preview URL:", newPreviewUrl);

      // Set both the file and preview URL
      setAvatarFile(file);
      setPreviewUrl(newPreviewUrl);
      setSuccess("");
      setError("");
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        context.drawImage(videoRef.current, 0, 0, 200, 200);
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "avatar.png", { type: "image/png" });

            // Revoke any existing preview URL
            if (previewUrl && previewUrl.startsWith("blob:")) {
              URL.revokeObjectURL(previewUrl);
            }

            const newPreviewUrl = URL.createObjectURL(file);

            setAvatarFile(file);
            setPreviewUrl(newPreviewUrl);
            setShowCamera(false);
            setSuccess("");
            setError("");
          }
        }, "image/png");
      }
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !user?.id) return;
    setUploading(true);
    setError("");
    setSuccess("");
    try {
      // Save the full path (userId/userId.ext)
      const fileExt = avatarFile.name.split(".").pop();
      const fileName = `${user.id}/${user.id}.${fileExt}`;
      // Delete previous avatar if it exists and is different
      if (user.avatar_url && user.avatar_url !== fileName) {
        await supabase.storage.from("avatars").remove([user.avatar_url]);
      }
      // Upload to Supabase Storage
      const uploadResult = await supabase.storage
        .from("avatars")
        .upload(fileName, avatarFile, {
          upsert: true,
          contentType: avatarFile.type,
        });
      if (uploadResult.error) {
        setError(`Failed to upload avatar: ${uploadResult.error.message}`);
        setUploading(false);
        return;
      }
      // Save the full path in the DB
      const updateResult = await supabase
        .from("profiles")
        .update({ avatar_url: fileName })
        .eq("id", user.id);
      if (updateResult.error) {
        setError(`Failed to update profile: ${updateResult.error.message}`);
        setUploading(false);
        return;
      }
      // Add cache buster to force reload
      const publicUrl = getAvatarUrl(fileName) + `?t=${new Date().getTime()}`;
      setAvatar(publicUrl);
      setPreviewUrl(null);
      await updateProfile({
        id: user.id,
        full_name: formData.full_name,
        department_id: formData.department_id,
        avatar_url: fileName, // full path!
      });
      setSuccess("Profile picture updated!");
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      if (!user?.id) return;
      await updateProfile({
        id: user.id,
        full_name: formData.full_name,
        department_id: formData.department_id,
      });
      if (avatarFile) {
        await handleAvatarUpload();
      } else {
        setSuccess("Profile updated!");
      }
      setIsEditing(false);
    } catch {
      setError("Failed to update profile");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Profile Settings
            </h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Edit Profile
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded animate-shake">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded animate-fade-in">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center mb-4">
              <div className="relative w-32 h-32 mb-2 group flex items-center justify-center">
                {previewUrl ? (
                  // Show preview when available
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-32 h-32 rounded-full object-cover border shadow transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      console.error(
                        "Preview image failed to load:",
                        previewUrl
                      );
                      e.currentTarget.onerror = null;
                      setPreviewUrl(null);
                    }}
                  />
                ) : checkImageURL(avatar) ? (
                  // Show actual avatar when no preview
                  <img
                    src={avatar}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border shadow transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      console.error("Avatar image failed to load:", avatar);
                      e.currentTarget.onerror = null;
                      setAvatar("");
                    }}
                  />
                ) : (
                  // Show default icon when no avatar
                  <UserIcon className="w-28 h-28 text-gray-300 border rounded-full bg-gray-100 p-2" />
                )}
                {isEditing && !showCamera && (
                  <div className="absolute bottom-0 left-0 w-full flex justify-center gap-2 z-10">
                    <button
                      type="button"
                      onClick={() => setShowCamera(true)}
                      className="bg-indigo-600 text-white rounded-full p-2 text-xs shadow hover:bg-indigo-700 flex items-center gap-1"
                      title="Take a photo"
                    >
                      <Camera className="w-4 h-4" /> Camera
                    </button>
                    <label
                      className="bg-indigo-600 text-white rounded-full p-2 text-xs shadow hover:bg-indigo-700 flex items-center gap-1 cursor-pointer"
                      title="Choose from device"
                    >
                      <ImageIcon className="w-4 h-4" /> Choose
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-full">
                    <svg
                      className="animate-spin h-6 w-6 text-indigo-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      ></path>
                    </svg>
                  </div>
                )}
              </div>
              {showCamera && (
                <div className="flex flex-col items-center">
                  {cameraError && (
                    <div className="text-red-500 mb-2">{cameraError}</div>
                  )}
                  <video
                    ref={videoRef}
                    width={200}
                    height={200}
                    autoPlay
                    className="rounded mb-2 shadow"
                  />
                  <canvas
                    ref={canvasRef}
                    width={200}
                    height={200}
                    className="hidden"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCapture}
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                      Capture
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCamera(false)}
                      className="px-4 py-2 text-gray-700 hover:text-gray-900"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Student ID
              </label>
              <input
                type="text"
                disabled
                value={user?.student_id || ""}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ""}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Department
              </label>
              <select
                value={formData.department_id}
                onChange={(e) =>
                  setFormData({ ...formData, department_id: e.target.value })
                }
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 disabled:bg-gray-50"
              >
                <option value="">Select a department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            {isEditing && (
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  disabled={uploading}
                >
                  {uploading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
