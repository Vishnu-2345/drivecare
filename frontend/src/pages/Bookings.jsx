import { useState, useEffect, useMemo } from 'react';
import api from '../utils/api';
import { Plus, Trash2, X, Calendar as CalendarIcon, Clock } from 'lucide-react';

const SERVICE_TYPES = ['Oil Change', 'Tire Rotation', 'Brake Service', 'Engine Repair', 'Inspection', 'Other'];
const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Completed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800'
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
    scheduledTime: ''
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

  const handleAddBooking = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!bookingData.scheduledDate || !bookingData.scheduledTime) {
      setError('Please provide both date and time for the appointment');
      return;
    }

    // Combine date and time
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
      setSuccess('Booking created successfully!');
      setTimeout(() => {
        setShowAddModal(false);
        resetForm();
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create booking');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) {
      return;
    }

    try {
      await api.delete(`/bookings/${bookingId}`);
      setBookings(bookings.filter((booking) => booking._id !== bookingId));
      setSuccess('Booking deleted successfully');
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
      car: '',
      serviceType: 'Oil Change',
      description: '',
      scheduledDate: '',
      scheduledTime: ''
    });
    setError('');
    setSuccess('');
  };

  // Reference timestamp initialized on mount
  const [mountTime] = useState(() => Date.now());

  // Separate bookings into upcoming and past
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Service Bookings</h1>
        <button
          onClick={() => setShowAddModal(true)}
          disabled={cars.length === 0}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          title={cars.length === 0 ? 'Add a vehicle first' : 'Create booking'}
        >
          <Plus size={20} />
          New Booking
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
          <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No vehicles in garage</h3>
          <p className="text-gray-600">Add a vehicle first to start booking services</p>
        </div>
      )}

      {/* Upcoming Bookings */}
      {upcomingBookings.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CalendarIcon className="text-blue-600" />
            Upcoming Appointments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingBookings.map((booking) => (
              <div key={booking._id} className="card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <CalendarIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{booking.serviceType}</h3>
                      <p className="text-sm text-gray-600">
                        {booking.car ? `${booking.car.year} ${booking.car.make} ${booking.car.model}` : 'Vehicle'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[booking.status]}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CalendarIcon size={16} className="text-gray-500" />
                    <span>{new Date(booking.scheduledDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock size={16} className="text-gray-500" />
                    <span>{new Date(booking.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {booking.description && (
                    <p className="text-sm text-gray-600 pt-2 border-t border-gray-200">
                      {booking.description}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  {booking.status === 'Pending' && (
                    <button
                      onClick={() => handleUpdateStatus(booking._id, 'Confirmed')}
                      className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                    >
                      Confirm
                    </button>
                  )}
                  {booking.status === 'Confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus(booking._id, 'Completed')}
                      className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                    >
                      Complete
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteBooking(booking._id)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Bookings */}
      {bookings.length === 0 && cars.length > 0 ? (
        <div className="card text-center py-12">
          <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No bookings yet</h3>
          <p className="text-gray-600 mb-4">Schedule your first service appointment</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus size={20} />
            New Booking
          </button>
        </div>
      ) : pastBookings.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Past Appointments</h2>
          <div className="card">
            <div className="space-y-3">
              {pastBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-gray-800">{booking.serviceType}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[booking.status]}`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {booking.car ? `${booking.car.make} ${booking.car.model}` : 'Vehicle'} • {new Date(booking.scheduledDate).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteBooking(booking._id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                    title="Delete booking"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Booking Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">New Booking</h2>
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

              <form onSubmit={handleAddBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle *
                  </label>
                  <select
                    value={bookingData.car}
                    onChange={(e) => setBookingData({ ...bookingData, car: e.target.value })}
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
                    Service Type *
                  </label>
                  <select
                    value={bookingData.serviceType}
                    onChange={(e) => setBookingData({ ...bookingData, serviceType: e.target.value })}
                    className="input-field"
                    required
                  >
                    {SERVICE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={bookingData.scheduledDate}
                    onChange={(e) => setBookingData({ ...bookingData, scheduledDate: e.target.value })}
                    className="input-field"
                    min={getMinDateTime()}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={bookingData.scheduledTime}
                    onChange={(e) => setBookingData({ ...bookingData, scheduledTime: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={bookingData.description}
                    onChange={(e) => setBookingData({ ...bookingData, description: e.target.value })}
                    className="input-field"
                    placeholder="Add any specific notes or requirements..."
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
                    Create Booking
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
