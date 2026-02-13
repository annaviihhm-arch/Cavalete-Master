
import { RackData, SharePermission } from '../types';
import { STORAGE_KEY_PREFIX, TOTAL_RACKS, SHARES_KEY_PREFIX } from '../constants';

export const storageService = {
  getUserStorageKey: (email: string) => `${STORAGE_KEY_PREFIX}${email}`,
  getSharesKey: (email: string) => `${SHARES_KEY_PREFIX}${email}`,

  getRacks: (email: string): RackData[] => {
    const key = storageService.getUserStorageKey(email);
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

  updateRack: (ownerEmail: string, rack: RackData): RackData[] => {
    const key = storageService.getUserStorageKey(ownerEmail);
    const racks = storageService.getRacks(ownerEmail);
    const updatedRacks = racks.map((r) => (r.id === rack.id ? rack : r));
    localStorage.setItem(key, JSON.stringify(updatedRacks));
    return updatedRacks;
  },

  // Share Management
  getPermissions: (ownerEmail: string): SharePermission[] => {
    const key = storageService.getSharesKey(ownerEmail);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  updatePermission: (ownerEmail: string, granteeEmail: string, role: 'EDITOR' | 'OBSERVER' | null, granteeName?: string) => {
    const key = storageService.getSharesKey(ownerEmail);
    let permissions = storageService.getPermissions(ownerEmail);
    
    if (role === null) {
      permissions = permissions.filter(p => p.granteeEmail !== granteeEmail);
    } else {
      const existing = permissions.find(p => p.granteeEmail === granteeEmail);
      if (existing) {
        existing.role = role;
      } else {
        permissions.push({ granteeEmail, role, granteeName: granteeName || 'Usuário' });
      }
    }
    
    localStorage.setItem(key, JSON.stringify(permissions));
    return permissions;
  }
};
