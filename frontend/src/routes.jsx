import React from 'react';
import Dashboard from './pages/Dashboard';
import LiveInspection from './pages/LiveInspection';
import VideoUpload from './pages/VideoUpload';
import Analytics from './pages/Analytics';
import InspectionHistory from './pages/InspectionHistory';
import Settings from './pages/Settings';

export const routes = [
  { path: '/', component: Dashboard },
  { path: '/dashboard', component: Dashboard },
  { path: '/live-inspection', component: LiveInspection },
  { path: '/video-upload', component: VideoUpload },
  { path: '/analytics', component: Analytics },
  { path: '/history', component: InspectionHistory },
  { path: '/settings', component: Settings },
];

export default routes;
