import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Plus, Trash2, X, PieChart as PieIcon, BarChart3, Fuel, Wrench, Shield, FileText, DollarSign, Car, Tag } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = {
  Fuel: '#06b6d4',        // Cyan
  Repair: '#f43f5e',      // Rose
  Insurance: '#a855f7',   // Purple
  Maintenance: '#10b981', // Emerald
  Registration: '#f59e0b',// Amber
  Other: '#94a3b8'        // Slate
};

const CATEGORY_ICONS = {
  Fuel: Fuel,
  Repair: Wrench,
  Insurance: Shield,
  Maintenance: Wrench,
  Registration: FileText,
  Other: DollarSign
};

const CATEGORIES = ['Fuel', 'Repair', 'Insurance', 'Maintenance', 'Registration', 'Other'];

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900/95 border border-slate-700/80 p-3 rounded-xl shadow-2xl backdrop-blur-xl">
        <p className="text-xs font-semibold text-slate-300">{data.name}</p>
        <p className="text-sm font-extrabold text-cyan-400 font-mono mt-0.5">
          ${Number(data.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [cars, setCars] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
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
      if (carsRes.data.length > 0 && !expenseData.car) {
        setExpenseData((prev) => ({ ...prev, car: carsRes.data[0]._id }));
      }
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
      setSuccess('Expense logged successfully!');
      setTimeout(() => {
        setShowAddModal(false);
        resetForm();
      }, 1200);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add expense');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Delete this expense record?')) {
      return;
    }

    try {
      await api.delete(`/expenses/${expenseId}`);
      setExpenses(expenses.filter((expense) => expense._id !== expenseId));
      setSuccess('Expense deleted');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete expense');
    }
  };

  const resetForm = () => {
    setExpenseData({
      car: cars.length > 0 ? cars[0]._id : '',
      category: 'Fuel',
      amount: '',
      description: '',
      date: getTodayDateString()
    });
    setError('');
    setSuccess('');
  };

  // Aggregated Chart Data
  const chartData = useMemo(() => {
    const categoryTotals = {};
    expenses.forEach((expense) => {
      const cat = expense.category || 'Other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + expense.amount;
    });

    return Object.entries(categoryTotals).map(([category, total]) => ({
      name: category,
      value: parseFloat(total.toFixed(2)),
      fill: COLORS[category] || COLORS.Other
    }));
  }, [expenses]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    if (selectedCategory === 'All') return expenses;
    return expenses.filter((e) => e.category === selectedCategory);
  }, [expenses, selectedCategory]);

  const topCategory = useMemo(() => {
    if (chartData.length === 0) return 'None';
    const sorted = [...chartData].sort((a, b) => b.value - a.value);
    return sorted[0].name;
  }, [chartData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-3">
        <div className="relative w-12 h-12">
          <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
          <DollarSign className="w-5 h-5 text-emerald-400 absolute inset-0 m-auto" />
        </div>
        <p className="text-xs text-slate-400 tracking-wider font-mono">LOADING EXPENSES & CHARTS...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Expense Tracker</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {expenses.length} Records
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Data visualization & breakdown of vehicle operational costs
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          disabled={cars.length === 0}
          className="btn-primary flex items-center gap-2 text-sm px-4 py-2.5 shrink-0"
          title={cars.length === 0 ? 'Register a vehicle first' : 'Add expense'}
        >
          <Plus size={18} />
          <span>Log Expense</span>
        </button>
      </div>

      {/* Global Alerts */}
      {(success || error) && !showAddModal && (
        <div className={`p-4 rounded-xl text-sm font-medium border flex items-center gap-2 ${success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-300'}`}>
          <span className="w-2 h-2 rounded-full bg-current shrink-0" />
          <span>{success || error}</span>
        </div>
      )}

      {/* No Cars Notice */}
      {cars.length === 0 && (
        <div className="card text-center py-12">
          <Car className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No vehicles in garage</h3>
          <p className="text-xs text-slate-400 mb-4">Add a vehicle first to start tracking maintenance and fuel costs.</p>
          <Link to="/dashboard/garage" className="btn-primary text-xs px-4 py-2 inline-flex items-center gap-2">
            <Plus size={14} />
            <span>Go to Garage</span>
          </Link>
        </div>
      )}

      {/* Summary KPI Cards & Interactive Charts */}
      {expenses.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Summary Metrics (1 Col) */}
          <div className="space-y-4">
            {/* Total Spend */}
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Total Expenditure</span>
                <span className="badge-emerald">All Vehicles</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
                  ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Across {expenses.length} logged transaction{expenses.length === 1 ? '' : 's'}
              </p>
            </div>

            {/* Quick Metrics Tile */}
            <div className="card">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block mb-3">Key Highlights</span>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Top Cost Driver</span>
                  <span className="text-sm font-bold text-cyan-400 truncate block mt-0.5">{topCategory}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Average / Entry</span>
                  <span className="text-sm font-bold text-slate-200 font-mono block mt-0.5">
                    ${(totalExpenses / (expenses.length || 1)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Chart Container (2 Cols) */}
          <div className="card lg:col-span-2 flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Category Breakdown</h2>
                <p className="text-xs text-slate-400">Visual expenditure analytics</p>
              </div>

              {/* Chart Switcher */}
              <div className="flex items-center p-1 rounded-xl bg-slate-950/80 border border-slate-800">
                <button
                  onClick={() => setChartType('pie')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${chartType === 'pie' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  <PieIcon size={14} />
                  <span>Donut</span>
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${chartType === 'bar' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  <BarChart3 size={14} />
                  <span>Bar</span>
                </button>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'pie' ? (
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={4}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} stroke="#0f172a" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                ) : (
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(val) => `$${val}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-bar-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Category Legend Chips */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-slate-800/60 mt-2">
              {chartData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="font-medium text-slate-300">{item.name}</span>
                  <span className="font-mono text-[11px] text-slate-500">(${item.value.toFixed(0)})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transaction List with Filter Tabs */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Expense Records</h2>
            <p className="text-xs text-slate-400">Full history of operational costs</p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${selectedCategory === 'All' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'}`}
            >
              All ({expenses.length})
            </button>
            {CATEGORIES.map((cat) => {
              const count = expenses.filter((e) => e.category === cat).length;
              if (count === 0 && selectedCategory !== cat) return null;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${selectedCategory === cat ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'}`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 rounded-xl bg-slate-950/40 border border-slate-800/50">
            <Tag className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No expenses in this category</p>
            <p className="text-xs text-slate-500 mt-1">Select another filter or log a new transaction.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredExpenses.map((expense) => {
              const IconComponent = CATEGORY_ICONS[expense.category] || DollarSign;
              const color = COLORS[expense.category] || COLORS.Other;

              return (
                <div
                  key={expense._id}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-950/50 hover:bg-slate-950/80 border border-slate-800/60 hover:border-slate-700/80 transition-all duration-200"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: `${color}15`,
                        borderColor: `${color}30`,
                        color: color
                      }}
                    >
                      <IconComponent size={18} />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-100">{expense.category}</span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-850 text-slate-300 border border-slate-700/60">
                          {expense.car ? `${expense.car.make} ${expense.car.model}` : 'Vehicle'}
                        </span>
                      </div>
                      {expense.description && (
                        <p className="text-xs text-slate-400 truncate mt-0.5">{expense.description}</p>
                      )}
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {new Date(expense.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 pl-3">
                    <span className="text-base font-extrabold font-mono text-white">
                      ${expense.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleDeleteExpense(expense._id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Delete expense"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 sm:p-7">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <DollarSign size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">Log Expense</h2>
                    <p className="text-xs text-slate-400">Record a vehicle operational expenditure</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Alert */}
              {(success || error) && (
                <div className={`mb-5 p-3.5 rounded-xl text-xs font-medium border flex items-center gap-2 ${success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-300'}`}>
                  <span className="w-2 h-2 rounded-full bg-current shrink-0" />
                  <span>{success || error}</span>
                </div>
              )}

              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Select Vehicle *
                  </label>
                  <select
                    value={expenseData.car}
                    onChange={(e) => setExpenseData({ ...expenseData, car: e.target.value })}
                    className="input-field text-xs bg-slate-950 text-slate-100"
                    required
                  >
                    <option value="">Select a vehicle</option>
                    {cars.map((car) => (
                      <option key={car._id} value={car._id}>
                        {car.year} {car.make} {car.model} {car.nickname ? `(${car.nickname})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Picker Chips */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Category *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map((category) => {
                      const IconComponent = CATEGORY_ICONS[category] || DollarSign;
                      const isSelected = expenseData.category === category;
                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setExpenseData({ ...expenseData, category })}
                          className={`flex items-center gap-1.5 p-2 rounded-xl text-xs font-semibold border transition-all ${isSelected ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/20' : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'}`}
                        >
                          <IconComponent size={14} />
                          <span className="truncate">{category}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Amount ($ USD) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={expenseData.amount}
                      onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                      className="input-field text-xs font-mono"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={expenseData.date}
                      onChange={(e) => setExpenseData({ ...expenseData, date: e.target.value })}
                      className="input-field text-xs font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Notes / Description
                  </label>
                  <textarea
                    value={expenseData.description}
                    onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
                    className="input-field text-xs"
                    placeholder="e.g. 15 gallons Chevron Premium 93, oil filter OEM..."
                    rows="3"
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="flex-1 btn-secondary text-xs py-2.5"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary text-xs py-2.5">
                    Save Expense
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
