'use client';

import React, { useState, useContext } from 'react';
import { BellIcon, GlobeAltIcon, ShieldCheckIcon, UserIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { mapStyles } from '../types/map';
import { AppEnvironment } from '@/hooks/useApp';

const settingsGroups = [
  {
    title: 'Account',
    items: [
      { icon: UserIcon, label: 'Profile Information', value: 'Edit' },
      { icon: GlobeAltIcon, label: 'Language', value: 'English' },
    ]
  },
  {
    title: 'Notifications',
    items: [
      { icon: BellIcon, label: 'Push Notifications', value: 'On' },
      { icon: BellIcon, label: 'Email Notifications', value: 'Off' },
    ]
  },
  {
    title: 'Privacy',
    items: [
      { icon: ShieldCheckIcon, label: 'Location Services', value: 'On' },
      { icon: ShieldCheckIcon, label: 'Data Sharing', value: 'Off' },
    ]
  }
];

export default function Settings() {
  const [selectedStyle, setSelectedStyle] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mapStyle') || 'dark';
    }
    return 'dark';
  });
  const { account, disconnectAccount } = useContext(AppEnvironment);

  const handleStyleChange = (styleId: string) => {
    setSelectedStyle(styleId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mapStyle', styleId);
    }
  };

  const handleSignOut = async () => {
    await disconnectAccount();
  };

  return (
    <div className="relative h-full w-full bg-gray-900 ">
      <div className="flex items-center space-x-2 p-3">
        <Cog6ToothIcon className="w-6 h-6 text-white" />
        <h1 className="text-2xl font-bold text-white my-6">Settings</h1>
      </div>

      <div className="h-7/12 overflow-y-auto px-3">
        <div className="space-y-6 pb-20">
          {settingsGroups.map((group) => (
            <div key={group.title} className="space-y-2">
              <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                {group.title}
              </h2>
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                {group.items.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={item.label}
                      className={`flex items-center justify-between p-4 ${
                        index !== group.items.length - 1 ? 'border-b border-gray-700' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-gray-400" />
                        <span className="text-white">{item.label}</span>
                      </div>
                      <span className="text-gray-400">{item.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="space-y-2">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Map Style</h2>
            <div className="grid grid-cols-2 gap-3">
              {mapStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => handleStyleChange(style.id)}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    selectedStyle === style.id
                      ? 'border-purple-500 bg-gray-800'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className={`w-full h-24 rounded ${style.preview} mb-2`} />
                  <p className="text-white text-center">{style.name}</p>
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleSignOut}
            className="w-full bg-red-600/20 text-red-500 py-3 rounded-lg mt-6 hover:bg-red-600/30 transition-colors"
          >
            Disconnect Wallet
          </button>
        </div>
      </div>
    </div>
  );
} 