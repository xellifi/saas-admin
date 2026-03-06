import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import {
    Save,
    Upload,
    Globe,
    Palette,
    CreditCard,
    Truck,
    Mail,
    Share2,
    Settings,
    Eye,
    EyeOff,
    Loader2
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import Notification from '@/components/ui/Notification';

export default function StoreEditor({ store, onComplete }) {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    
    const [formData, setFormData] = useState({
        store_name: '',
        store_slug: '',
        currency: 'USD',
        theme_color: '#2563eb',
        logo_url: '',
        banner_url: '',
        payment_methods: [],
        shipping_methods: [],
        email_settings: {},
        social_links: {},
        custom_css: '',
        custom_js: '',
        maintenance_mode: false,
        enabled: true
    });

    const [activeTab, setActiveTab] = useState('general');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (store) {
            setFormData({
                store_name: store.store_name || '',
                store_slug: store.store_slug || '',
                currency: store.currency || 'USD',
                theme_color: store.theme_color || '#2563eb',
                logo_url: store.logo_url || '',
                banner_url: store.banner_url || '',
                payment_methods: store.payment_methods || [],
                shipping_methods: store.shipping_methods || [],
                email_settings: store.email_settings || {},
                social_links: store.social_links || {},
                custom_css: store.custom_css || '',
                custom_js: store.custom_js || '',
                maintenance_mode: store.maintenance_mode || false,
                enabled: store.enabled !== false
            });
        }
    }, [store]);

    const updateMutation = useMutation({
        mutationFn: (data) => api.put(`/addons/online-store/admin/stores/${store.id}`, { ...data, accountId: user?.id }),
        onSuccess: () => {
            queryClient.invalidateQueries(['online-store-list']);
            toast.push(
                <Notification type="success" title="Store Updated">
                    Store settings have been updated successfully.
                </Notification>
            );
            onComplete();
        },
        onError: (err) => {
            toast.push(<Notification type="danger" title="Error" message={err.message} />);
        },
        onSettled: () => {
            setIsLoading(false);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        updateMutation.mutate(formData);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Globe },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'payments', label: 'Payments', icon: CreditCard },
        { id: 'shipping', label: 'Shipping', icon: Truck },
        { id: 'email', label: 'Email', icon: Mail },
        { id: 'social', label: 'Social', icon: Share2 },
        { id: 'advanced', label: 'Advanced', icon: Settings }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Store Name
                            </label>
                            <input
                                type="text"
                                value={formData.store_name}
                                onChange={(e) => handleInputChange('store_name', e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm"
                                placeholder="My Awesome Store"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Store Slug
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">/s/</span>
                                <input
                                    type="text"
                                    value={formData.store_slug}
                                    onChange={(e) => handleInputChange('store_slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                                    className="w-full pl-12 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm"
                                    placeholder="my-store"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Currency
                            </label>
                            <select
                                value={formData.currency}
                                onChange={(e) => handleInputChange('currency', e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm"
                            >
                                <option value="USD">USD - US Dollar</option>
                                <option value="EUR">EUR - Euro</option>
                                <option value="GBP">GBP - British Pound</option>
                                <option value="CAD">CAD - Canadian Dollar</option>
                                <option value="AUD">AUD - Australian Dollar</option>
                                <option value="JPY">JPY - Japanese Yen</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Store Status</h4>
                                <p className="text-xs text-gray-500">Enable or disable your storefront</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleInputChange('enabled', !formData.enabled)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                    formData.enabled ? 'bg-blue-600' : 'bg-gray-300'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        formData.enabled ? 'translate-x-4' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                );

            case 'appearance':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Theme Color
                            </label>
                            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                <input
                                    type="color"
                                    value={formData.theme_color}
                                    onChange={(e) => handleInputChange('theme_color', e.target.value)}
                                    className="h-8 w-8 rounded-none border border-gray-300 dark:border-gray-600 shrink-0 appearance-none color-swatch-square"
                                />
                                <input
                                    type="text"
                                    value={formData.theme_color}
                                    onChange={(e) => handleInputChange('theme_color', e.target.value)}
                                    className="flex-1 min-w-[160px] px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm"
                                    placeholder="#2563eb"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Logo URL
                            </label>
                            <input
                                type="url"
                                value={formData.logo_url}
                                onChange={(e) => handleInputChange('logo_url', e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm"
                                placeholder="https://example.com/logo.png"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Banner URL
                            </label>
                            <input
                                type="url"
                                value={formData.banner_url}
                                onChange={(e) => handleInputChange('banner_url', e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm"
                                placeholder="https://example.com/banner.jpg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Custom CSS
                            </label>
                            <textarea
                                value={formData.custom_css}
                                onChange={(e) => handleInputChange('custom_css', e.target.value)}
                                rows={6}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-mono text-xs"
                                placeholder="/* Custom CSS styles */"
                            />
                        </div>
                    </div>
                );

            case 'payments':
                return (
                    <div className="space-y-6">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-1 text-sm">Payment Methods</h4>
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                Configure which payment methods are available in your store.
                            </p>
                        </div>
                        
                        <div className="space-y-4">
                            {['stripe', 'paypal', 'square', 'cash_on_delivery'].map(method => (
                                <div key={method} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                    <div>
                                        <h5 className="font-bold text-gray-900 dark:text-white capitalize text-sm">
                                            {method.replace('_', ' ')}
                                        </h5>
                                        <p className="text-xs text-gray-500">
                                            {method === 'stripe' && 'Accept credit cards and digital wallets'}
                                            {method === 'paypal' && 'Accept PayPal payments'}
                                            {method === 'square' && 'Accept Square payments'}
                                            {method === 'cash_on_delivery' && 'Accept cash on delivery'}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const methods = [...formData.payment_methods];
                                            if (methods.includes(method)) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    payment_methods: methods.filter(m => m !== method)
                                                }));
                                            } else {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    payment_methods: [...methods, method]
                                                }));
                                            }
                                        }}
                                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                            formData.payment_methods.includes(method) ? 'bg-blue-600' : 'bg-gray-300'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                formData.payment_methods.includes(method) ? 'translate-x-4' : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'advanced':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Maintenance Mode</h4>
                                <p className="text-xs text-gray-500">Temporarily disable your storefront</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleInputChange('maintenance_mode', !formData.maintenance_mode)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                    formData.maintenance_mode ? 'bg-amber-600' : 'bg-gray-300'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        formData.maintenance_mode ? 'translate-x-4' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Custom JavaScript
                            </label>
                            <textarea
                                value={formData.custom_js}
                                onChange={(e) => handleInputChange('custom_js', e.target.value)}
                                rows={6}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-mono text-xs"
                                placeholder="/* Custom JavaScript code */"
                            />
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="text-center py-12">
                        <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">This tab is coming soon!</p>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        Edit Store
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">Update your store settings and preferences</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tab Navigation */}
                <div className="flex overflow-x-auto bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-xs transition-all whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                            >
                                <Icon size={14} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                    {renderTabContent()}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onComplete}
                        className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
