import React from 'react';

export const Loader = ({ isLoading, message = 'Loading...' }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white">{message}</p>
      </div>
    </div>
  );
};

export default Loader;
