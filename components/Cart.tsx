
import React, { useMemo, useState } from 'react';
import { CartItem, Discount, StoreSettings } from '../types';
import CartItemComponent from './CartItem';
import ManualDiscountModal from './ManualDiscountModal';
import { formatCurrency } from '../utils';

interface CartProps {
    cartItems: CartItem[];
    storeSettings: StoreSettings;
    discounts: Discount[];
    appliedDiscountId: string;
    onApplyDiscount: (discountId: string) => void;
    manualDiscount: { type: 'fixed' | 'percentage', value: number } | null;
    onSetManualDiscount: (discount: { type: 'fixed' | 'percentage', value: number } | null) => void;
    onUpdateQuantity: (productId: string, quantity: number) => void;
    onRemoveFromCart: (productId: string) => void;
    onCheckout: (paymentMethod: string) => void;
    onClearCart: () => void;
    walkInCustomerPhone: string;
    onPhoneChange: (phone: string) => void;
    onInitiateSplitBill: () => void;
    cartMode: 'sale' | 'return';
    onSetCartMode: (mode: 'sale' | 'return') => void;
}

const Cart: React.FC<CartProps> = (props) => {
    const { 
        cartItems, 
        storeSettings,
        discounts, appliedDiscountId, onApplyDiscount,
        manualDiscount, onSetManualDiscount,
        onUpdateQuantity, onRemoveFromCart, onCheckout, onClearCart,
        walkInCustomerPhone, onPhoneChange,
        onInitiateSplitBill,
        cartMode, onSetCartMode
    } = props;
    
    const [isManualDiscountModalOpen, setIsManualDiscountModalOpen] = useState(false);

    const { subtotal, discountAmount, totalAfterDiscount, taxAmount, total, appliedDiscountName } = useMemo(() => {
        const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        
        let discountAmount = 0;
        let appliedDiscountName = '';
        
        if (manualDiscount && manualDiscount.value > 0) {
            appliedDiscountName = 'Manual Discount';
            if (manualDiscount.type === 'percentage') {
                discountAmount = subtotal * (manualDiscount.value / 100);
            } else {
                discountAmount = manualDiscount.value;
            }
        } else {
            const selectedDiscount = discounts.find(d => d.id === appliedDiscountId);
            if(selectedDiscount) {
                appliedDiscountName = selectedDiscount.name;
                if(selectedDiscount.type === 'percentage') {
                    discountAmount = subtotal * (selectedDiscount.value / 100);
                } else {
                    discountAmount = selectedDiscount.value;
                }
            }
        }
        
        if (subtotal > 0) {
            discountAmount = Math.min(discountAmount, subtotal);
        } else {
            discountAmount = 0;
        }

        const totalAfterDiscount = subtotal - discountAmount;
        const taxAmount = storeSettings.isTaxEnabled ? ((totalAfterDiscount > 0 ? totalAfterDiscount : 0) * storeSettings.taxRate) : 0;
        const total = totalAfterDiscount + taxAmount;
        
        return { subtotal, discountAmount, totalAfterDiscount, taxAmount, total, appliedDiscountName };
    }, [cartItems, storeSettings.taxRate, storeSettings.isTaxEnabled, discounts, appliedDiscountId, manualDiscount]);

    const renderPaymentSection = () => {
        if (total > 0) {
            return (
                 <>
                    <h3 className="text-center font-semibold text-slate-600 dark:text-slate-300 mb-3">Select Payment Method</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => onCheckout('Cash')} className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center gap-3 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">Pay Cash</span>
                        </button>
                         <button onClick={() => onCheckout('G pay')} className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center gap-3 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10v11h18V10M3 7v3h18V7L12 3 3 7z" /></svg>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">Pay G pay</span>
                        </button>
                        <button onClick={onInitiateSplitBill} className="col-span-2 p-4 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center gap-3 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                            </svg>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">Split Bill</span>
                        </button>
                    </div>
                </>
            )
        } else if (total < 0) {
            return (
                 <>
                    <h3 className="text-center font-semibold text-slate-600 dark:text-slate-300 mb-3">Select Refund Method</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => onCheckout('Cash Refund')} className="p-4 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center gap-3 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 dark:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                             <span className="font-semibold text-red-700 dark:text-red-200">Refund Cash</span>
                        </button>
                        <button onClick={() => onCheckout('G pay Refund')} className="p-4 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center gap-3 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 dark:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10v11h18V10M3 7v3h18V7L12 3 3 7z" /></svg>
                             <span className="font-semibold text-red-700 dark:text-red-200">Refund G pay</span>
                        </button>
                    </div>
                </>
            )
        } else {
             return (
                <button onClick={() => onCheckout('Exchange')} className="w-full p-4 bg-indigo-600 text-white rounded-lg text-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
                    Complete Exchange
                </button>
             )
        }
    }
    
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 sticky top-28">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Current Order</h2>
                 <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-700 p-1 rounded-full">
                        <button
                            onClick={() => onSetCartMode('sale')}
                            className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${cartMode === 'sale' ? 'bg-white dark:bg-slate-800 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}
                        >Sale</button>
                        <button
                            onClick={() => onSetCartMode('return')}
                            className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${cartMode === 'return' ? 'bg-white dark:bg-slate-800 shadow text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-300'}`}
                        >Return</button>
                    </div>
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
                                storeSettings={storeSettings}
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
                                <span>{storeSettings.cartLabels.subtotal}</span>
                                <span className="font-medium">{formatCurrency(subtotal, storeSettings)}</span>
                            </div>

                             <div className="flex justify-between items-center">
                                <label htmlFor="discount-select" className="text-sm">{storeSettings.cartLabels.discount}</label>
                                <div className="flex items-center gap-2">
                                    <select 
                                        id="discount-select"
                                        value={appliedDiscountId}
                                        onChange={(e) => {
                                            onApplyDiscount(e.target.value);
                                            onSetManualDiscount(null);
                                        }}
                                        disabled={!!manualDiscount || subtotal < 0}
                                        className="text-sm border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 max-w-[120px] p-1 disabled:opacity-50"
                                    >
                                        <option value="">No Discount</option>
                                        {discounts.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                     <button
                                        type="button"
                                        onClick={() => setIsManualDiscountModalOpen(true)}
                                        disabled={subtotal < 0}
                                        className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Manual
                                    </button>
                                </div>
                            </div>
                            
                            {discountAmount > 0 && (
                                <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                                    <div className="flex items-center gap-1">
                                        <span>{appliedDiscountName}</span>
                                        {manualDiscount && (
                                            <button
                                                onClick={() => onSetManualDiscount(null)}
                                                className="text-red-500 hover:text-red-700"
                                                aria-label="Remove manual discount"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                    <span className="font-medium">-{formatCurrency(discountAmount, storeSettings)}</span>
                                </div>
                            )}
                            
                            {storeSettings.isTaxEnabled && (
                                <div className="flex justify-between">
                                    <span>{storeSettings.cartLabels.tax.replace('{rate}', (storeSettings.taxRate * 100).toFixed(0))}</span>
                                    <span className="font-medium">{formatCurrency(taxAmount, storeSettings)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-xl font-bold text-slate-800 dark:text-slate-100 mt-2">
                                <span>{total < 0 ? 'Total Refund' : storeSettings.cartLabels.total}</span>
                                <span>{formatCurrency(Math.abs(total), storeSettings)}</span>
                            </div>
                        </div>
                        <div className="mt-6">
                            {renderPaymentSection()}
                        </div>
                    </div>
                </>
            )}
            
            {isManualDiscountModalOpen && (
                <ManualDiscountModal
                    currentDiscount={manualDiscount}
                    onClose={() => setIsManualDiscountModalOpen(false)}
                    onApply={(discount) => {
                        onSetManualDiscount(discount);
                        onApplyDiscount(''); // Clear dropdown selection
                        setIsManualDiscountModalOpen(false);
                    }}
                    storeSettings={storeSettings}
                />
            )}
        </div>
    );
};

export default Cart;