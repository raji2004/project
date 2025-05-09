import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { GraduationCap, User, BookOpen, Calendar, Users, Bell, LogOut, Upload } from 'lucide-react';
import { isAdmin } from '../config/admin';

export default function Navbar() {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <GraduationCap className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-800">Freshers</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="Orientation"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
              >
                Orientation
              </Link>
              <Link
                to="Resources"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
              >
                Resources
              </Link>
              <Link
                to="/"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
              >
                <BookOpen className="h-4 w-4 mr-1" />
                Dashboard
              </Link>
              <Link
                to="/schedule"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                <Calendar className="h-4 w-4 mr-1" />
                Schedule
              </Link>
              <Link
                to="/groups"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                <Users className="h-4 w-4 mr-1" />
                Groups
              </Link>
              {isAdmin(user?.email) && (
                <Link
                  to="/admin/resources"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <button className="p-2 rounded-full text-gray-500 hover:text-gray-900">
              <Bell className="h-6 w-6" />
            </button>
            <div className="ml-3 relative flex items-center space-x-4">
              <Link
                to="/profile"
                className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                <User className="h-6 w-6" />
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}