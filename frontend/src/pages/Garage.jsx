import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Car, Plus, Trash2, Search, X } from 'lucide-react';

const MAX_CAR_YEAR = new Date().getFullYear() + 1;

const Garage = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [vinInput, setVinInput] = useState('');
  const [vinLoading, setVinLoading] = useState(false);
  const [carData, setCarData] = useState({
    vin: '',
    make: '',
    model: '',
    year: '',
    nickname: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCars = async () => {
    try {
      const response = await api.get('/cars');
      setCars(response.data);
    } catch (error) {
      console.error('Error fetching cars:', error);
      setError('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleVinLookup = async () => {
    const cleanVin = vinInput.trim().toUpperCase();
    if (cleanVin.length < 11 || cleanVin.length > 17) {
      setError('VIN must be between 11 and 17 characters');
      return;
    }

    setVinLoading(true);
    setError('');

    try {
      const response = await api.get(`/cars/decode/${cleanVin}`);
      setCarData({
        vin: response.data.vin,
        make: response.data.make,
        model: response.data.model,
        year: response.data.year,
        nickname: ''
      });
      setSuccess('Vehicle information retrieved successfully!');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to decode VIN');
    } finally {
      setVinLoading(false);
    }
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/cars', {
        ...carData,
        year: parseInt(carData.year, 10)
      });
      setCars([response.data, ...cars]);
      setSuccess('Vehicle added successfully!');
      setTimeout(() => {
        setShowAddModal(false);
        resetForm();
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add vehicle');
    }
  };

  const handleDeleteCar = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) {
      return;
    }

    try {
      await api.delete(`/cars/${carId}`);
      setCars(cars.filter((car) => car._id !== carId));
      setSuccess('Vehicle deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete vehicle');
    }
  };

  const resetForm = () => {
    setVinInput('');
    setCarData({
      vin: '',
      make: '',
      model: '',
      year: '',
      nickname: ''
    });
    setError('');
    setSuccess('');
  };

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
        <h1 className="text-3xl font-bold text-gray-800">My Garage</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Vehicle
        </button>
      </div>

      {/* Success/Error Messages */}
      {(success || error) && !showAddModal && (
        <div className={`mb-4 p-4 rounded-lg ${success ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {success || error}
        </div>
      )}

      {/* Cars Grid */}
      {cars.length === 0 ? (
        <div className="card text-center py-12">
          <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No vehicles yet</h3>
          <p className="text-gray-600 mb-4">Add your first vehicle to get started</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Add Vehicle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <div key={car._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Car className="w-8 h-8 text-blue-600" />
                </div>
                <button
                  onClick={() => handleDeleteCar(car._id)}
                  className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                  title="Delete vehicle"
                >
                  <Trash2 size={20} />
                </button>
              </div>
              
              <div>
                {car.nickname && (
                  <p className="text-sm text-gray-600 mb-1">{car.nickname}</p>
                )}
                <h3 className="text-xl font-bold text-gray-800">
                  {car.year} {car.make}
                </h3>
                <p className="text-gray-600 mb-3">{car.model}</p>
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    VIN: <span className="font-mono">{car.vin}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Add Vehicle</h2>
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

              {/* VIN Lookup Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  VIN Lookup (Auto-fill)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={vinInput}
                    onChange={(e) => setVinInput(e.target.value.toUpperCase())}
                    className="input-field flex-1"
                    placeholder="Enter 11 to 17-character VIN"
                    maxLength={17}
                  />
                  <button
                    onClick={handleVinLookup}
                    disabled={vinLoading || vinInput.trim().length < 11 || vinInput.trim().length > 17}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {vinLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <Search size={20} />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter VIN (11-17 chars) to auto-fill vehicle details
                </p>
              </div>

              {/* Manual Entry Form */}
              <form onSubmit={handleAddCar} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    VIN *
                  </label>
                  <input
                    type="text"
                    value={carData.vin}
                    onChange={(e) => setCarData({ ...carData, vin: e.target.value.toUpperCase() })}
                    className="input-field"
                    placeholder="11 to 17-character VIN"
                    minLength={11}
                    maxLength={17}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Make *
                  </label>
                  <input
                    type="text"
                    value={carData.make}
                    onChange={(e) => setCarData({ ...carData, make: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Toyota"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model *
                  </label>
                  <input
                    type="text"
                    value={carData.model}
                    onChange={(e) => setCarData({ ...carData, model: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Camry"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year *
                  </label>
                  <input
                    type="number"
                    value={carData.year}
                    onChange={(e) => setCarData({ ...carData, year: e.target.value })}
                    className="input-field"
                    placeholder="e.g., 2020"
                    min="1900"
                    max={MAX_CAR_YEAR}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nickname (Optional)
                  </label>
                  <input
                    type="text"
                    value={carData.nickname}
                    onChange={(e) => setCarData({ ...carData, nickname: e.target.value })}
                    className="input-field"
                    placeholder="e.g., My Daily Driver"
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
                    Add Vehicle
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

export default Garage;
