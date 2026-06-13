import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  return (
    <div>
      <h2 className="fw-bold mb-4">Dashboard</h2>
      <div className="card card-premium p-4">
        <h4>Welcome back, {user?.name}!</h4>
        <p className="text-secondary mb-0">
          This is your {user?.role} portal. Dashboard metrics, agents load, and activity logs will load here.
        </p>
      </div>
    </div>
  );
}
