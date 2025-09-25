import React, { useState, useEffect, useRef } from 'react';
import { CartLabels } from '../types';

interface CartCustomizationModalProps {
    currentLabels: CartLabels;
    onClose: () => void;
    onSave: (labels: CartLabels) => void;
}

const CartCustomizationModal: React.FC<CartCustomizationModalProps> = ({ currentLabels, onClose, onSave }) => {
    const [labels, setLabels] = useState<CartLabels>(currentLabels);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLabels(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(labels);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-8" role="dialog" aria-modal="true" aria-labelledby="cart-labels-modal-title">
                <form onSubmit={handleSubmit}>
                    <h2 id="cart-labels-modal-title" className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
                        Customize Cart Labels
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="subtotal" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subtotal Label</label>
                            <input ref={inputRef} type="text" name="subtotal" id="subtotal" value={labels.subtotal} onChange={handleChange} required className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="discount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Discount Label</label>
                            <input type="text" name="discount" id="discount" value={labels.discount} onChange={handleChange} required className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="tax" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tax Label</label>
                            <input type="text" name="tax" id="tax" value={labels.tax} onChange={handleChange} required className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                            {/* FIX: Use a template literal to prevent the JSX parser from misinterpreting "{rate}" as a variable. */}
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                {`Use {rate} as a placeholder for the tax percentage, e.g., "VAT ({rate}%)".`}
                            </p>
                        </div>
                         <div>
                            <label htmlFor="total" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Total Label</label>
                            <input type="text" name="total" id="total" value={labels.total} onChange={handleChange} required className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CartCustomizationModal;