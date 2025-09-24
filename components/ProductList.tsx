

import React from 'react';
import { Product, CartItem } from '../types';

interface ProductItemProps {
    product: Product;
    onAddToCart: (product: Product) => void;
    cartQuantity: number;
}

const ProductItem: React.FC<ProductItemProps> = ({ product, onAddToCart, cartQuantity }) => {
    const isOutOfStock = product.stock <= 0;
    const isLowStock = !isOutOfStock && product.stock <= product.lowStockThreshold;
    const canAddToCart = product.unit === 'lb' ? product.stock > 0 : product.stock > cartQuantity;

    return (
        <div className={`bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 flex flex-col ${isOutOfStock ? 'opacity-50' : 'hover:shadow-xl hover:-translate-y-1'}`}>
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
                <h3 className="font-semibold text-lg text-slate-800 mb-1 flex-grow">{product.name}</h3>
                <p className="text-sm text-slate-500 mb-2">{product.stock} in stock</p>
                <div className="flex justify-between items-center mt-auto">
                    <span className="text-xl font-bold text-slate-900">${product.price.toFixed(2)}{product.unit === 'lb' ? '/lb' : ''}</span>
                    <button 
                        onClick={() => onAddToCart(product)}
                        disabled={!canAddToCart || isOutOfStock}
                        className="bg-teal-600 text-white rounded-full p-2 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
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

interface ProductListProps {
    products: Product[];
    cartItems: CartItem[];
    onAddToCart: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onAddToCart, cartItems }) => {
    if (products.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-2xl shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.27,3.27L20.73,20.73" />
                </svg>
                <h3 className="mt-4 text-xl font-semibold text-slate-700">No Products Found</h3>
                <p className="mt-2 text-slate-500">Your search did not match any products.</p>
            </div>
        );
    }
    
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => {
                const cartItem = cartItems.find(item => item.id === product.id);
                return (
                    <ProductItem 
                        key={product.id} 
                        product={product} 
                        onAddToCart={onAddToCart}
                        cartQuantity={cartItem?.quantity || 0}
                    />
                )
            })}
        </div>
    );
};

export default ProductList;