import { apiService } from './api';

export const analyticsService = {
  getDashboard: async () => {
    try {
      const response = await apiService.getDashboardAnalytics();
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch dashboard: ${error.message}`);
    }
  },

  getStats: async () => {
    try {
      const response = await apiService.getStatistics();
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch stats: ${error.message}`);
    }
  },
};

export default analyticsService;
