import React from 'react';

export const HistoryFilters = ({ onFilterChange }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow mb-4 flex gap-4">
      <input
        type="date"
        onChange={(e) => onFilterChange('date', e.target.value)}
        className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
      />
      <input
        type="text"
        placeholder="Search..."
        onChange={(e) => onFilterChange('search', e.target.value)}
        className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 flex-1"
      />
      <select
        onChange={(e) => onFilterChange('status', e.target.value)}
        className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
      >
        <option value="">All Status</option>
        <option value="completed">Completed</option>
        <option value="processing">Processing</option>
      </select>
    </div>
  );
};

export default HistoryFilters;
