'use client';

import React, { useState, useRef } from 'react';
import useApp from '@/hooks/useApp';
import { useRouter } from 'next/navigation';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { useLocation } from '@/hooks/useLocation';

export default function AddLandmark() {
  const { account, registerLandmark } = useApp();
  const { latitude, longitude } = useLocation();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pathIndex, setPathIndex] = useState<number>(0);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async () => {
    if (!account || !name || !image) return;

    try {
      await registerLandmark(name, image, latitude, longitude, pathIndex);
      router.push('/profile');
    } catch (error) {
      console.error('Error registering landmark:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="relative max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white my-6">Add Landmark</h1>
        <div className="space-y-6 h-[calc(100vh-16rem)] overflow-y-auto pr-2">
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Landmark Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter landmark name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 h-32 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter landmark description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Landmark Image
                </label>
                <div className="flex flex-col items-center space-y-4 ">
                  <div className="w-full h-52 py-2 px-4 bg-gray-700 rounded-lg flex items-center justify-center">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-gray-400">No image</span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 cursor-pointer"
                  >
                    Upload Image
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Path Index
                </label>
                <input
                  type="number"
                  value={pathIndex}
                  onChange={(e) => setPathIndex(parseInt(e.target.value))}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter path index"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!account || !name || !image}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Landmark
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 