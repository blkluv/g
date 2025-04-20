"use client"

import { connect, disconnect, getAccount, getEnsName, injected, readContract, simulateContract, waitForTransactionReceipt, writeContract } from '@wagmi/core'
import { config } from '@/config'
import { createContext, useEffect, useState } from 'react'

import LandmarkRegistryAbi from '@/abis/LandmarkRegistry.json'
import VisitTokenAbi from '@/abis/VisitToken.json'

// const ensName = await getEnsName(config, { address })

export interface Landmark {
  id: string,
  owner: string,
  name: string,
  lat: number,
  lng: number,
  imageUri: string,
  pathIndex: number
}

interface IAppEnvironment {
  account: string | null;
  connectAccount: () => Promise<string | null>;
  disconnectAccount: () => Promise<void>;
  getNearbyLandmarkData: (lat: number, lng: number) => Promise<Landmark[]>;
  getVisitedLandmarks: (user?: string) => Promise<Landmark[]>;
  getOwnedLandmarks: (user?: string) => Promise<Landmark[]>;
  getTokenURIsByOwner: (user?: string) => Promise<string[]>;
  visitLandmark: (landmarkId: number, image: File, userLat?: number, userLng?: number) => Promise<void>;
  hasUserVisited: (landmarkId: number) => Promise<boolean>;
  registerLandmark: (name: string, image: File, lat: number, lng: number, pathIndex: number) => Promise<void>;
  verifyLocation: (landmarkId: number, userLat: number, userLng: number) => Promise<boolean>;
  error: string | null;
}

export const AppEnvironment = createContext<IAppEnvironment>({
  account: null,
  connectAccount: async () => null,
  disconnectAccount: async () => {},
  hasUserVisited: async () => false,
  getNearbyLandmarkData: async () => [],
  getVisitedLandmarks: async () => [],
  getOwnedLandmarks: async () => [],
  getTokenURIsByOwner: async () => [],
  visitLandmark: async () => {},
  registerLandmark: async () => {},
  verifyLocation: async () => false,
  error: null,
})

