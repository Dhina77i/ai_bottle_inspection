// Format functions for displaying data

export const formatNumber = (num) => {
  return num ? num.toFixed(0) : '0';
};

export const formatPercentage = (num) => {
  return num ? (num * 100).toFixed(2) + '%' : '0%';
};

export const formatConfidence = (num) => {
  return num ? (num * 100).toFixed(1) + '%' : '0%';
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString();
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString();
};

export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
