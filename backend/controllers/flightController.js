const db = require('../config/db');

// GET all flights
const getFlights = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT f.*, 
             a1.code AS origin_code, a1.city AS origin_city, a1.country AS origin_country,
             a2.code AS destination_code, a2.city AS destination_city, a2.country AS destination_country,
             ac.model
      FROM flights f
      JOIN airports a1 ON f.origin_airport_id = a1.airport_id
      JOIN airports a2 ON f.destination_airport_id = a2.airport_id
      JOIN aircraft ac ON f.aircraft_id = ac.aircraft_id
      ORDER BY f.departure_time DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET single flight (with full route + aircraft info)
const getFlightById = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT f.*, 
             a1.code AS origin_code, a1.city AS origin_city, a1.country AS origin_country, a1.name AS origin_name,
             a2.code AS destination_code, a2.city AS destination_city, a2.country AS destination_country, a2.name AS destination_name,
             ac.model
      FROM flights f
      JOIN airports a1 ON f.origin_airport_id = a1.airport_id
      JOIN airports a2 ON f.destination_airport_id = a2.airport_id
      JOIN aircraft ac ON f.aircraft_id = ac.aircraft_id
      WHERE f.flight_id = ?
    `, [req.params.id]);

    if (rows.length === 0) return res.status(404).json({ error: 'Flight not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET seat class summary for a flight (price + availability per class)
const getFlightSeatSummary = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.class,
             MIN(fs.price) AS price,
             COUNT(*) AS total_seats,
             SUM(CASE WHEN fs.is_booked = 0 THEN 1 ELSE 0 END) AS available_seats
      FROM flight_seats fs
      JOIN seats s ON fs.seat_id = s.seat_id
      WHERE fs.flight_id = ?
      GROUP BY s.class
    `, [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET individual seat map for a flight + class (for seat selection during booking)
const getSeatMap = async (req, res) => {
  const { class: seatClass } = req.query;
  if (!seatClass) return res.status(400).json({ error: 'class query param is required' });

  try {
    const [rows] = await db.query(`
      SELECT fs.flight_seat_id, s.seat_number, s.class, s.is_window, s.is_aisle, fs.is_booked, fs.price
      FROM flight_seats fs
      JOIN seats s ON fs.seat_id = s.seat_id
      WHERE fs.flight_id = ? AND s.class = ?
      ORDER BY s.seat_number
    `, [req.params.id, seatClass]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE pricing for a whole class on a flight (admin)
const updateSeatPricing = async (req, res) => {
  const { class: seatClass, price } = req.body;
  if (!seatClass || price == null) {
    return res.status(400).json({ error: 'class and price are required' });
  }
  try {
    await db.query(`
      UPDATE flight_seats fs
      JOIN seats s ON fs.seat_id = s.seat_id
      SET fs.price = ?
      WHERE fs.flight_id = ? AND s.class = ?
    `, [price, req.params.id, seatClass]);
    res.json({ message: 'Pricing updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE flight
const createFlight = async (req, res) => {
  const { flight_number, aircraft_id, origin_airport_id, destination_airport_id,
          departure_time, arrival_time, duration_minutes, base_price } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO flights (flight_number, aircraft_id, origin_airport_id, destination_airport_id,
       departure_time, arrival_time, duration_minutes, base_price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [flight_number, aircraft_id, origin_airport_id, destination_airport_id,
       departure_time, arrival_time, duration_minutes, base_price]
    );

    const [seats] = await db.query('SELECT seat_id, class FROM seats WHERE aircraft_id = ?', [aircraft_id]);
    for (const seat of seats) {
      const price = seat.class === 'first' ? base_price * 2.5
                  : seat.class === 'business' ? base_price * 1.6
                  : base_price;
      await db.query(
        'INSERT INTO flight_seats (flight_id, seat_id, price) VALUES (?, ?, ?)',
        [result.insertId, seat.seat_id, price]
      );
    }

    res.status(201).json({ message: 'Flight created', flight_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE flight
const updateFlight = async (req, res) => {
  const { flight_number, departure_time, arrival_time, status, base_price } = req.body;
  try {
    await db.query(
      `UPDATE flights SET flight_number = ?, departure_time = ?, arrival_time = ?, status = ?, base_price = ?
       WHERE flight_id = ?`,
      [flight_number, departure_time, arrival_time, status, base_price, req.params.id]
    );
    res.json({ message: 'Flight updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE flight
const deleteFlight = async (req, res) => {
  try {
    await db.query('DELETE FROM flights WHERE flight_id = ?', [req.params.id]);
    res.json({ message: 'Flight deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GENERATE flight_seats for a flight that doesn't have any yet (backfill)
const generateSeatPricing = async (req, res) => {
  try {
    const [existing] = await db.query(
      'SELECT COUNT(*) AS count FROM flight_seats WHERE flight_id = ?',
      [req.params.id]
    );
    if (existing[0].count > 0) {
      return res.status(400).json({ error: 'This flight already has seat pricing' });
    }

    const [[flight]] = await db.query('SELECT * FROM flights WHERE flight_id = ?', [req.params.id]);
    if (!flight) return res.status(404).json({ error: 'Flight not found' });

    const [seats] = await db.query('SELECT seat_id, class FROM seats WHERE aircraft_id = ?', [flight.aircraft_id]);
    if (seats.length === 0) {
      return res.status(400).json({ error: 'This aircraft has no seats defined' });
    }

    for (const seat of seats) {
      const price = seat.class === 'first' ? flight.base_price * 2.5
                  : seat.class === 'business' ? flight.base_price * 1.6
                  : flight.base_price;
      await db.query(
        'INSERT INTO flight_seats (flight_id, seat_id, price) VALUES (?, ?, ?)',
        [req.params.id, seat.seat_id, price]
      );
    }

    res.json({ message: 'Seat pricing generated', seats_created: seats.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// GET most-booked flights (falls back to soonest departing if no bookings yet)
const getPopularFlights = async (req, res) => {
  const limit = parseInt(req.query.limit) || 3;
  try {
    const [rows] = await db.query(`
      SELECT f.*, 
             a1.code AS origin_code, a1.city AS origin_city,
             a2.code AS destination_code, a2.city AS destination_city, a2.country AS destination_country,
             ac.model,
             COUNT(b.booking_id) AS booking_count
      FROM flights f
      JOIN airports a1 ON f.origin_airport_id = a1.airport_id
      JOIN airports a2 ON f.destination_airport_id = a2.airport_id
      JOIN aircraft ac ON f.aircraft_id = ac.aircraft_id
      LEFT JOIN bookings b ON b.flight_id = f.flight_id
      GROUP BY f.flight_id
      ORDER BY booking_count DESC, f.departure_time ASC
      LIMIT ?
    `, [limit]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getFlights, getFlightById, createFlight, updateFlight, deleteFlight,
  getFlightSeatSummary, updateSeatPricing, getPopularFlights,
  generateSeatPricing, getSeatMap
};

