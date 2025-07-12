import React from 'react';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import { useAuth } from '../context/AuthContext';

export default function TaskManager() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-8">
        <header className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold text-gray-700">Welcome, <span className="text-blue-600">{user?.name || user?.email}</span></span>
          <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition">Logout</button>
        </header>
        <TaskForm />
        <TaskList />
      </div>
    </div>
  );
}
