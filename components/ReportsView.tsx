
import React, { useState, useMemo } from 'react';
import { Order, Product, Category, StoreSettings } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, Label } from 'recharts';
import { formatCurrency } from '../utils';

interface ReportsViewProps {
    orders: Order[];
    products: Product[];
    categories: Category[];
    onReprint: (order: Order) => void;
    storeSettings: StoreSettings;
}

type DateRange = 'month' | '30days' | 'all';

// FIX: Changed JSX.Element to React.JSX.Element to resolve "Cannot find namespace 'JSX'" error.
const SummaryCard: React.FC<{ title: string; value: string; icon: React.JSX.Element }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md flex items-center gap-4 transition-all hover:shadow-lg dark:hover:shadow-black/25 hover:-translate-y-1">
        <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
        </div>
    </div>
);

const ReportsView: React.FC<ReportsViewProps> = ({ orders, products, categories, onReprint, storeSettings }) => {
    const [dateRange, setDateRange] = useState<DateRange>('month');

    const completedOrders = useMemo(() => orders.filter(o => o.status === 'completed'), [orders]);

    const filteredOrders = useMemo(() => {
        const now = new Date();
        if (dateRange === 'all' || completedOrders.length === 0) {
            return completedOrders;
        }
        
        let startDate = new Date();
        if (dateRange === 'month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        } else if (dateRange === '30days') {
            startDate.setDate(now.getDate() - 30);
            startDate.setHours(0,0,0,0);
        }

        return completedOrders.filter(order => new Date(order.date) >= startDate);
    }, [completedOrders, dateRange]);
    
    const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories]);
    const productMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);

    const summaryData = useMemo(() => {
        const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = filteredOrders.length;
        const totalItems = filteredOrders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        return { totalRevenue, totalOrders, totalItems, avgOrderValue };
    }, [filteredOrders]);

    const dailySalesData = useMemo(() => {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
    
        const todaysOrders = completedOrders.filter(order => new Date(order.date) >= todayStart);
        
        const totalRevenue = todaysOrders.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = todaysOrders.length;

        let cashRevenue = 0;
        let gPayRevenue = 0;

        todaysOrders.forEach(order => {
            if (order.paymentMethod === 'Split' && order.payments) {
                 order.payments.forEach(payment => {
                    if (payment.method === 'Cash') {
                        cashRevenue += payment.amount;
                    } else if (payment.method === 'G pay') {
                        gPayRevenue += payment.amount;
                    }
                });
            } else if (order.paymentMethod.includes('Cash')) {
                cashRevenue += order.total;
            } else if (order.paymentMethod.includes('G pay')) {
                gPayRevenue += order.total;
            }
        });
    
        return {
            orders: todaysOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
            totalRevenue,
            totalOrders,
            cashRevenue,
            gPayRevenue,
        };
    }, [completedOrders]);

    const salesByDateData = useMemo(() => {
        const salesMap = new Map<string, number>();
        filteredOrders.forEach(order => {
            const dateKey = new Date(order.date).toLocaleDateString('en-CA'); // YYYY-MM-DD
            salesMap.set(dateKey, (salesMap.get(dateKey) || 0) + order.total);
        });
        return Array.from(salesMap.entries())
            .map(([date, sales]) => ({ date, sales }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [filteredOrders]);

    const topSellingProducts = useMemo(() => {
        const productStats = new Map<string, { quantity: number; sales: number }>();
        filteredOrders.forEach(order => {
            order.items.forEach(item => {
                const stats = productStats.get(item.id) || { quantity: 0, sales: 0 };
                stats.quantity += item.quantity;
                stats.sales += item.quantity * item.price;
                productStats.set(item.id, stats);
            });
        });
        return Array.from(productStats.entries())
            .sort(([, statsA], [, statsB]) => statsB.quantity - statsA.quantity) // sort by quantity sold
            .slice(0, 10)
            .map(([id, stats], index) => ({
                rank: index + 1,
                name: productMap.get(id)?.name || 'Unknown Product',
                quantity: stats.quantity,
                sales: stats.sales,
            }));
    }, [filteredOrders, productMap]);

    const categorySalesData = useMemo(() => {
        const categorySales = new Map<string, number>();
        filteredOrders.forEach(order => {
            order.items.forEach(item => {
                const product = productMap.get(item.id);
                if (product) {
                    const categoryName = categoryMap.get(product.categoryId) || 'Uncategorized';
                    categorySales.set(categoryName, (categorySales.get(categoryName) || 0) + (item.price * item.quantity));
                }
            });
        });
        return Array.from(categorySales.entries()).map(([name, value]) => ({ name, value }));
    }, [filteredOrders, productMap, categoryMap]);

    const paymentMethodsData = useMemo(() => {
        const paymentCounts = new Map<string, number>();
        filteredOrders.forEach(order => {
            paymentCounts.set(order.paymentMethod, (paymentCounts.get(order.paymentMethod) || 0) + 1);
        });
        return Array.from(paymentCounts.entries()).map(([name, value]) => ({ name, value }));
    }, [filteredOrders]);
    
    const PIE_COLORS = ['#4f46e5', '#8b5cf6', '#ec4899', '#f97316', '#10b981'];

    if (orders.length === 0) {
        return (
            <main className="container mx-auto p-8 text-center flex-grow flex flex-col justify-center items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-slate-300 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <h2 className="mt-4 text-2xl font-bold text-slate-700 dark:text-slate-200">No Sales Data Available</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Once you start making sales, your reports will appear here.</p>
            </main>
        );
    }

    return (
        <main className="container mx-auto p-4 md:p-6 lg:p-8">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-8">Sales Reports</h2>

            {/* Daily Sales Section */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md mb-8">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Today's Sales Summary ({new Date().toLocaleDateString()})</h3>
                {dailySalesData.orders.length === 0 ? (
                    <p className="text-slate-500 dark:text-slate-400 text-center py-8">No sales yet today.</p>
                ) : (
                    <div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Revenue</p>
                                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{formatCurrency(dailySalesData.totalRevenue, storeSettings)}</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Orders</p>
                                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{dailySalesData.totalOrders}</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Cash Sales</p>
                                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{formatCurrency(dailySalesData.cashRevenue, storeSettings)}</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">G Pay Sales</p>
                                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{formatCurrency(dailySalesData.gPayRevenue, storeSettings)}</p>
                            </div>
                        </div>
                        
                        <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Today's Transactions</h4>
                        <div className="max-h-60 overflow-y-auto">
                            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                                <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-100 dark:bg-slate-700 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-4 py-2">Order ID</th>
                                        <th scope="col" className="px-4 py-2">Time</th>
                                        <th scope="col" className="px-4 py-2">Items</th>
                                        <th scope="col" className="px-4 py-2 text-right">Amount</th>
                                        <th scope="col" className="px-4 py-2 text-right"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dailySalesData.orders.map(order => (
                                        <tr key={order.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                                            <td className="px-4 py-2 font-medium text-slate-900 dark:text-slate-100">{order.id}</td>
                                            <td className="px-4 py-2">{new Date(order.date).toLocaleTimeString()}</td>
                                            <td className="px-4 py-2">{order.items.length}</td>
                                            <td className="px-4 py-2 text-right font-semibold">{formatCurrency(order.total, storeSettings)}</td>
                                            <td className="px-4 py-2 text-right">
                                                <button onClick={() => onReprint(order)} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Print</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Historical Analysis</h3>
                <div className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 p-1 rounded-full">
                    {(['month', '30days', 'all'] as const).map(range => (
                        <button key={range} onClick={() => setDateRange(range)} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${dateRange === range ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>
                            {range === 'month' ? 'This Month' : range === '30days' ? 'Last 30 Days' : 'All Time'}
                        </button>
                    ))}
                </div>
            </div>

            {filteredOrders.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-slate-400 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /></svg>
                    <h3 className="mt-4 text-xl font-semibold text-slate-700 dark:text-slate-200">No Data For This Period</h3>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">Try selecting a different date range.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        <SummaryCard title="Total Revenue" value={formatCurrency(summaryData.totalRevenue, storeSettings)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>} />
                        <SummaryCard title="Total Orders" value={summaryData.totalOrders.toLocaleString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} />
                        <SummaryCard title="Items Sold" value={summaryData.totalItems.toLocaleString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>} />
                        <SummaryCard title="Avg. Order Value" value={formatCurrency(summaryData.avgOrderValue, storeSettings)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Sales Trend</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={salesByDateData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                                <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'rgb(100 116 139)' }} stroke="#64748b" className="dark:stroke-slate-500 dark:tick-fill-slate-400" />
                                <YAxis tick={{ fontSize: 12, fill: 'rgb(100 116 139)' }} stroke="#64748b" tickFormatter={(value) => formatCurrency(value as number, storeSettings)} className="dark:stroke-slate-500 dark:tick-fill-slate-400" />
                                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0' }} wrapperClassName="dark:!bg-slate-700 dark:!border-slate-600" formatter={(value: number) => formatCurrency(value, storeSettings)} />
                                <Legend wrapperStyle={{fontSize: "12px"}}/>
                                <Line type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Top 10 Selling Products</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                                    <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700/50">
                                        <tr>
                                            <th scope="col" className="px-4 py-3 text-center">Rank</th>
                                            <th scope="col" className="px-4 py-3">Product Name</th>
                                            <th scope="col" className="px-4 py-3 text-right">Qty Sold</th>
                                            <th scope="col" className="px-4 py-3 text-right">Sales</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topSellingProducts.map(p => (
                                            <tr key={p.rank} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                                                <td className="px-4 py-4 text-center font-medium text-slate-900 dark:text-slate-100">{p.rank}</td>
                                                <th scope="row" className="px-4 py-4 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">{p.name}</th>
                                                <td className="px-4 py-4 text-right">{p.quantity.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}</td>
                                                <td className="px-4 py-4 text-right font-semibold">{formatCurrency(p.sales, storeSettings)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                             <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Category-wise Sales</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={categorySalesData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8">
                                            {categorySalesData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0' }} wrapperClassName="dark:!bg-slate-700 dark:!border-slate-600" formatter={(value: number) => formatCurrency(value, storeSettings)} />
                                        <Legend wrapperStyle={{fontSize: "12px"}}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Payment Methods</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={paymentMethodsData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#82ca9d">
                                            {paymentMethodsData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0' }} wrapperClassName="dark:!bg-slate-700 dark:!border-slate-600" />
                                        <Legend wrapperStyle={{fontSize: "12px"}}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default ReportsView;