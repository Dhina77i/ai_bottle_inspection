// Detection class colors
export const DETECTION_COLORS = {
  defect: '#00ff00',      // Green
  crack: '#ff0000',       // Red
  leak: '#0000ff',        // Blue
  default: '#ffff00',     // Yellow
};

// UI theme colors
export const THEME_COLORS = {
  primary: '#42b8dd',
  success: '#2ecc71',
  danger: '#e74c3c',
  warning: '#f1c40f',
  dark: '#1a1a1a',
  light: '#ecf0f1',
};

// Export function to get color for a class
export const getDetectionColor = (classId) => {
  const colors = Object.values(DETECTION_COLORS);
  return colors[classId % colors.length];
};
