const express = require('express');
const router = express.Router();
const { getBookings, getBookingById, updateBookingStatus, deleteBooking, createBooking } = require('../controllers/bookingController');
const { protect, isAdmin, optionalAuth } = require('../middleware/authMiddleware');

router.get('/', protect, isAdmin, getBookings);
router.get('/:id', protect, isAdmin, getBookingById);
router.put('/:id/status', protect, isAdmin, updateBookingStatus);
router.delete('/:id', protect, isAdmin, deleteBooking);

router.post('/', optionalAuth, createBooking);

module.exports = router;