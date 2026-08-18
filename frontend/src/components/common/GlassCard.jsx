import React from 'react';

export const GlassCard = ({ children, className = '' }) => {
  return (
    <div className={`bg-gray-800 bg-opacity-40 backdrop-blur-md border border-gray-700 rounded-lg p-6 ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;
