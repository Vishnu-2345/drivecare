const Booking = require('../models/Booking');
const Car = require('../models/Car');

// @desc    Get all user's bookings
// @route   GET /api/bookings
// @access  Private
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .sort({ scheduledDate: -1 })
      .populate('car', 'make model year nickname');

    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get bookings for a specific car
// @route   GET /api/bookings/car/:carId
// @access  Private
const getBookingsByCar = async (req, res) => {
  try {
    const { carId } = req.params;

    // Verify the car belongs to the user
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    if (car.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to view these bookings' });
    }

    const bookings = await Booking.find({ car: carId })
      .sort({ scheduledDate: -1 })
      .populate('car', 'make model year nickname');

    res.json(bookings);
  } catch (error) {
    console.error('Get bookings by car error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const { car, serviceType, description, scheduledDate } = req.body;

    // Validation
    if (!car || !serviceType || !scheduledDate) {
      return res.status(400).json({ 
        message: 'Please provide car, service type, and scheduled date' 
      });
    }

    // Verify the car belongs to the user
    const carDoc = await Car.findById(car);
    if (!carDoc) {
      return res.status(404).json({ message: 'Car not found' });
    }

    if (carDoc.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ 
        message: 'Not authorized to create bookings for this car' 
      });
    }

    // Validate scheduled date is in the future
    if (new Date(scheduledDate) < new Date()) {
      return res.status(400).json({ 
        message: 'Scheduled date must be in the future' 
      });
    }

    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      car,
      serviceType,
      description,
      scheduledDate
    });

    // Populate car details
    await booking.populate('car', 'make model year nickname');

    res.status(201).json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private
const updateBooking = async (req, res) => {
  try {
    const { status, serviceType, description, scheduledDate } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this booking' });
    }

    // Update fields if provided
    if (status) booking.status = status;
    if (serviceType) booking.serviceType = serviceType;
    if (description !== undefined) booking.description = description;
    if (scheduledDate) {
      // Validate scheduled date is in the future
      if (new Date(scheduledDate) < new Date()) {
        return res.status(400).json({ 
          message: 'Scheduled date must be in the future' 
        });
      }
      booking.scheduledDate = scheduledDate;
    }

    await booking.save();
    await booking.populate('car', 'make model year nickname');

    res.json(booking);
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this booking' });
    }

    await booking.deleteOne();
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getBookings,
  getBookingsByCar,
  createBooking,
  updateBooking,
  deleteBooking
};
