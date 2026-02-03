import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Login.css';

// Simulate Google OAuth user data
const mockGoogleUsers = [
  { email: 'john.doe@gmail.com', name: 'John Doe', picture: 'https://via.placeholder.com/40' },
  { email: 'jane.smith@gmail.com', name: 'Jane Smith', picture: 'https://via.placeholder.com/40' },
  { email: 'mike.johnson@gmail.com', name: 'Mike Johnson', picture: 'https://via.placeholder.com/40' },
  { email: 'sarah.wilson@gmail.com', name: 'Sarah Wilson', picture: 'https://via.placeholder.com/40' }
];

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'Weak' });

  const checkPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length > 6) score++;
    if (pass.length > 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    // Cap at 4
    if (score > 4) score = 4;

    let label = 'Weak';
    if (score === 2) label = 'Fair';
    if (score === 3) label = 'Good';
    if (score === 4) label = 'Strong';

    setPasswordStrength({ score, label });
  };

  const getStrengthColor = (score) => {
    if (score <= 1) return '#ff4d4d'; // Red
    if (score === 2) return '#ffa64d'; // Orange
    if (score === 3) return '#33cc33'; // Green
    return '#00b300'; // Dark Green
  };

  const suggestStrongPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password: password }));
    checkPasswordStrength(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      const user = data.user;

      onLogin(user);
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please check credentials or try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-container">
      <motion.div
        className="login-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="sand-particles">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="particle"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: 0
              }}
              animate={{
                y: [null, -20, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
      </motion.div>

      <motion.div
        className="login-card"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          type: "spring",
          stiffness: 100
        }}
      >
        <motion.div
          className="logo-section"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="logo">🏖️</div>
          <h1>SandGrainMapper</h1>
          <p>AI-Powered Sand Analysis Platform</p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <motion.input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={(e) => {
                handleChange(e);
                // Real-time email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(e.target.value) && e.target.value.length > 0) {
                  e.target.setCustomValidity("Please enter a valid email address.");
                } else {
                  e.target.setCustomValidity("");
                }
              }}
              required
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <motion.input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={(e) => {
                handleChange(e);
                checkPasswordStrength(e.target.value);
              }}
              required
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            {formData.password && (
              <div className="password-strength-meter" style={{ marginTop: '5px', fontSize: '0.8rem' }}>
                <div style={{
                  height: '4px',
                  width: '100%',
                  backgroundColor: '#eee',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  marginBottom: '4px'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${(passwordStrength.score / 4) * 100}%`,
                    backgroundColor: getStrengthColor(passwordStrength.score),
                    transition: 'all 0.3s ease'
                  }} />
                </div>
                <span style={{ color: getStrengthColor(passwordStrength.score) }}>
                  Strength: {passwordStrength.label}
                </span>
                {passwordStrength.score < 3 && (
                  <div style={{ marginTop: '5px' }}>
                    <span
                      style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={suggestStrongPassword}
                    >
                      Suggest Strong Password
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <motion.button
            type="submit"
            className="login-btn"
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            {isLoading ? (
              <motion.div
                className="loading-spinner"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              'Sign In'
            )}
          </motion.button>
        </motion.form>

        <motion.div
          className="demo-note"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <p>Demo Mode - Use any email/password to continue</p>
          <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
            <Link to="/admin/login" style={{ color: '#666', fontSize: '0.9rem' }}>Admin Access</Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
// Optimized for performance
