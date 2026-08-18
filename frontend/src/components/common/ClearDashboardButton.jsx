import React from 'react';

export const ClearDashboardButton = ({ onClear }) => {
  return (
    <button
      onClick={onClear}
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold transition"
    >
      Clear Dashboard
    </button>
  );
};

export default ClearDashboardButton;
