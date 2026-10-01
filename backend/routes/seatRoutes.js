const express = require('express');
const router = express.Router();
const { getSeatsByAircraft, generateSeats } = require('../controllers/seatController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.get('/:aircraftId', getSeatsByAircraft);
router.post('/:aircraftId/generate', protect, isAdmin, generateSeats);

module.exports = router;