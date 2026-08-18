import React from 'react';

export const ExportCSVButton = ({ data, filename = 'export.csv' }) => {
  const handleExport = () => {
    const headers = Object.keys(data[0] || {});
    const csv = [
      headers.join(','),
      ...data.map((row) => headers.map((h) => row[h]).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold"
    >
      Export CSV
    </button>
  );
};

export default ExportCSVButton;
