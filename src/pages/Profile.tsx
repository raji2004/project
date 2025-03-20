import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useResourcesStore } from '../stores/resourcesStore';
import LectureResources from '../components/LectureResources';

export default function Profile() {
  const { user, updateProfile } = useAuthStore();
  const { departments, fetchDepartments } = useResourcesStore();
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    department_id: user?.department_id || '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!user?.id) return;

      await updateProfile({
        id: user.id,
        full_name: formData.full_name,
        department_id: formData.department_id,
      });
      setIsEditing(false);
      setError('');
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
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
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Student ID</label>
              <input
                type="text"
                disabled
                value={user?.student_id || ''}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <select
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
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
                >
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>

        <div className="space-y-6">
          {user?.department_id && <LectureResources initialDepartment={user.department_id} />}
        </div>
      </div>
    </div>
  );
}