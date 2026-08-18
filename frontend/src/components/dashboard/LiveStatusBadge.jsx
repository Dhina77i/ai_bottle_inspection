import React from 'react';

export const LiveStatusBadge = ({ isActive = false }) => {
  const bgColor = isActive ? 'bg-green-500' : 'bg-gray-500';
  const text = isActive ? 'LIVE' : 'OFFLINE';

  return (
    <div className={`${bgColor} text-white px-3 py-1 rounded-full text-sm font-semibold inline-flex items-center gap-2`}>
      <span className={`w-2 h-2 rounded-full ${isActive ? 'animate-pulse' : ''}`}></span>
      {text}
    </div>
  );
};

export default LiveStatusBadge;
