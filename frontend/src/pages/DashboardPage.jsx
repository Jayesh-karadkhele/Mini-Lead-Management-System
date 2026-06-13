import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch stats and activities in parallel
        const [statsRes, activitiesRes] = await Promise.all([
          apiClient.get('/leads/stats'),
          apiClient.get('/activities?limit=10')
        ]);
        
        setStats(statsRes.data);
        setActivities(activitiesRes.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.error || 'Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger border-0 text-white p-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}>
        <h5 className="fw-bold"><i className="bi bi-exclamation-octagon-fill me-2"></i>Error</h5>
        <p className="mb-0">{error}</p>
      </div>
    );
  }

  // Calculate stats values
  const totalLeads = stats?.total || 0;
  const statusCounts = stats?.statusBreakdown || [];

  const countNew = statusCounts.find(s => s.status === 'new')?.count || 0;
  const countWon = statusCounts.find(s => s.status === 'won')?.count || 0;
  const countLost = statusCounts.find(s => s.status === 'lost')?.count || 0;
  
  // Active states: contacted, qualified, proposal
  const countActive = statusCounts
    .filter(s => ['contacted', 'qualified', 'proposal'].includes(s.status))
    .reduce((acc, curr) => acc + parseInt(curr.count, 10), 0);

  // Find the agent with the minimum load
  const agentLoads = stats?.agentLoads || [];
  const minLoad = agentLoads.length > 0 
    ? Math.min(...agentLoads.map(a => parseInt(a.active_leads_count, 10))) 
    : 0;

  return (
    <div className="animate-fade-in">
      <header className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h2 className="fw-bold mb-1">Dashboard</h2>
          <p className="text-secondary mb-0">Overview of your lead pipeline and team performance</p>
        </div>
        <div className="text-muted small">
          <i className="bi bi-clock me-1"></i> Local Time: {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </header>

      {/* Stats Grid */}
      <section className="row g-4 mb-5">
        {/* Total Leads */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card card-premium p-4 d-flex flex-row align-items-center gap-3">
            <div className="d-flex align-items-center justify-content-center rounded-3 bg-primary text-white" style={{ width: '56px', height: '56px', background: 'var(--brand-gradient)' }}>
              <i className="bi bi-people-fill fs-3"></i>
            </div>
            <div>
              <p className="text-secondary small mb-1 fw-semibold">Total Leads</p>
              <h3 className="fw-bold mb-0">{totalLeads}</h3>
            </div>
          </div>
        </div>

        {/* New Leads */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card card-premium p-4 d-flex flex-row align-items-center gap-3">
            <div className="d-flex align-items-center justify-content-center rounded-3 text-info" style={{ width: '56px', height: '56px', backgroundColor: 'rgba(6, 182, 212, 0.15)' }}>
              <i className="bi bi-person-plus-fill fs-3"></i>
            </div>
            <div>
              <p className="text-secondary small mb-1 fw-semibold">New Leads</p>
              <h3 className="fw-bold mb-0">{countNew}</h3>
            </div>
          </div>
        </div>

        {/* Active Pipeline */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card card-premium p-4 d-flex flex-row align-items-center gap-3">
            <div className="d-flex align-items-center justify-content-center rounded-3 text-warning" style={{ width: '56px', height: '56px', backgroundColor: 'rgba(245, 158, 11, 0.15)' }}>
              <i className="bi bi-lightning-charge-fill fs-3"></i>
            </div>
            <div>
              <p className="text-secondary small mb-1 fw-semibold">Active Leads</p>
              <h3 className="fw-bold mb-0">{countActive}</h3>
            </div>
          </div>
        </div>

        {/* Closed Won */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card card-premium p-4 d-flex flex-row align-items-center gap-3">
            <div className="d-flex align-items-center justify-content-center rounded-3 text-success" style={{ width: '56px', height: '56px', backgroundColor: 'rgba(16, 185, 129, 0.15)' }}>
              <i className="bi bi-award-fill fs-3"></i>
            </div>
            <div>
              <p className="text-secondary small mb-1 fw-semibold">Closed Won</p>
              <h3 className="fw-bold mb-0">{countWon}</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Grid for activity & workloads */}
      <div className="row g-4">
        {/* Recent Activity Feed */}
        <section className={`${(user.role === 'admin' || user.role === 'manager') ? 'col-12 col-xl-7' : 'col-12'}`}>
          <div className="card card-premium p-4 h-100">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <i className="bi bi-activity text-primary"></i> Recent Activity Feed
            </h5>
            {activities.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-hourglass-split display-6 mb-3 d-block"></i>
                No recent activity logs recorded.
              </div>
            ) : (
              <div className="pe-2" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                <div className="position-relative ps-4 border-start" style={{ borderColor: 'var(--border-color) !important' }}>
                  {activities.map((act) => {
                    // Decide icon and class based on activity type
                    let iconClass = 'bi-info-circle-fill bg-secondary';
                    let textClass = 'text-primary';
                    if (act.activity_type === 'lead_created') {
                      iconClass = 'bi-plus-circle-fill bg-info';
                      textClass = 'text-info';
                    } else if (act.activity_type === 'lead_assigned') {
                      iconClass = 'bi-person-check-fill bg-primary';
                      textClass = 'text-brand';
                    } else if (act.activity_type === 'status_changed') {
                      iconClass = 'bi-arrow-left-right bg-warning';
                      textClass = 'text-warning';
                    }

                    return (
                      <div key={act.id} className="mb-4 position-relative">
                        {/* Timeline dot */}
                        <div className="position-absolute d-flex align-items-center justify-content-center rounded-circle border text-white" 
                             style={{ 
                               width: '24px', 
                               height: '24px', 
                               left: '-37px', 
                               top: '2px', 
                               backgroundColor: 'var(--bg-secondary)', 
                               borderColor: 'var(--border-color)', 
                               fontSize: '0.75rem' 
                             }}>
                          <i className={`bi ${iconClass.split(' ')[0]}`}></i>
                        </div>
                        {/* Content */}
                        <div>
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fw-semibold text-white small">{act.details}</span>
                            <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                              {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-muted small mb-0">
                            Lead: <strong>{act.lead_name}</strong> | Performed by: <strong>{act.user_name || 'System'}</strong>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Agent workloads (Manager/Admin only) */}
        {(user.role === 'admin' || user.role === 'manager') && (
          <section className="col-12 col-xl-5">
            <div className="card card-premium p-4 h-100">
              <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                <i className="bi bi-people text-primary"></i> Team Workloads (Agents)
              </h5>
              {agentLoads.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-people-fill display-6 mb-3 d-block"></i>
                  No agents found in the system.
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {agentLoads.map((agent) => {
                    const count = parseInt(agent.active_leads_count, 10);
                    const isLeastLoaded = count === minLoad && count > 0;
                    
                    return (
                      <div key={agent.id} className="p-3 rounded-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                        <div>
                          <h6 className="mb-1 fw-bold text-white d-flex align-items-center gap-2">
                            {agent.name}
                            {isLeastLoaded && (
                              <span className="badge bg-success" style={{ fontSize: '0.6rem', padding: '3px 8px' }}>
                                Least Loaded
                              </span>
                            )}
                          </h6>
                          <p className="text-secondary small mb-0">{agent.email}</p>
                        </div>
                        <div className="text-end">
                          <span className="fs-5 fw-bold text-white d-block">{count}</span>
                          <span className="text-muted small" style={{ fontSize: '0.7rem' }}>Active Leads</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
