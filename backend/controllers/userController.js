const db = require('../config/db');

const getUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT user_id, first_name, last_name, email, phone, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT user_id, first_name, last_name, email, phone, role, created_at FROM users WHERE user_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update role (e.g. promote to admin/staff)
const updateUserRole = async (req, res) => {
  const { role } = req.body;
  try {
    await db.query('UPDATE users SET role = ? WHERE user_id = ?', [role, req.params.id]);
    res.json({ message: 'User role updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE user_id = ?', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getUsers, getUserById, updateUserRole, deleteUser };