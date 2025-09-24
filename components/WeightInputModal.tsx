
import React, { useState, useEffect, useRef } from 'react';
import { Product, CartItem } from '../types';

interface WeightInputModalProps {
    product: Product | CartItem;
    onClose: () => void;
    onConfirm: (product: Product, weight: number) => void;
}

const WeightInputModal: React.FC<WeightInputModalProps> = ({ product, onClose, onConfirm }) => {
    const initialWeight = 'quantity' in product ? product.quantity.toString() : '';
    const [weight, setWeight] = useState(initialWeight);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Auto-focus the input field when the modal opens
        inputRef.current?.focus();
        inputRef.current?.select();
    }, []);

    const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Regex to allow numbers and a single decimal point
        if (/^\d*\.?\d*$/.test(value)) {
            setWeight(value);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalWeight = parseFloat(weight);
        if (!isNaN(finalWeight) && finalWeight > 0) {
            onConfirm(product, finalWeight);
        } else {
            // Optional: show an error for invalid input
            onClose(); // Close if input is invalid
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8" 
                role="dialog" 
                aria-modal="true"
                aria-labelledby="weight-modal-title"
            >
                <form onSubmit={handleSubmit}>
                    <h2 id="weight-modal-title" className="text-2xl font-bold text-slate-800 text-center mb-2">Enter Weight</h2>
                    <p className="text-center text-slate-600 mb-6">for {product.name}</p>
                    
                    <div className="relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={weight}
                            onChange={handleWeightChange}
                            className="w-full text-center text-4xl font-bold p-4 rounded-lg border-2 border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow duration-200"
                            aria-label={`Weight in ${product.unit}`}
                            inputMode="decimal"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-medium text-slate-400">{product.unit}</span>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-6 py-3 rounded-lg bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Confirm
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WeightInputModal;