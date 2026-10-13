const axios = require('axios');
const Car = require('../models/Car');

// @desc    Decode VIN using NHTSA API
// @route   GET /api/cars/decode/:vin
// @access  Private
const decodeVIN = async (req, res) => {
  try {
    const { vin } = req.params;

    // Validate VIN length
    if (vin.length !== 17) {
      return res.status(400).json({ message: 'VIN must be exactly 17 characters' });
    }

    // Call NHTSA API
    const response = await axios.get(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`
    );

    const results = response.data.Results;

    // Extract relevant data
    const make = results.find(item => item.Variable === 'Make')?.Value || 'Unknown';
    const model = results.find(item => item.Variable === 'Model')?.Value || 'Unknown';
    const year = results.find(item => item.Variable === 'Model Year')?.Value || new Date().getFullYear();

    // Check for errors in VIN
    const errorCode = results.find(item => item.Variable === 'Error Code')?.Value;
    if (errorCode && errorCode !== '0') {
      return res.status(400).json({ message: 'Invalid VIN or unable to decode' });
    }

    res.json({
      vin: vin.toUpperCase(),
      make,
      model,
      year: parseInt(year)
    });
  } catch (error) {
    console.error('VIN decode error:', error);
    res.status(500).json({ message: 'Error decoding VIN', error: error.message });
  }
};

// @desc    Get all user's cars
// @route   GET /api/cars
// @access  Private
const getCars = async (req, res) => {
  try {
    const cars = await Car.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(cars);
  } catch (error) {
    console.error('Get cars error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add new car
// @route   POST /api/cars
// @access  Private
const addCar = async (req, res) => {
  try {
    const { vin, make, model, year, nickname } = req.body;

    // Validation
    if (!vin || !make || !model || !year) {
      return res.status(400).json({ message: 'Please provide VIN, make, model, and year' });
    }

    // Check if car already exists for this user
    const carExists = await Car.findOne({ user: req.user._id, vin: vin.toUpperCase() });
    if (carExists) {
      return res.status(400).json({ message: 'This car is already in your garage' });
    }

    // Create car
    const car = await Car.create({
      user: req.user._id,
      vin: vin.toUpperCase(),
      make,
      model,
      year,
      nickname
    });

    res.status(201).json(car);
  } catch (error) {
    console.error('Add car error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete car
// @route   DELETE /api/cars/:id
// @access  Private
const deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Check if user owns the car
    if (car.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this car' });
    }

    await car.deleteOne();
    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Delete car error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  decodeVIN,
  getCars,
  addCar,
  deleteCar
};
