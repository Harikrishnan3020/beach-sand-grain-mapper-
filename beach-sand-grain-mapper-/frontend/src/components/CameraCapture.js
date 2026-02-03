import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import './CameraCapture.css';

const CameraCapture = ({ setAnalysisData, user }) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('unknown');
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();

  // ... (rest of the component permissions and camera logic)

  const analyzeImage = async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);

    // Simulate analysis delay
    setTimeout(async () => {
      const mockAnalysis = {
        image: capturedImage.url,
        filename: `camera_capture_${Date.now()}.jpg`,
        totalGrains: Math.floor(Math.random() * 200) + 50,
        averageSize: Math.floor(Math.random() * 300) + 150,
        dominantSize: 'Medium',
        quality: 'Good',
        grainSizes: [100, 200, 300, 400, 500],
        grainCounts: [10, 20, 30, 40, 50],
        details: 'Mock analysis completed. In a real implementation, this would be processed by AI.',
        soilType: null,
        soilDetails: null,
        timestamp: new Date().toISOString(),
        location: null,
      };

      setAnalysisData(mockAnalysis);

      // Log activity
      if (user) {
        try {
          await fetch('/api/activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userEmail: user.email,
              type: 'Camera',
              grains: mockAnalysis.totalGrains || 0,
              details: {
                filename: mockAnalysis.filename,
                timestamp: mockAnalysis.timestamp,
                soilType: mockAnalysis.soilType,
                report: mockAnalysis.details,
                image: mockAnalysis.image,
                grainSizes: mockAnalysis.grainSizes,
                grainCounts: mockAnalysis.grainCounts
              }
            })
          });
        } catch (logErr) {
          console.error("Failed to log camera activity", logErr);
        }
      }

      setIsAnalyzing(false);
      navigate('/results');
    }, 2000);
  };

  useEffect(() => {
    checkCameraPermissions();

    return () => {
      stopCamera();
      if (capturedImage) {
        URL.revokeObjectURL(capturedImage.url);
      }
    };
  }, [capturedImage]);

  return (
    <div className="camera-capture">
      <div className="container">
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Live Camera Capture</h1>
          <p>Capture sand samples in real-time using your device camera</p>
        </motion.div>

        <div className="camera-container">
          <motion.div
            className="camera-section"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="card">
              <div className="camera-viewport">
                {!isStreaming && !capturedImage && !error && (
                  <div className="camera-placeholder">
                    <span className="camera-icon">📷</span>
                    <h3>Camera Ready</h3>
                    <p>Click "Start Camera" to begin capturing</p>
                    {permissionStatus === 'denied' && (
                      <div className="permission-warning">
                        <p>⚠️ Camera access is blocked. Please enable camera permissions in your browser settings.</p>
                      </div>
                    )}
                    {permissionStatus === 'prompt' && (
                      <div className="permission-info">
                        <p>📋 You'll be asked for camera permission when you start.</p>
                      </div>
                    )}
                    {isCheckingPermissions && (
                      <div className="checking-permissions">
                        <p>🔍 Checking camera permissions...</p>
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    <p>{error}</p>
                    <div className="error-help">
                      <h4>Troubleshooting Tips:</h4>
                      <ul>
                        <li>Make sure you're using HTTPS (required for camera access)</li>
                        <li>Check if another app is using your camera</li>
                        <li>Try refreshing the page and allowing camera access</li>
                        <li>Ensure your browser supports camera access (Chrome, Firefox, Safari)</li>
                        <li>Check your browser's camera permissions settings</li>
                      </ul>
                      <button
                        className="btn btn-secondary retry-btn"
                        onClick={() => {
                          setError(null);
                          checkCameraPermissions();
                        }}
                      >
                        🔄 Retry
                      </button>
                    </div>
                  </div>
                )}

                {isStreaming && !capturedImage && (
                  <div className="video-container">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="camera-video"
                    />
                    <div className="camera-overlay">
                      <div className="focus-frame"></div>
                      <div className="capture-guide">
                        <p>Position sand sample within the frame</p>
                      </div>
                    </div>
                  </div>
                )}

                {capturedImage && (
                  <div className="captured-image">
                    <img src={capturedImage.url} alt="Captured sand sample" />
                    <div className="image-timestamp">
                      Captured: {new Date(capturedImage.timestamp).toLocaleString()}
                    </div>
                  </div>
                )}

                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>

              <div className="camera-controls">
                {!isStreaming && !capturedImage && (
                  <motion.button
                    className="btn btn-primary"
                    onClick={startCamera}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    📷 Start Camera
                  </motion.button>
                )}

                {isStreaming && !capturedImage && (
                  <div className="streaming-controls">
                    <motion.button
                      className="capture-btn"
                      onClick={captureImage}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      📸
                    </motion.button>
                    <button
                      className="btn btn-secondary"
                      onClick={stopCamera}
                    >
                      Stop Camera
                    </button>
                  </div>
                )}

                {capturedImage && (
                  <div className="capture-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={retakePhoto}
                      disabled={isAnalyzing}
                    >
                      🔄 Retake
                    </button>
                    <motion.button
                      className="btn btn-primary"
                      onClick={analyzeImage}
                      disabled={isAnalyzing}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="spinner" />
                          Analyzing...
                        </>
                      ) : (
                        '🔬 Analyze Image'
                      )}
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="tips-section"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="card">
              <h2>Capture Tips</h2>
              <div className="tips-list">
                <div className="tip-item">
                  <span className="tip-icon">💡</span>
                  <div>
                    <h4>Good Lighting</h4>
                    <p>Ensure adequate natural or artificial lighting</p>
                  </div>
                </div>
                <div className="tip-item">
                  <span className="tip-icon">🎯</span>
                  <div>
                    <h4>Focus Frame</h4>
                    <p>Keep sand sample within the focus frame</p>
                  </div>
                </div>
                <div className="tip-item">
                  <span className="tip-icon">📏</span>
                  <div>
                    <h4>Proper Distance</h4>
                    <p>Maintain 6-12 inches from the sample</p>
                  </div>
                </div>
                <div className="tip-item">
                  <span className="tip-icon">🤚</span>
                  <div>
                    <h4>Steady Hands</h4>
                    <p>Keep camera steady for clear images</p>
                  </div>
                </div>
                <div className="tip-item">
                  <span className="tip-icon">🔍</span>
                  <div>
                    <h4>Clear Details</h4>
                    <p>Ensure individual grains are visible</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
// Optimized for performance
