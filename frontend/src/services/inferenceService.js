import { apiService } from './api';

export const inferenceService = {
  uploadAndProcess: async (file) => {
    try {
      const response = await apiService.uploadVideo(file);
      return response.data;
    } catch (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
  },

  getResults: async (sessionId) => {
    try {
      const response = await apiService.getInferenceResults(sessionId);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get results: ${error.message}`);
    }
  },
};

export default inferenceService;
