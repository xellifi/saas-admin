import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import {
    Store,
    Link as LinkIcon,
    Palette,
    CreditCard,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    Loader2,
    Globe,
    Check
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import Notification from '@/components/ui/Notification';

export default function StoreSetup({ onComplete }) {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        store_name: '',
        store_slug: '',
        currency: 'USD',
        theme_color: '#2563eb',
        payment_methods: []
    });

    const updateMutation = useMutation({
        mutationFn: (data) => api.post('/addons/online-store/admin/stores', { ...data, accountId: user?.id, enabled: true }),
        onSuccess: () => {
            queryClient.invalidateQueries(['online-store-list']);
            queryClient.invalidateQueries(['store-dashboard']);
            toast.push(
                <Notification type="success" title="Store Launched!">
                    Your online store is now live and ready for business!
                </Notification>
            );
            if (onComplete) onComplete();
        },
        onError: (err) => {
            toast.push(
                <Notification type="danger" title="Setup Failed">
                    {err.message || "Failed to launch store. Please try again."}
                </Notification>
            );
        }
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Auto-generate slug from store name
        if (field === 'store_name') {
            const slug = value.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-');
            setFormData(prev => ({ ...prev, store_slug: slug }));
        }
    };

    const onSubmit = (e) => {
        e.preventDefault();
        console.log('StoreSetup onSubmit called with data:', formData);
        const payload = {
            ...formData,
            payment_methods: JSON.stringify(formData.payment_methods || [])
        };
        console.log('Sending payload:', payload);
        updateMutation.mutate(payload);
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const steps = [
        { id: 1, title: 'Basics', icon: <Store size={20} /> },
        { id: 2, title: 'Identity', icon: <LinkIcon size={20} /> },
        { id: 3, title: 'Design', icon: <Palette size={20} /> },
        { id: 4, title: 'Payments', icon: <CreditCard size={20} /> }
    ];

    return (
        <div className="min-h-[600px] flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-2xl shadow-blue-100/50 dark:shadow-blue-900/10 overflow-hidden transition-all">
                {/* Header / Progress */}
                <div className="p-8 border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Setup Your Store</h2>
                            <p className="text-sm text-gray-500 font-medium">Get your shop online in just a few minutes.</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200 dark:shadow-none">
                            <Store size={24} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-2">
                        {steps.map((s, idx) => (
                            <React.Fragment key={s.id}>
                                <div className="flex flex-col items-center gap-2">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${step >= s.id ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>
                                        {step > s.id ? <Check size={18} /> : s.icon}
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= s.id ? 'text-blue-600' : 'text-gray-400'}`}>{s.title}</span>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-4 rounded-full transition-all duration-500 ${step > s.id ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <form onSubmit={onSubmit}>
                    <div className="p-10 min-h-[350px]">
                        {/* Step 1: Basics */}
                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">What's your store name?</label>
                                    <input
                                        value={formData.store_name}
                                        onChange={(e) => handleInputChange('store_name', e.target.value)}
                                        placeholder="e.g. Neon Dreams Boutique"
                                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-lg font-bold dark:text-white"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Default Currency</label>
                                    <select
                                        value={formData.currency}
                                        onChange={(e) => handleInputChange('currency', e.target.value)}
                                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold dark:text-white appearance-none cursor-pointer"
                                    >
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                        <option value="PHP">PHP (₱)</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Identity */}
                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Store URL</label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">/s/</span>
                                        <input
                                            value={formData.store_slug}
                                            onChange={(e) => handleInputChange('store_slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                                            placeholder="your-store"
                                            className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-lg font-bold dark:text-white"
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 ml-1">This will be your store's unique URL.</p>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Design */}
                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Theme Color</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="color"
                                            value={formData.theme_color}
                                            onChange={(e) => handleInputChange('theme_color', e.target.value)}
                                            className="h-12 w-12 rounded-xl border border-gray-100 dark:border-gray-700"
                                        />
                                        <input
                                            type="text"
                                            value={formData.theme_color}
                                            onChange={(e) => handleInputChange('theme_color', e.target.value)}
                                            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold"
                                            placeholder="#2563eb"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Payments */}
                        {step === 4 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                        <div>
                                            <h5 className="font-bold text-gray-900 dark:text-white">Stripe</h5>
                                            <p className="text-sm text-gray-500">Accept credit cards and digital wallets</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const methods = formData.payment_methods || [];
                                                if (methods.includes('stripe')) {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        payment_methods: methods.filter(m => m !== 'stripe')
                                                    }));
                                                } else {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        payment_methods: [...methods, 'stripe']
                                                    }));
                                                }
                                            }}
                                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                                                formData.payment_methods?.includes('stripe') ? 'bg-blue-600' : 'bg-gray-300'
                                            }`}
                                        >
                                            <span
                                                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                                                    formData.payment_methods?.includes('stripe') ? 'translate-x-7' : 'translate-x-1'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="p-8 bg-gray-50/50 dark:bg-gray-900/30 border-t border-gray-50 dark:border-gray-700 flex justify-between items-center gap-4">
                        <div className="flex items-center justify-between w-full mt-8">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={step === 1}
                                className="px-6 py-4 rounded-2xl font-bold text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 transition-all flex items-center gap-2 border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ArrowLeft size={20} />
                                Back
                            </button>

                            {step < 4 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-none"
                                >
                                    Next Step
                                    <ArrowRight size={20} />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={updateMutation.isLoading}
                                    className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 dark:shadow-none disabled:opacity-50"
                                >
                                    {updateMutation.isLoading ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
                                    {updateMutation.isLoading ? 'Launching...' : 'Launch Store'}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
