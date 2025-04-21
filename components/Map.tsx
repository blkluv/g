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

  const emojiMarkers = useRef({
    photo: '📸',
    location: '📍',
    visited: '✅',
  });

  useEffect(() => {
    if (!mapContainerRef.current || !process.env.NEXT_PUBLIC_MAPBOX_TOKEN) return;

    const selectedStyle = typeof window !== 'undefined'
      ? localStorage.getItem('mapStyle') || 'dark'
      : 'dark';

    const styleUrl = mapStyles.find(style => style.id === selectedStyle)?.url || 'mapbox://styles/mapbox/dark-v11';

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: styleUrl,
      center: [longitude, latitude],
      zoom: 15,
      interactive: true,
      touchZoomRotate: true,
      trackResize: true,
      antialias: false,
      attributionControl: false,
      preserveDrawingBuffer: true,
      maxTileCacheSize: 20,
    });

    map.on('touchstart', (e) => {
      if (e.originalEvent.touches.length > 1) {
        e.preventDefault();
      }
    });

    map.on('error', (e) => {
      console.error('Map error:', e.error);
    });

    mapRef.current = map;

    if (onClick) {
      map.on('click', onClick);
    }

    const userEl = document.createElement('div');
    userEl.className = 'text-xl';
    userEl.textContent = '👤';

    userMarkerRef.current = new mapboxgl.Marker(userEl)
      .setLngLat([longitude, latitude])
      .addTo(map);

    return () => {
      if (onClick) {
        map.off('click', onClick);
      }
      map.remove();
    };
  }, [onClick]);

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
    updateMapCenter(longitude, latitude);

    if (activeChallenge?.type === 'location') {
      updateDirections([longitude, latitude], activeChallenge.coordinates);
    }
  }, [latitude, longitude, activeChallenge, updateMapCenter]);

  const createMarker = useCallback((challenge: Challenge, visited: boolean) => {
    const el = document.createElement('div');
    el.className = 'text-2xl cursor-pointer';

    if (visited) {
      el.textContent = emojiMarkers.current.visited;
      el.style.filter = 'grayscale(0.5) opacity(0.8)';
    } else {
      el.textContent = challenge.type === 'photo'
        ? emojiMarkers.current.photo
        : emojiMarkers.current.location;
    }

    return el;
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const updateMarkers = async () => {
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};

      await Promise.all(challenges.map(async (challenge) => {
        const visited = account ? await hasUserVisited(Number(challenge.id)) : false;
        const markerEl = createMarker(challenge, visited);

        const marker = new mapboxgl.Marker(markerEl)
          .setLngLat(challenge.coordinates)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div class="p-2 max-w-xs">
                <h3 class="font-bold text-lg">${challenge.title}</h3>
                <p class="text-sm text-gray-300">${challenge.description}</p>
                <div class="mt-2 flex items-center justify-between">
                  <span class="text-yellow-500 font-semibold">${challenge.points}pts</span>
                  ${visited ? '<span class="text-green-500 text-sm">Visited</span>' : ''}
                </div>
              </div>
            `)
          )
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

  const updateDirections = useCallback(async (start: [number, number], end: [number, number]) => {
    if (!mapRef.current) return;

    try {
      removeDirections();

      const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/walking/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&overview=simplified&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
      );
      const json = await query.json();
      const route = json.routes?.[0]?.geometry?.coordinates;

      if (!route) return;

      const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route
        }
      };

      if (mapRef.current.getSource('route')) {
        (mapRef.current.getSource('route') as mapboxgl.GeoJSONSource).setData(geojson);
      } else {
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
            'line-width': 3,
            'line-opacity': 0.8
          }
        });
      }

      const bounds = new mapboxgl.LngLatBounds().extend(start).extend(end);
      mapRef.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 25, right: 25 },
        maxZoom: 15
      });

      directionsRef.current = true;
    } catch (error) {
      console.error('Error fetching directions:', error);
    }
  }, []);

  const removeDirections = useCallback(() => {
    if (!mapRef.current || !directionsRef.current) return;

    if (mapRef.current.getLayer('route')) {
      mapRef.current.removeLayer('route');
    }
    if (mapRef.current.getSource('route')) {
      mapRef.current.removeSource('route');
    }

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
