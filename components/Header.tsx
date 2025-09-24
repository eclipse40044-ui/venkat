import React from 'react';
import { User } from '../types';

interface HeaderProps {
    view: 'pos' | 'manage' | 'reports' | 'orders' | 'mockup';
    onSetView: (view: 'pos' | 'manage' | 'reports' | 'orders' | 'mockup') => void;
    expiringProductsCount: number;
    currentUser: User;
}

const Header: React.FC<HeaderProps> = ({ view, onSetView, expiringProductsCount, currentUser }) => {
    return (
        <header className="bg-white shadow-sm sticky top-0 z-20">
            <div className="container mx-auto px-4 md:px-6 lg:px-8 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 6V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H2v13c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6h-6zm-6-2h4v2h-4V4zM4 8h16v11H4V8zm3 2v6h2V10H7zm4 0v6h2V10h-2zm4 0v6h2V10h-2z"/>
                    </svg>
                    <h1 className="text-2xl font-bold text-slate-800">Yazh Shop</h1>
                </div>

                <div className="hidden sm:flex items-center gap-2 bg-slate-100 p-1 rounded-full">
                    <button
                        onClick={() => onSetView('pos')}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${view === 'pos' ? 'bg-white shadow-sm text-teal-600' : 'text-slate-600 hover:bg-slate-200'}`}
                    >
                        POS
                    </button>
                    <button
                        onClick={() => onSetView('orders')}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${view === 'orders' ? 'bg-white shadow-sm text-teal-600' : 'text-slate-600 hover:bg-slate-200'}`}
                    >
                        Orders
                    </button>
                    <button
                        onClick={() => onSetView('manage')}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${view === 'manage' ? 'bg-white shadow-sm text-teal-600' : 'text-slate-600 hover:bg-slate-200'}`}
                    >
                        Manage
                    </button>
                     <button
                        onClick={() => onSetView('reports')}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${view === 'reports' ? 'bg-white shadow-sm text-teal-600' : 'text-slate-600 hover:bg-slate-200'}`}
                    >
                        Reports
                    </button>
                    <button
                        onClick={() => onSetView('mockup')}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${view === 'mockup' ? 'bg-white shadow-sm text-teal-600' : 'text-slate-600 hover:bg-slate-200'}`}
                    >
                        Mockup
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    {expiringProductsCount > 0 && view === 'manage' && (
                        <div className="relative" title={`${expiringProductsCount} products are expiring soon`}>
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                               <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                             </svg>
                             <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                                {expiringProductsCount}
                             </span>
                        </div>
                    )}
                    
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-teal-600">
                           {currentUser.name.charAt(0)}
                        </div>
                        <div className="hidden md:block text-right">
                           <p className="font-semibold text-sm text-slate-700">{currentUser.name}</p>
                           <p className="text-xs text-slate-500">{currentUser.role}</p>
                        </div>
                    </div>

                </div>
            </div>
             <div className="sm:hidden flex items-center gap-2 bg-slate-100 p-1 justify-center border-t border-slate-200">
                    <button
                        onClick={() => onSetView('pos')}
                        className={`flex-1 text-center py-2 rounded-lg text-sm font-semibold transition-colors ${view === 'pos' ? 'bg-white shadow-sm text-teal-600' : 'text-slate-600'}`}
                    >
                        POS
                    </button>
                     <button
                        onClick={() => onSetView('orders')}
                        className={`flex-1 text-center py-2 rounded-lg text-sm font-semibold transition-colors ${view === 'orders' ? 'bg-white shadow-sm text-teal-600' : 'text-slate-600'}`}
                    >
                        Orders
                    </button>
                    <button
                        onClick={() => onSetView('manage')}
                        className={`flex-1 text-center py-2 rounded-lg text-sm font-semibold transition-colors ${view === 'manage' ? 'bg-white shadow-sm text-teal-600' : 'text-slate-600'}`}
                    >
                        Manage
                    </button>
                    <button
                        onClick={() => onSetView('reports')}
                        className={`flex-1 text-center py-2 rounded-lg text-sm font-semibold transition-colors ${view === 'reports' ? 'bg-white shadow-sm text-teal-600' : 'text-slate-600'}`}
                    >
                        Reports
                    </button>
                     <button
                        onClick={() => onSetView('mockup')}
                        className={`flex-1 text-center py-2 rounded-lg text-sm font-semibold transition-colors ${view === 'mockup' ? 'bg-white shadow-sm text-teal-600' : 'text-slate-600'}`}
                    >
                        Mockup
                    </button>
                </div>
        </header>
    );
};

export default Header;