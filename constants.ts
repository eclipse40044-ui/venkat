import { Product, Category, Supplier, Customer, StoreSettings, User, Discount } from './types';

export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-001', name: 'Dairy' },
  { id: 'cat-002', name: 'Bakery' },
  { id: 'cat-003', name: 'Produce' },
  { id: 'cat-004', name: 'Meat' },
  { id: 'cat-005', name: 'Pantry' },
  { id: 'cat-006', name: 'Beverages' },
];

export const MOCK_SUPPLIERS: Supplier[] = [
    { id: 'sup-001', name: 'Organic Farms Inc.', contactPerson: 'John Green', phone: '555-0101' },
    { id: 'sup-002', name: 'Artisan Breads Co.', contactPerson: 'Maria Rossi', phone: '555-0102' },
    { id: 'sup-003', name: 'Global Pantry Goods', contactPerson: 'Ken Tanaka', phone: '555-0103' },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: 'prod-001', name: 'Organic Milk', price: 3.99, imageUrl: 'https://picsum.photos/seed/milk/400', categoryId: 'cat-001', barcode: '8500001', unit: 'each', stock: 50, lowStockThreshold: 10, supplierId: 'sup-001', expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), costPrice: 2.50 },
  { id: 'prod-002', name: 'Sourdough Bread', price: 4.49, imageUrl: 'https://picsum.photos/seed/bread/400', categoryId: 'cat-002', barcode: '8500002', unit: 'each', stock: 30, lowStockThreshold: 5, supplierId: 'sup-002', expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), costPrice: 2.00 },
  { id: 'prod-003', name: 'Free-Range Eggs', price: 5.29, imageUrl: 'https://picsum.photos/seed/eggs/400', categoryId: 'cat-001', barcode: '8500003', unit: 'each', stock: 100, lowStockThreshold: 20, supplierId: 'sup-001', costPrice: 3.50 },
  { id: 'prod-004', name: 'Avocado', price: 1.99, imageUrl: 'https://picsum.photos/seed/avocado/400', categoryId: 'cat-003', barcode: '8500004', unit: 'each', stock: 75, lowStockThreshold: 15, costPrice: 1.20 },
  { id: 'prod-005', name: 'Fuji Apples (1 lb)', price: 2.79, imageUrl: 'https://picsum.photos/seed/apples/400', categoryId: 'cat-003', barcode: '8500005', unit: 'lb', stock: 200, lowStockThreshold: 25, costPrice: 1.50 },
  { id: 'prod-006', name: 'Chicken Breast (1 lb)', price: 7.99, imageUrl: 'https://picsum.photos/seed/chicken/400', categoryId: 'cat-004', barcode: '8500006', unit: 'lb', stock: 40, lowStockThreshold: 8, expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), costPrice: 5.00 },
  { id: 'prod-007', name: 'Cheddar Cheese', price: 6.49, imageUrl: 'https://picsum.photos/seed/cheese/400', categoryId: 'cat-001', barcode: '8500007', unit: 'each', stock: 60, lowStockThreshold: 10, supplierId: 'sup-001', costPrice: 4.00 },
  { id: 'prod-008', name: 'Tomato Sauce', price: 2.19, imageUrl: 'https://picsum.photos/seed/sauce/400', categoryId: 'cat-005', barcode: '8500008', unit: 'each', stock: 120, lowStockThreshold: 20, supplierId: 'sup-003', costPrice: 1.10 },
  { id: 'prod-009', name: 'Spaghetti Pasta', price: 1.89, imageUrl: 'https://picsum.photos/seed/pasta/400', categoryId: 'cat-005', barcode: '8500009', unit: 'each', stock: 150, lowStockThreshold: 30, supplierId: 'sup-003', costPrice: 0.90 },
  { id: 'prod-010', name: 'Olive Oil', price: 12.99, imageUrl: 'https://picsum.photos/seed/oil/400', categoryId: 'cat-005', barcode: '8500010', unit: 'each', stock: 40, lowStockThreshold: 5, supplierId: 'sup-003', costPrice: 8.50 },
  { id: 'prod-011', name: 'Romaine Lettuce', price: 2.49, imageUrl: 'https://picsum.photos/seed/lettuce/400', categoryId: 'cat-003', barcode: '8500011', unit: 'each', stock: 0, lowStockThreshold: 10, costPrice: 1.30 },
  { id: 'prod-012', name: 'Ground Beef (1 lb)', price: 8.49, imageUrl: 'https://picsum.photos/seed/beef/400', categoryId: 'cat-004', barcode: '8500012', unit: 'lb', stock: 8, lowStockThreshold: 10, costPrice: 6.00 },
  { id: 'prod-013', name: 'Orange Juice', price: 4.99, imageUrl: 'https://picsum.photos/seed/juice/400', categoryId: 'cat-006', barcode: '8500013', unit: 'each', stock: 60, lowStockThreshold: 15, costPrice: 3.00 },
  { id: 'prod-014', name: 'Almond Milk', price: 4.29, imageUrl: 'https://picsum.photos/seed/almondmilk/400', categoryId: 'cat-006', barcode: '8500014', unit: 'each', stock: 35, lowStockThreshold: 10, costPrice: 2.80 },
  { id: 'prod-015', name: 'Yogurt', price: 1.19, imageUrl: 'https://picsum.photos/seed/yogurt/400', categoryId: 'cat-001', barcode: '8500015', unit: 'each', stock: 2, lowStockThreshold: 5, expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), costPrice: 0.70 },
  { id: 'prod-016', name: 'Bananas (1 lb)', price: 0.69, imageUrl: 'https://picsum.photos/seed/bananas/400', categoryId: 'cat-003', barcode: '8500016', unit: 'lb', stock: 180, lowStockThreshold: 30, costPrice: 0.30 },
];

export const MOCK_USERS: User[] = [
    { id: 'user-001', name: 'Admin User', role: 'Admin' },
    { id: 'user-002', name: 'Manager Mike', role: 'Manager' },
    { id: 'user-003', name: 'Cashier Chloe', role: 'Cashier' },
];


export const MOCK_CUSTOMERS: Customer[] = [
    { id: 'cust-001', name: 'John Doe', phone: '555-1234', email: 'john.doe@example.com' },
    { id: 'cust-002', name: 'Jane Smith', phone: '555-5678', email: 'jane.smith@example.com' },
];

export const MOCK_STORE_SETTINGS: StoreSettings = {
    storeName: 'Yazh Shop',
    storeAddress: '123 Market St, Techville',
    taxRate: 0.08, // 8%
};

export const MOCK_DISCOUNTS: Discount[] = [
    { id: 'disc-001', name: 'Staff Discount', type: 'percentage', value: 10 },
    { id: 'disc-002', name: 'Holiday Special', type: 'fixed', value: 5 },
    { id: 'disc-003', name: 'Clearance', type: 'percentage', value: 20 },
];
