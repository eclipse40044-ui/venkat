import React, { useEffect } from 'react';
import { Order, StoreSettings } from '../types';

interface InvoiceModalProps {
    order: Order;
    storeSettings: StoreSettings;
    onClose: () => void;
    formatCurrency: (amount: number) => string;
    autoPrint: boolean;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, storeSettings, onClose, formatCurrency, autoPrint }) => {
    const { id: invoiceId, date, items: cartItems, subtotal, taxAmount, total, paymentMethod, customer, appliedDiscount } = order;
    const invoiceDate = new Date(date);
    const { printerSettings } = storeSettings;

    const handlePrint = () => {
        window.print();
    };
    
    useEffect(() => {
        if (autoPrint) {
            const timer = setTimeout(() => {
                handlePrint();
            }, 500); // Delay to allow modal to render fully
            return () => clearTimeout(timer);
        }
    }, [autoPrint]);


    const paperWidthClass = printerSettings.paperWidth === '58mm' ? 'paper-58mm' : 'paper-80mm';
    
    const receiptStyle: React.CSSProperties = {
        '--receipt-font-family': storeSettings.printerSettings.fontFamily,
    } as React.CSSProperties;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 no-print">
            <div id="invoice-section" style={receiptStyle} className={`printable-area ${paperWidthClass} bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] flex flex-col`}>
                <div className="flex-grow overflow-y-auto">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Invoice</h2>
                            <p className="text-slate-500 dark:text-slate-400">{invoiceId}</p>
                             <p className="text-slate-500 dark:text-slate-400">Date: {invoiceDate.toLocaleString()}</p>
                        </div>
                        <div className="flex items-start justify-end gap-4 text-right">
                            {storeSettings.showLogoOnInvoice && (
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{storeSettings.storeName}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{storeSettings.storeAddressLine1}</p>
                                    {storeSettings.storeAddressLine2 && <p className="text-sm text-slate-500 dark:text-slate-400">{storeSettings.storeAddressLine2}</p>}
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{`${storeSettings.storeCity}, ${storeSettings.storeState} ${storeSettings.storeZipCode}`}</p>
                                    {storeSettings.storeMobile && <p className="text-sm text-slate-500 dark:text-slate-400">Tel: {storeSettings.storeMobile}</p>}
                                </div>
                            )}
                            {storeSettings.showLogoOnInvoice && storeSettings.storeLogoUrl && (
                                <img src={storeSettings.storeLogoUrl} alt={`${storeSettings.storeName} logo`} className="h-16 w-16 object-contain rounded-md" />
                            )}
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
                                <tr key={item.id} className={`border-b border-slate-100 dark:border-slate-800 ${item.quantity < 0 ? 'text-red-600 dark:text-red-400' : ''}`}>
                                    <td className="py-3">{item.name} {item.quantity < 0 ? '(Return)' : ''}</td>
                                    <td className="py-3 text-center">{item.quantity}</td>
                                    <td className="py-3 text-right">{formatCurrency(item.price)}</td>
                                    <td className="py-3 text-right">{formatCurrency(item.price * item.quantity)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-end">
                        <div className="w-full max-w-xs space-y-2">
                             <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                <span>Subtotal</span>
                                <span className="font-medium">{formatCurrency(subtotal)}</span>
                            </div>
                             {appliedDiscount && (
                                <div className="flex justify-between text-green-600 dark:text-green-400">
                                    <span>Discount ({appliedDiscount.name})</span>
                                    <span className="font-medium">-{formatCurrency(appliedDiscount.amount)}</span>
                                </div>
                            )}
                            {taxAmount > 0 && (
                                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                    <span>Tax ({ (storeSettings.taxRate * 100).toFixed(0) }%)</span>
                                    <span className="font-medium">{formatCurrency(taxAmount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2 pt-2 border-t-2 border-slate-200 dark:border-slate-700">
                                <span>{total < 0 ? 'Total Refund' : 'Total Due'}</span>
                                <span>{formatCurrency(Math.abs(total))}</span>
                            </div>
                            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                                {(order.payments && order.payments.length > 1) ? (
                                    <>
                                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                            <span>{total < 0 ? 'Refunded via' : 'Paid via'}</span>
                                            <span className="font-medium">Split Payment</span>
                                        </div>
                                        {order.payments.map((p, i) => (
                                            <div key={i} className="flex justify-between text-sm text-slate-500 dark:text-slate-400 pl-4">
                                                <span>- {p.method}</span>
                                                <span>{formatCurrency(p.amount)}</span>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                        <span>{total < 0 ? 'Refunded via' : 'Paid with'}</span>
                                        <span className="font-medium">{paymentMethod}</span>
                                    </div>
                                )}
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