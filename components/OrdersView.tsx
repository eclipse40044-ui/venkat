import React, { useState, useMemo } from 'react';
import { Order, User } from '../types';

interface OrdersViewProps {
    orders: Order[];
    users: User[];
    currentUser: User;
    onReprint: (order: Order) => void;
    onRefund: (orderId: string) => void;
}

const ITEMS_PER_PAGE = 10;

const OrdersView: React.FC<OrdersViewProps> = ({ orders, users, currentUser, onReprint, onRefund }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [paymentFilter, setPaymentFilter] = useState('');
    const [cashierFilter, setCashierFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const userMap = useMemo(() => new Map(users.map(u => [u.id, u.name])), [users]);
    const canRefund = currentUser.role === 'Admin' || currentUser.role === 'Manager';

    const filteredOrders = useMemo(() => {
        return orders
            .filter(order => {
                const lowerSearchTerm = searchTerm.toLowerCase();

                // Date range filter
                if (dateRange.start && new Date(order.date) < new Date(dateRange.start)) return false;
                if (dateRange.end) {
                    const endDate = new Date(dateRange.end);
                    endDate.setHours(23, 59, 59, 999); // Include the whole day
                    if (new Date(order.date) > endDate) return false;
                }
                
                // Payment method filter
                if (paymentFilter && order.paymentMethod !== paymentFilter) return false;

                // Cashier filter
                if (cashierFilter && order.userId !== cashierFilter) return false;
                
                // Search term filter (ID, Customer Name, Product Barcode)
                if (searchTerm) {
                    const matchesId = order.id.toLowerCase().includes(lowerSearchTerm);
                    const matchesCustomer = order.customer?.name.toLowerCase().includes(lowerSearchTerm);
                    const matchesBarcode = order.items.some(item => item.barcode.includes(searchTerm));
                    return matchesId || matchesCustomer || matchesBarcode;
                }

                return true;
            });
    }, [orders, searchTerm, dateRange, paymentFilter, cashierFilter]);

    const paginatedOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredOrders, currentPage]);

    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

    const handleRefundClick = (order: Order) => {
        if (order.status === 'refunded') {
            alert("This order has already been refunded.");
            return;
        }
        if (window.confirm(`Are you sure you want to refund order ${order.id}? This action cannot be undone.`)) {
            onRefund(order.id);
        }
    };
    
    return (
        <main className="container mx-auto p-4 md:p-6 lg:p-8">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">Order Management</h2>

            {/* Filters */}
            <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md mb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search Input */}
                    <input
                        type="text"
                        placeholder="Search by ID, Customer, Barcode..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {/* Date Range Start */}
                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => { setDateRange(prev => ({...prev, start: e.target.value})); setCurrentPage(1); }}
                        className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-slate-500"
                    />
                    {/* Date Range End */}
                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => { setDateRange(prev => ({...prev, end: e.target.value})); setCurrentPage(1); }}
                        className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-slate-500"
                    />
                    {/* Payment Method Dropdown */}
                    <select
                        value={paymentFilter}
                        onChange={(e) => { setPaymentFilter(e.target.value); setCurrentPage(1); }}
                        className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">All Payment Methods</option>
                        <option value="Cash">Cash</option>
                        <option value="G pay">G pay</option>
                    </select>
                    {/* Cashier Dropdown */}
                     <select
                        value={cashierFilter}
                        onChange={(e) => { setCashierFilter(e.target.value); setCurrentPage(1); }}
                        className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">All Cashiers</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Order ID</th>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Customer</th>
                            <th scope="col" className="px-6 py-3">Cashier</th>
                            <th scope="col" className="px-6 py-3 text-center">Items</th>
                            <th scope="col" className="px-6 py-3 text-right">Total</th>
                            <th scope="col" className="px-6 py-3">Payment</th>
                            <th scope="col" className="px-6 py-3 text-center">Status</th>
                            <th scope="col" className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedOrders.map(order => (
                            <tr key={order.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                                <th scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{order.id}</th>
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(order.date).toLocaleString()}</td>
                                <td className="px-6 py-4">{order.customer?.name || 'Walk-in'}</td>
                                <td className="px-6 py-4">{userMap.get(order.userId) || 'Unknown'}</td>
                                <td className="px-6 py-4 text-center">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                                <td className="px-6 py-4 text-right font-semibold">${order.total.toFixed(2)}</td>
                                <td className="px-6 py-4">{order.paymentMethod}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        order.status === 'completed' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
                                    }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                    <button onClick={() => onReprint(order)} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Reprint</button>
                                    {canRefund && (
                                        <button 
                                            onClick={() => handleRefundClick(order)} 
                                            className={`font-medium ${order.status === 'refunded' ? 'text-slate-400 cursor-not-allowed' : 'text-red-600 dark:text-red-400 hover:underline'}`}
                                            disabled={order.status === 'refunded'}
                                        >
                                            Refund
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {paginatedOrders.length === 0 && (
                     <div className="text-center py-10">
                        <p className="text-slate-500 dark:text-slate-400">No orders found matching your criteria.</p>
                    </div>
                )}
            </div>

             {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                        Showing page {currentPage} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-sm font-medium bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 text-sm font-medium bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
};

export default OrdersView;