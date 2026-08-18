import React from 'react';

export const AnalyticsCards = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow">
        <h3 className="text-gray-200 text-sm mb-2">Total Inspections</h3>
        <p className="text-3xl font-bold">{data?.totalInspections || 0}</p>
      </div>
      <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow">
        <h3 className="text-gray-200 text-sm mb-2">Total Detections</h3>
        <p className="text-3xl font-bold">{data?.totalDetections || 0}</p>
      </div>
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow">
        <h3 className="text-gray-200 text-sm mb-2">Avg Confidence</h3>
        <p className="text-3xl font-bold">{data?.averageConfidence?.toFixed(2) || '0.00'}</p>
      </div>
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow">
        <h3 className="text-gray-200 text-sm mb-2">Detection Rate</h3>
        <p className="text-3xl font-bold">{data?.detectionRate?.toFixed(1) || '0.0'}%</p>
      </div>
    </div>
  );
};

export default AnalyticsCards;
