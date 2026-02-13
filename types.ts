
export type RackStatus = 'FREE' | 'OCCUPIED' | 'MAINTENANCE';

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

export interface AppState {
  racks: RackData[];
  currentPatioId: string;
}

// Added User and SharePermission types for Auth and Sharing
export interface User {
  email: string;
  name: string;
  password?: string;
}

export interface SharePermission {
  ownerEmail: string;
  granteeEmail: string;
  granteeName: string;
  role: 'EDITOR' | 'OBSERVER';
}
