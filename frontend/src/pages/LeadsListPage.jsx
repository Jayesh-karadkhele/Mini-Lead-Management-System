import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';

export default function LeadsListPage() {
  const { user } = useAuth();
  
  // State
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Query parameters
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);

  // Trigger fetch on query param changes
  useEffect(() => {
    fetchLeads();
  }, [page, status, source, sortBy, sortOrder]);

  const fetchLeads = async (searchVal = search) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get('/leads', {
        params: {
          page,
          limit,
          search: searchVal,
          status,
          source,
          sortBy,
          sortOrder
        }
      });
      
      setLeads(response.data.leads);
      setTotalPages(response.data.pagination.totalPages);
      setTotalLeads(response.data.pagination.total);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError(err.response?.data?.error || 'Failed to load leads list.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLeads();
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setSource('');
    setSortBy('created_at');
    setSortOrder('DESC');
    setPage(1);
    // Directly fetch with cleared values
    apiClient.get('/leads', {
      params: { page: 1, limit, search: '', status: '', source: '', sortBy: 'created_at', sortOrder: 'DESC' }
    }).then(res => {
      setLeads(res.data.leads);
      setTotalPages(res.data.pagination.totalPages);
      setTotalLeads(res.data.pagination.total);
    }).catch(err => console.error(err));
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
    setPage(1);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete lead '${name}'?`)) {
      return;
    }
    try {
      await apiClient.delete(`/leads/${id}`);
      fetchLeads(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete lead.');
    }
  };

  const renderSortIcon = (field) => {
    if (sortBy !== field) return <i className="bi bi-arrow-down-up ms-1 text-muted" style={{ fontSize: '0.75rem' }}></i>;
    return sortOrder === 'ASC' 
      ? <i className="bi bi-sort-up ms-1 text-primary"></i> 
      : <i className="bi bi-sort-down ms-1 text-primary"></i>;
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
        <div>
          <h2 className="fw-bold mb-1">Leads Listing</h2>
          <p className="text-secondary mb-0">Total Leads Found: <strong>{totalLeads}</strong></p>
        </div>
        {(user?.role === 'manager' || user?.role === 'admin') && (
          <Link to="/leads/create" className="btn btn-gradient d-flex align-items-center gap-2">
            <i className="bi bi-plus-circle"></i> Create New Lead
          </Link>
        )}
      </header>

      {/* Filters Card */}
      <section className="card card-premium p-4 mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-3">
          {/* Search bar */}
          <div className="col-12 col-md-4">
            <label className="form-label small text-secondary fw-semibold">Search Leads</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control form-control-custom"
                placeholder="Name, email or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-outline-custom border-start-0" style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
                <i className="bi bi-search"></i>
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <div className="col-12 col-sm-6 col-md-3">
            <label className="form-label small text-secondary fw-semibold">Status Filter</label>
            <select
              className="form-select form-control-custom"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="proposal">Proposal</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          {/* Source Filter */}
          <div className="col-12 col-sm-6 col-md-3">
            <label className="form-label small text-secondary fw-semibold">Source Filter</label>
            <select
              className="form-select form-control-custom"
              value={source}
              onChange={(e) => { setSource(e.target.value); setPage(1); }}
            >
              <option value="">All Sources</option>
              <option value="web">Web</option>
              <option value="referral">Referral</option>
              <option value="advertisement">Advertisement</option>
              <option value="cold_call">Cold Call</option>
              <option value="partner">Partner</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="col-12 col-md-2 d-flex align-items-end">
            <button
              type="button"
              onClick={handleClearFilters}
              className="btn btn-outline-custom w-100 py-2"
            >
              <i className="bi bi-arrow-counterclockwise"></i> Reset
            </button>
          </div>
        </form>
      </section>

      {/* Error alert */}
      {error && (
        <div className="alert alert-danger border-0 text-white mb-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}>
          {error}
        </div>
      )}

      {/* Leads Table */}
      <div className="table-responsive">
        {loading && leads.length === 0 ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : leads.length === 0 ? (
          <div className="card card-premium p-5 text-center text-muted">
            <i className="bi bi-inbox display-4 mb-3 d-block"></i>
            No leads found matching your criteria.
          </div>
        ) : (
          <table className="table table-premium w-100 align-middle">
            <thead>
              <tr>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>
                  Name {renderSortIcon('name')}
                </th>
                <th>Email</th>
                <th>Phone</th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('source')}>
                  Source {renderSortIcon('source')}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('status')}>
                  Status {renderSortIcon('status')}
                </th>
                <th>Assigned To</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <Link to={`/leads/${lead.id}`} className="text-white fw-semibold text-decoration-none hover-link">
                      {lead.name}
                    </Link>
                  </td>
                  <td><span className="text-secondary small">{lead.email}</span></td>
                  <td><span className="text-secondary small">{lead.phone || '-'}</span></td>
                  <td>
                    <span className="badge bg-secondary text-capitalize" style={{ fontSize: '0.7rem' }}>
                      {lead.source.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`badge-status badge-${lead.status}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td>
                    {lead.assignee_name ? (
                      <span className="text-white small fw-medium">
                        <i className="bi bi-person me-1 text-primary"></i>
                        {lead.assignee_name}
                      </span>
                    ) : (
                      <span className="text-muted small italic">Unassigned</span>
                    )}
                  </td>
                  <td className="text-end">
                    <div className="d-inline-flex gap-2">
                      <Link to={`/leads/${lead.id}`} className="btn btn-sm btn-outline-custom p-2" title="View Details">
                        <i className="bi bi-eye"></i>
                      </Link>
                      <Link to={`/leads/${lead.id}/edit`} className="btn btn-sm btn-outline-custom p-2 text-warning" title="Edit Lead">
                        <i className="bi bi-pencil"></i>
                      </Link>
                      {(user?.role === 'manager' || user?.role === 'admin') && (
                        <button
                          onClick={() => handleDelete(lead.id, lead.name)}
                          className="btn btn-sm btn-outline-custom p-2 text-danger"
                          title="Delete Lead"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <nav className="d-flex justify-content-between align-items-center mt-4 px-2">
          <button
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page === 1 || loading}
            className="btn btn-outline-custom px-3 py-2"
          >
            <i className="bi bi-chevron-left me-1"></i> Previous
          </button>
          <span className="text-secondary small">
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </span>
          <button
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            disabled={page === totalPages || loading}
            className="btn btn-outline-custom px-3 py-2"
          >
            Next <i className="bi bi-chevron-right ms-1"></i>
          </button>
        </nav>
      )}
    </div>
  );
}
