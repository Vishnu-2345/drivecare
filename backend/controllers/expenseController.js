const Expense = require('../models/Expense');
const Car = require('../models/Car');

// @desc    Get expenses for a specific car
// @route   GET /api/expenses/:carId
// @access  Private
const getExpenses = async (req, res) => {
  try {
    const { carId } = req.params;

    // Verify the car belongs to the user
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    if (car.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to view these expenses' });
    }

    // Get all expenses for the car
    const expenses = await Expense.find({ car: carId })
      .sort({ date: -1 })
      .populate('car', 'make model year');

    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all expenses for all user's cars
// @route   GET /api/expenses
// @access  Private
const getAllExpenses = async (req, res) => {
  try {
    // Get all user's cars
    const cars = await Car.find({ user: req.user._id });
    const carIds = cars.map(car => car._id);

    // Get all expenses for user's cars
    const expenses = await Expense.find({ car: { $in: carIds } })
      .sort({ date: -1 })
      .populate('car', 'make model year nickname');

    res.json(expenses);
  } catch (error) {
    console.error('Get all expenses error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add new expense
// @route   POST /api/expenses
// @access  Private
const addExpense = async (req, res) => {
  try {
    const { car, category, amount, description, date } = req.body;

    // Validation
    if (!car || !category || !amount) {
      return res.status(400).json({ message: 'Please provide car, category, and amount' });
    }

    // Verify the car belongs to the user
    const carDoc = await Car.findById(car);
    if (!carDoc) {
      return res.status(404).json({ message: 'Car not found' });
    }

    if (carDoc.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to add expenses to this car' });
    }

    // Create expense
    const expense = await Expense.create({
      car,
      category,
      amount,
      description,
      date: date || Date.now()
    });

    // Populate car details
    await expense.populate('car', 'make model year');

    res.status(201).json(expense);
  } catch (error) {
    console.error('Add expense error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate('car');

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Check if user owns the car (and therefore the expense)
    if (expense.car.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this expense' });
    }

    await expense.deleteOne();
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get expense statistics for a car
// @route   GET /api/expenses/:carId/stats
// @access  Private
const getExpenseStats = async (req, res) => {
  try {
    const { carId } = req.params;

    // Verify the car belongs to the user
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    if (car.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to view these stats' });
    }

    // Aggregate expenses by category
    const stats = await Expense.aggregate([
      { $match: { car: car._id } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Calculate total
    const totalExpenses = stats.reduce((sum, stat) => sum + stat.total, 0);

    res.json({
      stats,
      total: totalExpenses
    });
  } catch (error) {
    console.error('Get expense stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getExpenses,
  getAllExpenses,
  addExpense,
  deleteExpense,
  getExpenseStats
};
