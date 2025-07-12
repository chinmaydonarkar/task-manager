const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const registerAPI = async (form) => {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form),
  });
  if (!res.ok) throw new Error('Registration failed');
  return await res.json();
};

export const loginAPI = async (email, password) => {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Login failed');
  return await res.json();
};

export const getProfileAPI = async (token) => {
  const res = await fetch(`${API_BASE}/api/auth/profile`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    },
  });
  if (!res.ok) throw new Error('Profile fetch failed');
  return await res.json();
};

export const uploadAvatarAPI = async (formData, token) => {
  const res = await fetch(`${API_BASE}/api/auth/profile/avatar`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error('Avatar upload failed');
  return await res.json();
};

export const updateProfileAPI = async (profileData, token) => {
  const res = await fetch(`${API_BASE}/api/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });
  if (!res.ok) throw new Error('Profile update failed');
  return await res.json();
};

export const changePasswordAPI = async (passwordData, token) => {
  const res = await fetch(`${API_BASE}/api/auth/profile/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(passwordData),
  });
  if (!res.ok) throw new Error('Password change failed');
  return await res.json();
};
