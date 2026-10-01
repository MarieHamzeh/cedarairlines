const db = require('../config/db');

// GET all seats for one aircraft
const getSeatsByAircraft = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM seats WHERE aircraft_id = ? ORDER BY seat_id',
      [req.params.aircraftId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GENERATE the seat map for an aircraft from its economy/business/first_class_seats counts
const generateSeats = async (req, res) => {
  try {
    const [existing] = await db.query(
      'SELECT COUNT(*) AS count FROM seats WHERE aircraft_id = ?',
      [req.params.aircraftId]
    );
    if (existing[0].count > 0) {
      return res.status(400).json({ error: 'This aircraft already has seats defined' });
    }

    const [[aircraft]] = await db.query('SELECT * FROM aircraft WHERE aircraft_id = ?', [req.params.aircraftId]);
    if (!aircraft) return res.status(404).json({ error: 'Aircraft not found' });

    const LAYOUTS = {
      first:    { letters: ['A', 'B'], window: ['A', 'B'], aisle: ['A', 'B'] },
      business: { letters: ['A', 'B', 'C', 'D'], window: ['A', 'D'], aisle: ['B', 'C'] },
      economy:  { letters: ['A', 'B', 'C', 'D', 'E', 'F'], window: ['A', 'F'], aisle: ['C', 'D'] },
    };

    const classPlan = [
      { key: 'first', count: aircraft.first_class_seats },
      { key: 'business', count: aircraft.business_seats },
      { key: 'economy', count: aircraft.economy_seats },
    ];

    const seatsToInsert = [];
    let row = 1;

    for (const { key, count } of classPlan) {
      const layout = LAYOUTS[key];
      let remaining = count;
      while (remaining > 0) {
        for (const letter of layout.letters) {
          if (remaining <= 0) break;
          seatsToInsert.push([
            aircraft.aircraft_id,
            `${row}${letter}`,
            key,
            layout.window.includes(letter) ? 1 : 0,
            layout.aisle.includes(letter) ? 1 : 0,
          ]);
          remaining--;
        }
        row++;
      }
    }

    for (const seat of seatsToInsert) {
      await db.query(
        'INSERT INTO seats (aircraft_id, seat_number, class, is_window, is_aisle) VALUES (?, ?, ?, ?, ?)',
        seat
      );
    }

    res.json({ message: 'Seats generated', seats_created: seatsToInsert.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getSeatsByAircraft, generateSeats };