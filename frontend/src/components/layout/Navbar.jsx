import React from 'react';
import { ROUTES } from '../../utils/constants';

export const Navbar = () => {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 sticky top-0 z-50">
      <div className="flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold">Water Bottle Inspection</h1>
        <div className="flex gap-4">
          <a href={ROUTES.DASHBOARD} className="text-gray-400 hover:text-white">Dashboard</a>
          <a href={ROUTES.ANALYTICS} className="text-gray-400 hover:text-white">Analytics</a>
          <a href={ROUTES.SETTINGS} className="text-gray-400 hover:text-white">Settings</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
