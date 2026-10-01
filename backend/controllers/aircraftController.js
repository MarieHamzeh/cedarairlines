const db = require('../config/db');

const getAircraft = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM aircraft');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createAircraft = async (req, res) => {
  const { model, registration_number, total_seats, economy_seats, business_seats, first_class_seats } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO aircraft (model, registration_number, total_seats, economy_seats, business_seats, first_class_seats)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [model, registration_number, total_seats, economy_seats, business_seats, first_class_seats || 0]
    );
    res.status(201).json({ message: 'Aircraft added', aircraft_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateAircraft = async (req, res) => {
  const { model, registration_number, total_seats, economy_seats, business_seats, first_class_seats } = req.body;
  try {
    await db.query(
      `UPDATE aircraft SET model=?, registration_number=?, total_seats=?, economy_seats=?, business_seats=?, first_class_seats=?
       WHERE aircraft_id = ?`,
      [model, registration_number, total_seats, economy_seats, business_seats, first_class_seats, req.params.id]
    );
    res.json({ message: 'Aircraft updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteAircraft = async (req, res) => {
  try {
    await db.query('DELETE FROM aircraft WHERE aircraft_id = ?', [req.params.id]);
    res.json({ message: 'Aircraft deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAircraft, createAircraft, updateAircraft, deleteAircraft };