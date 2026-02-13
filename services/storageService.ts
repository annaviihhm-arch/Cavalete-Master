
import { RackData, SharePermission } from '../types';
import { BASE_STORAGE_KEY, TOTAL_RACKS, DEFAULT_PATIO_ID, PERMISSIONS_KEY } from '../constants';

export const storageService = {
  getPatioKey: (id: string) => `${BASE_STORAGE_KEY}${id}`,

  getRacks: (patioId: string): RackData[] => {
    try {
      const key = storageService.getPatioKey(patioId);
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error("Erro ao carregar dados do pátio:", e);
    }
    
    // Fallback para pátio vazio se falhar ou não existir
    const initialRacks: RackData[] = Array.from({ length: TOTAL_RACKS }, (_, i) => ({
      id: i + 1,
      status: 'FREE',
    }));
    return initialRacks;
  },

  saveRacks: (patioId: string, racks: RackData[]): void => {
    try {
      const key = storageService.getPatioKey(patioId);
      localStorage.setItem(key, JSON.stringify(racks));
    } catch (e) {
      console.error("Erro ao salvar dados:", e);
      alert("Erro ao salvar: Armazenamento cheio ou sem permissão.");
    }
  },

  updateRack: (patioId: string, rack: RackData): RackData[] => {
    const racks = storageService.getRacks(patioId);
    const updatedRacks = racks.map((r) => (r.id === rack.id ? rack : r));
    storageService.saveRacks(patioId, updatedRacks);
    return updatedRacks;
  },

  // Retrieves all permissions granted by a specific owner to other users
  getPermissions: (ownerEmail: string): SharePermission[] => {
    try {
      const data = localStorage.getItem(PERMISSIONS_KEY);
      if (data) {
        const allPermissions: SharePermission[] = JSON.parse(data);
        return allPermissions.filter(p => p.ownerEmail === ownerEmail);
      }
    } catch (e) {
      console.error("Erro ao carregar permissões:", e);
    }
    return [];
  },

  // Updates a user's role or removes their access to an owner's patio
  updatePermission: (ownerEmail: string, granteeEmail: string, role: 'EDITOR' | 'OBSERVER' | null): SharePermission[] => {
    try {
      const data = localStorage.getItem(PERMISSIONS_KEY);
      let allPermissions: SharePermission[] = data ? JSON.parse(data) : [];
      
      if (role === null) {
        // Remove access
        allPermissions = allPermissions.filter(p => !(p.ownerEmail === ownerEmail && p.granteeEmail === granteeEmail));
      } else {
        // Update role for existing permission
        const index = allPermissions.findIndex(p => p.ownerEmail === ownerEmail && p.granteeEmail === granteeEmail);
        if (index > -1) {
          allPermissions[index].role = role;
        }
      }
      
      localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(allPermissions));
      return allPermissions.filter(p => p.ownerEmail === ownerEmail);
    } catch (e) {
      console.error("Erro ao atualizar permissão:", e);
      return [];
    }
  }
};
