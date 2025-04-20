'use client';

import React, { useState, useEffect, useContext } from 'react';
import Map from '@/components/Map';
import { AppEnvironment } from '@/hooks/useApp';

import { initialLandmarks } from './data/landmarks';
import { ArrowLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useLocation } from '@/hooks/useLocation';

export default function Home() {
  const { account, getNearbyLandmarkData, visitLandmark, hasUserVisited } = useContext(AppEnvironment);
  const { latitude, longitude, isTestLocation, setTestLocation } = useLocation();
  const [selectedChallenge, setSelectedChallenge] = useState<typeof initialLandmarks[0] | null>(null);
  const [showNearby, setShowNearby] = useState(false);
  const [nearbyLandmarks, setNearbyLandmarks] = useState(initialLandmarks);

  useEffect(() => {
    const fetchLandmarks = async (lat: number, lng: number) => {
      try {
        const landmarks = await getNearbyLandmarkData(lat, lng);
        // Map landmarks to challenges format
        const challenges = landmarks.map(landmark => ({
          id: landmark.id,
          coordinates: [landmark.lng, landmark.lat] as [number, number],
          title: landmark.name,
          description: `Visit ${landmark.name} and take a photo`,
          type: 'photo' as const,
          points: 100,
          owner: landmark.owner,
          imageUri: landmark.imageUri,
          pathIndex: landmark.pathIndex
        }));
        setNearbyLandmarks(challenges);
      } catch (error) {
        console.error('Error fetching landmarks:', error);
        // If there's an error, use the initial landmarks
        setNearbyLandmarks(initialLandmarks);
      }
    };

    // Always fetch landmarks when location changes
    console.log(latitude, longitude)
    fetchLandmarks(latitude, longitude);
  }, [getNearbyLandmarkData, latitude, longitude]);

  const handleChallengeSelect = (challenge: typeof initialLandmarks[0]) => {
    setSelectedChallenge(challenge);
  };

  return (
    <div className="relative h-full w-full bg-gray-900 p-3">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white my-6">Crumbs</h1>
      </div>

      {/* Map Container */}
      <div className="absolute inset-2 pt-16 pb-28">
        <Map
          challenges={nearbyLandmarks}
          onChallengeSelect={handleChallengeSelect}
          activeChallenge={selectedChallenge}
        />
      </div>

      {/* Nearby Challenges */}
      <div
        className={`absolute bottom-20 left-2 right-2 h-[33vh] bg-gray-800/90 backdrop-blur-sm rounded-t-2xl transition-transform duration-300 ${showNearby ? 'translate-y-0' : 'translate-y-[calc(100%-2rem)]'
          }`}
      >
        {/* Drag Handle */}
        <div className="sticky top-0 left-0 right-0 bg-gray-800/90 backdrop-blur-sm pt-3 pb-2 rounded-t-2xl z-10">
          <div
            className="h-1.5 w-12 bg-gray-600 rounded-full mx-auto cursor-pointer"
            onClick={() => setShowNearby(!showNearby)}
          />
        </div>

        <div className="p-4 max-h-[33vh] overflow-y-auto">
          <h2 className="text-lg font-semibold text-white mb-4">Nearby Challenges</h2>
          <div className="space-y-3">
            {nearbyLandmarks.map((challenge, index) => (
              <div
                key={index}
                className="bg-gray-700/50 rounded-lg p-4 cursor-pointer hover:bg-gray-700/70 transition-colors"
                onClick={() => handleChallengeSelect(challenge)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-white font-medium">{challenge.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">{challenge.description}</p>
                  </div>
                  <span className="text-yellow-500 font-semibold">{challenge.points}pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Challenge Popup */}
      {selectedChallenge && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-white">{selectedChallenge.title}</h2>
              <button
                onClick={() => setSelectedChallenge(null)}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <p className="text-gray-300 mb-4">{selectedChallenge.description}</p>

            <div className="flex justify-between items-center mb-6">
              <span className="text-yellow-500 font-semibold">{selectedChallenge.points}pts</span>
              <span className="text-gray-400 text-sm">Photo Challenge</span>
            </div>

            {account ? (
              <button
                onClick={() => {
                  // Handle starting the challenge
                  window.location.href = '/camera';
                }}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Start Challenge
              </button>
            ) : (
              <button
                onClick={() => {
                  // Handle connecting wallet
                  window.location.href = '/admin';
                }}
                className="w-full bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Connect Wallet to Start
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}