export default function useApp(): IAppEnvironment {
  const [account, setAccount] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Check for existing connection on mount
  useEffect(() => {
    async function checkConnection() {
      try {
        const currentAccount = await getAccount(config);
        if (currentAccount.address) {
          setAccount(currentAccount.address);
        }
      } catch (err) {
        console.error('Error checking connection:', err);
      }
    }
    
    checkConnection();
  }, []);

  // opens wallet connection screen
  async function connectAccount() {
    try {
      setError(null);
      const result = await connect(config, { connector: injected() });
      
      if (!result) {
        throw new Error('Failed to connect to MetaMask');
      }

      if (!result.accounts || result.accounts.length === 0) {
        throw new Error('No accounts found in MetaMask');
      }

      const connectedAccount = result.accounts[0];
      setAccount(connectedAccount);
      return connectedAccount;
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
      return null;
    }
  }
  
  async function disconnectAccount() {
    try {
      setError(null);
      setAccount(null);
      await disconnect(config);
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('wagmi.wallet');
        localStorage.removeItem('wagmi.connected');
      }
    } catch (err) {
      console.error('Wallet disconnection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to disconnect wallet');
    }
  }

  // register new landmark

  async function registerLandmark(
    name: string,
    image: File,
    lat: number, // in degrees
    lng: number,
    pathIndex: number
  ) {
    const data = new FormData();
    data.set("file", image);

    const response = await fetch("/api/files", {
      method: "POST",
      body: data,
    });

    if (!response.ok) {
      console.error("Failed to upload image!")
      return;
    }

    const { url: imageUri } = await response.json();

    const scaledLat = Math.round(lat * 1_000_000)
    const scaledLng = Math.round(lng * 1_000_000)
  
    const { request } = await simulateContract(config, {
      abi: LandmarkRegistryAbi.abi,
      address: process.env.NEXT_PUBLIC_LANDMARK_REG_ADDR as `0x${string}`,
      functionName: 'registerLandmark',
      args: [name, imageUri, scaledLat, scaledLng, pathIndex],
    })
  
    const hash = await writeContract(config, request)
  
    console.log('Transaction hash:', hash)
    const receipt = await waitForTransactionReceipt(config, { hash })
    console.log('Visit minted, tx block:', receipt.blockNumber)
  }

  // mark visit ; mint nft

  async function visitLandmark(
    landmarkId: number,
    image: File,
    userLat?: number,
    userLng?: number
  ) {
    if (!account) return;

    try {
      // Verify location if coordinates are provided
      if (userLat !== undefined && userLng !== undefined) {
        const isAtLocation = await verifyLocation(landmarkId, userLat, userLng);
        if (!isAtLocation) {
          throw new Error('You must be at the landmark location to visit it');
        }
      }

      const data = new FormData();
      data.set("file", image);
      const response = await fetch("/api/files", {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        console.error("Failed to upload image!")
        return;
      }

      const { url: imageUri } = await response.json();

      const { request } = await simulateContract(config, {
        address: process.env.NEXT_PUBLIC_LANDMARK_REG_ADDR as `0x${string}`,
        abi: LandmarkRegistryAbi.abi,
        functionName: 'visitLandmark',
        args: [landmarkId, imageUri],
      })
    
      const hash = await writeContract(config, request)

      console.log('Visit minted, tx hash:', hash)
      const receipt = await waitForTransactionReceipt(config, { hash })
      console.log('Visit minted, tx block:', receipt.blockNumber)
    } catch (err) {
      console.error('Error visiting landmark:', err);
      throw err;
    }
  }

  async function getNearbyLandmarkData(
    lat: number,
    lng: number
  ): Promise<Landmark[]> {
    const scaledLat = Math.round(lat * 1_000_000)
    const scaledLng = Math.round(lng * 1_000_000)
  
    const landmarks = await readContract(config, {
      address: process.env.NEXT_PUBLIC_LANDMARK_REG_ADDR  as `0x${string}`,
      abi: LandmarkRegistryAbi.abi,
      functionName: 'getNearbyLandmarks',
      args: [scaledLat, scaledLng],
    }) as any 
  
    const data = landmarks.map((l: any) => {
      return ({
      id: Number(l.id),
      owner: l.owner,
      name: l.name,
      imageUri: l.imageURI,
      lat: Number(l.lat) / 1_000_000,
      lng: Number(l.lng) / 1_000_000,
      pathIndex: l.pathIndex
    })})

    return data
  }

  async function getVisitedLandmarks(user?: string): Promise<Landmark[]> {
    let address = user ?? account;
    if (!address) return [];

    const landmarks = await readContract(config, {
      address: process.env.NEXT_PUBLIC_LANDMARK_REG_ADDR  as `0x${string}`,
      abi: LandmarkRegistryAbi.abi,
      functionName: 'getVisitedLandmarks',
      args: [address],
    }) as any 
  
    const data = landmarks.map((l: any) => {
      return ({
      id: Number(l.id),
      owner: l.owner,
      name: l.name,
      imageUri: l.imageURI,
      lat: Number(l.lat) / 1_000_000,
      lng: Number(l.lng) / 1_000_000,
      pathIndex: l.pathIndex
    })})

    return data
  }

  async function getTokenURIsByOwner(user?: string): Promise<string[]> {
    let address = user ?? account;
    if (!address) return [];

    const uris = await readContract(config, {
      address: process.env.NEXT_PUBLIC_VISIT_TOKEN_ADDR  as `0x${string}`,
      abi: VisitTokenAbi.abi,
      functionName: 'getTokenURIsByOwner',
      args: [address],
    }) as any 
  
    const data = uris.map((u: any) => u as string)
    return data
  }

  async function hasUserVisited(
    landmarkId: number
  ): Promise<boolean> {
    if (!account) return false;

    return await readContract(config, {
      address: process.env.NEXT_PUBLIC_LANDMARK_REG_ADDR  as `0x${string}`,
      abi: LandmarkRegistryAbi.abi,
      functionName: 'hasUserVisited',
      args: [landmarkId, account],
    }) as boolean
  }

  async function verifyLocation(
    landmarkId: number,
    userLat: number,
    userLng: number
  ): Promise<boolean> {
    if (!account) return false;

    try {
      // Get landmark data
      const landmarks = await getNearbyLandmarkData(userLat, userLng);
      const landmark = landmarks.find(l => Number(l.id) === landmarkId);
      
      if (!landmark) return false;

      // Calculate distance between user and landmark
      const R = 6371e3; // Earth's radius in meters
      const φ1 = userLat * Math.PI/180;
      const φ2 = landmark.lat * Math.PI/180;
      const Δφ = (landmark.lat - userLat) * Math.PI/180;
      const Δλ = (landmark.lng - userLng) * Math.PI/180;

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;

      // Check if user is within 50 meters of the landmark
      return distance <= 50;
    } catch (err) {
      console.error('Error verifying location:', err);
      return false;
    }
  }

  async function getOwnedLandmarks(user?: string): Promise<Landmark[]> {
    let address = user ?? account;
    if (!address) return [];

    const landmarks = await readContract(config, {
      address: process.env.NEXT_PUBLIC_LANDMARK_REG_ADDR as `0x${string}`,
      abi: LandmarkRegistryAbi.abi,
      functionName: 'getLandmarksByOwner',
      args: [address],
    }) as any;

    const data = landmarks.map((l: any) => ({
      id: Number(l.id),
      owner: l.owner,
      name: l.name,
      imageUri: l.imageURI,
      lat: Number(l.lat) / 1_000_000,
      lng: Number(l.lng) / 1_000_000,
      pathIndex: l.pathIndex
    }));

    return data;
  }

  return {
    account,
    connectAccount,
    disconnectAccount,
    error,
    getNearbyLandmarkData,
    visitLandmark,
    registerLandmark,
    hasUserVisited,
    getVisitedLandmarks,
    getOwnedLandmarks,
    getTokenURIsByOwner,
    verifyLocation
  }
}