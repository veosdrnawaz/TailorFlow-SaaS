export enum OrderStatus {
  RECEIVED = 'Received',
  CUTTING = 'Cutting',
  STITCHING = 'Stitching',
  TRIAL_READY = 'Trial Ready',
  ALTERATION = 'Alteration',
  COMPLETED = 'Completed',
  DELIVERED = 'Delivered',
}

export enum GarmentType {
  SHIRT = 'Shirt',
  PANT = 'Pant',
  SUIT_2PC = 'Suit (2pc)',
  SUIT_3PC = 'Suit (3pc)',
  KURTA = 'Kurta',
  LEHENGA = 'Lehenga',
  BLOUSE = 'Blouse',
  DRESS = 'Dress',
  OTHER = 'Other',
}

export interface Measurement {
  label: string;
  value: string | number;
  unit: 'in' | 'cm';
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  savedMeasurements: Record<string, Measurement[]>; // Keyed by GarmentType string
  totalOrders: number;
  lastVisit: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string; // Denormalized for ease
  garmentType: GarmentType;
  description: string;
  measurements: Measurement[];
  status: OrderStatus;
  orderDate: string;
  dueDate: string;
  price: number;
  advance: number;
  isUrgent: boolean;
  assignedStaff?: string;
  images?: string[]; // URLs
}

export interface AIAdviceResponse {
  estimatedCost: number;
  timeEstimateDays: number;
  patternSuggestions: string[];
  fabricRequirements: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
}

export type ViewState = 'DASHBOARD' | 'ORDERS' | 'CUSTOMERS' | 'AI_ASSISTANT';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  scriptUrl: string | null;
}