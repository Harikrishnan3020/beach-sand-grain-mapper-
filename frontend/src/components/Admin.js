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
import { Line, Doughnut } from 'react-chartjs-2';
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

  useEffect(() => {
    // Load persisted state from localStorage if available
    const savedUsers = window.localStorage.getItem('sgm_users');
    const savedAnalysis = window.localStorage.getItem('sgm_analysisHistory');
    const savedStats = window.localStorage.getItem('sgm_systemStats');
    const savedLocationSoils = window.localStorage.getItem('sgm_locationSoils');

    if (savedUsers) setUsers(JSON.parse(savedUsers));
    if (savedAnalysis) setAnalysisHistory(JSON.parse(savedAnalysis));
    if (savedStats) setSystemStats(JSON.parse(savedStats));
    if (savedLocationSoils) setLocationSoils(JSON.parse(savedLocationSoils));

    // If no persisted state, initialize defaults (only if no users exist)
    if (!savedUsers || JSON.parse(savedUsers).length === 0) setUsers([]);

    if (!savedAnalysis) setAnalysisHistory([]);

    if (!savedStats) setSystemStats({
      totalUsers: 0,
      activeUsers: 0,
      totalAnalyses: 0,
      successRate: 0,
      avgGrains: 0,
      storageUsed: 0,
      storageLimit: 10
    });
    if (!savedLocationSoils) setLocationSoils([]);

    // Update locationSoils from analysisHistory if coordinates are available
    if (savedAnalysis) {
      const analyses = JSON.parse(savedAnalysis);
      const locationsFromAnalyses = analyses
        .filter(analysis => analysis.coordinates && analysis.coordinates.lat && analysis.coordinates.lng)
        .map(analysis => ({
          id: analysis.id,
          location: analysis.location || `${analysis.coordinates.lat}, ${analysis.coordinates.lng}`,
          soil: analysis.soilType || 'Unknown',
          coordinates: analysis.coordinates
        }));
      if (locationsFromAnalyses.length > 0) {
        setLocationSoils(locationsFromAnalyses);
      }
    }
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
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
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
          <div style={{marginTop:8}}>
            <input id="newLocation" placeholder="Location" />
            <input id="newSoil" placeholder="Soil" style={{marginLeft:8}} />
            <button className="btn btn-primary" onClick={() => {
              const loc = document.getElementById('newLocation').value;
              const soil = document.getElementById('newSoil').value;
              if (!loc || !soil) return alert('Enter both');
              setLocationSoils([...locationSoils, { id: Date.now(), location: loc, soil }]);
              document.getElementById('newLocation').value=''; document.getElementById('newSoil').value='';
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
                      <input defaultValue={user.name} onBlur={(e) => setUsers(users.map(u => u.id===user.id?{...u,name:e.target.value}:u))} />
                    ) : (
                      <span>{user.name}</span>
                    )}
                  </div>
                </td>
                <td>{editingUserId === user.id ? <input defaultValue={user.email} onBlur={(e) => setUsers(users.map(u => u.id===user.id?{...u,email:e.target.value}:u))} /> : user.email}</td>
                <td>
                  {editingUserId === user.id ? (
                    <select defaultValue={user.role} onChange={(e) => setUsers(users.map(u => u.id===user.id?{...u,role:e.target.value}:u))}>
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
                <td>{editingUserId === user.id ? <input defaultValue={user.status} onBlur={(e) => setUsers(users.map(u => u.id===user.id?{...u,status:e.target.value}:u))} /> : <span className={`status-badge ${user.status.toLowerCase()}`}>{user.status}</span>}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" onClick={() => setEditingUserId(editingUserId===user.id?null:user.id)}>{editingUserId===user.id?'💾':'✏️'}</button>
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
                    <button className="btn-icon" title="View Details">👁️</button>
                    <button className="btn-icon" title="Download Report">📄</button>
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
        {activeTab === 'settings' && renderSettings()}
      </div>
    </motion.div>
  );
};

export default Admin;