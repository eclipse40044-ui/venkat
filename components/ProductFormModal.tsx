
import React, { useState, useEffect, useRef } from 'react';
import { Product, Category, Supplier } from '../types';
import BarcodeScanner from './BarcodeScanner';

interface ProductFormModalProps {
    product: Product | null;
    categories: Category[];
    suppliers: Supplier[];
    onClose: () => void;
    onSave: (product: Product) => void;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ product, categories, suppliers, onClose, onSave }) => {
    const [formData, setFormData] = useState<Omit<Product, 'id' | 'imageUrl' | 'costPrice'> & { id?: string; imageUrl?: string; costPrice?: number }>({
        name: '',
        price: 0,
        costPrice: 0,
        barcode: '',
        unit: 'each',
        stock: 0,
        lowStockThreshold: 5,
        categoryId: categories[0]?.id || '',
        supplierId: '',
        expiryDate: '',
        ...product,
    });
    
    const [imagePreview, setImagePreview] = useState<string | null>(product?.imageUrl || null);
    const firstInputRef = useRef<HTMLInputElement>(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    useEffect(() => {
        firstInputRef.current?.focus();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setImagePreview(result);
                setFormData(prev => ({ ...prev, imageUrl: result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBarcodeScanned = (scannedBarcode: string) => {
        setFormData(prev => ({ ...prev, barcode: scannedBarcode }));
        setIsScannerOpen(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const productToSave: Product = {
            ...formData,
            id: formData.id || `prod-${Date.now()}`,
            imageUrl: formData.imageUrl || `https://picsum.photos/seed/${formData.name.replace(/\s+/g, '-')}/400`,
            price: parseFloat(String(formData.price)),
            costPrice: parseFloat(String(formData.costPrice)),
            stock: parseInt(String(formData.stock), 10),
            lowStockThreshold: parseInt(String(formData.lowStockThreshold), 10),
        };
        onSave(productToSave);
        onClose();
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div 
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl p-8 max-h-[90vh] overflow-y-auto" 
                role="dialog" 
                aria-modal="true"
                aria-labelledby="product-modal-title"
            >
                <form onSubmit={handleSubmit}>
                    <h2 id="product-modal-title" className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
                        {product ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {/* Column 1 */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
                            <input ref={firstInputRef} type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="categoryId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                            <select name="categoryId" id="categoryId" value={formData.categoryId} onChange={handleChange} required className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="price" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Selling Price</label>
                            <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                         <div>
                            <label htmlFor="costPrice" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cost Price</label>
                            <input type="number" name="costPrice" id="costPrice" value={formData.costPrice} onChange={handleChange} required min="0" step="0.01" className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="unit" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Unit</label>
                            <select name="unit" id="unit" value={formData.unit} onChange={handleChange} required className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                <option value="each">Each</option>
                                <option value="lb">Pound (lb)</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="barcode" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Barcode</label>
                            <div className="relative">
                                <input type="text" name="barcode" id="barcode" value={formData.barcode} onChange={handleChange} required className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 pr-10" />
                                <button
                                    type="button"
                                    onClick={() => setIsScannerOpen(true)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-indigo-500"
                                    aria-label="Scan barcode with camera"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="stock" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stock Quantity</label>
                            <input type="number" name="stock" id="stock" value={formData.stock} onChange={handleChange} required min="0" className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                             <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Low Stock Threshold</label>
                            <input type="number" name="lowStockThreshold" id="lowStockThreshold" value={formData.lowStockThreshold} onChange={handleChange} required min="0" className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="supplierId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Supplier (Optional)</label>
                            <select name="supplierId" id="supplierId" value={formData.supplierId} onChange={handleChange} className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                <option value="">None</option>
                                {suppliers.map(sup => <option key={sup.id} value={sup.id}>{sup.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="expiryDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Expiry Date (Optional)</label>
                            <input type="date" name="expiryDate" id="expiryDate" value={formData.expiryDate ? formData.expiryDate.split('T')[0] : ''} onChange={handleChange} className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                         <div className="md:col-span-2">
                           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Image</label>
                            <div className="mt-1 flex items-center gap-4">
                                <img 
                                    src={imagePreview || `https://picsum.photos/seed/${formData.name.replace(/\s+/g, '-') || 'new'}/200`} 
                                    alt="Preview" 
                                    className="h-20 w-20 rounded-md object-cover bg-slate-200 dark:bg-slate-700"
                                />
                                <div>
                                    <input 
                                        type="file" 
                                        id="image-upload" 
                                        accept="image/png, image/jpeg, image/webp" 
                                        onChange={handleImageChange} 
                                        className="hidden" 
                                    />
                                    <label 
                                        htmlFor="image-upload"
                                        className="cursor-pointer rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 py-1.5 px-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600"
                                    >
                                        <span>Change</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                     <div className="mt-8 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors">Save Product</button>
                    </div>
                </form>
            </div>
            {isScannerOpen && (
                <BarcodeScanner
                    onScan={handleBarcodeScanned}
                    onClose={() => setIsScannerOpen(false)}
                />
            )}
        </div>
    );
};

export default ProductFormModal;
