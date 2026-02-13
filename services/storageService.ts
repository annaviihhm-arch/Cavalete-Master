
import { RackData } from '../types';
import { BASE_STORAGE_KEY, TOTAL_RACKS, DEFAULT_PATIO_ID } from '../constants';

export const storageService = {
  getPatioKey: (id: string) => `${BASE_STORAGE_KEY}${id}`,

  getRacks: (patioId: string): RackData[] => {
    const key = storageService.getPatioKey(patioId);
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
    const initialRacks: RackData[] = Array.from({ length: TOTAL_RACKS }, (_, i) => ({
      id: i + 1,
      status: 'FREE',
    }));
    localStorage.setItem(key, JSON.stringify(initialRacks));
    return initialRacks;
  },

  updateRack: (patioId: string, rack: RackData): RackData[] => {
    const key = storageService.getPatioKey(patioId);
    const racks = storageService.getRacks(patioId);
    const updatedRacks = racks.map((r) => (r.id === rack.id ? rack : r));
    localStorage.setItem(key, JSON.stringify(updatedRacks));
    return updatedRacks;
  }
};
