import React, { useState } from 'react';
import { apiService } from '../../services/api';
import VideoInferencePlayer from './VideoInferencePlayer';

export const VideoUploadCard = ({ onUpload, isLoading }) => {
  const [sessionId, setSessionId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const response = await apiService.uploadVideo(file);
        setSessionId(response.session_id);
        setUploadProgress(100);
        if (onUpload) {
          onUpload(response);
        }
      } catch (error) {
        console.error('Upload error:', error);
        setUploadProgress(0);
      }
    }
  };

  if (sessionId) {
    return (
      <div className="space-y-4">
        <VideoInferencePlayer sessionId={sessionId} />
        <button
          onClick={() => {
            setSessionId(null);
            setUploadProgress(0);
          }}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
        >
          Upload Another Video
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow border-2 border-dashed border-gray-600 hover:border-blue-500 transition">
      <div className="text-center">
        <p className="text-gray-400 mb-3">Drop video file here or click to select</p>
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          disabled={isLoading}
          className="hidden"
          id="video-upload"
        />
        <label
          htmlFor="video-upload"
          className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50 inline-block"
        >
          {isLoading ? `Uploading... ${uploadProgress}%` : 'Select Video'}
        </label>
      </div>
    </div>
  );
};

export default VideoUploadCard;
