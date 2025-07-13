import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TaskProvider, useTaskContext } from '../context/TaskContext';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import ImageUpload from './ImageUpload';
import ProfileForm from './ProfileForm';
import PasswordChangeForm from './PasswordChangeForm';

// Task Management Component
function TaskManagement() {
  const { tasks, loading, error, downloadCSV } = useTaskContext();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleTaskSuccess = () => {
    setShowTaskForm(false);
  };

  const handleDownloadCSV = async () => {
    try {
      setDownloading(true);
      await downloadCSV();
      // Show success message
      alert('CSV file downloaded successfully!');
    } catch (err) {
      console.error('Failed to download CSV:', err);
      alert('Failed to download CSV. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Task Management</h2>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadCSV}
            disabled={downloading || tasks.length === 0}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title={tasks.length === 0 ? 'No tasks to download' : 'Download all tasks as CSV'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {downloading ? 'Downloading...' : 'Download CSV'}
          </button>
          <button
            onClick={() => setShowTaskForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </button>
        </div>
      </div>
      
      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New Task</h3>
              <button
                onClick={() => setShowTaskForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <TaskForm onSuccess={handleTaskSuccess} />
          </div>
        </div>
      )}
      
      <TaskList />
    </div>
  );
}

export default function Dashboard() {
  const { user, logout, uploadAvatar, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('tasks');

  // Debug logging
  console.log('Dashboard user state:', user);
  console.log('User avatar:', user?.avatar);

  const handleLogout = () => {
    logout();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'tasks':
        return <TaskManagement />;
      case 'overview':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                    <p className="text-2xl font-semibold text-gray-900">12</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-semibold text-gray-900">8</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-semibold text-gray-900">4</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Task "Update documentation" completed</span>
                  <span className="text-xs text-gray-400">2 hours ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">New task "Review code" created</span>
                  <span className="text-xs text-gray-400">4 hours ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Task "Fix bug" status updated</span>
                  <span className="text-xs text-gray-400">1 day ago</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Profile Settings</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center space-x-4 mb-6">
                {user?.avatar ? (
                  <img
                    src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5050${user.avatar}`}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                    onError={(e) => {
                      console.error('Avatar image failed to load:', user.avatar);
                      console.error('Full avatar URL:', user.avatar.startsWith('http') ? user.avatar : `http://localhost:5050${user.avatar}`);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-semibold">
                      {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center hidden">
                  <span className="text-white text-xl font-semibold">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{user?.name || 'User'}</h3>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
              </div>
              
              {/* Avatar Upload Section */}
              <div className="border-t pt-6 mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Profile Picture</h4>
                <ImageUpload
                  onUpload={uploadAvatar}
                  currentAvatar={user?.avatar}
                  className="max-w-md"
                />
              </div>

              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Profile Information</h4>
                <ProfileForm
                  user={user}
                  onUpdate={updateProfile}
                  onCancel={() => {}}
                />
              </div>

              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h4>
                <PasswordChangeForm
                  onPasswordChange={changePassword}
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <TaskProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">IndiaNIC Task Manager</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {user?.avatar ? (
                    <img
                      src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5050${user.avatar}`}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      onError={(e) => {
                        console.error('Avatar image failed to load:', user.avatar);
                        console.error('Full avatar URL:', user.avatar.startsWith('http') ? user.avatar : `http://localhost:5050${user.avatar}`);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hidden">
                    <span className="text-white text-sm font-semibold">
                      {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">Welcome, {user?.name || user?.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 bg-white shadow-sm min-h-screen">
            <nav className="mt-8">
              <div className="px-4 space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                  </svg>
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'tasks'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Tasks
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </button>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-8">
            {renderContent()}
          </main>
        </div>
      </div>
    </TaskProvider>
  );
} 