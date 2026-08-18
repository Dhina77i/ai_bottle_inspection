import React, { useRef, useEffect } from 'react';

export const WebcamStream = ({ isActive }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (isActive && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });
    }
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isActive]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className="w-full h-auto bg-black rounded-lg"
    />
  );
};

export default WebcamStream;
