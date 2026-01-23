
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import Map from './Map';
import './Admin.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [systemStats, setSystemStats] = useState({});
  const [locationSoils, setLocationSoils] = useState([]);
  const [editDashboard, setEditDashboard] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [queries, setQueries] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/data');
        if (!response.ok) throw new Error('Failed to fetch admin data');
        const data = await response.json();

        setUsers(data.users || []);
        setAnalysisHistory(data.analysisHistory || []);

        if (data.systemStats) setSystemStats(data.systemStats);

        // Process locations if needed
        const analyses = data.analysisHistory || [];
        const locationsFromAnalyses = analyses
          .filter(analysis => analysis.details && analysis.details.coordinates)
          .map(analysis => ({
            id: analysis.id,
            location: analysis.details.location || 'Unknown',
            soil: analysis.details.soilType || 'Unknown',
            coordinates: analysis.details.coordinates
          }));

        if (locationsFromAnalyses.length > 0) {
          setLocationSoils(locationsFromAnalyses);
        }

        // Fetch user queries
        const queriesResponse = await fetch('/api/queries/all');
        if (queriesResponse.ok) {
          const queriesData = await queriesResponse.json();
          setQueries(queriesData.queries || []);
        }
      } catch (err) {
        console.error("Admin fetch error:", err);
      }
    };

    fetchData();
    // Poll every 10 seconds for updates
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Persist changes to localStorage
  useEffect(() => {
    window.localStorage.setItem('sgm_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    window.localStorage.setItem('sgm_analysisHistory', JSON.stringify(analysisHistory));
  }, [analysisHistory]);

  useEffect(() => {
    window.localStorage.setItem('sgm_systemStats', JSON.stringify(systemStats));
  }, [systemStats]);

  useEffect(() => {
    window.localStorage.setItem('sgm_locationSoils', JSON.stringify(locationSoils));
  }, [locationSoils]);

  const saveSettings = () => {
    window.localStorage.setItem('sgm_users', JSON.stringify(users));
    window.localStorage.setItem('sgm_analysisHistory', JSON.stringify(analysisHistory));
    window.localStorage.setItem('sgm_systemStats', JSON.stringify(systemStats));
    window.localStorage.setItem('sgm_locationSoils', JSON.stringify(locationSoils));
    alert('Admin configuration saved locally');
  };

  const resetDefaults = () => {
    if (!window.confirm('Reset admin configuration to defaults?')) return;
    window.localStorage.removeItem('sgm_users');
    window.localStorage.removeItem('sgm_analysisHistory');
    window.localStorage.removeItem('sgm_systemStats');
    window.localStorage.removeItem('sgm_locationSoils');
    window.location.reload();
  };

  const exportConfig = () => {
    const cfg = { users, analysisHistory, systemStats, locationSoils };
    const blob = new Blob([JSON.stringify(cfg, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sgm-admin-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUserAction = (userId, action) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        switch (action) {
          case 'activate':
            return { ...user, status: 'Active' };
          case 'deactivate':
            return { ...user, status: 'Inactive' };
          case 'promote':
            return { ...user, role: user.role === 'User' ? 'Researcher' : 'Admin' };
          case 'demote':
            return { ...user, role: user.role === 'Admin' ? 'Researcher' : 'User' };
          default:
            return user;
        }
      }
      return user;
    }));
  };

  const deleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  // Chart data
  const userActivityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Daily Analyses',
        data: [12, 19, 15, 25, 22, 18, 8],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      }
    ]
  };

  const analysisTypeData = {
    labels: ['Upload', 'Camera'],
    datasets: [
      {
        data: [65, 35],
        backgroundColor: ['#FF6384', '#36A2EB'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB']
      }
    ]
  };

  const userRoleData = {
    labels: ['Users', 'Researchers', 'Admins'],
    datasets: [
      {
        data: [2, 1, 1],
        backgroundColor: ['#FFCE56', '#FF6384', '#36A2EB'],
        hoverBackgroundColor: ['#FFCE56', '#FF6384', '#36A2EB']
      }
    ]
  };

  const renderDashboard = () => (
    <div className="admin-dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Dashboard</h2>
        <div>
          <button className="btn btn-secondary" onClick={() => setEditDashboard(!editDashboard)}>{editDashboard ? 'Done' : 'Edit'}</button>
        </div>
      </div>
      <div className="stats-grid">
        <motion.div className="stat-card" whileHover={{ scale: 1.02 }}>
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-number">{systemStats.totalUsers}</p>
            <span className="stat-change positive">+2 this week</span>
          </div>
        </motion.div>

        <motion.div className="stat-card" whileHover={{ scale: 1.02 }}>
          <div className="stat-icon">🔬</div>
          <div className="stat-content">
            <h3>Total Analyses</h3>
            <p className="stat-number">{systemStats.totalAnalyses}</p>
            <span className="stat-change positive">+15 today</span>
          </div>
        </motion.div>

        <motion.div className="stat-card" whileHover={{ scale: 1.02 }}>
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Success Rate</h3>
            <p className="stat-number">{systemStats.successRate}%</p>
            <span className="stat-change positive">+2.1%</span>
          </div>
        </motion.div>

        <motion.div className="stat-card" whileHover={{ scale: 1.02 }}>
          <div className="stat-icon">💾</div>
          <div className="stat-content">
            <h3>Storage Used</h3>
            <p className="stat-number">{systemStats.storageUsed}GB</p>
            <span className="stat-change neutral">of {systemStats.storageLimit}GB</span>
          </div>
        </motion.div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Weekly Activity</h3>
          <Line data={userActivityData} options={{ responsive: true }} />
        </div>

        <div className="chart-card">
          <h3>Analysis Methods</h3>
          <Doughnut data={analysisTypeData} options={{ responsive: true }} />
        </div>

        <div className="chart-card">
          <h3>User Roles</h3>
          <Doughnut data={userRoleData} options={{ responsive: true }} />
        </div>
      </div>

      <div className="user-activities-card">
        <h3>Recent User Activities</h3>
        <div className="activities-list">
          {analysisHistory.slice(-5).reverse().map(activity => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon">
                {activity.type === 'Upload' ? '📤' : '📷'}
              </div>
              <div className="activity-content">
                <strong>{activity.user}</strong> performed {activity.type.toLowerCase()} analysis
                <br />
                <small>{activity.timestamp} • {activity.grains} grains detected</small>
              </div>
              <div className={`activity-status ${activity.status.toLowerCase()}`}>
                {activity.status}
              </div>
            </div>
          ))}
          {analysisHistory.length === 0 && (
            <p className="no-activities">No recent activities</p>
          )}
        </div>
      </div>

      <div className="location-soils-card">
        <h3>Location Soils (most found)</h3>
        <ul>
          {locationSoils.map(item => (
            <li key={item.id}>
              <strong>{item.location}:</strong> {item.soil}
              {editDashboard && (
                <>
                  <button className="btn btn-small" onClick={() => {
                    const newList = locationSoils.filter(i => i.id !== item.id);
                    setLocationSoils(newList);
                  }}>Remove</button>
                </>
              )}
            </li>
          ))}
        </ul>
        {editDashboard && (
          <div style={{ marginTop: 8 }}>
            <input id="newLocation" placeholder="Location" />
            <input id="newSoil" placeholder="Soil" style={{ marginLeft: 8 }} />
            <button className="btn btn-primary" onClick={() => {
              const loc = document.getElementById('newLocation').value;
              const soil = document.getElementById('newSoil').value;
              if (!loc || !soil) return alert('Enter both');
              setLocationSoils([...locationSoils, { id: Date.now(), location: loc, soil }]);
              document.getElementById('newLocation').value = ''; document.getElementById('newSoil').value = '';
            }}>Add</button>
          </div>
        )}
      </div>

      <div className="map-card">
        <h3>Analysis Locations</h3>
        <Map locations={locationSoils} />
      </div>
    </div>
  );

  const renderUsers = () => {
    // Filter to show only logged-in users (active status)
    const loggedInUsers = users.filter(user => user.status === 'Active');

    return (
      <div className="admin-users">
        <div className="section-header">
          <h2>User Management - Logged In Users</h2>
          <button className="btn btn-primary">Add New User</button>
        </div>

        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Last Login</th>
                <th>Analyses</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loggedInUsers.map(user => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">{user.name.charAt(0)}</div>
                      {editingUserId === user.id ? (
                        <input defaultValue={user.name} onBlur={(e) => setUsers(users.map(u => u.id === user.id ? { ...u, name: e.target.value } : u))} />
                      ) : (
                        <span>{user.name}</span>
                      )}
                    </div>
                  </td>
                  <td>{editingUserId === user.id ? <input defaultValue={user.email} onBlur={(e) => setUsers(users.map(u => u.id === user.id ? { ...u, email: e.target.value } : u))} /> : user.email}</td>
                  <td>
                    {editingUserId === user.id ? (
                      <select defaultValue={user.role} onChange={(e) => setUsers(users.map(u => u.id === user.id ? { ...u, role: e.target.value } : u))}>
                        <option value="User">User</option>
                        <option value="Researcher">Researcher</option>
                        <option value="Admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span>
                    )}
                  </td>
                  <td>{user.lastLogin}</td>
                  <td>{user.analyses}</td>
                  <td>{editingUserId === user.id ? <input defaultValue={user.status} onBlur={(e) => setUsers(users.map(u => u.id === user.id ? { ...u, status: e.target.value } : u))} /> : <span className={`status-badge ${user.status.toLowerCase()}`}>{user.status}</span>}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" onClick={() => setEditingUserId(editingUserId === user.id ? null : user.id)}>{editingUserId === user.id ? '💾' : '✏️'}</button>
                      <button
                        className="btn-icon"
                        onClick={() => handleUserAction(user.id, user.status === 'Active' ? 'deactivate' : 'activate')}
                        title={user.status === 'Active' ? 'Deactivate' : 'Activate'}
                      >
                        {user.status === 'Active' ? '⏸️' : '▶️'}
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => deleteUser(user.id)}
                        title="Delete User"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderAnalytics = () => (
    <div className="admin-analytics">
      <div className="section-header">
        <h2>Analysis History</h2>
        <div className="filter-controls">
          <select className="filter-select">
            <option>All Users</option>
            <option>Active Users</option>
            <option>Researchers</option>
          </select>
          <select className="filter-select">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
        </div>
      </div>

      <div className="analytics-table">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Timestamp</th>
              <th>Type</th>
              <th>Status</th>
              <th>Grains Detected</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {analysisHistory.map(analysis => (
              <motion.tr
                key={analysis.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <td>{analysis.user}</td>
                <td>{analysis.timestamp}</td>
                <td>
                  <span className={`type-badge ${analysis.type.toLowerCase()}`}>
                    {analysis.type}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${analysis.status.toLowerCase()}`}>
                    {analysis.status}
                  </span>
                </td>
                <td>{analysis.grains}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" title="View Details" onClick={() => setSelectedAnalysis(analysis)}>👁️</button>
                    <button className="btn-icon" title="View Report" onClick={() => setSelectedAnalysis(analysis)}>📄</button>
                    <button className="btn-icon delete" title="Delete">🗑️</button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderQueries = () => {
    const handleQueryStatus = (queryId, newStatus) => {
      setQueries(queries.map(q =>
        q.id === queryId ? { ...q, status: newStatus } : q
      ));
    };

    const deleteQuery = (queryId) => {
      if (window.confirm('Are you sure you want to delete this query?')) {
        setQueries(queries.filter(q => q.id !== queryId));
      }
    };

    return (
      <div className="admin-queries">
        <div className="section-header">
          <h2>User Queries</h2>
          <div className="query-stats">
            <span className="stat-badge">Total: {queries.length}</span>
            <span className="stat-badge pending">Pending: {queries.filter(q => q.status === 'Pending').length}</span>
            <span className="stat-badge resolved">Resolved: {queries.filter(q => q.status === 'Resolved').length}</span>
          </div>
        </div>

        <div className="queries-table">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Subject</th>
                <th>Query</th>
                <th>Timestamp</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {queries.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                    No queries submitted yet
                  </td>
                </tr>
              ) : (
                queries.map(query => (
                  <motion.tr
                    key={query.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td>{query.userName}</td>
                    <td>{query.userEmail}</td>
                    <td>
                      <strong>{query.subject}</strong>
                    </td>
                    <td>
                      <div style={{
                        maxWidth: '300px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {query.query}
                      </div>
                    </td>
                    <td>{new Date(query.timestamp).toLocaleString()}</td>
                    <td>
                      <select
                        value={query.status || 'Pending'}
                        onChange={(e) => handleQueryStatus(query.id, e.target.value)}
                        className={`status-select ${(query.status || 'Pending').toLowerCase()}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon"
                          title="View Full Query"
                          onClick={() => {
                            alert(`Subject: ${query.subject}\n\nQuery:\n${query.query}\n\nFrom: ${query.userName} (${query.userEmail})\nDate: ${new Date(query.timestamp).toLocaleString()}`);
                          }}
                        >
                          👁️
                        </button>
                        <button
                          className="btn-icon delete"
                          onClick={() => deleteQuery(query.id)}
                          title="Delete Query"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="admin-settings">
      <div className="section-header">
        <h2>System Settings</h2>
      </div>

      <div className="settings-grid">
        <div className="settings-card">
          <h3>Analysis Configuration</h3>
          <div className="setting-item">
            <label>Max File Size (MB)</label>
            <input type="number" defaultValue="10" />
          </div>
          <div className="setting-item">
            <label>Supported Formats</label>
            <div className="checkbox-group">
              <label><input type="checkbox" defaultChecked /> JPEG</label>
              <label><input type="checkbox" defaultChecked /> PNG</label>
              <label><input type="checkbox" defaultChecked /> TIFF</label>
            </div>
          </div>
          <div className="setting-item">
            <label>Analysis Timeout (seconds)</label>
            <input type="number" defaultValue="30" />
          </div>
        </div>

        <div className="settings-card">
          <h3>User Management</h3>
          <div className="setting-item">
            <label>Allow User Registration</label>
            <input type="checkbox" defaultChecked />
          </div>
          <div className="setting-item">
            <label>Require Email Verification</label>
            <input type="checkbox" defaultChecked />
          </div>
          <div className="setting-item">
            <label>Default User Role</label>
            <select defaultValue="user">
              <option value="user">User</option>
              <option value="researcher">Researcher</option>
            </select>
          </div>
        </div>

        <div className="settings-card">
          <h3>Storage & Backup</h3>
          <div className="setting-item">
            <label>Auto-delete old analyses (days)</label>
            <input type="number" defaultValue="90" />
          </div>
          <div className="setting-item">
            <label>Backup Frequency</label>
            <select defaultValue="daily">
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <div className="setting-item">
            <label>Storage Limit (GB)</label>
            <input type="number" defaultValue="10" />
          </div>
        </div>

        <div className="settings-card">
          <h3>Notifications</h3>
          <div className="setting-item">
            <label>Email Notifications</label>
            <input type="checkbox" defaultChecked />
          </div>
          <div className="setting-item">
            <label>System Alerts</label>
            <input type="checkbox" defaultChecked />
          </div>
          <div className="setting-item">
            <label>Usage Reports</label>
            <select defaultValue="weekly">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button className="btn btn-primary" onClick={saveSettings}>Save Settings</button>
        <button className="btn btn-secondary" onClick={resetDefaults}>Reset to Defaults</button>
        <button className="btn btn-danger" onClick={exportConfig}>Export Configuration</button>
      </div>
    </div>
  );

  return (
    <motion.div
      className="admin-panel"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <p>Manage users, monitor system performance, and configure settings</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </button>
        <button
          className={`tab ${activeTab === 'queries' ? 'active' : ''}`}
          onClick={() => setActiveTab('queries')}
        >
          💬 Queries
        </button>
        <button
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'queries' && renderQueries()}
        {activeTab === 'settings' && renderSettings()}
        {selectedAnalysis && (
          <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px',
                position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
              }}
            >
              <button
                onClick={() => setSelectedAnalysis(null)}
                style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}
              >
                &times;
              </button>
              <h2 style={{ marginTop: 0, color: '#333', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>Analysis Details</h2>

              <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem', color: "#222" }}>
                <div>
                  <strong style={{ display: 'block', color: '#666', fontSize: '0.9rem' }}>User</strong>
                  <div style={{ fontSize: '1.1rem' }}>{selectedAnalysis.user}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <strong style={{ display: 'block', color: '#666', fontSize: '0.9rem' }}>Type</strong>
                    <span className={`type-badge ${selectedAnalysis.type.toLowerCase()}`}>{selectedAnalysis.type}</span>
                  </div>
                  <div>
                    <strong style={{ display: 'block', color: '#666', fontSize: '0.9rem' }}>Status</strong>
                    <span className={`status-badge ${selectedAnalysis.status.toLowerCase()}`}>{selectedAnalysis.status}</span>
                  </div>
                </div>

                <div>
                  <strong style={{ display: 'block', color: '#666', fontSize: '0.9rem' }}>Timestamp</strong>
                  <div>{new Date(selectedAnalysis.timestamp).toLocaleString()}</div>
                </div>

                {/* Analyzed Image */}
                {selectedAnalysis.details?.image && (
                  <div>
                    <strong style={{ display: 'block', color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Analyzed Image</strong>
                    <img
                      src={selectedAnalysis.details.image}
                      alt="Sand Sample"
                      style={{ width: '100%', borderRadius: '8px', border: '1px solid #ddd', maxHeight: '300px', objectFit: 'contain' }}
                    />
                  </div>
                )}

                {/* Analysis Map */}
                {(selectedAnalysis.details?.location || selectedAnalysis.details?.coordinates) && (
                  <div style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#666' }}>Analysis Location</h4>
                    <Map locations={[{
                      id: 'modal-map',
                      location: selectedAnalysis.details.location || 'Sample Location',
                      soil: selectedAnalysis.details.soilType,
                      coordinates: selectedAnalysis.details.coordinates
                    }]} />
                  </div>
                )}

                {/* Grain Size Chart */}
                {selectedAnalysis.details?.grainSizes && selectedAnalysis.details?.grainCounts && (
                  <div>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#666' }}>Grain Size Distribution</h4>
                    <Bar
                      data={{
                        labels: selectedAnalysis.details.grainSizes.map(s => `${s}μm`),
                        datasets: [{
                          label: 'Grain Count',
                          data: selectedAnalysis.details.grainCounts,
                          backgroundColor: 'rgba(54, 162, 235, 0.6)',
                          borderColor: 'rgba(54, 162, 235, 1)',
                          borderWidth: 1
                        }]
                      }}
                      options={{ responsive: true, plugins: { legend: { display: false } } }}
                    />
                  </div>
                )}

                <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                  <h4 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#495057' }}>Results</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Grains Detected:</span>
                    <strong>{selectedAnalysis.grains}</strong>
                  </div>
                  {selectedAnalysis.details && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>Soil Type:</span>
                        <strong>{selectedAnalysis.details.soilType || 'N/A'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>Location:</span>
                        <strong>{selectedAnalysis.details.location || 'N/A'}</strong>
                      </div>
                      {selectedAnalysis.details.filename && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                          <span>File:</span>
                          <span style={{ color: 'blue' }}>{selectedAnalysis.details.filename}</span>
                        </div>
                      )}

                      {/* Display Full Report if available */}
                      {(selectedAnalysis.details.report || selectedAnalysis.details.details) && (
                        <div style={{ marginTop: '1rem', borderTop: '1px solid #ddd', paddingTop: '1rem' }}>
                          <h4 style={{ marginTop: 0, color: '#495057' }}>Total Soil Report</h4>
                          <div style={{ fontSize: '0.9rem', lineHeight: '1.5', whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto', background: '#fff', padding: '0.5rem', borderRadius: '4px', border: '1px solid #eee' }}>
                            {selectedAnalysis.details.report || selectedAnalysis.details.details}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={() => setSelectedAnalysis(null)}>Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Admin;