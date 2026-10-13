const express = require('express');
const router = express.Router();
const { decodeVIN, getCars, addCar, deleteCar } = require('../controllers/carController');
const { protect } = require('../middleware/auth');

router.get('/decode/:vin', protect, decodeVIN);
router.get('/', protect, getCars);
router.post('/', protect, addCar);
router.delete('/:id', protect, deleteCar);

module.exports = router;
