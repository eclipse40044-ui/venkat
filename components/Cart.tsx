import React, { useMemo, useState } from 'react';
import { CartItem, Discount, CartLabels } from '../types';
import CartItemComponent from './CartItem';
import CartCustomizationModal from './CartCustomizationModal';

interface CartProps {
    cartItems: CartItem[];
    taxRate: number;
    discounts: Discount[];
    appliedDiscountId: string;
    onApplyDiscount: (discountId: string) => void;
    cartLabels: CartLabels;
    onSaveLabels: (labels: CartLabels) => void;
    onUpdateQuantity: (productId: string, quantity: number) => void;
    onRemoveFromCart: (productId: string) => void;
    onCheckout: (paymentMethod: string) => void;
    onClearCart: () => void;
    walkInCustomerPhone: string;
    onPhoneChange: (phone: string) => void;
}

const Cart: React.FC<CartProps> = (props) => {
    const { 
        cartItems, 
        taxRate, 
        discounts, appliedDiscountId, onApplyDiscount,
        cartLabels, onSaveLabels,
        onUpdateQuantity, onRemoveFromCart, onCheckout, onClearCart,
        walkInCustomerPhone, onPhoneChange
    } = props;
    
    const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);

    const { subtotal, discountAmount, totalAfterDiscount, taxAmount, total } = useMemo(() => {
        const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        
        let discountAmount = 0;
        const selectedDiscount = discounts.find(d => d.id === appliedDiscountId);

        if(selectedDiscount) {
            if(selectedDiscount.type === 'percentage') {
                discountAmount = subtotal * (selectedDiscount.value / 100);
            } else {
                discountAmount = selectedDiscount.value;
            }
        }
        discountAmount = Math.min(discountAmount, subtotal);

        const totalAfterDiscount = subtotal - discountAmount;
        const taxAmount = totalAfterDiscount * taxRate;
        const total = totalAfterDiscount + taxAmount;
        
        return { subtotal, discountAmount, totalAfterDiscount, taxAmount, total };
    }, [cartItems, taxRate, discounts, appliedDiscountId]);
    
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 sticky top-28">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Current Order</h2>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsCustomizeModalOpen(true)}
                        className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                        aria-label="Customize cart labels"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="http://www.w3.org/2000/svg" fill="currentColor">
                            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                    </button>
                    {cartItems.length > 0 && (
                         <button
                            onClick={onClearCart}
                            className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                        >
                            Clear All
                        </button>
                    )}
                </div>
            </div>
            
            <div className="max-h-80 overflow-y-auto pr-2 -mr-2">
                {cartItems.length === 0 ? (
                    <div className="text-center py-10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-20 w-20 text-slate-200 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <h3 className="mt-4 font-semibold text-lg text-slate-700 dark:text-slate-200">Your Cart is Empty</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Start adding products to see them here.</p>
                    </div>
                ) : (
                    <ul className="space-y-4">
                        {cartItems.map(item => (
                            <CartItemComponent 
                                key={item.id} 
                                item={item}
                                onUpdateQuantity={onUpdateQuantity}
                                onRemoveFromCart={onRemoveFromCart}
                            />
                        ))}
                    </ul>
                )}
            </div>

            {cartItems.length > 0 && (
                <>
                    <div className="mt-6">
                        <label htmlFor="customer-phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Customer Mobile (Optional)
                        </label>
                        <input
                            type="tel"
                            id="customer-phone"
                            value={walkInCustomerPhone}
                            onChange={(e) => onPhoneChange(e.target.value)}
                            placeholder="For e-receipt or lookup"
                            className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <div className="space-y-2 text-slate-600 dark:text-slate-300">
                            <div className="flex justify-between">
                                <span>{cartLabels.subtotal}</span>
                                <span className="font-medium">${subtotal.toFixed(2)}</span>
                            </div>

                             <div className="flex justify-between items-center">
                                <label htmlFor="discount-select" className="text-sm">{cartLabels.discount}</label>
                                <select 
                                    id="discount-select"
                                    value={appliedDiscountId}
                                    onChange={(e) => onApplyDiscount(e.target.value)}
                                    className="text-sm border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 max-w-[150px] p-1"
                                >
                                    <option value="">No Discount</option>
                                    {discounts.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            {discountAmount > 0 && (
                                 <div className="flex justify-between text-green-600 dark:text-green-400">
                                    <span>Discount Applied</span>
                                    <span className="font-medium">-${discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            
                            <div className="flex justify-between">
                                <span>{cartLabels.tax.replace('{rate}', (taxRate * 100).toFixed(0))}</span>
                                <span className="font-medium">${taxAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-slate-800 dark:text-slate-100 mt-2">
                                <span>{cartLabels.total}</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="mt-6">
                            <h3 className="text-center font-semibold text-slate-600 dark:text-slate-300 mb-3">Select Payment Method</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => onCheckout('Cash')} className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center gap-3 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                    <span className="font-semibold text-slate-700 dark:text-slate-200">Cash</span>
                                </button>
                                 <button onClick={() => onCheckout('G pay')} className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center gap-3 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10v11h18V10M3 7v3h18V7L12 3 3 7z" /></svg>
                                    <span className="font-semibold text-slate-700 dark:text-slate-200">G pay</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
            
            {isCustomizeModalOpen && (
                <CartCustomizationModal
                    currentLabels={cartLabels}
                    onClose={() => setIsCustomizeModalOpen(false)}
                    onSave={(newLabels) => {
                        onSaveLabels(newLabels);
                        setIsCustomizeModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default Cart;
