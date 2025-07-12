import React from 'react';
import { useTasks } from '../hooks/useTasks';

export default function TaskList() {
  const { tasks, loading, error, deleteTask } = useTasks();

  if (loading) return <div className="text-center text-lg text-blue-500 font-semibold my-8 animate-pulse">Loading tasks...</div>;
  if (error) return <div className="text-center text-lg text-red-500 font-semibold my-8">{error}</div>;
  if (!tasks.length) return <div className="text-center text-lg text-gray-500 font-semibold my-8">No tasks found.</div>;

  return (
    <ul className="space-y-4">
      {tasks.map(task => (
        <li key={task._id} className="flex justify-between items-center bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
          <span className="font-medium text-gray-700">{task.title}</span>
          <button onClick={() => deleteTask(task._id)} className="bg-red-500 text-white px-4 py-1 rounded-lg font-semibold hover:bg-red-600 transition">Delete</button>
        </li>
      ))}
    </ul>
  );
}
