import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Access Restricted</h2>
        <p className="text-gray-300 mb-6">Please log in to access this page.</p>
        <button
          onClick={() => window.location.href = '/'}
          className="btn btn-primary"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;