import React, { useState, useEffect, useRef } from 'react';

type DiscountValue = { type: 'fixed' | 'percentage', value: number };

interface ManualDiscountModalProps {
    currentDiscount: DiscountValue | null;
    onClose: () => void;
    onApply: (discount: DiscountValue) => void;
}

const ManualDiscountModal: React.FC<ManualDiscountModalProps> = ({ currentDiscount, onClose, onApply }) => {
    const [type, setType] = useState<'fixed' | 'percentage'>(currentDiscount?.type || 'fixed');
    const [value, setValue] = useState<string>(currentDiscount?.value?.toString() || '');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue) && numericValue >= 0) {
            onApply({ type, value: numericValue });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-8" role="dialog" aria-modal="true" aria-labelledby="manual-discount-title">
                <form onSubmit={handleSubmit}>
                    <h2 id="manual-discount-title" className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
                        Manual Discount
                    </h2>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Discount Type</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="discountType"
                                    value="fixed"
                                    checked={type === 'fixed'}
                                    onChange={() => setType('fixed')}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600"
                                />
                                <span className="text-slate-700 dark:text-slate-200">Fixed Amount ($)</span>
                            </label>
                             <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="discountType"
                                    value="percentage"
                                    checked={type === 'percentage'}
                                    onChange={() => setType('percentage')}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600"
                                />
                                <span className="text-slate-700 dark:text-slate-200">Percentage (%)</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="discountValue" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Discount Value</label>
                        <div className="relative">
                            <input
                                ref={inputRef}
                                type="number"
                                id="discountValue"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                required
                                min="0"
                                step="0.01"
                                className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 pl-7"
                            />
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">{type === 'fixed' ? '$' : '%'}</span>
                        </div>
                    </div>
                    
                    <div className="mt-8 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors">Apply Discount</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ManualDiscountModal;