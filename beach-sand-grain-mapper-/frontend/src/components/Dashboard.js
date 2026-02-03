import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Dashboard.css';

const Dashboard = () => {

  const features = [
    {
      icon: '📤',
      title: 'Upload Image',
      description: 'Upload sand images in JPG, PNG, or TIFF format for comprehensive analysis',
      link: '/upload',
      color: '#667eea'
    },
    {
      icon: '📷',
      title: 'Live Camera',
      description: 'Capture sand samples in real-time using your device camera',
      link: '/camera',
      color: '#764ba2'
    },
    {
      icon: '🔬',
      title: 'AI Analysis',
      description: 'Advanced YOLOv8-powered grain detection and classification',
      link: '/results',
      color: '#f093fb'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Images Analyzed' },
    { number: '95%', label: 'Accuracy Rate' },
    { number: '50+', label: 'Research Papers' },
    { number: '24/7', label: 'Availability' }
  ];

  const applications = [
    {
      title: 'Coastal Engineering',
      description: 'Erosion and deposition studies for coastal protection',
      icon: '🌊'
    },
    {
      title: 'Geology Research',
      description: 'Sedimentology and geological formation analysis',
      icon: '🗻'
    },
    {
      title: 'Environmental Monitoring',
      description: 'Climate impact and ecosystem health assessment',
      icon: '🌱'
    },
    {
      title: 'Construction Quality',
      description: 'Material quality analysis for construction projects',
      icon: '🏗️'
    }
  ];

  return (
    <div className="dashboard">
      <div className="container">
        <motion.div 
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Welcome to SandGrainMapper</h1>
          <p>AI-powered sand grain analysis for research and engineering</p>
        </motion.div>

        <div className="stats-grid">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="stat-card"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="features-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h2>Get Started</h2>
          <div className="grid grid-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
              >
                <Link to={feature.link} className="feature-card">
                  <span className="feature-icon" style={{ color: feature.color }}>
                    {feature.icon}
                  </span>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <div className="feature-arrow">→</div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="applications-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className="card">
            <h2>Applications</h2>
            <div className="applications-grid">
              {applications.map((app, index) => (
                <motion.div
                  key={index}
                  className="application-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                >
                  <div className="app-icon">{app.icon}</div>
                  <div className="app-content">
                    <h4>{app.title}</h4>
                    <p>{app.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>



        <motion.div
          className="info-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="card">
            <h2>Analysis Features</h2>
            <div className="features-list">
              <div className="feature-item">
                <span className="check-icon">✓</span>
                <span>Grain size classification (fine/medium/coarse)</span>
              </div>
              <div className="feature-item">
                <span className="check-icon">✓</span>
                <span>Shape and texture analysis</span>
              </div>
              <div className="feature-item">
                <span className="check-icon">✓</span>
                <span>Mineral composition estimation</span>
              </div>
              <div className="feature-item">
                <span className="check-icon">✓</span>
                <span>Location type inference</span>
              </div>
              <div className="feature-item">
                <span className="check-icon">✓</span>
                <span>Scientific report generation</span>
              </div>
              <div className="feature-item">
                <span className="check-icon">✓</span>
                <span>PDF and CSV export</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
// Optimized for performance
