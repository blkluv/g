'use client';

import React from 'react';
import Image from 'next/image';
import { AppEnvironment } from '@/hooks/useApp';
import { useContext } from 'react';

export default function WalletPopup() {
  const { account, connectAccount, error } = useContext(AppEnvironment);

  if (account) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4">
        <div className="flex flex-col items-center gap-4">
          <Image 
            src="/metamask.svg" 
            width={64} 
            height={64} 
            alt="MetaMask" 
            className="mb-2"
          />
          <h2 className="text-white text-xl font-bold text-center">
            Connect Your Wallet
          </h2>
          <p className="text-gray-300 text-center">
            Please connect your MetaMask wallet to interact with landmarks and earn NFTs.
          </p>
          {error && (
            <p className="text-red-400 text-sm text-center">
              {error}
            </p>
          )}
          <button
            onClick={connectAccount}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    </div>
  );
} 