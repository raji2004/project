import React, { useEffect, useState } from "react";
import SidebarR from "./SidebarR";
import { Search, FileText, Download, BookOpen } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../stores/authStore";

interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  file_type: string;
  department: string;
  created_at: string;
}

export default function ResourcesLibrary() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuthStore();

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("department_id")
        .eq("id", user?.id)
        .single();

      if (userError) throw userError;

      const { data, error } = await supabase
        .from("lecture_resources")
        .select("*")
        .eq("department_id", userData.department_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  };
 const triggerDownload = (url: string, fileName: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


  const downloadFile = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const filteredResources = resources.filter(
    (resource) =>
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFileIcon = (fileType: string | undefined | null) => {
    if (!fileType || typeof fileType !== "string") {
      return <BookOpen className="h-6 w-6 text-purple-500" />;
    }
    switch (fileType.toLowerCase()) {
      case "pdf":
        return <FileText className="h-6 w-6 text-red-500" />;
      case "doc":
      case "docx":
        return <FileText className="h-6 w-6 text-blue-500" />;
      default:
        return <BookOpen className="h-6 w-6 text-purple-500" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarR />

      <div className="flex-1 ml-64 p-8">
        <div className="sticky top-0 z-10 bg-gray-50 pb-4">
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Resource Library</h1>
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No resources found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => {
              console.log(resource)
            return  <div
                key={resource.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getFileIcon(resource.file_type)}
                    <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                  </div>
                  <a
                   onClick={()=>triggerDownload(resource.url,resource.title)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    title="Download"
                  >
                    <Download className="h-5 w-5 text-gray-500" />
                  </a>

                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {resource.description}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    {resource.file_type && typeof resource.file_type === "string"
                      ? resource.file_type.toUpperCase()
                      : "N/A"}
                  </span>
                  <span>{new Date(resource.created_at).toLocaleDateString()}</span>
                </div>
              </div>
})}
          </div>
        )}
      </div>
    </div>
  );
}
