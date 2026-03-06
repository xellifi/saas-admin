import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import StorefrontLayout from '@/components/StorefrontLayout';
import { ShoppingCart, Plus, Loader2, AlertCircle, ArrowRight, Star, Heart } from 'lucide-react';

const fetchStoreBySlug = async (slug) => {
    // We use the public API endpoint
    const response = await api.get(`/addons/online-store/public/store/slug/${slug}`);
    if (!response.success) throw new Error(response.error || 'Store not found');
    return response;
};

export default function Storefront() {
    const { slug } = useParams();
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const { data, isLoading, error } = useQuery({
        queryKey: ['public-store', slug],
        queryFn: () => fetchStoreBySlug(slug),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1
    });

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        setIsCartOpen(true);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-sm font-black uppercase tracking-widest text-gray-400">Loading Experience...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white text-center">
                <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-6 mx-auto">
                    <AlertCircle size={40} />
                </div>
                <h1 className="text-4xl font-black tracking-tighter mb-4 text-gray-900 leading-none">Store Not Found</h1>
                <p className="text-gray-500 font-medium mb-12 max-w-sm mx-auto leading-relaxed">The store you are looking for doesn't exist or has been disabled by the owner.</p>
                <a href="/" className="px-10 py-4 bg-gray-900 text-white rounded-full font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-all">
                    Return Home
                </a>
            </div>
        );
    }

    const { store, products } = data;
    const themeColor = store.theme_color || '#2563eb';

    return (
        <StorefrontLayout
            storeName={store.store_name}
            cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
            onOpenCart={() => setIsCartOpen(true)}
        >
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
                {/* Hero Section */}
                <section className="mb-20 relative overflow-hidden rounded-[3rem] bg-gray-900 h-[400px] flex items-center p-12 lg:p-20 text-white group">
                    <div className="relative z-10 max-w-2xl">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-widest mb-6">New Collection 2026</span>
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tighter mb-6 leading-[0.9] lg:leading-[0.85]">
                            Evolve Your <br />
                            <span style={{ color: themeColor }} className="text-blue-500">Everyday Style.</span>
                        </h1>
                        <p className="text-lg text-gray-400 font-medium mb-10 max-w-md leading-relaxed hidden sm:block">
                            Discover our latest drop featuring curated minimalist essentials designed for the modern lifestyle.
                        </p>
                        <button
                            className="px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/50"
                            style={{ backgroundColor: themeColor }}
                        >
                            Explore Drop
                        </button>
                    </div>
                    {/* Abstract background elements */}
                    <div className="absolute top-0 right-0 w-1/2 h-full opacity-30 pointer-events-none transition-transform duration-1000 group-hover:scale-110">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[100px]" style={{ backgroundColor: themeColor }} />
                    </div>
                </section>

                {/* Product Grid */}
                <section>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div>
                            <h2 className="text-4xl font-black tracking-tighter mb-2">Featured Picks</h2>
                            <p className="text-gray-500 font-medium">Curated products that our community loves most.</p>
                        </div>
                        <div className="flex gap-4">
                            <button className="px-6 py-2 rounded-full border border-gray-100 text-sm font-bold hover:bg-white hover:shadow-sm transition-all">All Products</button>
                            <button className="px-6 py-2 rounded-full border border-gray-100 text-sm font-bold text-gray-400 hover:text-gray-900 transition-all">Trending</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {products.map((product) => (
                            <div key={product.id} className="group relative flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="aspect-square w-full bg-gray-100 rounded-[2.5rem] overflow-hidden mb-6 relative shadow-sm border border-gray-50 transition-all group-hover:shadow-2xl group-hover:shadow-blue-100">
                                    {/* Mock image if none exists */}
                                    <div className="w-full h-full flex items-center justify-center text-gray-300 font-black text-4xl group-hover:scale-110 transition-transform duration-1000">
                                        {product.name.charAt(0)}
                                    </div>
                                    <div className="absolute top-5 right-5 flex flex-col gap-2">
                                        <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shadow-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                            <Heart size={18} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => addToCart(product)}
                                        className="absolute bottom-5 left-5 right-5 h-14 rounded-3xl bg-white text-gray-900 font-black text-sm flex items-center justify-center gap-2 shadow-xl opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 hover:bg-gray-50 active:scale-95"
                                    >
                                        <Plus size={20} />
                                        Quick Add
                                    </button>
                                </div>
                                <div className="flex flex-col flex-grow px-2">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-black text-lg tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                                        <p className="font-black text-xl tracking-tighter" style={{ color: themeColor }}>${parseFloat(product.price).toFixed(2)}</p>
                                    </div>
                                    <p className="text-gray-400 font-medium text-xs mb-4 line-clamp-2 leading-relaxed">{product.description || 'Modern essential designed for daily life.'}</p>
                                    <div className="mt-auto flex items-center gap-1.5 pt-4 border-t border-gray-50">
                                        <Star size={12} className="fill-blue-500 text-blue-500" style={{ color: themeColor, fill: themeColor }} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">4.9 (128 reviews)</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Simple Cart Drawer Mockup (Could be expanded) */}
            {isCartOpen && (
                <div className="fixed inset-0 z-[100] overflow-hidden">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)} />
                    <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-3xl font-black tracking-tighter">Your Bag</h2>
                            <button onClick={() => setIsCartOpen(false)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>
                        <div className="flex-grow overflow-y-auto p-8 space-y-8">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center">
                                    <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mb-6">
                                        <ShoppingCart size={40} />
                                    </div>
                                    <p className="text-xl font-black tracking-tight mb-2">Your Bag is Empty</p>
                                    <p className="text-gray-400 font-medium text-sm">Looks like you haven't added anything yet.</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} className="flex gap-6 group">
                                        <div className="w-24 h-24 rounded-3xl bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-300 font-black text-xl">
                                            {item.name.charAt(0)}
                                        </div>
                                        <div className="flex-grow flex flex-col justify-center">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-black tracking-tight text-gray-900">{item.name}</h4>
                                                <p className="font-black text-sm" style={{ color: themeColor }}>${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                                            </div>
                                            <div className="flex items-center gap-4 mt-2">
                                                <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-1 border border-gray-100">
                                                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">Qty {item.quantity}</span>
                                                </div>
                                                <button className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-500">Remove</button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-8 bg-gray-50/50 border-t border-gray-100 space-y-6">
                            <div className="flex justify-between items-center px-2">
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Subtotal</span>
                                <span className="text-2xl font-black tracking-tighter">
                                    ${cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0).toFixed(2)}
                                </span>
                            </div>
                            <button
                                className="w-full h-16 rounded-3xl text-white font-black text-sm uppercase tracking-widest shadow-2xl transition-all hover:scale-102 active:scale-98 disabled:opacity-50 disabled:grayscale"
                                style={{ backgroundColor: themeColor }}
                                disabled={cart.length === 0}
                            >
                                Checkout Now
                            </button>
                            <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Taxes and shipping calculated at checkout</p>
                        </div>
                    </div>
                </div>
            )}
        </StorefrontLayout>
    );
}
