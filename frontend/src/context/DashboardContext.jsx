import React, { createContext, useState } from 'react';

export const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [dashboardData, setDashboardData] = useState({
    totalInspections: 0,
    totalDetections: 0,
    averageConfidence: 0,
    detectionRate: 0,
  });

  const [sessionStats, setSessionStats] = useState({});

  return (
    <DashboardContext.Provider value={{ dashboardData, setDashboardData, sessionStats, setSessionStats }}>
      {children}
    </DashboardContext.Provider>
  );
};
