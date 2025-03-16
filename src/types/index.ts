export type ServiceStatus = 'todo' | 'in-progress' | 'waiting-for-parts' | 'done' | 'archived';

export type ServiceType = 'Simple Service' | 'Full Service' | 'Other';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  marketingConsent: boolean;
  createdAt: string;
}

export interface ServiceRequest {
  id: string;
  customerId: string;
  equipmentBrand: string;
  serviceType: ServiceType;
  recipient: string;
  additionalDetails: string;
  status: ServiceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  serviceFee: number;
}

export interface Receipt {
  items: ReceiptItem[];
  totalAmount: number;
  generatedAt: string;
  mechanic?: string;
  mechanicId?: string;
  pdfUrl?: string;
}

export interface ServiceTicket extends ServiceRequest {
  customer: Customer;
  partsUsed?: Product[];
  mechanicId?: string;
  mechanic_id?: string;
  completionDate?: string;
  totalCost?: number;
  comments?: string[];
  receipt?: Receipt;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  barcode?: string;
  price: number;
  buyInPrice?: number;
  quantity?: number;
  description?: string;
  createdAt: string;
}

export interface DashboardStats {
  todoCount: number;
  inProgressCount: number;
  waitingForPartsCount: number;
  doneCount: number;
  archivedCount: number;
  totalRevenue: number;
  estimatedRevenue: number;
} 