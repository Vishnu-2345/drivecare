const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vin: {
    type: String,
    required: [true, 'VIN is required'],
    uppercase: true,
    trim: true,
    minlength: [17, 'VIN must be 17 characters'],
    maxlength: [17, 'VIN must be 17 characters']
  },
  make: {
    type: String,
    required: [true, 'Make is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  nickname: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster queries
carSchema.index({ user: 1 });

module.exports = mongoose.model('Car', carSchema);
