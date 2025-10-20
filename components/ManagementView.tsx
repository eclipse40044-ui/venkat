import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Product, Category, Supplier, Customer, StoreSettings, Discount, User, ActivityLog, TimeClockEntry } from '../types';
import { ROLE_PERMISSIONS, CURRENCIES, RECEIPT_FONTS } from '../constants';
import ProductFormModal from './ProductFormModal';
import CategoryFormModal from './CategoryFormModal';
import SupplierFormModal from './SupplierFormModal';
import CustomerFormModal from './CustomerFormModal';
import DiscountFormModal from './DiscountFormModal';
import ActivityLogView from './ActivityLogView';
import UserPinModal from './UserPinModal';
import TimeClockManagement from './TimeClockManagement';
import UserFormModal from './UserFormModal';
import SampleReceipt from './SampleReceipt';

type ActiveTab = 'products' | 'categories' | 'suppliers' | 'customers' | 'discounts' | 'settings' | 'users' | 'activity' | 'timesheets';

interface ManagementViewProps {
    currentUser: User;
    products: Product[];
    categories: Category[];
    suppliers: Supplier[];
    customers: Customer[];
    discounts: Discount[];
    storeSettings: StoreSettings;
    activityLogs: ActivityLog[];
    users: User[];
    timeClockEntries: TimeClockEntry[];
    onSaveProduct: (product: Product) => void;
    onDeleteProduct: (productId: string) => void;
    onSaveCategory: (category: Category) => void;
    onDeleteCategory: (categoryId: string) => void;
    onSaveSupplier: (supplier: Supplier) => void;
    onDeleteSupplier: (supplierId: string) => void;
    onSaveCustomer: (customer: Customer) => void;
    onDeleteCustomer: (customerId: string) => void;
    onSaveDiscount: (discount: Discount) => void;
    onDeleteDiscount: (discountId: string) => void;
    onSaveStoreSettings: (settings: StoreSettings) => void;
    onSaveUser: (user: User) => void;
    onDeleteUser: (userId: string) => void;
    onUpdateUserPin: (userId: string, newPin: string) => void;
    onSaveTimeClockEntry: (entry: TimeClockEntry) => void;
    onDeleteTimeClockEntry: (entryId: string) => void;
    onExportData: () => void;
    onImportData: (file: File) => void;
    formatCurrency: (amount: number) => string;
}

