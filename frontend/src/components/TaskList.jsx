import React, { useState, useEffect } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import TaskForm from './TaskForm';
import socketService from '../services/socketService';

export default function TaskList() {
  const { tasks, loading, error, deleteTask, refreshTasks } = useTaskContext();
  const { user } = useAuth();
  const [editingTask, setEditingTask] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // WebSocket real-time updates
  useEffect(() => {
    if (!user?.token) return;

    // Connect to WebSocket
    socketService.connect(user.token);

    // Set up event listeners
    const handleTaskUpdate = (updatedTask) => {
      console.log('📝 Real-time task update received:', updatedTask);
      
      // Refresh tasks to get the latest data
      refreshTasks();
      
      // Show notification
      showNotification(`Task "${updatedTask.title}" was updated by another user`);
    };

    const handleTaskCreated = (newTask) => {
      console.log('➕ Real-time task creation received:', newTask);
      
      // Refresh tasks to get the latest data
      refreshTasks();
      
      // Show notification
      showNotification(`New task "${newTask.title}" was created`);
    };

    const handleTaskDeleted = (deletedTask) => {
      console.log('🗑️ Real-time task deletion received:', deletedTask);
      
      // Refresh tasks to get the latest data
      refreshTasks();
      
      // Show notification
      showNotification('A task was deleted');
    };

    // Listen for real-time events
    socketService.onTaskUpdate(handleTaskUpdate);
    socketService.onTaskCreated(handleTaskCreated);
    socketService.onTaskDeleted(handleTaskDeleted);

    // Join task rooms for current tasks
    if (tasks.length > 0) {
      const taskIds = tasks.map(task => task._id);
      socketService.joinTasks(taskIds);
    }

    // Cleanup function
    return () => {
      // Leave all task rooms
      tasks.forEach(task => {
        socketService.leaveTask(task._id);
      });
      
      // Remove event listeners
      socketService.off('task-updated', handleTaskUpdate);
      socketService.off('task-created', handleTaskCreated);
      socketService.off('task-deleted', handleTaskDeleted);
      
      // Disconnect WebSocket
      socketService.disconnect();
    };
  }, [user?.token, tasks, refreshTasks]);

  // Close edit form when editingTask is no longer in the tasks list (meaning it was updated)
  useEffect(() => {
    if (editingTask && !tasks.find(task => task._id === editingTask._id)) {
      setEditingTask(null);
    }
  }, [tasks, editingTask]);

  // Show notification function
  const showNotification = (message) => {
    const notification = {
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message,
      timestamp: new Date()
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

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
      {/* Real-time notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg max-w-sm animate-pulse"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">{notification.message}</span>
                <button
                  onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                  className="ml-2 text-white hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* WebSocket connection status */}
      <div className="mb-4 p-2 rounded-lg text-sm">
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          socketService.getConnectionStatus().isConnected 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {socketService.getConnectionStatus().isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
      </div>

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
            onSuccess={() => {
              setEditingTask(null);
              showNotification('Task updated successfully!');
            }}
          />
        </div>
      )}
      
      <ul className="space-y-4">
        {tasks.map((task, index) => (
          <li key={task._id || `task-${index}`} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
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
                      key={`${task._id}-file-${index}`}
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
