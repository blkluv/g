'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MapIcon,
  UserIcon,
  TrophyIcon,
  Cog6ToothIcon,
  CameraIcon,
} from '@heroicons/react/24/outline';

const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const leftNavItems = [
    { href: '/', icon: MapIcon, label: 'Map' },
    { href: '/profile', icon: UserIcon, label: 'Profile' },
  ];

  const rightNavItems = [
    { href: '/leaderboard', icon: TrophyIcon, label: 'Leaderboard' },
    { href: '/settings', icon: Cog6ToothIcon, label: 'Settings' },
  ];

  const renderNavItem = (item: { href: string; icon: any; label: string }) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex flex-col items-center justify-center w-full h-full ${
          isActive ? 'text-purple-500' : 'text-gray-400'
        } hover:text-purple-500 transition-colors`}
      >
        <Icon className={`w-6 h-6 ${isActive ? 'text-purple-500' : 'text-gray-400'}`} />
        <span className={`text-xs mt-1 ${isActive ? 'text-purple-500' : 'text-gray-400'}`}>
          {item.label}
        </span>
      </Link>
    );
  };

  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-gray-800/80 backdrop-blur-md border-t border-gray-700/50">
      <div className="flex items-center justify-between h-20 px-3">
        {/* Left side navigation items */}
        <div className="flex-2 flex justify-around">
          {leftNavItems.map(renderNavItem)}
        </div>

        {/* Center Camera Button */}
        <div className="flex-1 flex justify-center">
          <Link
            href="/camera"
            className="w-14 h-14 mb-2 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors"
          >
            <CameraIcon className="w-8 h-8 mb-1 text-white" />
          </Link>
        </div>

        {/* Right side navigation items */}
        <div className="flex-2 flex justify-around">
          {rightNavItems.map(renderNavItem)}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav; 