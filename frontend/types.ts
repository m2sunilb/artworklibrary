export type Role = 'R&D User' | 'DRD User' | 'GMS User';
export type BU = 'Home Care' | 'Personal Care' | 'Foods' | 'All';

export type Status = 'Active' | 'Archived' | 'Deleted';

export interface User {
  role: Role;
  bu: BU;
  name: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details?: string;
}

export interface ImageRecord {
  id: string;
  title: string;
  description: string;
  custId: string;
  tabId?: string;
  bu: BU;
  status: Status;
  createdBy: string;
  createdAt: string;
  modifiedBy: string;
  modifiedAt: string;
  history: AuditEntry[];
  imageUrl: string;
}

export interface AppNotification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'alert';
}

export type ViewState = 'library' | 'bulk-upload' | 'reports' | 'admin';
