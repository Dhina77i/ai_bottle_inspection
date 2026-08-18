import React, { createContext, useState } from 'react';

export const StreamContext = createContext();

export const StreamProvider = ({ children }) => {
  const [streamStatus, setStreamStatus] = useState({
    active: false,
    fps: 0,
    frameCount: 0,
  });

  const [streamData, setStreamData] = useState(null);

  return (
    <StreamContext.Provider value={{ streamStatus, setStreamStatus, streamData, setStreamData }}>
      {children}
    </StreamContext.Provider>
  );
};
