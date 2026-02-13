
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
