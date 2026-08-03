import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy load employee components to optimize chunk splitting
const Employees = lazy(() => import('./pages/Employees'));
const EmployeeDetails = lazy(() => import('./pages/EmployeeDetails'));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public authentication paths */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected app workspace panel paths */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Default child redirect to dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />

          {/* Employee module paths */}
          <Route
            path="employees"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                <Suspense fallback={
                  <div className="min-h-[50vh] flex items-center justify-center">
                    <LoadingSpinner size="lg" />
                  </div>
                }>
                  <Employees />
                </Suspense>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="employees/:id"
            element={
              <ProtectedRoute>
                <Suspense fallback={
                  <div className="min-h-[50vh] flex items-center justify-center">
                    <LoadingSpinner size="lg" />
                  </div>
                }>
                  <EmployeeDetails />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Catch-all navigation */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
