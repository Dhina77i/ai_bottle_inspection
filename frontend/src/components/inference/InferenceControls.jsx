import React from 'react';

export const InferenceControls = ({ isProcessing, onStart, onStop }) => {
  return (
    <div className="flex gap-3">
      <button
        onClick={onStart}
        disabled={isProcessing}
        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white py-2 rounded font-semibold"
      >
        Start Inference
      </button>
      <button
        onClick={onStop}
        disabled={!isProcessing}
        className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-500 text-white py-2 rounded font-semibold"
      >
        Stop Inference
      </button>
    </div>
  );
};

export default InferenceControls;
