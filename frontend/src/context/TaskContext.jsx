import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchTasks, createTask, updateTask, deleteTask, downloadTasksCSV } from '../api/tasks';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTasks = async () => {
    setLoading(true);
    try {
      console.log('Loading tasks...');
      const data = await fetchTasks(token);
      console.log('Tasks loaded:', data);
      setTasks(data);
      setError('');
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) loadTasks();
  }, [token]);

  const handleCreateTask = async (task) => {
    try {
      console.log('Creating task...');
      const result = await createTask(task, token);
      console.log('Task created:', result);
      
      // Immediately add the new task to the state without loading
      setTasks(prevTasks => [result, ...prevTasks]);
      
    } catch (err) {
      console.error('Error creating task:', err);
      throw err;
    }
  };

  const handleUpdateTask = async (id, updates) => {
    try {
      console.log('Updating task:', id, updates);
      const result = await updateTask(id, updates, token);
      console.log('Task updated:', result);
      
      // Immediately update the task in state
      setTasks(prevTasks => 
        prevTasks.map(task => task._id === id ? result : task)
      );
      
    } catch (err) {
      console.error('Error updating task:', err);
      throw err;
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      console.log('Deleting task:', id);
      await deleteTask(id, token);
      console.log('Task deleted');
      
      // Immediately remove the task from state
      setTasks(prevTasks => prevTasks.filter(task => task._id !== id));
      
    } catch (err) {
      console.error('Error deleting task:', err);
      throw err;
    }
  };

  const handleDownloadCSV = async () => {
    try {
      console.log('Downloading CSV...');
      await downloadTasksCSV(token);
      console.log('CSV download successful');
    } catch (err) {
      console.error('Error downloading CSV:', err);
      throw err;
    }
  };

  const value = {
    tasks,
    loading,
    error,
    createTask: handleCreateTask,
    updateTask: handleUpdateTask,
    deleteTask: handleDeleteTask,
    downloadCSV: handleDownloadCSV,
    refreshTasks: loadTasks,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}; 