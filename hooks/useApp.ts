"use client"

import { connect, getAccount, getEnsName, injected, readContract, simulateContract, waitForTransactionReceipt, writeContract } from '@wagmi/core'
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
  getNearbyLandmarkData: (lat: number, lng: number) => Promise<Landmark[]>;
  getVisitedLandmarks: (user?: string) => Promise<Landmark[]>;
  getTokenURIsByOwner: (user?: string) => Promise<string[]>;
  visitLandmark: (landmarkId: number, image: File) => Promise<void>;
  hasUserVisited: (landmarkId: number) => Promise<boolean>;
  registerLandmark: (name: string, image: File, lat: number, lng: number, pathIndex: number) => Promise<void>
}

export const AppEnvironment = createContext<IAppEnvironment>({
  account: null,
  connectAccount: async () => null,
  hasUserVisited: async () => false,
  getNearbyLandmarkData: async () => [],
  getVisitedLandmarks: async () => [],
  getTokenURIsByOwner: async () => [],
  visitLandmark: async () => {},
  registerLandmark: async () => {},
})

export default function useApp(): IAppEnvironment {
  const [account, setAccount] = useState<string | null>(null)

  // opens wallet connection screen
  async function connectAccount() {
    const result = await connect(config, { connector: injected() });
    if (result) {
      setAccount(result.accounts[0])
      return result.accounts[0]
    }
    return null
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
    image: File
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

  // useEffect(() => {
  //   console.log(account);
  // }, [account])

  return {
    account: account,
    connectAccount,
    getNearbyLandmarkData,
    visitLandmark,
    registerLandmark,
    hasUserVisited,
    getVisitedLandmarks,
    getTokenURIsByOwner
  }
}