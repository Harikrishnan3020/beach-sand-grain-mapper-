import React, { useEffect, useState } from 'react';
import './AdminDashboard.css';

const AdminDashboard = ({ user, onLogout }) => {
  const [users, setUsers] = useState([]);
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'Active').length;
  const totalAnalyses = users.reduce(
    (sum, u) => sum + (u.analyses || 0),
    0
  );

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem('sgm_users') || '[]');
    setUsers(storedUsers);
  }, []);

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
        <h1>Admin Dashboard</h1>
        <p>Welcome, {user.name} (Admin)</p>
        </div>

      <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{totalUsers}</p>
        </div>

        <div className="stat-card">
          <h3>Active Users</h3>
          <p>{activeUsers}</p>
        </div>

        <div className="stat-card">
          <h3>Total Analyses</h3>
          <p>{totalAnalyses}</p>
        </div>
      </div>
      
      <h2 style={{ marginTop: '30px' }}>User Analysis Activity</h2>

      <div className="chart">
        {users.map(user => (
          <div key={user.email} className="chart-row">
          <span className="chart-label">{user.email}</span>
          <div
            className="chart-bar"
            style={{ width: `${(user.analyses || 0) * 20}px` }}
          >
          {user.analyses || 0}
          </div>
          </div>
        ))}
      </div>

      <h2>User Activity</h2>

      <table border="1" cellPadding="10" cellSpacing="0" className="user-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Login Time</th>
            <th>Analyses</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.email}>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.status}</td>
              <td>{new Date(u.loginTime).toLocaleString()}</td>
              <td>{u.analyses}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
