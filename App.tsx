import React, { useState, useMemo, useEffect } from 'react';
import { Product, CartItem, Order, Category, Supplier, Customer, StoreSettings, User, Discount } from './types';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_SUPPLIERS, MOCK_CUSTOMERS, MOCK_STORE_SETTINGS, MOCK_USERS, MOCK_DISCOUNTS } from './constants';
import Header from './components/Header';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import InvoiceModal from './components/InvoiceModal';
import SearchBar from './components/SearchBar';
import ManagementView from './components/ManagementView';
import ReportsView from './components/ReportsView';
import OrdersView from './components/OrdersView';
import BarcodeScanner from './components/BarcodeScanner';

// Custom hook for persisting state to localStorage
function useLocalStorageState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn(`Error reading localStorage key “${key}”:`, error);
            return defaultValue;
        }
    });

    useEffect(() => {
        window.localStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);

    return [state, setState];
}


const App: React.FC = () => {
    const [view, setView] = useState<'pos' | 'manage' | 'reports' | 'orders'>('pos');
    
    // Data management states
    const [products, setProducts] = useLocalStorageState<Product[]>('pos_products', MOCK_PRODUCTS);
    const [categories, setCategories] = useLocalStorageState<Category[]>('pos_categories', MOCK_CATEGORIES);
    const [suppliers, setSuppliers] = useLocalStorageState<Supplier[]>('pos_suppliers', MOCK_SUPPLIERS);
    const [customers, setCustomers] = useLocalStorageState<Customer[]>('pos_customers', MOCK_CUSTOMERS);
    const [storeSettings, setStoreSettings] = useLocalStorageState<StoreSettings>('pos_settings', MOCK_STORE_SETTINGS);
    const [orderHistory, setOrderHistory] = useLocalStorageState<Order[]>('supermarket_pos_orders', []);
    const [users, setUsers] = useLocalStorageState<User[]>('pos_users', MOCK_USERS);
    const [discounts, setDiscounts] = useLocalStorageState<Discount[]>('pos_discounts', MOCK_DISCOUNTS);

    // App state
    const [currentUser] = useState<User>(MOCK_USERS[0]); // Simulate logged in user (Admin)
    
    // POS-specific states
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('walk-in');
    const [appliedDiscountId, setAppliedDiscountId] = useState<string>('');
    const [showInvoice, setShowInvoice] = useState(false);
    const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
    const [barcodeError, setBarcodeError] = useState<string | null>(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    const handleAddToCart = (product: Product) => {
        const itemInCart = cartItems.find(item => item.id === product.id);
        const currentQtyInCart = itemInCart ? itemInCart.quantity : 0;

        if (product.stock < currentQtyInCart + 1) {
            alert("Cannot add more items than available in stock.");
            return;
        }

        setCartItems(prevItems => {
            const exist = prevItems.find(item => item.id === product.id);
            if (exist) {
                return prevItems.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...prevItems, { ...product, quantity: 1 }];
            }
        });
    };

    const handleBarcodeScan = (barcode: string) => {
        const product = products.find(p => p.barcode === barcode);
        if (product) {
            if (product.stock > 0) {
                handleAddToCart(product);
                setSearchTerm(''); 
                setBarcodeError(null);
            } else {
                setBarcodeError(`Product "${product.name}" is out of stock.`);
            }
        } else {
            setBarcodeError(`Product with barcode "${barcode}" not found.`);
        }
    };
    
    const handleScanSuccess = (barcode: string) => {
        handleBarcodeScan(barcode);
        setIsScannerOpen(false);
    };

    const handleSearchChange = (term: string) => {
        setSearchTerm(term);
        if (barcodeError) {
            setBarcodeError(null);
        }
    };

    const handleUpdateQuantity = (productId: string, quantity: number) => {
        setCartItems(prevItems => {
            const product = products.find(p => p.id === productId);
            const itemInCart = prevItems.find(item => item.id === productId);

            if (!product || !itemInCart) return prevItems;

            if (quantity > product.stock) {
                alert(`Cannot set quantity to ${quantity}. Only ${product.stock} available in stock.`);
                return prevItems;
            }

            if (quantity <= 0) {
                return prevItems.filter(item => item.id !== productId);
            }
            return prevItems.map(item =>
                item.id === productId ? { ...item, quantity } : item
            );
        });
    };
    
    const handleRemoveFromCart = (productId: string) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    };

    const handleCheckout = (paymentMethod: string) => {
        if (cartItems.length > 0) {
            const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
            
            let discountAmount = 0;
            let appliedDiscount: Order['appliedDiscount'] | undefined = undefined;
            const selectedDiscount = discounts.find(d => d.id === appliedDiscountId);

            if(selectedDiscount) {
                if(selectedDiscount.type === 'percentage') {
                    discountAmount = subtotal * (selectedDiscount.value / 100);
                } else {
                    discountAmount = selectedDiscount.value;
                }
                // Ensure discount doesn't exceed subtotal
                discountAmount = Math.min(discountAmount, subtotal);
                appliedDiscount = { name: selectedDiscount.name, amount: discountAmount };
            }

            const totalAfterDiscount = subtotal - discountAmount;
            const taxAmount = totalAfterDiscount * storeSettings.taxRate;
            const total = totalAfterDiscount + taxAmount;
            const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

            const order: Order = {
                id: `INV-${Date.now().toString().slice(-6)}`,
                date: new Date().toISOString(),
                items: cartItems,
                subtotal,
                taxAmount,
                total,
                paymentMethod,
                customer: selectedCustomer,
                userId: currentUser.id,
                status: 'completed',
                appliedDiscount,
            };
            setCurrentOrder(order);
            setShowInvoice(true);
        }
    };
    
    const handleClearCart = () => {
        setCartItems([]);
        setSelectedCustomerId('walk-in');
        setAppliedDiscountId('');
    };

    const handleCloseInvoice = () => {
        if (currentOrder && currentOrder.status === 'completed') {
            const orderExists = orderHistory.some(o => o.id === currentOrder.id);
            if (!orderExists) {
                setOrderHistory(prev => [...prev, currentOrder]);
                // Decrease stock only when the sale is first completed
                setProducts(prevProducts => {
                    const newProducts = [...prevProducts];
                    currentOrder.items.forEach(item => {
                        const productIndex = newProducts.findIndex(p => p.id === item.id);
                        if (productIndex !== -1) {
                            newProducts[productIndex].stock -= item.quantity;
                        }
                    });
                    return newProducts;
                });
            }
        }
        setShowInvoice(false);
        setCurrentOrder(null);
        if (view === 'pos') {
          handleClearCart();
        }
    };

    const filteredProducts = useMemo(() => {
        return products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, products]);
    
    const expiringProductsCount = useMemo(() => {
        const now = new Date();
        const sevenDaysFromNow = new Date(now.setDate(now.getDate() + 7));
        return products.filter(p => p.expiryDate && new Date(p.expiryDate) < sevenDaysFromNow).length;
    }, [products]);

    // CRUD Handlers
    const handleSaveProduct = (productToSave: Product) => {
        setProducts(prev => {
            const exists = prev.some(p => p.id === productToSave.id);
            if(exists) {
                return prev.map(p => p.id === productToSave.id ? productToSave : p);
            }
            return [...prev, productToSave];
        });
    };
    const handleDeleteProduct = (productId: string) => {
        setProducts(prev => prev.filter(p => p.id !== productId));
    };

    const handleSaveCategory = (categoryToSave: Category) => {
        setCategories(prev => {
             const exists = prev.some(c => c.id === categoryToSave.id);
            if(exists) {
                return prev.map(c => c.id === categoryToSave.id ? categoryToSave : c);
            }
            return [...prev, categoryToSave];
        })
    }
    const handleDeleteCategory = (categoryId: string) => {
        setCategories(prev => prev.filter(c => c.id !== categoryId));
    }
    
    const handleSaveSupplier = (supplierToSave: Supplier) => {
         setSuppliers(prev => {
             const exists = prev.some(s => s.id === supplierToSave.id);
            if(exists) {
                return prev.map(s => s.id === supplierToSave.id ? supplierToSave : s);
            }
            return [...prev, supplierToSave];
        })
    }
    const handleDeleteSupplier = (supplierId: string) => {
        setSuppliers(prev => prev.filter(s => s.id !== supplierId));
    }
    
    const handleSaveCustomer = (customerToSave: Customer) => {
        setCustomers(prev => {
            const exists = prev.some(c => c.id === customerToSave.id);
            if (exists) {
                return prev.map(c => c.id === customerToSave.id ? customerToSave : c);
            }
            return [...prev, customerToSave];
        });
    };

    const handleDeleteCustomer = (customerId: string) => {
        setCustomers(prev => prev.filter(c => c.id !== customerId));
    };
    
    const handleSaveStoreSettings = (settings: StoreSettings) => {
        setStoreSettings(settings);
    };

    const handleSaveDiscount = (discountToSave: Discount) => {
        setDiscounts(prev => {
            const exists = prev.some(d => d.id === discountToSave.id);
            if (exists) {
                return prev.map(d => d.id === discountToSave.id ? discountToSave : d);
            }
            return [...prev, discountToSave];
        });
    };

    const handleDeleteDiscount = (discountId: string) => {
        setDiscounts(prev => prev.filter(d => d.id !== discountId));
    };

    const handleRefundOrder = (orderId: string) => {
        const orderToRefund = orderHistory.find(o => o.id === orderId);
        if (!orderToRefund || orderToRefund.status === 'refunded') {
            alert("Order cannot be refunded.");
            return;
        }

        // 1. Update order status
        setOrderHistory(prev =>
            prev.map(o => (o.id === orderId ? { ...o, status: 'refunded' } : o))
        );

        // 2. Return items to stock
        setProducts(prevProducts => {
            const newProducts = [...prevProducts];
            orderToRefund.items.forEach(item => {
                const productIndex = newProducts.findIndex(p => p.id === item.id);
                if (productIndex !== -1) {
                    newProducts[productIndex].stock += item.quantity;
                }
            });
            return newProducts;
        });
        alert(`Order ${orderId} has been refunded.`);
    };

    const handleReprintInvoice = (order: Order) => {
        setCurrentOrder(order);
        setShowInvoice(true);
    };

    const renderView = () => {
        switch (view) {
            case 'pos':
                return (
                    <main className="container mx-auto p-4 md:p-6 lg:p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <SearchBar 
                                    searchTerm={searchTerm} 
                                    onSearchChange={handleSearchChange} 
                                    onBarcodeSubmit={handleBarcodeScan}
                                    barcodeError={barcodeError}
                                    onCameraClick={() => setIsScannerOpen(true)}
                                />
                                <ProductList products={filteredProducts} onAddToCart={handleAddToCart} cartItems={cartItems} />
                            </div>
                            <aside>
                                <Cart
                                    cartItems={cartItems}
                                    customers={customers}
                                    selectedCustomerId={selectedCustomerId}
                                    onSelectCustomer={setSelectedCustomerId}
                                    taxRate={storeSettings.taxRate}
                                    discounts={discounts}
                                    appliedDiscountId={appliedDiscountId}
                                    onApplyDiscount={setAppliedDiscountId}
                                    onUpdateQuantity={handleUpdateQuantity}
                                    onRemoveFromCart={handleRemoveFromCart}
                                    onCheckout={handleCheckout}
                                    onClearCart={handleClearCart}
                                />
                            </aside>
                        </div>
                    </main>
                );
            case 'manage':
                 return (
                    <ManagementView
                        products={products}
                        categories={categories}
                        suppliers={suppliers}
                        customers={customers}
                        discounts={discounts}
                        storeSettings={storeSettings}
                        onSaveProduct={handleSaveProduct}
                        onDeleteProduct={handleDeleteProduct}
                        onSaveCategory={handleSaveCategory}
                        onDeleteCategory={handleDeleteCategory}
                        onSaveSupplier={handleSaveSupplier}
                        onDeleteSupplier={handleDeleteSupplier}
                        onSaveCustomer={handleSaveCustomer}
                        onDeleteCustomer={handleDeleteCustomer}
                        onSaveStoreSettings={handleSaveStoreSettings}
                        onSaveDiscount={handleSaveDiscount}
                        onDeleteDiscount={handleDeleteDiscount}
                    />
                );
            case 'reports':
                return (
                    <ReportsView
                        orders={orderHistory}
                        products={products}
                        categories={categories}
                    />
                );
            case 'orders':
                return (
                    <OrdersView
                        orders={orderHistory}
                        users={users}
                        currentUser={currentUser}
                        onReprint={handleReprintInvoice}
                        onRefund={handleRefundOrder}
                    />
                );
            default:
                return null;
        }
    }


    return (
        <div className="min-h-screen bg-slate-100/50">
            <Header
                view={view}
                onSetView={setView}
                expiringProductsCount={expiringProductsCount}
                currentUser={currentUser}
            />
           
            {renderView()}

            {isScannerOpen && (
                <BarcodeScanner
                    onScan={handleScanSuccess}
                    onClose={() => setIsScannerOpen(false)}
                />
            )}

            {showInvoice && currentOrder && (
                <InvoiceModal
                    order={currentOrder}
                    storeSettings={storeSettings}
                    onClose={handleCloseInvoice}
                />
            )}
        </div>
    );
};

export default App;