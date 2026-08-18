import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import Loader from '../common/Loader';

export const VideoInferencePlayer = ({ sessionId, onResultsReceived }) => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    const pollResults = async () => {
      try {
        const response = await apiService.getInferenceResults(sessionId);
        setResults(response);
        setLoading(false);
        if (onResultsReceived) {
          onResultsReceived(response);
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          setError(err.message);
          setLoading(false);
        } else {
          // Still processing, poll again after 2 seconds
          setTimeout(pollResults, 2000);
        }
      }
    };

    pollResults();
  }, [sessionId, onResultsReceived]);

  if (loading) {
    return <Loader isLoading={true} message="Processing video with YOLO inference..." />;
  }

  if (error) {
    return <div className="bg-red-900 text-white p-4 rounded">{error}</div>;
  }

  if (!results) {
    return <div className="bg-gray-800 text-white p-4 rounded">No results available</div>;
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow space-y-4">
      <h3 className="text-white text-lg font-semibold">Inference Results</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-400 text-sm">Total Frames</p>
          <p className="text-2xl font-bold text-green-400">{results.processed_frames}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Total Detections</p>
          <p className="text-2xl font-bold text-blue-400">{results.total_detections}</p>
        </div>
      </div>

      {results.summary && (
        <div className="bg-gray-700 p-4 rounded">
          <h4 className="text-white font-semibold mb-3">Detection Summary</h4>
          <div className="space-y-2">
            {Object.entries(results.summary).map(([className, stats]) => (
              <div key={className} className="flex justify-between text-sm">
                <span className="text-gray-300">{className}:</span>
                <span className="text-white font-semibold">
                  {stats.count} ({(stats.avg_confidence * 100).toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoInferencePlayer;
