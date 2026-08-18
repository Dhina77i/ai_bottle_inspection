import React from 'react';

export const ChartsSection = ({ data }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
      <div className="bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-white text-lg font-semibold mb-4">Detections Over Time</h3>
        <div className="h-64 bg-gray-700 rounded flex items-center justify-center text-gray-400">
          Chart Component Here
        </div>
      </div>
      <div className="bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-white text-lg font-semibold mb-4">Confidence Distribution</h3>
        <div className="h-64 bg-gray-700 rounded flex items-center justify-center text-gray-400">
          Chart Component Here
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;
