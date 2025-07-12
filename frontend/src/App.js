import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Auth from './components/Auth';
import TaskLiveFeed from './components/TaskLiveFeed';

// Set base URL for all API calls
axios.defaults.baseURL = 'http://localhost:5050';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.brand}>
            <h1 style={styles.brandTitle}>IndiaNIC</h1>
            <span style={styles.brandSubtitle}>Task Management</span>
          </div>
          <div style={styles.userSection}>
            <div style={styles.userInfo}>
              <span style={styles.userName}>Welcome, {user.name}!</span>
              <span style={styles.userEmail}>{user.email}</span>
            </div>
            <button
              onClick={handleLogout}
              style={styles.logoutButton}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.container}>
          <div style={styles.sidebar}>
            <h2 style={styles.sidebarTitle}>Dashboard</h2>
            <nav style={styles.nav}>
              <button style={styles.navButton}>Tasks</button>
              <button style={styles.navButton}>Analytics</button>
              <button style={styles.navButton}>Settings</button>
            </nav>
          </div>
          
          <div style={styles.content}>
            <div style={styles.contentHeader}>
              <h2 style={styles.contentTitle}>Live Task Feed</h2>
              <p style={styles.contentSubtitle}>Real-time updates from your team</p>
            </div>
            <TaskLiveFeed />
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fa'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f7fa'
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e1e8ed',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    marginTop: '16px',
    color: '#7f8c8d',
    fontSize: '16px'
  },
  header: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e1e8ed',
    padding: '16px 0'
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brand: {
    display: 'flex',
    flexDirection: 'column'
  },
  brandTitle: {
    color: '#2c3e50',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0'
  },
  brandSubtitle: {
    color: '#7f8c8d',
    fontSize: '14px',
    margin: '0'
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end'
  },
  userName: {
    color: '#2c3e50',
    fontSize: '16px',
    fontWeight: '500'
  },
  userEmail: {
    color: '#7f8c8d',
    fontSize: '14px'
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.3s ease'
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px'
  },
  container: {
    display: 'grid',
    gridTemplateColumns: '250px 1fr',
    gap: '24px',
    minHeight: 'calc(100vh - 120px)'
  },
  sidebar: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  sidebarTitle: {
    color: '#2c3e50',
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 20px 0'
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  navButton: {
    padding: '12px 16px',
    backgroundColor: 'transparent',
    color: '#7f8c8d',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  },
  content: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  contentHeader: {
    marginBottom: '24px'
  },
  contentTitle: {
    color: '#2c3e50',
    fontSize: '24px',
    fontWeight: '600',
    margin: '0 0 8px 0'
  },
  contentSubtitle: {
    color: '#7f8c8d',
    fontSize: '16px',
    margin: '0'
  }
};

export default App; 