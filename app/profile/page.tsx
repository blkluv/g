'use client';

import React, { useEffect, useState } from 'react';
import useApp from '@/hooks/useApp';
import { useRouter } from 'next/navigation';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Landmark } from '@/hooks/useApp';

export default function Profile() {
  const { account, getOwnedLandmarks, getTokenURIsByOwner } = useApp();
  const router = useRouter();
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);

  const [uris, setUris] = useState<string[]>([])

  useEffect(() => {
    if (account) {
      (async function () {
        setUris(await getTokenURIsByOwner());
      })()
    }
  }, [account])

  useEffect(() => {
    const fetchLandmarks = async () => {
      if (account) {
        const userLandmarks = await getOwnedLandmarks();
        setLandmarks(userLandmarks);
      }
    };
    fetchLandmarks();
  }, [account, getOwnedLandmarks]);

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="relative max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white my-6">Profile</h1>
        <div className="space-y-6 h-7/12 overflow-y-auto pr-2">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center">
              <span className="text-2xl text-white">SN</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Saif Nasir</h2>
              <p className="text-gray-400">Level 5 Explorer</p>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Achievements</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center mb-2">
                  <span className="text-purple-500">🏆</span>
                </div>
                <span className="text-sm text-gray-400">10 Finds</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center mb-2">
                  <span className="text-purple-500">⭐</span>
                </div>
                <span className="text-sm text-gray-400">Pro Hunter</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center mb-2">
                  <span className="text-purple-500">🎯</span>
                </div>
                <span className="text-sm text-gray-400">Accurate</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Recent NFTs</h3>
            <div className="grid grid-cols-2 gap-4">
              {uris.map((item, i) => (
                <div key={`nft-${i}`} className="aspect-square rounded-lg bg-gray-700 flex items-center justify-center overflow-hidden">
                  <img src={item} width={200} height={200} alt="nft" className="" />
                </div>
              ))}
            </div>
          </div>

          {/* Your Landmarks */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">Your Landmarks</h2>
              <button
                onClick={() => router.push('/profile/add-landmark')}
                className="flex items-center space-x-2 bg-purple-600 text-white px-2 py-2 rounded-lg hover:bg-purple-700"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
            {landmarks.length === 0 ? (
              <p className="text-gray-400">No landmarks added yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {landmarks.map((landmark) => (
                  <div key={landmark.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-24 h-24 rounded-lg overflow-hidden">
                        <img
                          src={landmark.imageUri}
                          alt={landmark.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{landmark.name}</h3>
                        <p className="text-gray-400 text-sm mt-1">
                          Location: {landmark.lat.toFixed(6)}, {landmark.lng.toFixed(6)}
                        </p>
                        <p className="text-gray-400 text-sm">Path Index: {landmark.pathIndex}</p>
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