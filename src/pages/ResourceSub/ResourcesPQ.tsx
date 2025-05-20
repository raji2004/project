import React, { useEffect, useState } from "react";
import SidebarR from "./SidebarR";
import { Search, FileText, Download, BookOpen } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../stores/authStore";

interface PastQuestion {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  department: string;
  course_code: string;
  year: number;
  created_at: string;
}

export default function ResourcesPQ() {
  const [pastQuestions, setPastQuestions] = useState<PastQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuthStore();

  useEffect(() => {
    fetchPastQuestions();
  }, []);

  const fetchPastQuestions = async () => {
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
        .eq("resource_type", "past_question")
        .order("year", { ascending: false });

      if (error) throw error;
      setPastQuestions(data || []);
    } catch (error) {
      console.error("Error fetching past questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = pastQuestions.filter(
    (question) =>
      question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.course_code.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h1 className="text-2xl font-bold text-gray-900">Past Questions</h1>
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by course code or title..."
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
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No past questions found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuestions.map((question) => (
              <div
                key={question.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getFileIcon(question.file_type)}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {question.course_code}
                      </h3>
                      <p className="text-sm text-gray-500">{question.title}</p>
                    </div>
                  </div>
                  <a
                    href={question.file_url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    title="Download"
                  >
                    <Download className="h-5 w-5 text-gray-500" />
                  </a>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {question.description}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    {question.file_type
                      ? question.file_type.toUpperCase()
                      : "N/A"}
                  </span>
                  <span>{question.year}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
