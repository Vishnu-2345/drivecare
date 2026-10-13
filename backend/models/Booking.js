const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  serviceType: {
    type: String,
    required: [true, 'Service type is required'],
    enum: ['Oil Change', 'Tire Rotation', 'Brake Service', 'Engine Repair', 'Inspection', 'Other'],
    default: 'Other'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

// Index for faster queries
bookingSchema.index({ user: 1, scheduledDate: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
