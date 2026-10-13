import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">DriveCare</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Welcome, {user?.name}!</span>
              <button onClick={logout} className="btn-secondary">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h2>
        <div className="card">
          <p className="text-gray-600">Dashboard content coming soon...</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
