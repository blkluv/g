import { Challenge } from '@/components/Map';

export const initialLandmarks: Challenge[] = [
  {
    id: "1",
    coordinates: [-0.1276, 51.5074], // London Eye
    title: "London Eye",
    description: "Take a photo with the iconic London Eye in the background",
    type: "photo",
    points: 100,
    owner: "0x0000000000000000000000000000000000000000",
    imageUri: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad",
    pathIndex: 1
  },
  {
    id: "2",
    coordinates: [-0.1246, 51.5007], // Big Ben
    title: "Big Ben",
    description: "Capture the famous clock tower in your photo",
    type: "photo",
    points: 150,
    owner: "0x0000000000000000000000000000000000000000",
    imageUri: "https://images.unsplash.com/photo-1529655683829-2f9f7062e8e9",
    pathIndex: 2
  },
  {
    id: "3",
    coordinates: [-0.1281, 51.5080], // London Bridge
    title: "London Bridge",
    description: "Take a photo on or near the London Bridge",
    type: "photo",
    points: 120,
    owner: "0x0000000000000000000000000000000000000000",
    imageUri: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d",
    pathIndex: 3
  },
  {
    id: "4",
    coordinates: [-0.1401, 51.5136], // Covent Garden
    title: "Covent Garden",
    description: "Capture the vibrant atmosphere of Covent Garden",
    type: "photo",
    points: 80,
    owner: "0x0000000000000000000000000000000000000000",
    imageUri: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad",
    pathIndex: 4
  },
  {
    id: "5",
    coordinates: [-0.0763, 51.5054], // Tower of London
    title: "Tower of London",
    description: "Take a photo with the historic Tower of London",
    type: "photo",
    points: 200,
    owner: "0x0000000000000000000000000000000000000000",
    imageUri: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d",
    pathIndex: 5
  }
]; 