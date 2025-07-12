import React, { createContext, useContext, useState } from 'react';
import { loginAPI, registerAPI, getProfileAPI, uploadAvatarAPI } from '../api/auth';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [error, setError] = useState('');

  const login = async (email, password) => {
    setError('');
    const data = await loginAPI(email, password);
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const register = async (form) => {
    setError('');
    await registerAPI(form);
  };

  const getProfile = async () => {
    if (!token) return;
    const profile = await getProfileAPI(token);
    setUser(profile.user);
    localStorage.setItem('user', JSON.stringify(profile.user));
  };

  const uploadAvatar = async (formData) => {
    if (!token) throw new Error('No authentication token');
    const result = await uploadAvatarAPI(formData, token);
    // Update user with new avatar
    const updatedUser = { ...user, avatar: result.avatar };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return result;
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, register, getProfile, uploadAvatar, error }}>
      {children}
    </AuthContext.Provider>
  );
};
