const express = require('express');
const router = express.Router();
const {
  getFlights, getFlightById, createFlight, updateFlight, deleteFlight,
  getFlightSeatSummary, updateSeatPricing, generateSeatPricing, getSeatMap,getPopularFlights
} = require('../controllers/flightController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.get('/popular', getPopularFlights);
router.get('/', getFlights);
router.get('/:id', getFlightById);
router.get('/:id/seat-summary', getFlightSeatSummary);
router.put('/:id/seat-pricing', protect, isAdmin, updateSeatPricing);
router.post('/:id/generate-seats', protect, isAdmin, generateSeatPricing);
router.post('/', protect, isAdmin, createFlight);
router.put('/:id', protect, isAdmin, updateFlight);
router.delete('/:id', protect, isAdmin, deleteFlight);
router.get('/:id/seat-map', getSeatMap);


module.exports = router;