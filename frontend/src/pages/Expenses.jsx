import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Trash2, X, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = {
  Fuel: '#3b82f6',
  Repair: '#ef4444',
  Insurance: '#8b5cf6',
  Maintenance: '#10b981',
  Registration: '#f59e0b',
  Other: '#6b7280'
};

const CATEGORIES = ['Fuel', 'Repair', 'Insurance', 'Maintenance', 'Registration', 'Other'];

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [chartType, setChartType] = useState('pie'); // 'pie' or 'bar'
  const [expenseData, setExpenseData] = useState({
    car: '',
    category: 'Fuel',
    amount: '',
    description: '',
    date: getTodayDateString()
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      const [expensesRes, carsRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/cars')
      ]);
      setExpenses(expensesRes.data);
      setCars(carsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/expenses', {
        ...expenseData,
        amount: parseFloat(expenseData.amount)
      });
      setExpenses([response.data, ...expenses]);
      setSuccess('Expense added successfully!');
      setTimeout(() => {
        setShowAddModal(false);
        resetForm();
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add expense');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await api.delete(`/expenses/${expenseId}`);
      setExpenses(expenses.filter((expense) => expense._id !== expenseId));
      setSuccess('Expense deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete expense');
    }
  };

  const resetForm = () => {
    setExpenseData({
      car: '',
      category: 'Fuel',
      amount: '',
      description: '',
      date: getTodayDateString()
    });
    setError('');
    setSuccess('');
  };

  // Calculate statistics for charts
  const getChartData = () => {
    const categoryTotals = {};
    
    expenses.forEach((expense) => {
      if (categoryTotals[expense.category]) {
        categoryTotals[expense.category] += expense.amount;
      } else {
        categoryTotals[expense.category] = expense.amount;
      }
    });

    return Object.entries(categoryTotals).map(([category, total]) => ({
      name: category,
      value: parseFloat(total.toFixed(2)),
      fill: COLORS[category]
    }));
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const chartData = getChartData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Expense Tracker</h1>
        <button
          onClick={() => setShowAddModal(true)}
          disabled={cars.length === 0}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          title={cars.length === 0 ? 'Add a vehicle first' : 'Add expense'}
        >
          <Plus size={20} />
          Add Expense
        </button>
      </div>

      {/* Success/Error Messages */}
      {(success || error) && !showAddModal && (
        <div className={`mb-4 p-4 rounded-lg ${success ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {success || error}
        </div>
      )}

      {/* No Cars Message */}
      {cars.length === 0 && (
        <div className="card text-center py-12 mb-6">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No vehicles in garage</h3>
          <p className="text-gray-600">Add a vehicle first to start tracking expenses</p>
        </div>
      )}

      {/* Statistics Overview */}
      {expenses.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Total Expenses Card */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="text-blue-600" />
              Total Expenses
            </h2>
            <p className="text-4xl font-bold text-gray-800 mb-2">
              ${totalExpenses.toFixed(2)}
            </p>
            <p className="text-gray-600">{expenses.length} transactions</p>
          </div>

          {/* Chart Card */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Expenses by Category</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setChartType('pie')}
                  className={`px-3 py-1 rounded-lg text-sm ${chartType === 'pie' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Pie
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-3 py-1 rounded-lg text-sm ${chartType === 'bar' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Bar
                </button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={250}>
              {chartType === 'pie' ? (
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.name}: $${entry.value}`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                </PieChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Expenses List */}
      {expenses.length === 0 ? (
        <div className="card text-center py-12">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No expenses yet</h3>
          <p className="text-gray-600 mb-4">Start tracking your vehicle expenses</p>
          {cars.length > 0 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Add Expense
            </button>
          )}
        </div>
      ) : (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">All Expenses</h2>
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div
                key={expense._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[expense.category] }}
                    ></span>
                    <span className="font-semibold text-gray-800">{expense.category}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-600">
                      {expense.car ? `${expense.car.make} ${expense.car.model}` : 'Vehicle'}
                    </span>
                  </div>
                  {expense.description && (
                    <p className="text-sm text-gray-600 ml-6">{expense.description}</p>
                  )}
                  <p className="text-sm text-gray-500 ml-6">
                    {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold text-gray-800">
                    ${expense.amount.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleDeleteExpense(expense._id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                    title="Delete expense"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Add Expense</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={24} />
                </button>
              </div>

              {(success || error) && (
                <div className={`mb-4 p-4 rounded-lg ${success ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                  {success || error}
                </div>
              )}

              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle *
                  </label>
                  <select
                    value={expenseData.car}
                    onChange={(e) => setExpenseData({ ...expenseData, car: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Select a vehicle</option>
                    {cars.map((car) => (
                      <option key={car._id} value={car._id}>
                        {car.year} {car.make} {car.model}
                        {car.nickname && ` (${car.nickname})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={expenseData.category}
                    onChange={(e) => setExpenseData({ ...expenseData, category: e.target.value })}
                    className="input-field"
                    required
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={expenseData.amount}
                    onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                    className="input-field"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={expenseData.date}
                    onChange={(e) => setExpenseData({ ...expenseData, date: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={expenseData.description}
                    onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
                    className="input-field"
                    placeholder="Add notes about this expense..."
                    rows="3"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    Add Expense
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
