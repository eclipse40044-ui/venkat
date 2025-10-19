
import React from 'react';

interface SearchBarProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    onBarcodeSubmit: (barcode: string) => void;
    barcodeError: string | null;
    onCameraClick: () => void;
    viewMode: 'grid' | 'list';
    onSetViewMode: (mode: 'grid' | 'list') => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchChange, onBarcodeSubmit, barcodeError, onCameraClick, viewMode, onSetViewMode }) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            onBarcodeSubmit(searchTerm.trim());
        }
    };
    
    return (
        <div className="mb-6">
            <div className="flex gap-4 items-center">
                <form onSubmit={handleSubmit} className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-slate-400 dark:text-slate-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search products or scan barcode..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 py-3 pl-12 pr-14 rounded-full border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 outline-none transition-shadow duration-200"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                         <button 
                            type="button"
                            onClick={onCameraClick}
                            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-indigo-500 transition-colors"
                            aria-label="Scan barcode with camera"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                    </div>
                </form>
                <div className="flex-shrink-0 flex items-center gap-1 bg-slate-100 dark:bg-slate-700/50 p-1 rounded-full">
                    <button 
                        type="button"
                        onClick={() => onSetViewMode('grid')}
                        className={`p-2 rounded-full transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                        aria-pressed={viewMode === 'grid'}
                        aria-label="Grid view"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
                        </svg>
                    </button>
                    <button 
                        type="button"
                        onClick={() => onSetViewMode('list')}
                        className={`p-2 rounded-full transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                        aria-pressed={viewMode === 'list'}
                        aria-label="List view"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
            {barcodeError && (
                <p role="alert" className="mt-2 text-sm text-red-600">
                    {barcodeError}
                </p>
            )}
        </div>
    );
};

export default SearchBar;
