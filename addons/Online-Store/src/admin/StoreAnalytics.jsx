import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingCart,
    Users,
    Package,
    Calendar,
    BarChart3,
    PieChart,
    Activity,
    Download,
    Filter,
    Loader2,
    Eye,
    MousePointer,
    Clock,
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

    const options = [{ id: '', name: 'All Stores' }, ...(stores || [])];
    const selected = options.find(o => o.id === selectedId) || options[0];

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setIsOpen(o => !o)}
                className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-gray-900 dark:text-white min-w-[160px]"
            >
                <span>{selected?.name || 'All Stores'}</span>
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

export default function StoreAnalytics() {
    const { user } = useAuthStore();
    const [selectedStoreId, setSelectedStoreId] = useState('');
    const [period, setPeriod] = useState('30d');
    const [activeMetric, setActiveMetric] = useState('revenue');

    // Get stores
    const { data: stores, isLoading: storesLoading } = useQuery({
        queryKey: ['online-store-list', user?.id],
        queryFn: async () => {
            const response = await api.get('/addons/online-store/admin/stores', { accountId: user?.id });
            return response.data || [];
        },
        enabled: !!user?.id
    });

    // Get analytics data
    const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
        queryKey: ['store-analytics', selectedStoreId, period],
        queryFn: async () => {
            if (!selectedStoreId) return null;
            const response = await api.get(`/addons/online-store/admin/stores/${selectedStoreId}/analytics`, { 
                accountId: user?.id, 
                period 
            });
            return response.data;
        },
        enabled: !!selectedStoreId
    });

    const periods = [
        { id: '7d', label: 'Last 7 days', days: 7 },
        { id: '30d', label: 'Last 30 days', days: 30 },
        { id: '90d', label: 'Last 90 days', days: 90 }
    ];

    const metrics = [
        { id: 'revenue', label: 'Revenue', icon: DollarSign, color: 'green' },
        { id: 'orders', label: 'Orders', icon: ShoppingCart, color: 'blue' },
        { id: 'visitors', label: 'Visitors', icon: Users, color: 'purple' },
        { id: 'products', label: 'Products', icon: Package, color: 'amber' }
    ];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('en-US').format(num || 0);
    };

    const calculateGrowth = (current, previous) => {
        if (!previous || previous === 0) return 0;
        return ((current - previous) / previous) * 100;
    };

    const renderMetricCards = () => {
        const summary = analyticsData?.summary || {};
        
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric) => {
                    const Icon = metric.icon;
                    let value = 0;
                    let growth = 0;
                    
                    switch (metric.id) {
                        case 'revenue':
                            value = summary.total_revenue || 0;
                            growth = 24; // Mock growth
                            break;
                        case 'orders':
                            value = summary.total_orders || 0;
                            growth = 18; // Mock growth
                            break;
                        case 'visitors':
                            value = 1250; // Mock visitors
                            growth = 12; // Mock growth
                            break;
                        case 'products':
                            value = 48; // Mock products
                            growth = 8; // Mock growth
                            break;
                    }
                    
                    return (
                        <div
                            key={metric.id}
                            className={`card p-6 hover:shadow-lg transition-all cursor-pointer ${
                                activeMetric === metric.id ? 'ring-2 ring-blue-500' : ''
                            }`}
                            onClick={() => setActiveMetric(metric.id)}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-gray-900 dark:text-white">
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="flex items-center gap-1 text-sm font-bold text-gray-500 dark:text-gray-400">
                                    {growth >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                    {Math.abs(growth)}%
                                </div>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                                {metric.label}
                            </p>
                            <h3 className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white">
                                {metric.id === 'revenue' ? formatCurrency(value) : formatNumber(value)}
                            </h3>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderChart = () => {
        // Mock chart data based on selected metric
        const chartData = [];
        const days = periods.find(p => p.id === period)?.days || 30;
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            let value = 0;
            switch (activeMetric) {
                case 'revenue':
                    value = Math.floor(Math.random() * 5000) + 1000;
                    break;
                case 'orders':
                    value = Math.floor(Math.random() * 50) + 10;
                    break;
                case 'visitors':
                    value = Math.floor(Math.random() * 200) + 50;
                    break;
                case 'products':
                    value = Math.floor(Math.random() * 100) + 20;
                    break;
            }
            
            chartData.push({
                date: date.toISOString().split('T')[0],
                value
            });
        }
        
        const maxValue = Math.max(...chartData.map(d => d.value));
        
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black tracking-tighter text-gray-900 dark:text-white">
                        {metrics.find(m => m.id === activeMetric)?.label} Trend
                    </h3>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
                        <Download size={16} />
                        Export
                    </button>
                </div>
                
                <div className="h-64 flex items-end justify-between gap-2">
                    {chartData.map((data, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                            <div 
                                className="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600"
                                style={{ 
                                    height: `${(data.value / maxValue) * 100}%`,
                                    minHeight: '4px'
                                }}
                                title={`${data.date}: ${activeMetric === 'revenue' ? formatCurrency(data.value) : formatNumber(data.value)}`}
                            />
                            <div className="text-xs text-gray-400 mt-2 text-center">
                                {new Date(data.date).getDate()}
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-4 text-center text-sm text-gray-500">
                    {periods.find(p => p.id === period)?.label}
                </div>
            </div>
        );
    };

    const renderTopProducts = () => {
        const topProducts = [
            { name: 'Premium Widget', sales: 145, revenue: 7250 },
            { name: 'Super Gadget', sales: 98, revenue: 4900 },
            { name: 'Mega Tool', sales: 87, revenue: 4350 },
            { name: 'Ultra Device', sales: 76, revenue: 3800 },
            { name: 'Pro Equipment', sales: 65, revenue: 3250 }
        ];
        
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8">
                <h3 className="text-xl font-black tracking-tighter text-gray-900 dark:text-white mb-6">
                    Top Products
                </h3>
                
                <div className="space-y-4">
                    {topProducts.map((product, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                                    <Package className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{product.name}</h4>
                                    <p className="text-sm text-gray-500">{product.sales} sold</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(product.revenue)}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {formatCurrency(product.revenue / product.sales)} each
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderTrafficSources = () => {
        const trafficSources = [
            { source: 'Direct', visitors: 450, percentage: 36 },
            { source: 'Organic Search', visitors: 320, percentage: 26 },
            { source: 'Social Media', visitors: 280, percentage: 22 },
            { source: 'Referral', visitors: 150, percentage: 12 },
            { source: 'Email', visitors: 50, percentage: 4 }
        ];
        
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8">
                <h3 className="text-xl font-black tracking-tighter text-gray-900 dark:text-white mb-6">
                    Traffic Sources
                </h3>
                
                <div className="space-y-4">
                    {trafficSources.map((source, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${
                                    index === 0 ? 'bg-blue-500' :
                                    index === 1 ? 'bg-green-500' :
                                    index === 2 ? 'bg-purple-500' :
                                    index === 3 ? 'bg-amber-500' :
                                    'bg-red-500'
                                }`} />
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {source.source}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-500">
                                    {formatNumber(source.visitors)} visitors
                                </span>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                    {source.percentage}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
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
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Store Analytics
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Track performance and gain insights into your stores</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <StoreSelectDropdown stores={stores} selectedId={selectedStoreId} onChange={setSelectedStoreId} />
                    
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                        {periods.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setPeriod(p.id)}
                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                                    period === p.id
                                        ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {!selectedStoreId ? (
                <div className="text-center py-20 bg-gray-50/50 dark:bg-gray-900/30 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Select a Store</h3>
                    <p className="text-gray-500 font-medium">Choose a store to view its analytics and performance data.</p>
                </div>
            ) : (
                <>
                    {analyticsLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading analytics...</span>
                        </div>
                    ) : (
                        <>
                            {/* Metric Cards */}
                            {renderMetricCards()}
                            
                            {/* Charts Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2">
                                    {renderChart()}
                                </div>
                                <div>
                                    {renderTrafficSources()}
                                </div>
                            </div>
                            
                            {/* Top Products */}
                            {renderTopProducts()}
                        </>
                    )}
                </>
            )}
        </div>
    );
}
