import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './UserQuery.css';

const UserQuery = ({ user }) => {
    const [query, setQuery] = useState('');
    const [subject, setSubject] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!subject.trim() || !query.trim()) {
            alert('Please fill in both subject and query fields');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/queries/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user?.id || 'guest',
                    userName: user?.name || 'Guest User',
                    userEmail: user?.email || 'N/A',
                    subject: subject.trim(),
                    query: query.trim(),
                    timestamp: new Date().toISOString()
                }),
            });

            if (response.ok) {
                setSubmitted(true);
                setQuery('');
                setSubject('');
                setTimeout(() => setSubmitted(false), 5000);
            } else {
                alert('Failed to submit query. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting query:', error);
            alert('An error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="user-query-page">
            <div className="container">
                <motion.div
                    className="query-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1>💬 Ask Us Anything</h1>
                    <p>Have questions about SandGrainMapper? We're here to help!</p>
                </motion.div>

                <motion.div
                    className="query-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    {submitted ? (
                        <motion.div
                            className="success-message"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="success-icon">✅</div>
                            <h2>Query Submitted Successfully!</h2>
                            <p>Thank you for reaching out. Our team will review your query and get back to you soon.</p>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="query-form">
                            <div className="form-group">
                                <label htmlFor="subject">
                                    <span className="label-icon">📋</span>
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    id="subject"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="What is your query about?"
                                    maxLength={100}
                                    required
                                />
                                <small className="char-count">{subject.length}/100</small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="query">
                                    <span className="label-icon">✍️</span>
                                    Your Query
                                </label>
                                <textarea
                                    id="query"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Please describe your question or concern in detail..."
                                    rows={8}
                                    maxLength={1000}
                                    required
                                />
                                <small className="char-count">{query.length}/1000</small>
                            </div>

                            <div className="user-info-display">
                                <p><strong>Submitted by:</strong> {user?.name || 'Guest User'}</p>
                                <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
                            </div>

                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <span>🚀</span>
                                        Submit Query
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </motion.div>

                <motion.div
                    className="faq-section"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    <h2>Frequently Asked Questions</h2>
                    <div className="faq-grid">
                        <div className="faq-item">
                            <h3>🔬 How accurate is the analysis?</h3>
                            <p>Our AI-powered system achieves 95%+ accuracy using advanced YOLOv8 technology.</p>
                        </div>
                        <div className="faq-item">
                            <h3>📸 What image formats are supported?</h3>
                            <p>We support JPG, PNG, and TIFF formats for optimal analysis results.</p>
                        </div>
                        <div className="faq-item">
                            <h3>⏱️ How long does analysis take?</h3>
                            <p>Most analyses complete within 5-10 seconds depending on image size.</p>
                        </div>
                        <div className="faq-item">
                            <h3>💾 Is my data secure?</h3>
                            <p>Yes! All data is encrypted and stored securely with regular backups.</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default UserQuery;

// Optimized for performance
