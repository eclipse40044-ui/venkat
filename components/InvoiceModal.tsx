import React from 'react';
import { Order, StoreSettings } from '../types';

interface InvoiceModalProps {
    order: Order;
    storeSettings: StoreSettings;
    onClose: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, storeSettings, onClose }) => {
    const { id: invoiceId, date, items: cartItems, subtotal, taxAmount, total, paymentMethod, customer, appliedDiscount } = order;
    const invoiceDate = new Date(date);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <style>
                {`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #invoice-section, #invoice-section * {
                        visibility: visible;
                    }
                    #invoice-section {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        background: white !important;
                        color: black !important;
                    }
                    .dark #invoice-section * {
                        color: black !important;
                    }
                    .no-print {
                        display: none;
                    }
                }
                `}
            </style>
            <div id="invoice-section" className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] flex flex-col">
                <div className="flex-grow overflow-y-auto">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Invoice</h2>
                            <p className="text-slate-500 dark:text-slate-400">{invoiceId}</p>
                             <p className="text-slate-500 dark:text-slate-400">Date: {invoiceDate.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{storeSettings.storeName}</h3>
                            <p className="text-slate-500 dark:text-slate-400">{storeSettings.storeAddress}</p>
                        </div>
                    </div>

                    {customer && (
                        <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <h4 className="font-semibold text-slate-700 dark:text-slate-200">Bill To:</h4>
                            <p className="text-slate-600 dark:text-slate-300">{customer.name}</p>
                            <p className="text-slate-600 dark:text-slate-300">{customer.email}</p>
                            <p className="text-slate-600 dark:text-slate-300">{customer.phone}</p>
                        </div>
                    )}


                    <table className="w-full text-left mb-8">
                        <thead>
                            <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                                <th className="py-2 font-semibold">Item</th>
                                <th className="py-2 font-semibold text-center">Qty</th>
                                <th className="py-2 font-semibold text-right">Unit Price</th>
                                <th className="py-2 font-semibold text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cartItems.map(item => (
                                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800">
                                    <td className="py-3">{item.name}</td>
                                    <td className="py-3 text-center">{item.quantity}</td>
                                    <td className="py-3 text-right">${item.price.toFixed(2)}</td>
                                    <td className="py-3 text-right">${(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-end">
                        <div className="w-full max-w-xs space-y-2">
                             <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                <span>Subtotal</span>
                                <span className="font-medium">${subtotal.toFixed(2)}</span>
                            </div>
                             {appliedDiscount && (
                                <div className="flex justify-between text-green-600 dark:text-green-400">
                                    <span>Discount ({appliedDiscount.name})</span>
                                    <span className="font-medium">-${appliedDiscount.amount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                <span>Tax ({ (storeSettings.taxRate * 100).toFixed(0) }%)</span>
                                <span className="font-medium">${taxAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2 pt-2 border-t-2 border-slate-200 dark:border-slate-700">
                                <span>Total Due</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-700">
                                <span>Paid with</span>
                                <span className="font-medium">{paymentMethod}</span>
                            </div>
                        </div>
                    </div>
                     <p className="text-center text-slate-500 dark:text-slate-400 mt-10 text-sm">Thank you for your purchase!</p>
                </div>
                <div className="no-print mt-8 flex justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Close</button>
                    <button onClick={handlePrint} className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors">Print Invoice</button>
                </div>
            </div>
        </div>
    );
};

export default InvoiceModal;