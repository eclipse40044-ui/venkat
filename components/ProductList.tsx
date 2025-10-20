
import React from 'react';
import { Product, CartItem, StoreSettings } from '../types';
import { formatCurrency } from '../utils';

// Levenshtein distance function for fuzzy match highlighting
function levenshteinDistance(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
  
    const matrix = [];
  
    // increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
  
    // increment each column in the first row
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
  
    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
  
    return matrix[b.length][a.length];
}

const HighlightMatch: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
    const lowerText = text.toLowerCase();
    const lowerHighlight = highlight.toLowerCase().trim();

    if (!lowerHighlight) {
        return <>{text}</>;
    }

    // 1. Exact Substring Match
    const index = lowerText.indexOf(lowerHighlight);
    if (index !== -1) {
        return (
            <>
                {text.substring(0, index)}
                <span className="bg-indigo-100 dark:bg-indigo-900/50 rounded">
                    {text.substring(index, index + lowerHighlight.length)}
                </span>
                {text.substring(index + lowerHighlight.length)}
            </>
        );
    }

    // 2. Fuzzy Word Match
    const words = text.split(/(\s+)/); // Split by spaces, keeping them for reconstruction
    let bestMatch = { distance: Infinity, originalWord: '' };

    words.forEach(originalWord => {
        const word = originalWord.trim();
        if (word === '') return;
        const distance = levenshteinDistance(word.toLowerCase(), lowerHighlight);
        if (distance < bestMatch.distance) {
            bestMatch = { distance, originalWord };
        }
    });

    const threshold = lowerHighlight.length > 5 ? 2 : 1;
    if (bestMatch.distance <= threshold) {
        return (
            <>
                {words.map((word, i) =>
                    word === bestMatch.originalWord ? (
                        <span key={i} className="bg-indigo-100 dark:bg-indigo-900/50 rounded">{word}</span>
                    ) : (
                        word
                    )
                )}
            </>
        );
    }

    return <>{text}</>;
};

interface ProductItemProps {
    product: Product;
    onAddToCart: (product: Product) => void;
    cartQuantity: number;
    searchTerm: string;
    storeSettings: StoreSettings;
}

const ProductGridItem: React.FC<ProductItemProps> = ({ product, onAddToCart, cartQuantity, searchTerm, storeSettings }) => {
    const isOutOfStock = product.stock <= 0;
    const isLowStock = !isOutOfStock && product.stock <= product.lowStockThreshold;
    const canAddToCart = product.unit === 'lb' ? product.stock > 0 : product.stock > cartQuantity;

    return (
        <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-md dark:shadow-black/20 overflow-hidden transition-all duration-300 flex flex-col ${isOutOfStock ? 'opacity-50' : 'hover:shadow-xl dark:hover:shadow-black/30 hover:-translate-y-1'}`}>
            <div className="relative">
                <img src={product.imageUrl} alt={product.name} className={`w-full h-40 object-cover ${isOutOfStock ? 'grayscale' : ''}`} />
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">Out of Stock</span>
                    </div>
                )}
                {isLowStock && (
                     <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        Low Stock
                     </div>
                )}
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100 mb-1 flex-grow">
                    <HighlightMatch text={product.name} highlight={searchTerm} />
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{product.stock} in stock</p>
                <div className="flex justify-between items-center mt-auto">
                    <span className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(product.price, storeSettings)}{product.unit === 'lb' ? '/lb' : ''}</span>
                    <button 
                        onClick={() => onAddToCart(product)}
                        disabled={!canAddToCart || isOutOfStock}
                        className="bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
                        aria-label={`Add ${product.name} to cart`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H5.21l-.94-3.762A1 1 0 003.27 0H2a1 1 0 00-1 1v1zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

const ProductListItem: React.FC<ProductItemProps> = ({ product, onAddToCart, cartQuantity, searchTerm, storeSettings }) => {
    const isOutOfStock = product.stock <= 0;
    const canAddToCart = product.unit === 'lb' ? product.stock > 0 : product.stock > cartQuantity;

    return (
        <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm dark:shadow-black/20 overflow-hidden transition-all duration-200 flex items-center gap-4 p-3 ${isOutOfStock ? 'opacity-60' : 'hover:shadow-md dark:hover:shadow-black/30'}`}>
            <img src={product.imageUrl} alt={product.name} className={`w-16 h-16 object-cover rounded-md flex-shrink-0 ${isOutOfStock ? 'grayscale' : ''}`} />
            <div className="flex-grow">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                    <HighlightMatch text={product.name} highlight={searchTerm} />
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{product.stock} in stock</p>
            </div>
            <div className="flex-shrink-0 text-right pr-2">
                <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{formatCurrency(product.price, storeSettings)}{product.unit === 'lb' ? '/lb' : ''}</span>
            </div>
            <button
                onClick={() => onAddToCart(product)}
                disabled={!canAddToCart || isOutOfStock}
                className="bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed flex-shrink-0"
                aria-label={`Add ${product.name} to cart`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    );
};


interface ProductListProps {
    products: Product[];
    cartItems: CartItem[];
    onAddToCart: (product: Product) => void;
    viewMode: 'grid' | 'list';
    searchTerm: string;
    storeSettings: StoreSettings;
}

const ProductList: React.FC<ProductListProps> = ({ products, onAddToCart, cartItems, viewMode, searchTerm, storeSettings }) => {
    if (products.length === 0) {
        return (
            <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-slate-400 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.27,3.27L20.73,20.73" />
                </svg>
                <h3 className="mt-4 text-xl font-semibold text-slate-700 dark:text-slate-200">No Products Found</h3>
                <p className="mt-2 text-slate-500 dark:text-slate-400">Your search did not match any products.</p>
            </div>
        );
    }

    if (viewMode === 'list') {
        return (
            <div className="flex flex-col gap-3">
                {products.map(product => {
                    const cartItem = cartItems.find(item => item.id === product.id);
                    return (
                        <ProductListItem
                            key={product.id}
                            product={product}
                            onAddToCart={onAddToCart}
                            cartQuantity={cartItem?.quantity || 0}
                            searchTerm={searchTerm}
                            storeSettings={storeSettings}
                        />
                    );
                })}
            </div>
        );
    }
    
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => {
                const cartItem = cartItems.find(item => item.id === product.id);
                return (
                    <ProductGridItem 
                        key={product.id} 
                        product={product} 
                        onAddToCart={onAddToCart}
                        cartQuantity={cartItem?.quantity || 0}
                        searchTerm={searchTerm}
                        storeSettings={storeSettings}
                    />
                )
            })}
        </div>
    );
};

export default ProductList;