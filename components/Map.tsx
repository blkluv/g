'use client';

import React, { useEffect, useRef, useContext, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { mapStyles } from '../app/types/map';
import { AppEnvironment } from '@/hooks/useApp';
import { useLocation } from '@/hooks/useLocation';

// Mobile performance tweaks
mapboxgl.workerCount = 2;
mapboxgl.maxParallelImageRequests = 4;

export interface Challenge {
  id: string;
  coordinates: [number, number];
  title: string;
  description: string;
  type: 'photo' | 'location';
  points: number;
  distance?: number;
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
  const mapRef = useRef<mapboxgl.Map>();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Record<string, mapboxgl.Marker>>({});
  const userMarkerRef = useRef<mapboxgl.Marker>();
  const directionsRef = useRef<boolean>(false);

  const { account, hasUserVisited } = useContext(AppEnvironment);
  const { latitude, longitude } = useLocation();

  // Monopoly-themed markers
  const emojiMarkers = useRef({
    photo: '📸',
    location: '📍',
    visited: '✅',
    boardwalk: '🎩' // Top hat token
  });

  // Initialize map with Boardwalk as fallback center
  useEffect(() => {
    if (!mapContainerRef.current || !process.env.NEXT_PUBLIC_MAPBOX_TOKEN) return;

    const selectedStyle = typeof window !== 'undefined'
      ? localStorage.getItem('mapStyle') || 'dark'
      : 'dark';

    const styleUrl = mapStyles.find(style => style.id === selectedStyle)?.url || 'mapbox://styles/mapbox/dark-v11';

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: styleUrl,
      center: [-74.4135, 39.3643], // Atlantic City Boardwalk
      zoom: 15,
      interactive: true,
      touchZoomRotate: true,
      trackResize: true,
      antialias: false,
      attributionControl: false,
      preserveDrawingBuffer: true,
      maxTileCacheSize: 20,
    });

    // Mobile event handlers
    map.on('touchstart', (e) => {
      if (e.originalEvent.touches.length > 1) e.preventDefault();
    });

    map.on('error', (e) => {
      console.error('Map error:', e.error);
    });

    mapRef.current = map;

    // Add user marker
    const userEl = document.createElement('div');
    userEl.className = 'text-xl';
    userEl.textContent = '👤';
    userMarkerRef.current = new mapboxgl.Marker(userEl)
      .setLngLat([longitude || -74.4135, latitude || 39.3643]) // Fallback to Boardwalk
      .addTo(map);

    // Add click handler if provided
    if (onClick) map.on('click', onClick);

    return () => {
      if (onClick) map.off('click', onClick);
      map.remove();
    };
  }, [onClick]);

  // Update map center when location changes
  const updateMapCenter = useCallback((lng: number, lat: number) => {
    if (!mapRef.current || !userMarkerRef.current) return;

    mapRef.current.easeTo({
      center: [lng, lat],
      duration: 1000,
      essential: true,
    });

    userMarkerRef.current.setLngLat([lng, lat]);
  }, []);

  useEffect(() => {
    if (latitude && longitude) {
      updateMapCenter(longitude, latitude);
      if (activeChallenge?.type === 'location') {
        updateDirections([longitude, latitude], activeChallenge.coordinates);
      }
    }
  }, [latitude, longitude, activeChallenge, updateMapCenter]);

  // Enhanced marker creation with Monopoly theme
  const createMarker = useCallback((challenge: Challenge, visited: boolean) => {
    const el = document.createElement('div');
    
    if (challenge.title === "Boardwalk") {
      el.className = 'monopoly-marker text-3xl bg-white rounded-full p-2 shadow-lg';
      el.textContent = emojiMarkers.current.boardwalk;
    } else {
      el.className = 'text-2xl cursor-pointer';
      el.textContent = visited 
        ? emojiMarkers.current.visited 
        : challenge.type === 'photo' 
          ? emojiMarkers.current.photo 
          : emojiMarkers.current.location;
      if (visited) el.style.filter = 'grayscale(0.5) opacity(0.8)';
    }

    return el;
  }, []);

  // Render all markers
  useEffect(() => {
    if (!mapRef.current) return;

    const updateMarkers = async () => {
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};

      await Promise.all(challenges.map(async (challenge) => {
        const visited = account ? await hasUserVisited(Number(challenge.id)) : false;
        const markerEl = createMarker(challenge, visited);

        const popupContent = challenge.title === "Boardwalk" 
          ? `
            <div class="monopoly-popup p-2 max-w-xs">
              <h3 class="font-bold text-lg">${challenge.title}</h3>
              <p class="text-sm text-gray-300">${challenge.description}</p>
              <img src="${challenge.imageUri}" class="mt-2 rounded w-full" alt="${challenge.title}">
              <div class="mt-2 flex items-center justify-between">
                <span class="text-yellow-500 font-semibold">${challenge.points}pts</span>
                ${visited ? '<span class="text-green-500 text-sm">Visited</span>' : ''}
              </div>
            </div>
          `
          : `
            <div class="p-2 max-w-xs">
              <h3 class="font-bold text-lg">${challenge.title}</h3>
              <p class="text-sm text-gray-300">${challenge.description}</p>
              <div class="mt-2 flex items-center justify-between">
                <span class="text-yellow-500 font-semibold">${challenge.points}pts</span>
                ${visited ? '<span class="text-green-500 text-sm">Visited</span>' : ''}
              </div>
            </div>
          `;

        const marker = new mapboxgl.Marker(markerEl)
          .setLngLat(challenge.coordinates)
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent))
          .addTo(mapRef.current!);

        markerEl.addEventListener('click', () => onChallengeSelect(challenge));
        markersRef.current[challenge.id] = marker;
      }));
    };

    updateMarkers();

    return () => {
      Object.values(markersRef.current).forEach(marker => marker.remove());
    };
  }, [challenges, onChallengeSelect, account, hasUserVisited, createMarker]);

  // Directions logic (unchanged)
  const updateDirections = useCallback(async (start: [number, number], end: [number, number]) => {
    if (!mapRef.current) return;

    try {
      removeDirections();
      const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/walking/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&overview=simplified&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
      );
      const json = await query.json();
      const route = json.routes?.[0]?.geometry?.coordinates;

      if (route) {
        const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: route }
        };

        if (mapRef.current.getSource('route')) {
          (mapRef.current.getSource('route') as mapboxgl.GeoJSONSource).setData(geojson);
        } else {
          mapRef.current.addLayer({
            id: 'route',
            type: 'line',
            source: { type: 'geojson', data: geojson },
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#3b82f6', 'line-width': 3, 'line-opacity': 0.8 }
          });
        }

        const bounds = new mapboxgl.LngLatBounds().extend(start).extend(end);
        mapRef.current.fitBounds(bounds, { padding: 50, maxZoom: 15 });
      }
    } catch (error) {
      console.error('Error fetching directions:', error);
    }
  }, []);

  const removeDirections = useCallback(() => {
    if (mapRef.current?.getLayer('route')) mapRef.current.removeLayer('route');
    if (mapRef.current?.getSource('route')) mapRef.current.removeSource('route');
    directionsRef.current = false;
  }, []);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden touch-none">
      <div 
        ref={mapContainerRef} 
        className="w-full h-full"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
}