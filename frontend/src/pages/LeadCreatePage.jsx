import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';

export default function LeadCreatePage() {
  const navigate = useNavigate();
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState('web');
  const [status, setStatus] = useState('new');
  const [assignedTo, setAssignedTo] = useState('');
  const [notes, setNotes] = useState('');
  
  // Meta state
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState('');

  // Fetch agents for dropdown
  useEffect(() => {
    async function fetchAgents() {
      try {
        const response = await apiClient.get('/auth/agents');
        setAgents(response.data);
      } catch (err) {
        console.error('Failed to load agents list:', err.message);
      }
    }
    fetchAgents();
  }, []);

  const validateForm = () => {
    if (!name.trim()) {
      setValidationError('Name is required.');
      return false;
    }
    if (!email.trim()) {
      setValidationError('Email is required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError('Please enter a valid email address.');
      return false;
    }
    if (!source) {
      setValidationError('Source is required.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    const payload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      source,
      status,
      assigned_to: assignedTo ? parseInt(assignedTo, 10) : null,
      notes: notes.trim()
    };

    try {
      await apiClient.post('/leads', payload);
      navigate('/leads');
    } catch (err) {
      console.error('Create lead failed:', err);
      setError(err.response?.data?.error || 'Failed to create lead.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header className="mb-4 d-flex align-items-center gap-3">
        <Link to="/leads" className="btn btn-outline-custom p-2 px-3">
          <i className="bi bi-arrow-left"></i> Back
        </Link>
        <div>
          <h2 className="fw-bold mb-0">Create Lead</h2>
          <p className="text-secondary mb-0">Add a new customer prospect into the system</p>
        </div>
      </header>

      {error && (
        <div className="alert alert-danger border-0 text-white mb-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}>
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
        </div>
      )}

      {validationError && (
        <div className="alert alert-warning border-0 text-white mb-4" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)' }}>
          <i className="bi bi-info-circle-fill me-2"></i> {validationError}
        </div>
      )}

      <div className="card card-premium p-4 p-md-5">
        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            {/* Lead Name */}
            <div className="col-12 col-md-6">
              <label className="form-label small text-secondary fw-semibold">Lead Name *</label>
              <input
                type="text"
                className="form-control form-control-custom"
                placeholder="Dave Miller"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Email Address */}
            <div className="col-12 col-md-6">
              <label className="form-label small text-secondary fw-semibold">Email Address *</label>
              <input
                type="email"
                className="form-control form-control-custom"
                placeholder="dave@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Phone Number */}
            <div className="col-12 col-md-6">
              <label className="form-label small text-secondary fw-semibold">Phone Number</label>
              <input
                type="text"
                className="form-control form-control-custom"
                placeholder="+1 (555) 019-2834"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Lead Source */}
            <div className="col-12 col-md-6">
              <label className="form-label small text-secondary fw-semibold">Lead Source *</label>
              <select
                className="form-select form-control-custom"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                disabled={loading}
              >
                <option value="web">Web</option>
                <option value="referral">Referral</option>
                <option value="advertisement">Advertisement</option>
                <option value="cold_call">Cold Call</option>
                <option value="partner">Partner</option>
              </select>
            </div>

            {/* Lead Status */}
            <div className="col-12 col-md-6">
              <label className="form-label small text-secondary fw-semibold">Status *</label>
              <select
                className="form-select form-control-custom"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={loading}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="proposal">Proposal</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            {/* Agent Assignee */}
            <div className="col-12 col-md-6">
              <label className="form-label small text-secondary fw-semibold">Assigned Agent</label>
              <select
                className="form-select form-control-custom"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                disabled={loading}
              >
                <option value="">-- Select Agent (Auto-Assign) --</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.email})
                  </option>
                ))}
              </select>
              <div className="form-text text-muted small mt-1">
                <i className="bi bi-info-circle me-1"></i>
                If left blank, the lead will be automatically assigned to the least-loaded active agent.
              </div>
            </div>

            {/* Notes */}
            <div className="col-12">
              <label className="form-label small text-secondary fw-semibold">Internal Notes</label>
              <textarea
                className="form-control form-control-custom"
                rows="4"
                placeholder="Details of initial conversation, budget, timeline, preferences..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={loading}
              ></textarea>
            </div>

            {/* Form Actions */}
            <div className="col-12 d-flex justify-content-end gap-3 mt-3">
              <Link to="/leads" className="btn btn-outline-custom px-4 py-2">
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-gradient px-4 py-2 d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    Create Lead <i className="bi bi-check-lg fs-5"></i>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
