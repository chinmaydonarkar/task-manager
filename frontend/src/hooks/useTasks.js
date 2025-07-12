import { useState, useEffect } from 'react';
import { fetchTasks, createTask, updateTask, deleteTask } from '../api/tasks';
import { useAuth } from '../context/AuthContext';

export const useTasks = () => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await fetchTasks(token);
      setTasks(data);
      setError('');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) loadTasks();
  }, [token]);

  return {
    tasks,
    loading,
    error,
    createTask: async (task) => { await createTask(task, token); loadTasks(); },
    updateTask: async (id, updates) => { await updateTask(id, updates, token); loadTasks(); },
    deleteTask: async (id) => { await deleteTask(id, token); loadTasks(); },
    reload: loadTasks,
  };
};
