import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './ImageUpload.css';

const ImageUpload = ({ setAnalysisData }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [locationText, setLocationText] = useState('');
  const [soilType, setSoilType] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileSelect = (file) => {
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/tiff')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid image file (JPG, PNG, or TIFF)');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: preview,
          filename: selectedFile.name,
          location: locationText || null,
          soilType: soilType || null,
        }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const analysisResult = await response.json();
      setAnalysisData(analysisResult);
      navigate('/results');
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="image-upload">
      <div className="container">
        <motion.div 
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Upload Sand Image</h1>
          <p>Upload your sand sample image for AI-powered analysis</p>
        </motion.div>

        <div className="upload-container">
          <motion.div 
            className="upload-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="card">
              <h2>Select Image</h2>
              
              <motion.div
                className={`drop-zone ${dragActive ? 'active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="drop-content">
                  <span className="upload-icon">📤</span>
                  <h3>Drag & Drop Image Here</h3>
                  <p>or click to browse files</p>
                  <button 
                    className="browse-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Browse Files
                  </button>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/tiff"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                  style={{ display: 'none' }}
                />
              </motion.div>

              <div className="file-requirements">
                <h4>Requirements:</h4>
                <ul>
                  <li>Supported formats: JPG, PNG, TIFF</li>
                  <li>Maximum file size: 10MB</li>
                  <li>Recommended resolution: 1024x1024 or higher</li>
                  <li>Clear, well-lit sand sample images</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {preview && (
            <motion.div 
              className="preview-section"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="card">
                <h2>Preview</h2>
                
                <div className="image-preview">
                  <img src={preview} alt="Sand sample preview" />
                  <div className="image-info">
                    <p><strong>File:</strong> {selectedFile.name}</p>
                    <p><strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p><strong>Type:</strong> {selectedFile.type}</p>
                  </div>
                </div>

                <div className="location-input">
                  <label>Location (optional):</label>
                  <input type="text" value={locationText} onChange={(e) => setLocationText(e.target.value)} placeholder="e.g., 36.7783,-119.4179 or Playa del Rey, CA" />
                </div>
                <div className="location-input">
                  <label>Soil Type (optional):</label>
                  <input list="soil-presets" type="text" value={soilType} onChange={(e) => setSoilType(e.target.value)} placeholder="e.g., red, black, grey, desert, green" />
                  <datalist id="soil-presets">
                    <option value="red" />
                    <option value="black" />
                    <option value="grey" />
                    <option value="desert" />
                    <option value="green" />
                    <option value="lateritic" />
                    <option value="regur" />
                    <option value="loam" />
                    <option value="clay" />
                    <option value="silt" />
                    <option value="peat" />
                    <option value="sandy" />
                    <option value="silty" />
                    <option value="gravelly" />
                    <option value="volcanic" />
                    <option value="saline" />
                    <option value="alluvial" />
                    <option value="coastal" />
                    <option value="riverine" />
                    <option value="dune" />
                    <option value="loess" />
                    <option value="ochre" />
                  </datalist>
                  <small>Tip: choose from presets or type a custom soil name.</small>
                </div>

                <div className="preview-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={clearSelection}
                    disabled={isAnalyzing}
                  >
                    Clear
                  </button>
                  
                  <motion.button
                    className="btn btn-primary analyze-btn"
                    onClick={handleAnalyze}
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
                      <>
                        🔬 Start Analysis
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {isAnalyzing && (
          <motion.div 
            className="analysis-progress"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="card">
              <h3>Analysis in Progress</h3>
              <div className="progress-steps">
                <div className="step active">
                  <span className="step-icon">📤</span>
                  <span>Image Upload</span>
                </div>
                <div className="step active">
                  <span className="step-icon">🔍</span>
                  <span>Grain Detection</span>
                </div>
                <div className="step active">
                  <span className="step-icon">📊</span>
                  <span>Analysis</span>
                </div>
                <div className="step">
                  <span className="step-icon">📋</span>
                  <span>Report Generation</span>
                </div>
              </div>
              <p>Please wait while we analyze your sand sample...</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;