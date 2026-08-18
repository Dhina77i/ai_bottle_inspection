import React from 'react';

export const LiveCameraCard = ({ isActive, onToggle }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow">
      <h3 className="text-white font-semibold mb-4">Live Camera Stream</h3>
      <div className="bg-black rounded aspect-video mb-4 flex items-center justify-center">
        {isActive ? (
          <video className="w-full h-full object-cover" />
        ) : (
          <p className="text-gray-500">Camera stream here</p>
        )}
      </div>
      <button
        onClick={onToggle}
        className={`w-full py-2 rounded font-semibold text-white ${
          isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {isActive ? 'Stop Camera' : 'Start Camera'}
      </button>
    </div>
  );
};

export default LiveCameraCard;
