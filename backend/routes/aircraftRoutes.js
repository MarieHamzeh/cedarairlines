const express = require('express');
const router = express.Router();
const { getAircraft, createAircraft, updateAircraft, deleteAircraft } = require('../controllers/aircraftController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.get('/', getAircraft);
router.post('/', protect, isAdmin, createAircraft);
router.put('/:id', protect, isAdmin, updateAircraft);
router.delete('/:id', protect, isAdmin, deleteAircraft);

module.exports = router;