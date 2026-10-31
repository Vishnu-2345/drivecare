import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Car, Plus, Trash2, Search, X, Copy, Check, DollarSign, Calendar, Cpu } from 'lucide-react';

const MAX_CAR_YEAR = new Date().getFullYear() + 1;

const SAMPLE_VINS = [
  { label: 'BMW X3', vin: '5UXWX7C5*BA' },
  { label: 'Honda Accord', vin: '1HGCR2F83HA000000' },
  { label: 'Honda Civic', vin: '1HGBH41JXMN109186' }
];

const Garage = () => {
  const [cars, setCars] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [vinInput, setVinInput] = useState('');
  const [vinLoading, setVinLoading] = useState(false);
  const [copiedVin, setCopiedVin] = useState(null);
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

  const handleVinLookup = async (vinToLookup) => {
    const rawVin = typeof vinToLookup === 'string' ? vinToLookup : vinInput;
    const cleanVin = (rawVin || '').trim().toUpperCase();
    if (cleanVin.length < 11 || cleanVin.length > 17) {
      setError('VIN must be between 11 and 17 characters');
      return;
    }

    setVinLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.get(`/cars/decode/${cleanVin}`);
      setCarData({
        vin: response.data.vin,
        make: response.data.make,
        model: response.data.model,
        year: response.data.year,
        nickname: ''
      });
      setSuccess(`Decoded successfully: ${response.data.year} ${response.data.make} ${response.data.model}`);
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
      setSuccess('Vehicle registered to garage successfully!');
      setTimeout(() => {
        setShowAddModal(false);
        resetForm();
      }, 1200);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add vehicle');
    }
  };

  const handleDeleteCar = async (carId) => {
    if (!window.confirm('Delete this vehicle? All related expenses and bookings will also be deleted.')) {
      return;
    }

    try {
      await api.delete(`/cars/${carId}`);
      setCars(cars.filter((car) => car._id !== carId));
      setSuccess('Vehicle and associated records deleted');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete vehicle');
    }
  };

  const handleCopyVin = (vin) => {
    navigator.clipboard.writeText(vin);
    setCopiedVin(vin);
    setTimeout(() => setCopiedVin(null), 2000);
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

  const filteredCars = cars.filter((car) => {
    const q = searchQuery.toLowerCase();
    return (
      car.make.toLowerCase().includes(q) ||
      car.model.toLowerCase().includes(q) ||
      (car.nickname && car.nickname.toLowerCase().includes(q)) ||
      car.vin.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-3">
        <div className="relative w-12 h-12">
          <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <Car className="w-5 h-5 text-cyan-400 absolute inset-0 m-auto" />
        </div>
        <p className="text-xs text-slate-400 tracking-wider font-mono">LOADING GARAGE FLEET...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header with Search and CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">My Garage</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {cars.length} {cars.length === 1 ? 'Vehicle' : 'Vehicles'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Registered vehicle inventory with NHTSA VIN telemetry
          </p>
        </div>

        <div className="flex items-center gap-3">
          {cars.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search make, model, VIN..."
                className="input-field pl-9 py-2 text-xs w-48 sm:w-64"
              />
            </div>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2 text-sm px-4 py-2.5 shrink-0"
          >
            <Plus size={18} />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {(success || error) && !showAddModal && (
        <div className={`p-4 rounded-xl text-sm font-medium border flex items-center gap-2 ${success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-300'}`}>
          <span className="w-2 h-2 rounded-full bg-current shrink-0" />
          <span>{success || error}</span>
        </div>
      )}

      {/* Cars Grid */}
      {filteredCars.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto mb-4 shadow-lg shadow-cyan-500/10">
            <Car size={32} />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            {cars.length === 0 ? 'No vehicles in garage' : 'No matching vehicles found'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
            {cars.length === 0
              ? 'Add your first vehicle using our instant VIN auto-fill decoder to start tracking maintenance and expenses.'
              : 'Try adjusting your search query to find the vehicle you are looking for.'}
          </p>
          {cars.length === 0 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary inline-flex items-center gap-2 text-sm px-5 py-2.5"
            >
              <Plus size={18} />
              <span>Add Your First Vehicle</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCars.map((car) => (
            <div
              key={car._id}
              className="card card-hover group flex flex-col justify-between"
            >
              <div>
                {/* Top Badge Row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {car.year}
                    </span>
                    {car.nickname && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60 truncate max-w-[140px]">
                        ★ {car.nickname}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteCar(car._id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Delete vehicle"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Make and Model */}
                <h3 className="text-xl font-extrabold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                  {car.make}
                </h3>
                <p className="text-sm font-medium text-slate-400 mb-4">{car.model}</p>

                {/* Monospace VIN Container */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                        VIN IDENTIFIER
                      </span>
                      <span className="font-mono text-xs text-slate-300 select-all tracking-wider">
                        {car.vin}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyVin(car.vin)}
                      className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
                      title="Copy VIN"
                    >
                      {copiedVin === car.vin ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Actions */}
              <div className="pt-3 border-t border-slate-800/60 flex items-center gap-2">
                <Link
                  to="/dashboard/expenses"
                  className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-700/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <DollarSign size={13} />
                  <span>Expenses</span>
                </Link>
                <Link
                  to="/dashboard/bookings"
                  className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-purple-400 border border-slate-700/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Calendar size={13} />
                  <span>Book</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 sm:p-7">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Car size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">Register Vehicle</h2>
                    <p className="text-xs text-slate-400">Add via NHTSA VIN auto-fill or manual entry</p>
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

              {/* Modal Alert */}
              {(success || error) && (
                <div className={`mb-5 p-3.5 rounded-xl text-xs font-medium border flex items-center gap-2 ${success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-300'}`}>
                  <span className="w-2 h-2 rounded-full bg-current shrink-0" />
                  <span>{success || error}</span>
                </div>
              )}

              {/* VIN Lookup Scanner Section */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/20 via-slate-950/40 to-blue-950/20 border border-cyan-500/20 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                    <Cpu size={14} />
                    <span>VIN Auto-Fill (NHTSA VPIC)</span>
                  </label>
                  <span className="text-[10px] text-cyan-400 font-mono">11-17 Chars</span>
                </div>
                
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={vinInput}
                    onChange={(e) => setVinInput(e.target.value.toUpperCase())}
                    className="input-field flex-1 font-mono text-xs tracking-wider"
                    placeholder="Enter VIN (e.g. 5UXWX7C5*BA)"
                    maxLength={17}
                  />
                  <button
                    onClick={() => handleVinLookup()}
                    disabled={vinLoading || vinInput.trim().length < 11 || vinInput.trim().length > 17}
                    className="btn-primary px-4 py-2 shrink-0 text-xs gap-1.5"
                  >
                    {vinLoading ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    ) : (
                      <>
                        <Search size={15} />
                        <span>Decode</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Sample VIN Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-500">Quick Test:</span>
                  {SAMPLE_VINS.map((preset) => (
                    <button
                      key={preset.vin}
                      type="button"
                      onClick={() => {
                        setVinInput(preset.vin);
                        handleVinLookup(preset.vin);
                      }}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700/60 hover:border-cyan-500/30 transition-all"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vehicle Specs Form */}
              <form onSubmit={handleAddCar} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    VIN Identifier *
                  </label>
                  <input
                    type="text"
                    value={carData.vin}
                    onChange={(e) => setCarData({ ...carData, vin: e.target.value.toUpperCase() })}
                    className="input-field font-mono text-xs uppercase"
                    placeholder="11 to 17-character VIN"
                    minLength={11}
                    maxLength={17}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Make *
                    </label>
                    <input
                      type="text"
                      value={carData.make}
                      onChange={(e) => setCarData({ ...carData, make: e.target.value })}
                      className="input-field text-xs"
                      placeholder="e.g. BMW, Honda"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Model *
                    </label>
                    <input
                      type="text"
                      value={carData.model}
                      onChange={(e) => setCarData({ ...carData, model: e.target.value })}
                      className="input-field text-xs"
                      placeholder="e.g. X3, Civic"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Year *
                    </label>
                    <input
                      type="number"
                      value={carData.year}
                      onChange={(e) => setCarData({ ...carData, year: e.target.value })}
                      className="input-field text-xs font-mono"
                      placeholder="e.g. 2021"
                      min="1900"
                      max={MAX_CAR_YEAR}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Nickname (Optional)
                    </label>
                    <input
                      type="text"
                      value={carData.nickname}
                      onChange={(e) => setCarData({ ...carData, nickname: e.target.value })}
                      className="input-field text-xs"
                      placeholder="e.g. Daily Driver"
                    />
                  </div>
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
                    Save Vehicle
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
