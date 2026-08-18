import React from 'react';

export const FPSCounter = ({ fps = 0 }) => {
  return (
    <div className="absolute top-4 right-4 bg-gray-900 bg-opacity-75 px-3 py-2 rounded">
      <p className="text-green-400 font-bold text-sm">FPS: {fps.toFixed(1)}</p>
    </div>
  );
};

export default FPSCounter;
