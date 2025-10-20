import React from 'react';
import { StoreSettings } from '../types';

interface SampleReceiptProps {
    storeSettings: StoreSettings;
    formatCurrency: (amount: number) => string;
}

const SampleReceipt: React.FC<SampleReceiptProps> = ({ storeSettings, formatCurrency }) => {
    const { printerSettings } = storeSettings;
    const paperWidthClass = printerSettings.paperWidth === '58mm' ? 'paper-58mm' : 'paper-80mm';

    const receiptStyle: React.CSSProperties = {
        '--receipt-font-family': storeSettings.printerSettings.fontFamily,
    } as React.CSSProperties;

    return (
        <div style={receiptStyle} className={`printable-area ${paperWidthClass} bg-white`}>
            <div className="text-center mb-2">
                {storeSettings.showLogoOnInvoice && storeSettings.storeLogoUrl && (
                    <img src={storeSettings.storeLogoUrl} alt="logo" className="mx-auto h-16 w-auto object-contain" />
                )}
                <h3 className="text-xl font-bold">{storeSettings.storeName}</h3>
                <p className="text-sm">{storeSettings.storeAddressLine1}</p>
                <p className="text-sm">{`${storeSettings.storeCity}, ${storeSettings.storeState} ${storeSettings.storeZipCode}`}</p>
                <p className="text-sm">Tel: {storeSettings.storeMobile}</p>
                <p className="text-sm font-semibold border-t border-b border-dashed border-black py-1 my-1">-- SAMPLE RECEIPT --</p>
            </div>
            <div className="text-sm border-b border-dashed border-black pb-1 mb-1">
                <div className="flex justify-between">
                    <span>Order: #TEST-001</span>
                    <span>{new Date().toLocaleDateString()}</span>
                </div>
                 <div className="flex justify-between">
                    <span>Cashier: Admin</span>
                    <span>{new Date().toLocaleTimeString()}</span>
                </div>
            </div>
            <table className="w-full text-sm my-2">
                <thead>
                    <tr className="border-b border-dashed border-black">
                        <th className="text-left font-semibold">Item</th>
                        <th className="text-center font-semibold">Qty</th>
                        <th className="text-right font-semibold">Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Sample Product A</td>
                        <td className="text-center">2</td>
                        <td className="text-right">{formatCurrency(10.00)}</td>
                    </tr>
                    <tr>
                        <td>Sample Product B</td>
                        <td className="text-center">1</td>
                        <td className="text-right">{formatCurrency(5.50)}</td>
                    </tr>
                </tbody>
            </table>
            <div className="border-t border-dashed border-black pt-2 mt-2 text-sm">
                <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(15.50)}</span></div>
                <div className="flex justify-between"><span>Tax:</span><span>{formatCurrency(1.24)}</span></div>
                <div className="flex justify-between font-bold text-base mt-1 border-t border-black pt-1">
                    <span>Total:</span><span>{formatCurrency(16.74)}</span>
                </div>
            </div>
            <p className="text-center text-xs mt-4">Thank you for your business!</p>
        </div>
    );
};

export default SampleReceipt;