import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ImageUpload from './components/ImageUpload';
import CameraCapture from './components/CameraCapture';
import AnalysisResults from './components/AnalysisResults';
import Navigation from './components/Navigation';
import VoiceAssistant from './components/VoiceAssistant';
import Admin from './components/Admin';
import AdminLogin from './components/AdminLogin';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setAnalysisData(null);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/" replace />}
          />
          <Route
            path="/admin/login"
            element={!isAuthenticated ? <AdminLogin onLogin={handleLogin} /> : <Navigate to="/" replace />}
          />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              isAuthenticated ? (
                user?.role === 'Admin' ? (
                  // Admin Layout
                  <>
                    <nav className="navigation">
                      <div className="nav-container">
                        <span className="logo-text" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>🏖️ Admin Console</span>
                        <button onClick={handleLogout} className="logout-btn">🚪 Logout</button>
                      </div>
                    </nav>
                    <main className="main-content" style={{ paddingTop: '80px' }}>
                      <Admin />
                    </main>
                  </>
                ) : (
                  // User Layout
                  <>
                    <Navigation onLogout={handleLogout} />
                    <main className="main-content">
                      <Routes>
                        <Route path="/" element={<Dashboard user={user} />} />
                        <Route
                          path="/upload"
                          element={<ImageUpload setAnalysisData={setAnalysisData} user={user} />}
                        />
                        <Route
                          path="/camera"
                          element={<CameraCapture setAnalysisData={setAnalysisData} user={user} />}
                        />
                        <Route
                          path="/results"
                          element={<AnalysisResults data={analysisData} user={user} />}
                        />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </main>
                    <VoiceAssistant />
                  </>
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;