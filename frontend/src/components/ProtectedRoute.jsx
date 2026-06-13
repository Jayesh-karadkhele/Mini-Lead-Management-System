import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem', color: 'var(--brand-primary)' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="card card-premium p-5 text-center" style={{ maxWidth: '480px' }}>
          <div className="mb-4">
            <i className="bi bi-shield-lock-fill text-danger" style={{ fontSize: '4.5rem' }}></i>
          </div>
          <h2 className="fw-bold mb-3 text-danger">Access Denied</h2>
          <p className="text-secondary mb-4">
            Your current role <strong>{user.role.toUpperCase()}</strong> does not have permission to view this page.
          </p>
          <a href="/" className="btn btn-gradient px-4 py-2">
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
}
