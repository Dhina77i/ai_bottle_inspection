import React from 'react';
import HistoryTable from '../components/history/HistoryTable';

export const InspectionHistory = () => {
  const mockData = [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Inspection History</h1>
      <HistoryTable data={mockData} />
    </div>
  );
};

export default InspectionHistory;
