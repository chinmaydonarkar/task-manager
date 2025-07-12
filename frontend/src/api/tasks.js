const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const fetchTasks = async (token) => {
  const res = await fetch(`${API_BASE}/api/tasks`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Fetch tasks failed');
  return await res.json();
};

export const createTask = async (task, token) => {
  const res = await fetch(`${API_BASE}/api/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error('Create task failed');
  return await res.json();
};

export const updateTask = async (id, updates, token) => {
  const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Update task failed');
  return await res.json();
};

export const deleteTask = async (id, token) => {
  const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Delete task failed');
  return await res.json();
};
