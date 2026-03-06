import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { ShoppingCart, ArrowLeft, CheckCircle, X, Store } from 'lucide-react';
import { useForm } from 'react-hook-form';

const fetchStoreData = async (accountId) => {
    const { data } = await axios.get(`/api/addons/online-store/public/store/${accountId}`);
    return data;
};

export default function PublicStore({ accountId }) {
    const [view, setView] = useState('catalog'); // 'catalog', 'product', 'checkout', 'success'
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [orderResult, setOrderResult] = useState(null);

    const { register, handleSubmit, formState: { errors } } = useForm();

    // If testing outside a router context, you might need to extract accountId from URL here instead of props
    const actualAccountId = accountId || window.location.pathname.split('/store/')[1]?.split('/')[0] || 1;

    const { data, isLoading, error } = useQuery({
        queryKey: ['public-store', actualAccountId],
        queryFn: () => fetchStoreData(actualAccountId),
        retry: 1
    });

    const checkoutMutation = useMutation({
        mutationFn: (orderData) => axios.post(`/api/addons/online-store/public/store/${actualAccountId}/checkout`, orderData),
        onSuccess: (res) => {
            setOrderResult(res.data);
            setCart([]);
            setView('success');
        },
        onError: () => alert('Failed to place order.')
    });

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading store...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500">Store not found or currently disabled.</div>;

    const { store, products } = data;

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.productId === product.id);
            if (existing) {
                return prev.map(item => item.productId === product.id ? { ...item, qty: item.qty + 1 } : item);
            }
            return [...prev, { productId: product.id, product, qty: 1 }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.productId !== productId));
    };

    const updateQty = (productId, delta) => {
        setCart(prev => prev.map(item => {
            if (item.productId === productId) {
                const newQty = Math.max(1, item.qty + delta);
                return { ...item, qty: newQty };
            }
            return item;
        }));
    };

    const cartTotal = cart.reduce((sum, item) => sum + (parseFloat(item.product.price) * item.qty), 0);

    const onSubmitOrder = (formData) => {
        if (cart.length === 0) return alert('Cart is empty!');
        const orderData = {
            customerName: formData.name,
            customerEmail: formData.email,
            paymentMethod: 'credit_card', // mocked
            items: cart.map(item => ({ productId: item.productId, qty: item.qty }))
        };
        checkoutMutation.mutate(orderData);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div
                        className="flex items-center cursor-pointer"
                        onClick={() => setView('catalog')}
                    >
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white mr-3 shadow-md">
                            <Store className="w-6 h-6" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">{store.store_name}</h1>
                    </div>

                    {view !== 'success' && (
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            <ShoppingCart className="w-6 h-6" />
                            {cart.length > 0 && (
                                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transform translate-x-1 -translate-y-1">
                                    {cart.reduce((sum, item) => sum + item.qty, 0)}
                                </span>
                            )}
                        </button>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Catalog View */}
                {view === 'catalog' && (
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Our Products</h2>
                        {products.length === 0 ? (
                            <p className="text-gray-500 text-center py-12">No products available at the moment.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {products.map(product => {
                                    let imageUrl = 'https://via.placeholder.com/400x300?text=No+Image';
                                    try {
                                        const parsed = JSON.parse(product.images);
                                        if (parsed && parsed.length > 0) imageUrl = parsed[0];
                                    } catch (e) { }

                                    return (
                                        <div
                                            key={product.id}
                                            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 group cursor-pointer"
                                            onClick={() => { setSelectedProduct(product); setView('product'); }}
                                        >
                                            <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                                                <img src={imageUrl} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                                                {product.inventory === 0 && (
                                                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                                        Out of Stock
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-5">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                                                <p className="text-blue-600 font-bold text-lg">${parseFloat(product.price).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Product Detail View */}
                {view === 'product' && selectedProduct && (
                    <div className="animate-fade-in-up">
                        <button
                            onClick={() => setView('catalog')}
                            className="flex items-center text-gray-600 hover:text-blue-600 mb-6 font-medium transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Catalog
                        </button>

                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            <div className="md:flex">
                                <div className="md:w-1/2 bg-gray-100 p-8 flex items-center justify-center min-h-[400px]">
                                    {(() => {
                                        let imageUrl = 'https://via.placeholder.com/800x600?text=No+Image';
                                        try {
                                            const parsed = JSON.parse(selectedProduct.images);
                                            if (parsed && parsed.length > 0) imageUrl = parsed[0];
                                        } catch (e) { }
                                        return <img src={imageUrl} alt={selectedProduct.name} className="max-w-full rounded-xl shadow-md mix-blend-multiply" />;
                                    })()}
                                </div>
                                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">{selectedProduct.name}</h2>
                                    <p className="text-3xl font-bold text-blue-600 mb-6">${parseFloat(selectedProduct.price).toFixed(2)}</p>

                                    <div className="prose border-t border-b border-gray-100 py-6 mb-8 text-gray-600">
                                        <p>{selectedProduct.description || 'No description available for this product.'}</p>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={() => addToCart(selectedProduct)}
                                            disabled={selectedProduct.inventory === 0}
                                            className={`flex-1 py-4 px-8 rounded-xl font-bold text-lg transition-all transform active:scale-95 ${selectedProduct.inventory > 0
                                                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200'
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                }`}
                                        >
                                            {selectedProduct.inventory > 0 ? 'Add to Cart' : 'Out of Stock'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Checkout View */}
                {view === 'checkout' && (
                    <div className="max-w-3xl mx-auto">
                        <button
                            onClick={() => setView('catalog')}
                            className="flex items-center text-gray-600 hover:text-blue-600 mb-6 font-medium transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Continue Shopping
                        </button>

                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50">
                                <h2 className="text-2xl font-extrabold text-gray-900">Checkout</h2>
                            </div>
                            <div className="p-6 md:p-8">
                                {cart.length === 0 ? (
                                    <div className="text-center py-12">
                                        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500 text-lg">Your cart is empty.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                                    <input
                                                        {...register('name', { required: true })}
                                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 py-3"
                                                        placeholder="John Doe"
                                                    />
                                                    {errors.name && <span className="text-red-500 text-xs mt-1">Required</span>}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                                    <input
                                                        type="email"
                                                        {...register('email', { required: true })}
                                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 py-3"
                                                        placeholder="john@example.com"
                                                    />
                                                    {errors.email && <span className="text-red-500 text-xs mt-1">Required</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-100 pt-6">
                                            <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h3>
                                            <div className="p-4 border rounded-lg bg-gray-50 flex items-center">
                                                <input type="radio" checked readOnly className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                                                <label className="ml-3 block text-sm font-medium text-gray-700">Credit Card (Demo)</label>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-100 pt-6">
                                            <button
                                                type="submit"
                                                disabled={checkoutMutation.isLoading}
                                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all transform active:scale-95 disabled:opacity-70 flex justify-center items-center"
                                            >
                                                {checkoutMutation.isLoading ? 'Processing...' : `Pay $${cartTotal.toFixed(2)}`}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Success View */}
                {view === 'success' && orderResult && (
                    <div className="max-w-2xl mx-auto text-center mt-12 animate-fade-in-up">
                        <div className="bg-white rounded-3xl shadow-2xl p-12">
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-12 h-12 text-green-500" />
                            </div>
                            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Thank You!</h2>
                            <p className="text-xl text-gray-600 mb-8">Your order <span className="font-bold text-gray-900">{orderResult.orderNumber}</span> has been successfully placed.</p>

                            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
                                <a
                                    href={`/store/${actualAccountId}/invoice/${orderResult.orderId}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-8 py-4 bg-gray-100 text-gray-900 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                >
                                    View Invoice
                                </a>
                                <button
                                    onClick={() => setView('catalog')}
                                    className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-colors"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Cart Drawer */}
            {isCartOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setIsCartOpen(false)} />
                    <div className="fixed inset-y-0 right-0 max-w-md w-full flex">
                        <div className="w-full h-full bg-white shadow-2xl flex flex-col animate-slide-in-right">
                            <div className="p-6 flex items-center justify-between border-b border-gray-100">
                                <h2 className="text-2xl font-bold text-gray-900">Your Cart</h2>
                                <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                {cart.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                        <ShoppingCart className="w-16 h-16 mb-4 opacity-20" />
                                        <p>Your cart is empty.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {cart.map(item => {
                                            let imageUrl = 'https://via.placeholder.com/100x100?text=No+Img';
                                            try {
                                                const parsed = JSON.parse(item.product.images);
                                                if (parsed && parsed.length > 0) imageUrl = parsed[0];
                                            } catch (e) { }

                                            return (
                                                <div key={item.productId} className="flex items-center">
                                                    <img src={imageUrl} alt={item.product.name} className="w-20 h-20 object-cover rounded-lg mr-4 bg-gray-100 p-1" />
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900">{item.product.name}</h4>
                                                        <p className="text-blue-600 font-bold">${parseFloat(item.product.price).toFixed(2)}</p>
                                                        <div className="flex items-center mt-2">
                                                            <button onClick={() => updateQty(item.productId, -1)} className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200">-</button>
                                                            <span className="mx-4 font-medium">{item.qty}</span>
                                                            <button onClick={() => updateQty(item.productId, 1)} className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200">+</button>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => removeFromCart(item.productId)} className="text-red-400 hover:text-red-600 p-2">
                                                        <Trash2 className="w-5 h-5 mx-auto" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {cart.length > 0 && (
                                <div className="border-t border-gray-100 p-6 bg-gray-50">
                                    <div className="flex justify-between items-center mb-6">
                                        <span className="text-lg font-medium text-gray-600">Subtotal</span>
                                        <span className="text-2xl font-bold text-gray-900">${cartTotal.toFixed(2)}</span>
                                    </div>
                                    <button
                                        onClick={() => { setIsCartOpen(false); setView('checkout'); }}
                                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all transform active:scale-95"
                                    >
                                        Proceed to Checkout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Ensure trash icon imports if mapped dynamically
import { Trash2 } from 'lucide-react';
