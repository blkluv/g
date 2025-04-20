'use client';

import React from 'react';

const leaderboardData = [
  { rank: 1, name: 'Alex Thompson', points: 2500, avatar: '🥇' },
  { rank: 2, name: 'Maria Garcia', points: 2350, avatar: '🥈' },
  { rank: 3, name: 'John Smith', points: 2200, avatar: '🥉' },
  { rank: 4, name: 'Sarah Wilson', points: 2100, avatar: '👤' },
  { rank: 5, name: 'David Brown', points: 2000, avatar: '👤' },
  { rank: 6, name: 'Emma Davis', points: 1950, avatar: '👤' },
  { rank: 7, name: 'Michael Lee', points: 1900, avatar: '👤' },
  { rank: 8, name: 'Lisa Anderson', points: 1850, avatar: '👤' },
];

export default function Leaderboard() {
  return (
    <div className="relative h-full w-full bg-gray-900 p-3">
      <h1 className="text-2xl font-bold text-white my-6">Leaderboard</h1>
      
      <div className="space-y-4">
        {leaderboardData.map((player) => (
          <div 
            key={player.rank}
            className="flex items-center bg-gray-800 rounded-lg p-4 space-x-4"
          >
            <div className="w-8 text-center font-semibold text-gray-400">
              #{player.rank}
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center">
              <span className="text-xl">{player.avatar}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-medium">{player.name}</h3>
              <p className="text-sm text-gray-400">{player.points} points</p>
            </div>
            {player.rank <= 3 && (
              <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <span className="text-yellow-500 text-lg">
                  {player.rank === 1 ? '👑' : '⭐'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 