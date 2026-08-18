// Constants for API configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/live';

// Confidence threshold for detections
export const CONFIDENCE_THRESHOLD = 0.35;

// Frame settings
export const FRAME_STRIDE = 12;
export const YOLO_IMGSZ = 640;
export const MAX_VIDEO_FRAMES = 0;

// API timeout
export const API_TIMEOUT = 30000;

// Routes
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  LIVE_INSPECTION: '/live-inspection',
  VIDEO_UPLOAD: '/video-upload',
  ANALYTICS: '/analytics',
  HISTORY: '/history',
  SETTINGS: '/settings',
};
