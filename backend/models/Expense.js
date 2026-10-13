const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Fuel', 'Repair', 'Insurance', 'Maintenance', 'Registration', 'Other'],
    default: 'Other'
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
expenseSchema.index({ car: 1, date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
