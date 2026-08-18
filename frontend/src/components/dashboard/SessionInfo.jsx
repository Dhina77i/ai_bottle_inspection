import React from 'react';

export const SessionInfo = ({ sessionData }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow mt-4">
      <h3 className="text-white font-semibold mb-3">Session Info</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Session ID:</span>
          <span className="text-gray-300 font-mono text-xs">{sessionData?.id || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Start Time:</span>
          <span className="text-gray-300">{sessionData?.startTime || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Duration:</span>
          <span className="text-gray-300">{sessionData?.duration || '0s'}</span>
        </div>
      </div>
    </div>
  );
};

export default SessionInfo;