const ManagementView: React.FC<ManagementViewProps> = (props) => {
    const { 
        currentUser, products, categories, suppliers, customers, discounts, storeSettings, activityLogs, users, timeClockEntries,
        onSaveProduct, onDeleteProduct, onSaveCategory, onDeleteCategory, onSaveSupplier, onDeleteSupplier,
        onSaveCustomer, onDeleteCustomer, onSaveDiscount, onDeleteDiscount, onSaveStoreSettings, onSaveUser, onDeleteUser, onUpdateUserPin,
        onSaveTimeClockEntry, onDeleteTimeClockEntry, onExportData, onImportData, formatCurrency
    } = props;
    const [activeTab, setActiveTab] = useState<ActiveTab>('products');
    
    // Modal states
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editingUserForPin, setEditingUserForPin] = useState<User | null>(null);
    const [isPrintingTest, setIsPrintingTest] = useState(false);
    
    // Form state for settings
    const [settingsData, setSettingsData] = useState<StoreSettings>(storeSettings);
    const [logoPreview, setLogoPreview] = useState<string | null>(storeSettings.storeLogoUrl || null);
    const importInputRef = useRef<HTMLInputElement>(null);
    
    const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories]);
    const currencyInfo = useMemo(() => {
        return CURRENCIES.find(c => c.code === storeSettings.currency) || CURRENCIES[0];
    }, [storeSettings.currency]);


    // FIX: Use a type guard to safely handle checkbox changes.
    const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target;
        const name = target.name;
        
        if (target instanceof HTMLInputElement && target.type === 'checkbox') {
            const isChecked = target.checked;

            if (name.startsWith('printerSettings.')) {
                const key = name.split('.')[1];
                setSettingsData(prev => ({
                    ...prev,
                    printerSettings: {
                        ...prev.printerSettings,
                        [key]: isChecked,
                    }
                }));
            } else {
                setSettingsData(prev => ({...prev, [name]: isChecked }));
            }
        } else {
            const value = target.value;
            // Handle other inputs (text, select, radio)
            if (name.startsWith('printerSettings.')) {
                const key = name.split('.')[1];
                setSettingsData(prev => ({
                    ...prev,
                    printerSettings: {
                        ...prev.printerSettings,
                        [key]: value,
                    }
                }));
            } else {
                 setSettingsData(prev => ({ ...prev, [name]: name === 'taxRate' ? parseFloat(value) / 100 : value }));
            }
        }
    };
    
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setLogoPreview(result);
                setSettingsData(prev => ({ ...prev, storeLogoUrl: result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveSettings = (e: React.FormEvent) => {
        e.preventDefault();
        onSaveStoreSettings(settingsData);
        alert('Settings saved!');
    };

    const handleImportClick = () => {
        importInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImportData(file);
            // Reset the input so the same file can be selected again
            if(event.target) event.target.value = '';
        }
    };

    const handleTestPrint = () => {
        setIsPrintingTest(true);
    };

    useEffect(() => {
        if (isPrintingTest) {
            const handleAfterPrint = () => setIsPrintingTest(false);
            window.addEventListener('afterprint', handleAfterPrint, { once: true });
            window.print();
        }
    }, [isPrintingTest]);


    // Action Handlers
    const handleAddNew = (type: ActiveTab) => {
        switch (type) {
            case 'products': setEditingProduct(null); setIsProductModalOpen(true); break;
            case 'categories': setEditingCategory(null); setIsCategoryModalOpen(true); break;
            case 'suppliers': setEditingSupplier(null); setIsSupplierModalOpen(true); break;
            case 'customers': setEditingCustomer(null); setIsCustomerModalOpen(true); break;
            case 'discounts': setEditingDiscount(null); setIsDiscountModalOpen(true); break;
            case 'users': setEditingUser(null); setIsUserModalOpen(true); break;
        }
    };
    const handleEdit = (item: Product | Category | Supplier | Customer | Discount | User, type: ActiveTab) => {
        switch (type) {
            case 'products': setEditingProduct(item as Product); setIsProductModalOpen(true); break;
            case 'categories': setEditingCategory(item as Category); setIsCategoryModalOpen(true); break;
            case 'suppliers': setEditingSupplier(item as Supplier); setIsSupplierModalOpen(true); break;
            case 'customers': setEditingCustomer(item as Customer); setIsCustomerModalOpen(true); break;
            case 'discounts': setEditingDiscount(item as Discount); setIsDiscountModalOpen(true); break;
            case 'users': setEditingUser(item as User); setIsUserModalOpen(true); break;
        }
    };
    const handleDelete = (id: string, type: ActiveTab) => {
        if (window.confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`)) {
            switch (type) {
                case 'products': onDeleteProduct(id); break;
                case 'categories': onDeleteCategory(id); break;
                case 'suppliers': onDeleteSupplier(id); break;
                case 'customers': onDeleteCustomer(id); break;
                case 'discounts': onDeleteDiscount(id); break;
                case 'users': onDeleteUser(id); break;
            }
        }
    };
    
    const isExpiringSoon = (expiryDate?: string) => {
        if (!expiryDate) return false;
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        return new Date(expiryDate) < sevenDaysFromNow;
    };

    // Render functions for each tab's content
    const renderProductsTable = () => (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700/50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Product Name</th>
                        <th scope="col" className="px-6 py-3">Category</th>
                        <th scope="col" className="px-6 py-3">Price</th>
                        <th scope="col" className="px-6 py-3">Stock</th>
                        <th scope="col" className="px-6 py-3">Expiry Date</th>
                        <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(p => (
                        <tr key={p.id} className={`bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 ${isExpiringSoon(p.expiryDate) ? 'bg-orange-50 dark:bg-orange-900/20' : ''}`}>
                            <th scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{p.name}</th>
                            <td className="px-6 py-4">{categoryMap.get(p.categoryId) || 'N/A'}</td>
                            <td className="px-6 py-4">{formatCurrency(p.price)}</td>
                            <td className="px-6 py-4">
                                <span className={p.stock <= p.lowStockThreshold ? 'font-bold text-orange-600 dark:text-orange-400' : ''}>{p.stock}</span>
                            </td>
                            <td className="px-6 py-4">{p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : 'N/A'}</td>
                            <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                <button onClick={() => handleEdit(p, 'products')} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Edit</button>
                                <button onClick={() => handleDelete(p.id, 'products')} className="font-medium text-red-600 dark:text-red-400 hover:underline">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderCategoriesTable = () => ( <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden"> <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400"> <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700/50"> <tr> <th scope="col" className="px-6 py-3">Category Name</th> <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th> </tr> </thead> <tbody> {categories.map(c => ( <tr key={c.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"> <th scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{c.name}</th> <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap"> <button onClick={() => handleEdit(c, 'categories')} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Edit</button> <button onClick={() => handleDelete(c.id, 'categories')} className="font-medium text-red-600 dark:text-red-400 hover:underline">Delete</button> </td> </tr> ))} </tbody> </table> </div> );
    const renderSuppliersTable = () => ( <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto"> <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400"> <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700/50"> <tr> <th scope="col" className="px-6 py-3">Supplier Name</th> <th scope="col" className="px-6 py-3">Contact Person</th> <th scope="col" className="px-6 py-3">Phone</th> <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th> </tr> </thead> <tbody> {suppliers.map(s => ( <tr key={s.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"> <th scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{s.name}</th> <td className="px-6 py-4">{s.contactPerson}</td> <td className="px-6 py-4">{s.phone}</td> <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap"> <button onClick={() => handleEdit(s, 'suppliers')} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Edit</button> <button onClick={() => handleDelete(s.id, 'suppliers')} className="font-medium text-red-600 dark:text-red-400 hover:underline">Delete</button> </td> </tr> ))} </tbody> </table> </div> );
    const renderCustomersTable = () => ( <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto"> <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400"> <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700/50"> <tr> <th scope="col" className="px-6 py-3">Customer Name</th> <th scope="col" className="px-6 py-3">Email</th> <th scope="col" className="px-6 py-3">Phone</th> <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th> </tr> </thead> <tbody> {customers.map(c => ( <tr key={c.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"> <th scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{c.name}</th> <td className="px-6 py-4">{c.email}</td> <td className="px-6 py-4">{c.phone}</td> <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap"> <button onClick={() => handleEdit(c, 'customers')} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Edit</button> <button onClick={() => handleDelete(c.id, 'customers')} className="font-medium text-red-600 dark:text-red-400 hover:underline">Delete</button> </td> </tr> ))} </tbody> </table> </div> );
    const renderDiscountsTable = () => ( <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto"> <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400"> <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700/50"> <tr> <th scope="col" className="px-6 py-3">Discount Name</th> <th scope="col" className="px-6 py-3">Type</th> <th scope="col" className="px-6 py-3">Value</th> <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th> </tr> </thead> <tbody> {discounts.map(d => ( <tr key={d.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"> <th scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{d.name}</th> <td className="px-6 py-4 capitalize">{d.type}</td> <td className="px-6 py-4">{d.type === 'percentage' ? `${d.value}%` : formatCurrency(d.value)}</td> <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap"> <button onClick={() => handleEdit(d, 'discounts')} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Edit</button> <button onClick={() => handleDelete(d.id, 'discounts')} className="font-medium text-red-600 dark:text-red-400 hover:underline">Delete</button> </td> </tr> ))} </tbody> </table> </div> );
    const renderSettingsForm = () => ( 
        <>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 max-w-2xl mx-auto"> 
                <form onSubmit={handleSaveSettings}> 
                    <div className="space-y-6">
                        <div>
                           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Store Logo</label>
                            <div className="mt-1 flex items-center gap-4">
                                <img 
                                    src={logoPreview || `https://picsum.photos/seed/${settingsData.storeName.replace(/\s+/g, '-') || 'storelogo'}/200`}
                                    alt="Logo Preview" 
                                    className="h-20 w-20 rounded-md object-cover bg-slate-200 dark:bg-slate-700"
                                />
                                <div>
                                    <input 
                                        type="file" 
                                        id="logo-upload" 
                                        accept="image/png, image/jpeg, image/webp" 
                                        onChange={handleLogoChange} 
                                        className="hidden" 
                                    />
                                    <label 
                                        htmlFor="logo-upload"
                                        className="cursor-pointer rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 py-1.5 px-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600"
                                    >
                                        <span>Change Logo</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div> 
                            <label htmlFor="storeName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Store Name</label> 
                            <input type="text" name="storeName" id="storeName" value={settingsData.storeName} onChange={handleSettingsChange} required className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" /> 
                        </div> 
                        <div>
                            <label htmlFor="storeAddressLine1" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address Line 1</label>
                            <input type="text" name="storeAddressLine1" id="storeAddressLine1" value={settingsData.storeAddressLine1} onChange={handleSettingsChange} required className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="storeAddressLine2" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address Line 2 (Optional)</label>
                            <input type="text" name="storeAddressLine2" id="storeAddressLine2" value={settingsData.storeAddressLine2 || ''} onChange={handleSettingsChange} className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="sm:col-span-1">
                                <label htmlFor="storeCity" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">City</label>
                                <input type="text" name="storeCity" id="storeCity" value={settingsData.storeCity} onChange={handleSettingsChange} required className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                            </div>
                            <div className="sm:col-span-1">
                                <label htmlFor="storeState" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">State</label>
                                <input type="text" name="storeState" id="storeState" value={settingsData.storeState} onChange={handleSettingsChange} required className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                            </div>
                            <div className="sm:col-span-1">
                                <label htmlFor="storeZipCode" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ZIP Code</label>
                                <input type="text" name="storeZipCode" id="storeZipCode" value={settingsData.storeZipCode} onChange={handleSettingsChange} required className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                            </div>
                        </div>
                        <div> 
                            <label htmlFor="storeMobile" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Shop Mobile Number</label> 
                            <input type="tel" name="storeMobile" id="storeMobile" value={settingsData.storeMobile || ''} onChange={handleSettingsChange} className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" /> 
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                            <div>
                                <label htmlFor="currency" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Currency</label>
                                <select name="currency" id="currency" value={settingsData.currency} onChange={handleSettingsChange} className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                    {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.name} ({c.symbol})</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="taxRate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tax Rate (%)</label>
                                <input type="number" name="taxRate" id="taxRate" value={settingsData.taxRate * 100} onChange={handleSettingsChange} min="0" step="0.01" className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="isTaxEnabled" checked={settingsData.isTaxEnabled} onChange={handleSettingsChange} className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 dark:bg-slate-900" />
                                <span className="text-slate-700 dark:text-slate-200">Enable Tax Calculation</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="showLogoOnInvoice" checked={settingsData.showLogoOnInvoice} onChange={handleSettingsChange} className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 dark:bg-slate-900" />
                                <span className="text-slate-700 dark:text-slate-200">Show Logo on Invoice</span>
                            </label>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end">
                        <button type="submit" className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors">Save Settings</button>
                    </div>
                </form> 
            </div>

             <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 max-w-2xl mx-auto mt-8">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Printer Setup</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Paper Width</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="printerSettings.paperWidth" value="58mm" checked={settingsData.printerSettings.paperWidth === '58mm'} onChange={handleSettingsChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600" />
                                <span>58mm</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="printerSettings.paperWidth" value="80mm" checked={settingsData.printerSettings.paperWidth === '80mm'} onChange={handleSettingsChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600" />
                                <span>80mm</span>
                            </label>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="fontFamily" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Receipt Font</label>
                        <select
                            name="printerSettings.fontFamily"
                            id="fontFamily"
                            value={settingsData.printerSettings.fontFamily}
                            onChange={handleSettingsChange}
                            className="w-full max-w-xs border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {RECEIPT_FONTS.map(font => (
                                <option key={font.value} value={font.value}>{font.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="copies" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Number of Copies</label>
                        <input type="number" name="printerSettings.copies" id="copies" value={settingsData.printerSettings.copies} onChange={handleSettingsChange} min="1" className="w-full max-w-xs border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Note: You may also need to set this in your browser's print dialog.</p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="printerSettings.printAfterSale" checked={settingsData.printerSettings.printAfterSale} onChange={handleSettingsChange} className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 dark:bg-slate-900" />
                        <span className="text-slate-700 dark:text-slate-200">Automatically print receipt after sale</span>
                    </label>
                </div>
                 <div className="mt-6 flex justify-start gap-4">
                    <button type="button" onClick={handleSaveSettings} className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors">Save Printer Settings</button>
                    <button type="button" onClick={handleTestPrint} className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">Test Print</button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 max-w-2xl mx-auto mt-8">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Data Management</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={onExportData} className="flex-1 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors text-center">Export All Data</button>
                    <input type="file" ref={importInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                    <button onClick={handleImportClick} className="flex-1 px-4 py-2 rounded-lg bg-amber-200 dark:bg-amber-800/50 text-amber-800 dark:text-amber-200 font-semibold hover:bg-amber-300 dark:hover:bg-amber-700/50 transition-colors text-center">Import Data</button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">Exporting data creates a backup of all products, orders, settings, etc. Importing will overwrite existing data.</p>
            </div>
        </>
    );

    // FIX: Add render function for Users table
    const renderUsersTable = () => (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700/50">
                    <tr>
                        <th scope="col" className="px-6 py-3">User Name</th>
                        <th scope="col" className="px-6 py-3">Role</th>
                        <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                            <th scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{u.name}</th>
                            <td className="px-6 py-4">{u.role}</td>
                            <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                <button onClick={() => setEditingUserForPin(u)} className="font-medium text-slate-600 dark:text-slate-400 hover:underline">Change PIN</button>
                                <button onClick={() => handleEdit(u, 'users')} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Edit</button>
                                <button onClick={() => handleDelete(u.id, 'users')} className="font-medium text-red-600 dark:text-red-400 hover:underline">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'products': return renderProductsTable();
            case 'categories': return renderCategoriesTable();
            case 'suppliers': return renderSuppliersTable();
            case 'customers': return renderCustomersTable();
            case 'discounts': return renderDiscountsTable();
            case 'settings': return renderSettingsForm();
            case 'users': return renderUsersTable();
            case 'activity': return currentUser.role === 'Admin' ? <ActivityLogView logs={activityLogs} users={users} /> : null;
            case 'timesheets': return <TimeClockManagement timeClockEntries={timeClockEntries} users={users} onSave={onSaveTimeClockEntry} onDelete={onDeleteTimeClockEntry} />;
            default: return null;
        }
    };

    const tabs: { key: ActiveTab, label: string, roles: User['role'][] }[] = [
        { key: 'products', label: 'Products', roles: ['Admin', 'Manager'] },
        { key: 'categories', label: 'Categories', roles: ['Admin', 'Manager'] },
        { key: 'suppliers', label: 'Suppliers', roles: ['Admin', 'Manager'] },
        { key: 'customers', label: 'Customers', roles: ['Admin', 'Manager'] },
        { key: 'discounts', label: 'Discounts', roles: ['Admin', 'Manager'] },
        { key: 'timesheets', label: 'Timesheets', roles: ['Admin', 'Manager'] },
        { key: 'settings', label: 'Store Settings', roles: ['Admin'] },
        { key: 'users', label: 'Users', roles: ['Admin'] },
        { key: 'activity', label: 'Activity Log', roles: ['Admin'] },
    ];

    const availableTabs = useMemo(() => tabs.filter(tab => tab.roles.includes(currentUser.role)), [currentUser.role]);
    const showAddNewButton = useMemo(() => ['products', 'categories', 'suppliers', 'customers', 'discounts', 'users'].includes(activeTab), [activeTab]);
    const addNewButtonLabel = useMemo(() => {
        if (!showAddNewButton) return '';
        const singular = activeTab.endsWith('ies') ? activeTab.slice(0, -3) + 'y' : activeTab.slice(0, -1);
        return `Add New ${singular.charAt(0).toUpperCase() + singular.slice(1)}`;
    }, [activeTab, showAddNewButton]);

    // FIX: Added return statement with JSX to make the component valid.
    return (
        <main className="container mx-auto p-4 md:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Store Management</h2>
                {showAddNewButton && (
                    <button onClick={() => handleAddNew(activeTab)} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 self-start sm:self-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                        <span>{addNewButtonLabel}</span>
                    </button>
                )}
            </div>

            <div className="mb-6">
                <div className="border-b border-slate-200 dark:border-slate-700">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                        {availableTabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`${
                                    activeTab === tab.key
                                    ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            <div>
                {renderContent()}
            </div>
            
            {isPrintingTest && <SampleReceipt storeSettings={settingsData} formatCurrency={formatCurrency} />}

            {isProductModalOpen && <ProductFormModal product={editingProduct} categories={categories} suppliers={suppliers} onClose={() => setIsProductModalOpen(false)} onSave={onSaveProduct} />}
            {isCategoryModalOpen && <CategoryFormModal category={editingCategory} onClose={() => setIsCategoryModalOpen(false)} onSave={onSaveCategory} />}
            {isSupplierModalOpen && <SupplierFormModal supplier={editingSupplier} onClose={() => setIsSupplierModalOpen(false)} onSave={onSaveSupplier} />}
            {isCustomerModalOpen && <CustomerFormModal customer={editingCustomer} onClose={() => setIsCustomerModalOpen(false)} onSave={onSaveCustomer} />}
            {isDiscountModalOpen && <DiscountFormModal discount={editingDiscount} onClose={() => setIsDiscountModalOpen(false)} onSave={onSaveDiscount} currencySymbol={currencyInfo.symbol} />}
            {isUserModalOpen && <UserFormModal user={editingUser} onClose={() => setIsUserModalOpen(false)} onSave={onSaveUser} />}
            {editingUserForPin && <UserPinModal user={editingUserForPin} onClose={() => setEditingUserForPin(null)} onSave={onUpdateUserPin} />}
        </main>
    );
};

// FIX: Added default export for the component.
export default ManagementView;