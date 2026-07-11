import { ImageRecord, User, BU, Role } from './types';

export const ROLES: Role[] = ['R&D User', 'DRD User', 'GMS User'];
export const BUS: BU[] = ['Home Care', 'Personal Care', 'Foods'];

export const MOCK_USERS: Record<Role, User> = {
  'R&D User': { role: 'R&D User', bu: 'Home Care', name: 'Alice (R&D)' },
  'DRD User': { role: 'DRD User', bu: 'All', name: 'Bob (Admin)' },
  'GMS User': { role: 'GMS User', bu: 'All', name: 'Charlie (TAB)' },
};

const generateId = () => Math.random().toString(36).substr(2, 9);
const now = new Date().toISOString();

export const INITIAL_RECORDS: ImageRecord[] = [
  {
    id: 'rec_1',
    title: 'Shampoo Bottle Front Label',
    description: 'Primary artwork for 500ml variant',
    custId: 'PIT-HC-1001',
    tabId: 'TAB-8821',
    bu: 'Home Care',
    status: 'Active',
    createdBy: 'Alice (R&D)',
    createdAt: '2023-10-01T10:00:00Z',
    modifiedBy: 'Charlie (TAB)',
    modifiedAt: '2023-10-05T14:30:00Z',
    imageUrl: 'https://picsum.photos/400/400?random=1',
    history: [
      { id: generateId(), timestamp: '2023-10-01T10:00:00Z', user: 'Alice (R&D)', action: 'Created Record' },
      { id: generateId(), timestamp: '2023-10-05T14:30:00Z', user: 'Charlie (TAB)', action: 'Added TAB ID' }
    ]
  },
  {
    id: 'rec_2',
    title: 'Soap Wrapper V2',
    description: 'Updated ingredients list',
    custId: 'PIT-PC-2044',
    bu: 'Personal Care',
    status: 'Active',
    createdBy: 'Dave (R&D)',
    createdAt: '2023-10-15T09:15:00Z',
    modifiedBy: 'Dave (R&D)',
    modifiedAt: '2023-10-15T09:15:00Z',
    imageUrl: 'https://picsum.photos/400/400?random=2',
    history: [
      { id: generateId(), timestamp: '2023-10-15T09:15:00Z', user: 'Dave (R&D)', action: 'Created Record' }
    ]
  },
  {
    id: 'rec_3',
    title: 'Ketchup Squeeze Bottle',
    description: 'Promo sticker placement guide',
    custId: 'PIT-FD-3099',
    tabId: 'TAB-9002',
    bu: 'Foods',
    status: 'Archived',
    createdBy: 'Eve (R&D)',
    createdAt: '2023-08-20T11:00:00Z',
    modifiedBy: 'Eve (R&D)',
    modifiedAt: '2023-11-01T10:00:00Z',
    imageUrl: 'https://picsum.photos/400/400?random=3',
    history: [
      { id: generateId(), timestamp: '2023-08-20T11:00:00Z', user: 'Eve (R&D)', action: 'Created Record' },
      { id: generateId(), timestamp: '2023-11-01T10:00:00Z', user: 'Eve (R&D)', action: 'Status changed to Archived' }
    ]
  },
  {
    id: 'rec_4',
    title: 'Detergent Pods Box',
    description: 'Child safety warning update',
    custId: 'PIT-HC-1055',
    bu: 'Home Care',
    status: 'Active',
    createdBy: 'Alice (R&D)',
    createdAt: '2023-11-10T16:45:00Z',
    modifiedBy: 'Alice (R&D)',
    modifiedAt: '2023-11-10T16:45:00Z',
    imageUrl: 'https://picsum.photos/400/400?random=4',
    history: [
      { id: generateId(), timestamp: '2023-11-10T16:45:00Z', user: 'Alice (R&D)', action: 'Created Record' }
    ]
  },
  {
    id: 'rec_5',
    title: 'Mayonnaise Jar Label',
    description: 'Old branding - do not use',
    custId: 'PIT-FD-3011',
    tabId: 'TAB-7741',
    bu: 'Foods',
    status: 'Deleted',
    createdBy: 'Eve (R&D)',
    createdAt: '2022-05-10T10:00:00Z',
    modifiedBy: 'Bob (Admin)',
    modifiedAt: '2023-11-15T09:00:00Z',
    imageUrl: 'https://picsum.photos/400/400?random=5',
    history: [
      { id: generateId(), timestamp: '2022-05-10T10:00:00Z', user: 'Eve (R&D)', action: 'Created Record' },
      { id: generateId(), timestamp: '2023-11-15T09:00:00Z', user: 'Bob (Admin)', action: 'Status changed to Deleted' }
    ]
  }
];
