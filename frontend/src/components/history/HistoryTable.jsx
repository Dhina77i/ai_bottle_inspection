import React from 'react';

export const HistoryTable = ({ data = [], onDelete }) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow">
      <table className="w-full text-sm">
        <thead className="bg-gray-700 border-b border-gray-600">
          <tr>
            <th className="px-6 py-3 text-left text-gray-300">Date</th>
            <th className="px-6 py-3 text-left text-gray-300">Detections</th>
            <th className="px-6 py-3 text-left text-gray-300">Confidence</th>
            <th className="px-6 py-3 text-left text-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700">
              <td className="px-6 py-3 text-gray-300">{row.date}</td>
              <td className="px-6 py-3 text-gray-300">{row.detections}</td>
              <td className="px-6 py-3 text-gray-300">{(row.confidence * 100).toFixed(2)}%</td>
              <td className="px-6 py-3">
                <button
                  onClick={() => onDelete(row.id)}
                  className="text-red-400 hover:text-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryTable;
