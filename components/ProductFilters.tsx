import React from 'react';
import { Category } from '../types';

interface ProductFiltersProps {
    categories: Category[];
    activeCategoryId: string;
    onCategoryChange: (categoryId: string) => void;
    stockStatusFilter: string;
    onStockStatusChange: (status: string) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
    categories,
    activeCategoryId,
    onCategoryChange,
    stockStatusFilter,
    onStockStatusChange,
}) => {
    const stockStatuses = [
        { key: 'all', label: 'All' },
        { key: 'inStock', label: 'In Stock' },
        { key: 'lowStock', label: 'Low Stock' },
        { key: 'outOfStock', label: 'Out of Stock' },
    ];

    return (
        <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Category Filter */}
            <div className="flex w-full sm:w-auto items-center gap-2">
                <label htmlFor="category-filter" className="text-sm flex-shrink-0 font-medium text-slate-600 dark:text-slate-300">Category:</label>
                <select
                    id="category-filter"
                    value={activeCategoryId}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md py-1.5 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>
            {/* Stock Status Filter */}
            <div className="flex-shrink-0 flex items-center gap-1 bg-slate-100 dark:bg-slate-700/50 p-1 rounded-full">
                {stockStatuses.map(status => (
                     <button
                        key={status.key}
                        onClick={() => onStockStatusChange(status.key)}
                        className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${stockStatusFilter === status.key ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                        aria-pressed={stockStatusFilter === status.key}
                    >
                        {status.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ProductFilters;