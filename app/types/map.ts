export interface MapStyle {
  id: string;
  name: string;
  url: string;
  preview: string;
}

export const mapStyles: MapStyle[] = [
  {
    id: 'dark',
    name: 'Dark',
    url: 'mapbox://styles/mapbox/dark-v11',
    preview: 'bg-gray-900',
  },
  {
    id: 'light',
    name: 'Light',
    url: 'mapbox://styles/mapbox/light-v11',
    preview: 'bg-gray-100',
  },
  {
    id: 'satellite',
    name: 'Satellite',
    url: 'mapbox://styles/mapbox/satellite-v9',
    preview: 'bg-gray-800',
  },
  {
    id: 'streets',
    name: 'Streets',
    url: 'mapbox://styles/mapbox/streets-v12',
    preview: 'bg-blue-100',
  },
  {
    id: 'outdoors',
    name: 'Outdoors',
    url: 'mapbox://styles/mapbox/outdoors-v12',
    preview: 'bg-green-100',
  },
  {
    id: 'custom',
    name: 'Custom',
    url: 'mapbox://styles/saif196/cm9of1ji2003d01s50xgccrfa',
    preview: 'bg-purple-100',
  },
]; 