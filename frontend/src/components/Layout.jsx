import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err.message);
    }
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="container-fluid p-0 d-flex flex-column flex-md-row" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar / Topnav on mobile */}
      <aside className="sidebar-wrapper d-flex flex-column flex-shrink-0" style={{ width: '100%', maxWidth: '280px' }}>
        {/* Brand */}
        <div className="p-4 d-flex align-items-center gap-2 border-bottom" style={{ borderColor: 'var(--border-color) !important' }}>
          <div className="d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--brand-gradient)' }}>
            <i className="bi bi-rocket-takeoff-fill text-white fs-4"></i>
          </div>
          <div>
            <h5 className="fw-bold mb-0 text-white">LeadFlow</h5>
            <span className="text-muted small" style={{ fontSize: '0.7rem' }}>Mini LMS</span>
          </div>
        </div>

        {/* User profile details */}
        {user && (
          <div className="p-3 mx-3 mt-3 rounded-3" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center justify-content-center bg-primary rounded-circle text-white fw-bold" style={{ width: '40px', height: '40px', fontSize: '1.1rem' }}>
                {user.name[0].toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="mb-0 fw-semibold text-white text-truncate small">{user.name}</p>
                <span className="badge badge-status badge-qualified" style={{ fontSize: '0.65rem', padding: '3px 8px' }}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav className="nav flex-column mt-4 flex-grow-1">
          <Link to="/" className={`sidebar-link ${isActive('/') ? 'active' : ''}`}>
            <i className="bi bi-speedometer2"></i> Dashboard
          </Link>
          <Link to="/leads" className={`sidebar-link ${isActive('/leads') && location.pathname !== '/leads/create' ? 'active' : ''}`}>
            <i className="bi bi-list-task"></i> Leads Listing
          </Link>
          
          {/* Conditional Create Lead link for Admin/Manager */}
          {(user?.role === 'manager' || user?.role === 'admin') && (
            <Link to="/leads/create" className={`sidebar-link ${isActive('/leads/create') ? 'active' : ''}`}>
              <i className="bi bi-plus-circle-fill"></i> Create Lead
            </Link>
          )}
        </nav>

        {/* Footer Logout */}
        <div className="p-3 border-top" style={{ borderColor: 'var(--border-color) !important' }}>
          <button onClick={handleLogout} className="btn btn-outline-custom w-100 d-flex align-items-center justify-content-center gap-2 py-2">
            <i className="bi bi-box-arrow-right"></i> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow-1 p-3 p-md-5 overflow-auto" style={{ height: '100vh' }}>
        <Outlet />
      </main>
    </div>
  );
}
