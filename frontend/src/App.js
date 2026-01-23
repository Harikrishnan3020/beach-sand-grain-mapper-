import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ImageUpload from './components/ImageUpload';
import CameraCapture from './components/CameraCapture';
import AnalysisResults from './components/AnalysisResults';
import Navigation from './components/Navigation';
import VoiceAssistant from './components/VoiceAssistant';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAnalysisData(null);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="App">
        <Navigation onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route
              path="/upload"
              element={<ImageUpload setAnalysisData={setAnalysisData} />}
            />
            <Route
              path="/camera"
              element={<CameraCapture setAnalysisData={setAnalysisData} />}
            />
            <Route
              path="/results"
              element={<AnalysisResults data={analysisData} />}
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <VoiceAssistant />
      </div>
    </Router>
  );
}

export default App;