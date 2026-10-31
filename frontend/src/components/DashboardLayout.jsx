import { useContext, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Car, DollarSign, Calendar, Home, LogOut, Menu, X, ShieldCheck, Sparkles } from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Overview', badge: null },
    { path: '/dashboard/garage', icon: Car, label: 'Garage Fleet', badge: 'VIN AI' },
    { path: '/dashboard/expenses', icon: DollarSign, label: 'Expenses & Analytics', badge: null },
    { path: '/dashboard/bookings', icon: Calendar, label: 'Service Schedule', badge: null }
  ];

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-[#080c16] text-slate-100 relative overflow-x-hidden">
      {/* Ambient background glow orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/3 right-10 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-1/3 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Top Navigation */}
      <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
          <div className="flex justify-between items-center">
            {/* Left brand & mobile toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors"
                aria-label="Toggle menu"
              >
                {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
              </button>

              <Link to="/dashboard" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-[2px] shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-500/40 transition-shadow">
                    <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                      <Car className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                      Drive<span className="text-cyan-400">Care</span>
                    </h1>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      <Sparkles size={10} /> Pro
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 hidden sm:block tracking-wide">Autonomous Fleet OS</p>
                </div>
              </Link>
            </div>
            
            {/* Right user & actions */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-850/80 border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs text-slate-400 font-medium">Atlas Cloud Sync</span>
              </div>

              {/* User profile capsule */}
              <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-800">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-cyan-500/20 ring-1 ring-white/20">
                  {userInitial}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-slate-200 leading-tight">{user?.name || 'Driver'}</p>
                  <p className="text-[10px] text-slate-400 leading-tight truncate max-w-[120px]">{user?.email}</p>
                </div>
              </div>

              <button 
                onClick={handleLogout} 
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all text-xs font-medium flex items-center gap-1.5"
                title="Sign out"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside className={`
          fixed md:sticky top-[65px] left-0 z-40 w-64 bg-slate-900/90 md:bg-transparent backdrop-blur-2xl md:backdrop-blur-none
          h-[calc(100vh-65px)] transition-transform duration-300 ease-in-out border-r border-slate-800/80 md:border-r-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="p-4 space-y-6">
            <div>
              <p className="px-3 text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2">Navigation</p>
              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                        ${isActive 
                          ? 'bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-transparent text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/60'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 group-hover:text-slate-200'}`}>
                          <Icon size={18} />
                        </div>
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Quick System Badge */}
            <div className="hidden md:block p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800/80 shadow-lg">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-1">
                <ShieldCheck size={16} />
                <span>NHTSA VPIC Connected</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Live official VIN validation and real-time specs lookup enabled.
              </p>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
