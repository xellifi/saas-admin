import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { useConfirmDialog } from '@/contexts/ConfirmDialogContext';
import {
    Save,
    RefreshCw,
    Settings,
    Globe,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    Truck,
    Bell,
    Palette,
    Package,
    Users,
    Shield,
    Loader2,
    Check,
    X,
    Info,
    ChevronDown
} from 'lucide-react';

function StoreSelectDropdown({ stores, selectedId, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const options = [{ id: '', name: 'Choose a store...' }, ...(stores || [])];
    const selected = options.find(o => o.id === selectedId) || options[0];

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setIsOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 dark:text-white"
            >
                <span>{selected?.name || 'Choose a store...'}</span>
                <ChevronDown className="ml-2 text-gray-400 flex-shrink-0" size={18} />
            </button>
            {isOpen && (
                <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 overflow-hidden">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Store</p>
                    </div>
                    {options.map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => { onChange(opt.id); setIsOpen(false); }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                opt.id === selectedId
                                    ? 'bg-gray-50 dark:bg-gray-700/50 font-semibold text-gray-900 dark:text-white'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }`}
                        >
                            {opt.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
import { toast } from '@/components/ui/Toast';
import Notification from '@/components/ui/Notification';

export default function StorePreferences() {
    const { user } = useAuthStore();
    const { confirm } = useConfirmDialog();
    const queryClient = useQueryClient();
    
    const [selectedStoreId, setSelectedStoreId] = useState('');
    const [preferences, setPreferences] = useState({});
    const [hasChanges, setHasChanges] = useState(false);
    const [activeCategory, setActiveCategory] = useState('general');

    // Get stores
    const { data: stores, isLoading: storesLoading } = useQuery({
        queryKey: ['online-store-list', user?.id],
        queryFn: async () => {
            const response = await api.get('/addons/online-store/admin/stores', { accountId: user?.id });
            return response.data || [];
        },
        enabled: !!user?.id
    });

    // Get store preferences
    const { data: storeData, isLoading: prefsLoading } = useQuery({
        queryKey: ['store-preferences', selectedStoreId],
        queryFn: async () => {
            if (!selectedStoreId) return null;
            const response = await api.get(`/addons/online-store/admin/stores/${selectedStoreId}`, { accountId: user?.id });
            return response.data;
        },
        enabled: !!selectedStoreId
    });

    // Update preferences mutation
    const updateMutation = useMutation({
        mutationFn: ({ storeId, preferences }) => 
            api.put(`/addons/online-store/admin/stores/${storeId}/preferences`, { 
                accountId: user?.id, 
                preferences 
            }),
        onSuccess: () => {
            queryClient.invalidateQueries(['store-preferences', selectedStoreId]);
            toast.push(
                <Notification type="success" title="Preferences Updated">
                    Store preferences have been saved successfully.
                </Notification>
            );
            setHasChanges(false);
        },
        onError: (err) => {
            toast.push(<Notification type="danger" title="Error" message={err.message} />);
        }
    });

    useEffect(() => {
        if (storeData?.preferences) {
            const prefs = {};
            storeData.preferences.forEach(pref => {
                let value = pref.setting_value;
                if (pref.setting_type === 'boolean') {
                    value = value === 'true';
                } else if (pref.setting_type === 'number') {
                    value = parseFloat(value);
                } else if (pref.setting_type === 'json') {
                    try {
                        value = JSON.parse(value);
                    } catch {
                        value = {};
                    }
                }
                prefs[pref.setting_key] = {
                    value,
                    type: pref.setting_type,
                    category: pref.category,
                    public: pref.is_public
                };
            });
            setPreferences(prefs);
        }
    }, [storeData]);

    const handlePreferenceChange = (key, value, type = 'string') => {
        setPreferences(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                value: type === 'json' && typeof value === 'object' ? JSON.stringify(value) : value,
                type
            }
        }));
        setHasChanges(true);
    };

    const handleSave = () => {
        if (!selectedStoreId) return;
        
        const prefsToUpdate = {};
        Object.entries(preferences).forEach(([key, pref]) => {
            prefsToUpdate[key] = {
                value: pref.value,
                type: pref.type,
                category: pref.category,
                public: pref.public
            };
        });
        
        updateMutation.mutate({ storeId: selectedStoreId, preferences: prefsToUpdate });
    };

    const handleReset = async () => {
        const result = await confirm({
            title: 'Reset Preferences',
            message: 'Are you sure you want to reset all preferences to default values? This action cannot be undone.',
            confirmText: 'Reset',
            cancelText: 'Cancel',
            confirmVariant: 'danger'
        });

        if (result) {
            // Call the reset API endpoint
            try {
                await api.put(`/addons/online-store/admin/stores/${selectedStoreId}/preferences/reset`, { 
                    accountId: user?.id 
                });
                
                // Refresh the preferences data
                queryClient.invalidateQueries(['store-preferences', selectedStoreId]);
                
                toast.push(
                    <Notification type="success" title="Preferences Reset">
                        All preferences have been reset to default values.
                    </Notification>
                );
            } catch (error) {
                toast.push(
                    <Notification type="danger" title="Reset Failed">
                        Failed to reset preferences. Please try again.
                    </Notification>
                );
            }
        }
    };

    const categories = [
        { id: 'general', label: 'General', icon: Globe, color: 'blue' },
        { id: 'display', label: 'Display', icon: Palette, color: 'purple' },
        { id: 'checkout', label: 'Checkout', icon: CreditCard, color: 'green' },
        { id: 'shipping', label: 'Shipping', icon: Truck, color: 'amber' },
        { id: 'tax', label: 'Tax', icon: Shield, color: 'red' },
        { id: 'notifications', label: 'Notifications', icon: Bell, color: 'indigo' }
    ];

    const renderCategoryContent = () => {
        const categoryPrefs = Object.entries(preferences).filter(([_, pref]) => pref.category === activeCategory);

        switch (activeCategory) {
            case 'general':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Store Description
                            </label>
                            <textarea
                                value={preferences.store_description?.value || ''}
                                onChange={(e) => handlePreferenceChange('store_description', e.target.value, 'string')}
                                rows={3}
                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                placeholder="Describe your store and what makes it unique..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Store Email
                                </label>
                                <input
                                    type="email"
                                    value={preferences.store_email?.value || ''}
                                    onChange={(e) => handlePreferenceChange('store_email', e.target.value, 'string')}
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                    placeholder="contact@store.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Store Phone
                                </label>
                                <input
                                    type="tel"
                                    value={preferences.store_phone?.value || ''}
                                    onChange={(e) => handlePreferenceChange('store_phone', e.target.value, 'string')}
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Store Address
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Street Address"
                                    className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                />
                                <input
                                    type="text"
                                    placeholder="City"
                                    className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                />
                                <input
                                    type="text"
                                    placeholder="State/Province"
                                    className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                />
                                <input
                                    type="text"
                                    placeholder="ZIP/Postal Code"
                                    className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'display':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Products Per Page
                            </label>
                            <select
                                value={preferences.products_per_page?.value || 12}
                                onChange={(e) => handlePreferenceChange('products_per_page', parseInt(e.target.value), 'number')}
                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                            >
                                <option value={6}>6 products</option>
                                <option value={12}>12 products</option>
                                <option value={24}>24 products</option>
                                <option value={36}>36 products</option>
                                <option value={48}>48 products</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">Show Out of Stock Products</h4>
                                <p className="text-sm text-gray-500">Display products that are currently out of stock</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handlePreferenceChange('show_out_of_stock', !preferences.show_out_of_stock?.value, 'boolean')}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                                    preferences.show_out_of_stock?.value ? 'bg-blue-600' : 'bg-gray-300'
                                }`}
                            >
                                <span
                                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                                        preferences.show_out_of_stock?.value ? 'translate-x-7' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                );

            case 'checkout':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">Require Phone Number</h4>
                                <p className="text-sm text-gray-500">Make phone number required during checkout</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handlePreferenceChange('require_phone', !preferences.require_phone?.value, 'boolean')}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                                    preferences.require_phone?.value ? 'bg-blue-600' : 'bg-gray-300'
                                }`}
                            >
                                <span
                                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                                        preferences.require_phone?.value ? 'translate-x-7' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">Enable Guest Checkout</h4>
                                <p className="text-sm text-gray-500">Allow customers to checkout without creating an account</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handlePreferenceChange('enable_guest_checkout', !preferences.enable_guest_checkout?.value, 'boolean')}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                                    preferences.enable_guest_checkout?.value ? 'bg-blue-600' : 'bg-gray-300'
                                }`}
                            >
                                <span
                                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                                        preferences.enable_guest_checkout?.value ? 'translate-x-7' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                );

            case 'shipping':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Free Shipping Threshold
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                <input
                                    type="number"
                                    value={preferences.free_shipping_threshold?.value || 0}
                                    onChange={(e) => handlePreferenceChange('free_shipping_threshold', parseFloat(e.target.value), 'number')}
                                    className="w-full pl-8 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                />
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                Orders above this amount qualify for free shipping. Set to 0 to disable.
                            </p>
                        </div>
                    </div>
                );

            case 'tax':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">Tax Included in Prices</h4>
                                <p className="text-sm text-gray-500">Show prices including tax</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handlePreferenceChange('tax_included', !preferences.tax_included?.value, 'boolean')}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                                    preferences.tax_included?.value ? 'bg-blue-600' : 'bg-gray-300'
                                }`}
                            >
                                <span
                                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                                        preferences.tax_included?.value ? 'translate-x-7' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                );

            case 'notifications':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">New Order Email</h4>
                                <p className="text-sm text-gray-500">Send email notification for new orders</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handlePreferenceChange('new_order_email', !preferences.new_order_email?.value, 'boolean')}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                                    preferences.new_order_email?.value ? 'bg-blue-600' : 'bg-gray-300'
                                }`}
                            >
                                <span
                                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                                        preferences.new_order_email?.value ? 'translate-x-7' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">Low Stock Email</h4>
                                <p className="text-sm text-gray-500">Send email when products run low on stock</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handlePreferenceChange('low_stock_email', !preferences.low_stock_email?.value, 'boolean')}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                                    preferences.low_stock_email?.value ? 'bg-blue-600' : 'bg-gray-300'
                                }`}
                            >
                                <span
                                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                                        preferences.low_stock_email?.value ? 'translate-x-7' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="text-center py-12">
                        <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">No preferences available for this category.</p>
                    </div>
                );
        }
    };

    if (storesLoading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading stores...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Store Preferences
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Configure detailed settings and preferences for your stores</p>
                </div>
                
                <div className="flex items-center gap-3">
                    {hasChanges && (
                        <button
                            onClick={handleSave}
                            disabled={updateMutation.isLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {updateMutation.isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            Save Changes
                        </button>
                    )}
                    
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Reset to Defaults
                    </button>
                </div>
            </div>

            {/* Store Selector */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Select Store
                </label>
                <StoreSelectDropdown stores={stores} selectedId={selectedStoreId} onChange={setSelectedStoreId} />
            </div>

            {selectedStoreId && (
                <>
                    {/* Category Tabs */}
                    <div className="flex overflow-x-auto bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                        {categories.map((category) => {
                            const Icon = category.icon;
                            return (
                                <button
                                    key={category.id}
                                    onClick={() => setActiveCategory(category.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                                        activeCategory === category.id
                                            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <Icon size={16} />
                                    {category.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Content */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8">
                        {prefsLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading preferences...</span>
                            </div>
                        ) : (
                            renderCategoryContent()
                        )}
                    </div>
                </>
            )}

            {!selectedStoreId && (
                <div className="text-center py-20 bg-gray-50/50 dark:bg-gray-900/30 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Select a Store</h3>
                    <p className="text-gray-500 font-medium">Choose a store to configure its preferences and settings.</p>
                </div>
            )}
        </div>
    );
}
