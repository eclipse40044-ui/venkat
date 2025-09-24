import React, { useMemo } from 'react';
import { CartItem, Customer, Discount } from '../types';
import CartItemComponent from './CartItem';

interface CartProps {
    cartItems: CartItem[];
    customers: Customer[];
    selectedCustomerId: string;
    onSelectCustomer: (customerId: string) => void;
    taxRate: number;
    discounts: Discount[];
    appliedDiscountId: string;
    onApplyDiscount: (discountId: string) => void;
    onUpdateQuantity: (productId: string, quantity: number) => void;
    onRemoveFromCart: (productId: string) => void;
    onCheckout: (paymentMethod: string) => void;
    onClearCart: () => void;
}

const Cart: React.FC<CartProps> = (props) => {
    const { 
        cartItems, customers, selectedCustomerId, onSelectCustomer, taxRate, 
        discounts, appliedDiscountId, onApplyDiscount,
        onUpdateQuantity, onRemoveFromCart, onCheckout, onClearCart 
    } = props;

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
        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-28">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-800">Current Order</h2>
                {cartItems.length > 0 && (
                     <button
                        onClick={onClearCart}
                        className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                    >
                        Clear All
                    </button>
                )}
            </div>
            
            <div className="mb-4">
                <label htmlFor="customer-select" className="block text-sm font-medium text-slate-700 mb-1">
                    Customer
                </label>
                <select 
                    id="customer-select" 
                    value={selectedCustomerId} 
                    onChange={(e) => onSelectCustomer(e.target.value)}
                    className="w-full border-slate-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                >
                    <option value="walk-in">Walk-in Customer</option>
                    {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>{customer.name}</option>
                    ))}
                </select>
            </div>

            <div className="max-h-64 overflow-y-auto pr-2 -mr-2">
                {cartItems.length === 0 ? (
                    <div className="text-center py-10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-20 w-20 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <h3 className="mt-4 font-semibold text-lg text-slate-700">Your Cart is Empty</h3>
                        <p className="mt-1 text-sm text-slate-500">Start adding products to see them here.</p>
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
                <div className="mt-6 pt-6 border-t border-slate-200">
                    <div className="space-y-2 text-slate-600">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span className="font-medium">${subtotal.toFixed(2)}</span>
                        </div>

                         <div className="flex justify-between items-center">
                            <label htmlFor="discount-select" className="text-sm">Discount</label>
                            <select 
                                id="discount-select"
                                value={appliedDiscountId}
                                onChange={(e) => onApplyDiscount(e.target.value)}
                                className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 max-w-[150px] p-1"
                            >
                                <option value="">No Discount</option>
                                {discounts.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        {discountAmount > 0 && (
                             <div className="flex justify-between text-green-600">
                                <span>Discount Applied</span>
                                <span className="font-medium">-${discountAmount.toFixed(2)}</span>
                            </div>
                        )}
                        
                        <div className="flex justify-between">
                            <span>Tax ({ (taxRate * 100).toFixed(0) }%)</span>
                            <span className="font-medium">${taxAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-slate-800 mt-2">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="mt-6">
                        <h3 className="text-center font-semibold text-slate-600 mb-3">Select Payment Method</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => onCheckout('Cash')} className="p-4 bg-slate-100 rounded-lg flex items-center justify-center gap-3 hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                <span className="font-semibold text-slate-700">Cash</span>
                            </button>
                             <button onClick={() => onCheckout('G pay')} className="p-4 bg-slate-100 rounded-lg flex items-center justify-center gap-3 hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10v11h18V10M3 7v3h18V7L12 3 3 7z" /></svg>
                                <span className="font-semibold text-slate-700">G pay</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
