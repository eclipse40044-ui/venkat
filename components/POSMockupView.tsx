import React from 'react';

// Sample data for the mockup
const mockProducts = [
  { name: 'Organic Milk', price: '$3.99', img: 'https://picsum.photos/seed/milk/200' },
  { name: 'Sourdough Bread', price: '$4.49', img: 'https://picsum.photos/seed/bread/200' },
  { name: 'Fuji Apples', price: '$2.79/lb', img: 'https://picsum.photos/seed/apples/200' },
  { name: 'Avocado', price: '$1.99', img: 'https://picsum.photos/seed/avocado/200' },
  { name: 'Chicken Breast', price: '$7.99/lb', img: 'https://picsum.photos/seed/chicken/200' },
  { name: 'Cheddar Cheese', price: '$6.49', img: 'https://picsum.photos/seed/cheese/200' },
  { name: 'Tomato Sauce', price: '$2.19', img: 'https://picsum.photos/seed/sauce/200' },
  { name: 'Spaghetti Pasta', price: '$1.89', img: 'https://picsum.photos/seed/pasta/200' },
];

const mockCart = [
    { name: 'Organic Milk', qty: 1, price: 3.99 },
    { name: 'Fuji Apples', qty: 2.5, price: 2.79 },
    { name: 'Avocado', qty: 2, price: 1.99 },
];

const POSMockupView: React.FC = () => {
    const subtotal = mockCart.reduce((acc, item) => acc + item.qty * item.price, 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    return (
        <main className="container mx-auto p-4 md:p-6 lg:p-8">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row h-[calc(100vh-150px)]">
                {/* Main Content - Product Grid */}
                <div className="flex-grow p-6 flex flex-col">
                    <div className="flex-shrink-0 mb-4 flex items-center justify-between">
                         <h2 className="text-2xl font-bold text-slate-800">Products</h2>
                         <div className="hidden sm:flex items-center gap-2">
                            {['All', 'Produce', 'Dairy', 'Bakery'].map(cat => (
                                <button key={cat} className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${cat === 'All' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                    {cat}
                                </button>
                            ))}
                         </div>
                    </div>
                    <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                            {mockProducts.map((p, index) => (
                                <div key={index} className="bg-slate-50 rounded-lg p-3 text-center flex flex-col items-center justify-between cursor-pointer border-2 border-transparent hover:border-indigo-500 transition-all shadow-sm hover:shadow-md">
                                    <img src={p.img} alt={p.name} className="w-24 h-24 object-cover rounded-md mb-2" />
                                    <p className="font-semibold text-sm text-slate-700 leading-tight flex-grow">{p.name}</p>
                                    <p className="text-xs text-slate-500 mt-1">{p.price}</p>
                                </div>
                            ))}
                             {/* Add more for scrolling effect */}
                             {mockProducts.map((p, index) => (
                                <div key={p.name + index} className="bg-slate-50 rounded-lg p-3 text-center flex flex-col items-center justify-between cursor-pointer border-2 border-transparent hover:border-indigo-500 transition-all shadow-sm hover:shadow-md">
                                    <img src={p.img + 'a'} alt={p.name} className="w-24 h-24 object-cover rounded-md mb-2" />
                                    <p className="font-semibold text-sm text-slate-700 leading-tight flex-grow">{p.name}</p>
                                    <p className="text-xs text-slate-500 mt-1">{p.price}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar - Cart & Checkout */}
                <aside className="w-full lg:w-96 bg-slate-100 border-l border-slate-200 p-6 flex flex-col">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Current Order</h2>
                    <div className="flex-grow overflow-y-auto -mx-6 px-6 custom-scrollbar">
                        <ul className="space-y-3">
                           {mockCart.map((item, index) => (
                                <li key={index} className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm">
                                    <div className="flex-grow">
                                        <p className="font-semibold text-slate-800">{item.name}</p>
                                        <p className="text-sm text-slate-500">{item.qty} &times; ${item.price.toFixed(2)}</p>
                                    </div>
                                    <p className="font-bold text-slate-800">${(item.qty * item.price).toFixed(2)}</p>
                                </li>
                           ))}
                        </ul>
                    </div>

                    <div className="flex-shrink-0 mt-6 pt-6 border-t border-slate-200 space-y-2">
                        <div className="flex justify-between text-slate-600">
                            <span>Subtotal</span>
                            <span className="font-medium">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>Tax (8%)</span>
                            <span className="font-medium">${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-2xl font-bold text-slate-800 mt-2">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div className="flex-shrink-0 mt-6 grid grid-cols-2 gap-3">
                        <button className="col-span-2 p-4 bg-indigo-600 text-white rounded-lg text-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            Pay Now
                        </button>
                         <button className="p-4 bg-white text-slate-700 rounded-lg font-semibold border border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow-md">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            Cash
                         </button>
                         <button className="p-4 bg-white text-slate-700 rounded-lg font-semibold border border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow-md">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10v11h18V10M3 7v3h18V7L12 3 3 7z" /></svg>
                             G pay
                         </button>
                    </div>
                </aside>
            </div>
        </main>
    );
};

export default POSMockupView;