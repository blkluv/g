'use client';

import { AppEnvironment } from '@/hooks/useApp';
import Image from 'next/image';
import React, { useContext, useEffect, useMemo, useState } from 'react';

export default function Profile() {

  const { account, getTokenURIsByOwner } = useContext(AppEnvironment)

  const [uris, setUris] = useState<string[]>([])

  useEffect(() => {
    if (account) {
      (async function () {
        setUris(await getTokenURIsByOwner());
      })()
    }
  }, [account])

  return (
    <div className="relative h-full w-full bg-gray-900 p-3">
      <h1 className="text-2xl font-bold text-white my-6">Profile</h1>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center">
            <span className="text-2xl text-white">SN</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Saif Nasir</h2>
            <p className="text-gray-400">Level 5 Explorer</p>
          </div>
        </div>

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
      </div>
    </div>
  );
} 