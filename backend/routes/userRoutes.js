const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUserRole, deleteUser } = require('../controllers/userController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.get('/', protect, isAdmin, getUsers);
router.get('/:id', protect, isAdmin, getUserById);
router.put('/:id/role', protect, isAdmin, updateUserRole);
router.delete('/:id', protect, isAdmin, deleteUser);

module.exports = router;