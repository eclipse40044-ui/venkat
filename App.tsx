import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Product, CartItem, Order, Category, Supplier, Customer, StoreSettings, User, Discount, ActivityLog, Payment, TimeClockEntry } from './types';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_SUPPLIERS, MOCK_CUSTOMERS, MOCK_STORE_SETTINGS, MOCK_USERS, MOCK_DISCOUNTS, MOCK_ACTIVITY_LOGS, MOCK_TIME_CLOCK_ENTRIES, CURRENCIES } from './constants';
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
import ProductFilters from './components/ProductFilters';


interface SplitBillModalProps {
    totalAmount: number;
    paymentsMade: Payment[];
    onAddPayment: (method: string, amount: number) => void;
    onClose: () => void;
    formatCurrency: (amount: number) => string;
    currencySymbol: string;
}

const SplitBillModal: React.FC<SplitBillModalProps> = ({ totalAmount, paymentsMade, onAddPayment, onClose, formatCurrency, currencySymbol }) => {
    const [amount, setAmount] = useState('');
    const amountInputRef = useRef<HTMLInputElement>(null);

    const paidAmount = useMemo(() => paymentsMade.reduce((sum, p) => sum + p.amount, 0), [paymentsMade]);
    const remainingAmount = useMemo(() => totalAmount - paidAmount, [totalAmount, paidAmount]);

    useEffect(() => {
        if (remainingAmount > 0) {
            setAmount(remainingAmount.toFixed(2));
        } else {
            setAmount('');
        }
        amountInputRef.current?.focus();
        amountInputRef.current?.select();
    }, [remainingAmount]);


    const handleAddPayment = (method: string) => {
        const paymentValue = parseFloat(amount);
        if (isNaN(paymentValue) || paymentValue <= 0.001 || paymentValue > remainingAmount + 0.001) {
            alert('Please enter a valid amount up to the remaining balance.');
            return;
        }
        onAddPayment(method, paymentValue);
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6" role="dialog" aria-modal="true">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Split Bill</h2>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg mb-4 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total Due</p>
                    <p className="text-4xl font-bold text-slate-800 dark:text-slate-100">{formatCurrency(totalAmount)}</p>
                </div>

                <div className="mb-4">
                    <label htmlFor="paymentAmount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Amount to Pay</label>
                    <div className="relative mt-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-slate-500 sm:text-sm">{currencySymbol}</span>
                        </div>
                        <input
                            ref={amountInputRef}
                            type="number"
                            name="paymentAmount"
                            id="paymentAmount"
                            className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 pl-7"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            min="0.01"
                            step="0.01"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <button onClick={() => handleAddPayment('Cash')} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">Pay Cash</span>
                    </button>
                    <button onClick={() => handleAddPayment('G pay')} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
                         <span className="font-semibold text-slate-700 dark:text-slate-200">Pay G pay</span>
                    </button>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <div className="flex justify-between text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
                        <span>Remaining</span>
                        <span>{formatCurrency(remainingAmount)}</span>
                    </div>

                    {paymentsMade.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Payments Made</h3>
                            <ul className="text-sm space-y-1 max-h-24 overflow-y-auto">
                                {paymentsMade.map((p, i) => (
                                    <li key={i} className="flex justify-between p-1 bg-slate-50 dark:bg-slate-700 rounded">
                                        <span>{p.method}</span>
                                        <span className="font-medium">{formatCurrency(p.amount)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// Levenshtein distance function for fuzzy search
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

type SplitOrderDetails = {
    total: number;
    payments: Payment[];
};

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
    const [timeClockEntries, setTimeClockEntries] = useLocalStorageState<TimeClockEntry[]>('pos_time_clock', MOCK_TIME_CLOCK_ENTRIES);
    const [theme, setTheme] = useLocalStorageState<'light' | 'dark'>('pos_theme', 'light');

    // App state
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    
    // POS-specific states
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [cartMode, setCartMode] = useState<'sale' | 'return'>('sale');
    const [searchTerm, setSearchTerm] = useState('');
    const [appliedDiscountId, setAppliedDiscountId] = useState<string>('');
    const [manualDiscount, setManualDiscount] = useState<{ type: 'fixed' | 'percentage', value: number } | null>(null);
    const [walkInCustomerPhone, setWalkInCustomerPhone] = useState('');
    const [showInvoice, setShowInvoice] = useState(false);
    const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
    const [barcodeError, setBarcodeError] = useState<string | null>(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [productViewMode, setProductViewMode] = useState<'grid' | 'list'>('grid');
    const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
    const [stockStatusFilter, setStockStatusFilter] = useState<string>('all');
    const [splitOrderDetails, setSplitOrderDetails] = useState<SplitOrderDetails | null>(null);
    const [autoPrintNextInvoice, setAutoPrintNextInvoice] = useState(false);

    const currencyInfo = useMemo(() => {
        return CURRENCIES.find(c => c.code === storeSettings.currency) || CURRENCIES[0];
    }, [storeSettings.currency]);

    const formatCurrency = useMemo(() => (amount: number): string => {
        const formattedAmount = new Intl.NumberFormat(undefined, {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
        
        if (currencyInfo.symbolBefore) {
            return `${currencyInfo.symbol}${formattedAmount}`;
        }
        return `${formattedAmount} ${currencyInfo.symbol}`;
    }, [currencyInfo]);


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

    const currentUserClockInEntry = useMemo(() => {
        if (!currentUser) return null;
        return timeClockEntries
            .filter(entry => entry.userId === currentUser.id && !entry.clockOutTime)
            .sort((a, b) => new Date(b.clockInTime).getTime() - new Date(a.clockInTime).getTime())[0] || null;
    }, [timeClockEntries, currentUser]);
    
    const handleClockInOut = () => {
        if (!currentUser) return;
    
        if (currentUserClockInEntry) { // Clocking out
            const updatedEntry = { ...currentUserClockInEntry, clockOutTime: new Date().toISOString() };
            setTimeClockEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
            logActivity('CLOCK_OUT');
        } else { // Clocking in
            const newEntry: TimeClockEntry = {
                id: `tc-${Date.now()}`,
                userId: currentUser.id,
                clockInTime: new Date().toISOString(),
            };
            setTimeClockEntries(prev => [newEntry, ...prev]);
            logActivity('CLOCK_IN');
        }
    };

    const handleAddToCart = (product: Product) => {
        setCartItems(prevItems => {
            const exist = prevItems.find(item => item.id === product.id);
            let updatedItems;
    
            if (cartMode === 'sale') {
                const currentQtyInCart = exist ? exist.quantity : 0;
                if (product.stock <= currentQtyInCart) {
                    alert("Cannot add more items than available in stock.");
                    return prevItems;
                }
                if (exist) {
                    updatedItems = prevItems.map(item =>
                        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                    );
                } else {
                    updatedItems = [...prevItems, { ...product, quantity: 1 }];
                }
            } else { // Return mode
                if (exist) {
                    updatedItems = prevItems.map(item =>
                        item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
                    );
                } else {
                    updatedItems = [...prevItems, { ...product, quantity: -1 }];
                }
            }
             return updatedItems.filter(item => item.quantity !== 0);
        });
    };

    const handleBarcodeScan = (barcode: string) => {
        const product = products.find(p => p.barcode === barcode);
        if (product) {
            if (cartMode === 'sale' && product.stock <= 0) {
                 setBarcodeError(`Product "${product.name}" is out of stock.`);
            } else {
                handleAddToCart(product);
                setSearchTerm(''); 
                setBarcodeError(null);
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
            if (quantity === 0) {
                return prevItems.filter(item => item.id !== productId);
            }
    
            const product = products.find(p => p.id === productId);
            if (!product) return prevItems;
    
            // Stock check only for positive quantities (sales)
            if (quantity > 0 && quantity > product.stock) {
                alert(`Cannot set quantity to ${quantity}. Only ${product.stock} available in stock.`);
                return prevItems;
            }
    
            return prevItems.map(item =>
                item.id === productId ? { ...item, quantity } : item
            ).filter(item => item.quantity !== 0);
        });
    };
    
    const handleRemoveFromCart = (productId: string) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    };

    const calculateTotals = () => {
        const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        
        let discountAmount = 0;
        let appliedDiscount: Order['appliedDiscount'] | undefined = undefined;

        if (manualDiscount && manualDiscount.value > 0) { // Prioritize manual discount
            if (manualDiscount.type === 'percentage') {
                discountAmount = subtotal * (manualDiscount.value / 100);
            } else {
                discountAmount = manualDiscount.value;
            }
            appliedDiscount = { name: 'Manual Discount', amount: discountAmount };
        } else { // Fallback to dropdown discount
            const selectedDiscount = discounts.find(d => d.id === appliedDiscountId);
            if(selectedDiscount) {
                if(selectedDiscount.type === 'percentage') {
                    discountAmount = subtotal * (selectedDiscount.value / 100);
                } else {
                    discountAmount = selectedDiscount.value;
                }
                appliedDiscount = { name: selectedDiscount.name, amount: discountAmount };
            }
        }
        
        // Discount should only apply to positive subtotals (sales part of the cart)
        if (subtotal > 0) {
            discountAmount = Math.min(discountAmount, subtotal);
            if (appliedDiscount) {
                appliedDiscount.amount = discountAmount;
            }
        } else {
            discountAmount = 0;
            appliedDiscount = undefined;
        }


        const totalAfterDiscount = subtotal - discountAmount;
        const taxAmount = storeSettings.isTaxEnabled && totalAfterDiscount > 0
            ? totalAfterDiscount * storeSettings.taxRate
            : 0;
        const total = totalAfterDiscount + taxAmount;
        
        return { subtotal, taxAmount, total, appliedDiscount, discountAmount };
    };

    const handleCheckout = (paymentMethod: string) => {
        if (cartItems.length > 0 && currentUser) {
            const { subtotal, taxAmount, total, appliedDiscount } = calculateTotals();
            
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
                payments: [{ method: paymentMethod, amount: total }],
                customer: customerDetails,
                userId: currentUser.id,
                status: 'completed',
                appliedDiscount,
            };
            setCurrentOrder(order);
            setShowInvoice(true);
            if (storeSettings.printerSettings.printAfterSale) {
                setAutoPrintNextInvoice(true);
            }
        }
    };
    
    const handleClearCart = () => {
        setCartItems([]);
        setAppliedDiscountId('');
        setWalkInCustomerPhone('');
        setManualDiscount(null);
        setCartMode('sale');
    };

    const handleCloseInvoice = () => {
        if (currentOrder && currentOrder.status === 'completed') {
            const orderExists = orderHistory.some(o => o.id === currentOrder.id);
            if (!orderExists) {
                setOrderHistory(prev => [currentOrder, ...prev]);
                
                const totalQuantity = currentOrder.items.reduce((sum, item) => sum + item.quantity, 0);
                const detailsParts = [
                    `Order ID: ${currentOrder.id}`,
                    `Total: ${formatCurrency(currentOrder.total)}`,
                    `Items: ${totalQuantity.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}`,
                    `Payment: ${currentOrder.paymentMethod}`
                ];

                if (currentOrder.customer) {
                    detailsParts.push(`Customer: ${currentOrder.customer.name}`);
                }

                if (currentOrder.appliedDiscount && currentOrder.appliedDiscount.amount > 0) {
                    detailsParts.push(`Discount: "${currentOrder.appliedDiscount.name}" (-${formatCurrency(currentOrder.appliedDiscount.amount)})`);
                }

                logActivity('SALE', detailsParts.join('; '));
                
                setProducts(prevProducts => {
                    const newProducts = [...prevProducts];
                    currentOrder.items.forEach(item => {
                        const productIndex = newProducts.findIndex(p => p.id === item.id);
                        if (productIndex !== -1) {
                            // This correctly handles both sales (quantity > 0) and returns (quantity < 0)
                            // For returns, `stock -= (-quantity)` becomes `stock += quantity`.
                            newProducts[productIndex].stock -= item.quantity;
                        }
                    });
                    return newProducts;
                });
            }
        }
        setShowInvoice(false);
        setCurrentOrder(null);
        setAutoPrintNextInvoice(false); // Always reset on close
        if (view === 'pos') {
          handleClearCart();
        }
    };

    const handleInitiateSplitBill = () => {
        if (cartItems.length === 0) return;
        const { total } = calculateTotals();
        if (total <= 0) {
            alert("Split bill is not available for refunds or zero-total exchanges.");
            return;
        }
        setSplitOrderDetails({
            total: total,
            payments: [],
        });
    };

    const handleAddPartialPayment = (method: string, amount: number) => {
        if (!splitOrderDetails || !currentUser) return;
    
        const newPayments = [...splitOrderDetails.payments, { method, amount }];
        const totalPaid = newPayments.reduce((sum, p) => sum + p.amount, 0);

        if (totalPaid >= splitOrderDetails.total - 0.001) {
            const { subtotal, taxAmount, total, appliedDiscount } = calculateTotals();
            const customerDetails = walkInCustomerPhone.trim() ? { id: 'walk-in', name: 'Walk-in Customer', phone: walkInCustomerPhone.trim(), email: '' } : undefined;
    
            const finalPayments = [...newPayments];
            const totalOverpaid = totalPaid - total;
            if (totalOverpaid > 0.001) {
                finalPayments[finalPayments.length - 1].amount -= totalOverpaid;
            }
    
            const order: Order = {
                id: `INV-${Date.now().toString().slice(-6)}`,
                date: new Date().toISOString(),
                items: cartItems,
                subtotal, taxAmount, total,
                paymentMethod: 'Split',
                payments: finalPayments,
                customer: customerDetails,
                userId: currentUser.id,
                status: 'completed',
                appliedDiscount,
            };
            setCurrentOrder(order);
            setShowInvoice(true);
            setSplitOrderDetails(null);
            if (storeSettings.printerSettings.printAfterSale) {
                setAutoPrintNextInvoice(true);
            }
        } else {
            setSplitOrderDetails({ ...splitOrderDetails, payments: newPayments });
        }
    };

    const handleCancelSplitBill = () => {
        setSplitOrderDetails(null);
    };

    const filteredProducts = useMemo(() => {
        let tempProducts = [...products];

        if (activeCategoryId !== 'all') {
            tempProducts = tempProducts.filter(p => p.categoryId === activeCategoryId);
        }

        if (stockStatusFilter !== 'all') {
            tempProducts = tempProducts.filter(p => {
                if (stockStatusFilter === 'inStock') return p.stock > p.lowStockThreshold;
                if (stockStatusFilter === 'lowStock') return p.stock > 0 && p.stock <= p.lowStockThreshold;
                if (stockStatusFilter === 'outOfStock') return p.stock <= 0;
                return true;
            });
        }

        const term = searchTerm.toLowerCase().trim();
        if (!term) {
            return tempProducts;
        }

        const results = tempProducts
            .map(product => {
                const productNameLower = product.name.toLowerCase();
                if (productNameLower.includes(term)) {
                    return { product, score: 0 };
                }
                const words = productNameLower.split(' ');
                let minDistance = Infinity;
                for (const word of words) {
                    const distance = levenshteinDistance(term, word);
                    if (distance < minDistance) {
                        minDistance = distance;
                    }
                }
                return { product, score: minDistance };
            })
            .filter(result => {
                const threshold = term.length > 5 ? 2 : 1;
                return result.score <= threshold;
            })
            .sort((a, b) => a.score - b.score)
            .map(result => result.product);
            
        return results;
    }, [searchTerm, products, activeCategoryId, stockStatusFilter]);
    
    const expiringProductsCount = useMemo(() => {
        const now = new Date();
        const sevenDaysFromNow = new Date(now.setDate(now.getDate() + 7));
        return products.filter(p => p.expiryDate && new Date(p.expiryDate) < sevenDaysFromNow).length;
    }, [products]);

    const lowStockProductsCount = useMemo(() => {
        return products.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
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

    const handleSaveUser = (userToSave: User) => {
        const isNew = !users.some(u => u.id === userToSave.id);
        setUsers(prev => {
            if (isNew) {
                return [userToSave, ...prev];
            }
            // PIN is only set on creation, not updated here
            return prev.map(u => u.id === userToSave.id ? { ...u, name: userToSave.name, role: userToSave.role } : u);
        });
        logActivity(isNew ? 'CREATE_USER' : 'UPDATE_USER', `Name: ${userToSave.name}, Role: ${userToSave.role}`);
    };

    const handleDeleteUser = (userId: string) => {
        const userToDelete = users.find(u => u.id === userId);
        if (!userToDelete) return;

        // Prevent deleting the last admin
        const adminUsers = users.filter(u => u.role === 'Admin');
        if (userToDelete.role === 'Admin' && adminUsers.length <= 1) {
            alert("Cannot delete the last administrator.");
            return;
        }
        
        if (currentUser?.id === userId) {
            alert("You cannot delete the currently logged-in user.");
            return;
        }

        setUsers(prev => prev.filter(u => u.id !== userId));
        logActivity('DELETE_USER', `ID: ${userId}, Name: ${userToDelete.name}`);
    };

    const handleUpdateUserPin = (userId: string, newPin: string) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            setUsers(prevUsers => prevUsers.map(u => (u.id === userId ? { ...u, pin: newPin } : u)));
            logActivity('UPDATE_USER_PIN', `PIN changed for user: ${user.name}`);
            alert(`PIN for ${user.name} has been updated successfully.`);
        }
    };

    const handleSaveTimeClockEntry = (entryToSave: TimeClockEntry) => {
        const isNew = !timeClockEntries.some(e => e.id === entryToSave.id);
        setTimeClockEntries(prev => {
            if(isNew) {
                return [entryToSave, ...prev];
            }
            return prev.map(e => e.id === entryToSave.id ? entryToSave : e);
        });
        const userName = users.find(u => u.id === entryToSave.userId)?.name || 'Unknown';
        logActivity(isNew ? 'CREATE_TIME_ENTRY' : 'UPDATE_TIME_ENTRY', `User: ${userName}`);
    };
    
    const handleDeleteTimeClockEntry = (entryId: string) => {
        const entry = timeClockEntries.find(e => e.id === entryId);
        if (entry) {
            const userName = users.find(u => u.id === entry.userId)?.name || 'Unknown';
            setTimeClockEntries(prev => prev.filter(e => e.id !== entryId));
            logActivity('DELETE_TIME_ENTRY', `User: ${userName}, Clock In: ${new Date(entry.clockInTime).toLocaleString()}`);
        }
    };

    const handleRefundOrder = (orderId: string) => {
        const orderToRefund = orderHistory.find(o => o.id === orderId);
        if (!orderToRefund || orderToRefund.status === 'refunded') {
            alert("Order cannot be refunded.");
            return;
        }

        setOrderHistory(prev =>
            prev.map(o => (o.id === orderId ? { ...o, status: 'refunded' } : o))
        );
        const details = `Order ID: ${orderId}; Refunded Amount: ${formatCurrency(orderToRefund.total)}`;
        logActivity('REFUND', details);

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
        setAutoPrintNextInvoice(false); // Ensure reprint doesn't auto-print
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
            pos_time_clock: timeClockEntries,
            pos_theme: theme,
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
                    setTimeClockEntries(data.pos_time_clock || []);
                    setTheme(data.pos_theme || 'light');
                    
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
            return <LoginScreen users={users} onLoginSuccess={handleLoginSuccess} storeSettings={storeSettings} />;
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
                                    viewMode={productViewMode}
                                    onSetViewMode={setProductViewMode}
                                />
                                <ProductFilters
                                    categories={categories}
                                    activeCategoryId={activeCategoryId}
                                    onCategoryChange={setActiveCategoryId}
                                    stockStatusFilter={stockStatusFilter}
                                    onStockStatusChange={setStockStatusFilter}
                                />
                                <ProductList 
                                    products={filteredProducts} 
                                    onAddToCart={handleAddToCart} 
                                    cartItems={cartItems} 
                                    viewMode={productViewMode}
                                    searchTerm={searchTerm}
                                    formatCurrency={formatCurrency}
                                />
                            </div>
                            <aside>
                                <Cart
                                    cartItems={cartItems}
                                    discounts={discounts}
                                    appliedDiscountId={appliedDiscountId}
                                    onApplyDiscount={setAppliedDiscountId}
                                    manualDiscount={manualDiscount}
                                    onSetManualDiscount={setManualDiscount}
                                    onUpdateQuantity={handleUpdateQuantity}
                                    onRemoveFromCart={handleRemoveFromCart}
                                    onCheckout={handleCheckout}
                                    onClearCart={handleClearCart}
                                    walkInCustomerPhone={walkInCustomerPhone}
                                    onPhoneChange={setWalkInCustomerPhone}
                                    onInitiateSplitBill={handleInitiateSplitBill}
                                    cartMode={cartMode}
                                    onSetCartMode={setCartMode}
                                    formatCurrency={formatCurrency}
                                    storeSettings={storeSettings}
                                    currencySymbol={currencyInfo.symbol}
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
                        timeClockEntries={timeClockEntries}
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
                        onSaveUser={handleSaveUser}
                        onDeleteUser={handleDeleteUser}
                        onUpdateUserPin={handleUpdateUserPin}
                        onSaveTimeClockEntry={handleSaveTimeClockEntry}
                        onDeleteTimeClockEntry={handleDeleteTimeClockEntry}
                        onExportData={handleExportData}
                        onImportData={handleImportData}
                        formatCurrency={formatCurrency}
                    />
                );
            case 'reports':
                return (
                    <ReportsView
                        orders={orderHistory}
                        products={products}
                        categories={categories}
                        onReprint={handleReprintInvoice}
                        formatCurrency={formatCurrency}
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
                        formatCurrency={formatCurrency}
                    />
                );
            default:
                return null;
        }
    }


    if (!currentUser) {
        return <LoginScreen users={users} onLoginSuccess={handleLoginSuccess} storeSettings={storeSettings} />;
    }

    return (
        <div className="min-h-screen">
            <Header
                view={view}
                onSetView={setView}
                expiringProductsCount={expiringProductsCount}
                lowStockProductsCount={lowStockProductsCount}
                currentUser={currentUser}
                onLogout={handleLogout}
                theme={theme}
                onToggleTheme={handleToggleTheme}
                storeSettings={storeSettings}
                currentUserClockInEntry={currentUserClockInEntry}
                onClockInOut={handleClockInOut}
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
                    formatCurrency={formatCurrency}
                    autoPrint={autoPrintNextInvoice}
                />
            )}

            {splitOrderDetails && (
                <SplitBillModal
                    totalAmount={splitOrderDetails.total}
                    paymentsMade={splitOrderDetails.payments}
                    onAddPayment={handleAddPartialPayment}
                    onClose={handleCancelSplitBill}
                    formatCurrency={formatCurrency}
                    currencySymbol={currencyInfo.symbol}
                />
            )}
        </div>
    );
};

export default App;