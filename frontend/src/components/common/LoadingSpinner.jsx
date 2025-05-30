// frontend/src/components/common/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="loading loading-spinner loading-lg text-primary"></div>
      <p className="ml-3 text-lg text-primary">Loading...</p>
    </div>
  );
};

export default LoadingSpinner;

