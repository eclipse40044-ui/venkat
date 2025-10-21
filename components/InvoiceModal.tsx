import React from 'react';
import { Order, StoreSettings, User } from '../types';
import { formatCurrency } from '../utils';

interface InvoiceModalProps {
    order: Order;
    storeSettings: StoreSettings;
    onClose: () => void;
    users: User[];
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, storeSettings, onClose, users }) => {
    const { id: invoiceId, date, items: cartItems, subtotal, taxAmount, total, paymentMethod, customer, appliedDiscount, userId } = order;
    const invoiceDate = new Date(date);
    const cashierName = users.find(u => u.id === userId)?.name || 'Unknown';
    const { fontSettings } = storeSettings;

    const getFontStack = (fontFamily: string) => {
        const sansSerifFonts = ['Arial', 'Verdana'];
        const serifFonts = ['Times New Roman'];
        if (sansSerifFonts.includes(fontFamily)) {
            return `'${fontFamily}', sans-serif`;
        }
        if (serifFonts.includes(fontFamily)) {
            return `'${fontFamily}', serif`;
        }
        return `'${fontFamily}', monospace`;
    };
    
    const fontStack = getFontStack(fontSettings.fontFamily);


    const handlePrint = () => {
        window.print();
    };

    const fontSizeClass = {
        small: 'text-xs',
        medium: 'text-sm',
        large: 'text-base',
    }[fontSettings.fontSize || 'medium'];

    const invoiceDynamicStyles = {
        fontFamily: fontStack,
        fontWeight: fontSettings.isBold ? '700' : '400',
        fontStyle: fontSettings.isItalic ? 'italic' : 'normal',
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <style>
                {`
                #invoice-section { color: ${fontSettings.textColor}; }
                .dark #invoice-section { color: ${fontSettings.textColorDark}; }

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
                        color: ${fontSettings.textColor} !important;
                        font-family: ${fontStack} !important;
                        font-weight: ${fontSettings.isBold ? 'bold' : 'normal'} !important;
                        font-style: ${fontSettings.isItalic ? 'italic' : 'normal'} !important;
                    }
                    .dark #invoice-section * {
                        color: ${fontSettings.textColor} !important;
                    }
                    #invoice-section img {
                        -webkit-print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    .font-barcode {
                        font-family: 'Libre Barcode 128', cursive !important;
                    }
                    .no-print {
                        display: none;
                    }
                }
                `}
            </style>
            <div 
                id="invoice-section" 
                className={`bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] flex flex-col font-invoice ${fontSizeClass}`}
                style={invoiceDynamicStyles}
            >
                <div className="flex-grow overflow-y-auto">
                     {storeSettings.receiptHeaderText && (
                        <div className="text-center mb-6">
                            <p className="font-semibold">{storeSettings.receiptHeaderText}</p>
                        </div>
                    )}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-3xl font-bold">Invoice</h2>
                            <p className="opacity-70">{invoiceId}</p>
                             <p className="opacity-70">Date: {invoiceDate.toLocaleString()}</p>
                             {storeSettings.showCashierOnInvoice && (
                                <p className="opacity-70">Cashier: {cashierName}</p>
                             )}
                        </div>
                        <div className="flex items-start justify-end gap-4 text-right">
                            {storeSettings.showLogoOnInvoice && (
                                <div>
                                    <h3 className="text-xl font-bold">{storeSettings.storeName}</h3>
                                    {storeSettings.showAddressOnInvoice && (
                                        <>
                                            <p className="text-sm opacity-70">{storeSettings.storeAddressLine1}</p>
                                            {storeSettings.storeAddressLine2 && <p className="text-sm opacity-70">{storeSettings.storeAddressLine2}</p>}
                                            <p className="text-sm opacity-70">{`${storeSettings.storeCity}, ${storeSettings.storeState} ${storeSettings.storeZipCode}`}</p>
                                            {storeSettings.storeMobile && <p className="text-sm opacity-70">Tel: {storeSettings.storeMobile}</p>}
                                        </>
                                    )}
                                </div>
                            )}
                            {storeSettings.showLogoOnInvoice && storeSettings.storeLogoUrl && (
                                <img src={storeSettings.storeLogoUrl} alt={`${storeSettings.storeName} logo`} className="h-16 w-16 object-contain rounded-md" />
                            )}
                        </div>
                    </div>

                    {storeSettings.showCustomerOnInvoice && customer && (
                        <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <h4 className="font-semibold">Bill To:</h4>
                            <p>{customer.name}</p>
                            <p>{customer.email}</p>
                            <p>{customer.phone}</p>
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
                                    <td className="py-3 text-right">{formatCurrency(item.price, storeSettings)}</td>
                                    <td className="py-3 text-right">{formatCurrency(item.price * item.quantity, storeSettings)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-end">
                        <div className="w-full max-w-xs space-y-2">
                             <div className="flex justify-between">
                                <span>{storeSettings.cartLabels.subtotal}</span>
                                <span className="font-medium">{formatCurrency(subtotal, storeSettings)}</span>
                            </div>
                             {appliedDiscount && (
                                <div className="flex justify-between text-green-600 dark:text-green-400">
                                    <span>{storeSettings.cartLabels.discount} ({appliedDiscount.name})</span>
                                    <span className="font-medium">-{formatCurrency(appliedDiscount.amount, storeSettings)}</span>
                                </div>
                            )}
                            {taxAmount > 0 && (
                                <div className="flex justify-between">
                                    <span>{storeSettings.cartLabels.tax.replace('{rate}', (storeSettings.taxRate * 100).toFixed(0))}</span>
                                    <span className="font-medium">{formatCurrency(taxAmount, storeSettings)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-2xl font-bold mt-2 pt-2 border-t-2 border-slate-200 dark:border-slate-700">
                                <span>{total < 0 ? 'Total Refund' : storeSettings.cartLabels.total}</span>
                                <span>{formatCurrency(Math.abs(total), storeSettings)}</span>
                            </div>
                            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                                {(order.payments && order.payments.length > 1) ? (
                                    <>
                                        <div className="flex justify-between">
                                            <span>{total < 0 ? 'Refunded via' : 'Paid via'}</span>
                                            <span className="font-medium">Split Payment</span>
                                        </div>
                                        {order.payments.map((p, i) => (
                                            <div key={i} className="flex justify-between text-sm pl-4">
                                                <span>- {p.method}</span>
                                                <span>{formatCurrency(p.amount, storeSettings)}</span>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <div className="flex justify-between">
                                        <span>{total < 0 ? 'Refunded via' : 'Paid with'}</span>
                                        <span className="font-medium">{paymentMethod}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {storeSettings.showBarcodeOnInvoice && (
                        <div className="mt-8 text-center">
                            <div className="font-barcode">{invoiceId}</div>
                        </div>
                    )}
                    
                    {storeSettings.receiptFooterText && (
                         <div className="text-center opacity-70 mt-10 text-sm whitespace-pre-wrap">
                             {storeSettings.receiptFooterText}
                         </div>
                    )}
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