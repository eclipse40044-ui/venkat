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

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface StoreSettings {
    storeName: string;
    storeAddress: string;
    taxRate: number; // e.g., 0.08 for 8%
}

export interface User {
  id: string;
  name: string;
  role: 'Admin' | 'Manager' | 'Cashier';
}

export interface Discount {
    id: string;
    name: string;
    type: 'fixed' | 'percentage';
    value: number;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  paymentMethod: string;
  customer?: Customer;
  userId: string;
  status: 'completed' | 'refunded';
  appliedDiscount?: {
      name: string;
      amount: number;
  };
}
