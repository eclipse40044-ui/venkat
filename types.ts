
export interface Category {
  id: string;
  name: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  barcode: string;
  unit: 'each' | 'lb';
  stock: number;
  lowStockThreshold: number;
  categoryId: string;
  supplierId?: string;
  expiryDate?: string; // ISO string format
  costPrice?: number;
}

export interface CartItem extends Product {
  quantity: number;
}

// FIX: Add CartLabels interface for use in CartCustomizationModal.tsx
export interface CartLabels {
  subtotal: string;
  discount: string;
  tax: string;
  total: string;
}

export interface Customer {
  id:string;
  name: string;
  phone: string;
  email: string;
}

export interface StoreSettings {
    storeName: string;
    storeAddressLine1: string;
    storeAddressLine2?: string;
    storeCity: string;
    storeState: string;
    storeZipCode: string;
    storeMobile?: string;
    storeLogoUrl?: string;
    taxRate: number; // e.g., 0.08 for 8%
    showLogoOnInvoice: boolean;
}

export interface User {
  id: string;
  name: string;
  role: 'Admin' | 'Manager' | 'Cashier';
  pin: string; // N-digit PIN
}

export interface Discount {
    id: string;
    name: string;
    type: 'fixed' | 'percentage';
    value: number;
}

export interface Payment {
  method: string;
  amount: number;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  paymentMethod: string; // e.g. 'Cash', 'G pay', 'Split'
  payments?: Payment[]; // Used for split payments
  customer?: Customer;
  userId: string;
  status: 'completed' | 'refunded';
  appliedDiscount?: {
      name: string;
      amount: number;
  };
}

export interface ActivityLog {
  id: string;
  timestamp: string; // ISO string
  userId: string;
  action: string;
  details?: string;
}

export interface TimeClockEntry {
  id: string;
  userId: string;
  clockInTime: string; // ISO string
  clockOutTime?: string; // ISO string
}