const express = require('express');
const router = express.Router();
const { 
  getBookings, 
  getBookingsByCar,
  createBooking, 
  updateBooking,
  deleteBooking 
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getBookings);
router.get('/car/:carId', protect, getBookingsByCar);
router.post('/', protect, createBooking);
router.put('/:id', protect, updateBooking);
router.delete('/:id', protect, deleteBooking);

module.exports = router;
