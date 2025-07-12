import React, { useState, useEffect } from 'react';
import { useTaskContext } from '../context/TaskContext';
import TaskForm from './TaskForm';

export default function TaskList() {
  const { tasks, loading, error, deleteTask } = useTaskContext();
  const [editingTask, setEditingTask] = useState(null);

  // Close edit form when editingTask is no longer in the tasks list (meaning it was updated)
  useEffect(() => {
    if (editingTask && !tasks.find(task => task._id === editingTask._id)) {
      setEditingTask(null);
    }
  }, [tasks, editingTask]);

  if (loading) return <div className="text-center text-lg text-blue-500 font-semibold my-8 animate-pulse">Loading tasks...</div>;
  if (error) return <div className="text-center text-lg text-red-500 font-semibold my-8">{error}</div>;
  if (!tasks.length) return <div className="text-center text-lg text-gray-500 font-semibold my-8">No tasks found.</div>;

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    return status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="space-y-4">
      {editingTask && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Edit Task</h3>
            <button 
              onClick={() => setEditingTask(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕ Cancel
            </button>
          </div>
          <TaskForm 
            task={editingTask} 
            isEditing={true} 
          />
        </div>
      )}
      
      <ul className="space-y-4">
        {tasks.map(task => (
          <li key={task._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">{task.title}</h3>
                {task.description && (
                  <p className="text-gray-600 mt-1">{task.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setEditingTask(task)}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition"
                >
                  Edit
                </button>
                <button 
                  onClick={() => deleteTask(task._id)} 
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
              <span>Due: {formatDate(task.dueDate)}</span>
              <span>Created: {formatDate(task.createdAt)}</span>
            </div>
            
            {task.files && task.files.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments:</h4>
                <div className="flex flex-wrap gap-2">
                  {task.files.map((file, index) => (
                    <a
                      key={index}
                      href={`${import.meta.env.VITE_API_BASE_URL}${file.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition"
                    >
                      📎 {file.originalname}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
