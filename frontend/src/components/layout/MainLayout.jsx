import React from 'react';

export const MainLayout = ({ children, sidebar }) => {
  return (
    <div className="flex h-screen bg-gray-950">
      {sidebar}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
