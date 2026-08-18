import React from 'react';

export const GradientButton = ({ children, onClick, disabled = false, className = '' }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition ${className}`}
    >
      {children}
    </button>
  );
};

export default GradientButton;
