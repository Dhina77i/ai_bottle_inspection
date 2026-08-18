import axios from "axios";

const browserHost = typeof window !== "undefined" ? window.location.hostname : "localhost";
const apiHost = browserHost || "localhost";

export const API_URL = import.meta.env.VITE_API_URL || `http://${apiHost}:8000`;
export const WS_URL = import.meta.env.VITE_WS_URL || `${API_URL.replace(/^http/, "ws")}/ws/live`;

// Create axios instance with sensible timeout
export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds for standard requests
  headers: {
    "Accept": "application/json",
  }
});

// Add response interceptor for centralized error handling
api.interceptors.response.use(
  response => response,
  error => {
    // Handle different error types
    if (!error.response) {
      // Network error or server unreachable
      if (error.code === 'ECONNABORTED') {
        const err = new Error("Request timeout. Backend server may be unresponsive.");
        err.isTimeout = true;
        throw err;
      }
      // No response from server
      const err = new Error("Unable to reach backend server. Please ensure it is running and accessible.");
      err.isNetworkError = true;
      throw err;
    }
    // Re-throw with original error info
    throw error;
  }
);

// Utility to handle common API errors
function handleApiError(err) {
  if (err.isNetworkError) {
    return "Unable to reach backend server. Please make sure it is running.";
  }
  if (err.isTimeout) {
    return "Request timeout. Backend server is not responding.";
  }
  if (err.response?.status === 401) {
    return "Authentication failed. Please log in again.";
  }
  if (err.response?.status === 403) {
    return "Access denied.";
  }
  if (err.response?.status === 404) {
    return "Resource not found.";
  }
  if (err.response?.status >= 500) {
    return "Server error. Please try again later.";
  }
  if (err.response?.data?.detail) {
    return err.response.data.detail;
  }
  if (err.message === "Failed to fetch") {
    return "Unable to reach backend server. Please ensure it is running.";
  }
  return err.message || "An error occurred. Please try again.";
}

// Inference endpoints (YOLO detection)
export async function uploadVideoForInference(file) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/api/inference/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function getInferenceResults(sessionId) {
  const { data } = await api.get(`/api/inference/results/${sessionId}`);
  return data;
}

export async function getInferenceStatus(sessionId) {
  const { data } = await api.get(`/api/inference/status/${sessionId}`);
  return data;
}

// Legacy endpoints
export async function getHealth() {
  const { data } = await api.get("/health");
  return data;
}

export async function uploadVideo(file, onProgress) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/upload-video", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 300000, // 5 minutes for video uploads
    onUploadProgress: (event) => onProgress?.(Math.round((event.loaded * 100) / (event.total || event.loaded)))
  });
  return data;
}

export async function fetchAnalytics() {
  const { data } = await api.get("/api/analytics/dashboard");
  return data;
}

export async function clearAnalytics() {
  // Try the dedicated analytics clear endpoint if present
  try {
    const { data } = await api.delete("/api/analytics/clear");
    return data;
  } catch (err) {
    // Fallback: delete all inspection records individually via history API
    // This is safe and uses existing backend routes without requiring server changes.
    try {
      const { data: list } = await api.get("/api/history/", { params: { skip: 0, limit: 10000 } });
      const items = list?.items || [];
      for (const it of items) {
        await api.delete(`/api/history/${it.id}`);
      }
      return { success: true, deleted: items.length };
    } catch (e) {
      // rethrow original or fallback error
      throw err;
    }
  }
}

export async function fetchHistory(params = {}) {
  const { page = 1, page_size = 10, search, source } = params;
  const query = {
    skip: (page - 1) * page_size,
    limit: page_size,
  };
  if (search) query.search = search;
  if (source) query.source = source;
  const { data } = await api.get("/api/history/", { params: query });
  return data;
}

export function reportUrl(id) {
  return `${API_URL}/api/history/${id}/report`;
}

export function processedVideoUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}

// API Service object for consistency
export const apiService = {
  uploadVideo: (file) => uploadVideoForInference(file),
  getInferenceResults: (sessionId) => getInferenceResults(sessionId),
  getInferenceStatus: (sessionId) => getInferenceStatus(sessionId),
  getDashboardAnalytics: fetchAnalytics,
  getStatistics: fetchAnalytics,
  clearAnalytics: clearAnalytics,
  getHistory: fetchHistory,
};

// Real-Time MJPEG Streaming & Inference Controls
export async function startInference() {
  const { data } = await api.post("/start-inference");
  return data;
}

export async function stopInference() {
  const { data } = await api.post("/stop-inference");
  return data;
}

export async function clearDashboard() {
  const { data } = await api.post("/clear-dashboard");
  return data;
}

export async function startStream(sourceType, url) {
  const { data } = await api.post("/start-stream", {
    source_type: sourceType,
    url,
  });
  return data;
}

export async function stopStream() {
  const { data } = await api.get("/stop-stream");
  return data;
}

export async function getStreamStatus() {
  const { data } = await api.get("/stream-status");
  return data;
}

export async function getVideoFeedStats() {
  const { data } = await api.get("/video-feed-stats");
  return data;
}

// Export error handler for use in components
export { handleApiError };
