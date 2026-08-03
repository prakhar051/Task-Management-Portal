import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import LoadingSpinner from '../common/LoadingSpinner';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, checkAuth, loading } = useAuthStore();

  useEffect(() => {
    // Check if the user is authenticated on page load/recovery
    checkAuth();
  }, [checkAuth]);

  if (loading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slateDark-950">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect to login if session token is unverified
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Enforce role access control guards (RBAC)
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
