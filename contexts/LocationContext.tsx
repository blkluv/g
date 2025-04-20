'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';

// Define the type for context value
interface LocationContextType {
  latitude: number;
  longitude: number;
  isTestLocation: boolean;
  setTestLocation: (enabled: boolean) => void;
}

// Default values
const defaultLocation = {
  latitude: 51.5,  // London
  longitude: -0.12
};

// Create context with default values
export const LocationContext = createContext<LocationContextType>({
  latitude: defaultLocation.latitude,
  longitude: defaultLocation.longitude,
  isTestLocation: true,
  setTestLocation: () => {}
});

// Provider component
export function LocationProvider({ children }: { children: ReactNode }) {
  const [isTestLocation, setIsTestLocation] = useState(true);
  const [location, setLocation] = useState(defaultLocation);

  useEffect(() => {
    if (!isTestLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsTestLocation(true);
        }
      );
    } else {
      setLocation(defaultLocation);
    }
  }, [isTestLocation]);

  const value = {
    latitude: location.latitude,
    longitude: location.longitude,
    isTestLocation,
    setTestLocation: setIsTestLocation
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}