import React, { useState, useEffect, useRef } from 'react';
import { Product, Category, Supplier } from '../types';

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
                className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8 max-h-[90vh] overflow-y-auto" 
                role="dialog" 
                aria-modal="true"
                aria-labelledby="product-modal-title"
            >
                <form onSubmit={handleSubmit}>
                    <h2 id="product-modal-title" className="text-2xl font-bold text-slate-800 mb-6">
                        {product ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {/* Column 1 */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                            <input ref={firstInputRef} type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full border-slate-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" />
                        </div>
                        <div>
                            <label htmlFor="categoryId" className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                            <select name="categoryId" id="categoryId" value={formData.categoryId} onChange={handleChange} required className="w-full border-slate-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500">
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-1">Selling Price</label>
                            <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" className="w-full border-slate-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" />
                        </div>
                         <div>
                            <label htmlFor="costPrice" className="block text-sm font-medium text-slate-700 mb-1">Cost Price</label>
                            <input type="number" name="costPrice" id="costPrice" value={formData.costPrice} onChange={handleChange} required min="0" step="0.01" className="w-full border-slate-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" />
                        </div>
                        <div>
                            <label htmlFor="unit" className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                            <select name="unit" id="unit" value={formData.unit} onChange={handleChange} required className="w-full border-slate-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500">
                                <option value="each">Each</option>
                                <option value="lb">Pound (lb)</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="barcode" className="block text-sm font-medium text-slate-700 mb-1">Barcode</label>
                            <input type="text" name="barcode" id="barcode" value={formData.barcode} onChange={handleChange} required className="w-full border-slate-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" />
                        </div>
                        <div>
                            <label htmlFor="stock" className="block text-sm font-medium text-slate-700 mb-1">Stock Quantity</label>
                            <input type="number" name="stock" id="stock" value={formData.stock} onChange={handleChange} required min="0" className="w-full border-slate-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" />
                        </div>
                        <div>
                             <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-slate-700 mb-1">Low Stock Threshold</label>
                            <input type="number" name="lowStockThreshold" id="lowStockThreshold" value={formData.lowStockThreshold} onChange={handleChange} required min="0" className="w-full border-slate-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" />
                        </div>
                        <div>
                            <label htmlFor="supplierId" className="block text-sm font-medium text-slate-700 mb-1">Supplier (Optional)</label>
                            <select name="supplierId" id="supplierId" value={formData.supplierId} onChange={handleChange} className="w-full border-slate-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500">
                                <option value="">None</option>
                                {suppliers.map(sup => <option key={sup.id} value={sup.id}>{sup.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="expiryDate" className="block text-sm font-medium text-slate-700 mb-1">Expiry Date (Optional)</label>
                            <input type="date" name="expiryDate" id="expiryDate" value={formData.expiryDate ? formData.expiryDate.split('T')[0] : ''} onChange={handleChange} className="w-full border-slate-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" />
                        </div>
                         <div className="md:col-span-2">
                           <label className="block text-sm font-medium text-slate-700 mb-1">Product Image</label>
                            <div className="mt-1 flex items-center gap-4">
                                <img 
                                    src={imagePreview || `https://picsum.photos/seed/${formData.name.replace(/\s+/g, '-') || 'new'}/200`} 
                                    alt="Preview" 
                                    className="h-20 w-20 rounded-md object-cover bg-slate-200"
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
                                        className="cursor-pointer rounded-md border border-slate-300 bg-white py-1.5 px-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                                    >
                                        <span>Change</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                     <div className="mt-8 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors">Save Product</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductFormModal;
