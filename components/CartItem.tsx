
import React, { useState, useEffect } from 'react';
import { CartItem, StoreSettings } from '../types';
import { formatCurrency } from '../utils';

interface CartItemProps {
    item: CartItem;
    onUpdateQuantity: (productId: string, quantity: number) => void;
    onRemoveFromCart: (productId: string) => void;
    storeSettings: StoreSettings;
}

const CartItemComponent: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemoveFromCart, storeSettings }) => {
    const [inputValue, setInputValue] = useState(item.quantity.toString());
    const isWeighted = item.unit === 'lb';

    useEffect(() => {
        setInputValue(item.quantity.toString());
    }, [item.quantity]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const regex = isWeighted ? /^-?\d*\.?\d*$/ : /^-?\d*$/; // Allow negative sign
        if (regex.test(value)) {
            setInputValue(value);
        }
    };

    const handleInputBlur = () => {
        const newQuantity = isWeighted ? parseFloat(inputValue) : parseInt(inputValue, 10);
        if (isNaN(newQuantity)) {
            setInputValue(item.quantity.toString());
        } else {
            if (newQuantity !== item.quantity) {
                onUpdateQuantity(item.id, newQuantity);
            }
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur();
        }
    };

    return (
        <li className={`flex items-center gap-4 p-2 rounded-lg ${item.quantity < 0 ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
            <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
            <div className="flex-grow">
                <p className="font-semibold text-slate-800 dark:text-slate-100">{item.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {formatCurrency(item.price, storeSettings)}{isWeighted && ` / ${item.unit}`}
                </p>
                 <div className="flex items-center gap-2 mt-1">
                    {!isWeighted && (
                        <button 
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} 
                            className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            aria-label={`Decrease quantity of ${item.name}`}
                        >
                            -
                        </button>
                    )}
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        onKeyDown={handleKeyDown}
                        className="w-12 h-6 text-center rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        aria-label={`Quantity for ${item.name}`}
                        inputMode={isWeighted ? "decimal" : "numeric"}
                    />
                     {!isWeighted && (
                        <button 
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} 
                            className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            aria-label={`Increase quantity of ${item.name}`}
                        >
                            +
                        </button>
                    )}
                    {isWeighted && <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{item.unit}</span>}
                </div>
            </div>
            <div className="flex flex-col items-end">
                <span className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(item.price * item.quantity, storeSettings)}</span>
                <button 
                    onClick={() => onRemoveFromCart(item.id)} 
                    className="mt-1 text-slate-400 dark:text-slate-500 hover:text-red-500"
                    aria-label={`Remove ${item.name} from cart`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002 2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </li>
    );
};

export default CartItemComponent;