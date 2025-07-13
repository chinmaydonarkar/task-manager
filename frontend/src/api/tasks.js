const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const fetchTasks = async (token) => {
  console.log('Fetching tasks from:', `${API_BASE}/api/tasks`);
  const res = await fetch(`${API_BASE}/api/tasks`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    },
  });
  console.log('Fetch tasks response status:', res.status);
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Fetch tasks error:', errorText);
    throw new Error('Fetch tasks failed');
  }
  const data = await res.json();
  console.log('Fetch tasks response data:', data);
  return data;
};

export const createTask = async (task, token) => {
  console.log('Creating task at:', `${API_BASE}/api/tasks`);
  const res = await fetch(`${API_BASE}/api/tasks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    },
    body: task, // task is already FormData
  });
  console.log('Create task response status:', res.status);
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Create task error:', errorText);
    throw new Error('Create task failed');
  }
  const data = await res.json();
  console.log('Create task response data:', data);
  return data;
};

export const updateTask = async (id, updates, token) => {
  console.log('Updating task at:', `${API_BASE}/api/tasks/${id}`);
  const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    },
    body: updates, // updates is already FormData
  });
  console.log('Update task response status:', res.status);
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Update task error:', errorText);
    throw new Error('Update task failed');
  }
  const data = await res.json();
  console.log('Update task response data:', data);
  return data;
};

export const deleteTask = async (id, token) => {
  console.log('Deleting task at:', `${API_BASE}/api/tasks/${id}`);
  const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    },
  });
  console.log('Delete task response status:', res.status);
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Delete task error:', errorText);
    throw new Error('Delete task failed');
  }
  const data = await res.json();
  console.log('Delete task response data:', data);
  return data;
};

export const downloadTasksCSV = async (token) => {
  console.log('Downloading tasks CSV...');
  const res = await fetch(`${API_BASE}/api/tasks/export/csv`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    },
  });
  console.log('Download CSV response status:', res.status);
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Download CSV error:', errorText);
    throw new Error('Download CSV failed');
  }
  
  // Get the blob from the response
  const blob = await res.blob();
  
  // Create a download link
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'tasks-report.csv';
  
  // Trigger the download
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
  
  console.log('CSV download completed');
};
