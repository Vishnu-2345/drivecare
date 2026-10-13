import { useContext, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Car, DollarSign, Calendar, Home, LogOut, Menu, X } from 'lucide-react';

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
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/dashboard/garage', icon: Car, label: 'Garage' },
    { path: '/dashboard/expenses', icon: DollarSign, label: 'Expenses' },
    { path: '/dashboard/bookings', icon: Calendar, label: 'Bookings' }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden mr-4 p-2 hover:bg-gray-100 rounded-lg"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="flex items-center">
                <div className="bg-blue-600 p-2 rounded-lg mr-3">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-blue-600">DriveCare</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="hidden sm:block text-gray-700">
                Welcome, <span className="font-medium">{user?.name}</span>!
              </span>
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-2 btn-secondary"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside className={`
          fixed md:sticky top-0 left-0 z-40 w-64 bg-white shadow-md h-[calc(100vh-72px)] 
          md:block transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-blue-50 text-blue-600 font-medium' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
