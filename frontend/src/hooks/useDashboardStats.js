import { useContext } from 'react';
import { DashboardContext } from '../context/DashboardContext';

export const useDashboardStats = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardStats must be used within DashboardProvider');
  }
  return context;
};
