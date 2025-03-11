// store/mapStore.ts
import create from 'zustand';

interface Marker {
  position: { latitude: number; longitude: number };
  title?: string;
}

interface MapState {
  markers: Marker[];
  setMarkers: (markers: Marker[]) => void;
  region: string;
  setRegion: (region: string) => void;
}

export const useMapStore = create<MapState>((set) => ({
  markers: [],
  setMarkers: (markers) => set({ markers }),
  region: '',
  setRegion: (region) => set({ region })
}));
