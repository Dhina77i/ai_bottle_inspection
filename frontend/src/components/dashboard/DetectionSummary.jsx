import React from 'react';

export const DetectionSummary = ({ summary }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow mt-4">
      <h3 className="text-white font-semibold mb-3">Detection Summary</h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Processing Status:</span>
          <span className="text-green-400">{summary?.status || 'Idle'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Frames Processed:</span>
          <span className="text-blue-400">{summary?.framesProcessed || 0}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Processing Time:</span>
          <span className="text-purple-400">{summary?.processingTime || '0s'}</span>
        </div>
      </div>
    </div>
  );
};

export default DetectionSummary;
