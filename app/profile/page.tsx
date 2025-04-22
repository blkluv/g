'use client';

import React, { useEffect, useState } from 'react';
import useApp from '@/hooks/useApp';
import { useRouter } from 'next/navigation';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Landmark } from '@/hooks/useApp';

// Achievement tier configuration
const ACHIEVEMENTS = [
  { id: 1, icon: '🏆', title: 'Scout', threshold: 1 },
  { id: 2, icon: '⭐', title: 'Explorer', threshold: 5 },
  { id: 3, icon: '🌍', title: 'Globetrotter', threshold: 15 },
  { id: 4, icon: '🔭', title: 'Pathfinder', threshold: 30 },
  { id: 5, icon: '🏅', title: 'Master Scout', threshold: 50 }
];

export default function Profile() {
  const { account, getOwnedLandmarks, getTokenURIsByOwner } = useApp();
  const router = useRouter();
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [uris, setUris] = useState<string[]>([]);
  const [userStats, setUserStats] = useState({
    level: 0,
    title: 'New Explorer',
    unlockedAchievements: [] as typeof ACHIEVEMENTS[number][]
  });

  // Calculate level and achievements based on landmarks
  const calculateStats = (landmarkCount: number) => {
    const level = Math.floor(Math.log2(landmarkCount + 1));
    const titles = ['New Explorer', 'Adventurer', 'Voyager', 'Trailblazer', 'Legend'];
    const title = titles[Math.min(level, titles.length - 1)];
    
    const unlocked = ACHIEVEMENTS.filter(a => landmarkCount >= a.threshold);
    
    return { level, title, unlockedAchievements: unlocked };
  };

  // Fetch user data
  useEffect(() => {
    const fetchData = async () => {
      if (account) {
        const [ownedLandmarks, tokenUris] = await Promise.all([
          getOwnedLandmarks(),
          getTokenURIsByOwner()
        ]);
        
        setLandmarks(ownedLandmarks);
        setUris(tokenUris);
        setUserStats(calculateStats(ownedLandmarks.length));
      }
    };
    
    fetchData();
  }, [account, getOwnedLandmarks, getTokenURIsByOwner]);

  // Generate initials from wallet address
  const getInitials = (addr: string | null) => {
    if (!addr) return 'EX';
    return `${addr.substring(2, 4).toUpperCase()}`;
  };

  // Format wallet address for display
  const formatAddress = (addr: string | null) => {
    if (!addr) return 'Anonymous Explorer';
    return `${addr.substring(0, 6)}...${addr.substring(38)}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="relative max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white my-6">Explorer Profile</h1>
        <div className="space-y-6 h-7/12 overflow-y-auto pr-2">
          {/* Dynamic Profile Header */}
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
              <span className="text-2xl text-white">
                {getInitials(account)}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {formatAddress(account)}
              </h2>
              <p className="text-gray-400">
                {userStats.title} • Level {userStats.level}
              </p>
              <p className="text-sm text-purple-400 mt-1">
                {landmarks.length} Landmarks Discovered
              </p>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Achievements</h3>
            <div className="grid grid-cols-3 gap-4">
              {userStats.unlockedAchievements.map((achievement) => (
                <div key={achievement.id} className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center mb-2">
                    <span className="text-purple-500">{achievement.icon}</span>
                  </div>
                  <span className="text-sm text-gray-400">{achievement.title}</span>
                </div>
              ))}
              
              {/* Placeholder for locked achievements */}
              {ACHIEVEMENTS.filter(a => !userStats.unlockedAchievements.some(u => u.id === a.id))
                .map(achievement => (
                  <div key={achievement.id} className="flex flex-col items-center opacity-40">
                    <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mb-2">
                      <span className="text-gray-500">🔒</span>
                    </div>
                    <span className="text-sm text-gray-500">{achievement.title}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* NFT Gallery */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Explorer Badges</h3>
            {uris.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No badges minted yet</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {uris.map((item, i) => (
                  <div key={`nft-${i}`} className="aspect-square rounded-lg bg-gray-700 flex items-center justify-center overflow-hidden">
                    <img 
                      src={item} 
                      width={200} 
                      height={200} 
                      alt="Explorer badge" 
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Landmark Management */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">Discovered Landmarks</h2>
              <button
                onClick={() => router.push('/profile/add-landmark')}
                className="flex items-center space-x-2 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                aria-label="Add new landmark"
              >
                <PlusIcon className="w-5 h-5" />
                <span className="sr-only">Add Landmark</span>
              </button>
            </div>
            
            {landmarks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No landmarks discovered yet</p>
                <button
                  onClick={() => router.push('/map')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Start Exploring
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {landmarks.map((landmark) => (
                  <div key={landmark.id} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
                    <div className="flex items-start space-x-4">
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={landmark.imageUri}
                          alt={landmark.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">{landmark.name}</h3>
                        <p className="text-gray-400 text-sm mt-1">
                          Coordinates: {landmark.lat.toFixed(4)}, {landmark.lng.toFixed(4)}
                        </p>
                        <p className="text-gray-400 text-sm">Path Segment: #{landmark.pathIndex}</p>
                        <p className="text-purple-400 text-xs mt-2">
                          Discovered on: {new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}