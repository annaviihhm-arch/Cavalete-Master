
export type RackStatus = 'FREE' | 'OCCUPIED' | 'MAINTENANCE';
export type UserRole = 'OWNER' | 'EDITOR' | 'OBSERVER';

export interface RackData {
  id: number;
  status: RackStatus;
  customerName?: string;
  orderNumber?: string;
  materialType?: string;
  photoUrl?: string;
  lastUpdated?: string;
  notes?: string;
}

export interface SharePermission {
  granteeEmail: string;
  granteeName: string;
  role: 'EDITOR' | 'OBSERVER';
}

export interface User {
  email: string;
  name: string;
}

export interface AppState {
  user: User | null;
  racks: RackData[];
}
