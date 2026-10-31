import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Car, Plus, Trash2, Search, X, Copy, Check, DollarSign, Calendar, Cpu, ShieldCheck, AlertTriangle, ExternalLink, ShieldAlert } from 'lucide-react';

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
  const [recallsMap, setRecallsMap] = useState({});
  const [selectedRecallCar, setSelectedRecallCar] = useState(null);
  const [showRecallModal, setShowRecallModal] = useState(false);
  const [vinRecallPreview, setVinRecallPreview] = useState(null);

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
      fetchRecallsForCars(response.data);
    } catch (error) {
      console.error('Error fetching cars:', error);
      setError('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecallsForCars = (carsList) => {
    carsList.forEach(async (car) => {
      try {
        const res = await api.get(`/cars/${car._id}/recalls`);
        setRecallsMap((prev) => ({
          ...prev,
          [car._id]: {
            count: res.data.count,
            recalls: res.data.recalls,
            loading: false
          }
        }));
      } catch {
        setRecallsMap((prev) => ({
          ...prev,
          [car._id]: { count: 0, recalls: [], loading: false }
        }));
      }
    });
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
    setVinRecallPreview(null);

    try {
      const response = await api.get(`/cars/decode/${cleanVin}`);
      const decoded = response.data;
      setCarData({
        vin: decoded.vin,
        make: decoded.make,
        model: decoded.model,
        year: decoded.year,
        nickname: ''
      });
      setSuccess(`Decoded: ${decoded.year} ${decoded.make} ${decoded.model}`);

      // Check recalls preview for this model
      try {
        const recallRes = await api.get(`/cars/recalls/check?make=${encodeURIComponent(decoded.make)}&model=${encodeURIComponent(decoded.model)}&year=${decoded.year}`);
        setVinRecallPreview(recallRes.data);
      } catch (e) {
        console.error('Recall check error:', e);
      }
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
      const newCar = response.data;
      setCars([newCar, ...cars]);
      fetchRecallsForCars([newCar]);
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

  const handleOpenRecalls = (car) => {
    setSelectedRecallCar(car);
    setShowRecallModal(true);
  };

  const resetForm = () => {
    setVinInput('');
    setVinRecallPreview(null);
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
            Registered vehicle inventory with NHTSA VIN telemetry & Live Safety Recalls
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
          {filteredCars.map((car) => {
            const recallData = recallsMap[car._id];
            const hasRecalls = recallData && recallData.count > 0;
            const isRecallLoading = !recallData;

            return (
              <div
                key={car._id}
                className="card card-hover group flex flex-col justify-between"
              >
                <div>
                  {/* Top Badge Row */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {car.year}
                      </span>
                      {car.nickname && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60 truncate max-w-[130px]">
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
                  <p className="text-sm font-medium text-slate-400 mb-3">{car.model}</p>

                  {/* Live Safety Recalls Banner Button */}
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={() => handleOpenRecalls(car)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        isRecallLoading
                          ? 'bg-slate-950/60 text-slate-500 border-slate-800 animate-pulse'
                          : hasRecalls
                          ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                      title="Click to view official NHTSA Safety Recalls"
                    >
                      <div className="flex items-center gap-2">
                        {isRecallLoading ? (
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-500 border-t-transparent animate-spin" />
                        ) : hasRecalls ? (
                          <ShieldAlert size={14} className="text-rose-400" />
                        ) : (
                          <ShieldCheck size={14} className="text-emerald-400" />
                        )}
                        <span>
                          {isRecallLoading
                            ? 'Scanning NHTSA recalls...'
                            : hasRecalls
                            ? `${recallData.count} Open Safety Recall${recallData.count > 1 ? 's' : ''}`
                            : '0 Safety Recalls (Clean)'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal underline">
                        View
                      </span>
                    </button>
                  </div>

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
            );
          })}
        </div>
      )}

      {/* Safety Recall Inspector Modal */}
      {showRecallModal && selectedRecallCar && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-800 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                    OFFICIAL NHTSA SAFETY REGISTRY
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {selectedRecallCar.year} {selectedRecallCar.make} {selectedRecallCar.model}
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  VIN: {selectedRecallCar.vin}
                </p>
              </div>
              <button
                onClick={() => setShowRecallModal(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              {recallsMap[selectedRecallCar._id]?.count === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-3 shadow-lg shadow-emerald-500/10">
                    <ShieldCheck size={28} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">Clean Safety Record</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    No active manufacturer safety recalls were reported to the US National Highway Traffic Safety Administration (NHTSA) for this {selectedRecallCar.year} {selectedRecallCar.make} {selectedRecallCar.model}.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold">
                      <AlertTriangle size={16} className="text-rose-400 shrink-0" />
                      <span>{recallsMap[selectedRecallCar._id]?.count} Active Safety Recall(s) Identified</span>
                    </div>
                    <span className="text-[11px] text-slate-400">Repairs are legally free at authorized dealerships</span>
                  </div>

                  {recallsMap[selectedRecallCar._id]?.recalls?.map((recall, idx) => (
                    <div
                      key={recall.NHTSACampaignNumber || idx}
                      className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                          Campaign #{recall.NHTSACampaignNumber || 'N/A'}
                        </span>
                        <span className="text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                          Component: {recall.Component || 'Safety System'}
                        </span>
                      </div>

                      {recall.Summary && (
                        <div>
                          <p className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">Defect Summary</p>
                          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{recall.Summary}</p>
                        </div>
                      )}

                      {recall.Conequence && (
                        <div>
                          <p className="text-[11px] uppercase font-bold text-rose-400/90 tracking-wider">Safety Risk</p>
                          <p className="text-xs text-rose-200/90 mt-0.5 leading-relaxed">{recall.Conequence}</p>
                        </div>
                      )}

                      {recall.Remedy && (
                        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                          <p className="text-[11px] uppercase font-bold text-emerald-400 tracking-wider">Dealer Corrective Action (Free)</p>
                          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{recall.Remedy}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between gap-3">
              <a
                href="https://www.nhtsa.gov/recalls"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-slate-400 hover:text-cyan-400 inline-flex items-center gap-1.5"
              >
                <span>Official NHTSA.gov Portal</span>
                <ExternalLink size={13} />
              </a>
              <Link
                to="/dashboard/bookings"
                onClick={() => setShowRecallModal(false)}
                className="btn-primary text-xs py-2 px-4 gap-1.5"
              >
                <Calendar size={14} />
                <span>Schedule Dealership Inspection</span>
              </Link>
            </div>
          </div>
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

                {/* Decoded Recalls Badge Preview */}
                {vinRecallPreview && (
                  <div className={`mt-3 pt-3 border-t border-cyan-500/20 flex items-center justify-between text-xs font-semibold ${
                    vinRecallPreview.count > 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      {vinRecallPreview.count > 0 ? <AlertTriangle size={14} /> : <ShieldCheck size={14} />}
                      <span>
                        {vinRecallPreview.count > 0
                          ? `Safety Notice: ${vinRecallPreview.count} open recall(s) found on this model year`
                          : 'Safety Check: 0 Active Manufacturer Recalls'}
                      </span>
                    </div>
                  </div>
                )}
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
