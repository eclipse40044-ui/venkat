import React from 'react';
import { User } from '../types';

interface HeaderProps {
    view: 'pos' | 'manage' | 'reports' | 'orders';
    onSetView: (view: 'pos' | 'manage' | 'reports' | 'orders') => void;
    expiringProductsCount: number;
    currentUser: User;
    onLogout: () => void;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ view, onSetView, expiringProductsCount, currentUser, onLogout, theme, onToggleTheme }) => {
    
    const canViewManagement = currentUser.role === 'Admin' || currentUser.role === 'Manager';
    const canViewReports = currentUser.role === 'Admin' || currentUser.role === 'Manager' || currentUser.role === 'Cashier';
    
    const navButtons = [
        { key: 'pos', label: 'POS', visible: true },
        { key: 'orders', label: 'Orders', visible: true },
        { key: 'manage', label: 'Manage', visible: canViewManagement },
        { key: 'reports', label: 'Reports', visible: canViewReports }
    ].filter(btn => btn.visible);

    const renderNavButtons = (isMobile: boolean) => (
        navButtons.map(({ key, label }) => (
            <button
                key={key}
                onClick={() => onSetView(key as 'pos' | 'manage' | 'reports' | 'orders')}
                className={isMobile ? 
                    `flex-1 text-center py-2 rounded-lg text-sm font-semibold transition-colors ${view === key ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`
                    : `px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${view === key ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`
                }
            >
                {label}
            </button>
        ))
    );

    return (
        <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm dark:shadow-none dark:border-b dark:border-slate-700 sticky top-0 z-20">
            <div className="container mx-auto px-4 md:px-6 lg:px-8 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 6V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H2v13c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6h-6zm-6-2h4v2h-4V4zM4 8h16v11H4V8zm3 2v6h2V10H7zm4 0v6h2V10h-2zm4 0v6h2V10h-2z"/>
                    </svg>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Yazh Shop</h1>
                </div>

                <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-full">
                    {renderNavButtons(false)}
                </div>

                <div className="flex items-center gap-4">
                     <button 
                        onClick={onToggleTheme} 
                        className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-indigo-500"
                        aria-label="Toggle theme"
                    >
                        {theme === 'light' ? 
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg> : 
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
                        }
                    </button>
                    {expiringProductsCount > 0 && view === 'manage' && canViewManagement && (
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
                        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400">
                           {currentUser.name.charAt(0)}
                        </div>
                        <div className="hidden md:block text-right">
                           <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">{currentUser.name}</p>
                           <p className="text-xs text-slate-500 dark:text-slate-400">{currentUser.role}</p>
                        </div>
                    </div>
                    <button onClick={onLogout} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-indigo-500" aria-label="Lock screen">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
             <div className="sm:hidden flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 justify-center border-t border-slate-200 dark:border-slate-700">
                {renderNavButtons(true)}
            </div>
        </header>
    );
};

export default Header;