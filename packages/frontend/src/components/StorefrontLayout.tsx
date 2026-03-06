import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X } from 'lucide-react';

interface StorefrontLayoutProps {
    children: React.ReactNode;
    storeName?: string;
    cartCount?: number;
    onOpenCart?: () => void;
}

export default function StorefrontLayout({ children, storeName, cartCount = 0, onOpenCart }: StorefrontLayoutProps) {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
        <div className="min-h-screen bg-[#fafafa] text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Minimalist Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link to="/" className="text-xl font-black tracking-tighter hover:opacity-70 transition-opacity">
                        {storeName || 'Online Store'}
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-10">
                        <Link to="/" className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">Shop</Link>
                        <Link to="/" className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">Categories</Link>
                        <Link to="/" className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">About</Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                            <Search size={20} />
                        </button>
                        <button
                            onClick={onOpenCart}
                            className="group relative p-2 text-gray-900 flex items-center gap-2 hover:bg-gray-50 rounded-full transition-all px-4"
                        >
                            <ShoppingBag size={20} className="group-hover:scale-110 transition-transform" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-4 ring-white">
                                    {cartCount}
                                </span>
                            )}
                            <span className="text-sm font-bold hidden sm:block">Cart</span>
                        </button>
                        <button
                            className="md:hidden p-2 text-gray-900"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <nav className="flex flex-col gap-6">
                        <Link to="/" className="text-3xl font-black tracking-tight" onClick={() => setIsMenuOpen(false)}>Shop</Link>
                        <Link to="/" className="text-3xl font-black tracking-tight" onClick={() => setIsMenuOpen(false)}>Categories</Link>
                        <Link to="/" className="text-3xl font-black tracking-tight" onClick={() => setIsMenuOpen(false)}>About</Link>
                        <div className="h-px bg-gray-100 my-4" />
                        <Link to="/" className="text-3xl font-black tracking-tight text-blue-600" onClick={() => setIsMenuOpen(false)}>My Account</Link>
                    </nav>
                </div>
            )}

            <main className="max-w-7xl mx-auto px-6 py-12">
                {children}
            </main>

            <footer className="bg-white border-t border-gray-100 py-12 mt-20">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div>
                        <h3 className="text-lg font-black tracking-tight mb-4">{storeName}</h3>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-xs">
                            Modern shopping experience powered by Antigravity Cloud. Discover premium products curated just for you.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-6">Customer Service</h4>
                        <ul className="space-y-4 text-sm font-bold text-gray-600">
                            <li><Link to="/" className="hover:text-blue-600 transition-colors">Shipping Policy</Link></li>
                            <li><Link to="/" className="hover:text-blue-600 transition-colors">Returns & Exchanges</Link></li>
                            <li><Link to="/" className="hover:text-blue-600 transition-colors">Track Order</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-6">Connected</h4>
                        <ul className="space-y-4 text-sm font-bold text-gray-600">
                            <li><Link to="/" className="hover:text-blue-600 transition-colors">Instagram</Link></li>
                            <li><Link to="/" className="hover:text-blue-600 transition-colors">Twitter</Link></li>
                            <li><Link to="/" className="hover:text-blue-600 transition-colors">Newsletter</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 mt-12 pt-12 border-t border-gray-50 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">&copy; 2026 {storeName}. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
