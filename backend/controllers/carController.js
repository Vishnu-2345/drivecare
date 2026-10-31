const axios = require('axios');
const Car = require('../models/Car');
const Expense = require('../models/Expense');
const Booking = require('../models/Booking');

// @desc    Decode VIN using NHTSA API
// @route   GET /api/cars/decode/:vin
// @access  Private
const decodeVIN = async (req, res) => {
  try {
    const { vin } = req.params;
    const cleanVin = (vin || '').trim();

    // Validate VIN length (NHTSA supports 11 to 17 character VINs)
    if (cleanVin.length < 11 || cleanVin.length > 17) {
      return res.status(400).json({ message: 'VIN must be between 11 and 17 characters' });
    }

    // Call NHTSA API
    const response = await axios.get(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${encodeURIComponent(cleanVin)}?format=json`
    );

    const results = response.data?.Results || [];

    // Extract relevant data
    const make = results.find(item => item.Variable === 'Make')?.Value;
    const model = results.find(item => item.Variable === 'Model')?.Value;
    const yearValue = results.find(item => item.Variable === 'Model Year')?.Value;
    const year = yearValue ? parseInt(yearValue, 10) : new Date().getFullYear();

    // Check if at least make was decoded
    if (!make || make.trim() === '') {
      return res.status(400).json({ message: 'Invalid VIN or unable to decode vehicle details' });
    }

    const series = results.find(item => item.Variable === 'Series')?.Value;
    const resolvedModel = model && model.trim() !== '' ? model.trim() : (series && series.trim() !== '' ? series.trim() : '');

    res.json({
      vin: cleanVin.toUpperCase(),
      make: make.trim(),
      model: resolvedModel,
      year: isNaN(year) ? new Date().getFullYear() : year
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

    const cleanVin = vin.trim().toUpperCase();
    if (cleanVin.length < 11 || cleanVin.length > 17) {
      return res.status(400).json({ message: 'VIN must be between 11 and 17 characters' });
    }

    const parsedYear = parseInt(year, 10);
    const maxYear = new Date().getFullYear() + 1;
    if (isNaN(parsedYear) || parsedYear < 1900 || parsedYear > maxYear) {
      return res.status(400).json({ message: `Year must be between 1900 and ${maxYear}` });
    }

    // Check if car already exists for this user
    const carExists = await Car.findOne({ user: req.user._id, vin: cleanVin });
    if (carExists) {
      return res.status(400).json({ message: 'This car is already in your garage' });
    }

    // Create car
    const car = await Car.create({
      user: req.user._id,
      vin: cleanVin,
      make: make.trim(),
      model: model.trim(),
      year: parsedYear,
      nickname: nickname ? nickname.trim() : undefined
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

    // Cascade delete associated expenses and bookings
    await Expense.deleteMany({ car: car._id });
    await Booking.deleteMany({ car: car._id });

    await car.deleteOne();
    res.json({ message: 'Car and associated records deleted successfully' });
  } catch (error) {
    console.error('Delete car error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get safety recalls for a specific car
// @route   GET /api/cars/:id/recalls
// @access  Private
const getCarRecalls = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    if (car.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to view recalls for this car' });
    }

    const { make, model, year } = car;
    const response = await axios.get(
      `https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`,
      { timeout: 8000 }
    );

    const count = response.data?.Count || 0;
    const results = response.data?.results || [];

    res.json({
      carId: car._id,
      make,
      model,
      year,
      count,
      recalls: results
    });
  } catch (error) {
    console.error('Fetch recalls error:', error.message);
    res.status(500).json({ message: 'Error retrieving recalls from NHTSA', count: 0, recalls: [] });
  }
};

// @desc    Check safety recalls by make, model, year
// @route   GET /api/cars/recalls/check
// @access  Private
const checkRecallsBySpecs = async (req, res) => {
  try {
    const { make, model, year } = req.query;
    if (!make || !model || !year) {
      return res.status(400).json({ message: 'Please provide make, model, and year' });
    }

    const response = await axios.get(
      `https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`,
      { timeout: 8000 }
    );

    res.json({
      count: response.data?.Count || 0,
      recalls: response.data?.results || []
    });
  } catch (error) {
    console.error('Check recalls error:', error.message);
    res.status(500).json({ count: 0, recalls: [] });
  }
};

module.exports = {
  decodeVIN,
  getCars,
  addCar,
  deleteCar,
  getCarRecalls,
  checkRecallsBySpecs
};
