
import React, { useState, useEffect, useRef } from 'react';
import { Discount, StoreSettings } from '../types';

interface DiscountFormModalProps {
    discount: Discount | null;
    onClose: () => void;
    onSave: (discount: Discount) => void;
    storeSettings: StoreSettings;
}

const DiscountFormModal: React.FC<DiscountFormModalProps> = ({ discount, onClose, onSave, storeSettings }) => {
    const [formData, setFormData] = useState<Omit<Discount, 'id'>>({
        name: discount?.name || '',
        type: discount?.type || 'percentage',
        value: discount?.value || 0,
    });
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: discount?.id || `disc-${Date.now()}`,
            name: formData.name,
            type: formData.type,
            value: parseFloat(String(formData.value)),
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-8" role="dialog" aria-modal="true" aria-labelledby="discount-modal-title">
                <form onSubmit={handleSubmit}>
                    <h2 id="discount-modal-title" className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
                        {discount ? 'Edit Discount' : 'Add New Discount'}
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Discount Name</label>
                            <input ref={inputRef} type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                            <select name="type" id="type" value={formData.type} onChange={handleChange} className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount ({storeSettings.currency.symbol})</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="value" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Value</label>
                            <input type="number" name="value" id="value" value={formData.value} onChange={handleChange} required min="0" step="0.01" className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors">Save Discount</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DiscountFormModal;