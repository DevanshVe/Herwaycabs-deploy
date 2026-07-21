import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import RiderHome from './pages/RiderHome';
import DriverHome from './pages/DriverHome';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import TrackRide from './pages/TrackRide';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/track/:token" element={<TrackRide />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['RIDER']} />}>
        <Route path="/rider-home" element={<RiderHome />} />
      </Route>

      {/* Profile — any signed-in user */}
      <Route element={<ProtectedRoute allowedRoles={['RIDER', 'DRIVER', 'ADMIN']} />}>
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['DRIVER']} />}>
        <Route path="/driver-home" element={<DriverHome />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
