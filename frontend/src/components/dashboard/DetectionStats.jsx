import React from 'react';

export const DetectionStats = ({ stats }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow mt-4">
      <h3 className="text-white font-semibold mb-3">Detection Statistics</h3>
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <p className="text-gray-400 text-sm">Total</p>
          <p className="text-green-400 text-2xl font-bold">{stats?.total || 0}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-sm">Avg Conf</p>
          <p className="text-blue-400 text-2xl font-bold">{stats?.avgConfidence?.toFixed(2) || '0'}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-sm">High Conf</p>
          <p className="text-purple-400 text-2xl font-bold">{stats?.highConfCount || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default DetectionStats;
