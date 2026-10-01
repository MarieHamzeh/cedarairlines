const db = require('../config/db');
const crypto = require('crypto');

function generateBookingReference() {
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `CDR-${random}`;
}

// GET all bookings (admin view, with user/guest + flight + seat info)
const getBookings = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT b.*,
             COALESCE(u.first_name, MIN(p.first_name)) AS first_name,
             COALESCE(u.last_name, MIN(p.last_name)) AS last_name,
             COALESCE(u.email, b.guest_email) AS email,
             f.flight_number, f.departure_time,
             a1.code AS origin_code, a2.code AS destination_code,
             GROUP_CONCAT(s.seat_number ORDER BY s.seat_number SEPARATOR ', ') AS seats,
             GROUP_CONCAT(DISTINCT s.class SEPARATOR ', ') AS seat_classes
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.user_id
      LEFT JOIN passengers p ON p.booking_id = b.booking_id
      LEFT JOIN flight_seats fs ON p.flight_seat_id = fs.flight_seat_id
      LEFT JOIN seats s ON fs.seat_id = s.seat_id
      JOIN flights f ON b.flight_id = f.flight_id
      JOIN airports a1 ON f.origin_airport_id = a1.airport_id
      JOIN airports a2 ON f.destination_airport_id = a2.airport_id
      GROUP BY b.booking_id
      ORDER BY b.booked_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET single booking with passengers + their seats
const getBookingById = async (req, res) => {
  try {
    const [booking] = await db.query(`
      SELECT b.*,
             COALESCE(u.first_name, MIN(p.first_name)) AS first_name,
             COALESCE(u.last_name, MIN(p.last_name)) AS last_name,
             COALESCE(u.email, b.guest_email) AS email
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.user_id
      LEFT JOIN passengers p ON p.booking_id = b.booking_id
      WHERE b.booking_id = ?
      GROUP BY b.booking_id
    `, [req.params.id]);

    if (booking.length === 0) return res.status(404).json({ error: 'Booking not found' });

    const [passengers] = await db.query(`
      SELECT p.*, s.seat_number, s.class AS seat_class, s.is_window, s.is_aisle, fs.price
      FROM passengers p
      LEFT JOIN flight_seats fs ON p.flight_seat_id = fs.flight_seat_id
      LEFT JOIN seats s ON fs.seat_id = s.seat_id
      WHERE p.booking_id = ?
    `, [req.params.id]);

    res.json({ ...booking[0], passengers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE booking (customer-facing) — books a specific seat chosen from the seat map.
// Works for logged-in users (req.user set by optionalAuth) or guests (guest_email/guest_phone).
const createBooking = async (req, res) => {
  const {
    flight_id, seat_class, flight_seat_id, first_name, last_name, date_of_birth,
    passport_number, nationality, payment_method, guest_email, guest_phone
  } = req.body;

  if (!flight_id || !seat_class || !flight_seat_id || !first_name || !last_name || !passport_number || !payment_method) {
    return res.status(400).json({ error: 'Missing required booking details' });
  }

  const isGuest = !req.user;
  if (isGuest && !guest_email) {
    return res.status(400).json({ error: 'Email is required for guest bookings' });
  }

  try {
    const [seatRows] = await db.query(`
      SELECT fs.flight_seat_id, fs.price, fs.is_booked, s.class
      FROM flight_seats fs
      JOIN seats s ON fs.seat_id = s.seat_id
      WHERE fs.flight_seat_id = ? AND fs.flight_id = ?
    `, [flight_seat_id, flight_id]);

    if (seatRows.length === 0) {
      return res.status(404).json({ error: 'Seat not found for this flight' });
    }

    const seat = seatRows[0];

    if (seat.class !== seat_class) {
      return res.status(400).json({ error: 'Selected seat does not match the chosen class' });
    }

    if (seat.is_booked) {
      return res.status(409).json({ error: 'This seat has just been booked by someone else — please pick another' });
    }

    const booking_reference = generateBookingReference();

    const [bookingResult] = await db.query(
      `INSERT INTO bookings (booking_reference, user_id, flight_id, booking_status, total_amount, guest_email, guest_phone)
       VALUES (?, ?, ?, 'pending', ?, ?, ?)`,
      [
        booking_reference,
        isGuest ? null : req.user.user_id,
        flight_id,
        seat.price,
        isGuest ? guest_email : null,
        isGuest ? (guest_phone || null) : null,
      ]
    );

    // Only marks it booked if it's still free at this exact moment — guards against
    // two people submitting for the same seat within the same instant.
    const [updateResult] = await db.query(
      'UPDATE flight_seats SET is_booked = 1 WHERE flight_seat_id = ? AND is_booked = 0',
      [flight_seat_id]
    );

    if (updateResult.affectedRows === 0) {
      await db.query('DELETE FROM bookings WHERE booking_id = ?', [bookingResult.insertId]);
      return res.status(409).json({ error: 'This seat has just been booked by someone else — please pick another' });
    }

    await db.query(
      `INSERT INTO passengers (booking_id, flight_seat_id, first_name, last_name, date_of_birth, passport_number, nationality)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [bookingResult.insertId, flight_seat_id, first_name, last_name, date_of_birth || null, passport_number, nationality || null]
    );

    await db.query(
      `INSERT INTO payments (booking_id, amount, payment_method, payment_status)
       VALUES (?, ?, ?, 'pending')`,
      [bookingResult.insertId, seat.price, payment_method]
    );

    res.status(201).json({
      message: 'Booking created',
      booking_id: bookingResult.insertId,
      booking_reference,
      total_amount: seat.price
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE booking status (confirm/cancel)
const updateBookingStatus = async (req, res) => {
  const { booking_status } = req.body;
  try {
    await db.query('UPDATE bookings SET booking_status = ? WHERE booking_id = ?',
      [booking_status, req.params.id]);
    res.json({ message: 'Booking status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE booking
const deleteBooking = async (req, res) => {
  try {
    await db.query('DELETE FROM bookings WHERE booking_id = ?', [req.params.id]);
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getBookings, getBookingById, createBooking, updateBookingStatus, deleteBooking };