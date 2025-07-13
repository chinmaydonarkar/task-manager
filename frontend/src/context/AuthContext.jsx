import React, { createContext, useContext, useState } from 'react';
import { loginAPI, registerAPI, getProfileAPI, uploadAvatarAPI, updateProfileAPI, changePasswordAPI } from '../api/auth';

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
    // Don't set user and token - let user login manually after registration
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
    const updatedUser = { ...user, avatar: result.user.avatar };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    console.log('Avatar uploaded, updated user:', updatedUser);
    return result;
  };

  const updateProfile = async (profileData) => {
    if (!token) throw new Error('No authentication token');
    const result = await updateProfileAPI(profileData, token);
    // Update user with new profile data
    const updatedUser = { ...user, ...result.user };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return result;
  };

  const changePassword = async (passwordData) => {
    if (!token) throw new Error('No authentication token');
    const result = await changePasswordAPI(passwordData, token);
    return result;
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, register, getProfile, uploadAvatar, updateProfile, changePassword, error }}>
      {children}
    </AuthContext.Provider>
  );
};
