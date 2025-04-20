'use client';

import React, { useRef, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { AppEnvironment } from "@/hooks/useApp";

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const { account, visitLandmark } = useContext(AppEnvironment);
  const [isCaptured, setIsCaptured] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      startCamera();
    }
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      const imageSrc = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageSrc);
      setIsCaptured(true);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const retake = () => {
    setCapturedImage(null);
    setIsCaptured(false);
    startCamera();
  };

  const saveAndClose = async () => {
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    if (capturedImage) {
      try {
        setIsLoading(true);
        setError(null);
        
        // Convert base64 to File object
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        const file = new File([blob], 'visit.jpg', { type: 'image/jpeg' });

        // Get challenge ID from URL or state
        const challengeId = 0; // You'll need to pass this from the previous page
        
        await visitLandmark(challengeId, file);
        router.back();
      } catch (err) {
        setError('Failed to record visit. Please try again.');
        console.error('Failed to record visit:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="relative h-full w-full bg-black">
      {/* Error message */}
      {error && (
        <div className="absolute top-20 left-4 right-4 bg-red-600/90 backdrop-blur-sm p-4 rounded-lg shadow-lg z-50">
          <p className="text-white">{error}</p>
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="text-white">Minting NFT...</div>
        </div>
      )}

      {/* Close Button */}
      <button
        onClick={() => {
          stopCamera();
          router.back();
        }}
        className="absolute top-5 right-3 z-10 p-1 rounded-full bg-gray-900/30"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>

      {/* Camera Preview */}
      <div className="relative h-full w-full">
        {!isCaptured ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
          </>
        ) : (
          <div className="h-full">
            <img 
              src={capturedImage || ''} 
              alt="Captured" 
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Camera Controls */}
        <div className="absolute bottom-12 inset-x-0 pb-10 flex items-center justify-center space-x-6">
          {!isCaptured ? (
            <button
              onClick={capture}
              className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center"
            >
              <div className="w-13 h-13 rounded-full bg-white" />
            </button>
          ) : (
            <>
              <button
                onClick={retake}
                className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              <button
                onClick={saveAndClose}
                className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white"
              >
                <CheckIcon className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 