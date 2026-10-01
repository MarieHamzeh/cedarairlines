const express = require('express');
const router = express.Router();
const { getAirports, createAirport, updateAirport, deleteAirport } = require('../controllers/airportController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.get('/', getAirports);
router.post('/', protect, isAdmin, createAirport);
router.put('/:id', protect, isAdmin, updateAirport);
router.delete('/:id', protect, isAdmin, deleteAirport);

module.exports = router;