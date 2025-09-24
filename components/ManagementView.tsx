import React, { useState, useMemo } from 'react';
import { Product, Category, Supplier, Customer, StoreSettings, Discount } from '../types';
import ProductFormModal from './ProductFormModal';
import CategoryFormModal from './CategoryFormModal';
import SupplierFormModal from './SupplierFormModal';
import CustomerFormModal from './CustomerFormModal';
import DiscountFormModal from './DiscountFormModal';

type ActiveTab = 'products' | 'categories' | 'suppliers' | 'customers' | 'discounts' | 'settings';

interface ManagementViewProps {
    products: Product[];
    categories: Category[];
    suppliers: Supplier[];
    customers: Customer[];
    discounts: Discount[];
    storeSettings: StoreSettings;
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
}

const ManagementView: React.FC<ManagementViewProps> = (props) => {
    const { 
        products, categories, suppliers, customers, discounts, storeSettings,
        onSaveProduct, onDeleteProduct, onSaveCategory, onDeleteCategory, onSaveSupplier, onDeleteSupplier,
        onSaveCustomer, onDeleteCustomer, onSaveDiscount, onDeleteDiscount, onSaveStoreSettings
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
    
    // Form state for settings
    const [settingsData, setSettingsData] = useState<StoreSettings>(storeSettings);
    
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
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
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
                        <tr key={p.id} className={`bg-white border-b hover:bg-slate-50 ${isExpiringSoon(p.expiryDate) ? 'bg-orange-50' : ''}`}>
                            <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{p.name}</th>
                            <td className="px-6 py-4">{categoryMap.get(p.categoryId) || 'N/A'}</td>
                            <td className="px-6 py-4">${p.price.toFixed(2)}</td>
                            <td className="px-6 py-4">
                                <span className={p.stock <= p.lowStockThreshold ? 'font-bold text-orange-600' : ''}>{p.stock}</span>
                            </td>
                            <td className="px-6 py-4">{p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : 'N/A'}</td>
                            <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                <button onClick={() => handleEdit(p, 'products')} className="font-medium text-teal-600 hover:underline">Edit</button>
                                <button onClick={() => handleDelete(p.id, 'products')} className="font-medium text-red-600 hover:underline">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderCategoriesTable = () => ( <div className="bg-white rounded-lg shadow-md overflow-hidden"> <table className="w-full text-sm text-left text-slate-500"> <thead className="text-xs text-slate-700 uppercase bg-slate-50"> <tr> <th scope="col" className="px-6 py-3">Category Name</th> <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th> </tr> </thead> <tbody> {categories.map(c => ( <tr key={c.id} className="bg-white border-b hover:bg-slate-50"> <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{c.name}</th> <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap"> <button onClick={() => handleEdit(c, 'categories')} className="font-medium text-teal-600 hover:underline">Edit</button> <button onClick={() => handleDelete(c.id, 'categories')} className="font-medium text-red-600 hover:underline">Delete</button> </td> </tr> ))} </tbody> </table> </div> );
    const renderSuppliersTable = () => ( <div className="bg-white rounded-lg shadow-md overflow-x-auto"> <table className="w-full text-sm text-left text-slate-500"> <thead className="text-xs text-slate-700 uppercase bg-slate-50"> <tr> <th scope="col" className="px-6 py-3">Supplier Name</th> <th scope="col" className="px-6 py-3">Contact Person</th> <th scope="col" className="px-6 py-3">Phone</th> <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th> </tr> </thead> <tbody> {suppliers.map(s => ( <tr key={s.id} className="bg-white border-b hover:bg-slate-50"> <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{s.name}</th> <td className="px-6 py-4">{s.contactPerson}</td> <td className="px-6 py-4">{s.phone}</td> <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap"> <button onClick={() => handleEdit(s, 'suppliers')} className="font-medium text-teal-600 hover:underline">Edit</button> <button onClick={() => handleDelete(s.id, 'suppliers')} className="font-medium text-red-600 hover:underline">Delete</button> </td> </tr> ))} </tbody> </table> </div> );
    const renderCustomersTable = () => ( <div className="bg-white rounded-lg shadow-md overflow-x-auto"> <table className="w-full text-sm text-left text-slate-500"> <thead className="text-xs text-slate-700 uppercase bg-slate-50"> <tr> <th scope="col" className="px-6 py-3">Customer Name</th> <th scope="col" className="px-6 py-3">Email</th> <th scope="col" className="px-6 py-3">Phone</th> <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th> </tr> </thead> <tbody> {customers.map(c => ( <tr key={c.id} className="bg-white border-b hover:bg-slate-50"> <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{c.name}</th> <td className="px-6 py-4">{c.email}</td> <td className="px-6 py-4">{c.phone}</td> <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap"> <button onClick={() => handleEdit(c, 'customers')} className="font-medium text-teal-600 hover:underline">Edit</button> <button onClick={() => handleDelete(c.id, 'customers')} className="font-medium text-red-600 hover:underline">Delete</button> </td> </tr> ))} </tbody> </table> </div> );
    const renderDiscountsTable = () => ( <div className="bg-white rounded-lg shadow-md overflow-x-auto"> <table className="w-full text-sm text-left text-slate-500"> <thead className="text-xs text-slate-700 uppercase bg-slate-50"> <tr> <th scope="col" className="px-6 py-3">Discount Name</th> <th scope="col" className="px-6 py-3">Type</th> <th scope="col" className="px-6 py-3">Value</th> <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th> </tr> </thead> <tbody> {discounts.map(d => ( <tr key={d.id} className="bg-white border-b hover:bg-slate-50"> <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{d.name}</th> <td className="px-6 py-4 capitalize">{d.type}</td> <td className="px-6 py-4">{d.type === 'percentage' ? `${d.value}%` : `$${d.value.toFixed(2)}`}</td> <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap"> <button onClick={() => handleEdit(d, 'discounts')} className="font-medium text-teal-600 hover:underline">Edit</button> <button onClick={() => handleDelete(d.id, 'discounts')} className="font-medium text-red-600 hover:underline">Delete</button> </td> </tr> ))} </tbody> </table> </div> );
    const renderSettingsForm = () => ( <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto"> <form onSubmit={handleSaveSettings}> <div className="space-y-6"> <div> <label htmlFor="storeName" className="block text-sm font-medium text-slate-700 mb-1">Store Name</label> <input type="text" name="storeName" id="storeName" value={settingsData.storeName} onChange={handleSettingsChange} required className="w-full border-slate-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" /> </div> <div> <label htmlFor="storeAddress" className="block text-sm font-medium text-slate-700 mb-1">Store Address</label> <input type="text" name="storeAddress" id="storeAddress" value={settingsData.storeAddress} onChange={handleSettingsChange} required className="w-full border-slate-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" /> </div> <div> <label htmlFor="taxRate" className="block text-sm font-medium text-slate-700 mb-1">Tax Rate (%)</label> <input type="number" name="taxRate" id="taxRate" value={settingsData.taxRate * 100} onChange={handleSettingsChange} required min="0" step="0.01" className="w-full border-slate-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" /> </div> </div> <div className="mt-8 flex justify-end"> <button type="submit" className="bg-teal-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors">Save Settings</button> </div> </form> </div> );

    const TAB_CONFIG: { [key in ActiveTab]: { title: string; content: () => JSX.Element; onAdd?: () => void } } = {
        products: { title: 'Products', content: renderProductsTable, onAdd: () => handleAddNew('products') },
        categories: { title: 'Categories', content: renderCategoriesTable, onAdd: () => handleAddNew('categories') },
        suppliers: { title: 'Suppliers', content: renderSuppliersTable, onAdd: () => handleAddNew('suppliers') },
        customers: { title: 'Customers', content: renderCustomersTable, onAdd: () => handleAddNew('customers') },
        discounts: { title: 'Discounts', content: renderDiscountsTable, onAdd: () => handleAddNew('discounts') },
        settings: { title: 'Settings', content: renderSettingsForm },
    };

    return (
        <main className="container mx-auto p-4 md:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-slate-800">{TAB_CONFIG[activeTab].title}</h2>
                {TAB_CONFIG[activeTab].onAdd && (
                    <button onClick={TAB_CONFIG[activeTab].onAdd} className="bg-teal-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        <span>Add New</span>
                    </button>
                )}
            </div>
            <div className="mb-6 border-b border-slate-200">
                <nav className="-mb-px flex space-x-6 overflow-x-auto">
                    {(Object.keys(TAB_CONFIG) as ActiveTab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-3 px-1 border-b-2 font-semibold text-sm whitespace-nowrap ${activeTab === tab ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                        >
                            {TAB_CONFIG[tab].title}
                        </button>
                    ))}
                </nav>
            </div>

            {TAB_CONFIG[activeTab].content()}

            {isProductModalOpen && <ProductFormModal product={editingProduct} categories={categories} suppliers={suppliers} onClose={() => setIsProductModalOpen(false)} onSave={onSaveProduct} />}
            {isCategoryModalOpen && <CategoryFormModal category={editingCategory} onClose={() => setIsCategoryModalOpen(false)} onSave={onSaveCategory} />}
            {isSupplierModalOpen && <SupplierFormModal supplier={editingSupplier} onClose={() => setIsSupplierModalOpen(false)} onSave={onSaveSupplier} />}
            {isCustomerModalOpen && <CustomerFormModal customer={editingCustomer} onClose={() => setIsCustomerModalOpen(false)} onSave={onSaveCustomer} />}
            {isDiscountModalOpen && <DiscountFormModal discount={editingDiscount} onClose={() => setIsDiscountModalOpen(false)} onSave={onSaveDiscount} />}
        </main>
    );
};

export default ManagementView;
