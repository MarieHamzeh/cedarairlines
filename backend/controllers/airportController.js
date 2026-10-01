const db = require('../config/db');

const getAirports = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM airports');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createAirport = async (req, res) => {
  const { code, name, city, country, timezone } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO airports (code, name, city, country, timezone) VALUES (?, ?, ?, ?, ?)',
      [code, name, city, country, timezone]
    );
    res.status(201).json({ message: 'Airport added', airport_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateAirport = async (req, res) => {
  const { code, name, city, country, timezone } = req.body;
  try {
    await db.query(
      'UPDATE airports SET code=?, name=?, city=?, country=?, timezone=? WHERE airport_id=?',
      [code, name, city, country, timezone, req.params.id]
    );
    res.json({ message: 'Airport updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteAirport = async (req, res) => {
  try {
    await db.query('DELETE FROM airports WHERE airport_id = ?', [req.params.id]);
    res.json({ message: 'Airport deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAirports, createAirport, updateAirport, deleteAirport };