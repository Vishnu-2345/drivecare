const express = require('express');
const router = express.Router();
const { 
  getExpenses, 
  getAllExpenses, 
  addExpense, 
  deleteExpense,
  getExpenseStats 
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getAllExpenses);
router.get('/:carId', protect, getExpenses);
router.get('/:carId/stats', protect, getExpenseStats);
router.post('/', protect, addExpense);
router.delete('/:id', protect, deleteExpense);

module.exports = router;
