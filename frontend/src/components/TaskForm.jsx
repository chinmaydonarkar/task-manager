import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';

export default function TaskForm({ onSuccess }) {
  const { createTask } = useTasks();
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Task title required');
      return;
    }
    try {
      await createTask({ title });
      setTitle('');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-4 mb-6">
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Task title"
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">Add Task</button>
      {error && <div className="text-red-500 font-medium ml-2">{error}</div>}
    </form>
  );
}
