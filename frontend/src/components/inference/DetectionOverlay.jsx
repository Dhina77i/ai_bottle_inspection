import React from 'react';

export const DetectionOverlay = ({ detections = [], frameSize = { width: 640, height: 480 }, summary = {} }) => {
  const scaleX = frameSize.width ? 1 : 1;
  const scaleY = frameSize.height ? 1 : 1;

  const classColors = {
    bottle: '#00ffff',        // Cyan
    fill_level: '#ff00ff',    // Magenta
    label_good: '#00ff00',    // Green
    label_damaged: '#ff0000', // Red
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow">
      <h3 className="text-white font-semibold mb-4">Detections Summary</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Detection list */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {Object.entries(summary).map(([className, stats]) => {
            const color = classColors[className] || '#ffff00';
            return (
              <div key={className} className="bg-gray-700 p-3 rounded border-l-4" style={{ borderColor: color }}>
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold capitalize">{className}</span>
                  <span style={{ color }}>
                    {stats.count}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Avg Confidence: {(stats.avg_confidence * 100).toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual legend */}
        <div className="bg-gray-700 p-4 rounded">
          <h4 className="text-white text-sm font-semibold mb-3">Class Legend</h4>
          <div className="space-y-2">
            {Object.entries(classColors).map(([className, color]) => (
              <div key={className} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: color }}
                ></div>
                <span className="text-gray-300 text-sm capitalize">{className}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detections list */}
      {detections.length > 0 && (
        <div className="mt-4">
          <h4 className="text-white text-sm font-semibold mb-2">All Detections ({detections.length})</h4>
          <div className="bg-gray-700 rounded p-3 max-h-32 overflow-y-auto">
            <div className="text-xs text-gray-300 space-y-1">
              {detections.slice(0, 10).map((det, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="capitalize">{det.class_name}</span>
                  <span>{(det.confidence * 100).toFixed(1)}%</span>
                </div>
              ))}
              {detections.length > 10 && (
                <div className="text-gray-500">... and {detections.length - 10} more</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetectionOverlay;
