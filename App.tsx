import React, { useState, useMemo, useEffect } from 'react';
import { Product, CartItem, Order, Category, Supplier, Customer, StoreSettings, User, Discount, CartLabels, ActivityLog } from './types';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_SUPPLIERS, MOCK_CUSTOMERS, MOCK_STORE_SETTINGS, MOCK_USERS, MOCK_DISCOUNTS, MOCK_CART_LABELS, MOCK_ACTIVITY_LOGS } from './constants';
import Header from './components/Header';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import InvoiceModal from './components/InvoiceModal';
import SearchBar from './components/SearchBar';
import ManagementView from './components/ManagementView';
import ReportsView from './components/ReportsView';
import OrdersView from './components/OrdersView';
import BarcodeScanner from './components/BarcodeScanner';
import LoginScreen from './components/LoginScreen';

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
    const [activityLogs, setActivityLogs] = useLocalStorageState<ActivityLog[]>('pos_activity_logs', MOCK_ACTIVITY_LOGS);
    const [theme, setTheme] = useLocalStorageState<'light' | 'dark'>('pos_theme', 'light');
    const [cartLabels, setCartLabels] = useLocalStorageState<CartLabels>('pos_cart_labels', MOCK_CART_LABELS);

    // App state
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    
    // POS-specific states
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [appliedDiscountId, setAppliedDiscountId] = useState<string>('');
    const [walkInCustomerPhone, setWalkInCustomerPhone] = useState('');
    const [showInvoice, setShowInvoice] = useState(false);
    const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
    const [barcodeError, setBarcodeError] = useState<string | null>(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const logActivity = (action: string, details?: string) => {
        if (!currentUser) return;
        const newLog: ActivityLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            userId: currentUser.id,
            action,
            details,
        };
        setActivityLogs(prev => [newLog, ...prev]);
    };

    const handleLoginSuccess = (user: User) => {
        setCurrentUser(user);
        logActivity('LOGIN');
        setView('pos'); // Default to POS view on login
    };

    const handleLogout = () => {
        logActivity('LOGOUT');
        setCurrentUser(null);
    };

    const handleToggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

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
        if (cartItems.length > 0 && currentUser) {
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
            
            const customerDetails: Customer | undefined = walkInCustomerPhone.trim()
                ? { id: 'walk-in', name: 'Walk-in Customer', phone: walkInCustomerPhone.trim(), email: '' }
                : undefined;

            const order: Order = {
                id: `INV-${Date.now().toString().slice(-6)}`,
                date: new Date().toISOString(),
                items: cartItems,
                subtotal,
                taxAmount,
                total,
                paymentMethod,
                customer: customerDetails,
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
        setAppliedDiscountId('');
        setWalkInCustomerPhone('');
    };

    const handleCloseInvoice = () => {
        if (currentOrder && currentOrder.status === 'completed') {
            const orderExists = orderHistory.some(o => o.id === currentOrder.id);
            if (!orderExists) {
                setOrderHistory(prev => [currentOrder, ...prev]);
                 logActivity('SALE', `Order ID: ${currentOrder.id}, Total: $${currentOrder.total.toFixed(2)}`);
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
        const isNew = !products.some(p => p.id === productToSave.id);
        setProducts(prev => {
            if(isNew) {
                return [productToSave, ...prev];
            }
            return prev.map(p => p.id === productToSave.id ? productToSave : p);
        });
        logActivity(isNew ? 'CREATE_PRODUCT' : 'UPDATE_PRODUCT', `Name: ${productToSave.name}`);
    };
    const handleDeleteProduct = (productId: string) => {
        const productName = products.find(p => p.id === productId)?.name;
        setProducts(prev => prev.filter(p => p.id !== productId));
        logActivity('DELETE_PRODUCT', `ID: ${productId}, Name: ${productName}`);
    };

    const handleSaveCategory = (categoryToSave: Category) => {
        const isNew = !categories.some(c => c.id === categoryToSave.id);
        setCategories(prev => {
             if(isNew) {
                return [categoryToSave, ...prev];
            }
            return prev.map(c => c.id === categoryToSave.id ? categoryToSave : c);
        })
        logActivity(isNew ? 'CREATE_CATEGORY' : 'UPDATE_CATEGORY', `Name: ${categoryToSave.name}`);
    }
    const handleDeleteCategory = (categoryId: string) => {
        const categoryName = categories.find(c => c.id === categoryId)?.name;
        setCategories(prev => prev.filter(c => c.id !== categoryId));
        logActivity('DELETE_CATEGORY', `ID: ${categoryId}, Name: ${categoryName}`);
    }
    
    const handleSaveSupplier = (supplierToSave: Supplier) => {
        const isNew = !suppliers.some(s => s.id === supplierToSave.id);
         setSuppliers(prev => {
            if(isNew) {
                return [supplierToSave, ...prev];
            }
            return prev.map(s => s.id === supplierToSave.id ? supplierToSave : s);
        })
        logActivity(isNew ? 'CREATE_SUPPLIER' : 'UPDATE_SUPPLIER', `Name: ${supplierToSave.name}`);
    }
    const handleDeleteSupplier = (supplierId: string) => {
        const supplierName = suppliers.find(s => s.id === supplierId)?.name;
        setSuppliers(prev => prev.filter(s => s.id !== supplierId));
        logActivity('DELETE_SUPPLIER', `ID: ${supplierId}, Name: ${supplierName}`);
    }
    
    const handleSaveCustomer = (customerToSave: Customer) => {
        const isNew = !customers.some(c => c.id === customerToSave.id);
        setCustomers(prev => {
            if (isNew) {
                return [customerToSave, ...prev];
            }
            return prev.map(c => c.id === customerToSave.id ? customerToSave : c);
        });
        logActivity(isNew ? 'CREATE_CUSTOMER' : 'UPDATE_CUSTOMER', `Name: ${customerToSave.name}`);
    };

    const handleDeleteCustomer = (customerId: string) => {
        const customerName = customers.find(c => c.id === customerId)?.name;
        setCustomers(prev => prev.filter(c => c.id !== customerId));
        logActivity('DELETE_CUSTOMER', `ID: ${customerId}, Name: ${customerName}`);
    };
    
    const handleSaveStoreSettings = (settings: StoreSettings) => {
        setStoreSettings(settings);
        logActivity('UPDATE_SETTINGS', `Store Name: ${settings.storeName}`);
    };

    const handleSaveDiscount = (discountToSave: Discount) => {
        const isNew = !discounts.some(d => d.id === discountToSave.id);
        setDiscounts(prev => {
            if (isNew) {
                return [discountToSave, ...prev];
            }
            return prev.map(d => d.id === discountToSave.id ? discountToSave : d);
        });
        logActivity(isNew ? 'CREATE_DISCOUNT' : 'UPDATE_DISCOUNT', `Name: ${discountToSave.name}`);
    };

    const handleDeleteDiscount = (discountId: string) => {
        const discountName = discounts.find(d => d.id === discountId)?.name;
        setDiscounts(prev => prev.filter(d => d.id !== discountId));
        logActivity('DELETE_DISCOUNT', `ID: ${discountId}, Name: ${discountName}`);
    };

    const handleSaveCartLabels = (labels: CartLabels) => {
        setCartLabels(labels);
    };

    const handleUpdateUserPin = (userId: string, newPin: string) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            setUsers(prevUsers => prevUsers.map(u => (u.id === userId ? { ...u, pin: newPin } : u)));
            logActivity('UPDATE_USER_PIN', `PIN changed for user: ${user.name}`);
            alert(`PIN for ${user.name} has been updated successfully.`);
        }
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
         logActivity('REFUND', `Order ID: ${orderId}`);

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
    
    const handleExportData = () => {
        const dataToExport = {
            pos_products: products,
            pos_categories: categories,
            pos_suppliers: suppliers,
            pos_customers: customers,
            pos_settings: storeSettings,
            supermarket_pos_orders: orderHistory,
            pos_users: users,
            pos_discounts: discounts,
            pos_activity_logs: activityLogs,
            pos_theme: theme,
            pos_cart_labels: cartLabels,
        };
    
        const jsonString = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        const date = new Date().toISOString().split('T')[0];
        link.download = `yazh-shop-backup-${date}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
        logActivity('EXPORT_DATA');
    };

    const handleImportData = (file: File) => {
        if (!file) return;
    
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error('File content is not readable.');
                }
                const data = JSON.parse(text);
    
                if (!data.pos_products || !data.pos_categories) { // Basic validation
                    throw new Error('Invalid backup file format.');
                }
                
                const confirmed = window.confirm(
                    "Are you sure you want to import this data? This will overwrite ALL current data and cannot be undone."
                );
    
                if (confirmed) {
                    setProducts(data.pos_products || MOCK_PRODUCTS);
                    setCategories(data.pos_categories || MOCK_CATEGORIES);
                    setSuppliers(data.pos_suppliers || MOCK_SUPPLIERS);
                    setCustomers(data.pos_customers || MOCK_CUSTOMERS);
                    setStoreSettings(data.pos_settings || MOCK_STORE_SETTINGS);
                    setOrderHistory(data.supermarket_pos_orders || []);
                    setUsers(data.pos_users || MOCK_USERS);
                    setDiscounts(data.pos_discounts || MOCK_DISCOUNTS);
                    setActivityLogs(data.pos_activity_logs || []);
                    setTheme(data.pos_theme || 'light');
                    setCartLabels(data.pos_cart_labels || MOCK_CART_LABELS);
                    
                    logActivity('IMPORT_DATA', `File: ${file.name}`);
    
                    alert('Data imported successfully! The application will now reload.');
                    setTimeout(() => window.location.reload(), 500);
                }
    
            } catch (error) {
                console.error("Failed to import data:", error);
                alert(`Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        };
        reader.readAsText(file);
    };

    const renderView = () => {
        if (!currentUser) {
            return <LoginScreen users={users} onLoginSuccess={handleLoginSuccess} />;
        }
        
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
                                    taxRate={storeSettings.taxRate}
                                    discounts={discounts}
                                    appliedDiscountId={appliedDiscountId}
                                    onApplyDiscount={setAppliedDiscountId}
                                    cartLabels={cartLabels}
                                    onSaveLabels={handleSaveCartLabels}
                                    onUpdateQuantity={handleUpdateQuantity}
                                    onRemoveFromCart={handleRemoveFromCart}
                                    onCheckout={handleCheckout}
                                    onClearCart={handleClearCart}
                                    walkInCustomerPhone={walkInCustomerPhone}
                                    onPhoneChange={setWalkInCustomerPhone}
                                />
                            </aside>
                        </div>
                    </main>
                );
            case 'manage':
                 return (
                    <ManagementView
                        currentUser={currentUser}
                        products={products}
                        categories={categories}
                        suppliers={suppliers}
                        customers={customers}
                        discounts={discounts}
                        storeSettings={storeSettings}
                        activityLogs={activityLogs}
                        users={users}
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
                        onUpdateUserPin={handleUpdateUserPin}
                        onExportData={handleExportData}
                        onImportData={handleImportData}
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


    if (!currentUser) {
        return <LoginScreen users={users} onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <div className="min-h-screen bg-slate-100/50 dark:bg-slate-950">
            <Header
                view={view}
                onSetView={setView}
                expiringProductsCount={expiringProductsCount}
                currentUser={currentUser}
                onLogout={handleLogout}
                theme={theme}
                onToggleTheme={handleToggleTheme}
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
