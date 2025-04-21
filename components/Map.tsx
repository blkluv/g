'use client';

import React, { useEffect, useRef, useContext } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { mapStyles } from '../app/types/map';
import { AppEnvironment } from '@/hooks/useApp';
import { useLocation } from '@/hooks/useLocation';


export interface Challenge {
  id: string;
  coordinates: [number, number];
  title: string;
  description: string;
  type: 'photo' | 'location';
  points: number;
  distance?: number;
  // blockchain-related properties
  owner: string;
  imageUri: string;
  pathIndex: number;
}

interface MapProps {
  challenges: Challenge[];
  onChallengeSelect: (challenge: Challenge) => void;
  activeChallenge?: Challenge | null;
  onClick?: (e: mapboxgl.MapMouseEvent) => void;
}

export default function Map({ challenges, onChallengeSelect, activeChallenge, onClick }: MapProps) {
  const mapRef = useRef<mapboxgl.Map | undefined>(undefined);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const userMarkerRef = useRef<mapboxgl.Marker | undefined>(undefined);
  const directionsRef = useRef<any>(null);
  const { account, hasUserVisited } = useContext(AppEnvironment);
  const { latitude, longitude } = useLocation();

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || !process.env.NEXT_PUBLIC_MAPBOX_TOKEN) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    
    // Get the selected style from localStorage
    const selectedStyle = typeof window !== 'undefined' 
      ? localStorage.getItem('mapStyle') || 'dark'
      : 'dark';
    
    // Find the style URL from our predefined styles
    const styleUrl = mapStyles.find(style => style.id === selectedStyle)?.url || 'mapbox://styles/mapbox/dark-v11';

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: styleUrl,
      center: [longitude, latitude],
      zoom: 15,
    });

    mapRef.current = map;

    // Add click handler if provided
    if (onClick) {
      map.on('click', onClick);
    }

    // Add initial user marker
    const el = document.createElement('div');
    el.className = 'w-4 h-4 bg-blue-500 rounded-full border-2 border-white';
    userMarkerRef.current = new mapboxgl.Marker(el)
      .setLngLat([longitude, latitude])
      .addTo(map);

    return () => {
      if (onClick) {
        map.off('click', onClick);
      }
      map.remove();
    };
  }, [onClick]);

  // Update map center and user marker when location changes
  useEffect(() => {
    if (mapRef.current && userMarkerRef.current) {
      mapRef.current.setCenter([longitude, latitude]);
      userMarkerRef.current.setLngLat([longitude, latitude]);

      // If there's an active location challenge, update directions
      if (activeChallenge?.type === 'location') {
        updateDirections([longitude, latitude], activeChallenge.coordinates);
      }
    }
  }, [latitude, longitude, activeChallenge]);

  // Handle challenges
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add challenge markers
    challenges.forEach(async (challenge) => {
      const visited = account ? await hasUserVisited(Number(challenge.id)) : false;
      
      const el = document.createElement('div');
      el.className = `w-8 h-8 ${
        visited ? 'bg-green-600' : (challenge.type === 'photo' ? 'bg-purple-600' : 'bg-green-600')
      } rounded-full flex items-center justify-center cursor-pointer shadow-lg`;
      
      const icon = document.createElement('div');
      icon.className = 'w-4 h-4 text-white';
      icon.innerHTML = challenge.type === 'photo' 
        ? '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>';
      el.appendChild(icon);

      if (mapRef.current) {
        const marker = new mapboxgl.Marker(el)
          .setLngLat(challenge.coordinates)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div class="p-2">
                  <h3 class="font-bold text-lg">${challenge.title}</h3>
                  <p class="text-sm text-gray-300">${challenge.description}</p>
                  <div class="mt-2 flex items-center justify-between">
                    <span class="text-yellow-500 font-semibold">${challenge.points}pts</span>
                    ${visited ? '<span class="text-green-500 text-sm">Visited</span>' : ''}
                  </div>
                </div>
              `)
          )
          .addTo(mapRef.current);

        el.addEventListener('click', () => onChallengeSelect(challenge));
        markersRef.current[challenge.id] = marker;
      }
    });

    return () => {
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};
    };
  }, [challenges, onChallengeSelect, account, hasUserVisited]);

  const updateDirections = async (start: [number, number], end: [number, number]) => {
    if (!mapRef.current) return;

    try {
      // Remove existing directions
      removeDirections();

      // Get directions from Mapbox Directions API
      const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/walking/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
      );
      const json = await query.json();
      const data = json.routes[0];
      const route = data.geometry.coordinates;

      // Add the route to the map
      const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route
        }
      };

      // If the route already exists on the map, we'll update it
      if (mapRef.current.getSource('route')) {
        (mapRef.current.getSource('route') as mapboxgl.GeoJSONSource).setData(geojson);
      } else {
        // Otherwise, we'll make a new route
        mapRef.current.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: geojson
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3b82f6',
            'line-width': 4,
            'line-opacity': 0.75
          }
        });
      }

      // Fit bounds to show both points
      const bounds = new mapboxgl.LngLatBounds()
        .extend(start)
        .extend(end);

      mapRef.current.fitBounds(bounds, {
        padding: 50
      });

      directionsRef.current = true;
    } catch (error) {
      console.error('Error fetching directions:', error);
    }
  };

  const removeDirections = () => {
    if (!mapRef.current || !directionsRef.current) return;

    if (mapRef.current.getLayer('route')) {
      mapRef.current.removeLayer('route');
    }
    if (mapRef.current.getSource('route')) {
      mapRef.current.removeSource('route');
    }

    directionsRef.current = null;
  };

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
} 
