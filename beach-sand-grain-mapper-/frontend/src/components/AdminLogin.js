import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './Login.css';

const AdminLogin = ({ onLogin }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);

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

            if (user.role !== 'Admin') {
                alert("Access Denied: You are not an admin.");
                setIsLoading(false);
                return;
            }

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
        <div className="login-container" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
            <motion.div
                className="login-card"
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{
                    duration: 0.8,
                    type: "spring",
                    stiffness: 100
                }}
                style={{ border: '1px solid #333', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)' }}
            >
                <motion.div
                    className="logo-section"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    <div className="logo">🛡️</div>
                    <h1 style={{ color: '#e94560' }}>Admin Portal</h1>
                    <p style={{ color: '#888' }}>Secure Access Required</p>
                </motion.div>

                <motion.form
                    onSubmit={handleSubmit}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                >
                    <div className="form-group">
                        <label htmlFor="email" style={{ color: '#ccc' }}>Admin Username</label>
                        <motion.input
                            type="text"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            whileFocus={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            placeholder="Enter admin ID"
                            style={{ background: '#0f3460', color: 'white', border: '1px solid #16213e' }}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" style={{ color: '#ccc' }}>Password</label>
                        <motion.input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            whileFocus={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            style={{ background: '#0f3460', color: 'white', border: '1px solid #16213e' }}
                        />
                    </div>

                    <motion.button
                        type="submit"
                        className="login-btn"
                        disabled={isLoading}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400 }}
                        style={{ background: '#e94560' }}
                    >
                        {isLoading ? (
                            <motion.div
                                className="loading-spinner"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                        ) : (
                            'Authenticate'
                        )}
                    </motion.button>
                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <Link to="/login" style={{ color: '#888', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to User Login</Link>
                    </div>
                </motion.form>
            </motion.div>
        </div>
    );
};

export default AdminLogin;

// Optimized for performance




