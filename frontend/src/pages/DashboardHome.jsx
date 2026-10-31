import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { Car, DollarSign, Calendar, TrendingUp, ArrowUpRight, Plus, Fuel, Wrench, Shield, FileText, Sparkles, Clock } from 'lucide-react';

const CATEGORY_ICONS = {
  Fuel: Fuel,
  Repair: Wrench,
  Insurance: Shield,
  Maintenance: Wrench,
  Registration: FileText,
  Other: DollarSign
};

const CATEGORY_COLORS = {
  Fuel: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  Repair: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  Insurance: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  Maintenance: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Registration: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Other: 'text-slate-400 bg-slate-500/10 border-slate-500/20'
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const DashboardHome = () => {
  const { user } = useContext(AuthContext);
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

  const greeting = getGreeting();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-3">
        <div className="relative w-12 h-12">
          <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <Car className="w-5 h-5 text-cyan-400 absolute inset-0 m-auto" />
        </div>
        <p className="text-xs text-slate-400 tracking-wider font-mono">LOADING TELEMETRY...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-950/90 border border-slate-800/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-gradient-to-bl from-cyan-500/15 via-blue-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-3">
              <Sparkles size={13} />
              <span>Fleet Telemetry & Status</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              {greeting}, <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{user?.name || 'Driver'}</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1.5 max-w-xl">
              Track vehicle health, monitor maintenance schedules, and analyze real-time expense breakdowns across your garage.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/dashboard/garage"
              className="btn-primary flex items-center gap-2 text-sm px-4 py-2.5"
            >
              <Plus size={16} />
              <span>Add Vehicle</span>
            </Link>
            <Link
              to="/dashboard/bookings"
              className="btn-secondary flex items-center gap-2 text-sm px-4 py-2.5"
            >
              <Calendar size={16} />
              <span>Book Service</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Holographic Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Vehicles Card */}
        <div className="card card-hover group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-300" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Total Vehicles</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
                  {stats.totalCars}
                </span>
                <span className="text-xs text-cyan-400 font-medium">In Garage</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-inner group-hover:scale-110 group-hover:shadow-glow-cyan transition-all">
              <Car size={22} />
            </div>
          </div>
          <div className="mt-5 pt-3.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
            <span className="text-slate-400">Fleet management</span>
            <Link to="/dashboard/garage" className="text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              <span>View Garage</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="card card-hover group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-300" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Total Expenses</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
                  ${stats.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner group-hover:scale-110 transition-all">
              <DollarSign size={22} />
            </div>
          </div>
          <div className="mt-5 pt-3.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
            <span className="text-slate-400">Categorized tracking</span>
            <Link to="/dashboard/expenses" className="text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              <span>Analytics</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* Upcoming Bookings Card */}
        <div className="card card-hover group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none group-hover:bg-purple-500/20 transition-all duration-300" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Active Appointments</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
                  {stats.upcomingBookings}
                </span>
                <span className="text-xs text-purple-400 font-medium">Upcoming</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-inner group-hover:scale-110 group-hover:shadow-glow-purple transition-all">
              <Calendar size={22} />
            </div>
          </div>
          <div className="mt-5 pt-3.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
            <span className="text-slate-400">Service scheduling</span>
            <Link to="/dashboard/bookings" className="text-purple-400 hover:text-purple-300 font-semibold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              <span>Schedule</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Middle Grid: Recent Activity & Quick Launcher */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Expenses Stream (2 cols) */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <TrendingUp size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Recent Vehicle Activity</h2>
                <p className="text-xs text-slate-400">Latest logged expenses and maintenance costs</p>
              </div>
            </div>
            <Link to="/dashboard/expenses" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1">
              <span>View all</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>
          
          {stats.recentActivity.length === 0 ? (
            <div className="text-center py-12 rounded-xl bg-slate-950/40 border border-slate-800/50">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-500 mx-auto mb-3">
                <DollarSign size={20} />
              </div>
              <p className="text-sm font-semibold text-slate-300">No expenses logged yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Once you log fuel, repairs, or insurance costs, they will appear in this real-time stream.
              </p>
              <Link to="/dashboard/expenses" className="btn-primary mt-4 text-xs px-4 py-2">
                <Plus size={14} className="mr-1.5" />
                Log First Expense
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {stats.recentActivity.map((expense) => {
                const IconComponent = CATEGORY_ICONS[expense.category] || DollarSign;
                const colorClass = CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.Other;

                return (
                  <div
                    key={expense._id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/50 hover:bg-slate-950/80 border border-slate-800/60 hover:border-slate-700/80 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${colorClass}`}>
                        <IconComponent size={16} />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-slate-100 truncate">{expense.category}</p>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                            {expense.car ? `${expense.car.make} ${expense.car.model}` : 'Vehicle'}
                          </span>
                        </div>
                        {expense.description && (
                          <p className="text-xs text-slate-400 truncate mt-0.5">{expense.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-3">
                      <p className="font-mono font-bold text-sm text-white">
                        -${expense.amount.toFixed(2)}
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 justify-end mt-0.5">
                        <Clock size={11} />
                        {new Date(expense.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Launch Control (1 col) */}
        <div className="card flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-cyan-400" size={18} />
              <h2 className="text-base font-bold text-white tracking-tight">Quick Actions</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Instant shortcuts to register cars, log expenses, or schedule appointments.
            </p>

            <div className="space-y-3">
              <Link
                to="/dashboard/garage"
                className="group flex items-center justify-between p-3.5 rounded-xl bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800/60 hover:border-cyan-500/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Car size={18} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-xs text-slate-200 group-hover:text-cyan-300 transition-colors">Add Vehicle</h3>
                    <p className="text-[11px] text-slate-500">VIN auto-fill & specs lookup</p>
                  </div>
                </div>
                <ArrowUpRight size={15} className="text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </Link>

              <Link
                to="/dashboard/expenses"
                className="group flex items-center justify-between p-3.5 rounded-xl bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800/60 hover:border-emerald-500/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <DollarSign size={18} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-xs text-slate-200 group-hover:text-emerald-300 transition-colors">Log Expense</h3>
                    <p className="text-[11px] text-slate-500">Fuel, maintenance, & repairs</p>
                  </div>
                </div>
                <ArrowUpRight size={15} className="text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </Link>

              <Link
                to="/dashboard/bookings"
                className="group flex items-center justify-between p-3.5 rounded-xl bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800/60 hover:border-purple-500/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Calendar size={18} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-xs text-slate-200 group-hover:text-purple-300 transition-colors">Book Service</h3>
                    <p className="text-[11px] text-slate-500">Schedule maintenance appointment</p>
                  </div>
                </div>
                <ArrowUpRight size={15} className="text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </Link>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
            <span>Real-time sync with MongoDB Atlas</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
