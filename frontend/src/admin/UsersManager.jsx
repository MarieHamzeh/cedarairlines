import { useState, useEffect, useCallback } from 'react';

const API = 'http://localhost:5000/api';

function UsersManager() {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem('token');

  const fetchUsers = useCallback(async () => {
    const res = await fetch(`${API}/users`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setUsers(data);
  }, [token]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const updateRole = async (id, role) => {
    await fetch(`${API}/users/${id}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ role })
    });
    fetchUsers();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await fetch(`${API}/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchUsers();
  };

  return (
    <div>
      <h1>Users</h1>
      <table className="admin-table">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.user_id}>
              <td>{u.first_name} {u.last_name}</td>
              <td>{u.email}</td>
              <td>
                <select value={u.role} onChange={(e) => updateRole(u.user_id, e.target.value)}>
                  <option value="customer">Customer</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td>{new Date(u.created_at).toLocaleDateString()}</td>
              <td>
                <button className="btn-delete" onClick={() => handleDelete(u.user_id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UsersManager;