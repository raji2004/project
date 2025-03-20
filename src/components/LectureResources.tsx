import React, { useEffect } from 'react';
import { FileText, Video, Link as LinkIcon, Loader2 } from 'lucide-react';
import { useResourcesStore } from '../stores/resourcesStore';
import { useAuthStore } from '../stores/authStore';

interface LectureResourcesProps {
  initialDepartment?: string;
}

export default function LectureResources({ initialDepartment }: LectureResourcesProps) {
  const { user } = useAuthStore();
  const {
    resources,
    loading,
    error,
    fetchResourcesByDepartment,
  } = useResourcesStore();

  useEffect(() => {
    if (user?.department_id) {
      fetchResourcesByDepartment(user.department_id);
    }
  }, [user?.department_id, fetchResourcesByDepartment]);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'video':
        return <Video className="h-5 w-5 text-blue-500" />;
      default:
        return <LinkIcon className="h-5 w-5 text-green-500" />;
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!user?.department_id) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-center text-gray-500 py-8">
          Please select a department in your profile to view resources.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Lecture Resources</h2>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        </div>
      ) : resources.length > 0 ? (
        <div className="space-y-4">
          {resources.map((resource) => (
            <a
              key={resource.id}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {getResourceIcon(resource.type)}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {resource.title}
                  </h3>
                  {resource.description && (
                    <p className="mt-1 text-gray-600">{resource.description}</p>
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    Added {new Date(resource.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-8">
          No resources available for your department.
        </p>
      )}
    </div>
  );
}