import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LeadsListPage from './pages/LeadsListPage';
import LeadCreatePage from './pages/LeadCreatePage';
import LeadDetailsPage from './pages/LeadDetailsPage';
import LeadEditPage from './pages/LeadEditPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Dashboard/App Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard Default */}
            <Route index element={<DashboardPage />} />

            {/* Leads Listing */}
            <Route path="leads" element={<LeadsListPage />} />

            {/* Create Lead (Managers/Admins only) */}
            <Route
              path="leads/create"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <LeadCreatePage />
                </ProtectedRoute>
              }
            />

            {/* Lead Details */}
            <Route path="leads/:id" element={<LeadDetailsPage />} />

            {/* Edit Lead */}
            <Route path="leads/:id/edit" element={<LeadEditPage />} />
          </Route>

          {/* Fallback Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
