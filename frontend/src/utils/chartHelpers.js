// Chart color schemes
export const CHART_COLORS = {
  primary: '#42b8dd',
  secondary: '#9b59b6',
  success: '#2ecc71',
  danger: '#e74c3c',
  warning: '#f39c12',
};

// Format chart data
export const formatChartData = (data) => {
  return {
    labels: data.labels || [],
    datasets: data.datasets || [],
  };
};

// Get color scheme for charts
export const getChartColorScheme = () => {
  return [
    CHART_COLORS.primary,
    CHART_COLORS.secondary,
    CHART_COLORS.success,
    CHART_COLORS.danger,
  ];
};
