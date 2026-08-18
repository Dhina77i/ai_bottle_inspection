import React from 'react';

export const ProcessedFrame = ({ frameData, confidence }) => {
  return (
    <div className="bg-gray-900 p-4 rounded-lg">
      <div className="relative bg-black rounded mb-3">
        <img
          src={frameData}
          alt="Processed"
          className="w-full h-auto rounded"
        />
      </div>
      <p className="text-gray-400 text-sm">Confidence: {(confidence * 100).toFixed(2)}%</p>
    </div>
  );
};

export default ProcessedFrame;
