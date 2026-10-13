import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardHome from './pages/DashboardHome';
import Garage from './pages/Garage';
import Expenses from './pages/Expenses';
import Bookings from './pages/Bookings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="garage" element={<Garage />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="bookings" element={<Bookings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
