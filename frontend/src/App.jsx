import React from 'react'
import { useAuth } from './context/AuthContext'
import AuthForm from './components/AuthForm'
import Dashboard from './components/Dashboard'
import './App.css'

export default function App() {
  const { user } = useAuth()
  return user ? <Dashboard /> : <AuthForm />
}
