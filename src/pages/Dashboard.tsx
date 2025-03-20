import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import LectureResources from '../components/LectureResources';

interface OrientationTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  deadline: string;
}

const orientationTasks: OrientationTask[] = [
  {
    id: '1',
    title: 'Complete Registration',
    description: 'Submit all required documents and complete the registration process.',
    completed: false,
    deadline: '2025-03-15',
  },
  {
    id: '2',
    title: 'Library Access Setup',
    description: 'Activate your library card and complete the library orientation.',
    completed: false,
    deadline: '2025-03-20',
  },
  {
    id: '3',
    title: 'IT Services Setup',
    description: 'Set up your university email and access to online platforms.',
    completed: true,
    deadline: '2025-03-10',
  },
];

export default function Dashboard() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.full_name || 'Student'}!
        </h1>
        <p className="text-gray-600">Track your orientation progress and upcoming tasks.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Orientation Checklist</h2>
            <div className="space-y-4">
              {orientationTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start p-4 border border-gray-100 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-shrink-0">
                    {task.completed ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <Circle className="h-6 w-6 text-gray-300" />
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                    <p className="text-gray-600 mt-1">{task.description}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Deadline: {new Date(task.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Announcements</h2>
            <p className="text-gray-600">No new announcements.</p>
          </div>
        </div>

        <div className="space-y-6">
          <LectureResources />
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Events</h2>
            <p className="text-gray-600">No upcoming events at this time.</p>
          </div>
        </div>
      </div>
    </div>
  );
}