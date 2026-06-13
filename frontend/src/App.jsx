import React from 'react';

function App() {
  return (
    <div className="container py-5 text-center" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div className="card card-premium p-5 max-w-md mx-auto" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h1 className="fw-bold mb-3" style={{ background: 'var(--brand-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Mini Lead Management System
        </h1>
        <p className="text-secondary mb-4">
          Frontend workspace has been successfully initialized with Vite, React, Bootstrap, and Axios.
        </p>
        <div className="d-flex justify-content-center gap-2">
          <span className="badge bg-primary px-3 py-2">Vite React</span>
          <span className="badge bg-success px-3 py-2">Bootstrap 5</span>
          <span className="badge bg-info px-3 py-2">Axios Client</span>
        </div>
      </div>
    </div>
  );
}

export default App;
