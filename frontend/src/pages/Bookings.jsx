import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Plus, Trash2, X, Calendar as CalendarIcon, Clock, CheckCircle2, Wrench, Car } from 'lucide-react';

const SERVICE_TYPES = [
  'Oil Change',
  'Tire Rotation',
  'Brake Service',
  'Engine Repair',
  'Inspection',
  'Other'
];

const STATUS_CONFIG = {
  Pending: {
    label: 'Pending',
    pill: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    dot: 'bg-amber-400'
  },
  Confirmed: {
    label: 'Confirmed',
    pill: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    dot: 'bg-cyan-400 animate-pulse'
  },
  Completed: {
    label: 'Completed',
    pill: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    dot: 'bg-emerald-400'
  },
  Cancelled: {
    label: 'Cancelled',
    pill: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
    dot: 'bg-rose-400'
  }
};

const getMinDateTime = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    car: '',
    serviceType: 'Oil Change',
    description: '',
    scheduledDate: '',
    scheduledTime: '10:00'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      const [bookingsRes, carsRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/cars')
      ]);
      setBookings(bookingsRes.data);
      setCars(carsRes.data);
      if (carsRes.data.length > 0 && !bookingData.car) {
        setBookingData((prev) => ({ ...prev, car: carsRes.data[0]._id }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddBooking = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!bookingData.scheduledDate || !bookingData.scheduledTime) {
      setError('Please provide both date and time for the appointment');
      return;
    }

    const scheduledDate = new Date(`${bookingData.scheduledDate}T${bookingData.scheduledTime}`);
    if (isNaN(scheduledDate.getTime())) {
      setError('Please provide a valid date and time');
      return;
    }

    try {
      const response = await api.post('/bookings', {
        car: bookingData.car,
        serviceType: bookingData.serviceType,
        description: bookingData.description,
        scheduledDate: scheduledDate.toISOString()
      });
      setBookings([response.data, ...bookings]);
      setSuccess('Appointment scheduled successfully!');
      setTimeout(() => {
        setShowAddModal(false);
        resetForm();
      }, 1200);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create booking');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Delete this service appointment?')) {
      return;
    }

    try {
      await api.delete(`/bookings/${bookingId}`);
      setBookings(bookings.filter((booking) => booking._id !== bookingId));
      setSuccess('Booking deleted');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete booking');
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const response = await api.put(`/bookings/${bookingId}`, { status: newStatus });
      setBookings(bookings.map((booking) => 
        booking._id === bookingId ? response.data : booking
      ));
      setSuccess(`Booking marked as ${newStatus}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update booking');
    }
  };

  const resetForm = () => {
    setBookingData({
      car: cars.length > 0 ? cars[0]._id : '',
      serviceType: 'Oil Change',
      description: '',
      scheduledDate: '',
      scheduledTime: '10:00'
    });
    setError('');
    setSuccess('');
  };

  const [mountTime] = useState(() => Date.now());

  const { upcomingBookings, pastBookings } = useMemo(() => {
    return {
      upcomingBookings: bookings.filter(
        (booking) =>
          new Date(booking.scheduledDate).getTime() >= mountTime &&
          booking.status !== 'Completed' &&
          booking.status !== 'Cancelled'
      ),
      pastBookings: bookings.filter(
        (booking) =>
          new Date(booking.scheduledDate).getTime() < mountTime ||
          booking.status === 'Completed' ||
          booking.status === 'Cancelled'
      )
    };
  }, [bookings, mountTime]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-3">
        <div className="relative w-12 h-12">
          <div className="w-12 h-12 rounded-full border-2 border-purple-500/20 border-t-purple-400 animate-spin" />
          <CalendarIcon className="w-5 h-5 text-purple-400 absolute inset-0 m-auto" />
        </div>
        <p className="text-xs text-slate-400 tracking-wider font-mono">LOADING SCHEDULE & APPOINTMENTS...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Service Scheduler</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {upcomingBookings.length} Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Automated maintenance queue, inspections & shop bookings
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          disabled={cars.length === 0}
          className="btn-primary flex items-center gap-2 text-sm px-4 py-2.5 shrink-0"
          title={cars.length === 0 ? 'Register a vehicle first' : 'Book new appointment'}
        >
          <Plus size={18} />
          <span>New Appointment</span>
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
          <p className="text-xs text-slate-400 mb-4">Add a vehicle to your garage before scheduling service appointments.</p>
          <Link to="/dashboard/garage" className="btn-primary text-xs px-4 py-2 inline-flex items-center gap-2">
            <Plus size={14} />
            <span>Go to Garage</span>
          </Link>
        </div>
      )}

      {/* Upcoming Appointments Section */}
      {upcomingBookings.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-base font-bold text-white tracking-tight">Active Appointments</h2>
            <span className="text-xs text-slate-500 font-mono">({upcomingBookings.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcomingBookings.map((booking) => {
              const statusCfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.Pending;
              const dateObj = new Date(booking.scheduledDate);

              return (
                <div
                  key={booking._id}
                  className="card card-hover group flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Service & Status */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                          <Wrench size={18} />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white tracking-tight group-hover:text-purple-300 transition-colors">
                            {booking.serviceType}
                          </h3>
                          <p className="text-xs text-slate-400">
                            {booking.car ? `${booking.car.year} ${booking.car.make} ${booking.car.model}` : 'Vehicle'}
                          </p>
                        </div>
                      </div>

                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusCfg.pill}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                        <span>{statusCfg.label}</span>
                      </span>
                    </div>

                    {/* Date and Time Chips */}
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 mb-4">
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <CalendarIcon size={14} className="text-cyan-400" />
                        <span className="font-medium">
                          {dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                        <Clock size={14} className="text-purple-400" />
                        <span>{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      {booking.description && (
                        <p className="text-xs text-slate-400 pt-2 border-t border-slate-800/80 leading-relaxed">
                          "{booking.description}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-800/60 flex items-center gap-2">
                    {booking.status === 'Pending' && (
                      <button
                        onClick={() => handleUpdateStatus(booking._id, 'Confirmed')}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 size={13} />
                        <span>Confirm</span>
                      </button>
                    )}
                    {booking.status === 'Confirmed' && (
                      <button
                        onClick={() => handleUpdateStatus(booking._id, 'Completed')}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 size={13} />
                        <span>Mark Completed</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteBooking(booking._id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Cancel/Delete booking"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {bookings.length === 0 && cars.length > 0 && (
        <div className="card text-center py-16">
          <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto mb-4 shadow-lg shadow-purple-500/10">
            <CalendarIcon size={32} />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No appointments scheduled</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
            Keep your fleet running smoothly by scheduling oil changes, tire rotations, or brake inspections.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary inline-flex items-center gap-2 text-sm px-5 py-2.5"
          >
            <Plus size={18} />
            <span>Schedule First Service</span>
          </button>
        </div>
      )}

      {/* Past / Completed History */}
      {pastBookings.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Past Service History</h2>
              <p className="text-xs text-slate-400">Completed and historical maintenance records</p>
            </div>
            <span className="text-xs font-mono text-slate-500">{pastBookings.length} Logged</span>
          </div>

          <div className="space-y-2.5">
            {pastBookings.map((booking) => {
              const statusCfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.Pending;
              return (
                <div
                  key={booking._id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/50 hover:bg-slate-950/80 border border-slate-800/60 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 shrink-0">
                      <Wrench size={16} />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-200">{booking.serviceType}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusCfg.pill}`}>
                          <span className={`w-1 h-1 rounded-full ${statusCfg.dot}`} />
                          <span>{booking.status}</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {booking.car ? `${booking.car.make} ${booking.car.model}` : 'Vehicle'} • {new Date(booking.scheduledDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteBooking(booking._id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
                    title="Delete record"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* New Booking Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 sm:p-7">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                    <CalendarIcon size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">Schedule Service</h2>
                    <p className="text-xs text-slate-400">Book maintenance with appointment time</p>
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

              <form onSubmit={handleAddBooking} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Vehicle *
                  </label>
                  <select
                    value={bookingData.car}
                    onChange={(e) => setBookingData({ ...bookingData, car: e.target.value })}
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

                {/* Service Type Selection Chips */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Service Type *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SERVICE_TYPES.map((type) => {
                      const isSelected = bookingData.serviceType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setBookingData({ ...bookingData, serviceType: type })}
                          className={`p-2 rounded-xl text-xs font-semibold border transition-all text-center truncate ${isSelected ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-sm shadow-purple-500/20' : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'}`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={bookingData.scheduledDate}
                      onChange={(e) => setBookingData({ ...bookingData, scheduledDate: e.target.value })}
                      className="input-field text-xs font-mono"
                      min={getMinDateTime()}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Time *
                    </label>
                    <input
                      type="time"
                      value={bookingData.scheduledTime}
                      onChange={(e) => setBookingData({ ...bookingData, scheduledTime: e.target.value })}
                      className="input-field text-xs font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Specific Requirements / Notes
                  </label>
                  <textarea
                    value={bookingData.description}
                    onChange={(e) => setBookingData({ ...bookingData, description: e.target.value })}
                    className="input-field text-xs"
                    placeholder="e.g. Synthetic 5W-30, tire balance and rotation, brake squeak check..."
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
                    Create Appointment
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

export default Bookings;
