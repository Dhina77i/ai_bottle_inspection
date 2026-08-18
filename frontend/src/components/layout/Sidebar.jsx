import React from 'react';
import { ROUTES } from '../../utils/constants';
import logo from '../../assets/logo.png';

export const Sidebar = ({ isOpen }) => {
  const links = [
    { name: 'Dashboard', path: ROUTES.DASHBOARD },
    { name: 'Live Inspection', path: ROUTES.LIVE_INSPECTION },
    { name: 'Video Upload', path: ROUTES.VIDEO_UPLOAD },
    { name: 'Analytics', path: ROUTES.ANALYTICS },
    { name: 'History', path: ROUTES.HISTORY },
    { name: 'Settings', path: ROUTES.SETTINGS },
  ];

  return (
    <aside className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} fixed left-0 top-0 w-64 h-screen bg-gray-900 border-r border-gray-800 p-4 transition-transform duration-300 z-40`}>
      <div className="flex items-center justify-center mb-8">
        <img
          src={logo}
          alt="Logo"
          className="h-12 w-auto object-contain"
        />
      </div>
      <nav className="space-y-2 mt-8">
        {links.map((link) => (
          <a
            key={link.path}
            href={link.path}
            className="block px-4 py-2 rounded text-gray-400 hover:bg-gray-800 hover:text-white transition"
          >
            {link.name}
          </a>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
