import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const { login, user, error, setError } = useAuth();
  const [formLoading, setFormLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Handle URL warnings (e.g. session expired)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('session_expired')) {
      setError('Your session has expired. Please log in again.');
    }
  }, [location, setError]);

  const validateForm = () => {
    if (!email.trim()) {
      setValidationError('Email address is required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError('Please enter a valid email address.');
      return false;
    }
    if (!password) {
      setValidationError('Password is required.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      // Error is stored in AuthContext
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <div className="card card-premium p-4 p-md-5 m-3 w-100" style={{ maxWidth: '480px' }}>
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--brand-gradient)' }}>
            <i className="bi bi-rocket-takeoff-fill text-white fs-2"></i>
          </div>
          <h2 className="fw-bold mb-1" style={{ background: 'var(--brand-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            LeadFlow
          </h2>
          <p className="text-secondary small">Mini Lead Management System</p>
        </div>

        {error && (
          <div className="alert alert-danger border-0 text-white rounded-3 small px-3 py-2" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', borderLeft: '4px solid var(--danger) !important' }} role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
          </div>
        )}

        {validationError && (
          <div className="alert alert-warning border-0 text-white rounded-3 small px-3 py-2" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', borderLeft: '4px solid var(--warning) !important' }} role="alert">
            <i className="bi bi-info-circle-fill me-2"></i> {validationError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small text-secondary fw-semibold">Email Address</label>
            <div className="input-group">
              <span className="input-group-text border-0" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="email"
                className="form-control form-control-custom"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={formLoading}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small text-secondary fw-semibold">Password</label>
            <div className="input-group">
              <span className="input-group-text border-0" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                <i className="bi bi-lock"></i>
              </span>
              <input
                type="password"
                className="form-control form-control-custom"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={formLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-gradient w-100 py-2 d-flex align-items-center justify-content-center gap-2"
            disabled={formLoading}
          >
            {formLoading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Logging in...
              </>
            ) : (
              <>
                Sign In <i className="bi bi-arrow-right-short fs-5"></i>
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-4 border-top pt-3" style={{ borderColor: 'var(--border-color) !important' }}>
          <p className="text-muted small mb-0">
            Demo Credentials:<br />
            Manager: <code>manager@company.com</code> / <code>managerpassword</code><br />
            Agent: <code>alice@company.com</code> / <code>agentpassword</code>
          </p>
        </div>
      </div>
    </div>
  );
}
