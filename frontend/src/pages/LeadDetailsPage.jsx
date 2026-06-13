import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';

export default function LeadDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeadDetails();
  }, [id]);

  const fetchLeadDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const [leadRes, activitiesRes] = await Promise.all([
        apiClient.get(`/leads/${id}`),
        apiClient.get(`/leads/${id}/activities`)
      ]);

      setLead(leadRes.data);
      setActivities(activitiesRes.data);
    } catch (err) {
      console.error('Error loading lead details:', err);
      setError(err.response?.data?.error || 'Failed to load lead details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete lead '${lead?.name}'?`)) {
      return;
    }
    try {
      await apiClient.delete(`/leads/${lead.id}`);
      navigate('/leads');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete lead.');
    }
  };

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
        <h5 className="fw-bold"><i className="bi bi-exclamation-octagon-fill me-2"></i>Access Denied / Error</h5>
        <p className="mb-3">{error}</p>
        <Link to="/leads" className="btn btn-outline-custom">Back to Leads List</Link>
      </div>
    );
  }

  const enrichment = lead?.enrichment_data || null;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <header className="mb-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
        <div className="d-flex align-items-center gap-3">
          <Link to="/leads" className="btn btn-outline-custom p-2 px-3">
            <i className="bi bi-arrow-left"></i> Back
          </Link>
          <div>
            <h2 className="fw-bold mb-1">{lead?.name}</h2>
            <p className="text-secondary mb-0">Lead ID: #{lead?.id}</p>
          </div>
        </div>
        <div className="d-flex gap-2">
          <Link to={`/leads/${lead?.id}/edit`} className="btn btn-outline-custom text-warning px-3">
            <i className="bi bi-pencil me-1"></i> Edit Lead
          </Link>
          {(user?.role === 'manager' || user?.role === 'admin') && (
            <button onClick={handleDelete} className="btn btn-outline-custom text-danger px-3">
              <i className="bi bi-trash me-1"></i> Delete
            </button>
          )}
        </div>
      </header>

      <div className="row g-4">
        {/* Left Column - Details & Enrichment */}
        <section className="col-12 col-lg-7 d-flex flex-column gap-4">
          
          {/* Main Info */}
          <div className="card card-premium p-4">
            <h5 className="fw-bold mb-4 border-bottom pb-2" style={{ borderColor: 'var(--border-color) !important' }}>
              <i className="bi bi-info-circle text-primary me-2"></i> Lead Profile Details
            </h5>
            <div className="row g-3">
              <div className="col-6 col-sm-4">
                <span className="text-muted small d-block">Status</span>
                <span className={`badge-status badge-${lead?.status} mt-1`}>{lead?.status}</span>
              </div>
              <div className="col-6 col-sm-4">
                <span className="text-muted small d-block">Source</span>
                <span className="badge bg-secondary mt-1 text-capitalize">{lead?.source.replace('_', ' ')}</span>
              </div>
              <div className="col-12 col-sm-4">
                <span className="text-muted small d-block">Assigned Agent</span>
                <span className="text-white fw-medium mt-1 d-block">
                  <i className="bi bi-person text-primary me-1"></i>
                  {lead?.assignee_name || <span className="text-muted small italic">Unassigned</span>}
                </span>
              </div>
              <div className="col-12 col-sm-6 mt-4">
                <span className="text-muted small d-block">Email Address</span>
                <a href={`mailto:${lead?.email}`} className="text-white fw-semibold text-decoration-none">{lead?.email}</a>
              </div>
              <div className="col-12 col-sm-6 mt-4">
                <span className="text-muted small d-block">Phone Number</span>
                <span className="text-white fw-semibold">{lead?.phone || '-'}</span>
              </div>
              <div className="col-12 mt-4">
                <span className="text-muted small d-block">Internal Notes</span>
                <div className="p-3 rounded mt-2 text-white small" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', minHeight: '100px', whiteSpace: 'pre-wrap' }}>
                  {lead?.notes || <span className="text-muted italic">No internal notes added.</span>}
                </div>
              </div>
            </div>
          </div>

          {/* External Enrichment Info */}
          <div className="card card-premium p-4">
            <h5 className="fw-bold mb-4 border-bottom pb-2" style={{ borderColor: 'var(--border-color) !important' }}>
              <i className="bi bi-magic text-primary me-2"></i> Profile Enrichment (RandomUser API)
            </h5>
            {enrichment ? (
              <div className="d-flex flex-column flex-sm-row align-items-center align-items-sm-start gap-4">
                <img
                  src={enrichment.avatar}
                  alt={lead?.name}
                  className="rounded-3 border border-2"
                  style={{ width: '100px', height: '100px', objectFit: 'cover', borderColor: 'var(--brand-primary) !important' }}
                />
                <div className="row g-3 flex-grow-1 w-100">
                  <div className="col-6">
                    <span className="text-muted small d-block">Alternate Cell</span>
                    <span className="text-white fw-semibold small">{enrichment.cell || '-'}</span>
                  </div>
                  <div className="col-6">
                    <span className="text-muted small d-block">Gender / Age</span>
                    <span className="text-white fw-semibold text-capitalize small">
                      {enrichment.gender} | {enrichment.age} yrs
                    </span>
                  </div>
                  <div className="col-12">
                    <span className="text-muted small d-block">Enriched Location</span>
                    <span className="text-white fw-semibold small">
                      <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                      {enrichment.location.city}, {enrichment.location.state}, {enrichment.location.country}
                    </span>
                  </div>
                  <div className="col-12">
                    <span className="text-muted small d-block">Date of Birth</span>
                    <span className="text-secondary small">
                      {new Date(enrichment.dob).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted">
                <i className="bi bi-lightning-charge-fill display-6 mb-2 d-block text-warning animate-pulse"></i>
                Profile enrichment is being compiled in the background...
                <button onClick={fetchLeadDetails} className="btn btn-sm btn-outline-custom d-block mx-auto mt-3">
                  <i className="bi bi-arrow-clockwise me-1"></i> Refresh Profile
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Right Column - Activity Log history */}
        <section className="col-12 col-lg-5">
          <div className="card card-premium p-4 h-100">
            <h5 className="fw-bold mb-4 border-bottom pb-2" style={{ borderColor: 'var(--border-color) !important' }}>
              <i className="bi bi-clock-history text-primary me-2"></i> Lead Activity History
            </h5>
            {activities.length === 0 ? (
              <div className="text-center py-5 text-muted">
                No activity logs available for this lead.
              </div>
            ) : (
              <div className="position-relative ps-3 border-start small" style={{ borderColor: 'var(--border-color) !important' }}>
                {activities.map((act) => {
                  let badgeColor = 'bg-secondary';
                  if (act.activity_type === 'lead_created') badgeColor = 'bg-info';
                  if (act.activity_type === 'lead_assigned') badgeColor = 'bg-primary';
                  if (act.activity_type === 'status_changed') badgeColor = 'bg-warning';

                  return (
                    <div key={act.id} className="mb-4 position-relative">
                      {/* Timeline dot */}
                      <span className={`position-absolute rounded-circle ${badgeColor}`} style={{ width: '12px', height: '12px', left: '-20px', top: '5px' }}></span>
                      <div>
                        <div className="d-flex justify-content-between">
                          <span className="fw-semibold text-white">{act.details}</span>
                        </div>
                        <span className="text-muted d-block mt-1" style={{ fontSize: '0.7rem' }}>
                          By: {act.user_name || 'System'} | {new Date(act.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
