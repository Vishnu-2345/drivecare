import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Car, DollarSign, Calendar, TrendingUp } from 'lucide-react';

const DashboardHome = () => {
  const [stats, setStats] = useState({
    totalCars: 0,
    totalExpenses: 0,
    upcomingBookings: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [carsRes, expensesRes, bookingsRes] = await Promise.all([
        api.get('/cars'),
        api.get('/expenses'),
        api.get('/bookings')
      ]);

      const totalExpenses = expensesRes.data.reduce(
        (sum, expense) => sum + (expense.amount || 0),
        0
      );

      const now = new Date();
      const upcomingBookings = bookingsRes.data.filter(
        (booking) =>
          new Date(booking.scheduledDate) >= now &&
          (booking.status === 'Pending' || booking.status === 'Confirmed')
      ).length;

      setStats({
        totalCars: carsRes.data.length,
        totalExpenses,
        upcomingBookings,
        recentActivity: expensesRes.data.slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Vehicles</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalCars}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Car className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <Link to="/dashboard/garage" className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-4 inline-block">
            View Garage →
          </Link>
        </div>

        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Expenses</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                ${stats.totalExpenses.toFixed(2)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <Link to="/dashboard/expenses" className="text-green-600 hover:text-green-700 text-sm font-medium mt-4 inline-block">
            View Expenses →
          </Link>
        </div>

        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Upcoming Bookings</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.upcomingBookings}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <Link to="/dashboard/bookings" className="text-purple-600 hover:text-purple-700 text-sm font-medium mt-4 inline-block">
            View Bookings →
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <TrendingUp size={24} className="text-blue-600" />
            Recent Expenses
          </h2>
        </div>
        
        {stats.recentActivity.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No recent expenses</p>
            <Link to="/dashboard/expenses" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
              Add your first expense →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recentActivity.map((expense) => (
              <div
                key={expense._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-800">{expense.category}</p>
                  <p className="text-sm text-gray-600">
                    {expense.car ? `${expense.car.make} ${expense.car.model}` : 'Vehicle'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">${expense.amount.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Link to="/dashboard/garage" className="card hover:shadow-lg transition-shadow text-center cursor-pointer">
          <Car className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-800">Add Vehicle</h3>
          <p className="text-sm text-gray-600 mt-1">Register a new vehicle</p>
        </Link>

        <Link to="/dashboard/expenses" className="card hover:shadow-lg transition-shadow text-center cursor-pointer">
          <DollarSign className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-800">Log Expense</h3>
          <p className="text-sm text-gray-600 mt-1">Track vehicle expenses</p>
        </Link>

        <Link to="/dashboard/bookings" className="card hover:shadow-lg transition-shadow text-center cursor-pointer">
          <Calendar className="w-12 h-12 text-purple-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-800">Book Service</h3>
          <p className="text-sm text-gray-600 mt-1">Schedule maintenance</p>
        </Link>
      </div>
    </div>
  );
};

export default DashboardHome;
