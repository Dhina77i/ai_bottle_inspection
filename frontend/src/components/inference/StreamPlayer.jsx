import React from 'react';

export const StreamPlayer = ({ streamUrl, isPlaying }) => {
  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      <img
        src={streamUrl || 'https://via.placeholder.com/640x480?text=Stream'}
        alt="Stream"
        className="w-full h-auto"
      />
      {isPlaying && (
        <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
          LIVE
        </div>
      )}
    </div>
  );
};

export default StreamPlayer;
