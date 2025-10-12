import React, { useState, useMemo, useRef } from 'react';
import { Product, Category, Supplier, Customer, StoreSettings, Discount, User, ActivityLog } from '../types';
import { ROLE_PERMISSIONS } from '../constants';
import ProductFormModal from './ProductFormModal';
import CategoryFormModal from './CategoryFormModal';
import SupplierFormModal from './SupplierFormModal';
import CustomerFormModal from './CustomerFormModal';
import DiscountFormModal from './DiscountFormModal';
import ActivityLogView from './ActivityLogView';
import UserPinModal from './UserPinModal';

type ActiveTab = 'products' | 'categories' | 'suppliers' | 'customers' | 'discounts' | 'settings' | 'users' | 'activity';

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
    onUpdateUserPin: (userId: string, newPin: string) => void;
    onExportData: () => void;
    onImportData: (file: File) => void;
}

const ManagementView: React.FC<ManagementViewProps> = (props) => {
    const { 
        currentUser, products, categories, suppliers, customers, discounts, storeSettings, activityLogs, users,
        onSaveProduct, onDeleteProduct, onSaveCategory, onDeleteCategory, onSaveSupplier, onDeleteSupplier,
        onSaveCustomer, onDeleteCustomer, onSaveDiscount, onDeleteDiscount, onSaveStoreSettings, onUpdateUserPin,
        onExportData, onImportData
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
    const [editingUserForPin, setEditingUserForPin] = useState<User | null>(null);
    
    // Form state for settings
    const [settingsData, setSettingsData] = useState<StoreSettings>(storeSettings);
    const importInputRef = useRef<HTMLInputElement>(null);
    
    const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories]);

    const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettingsData(prev => ({ ...prev, [name]: name === 'taxRate' ? parseFloat(value) / 100 : value }));
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


    // Action Handlers
    const handleAddNew = (type: ActiveTab) => {
        switch (type) {
            case 'products': setEditingProduct(null); setIsProductModalOpen(true); break;
            case 'categories': setEditingCategory(null); setIsCategoryModalOpen(true); break;
            case 'suppliers': setEditingSupplier(null); setIsSupplierModalOpen(true); break;
            case 'customers': setEditingCustomer(null); setIsCustomerModalOpen(true); break;
            case 'discounts': setEditingDiscount(null); setIsDiscountModalOpen(true); break;
        }
    };
    const handleEdit = (item: Product | Category | Supplier | Customer | Discount, type: ActiveTab) => {
        switch (type) {
            case 'products': setEditingProduct(item as Product); setIsProductModalOpen(true); break;
            case 'categories': setEditingCategory(item as Category); setIsCategoryModalOpen(true); break;
            case 'suppliers': setEditingSupplier(item as Supplier); setIsSupplierModalOpen(true); break;
            case 'customers': setEditingCustomer(item as Customer); setIsCustomerModalOpen(true); break;
            case 'discounts': setEditingDiscount(item as Discount); setIsDiscountModalOpen(true); break;
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
                            <td className="px-6 py-4">${p.price.toFixed(2)}</td>
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
    const renderDiscountsTable = () => ( <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto"> <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400"> <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700/50"> <tr> <th scope="col" className="px-6 py-3">Discount Name</th> <th scope="col" className="px-6 py-3">Type</th> <th scope="col" className="px-6 py-3">Value</th> <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th> </tr> </thead> <tbody> {discounts.map(d => ( <tr key={d.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"> <th scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{d.name}</th> <td className="px-6 py-4 capitalize">{d.type}</td> <td className="px-6 py-4">{d.type === 'percentage' ? `${d.value}%` : `$${d.value.toFixed(2)}`}</td> <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap"> <button onClick={() => handleEdit(d, 'discounts')} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Edit</button> <button onClick={() => handleDelete(d.id, 'discounts')} className="font-medium text-red-600 dark:text-red-400 hover:underline">Delete</button> </td> </tr> ))} </tbody> </table> </div> );
    const renderSettingsForm = () => ( 
        <>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 max-w-2xl mx-auto"> 
                <form onSubmit={handleSaveSettings}> 
                    <div className="space-y-6"> 
                        <div> 
                            <label htmlFor="storeName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Store Name</label> 
                            <input type="text" name="storeName" id="storeName" value={settingsData.storeName} onChange={handleSettingsChange} required className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" /> 
                        </div> 
                        <div> 
                            <label htmlFor="storeAddress" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Store Address</label> 
                            <input type="text" name="storeAddress" id="storeAddress" value={settingsData.storeAddress} onChange={handleSettingsChange} required className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" /> 
                        </div> 
                        <div> 
                            <label htmlFor="taxRate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tax Rate (%)</label> 
                            <input type="number" name="taxRate" id="taxRate" value={settingsData.taxRate * 100} onChange={handleSettingsChange} required min="0" step="0.01" className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" /> 
                        </div> 
                    </div> 
                    <div className="mt-8 flex justify-end"> 
                        <button type="submit" className="bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">Save Settings</button> 
                    </div> 
                </form> 
            </div>
            {currentUser.role === 'Admin' && (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 max-w-2xl mx-auto mt-8">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Data Management</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Export all your store data for backup, or import a previously exported file to restore data.
                        <br/>
                        <span className="font-semibold text-orange-600 dark:text-orange-400">Warning:</span> Importing will overwrite all existing data.
                    </p>
                    <div className="flex gap-4">
                        <button onClick={onExportData} className="flex-1 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export Data
                        </button>
                        <input type="file" ref={importInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                        <button onClick={handleImportClick} className="flex-1 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors flex items-center justify-center gap-2">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Import Data
                        </button>
                    </div>
                </div>
            )}
        </>
    );
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
                    {users.map(user => (
                        <tr key={user.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                            <th scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{user.name}</th>
                            <td className="px-6 py-4">
                                <div className="relative group inline-block">
                                    <span className="cursor-default border-b border-dotted border-slate-400 dark:border-slate-500">{user.role}</span>
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-4 bg-slate-800 text-slate-100 text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 dark:bg-slate-900 border dark:border-slate-700">
                                        <h4 className="font-bold mb-2 text-base">{user.role} Permissions</h4>
                                        <ul className="list-disc list-inside space-y-1 text-left">
                                            {ROLE_PERMISSIONS[user.role].map((permission, index) => (
                                                <li key={index}>{permission}</li>
                                            ))}
                                        </ul>
                                        {/* Arrow */}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-800 dark:border-t-slate-900"></div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button onClick={() => setEditingUserForPin(user)} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Change PIN</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
    const renderActivityLog = () => <ActivityLogView logs={activityLogs} users={users} />;

    const TAB_CONFIG: { [key in ActiveTab]?: { title: string; content: () => React.JSX.Element; onAdd?: () => void } } = {
        products: { title: 'Products', content: renderProductsTable, onAdd: () => handleAddNew('products') },
        categories: { title: 'Categories', content: renderCategoriesTable, onAdd: () => handleAddNew('categories') },
        suppliers: { title: 'Suppliers', content: renderSuppliersTable, onAdd: () => handleAddNew('suppliers') },
        customers: { title: 'Customers', content: renderCustomersTable, onAdd: () => handleAddNew('customers') },
        discounts: { title: 'Discounts', content: renderDiscountsTable, onAdd: () => handleAddNew('discounts') },
        settings: { title: 'Settings', content: renderSettingsForm },
        users: currentUser.role === 'Admin' ? { title: 'Users', content: renderUsersTable } : undefined,
        activity: currentUser.role === 'Admin' ? { title: 'Activity Log', content: renderActivityLog } : undefined,
    };
    
    const activeTabConfig = TAB_CONFIG[activeTab];

    return (
        <main className="container mx-auto p-4 md:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{activeTabConfig?.title}</h2>
                {activeTabConfig?.onAdd && (
                    <button onClick={activeTabConfig.onAdd} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        <span>Add New</span>
                    </button>
                )}
            </div>
            <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-6 overflow-x-auto">
                    {(Object.keys(TAB_CONFIG) as ActiveTab[]).map(tabKey => {
                        const tab = TAB_CONFIG[tabKey];
                        if (!tab) return null;
                        return (
                            <button
                                key={tabKey}
                                onClick={() => setActiveTab(tabKey)}
                                className={`py-3 px-1 border-b-2 font-semibold text-sm whitespace-nowrap ${activeTab === tabKey ? 'border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'}`}
                            >
                                {tab.title}
                            </button>
                        )
                    })}
                </nav>
            </div>

            {activeTabConfig?.content()}

            {isProductModalOpen && <ProductFormModal product={editingProduct} categories={categories} suppliers={suppliers} onClose={() => setIsProductModalOpen(false)} onSave={onSaveProduct} />}
            {isCategoryModalOpen && <CategoryFormModal category={editingCategory} onClose={() => setIsCategoryModalOpen(false)} onSave={onSaveCategory} />}
            {isSupplierModalOpen && <SupplierFormModal supplier={editingSupplier} onClose={() => setIsSupplierModalOpen(false)} onSave={onSaveSupplier} />}
            {isCustomerModalOpen && <CustomerFormModal customer={editingCustomer} onClose={() => setIsCustomerModalOpen(false)} onSave={onSaveCustomer} />}
            {isDiscountModalOpen && <DiscountFormModal discount={editingDiscount} onClose={() => setIsDiscountModalOpen(false)} onSave={onSaveDiscount} />}
            {editingUserForPin && (
                <UserPinModal
                    user={editingUserForPin}
                    onClose={() => setEditingUserForPin(null)}
                    onSave={onUpdateUserPin}
                />
            )}
        </main>
    );
};

export default ManagementView;
