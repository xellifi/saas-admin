import React, { useRef, useState as useStateAlias } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import {
    Package,
    ShoppingCart,
    DollarSign,
    AlertTriangle,
    Loader2,
    RefreshCcw,
    MoreHorizontal,
    Plus,
    Minus,
    Search,
    Hand,
    Home,
    Menu,
    ChevronDown,
    Truck,
    Clock,
    RotateCcw
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import StoreSetup from './StoreSetup';

const fetchDashboardStats = async (userId, storeId) => {
    // lib/api handles the /api prefix automatically
    const response = await api.get('/addons/online-store/admin/dashboard', { accountId: userId, storeId });
    if (!response.success) throw new Error(response.error || 'Failed to fetch stats');
    return response.data;
};

const graphData = [
    { time: '00:00', series1: 30, series2: 10 },
    { time: '01:00', series1: 38, series2: 28 },
    { time: '02:00', series1: 35, series2: 38 },
    { time: '03:00', series1: 45, series2: 32 },
    { time: '04:00', series1: 42, series2: 33 },
    { time: '05:00', series1: 95, series2: 48 },
    { time: '06:00', series1: 105, series2: 40 },
];

const pieData = [
    { name: 'Team A', value: 24.9, color: '#1d4ed8' },
    { name: 'Team B', value: 31.1, color: '#3b82f6' },
    { name: 'Team C', value: 7.3, color: '#60a5fa' },
    { name: 'Team D', value: 24.3, color: '#93c5fd' },
    { name: 'Team E', value: 12.4, color: '#bfdbfe' },
];

const topProductsMock = [
    { name: 'Maneki Neko Poster', sold: 1249, change: '+15.2%', positive: true, color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300', imageUrl: null },
    { name: 'Echoes Necklace', sold: 1145, change: '+13.9%', positive: true, color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300', imageUrl: null },
    { name: 'Spiky Ring', sold: 1073, change: '+9.5%', positive: true, color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300', imageUrl: null },
    { name: 'Pastel Petals Poster', sold: 1022, change: '+2.3%', positive: true, color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300', imageUrl: null },
    { name: 'Il Limone', sold: 992, change: '-0.7%', positive: false, color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300', imageUrl: null },
];

function StoreDropdown({ stores, selectedId, onSelect }) {
    const [isOpen, setIsOpen] = useStateAlias(false);
    const ref = useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selected = stores.find(s => s.id === selectedId) || stores[0];

    return (
        <div ref={ref} className="relative min-w-[200px]">
            <button
                onClick={() => setIsOpen(o => !o)}
                className="w-full flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-2 font-bold text-gray-900 dark:text-white outline-none cursor-pointer"
            >
                <span>{selected?.store_name || 'Select Store'}</span>
                <ChevronDown className="ml-3 text-gray-400 flex-shrink-0" size={18} />
            </button>
            {isOpen && (
                <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 overflow-hidden">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Store</p>
                    </div>
                    {stores.map(store => (
                        <button
                            key={store.id}
                            onClick={() => { onSelect(store.id); setIsOpen(false); }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${store.id === selectedId
                                    ? 'bg-gray-50 dark:bg-gray-700/50 font-semibold text-gray-900 dark:text-white'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                }`}
                        >
                            {store.store_name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// Online Store Dashboard component
export default function Dashboard() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [selectedStoreId, setSelectedStoreId] = React.useState(null);

    const { data: dashboardData, isLoading, error, refetch } = useQuery({
        queryKey: ['store-dashboard', user?.id, selectedStoreId],
        queryFn: () => fetchDashboardStats(user?.id, selectedStoreId),
        retry: 1,
        enabled: !!user?.id
    });

    // Fetch products to show real uploaded images for "Top Products"
    // This hook MUST be called unconditionally (Rules of Hooks)
    const { data: productsForImages = [] } = useQuery({
        queryKey: ['store-products-top', user?.id, selectedStoreId],
        queryFn: async () => {
            const res = await api.get('/addons/online-store/admin/products', { accountId: user?.id, storeId: selectedStoreId });
            return res.data?.products || [];
        },
        enabled: !!user?.id && !!selectedStoreId
    });

    React.useEffect(() => {
        // Set initial selected store if available
        if (dashboardData?.storeSettings?.length > 0 && !selectedStoreId) {
            setSelectedStoreId(dashboardData.storeSettings[0].id);
        }
    }, [dashboardData, selectedStoreId]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-gray-500 dark:text-slate-500 font-medium">Loading store dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900/20">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-red-800 dark:text-red-400">Connection Error</h3>
                <p className="text-red-600 dark:text-red-300 mb-6">{error.message || 'Failed to load dashboard data.'}</p>
                <button
                    onClick={() => refetch()}
                    className="inline-flex items-center px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-100 dark:shadow-none"
                >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Try Again
                </button>
            </div>
        );
    }

    const { stats, alerts, recentOrders, storeSettings } = dashboardData;

    // If no stores exist at all, redirect to Stores management or show wizard
    if (!storeSettings || storeSettings.length === 0) {
        return <StoreSetup onComplete={() => queryClient.invalidateQueries(['store-dashboard'])} />;
    }

    const currentStore = storeSettings.find(s => s.id === selectedStoreId) || storeSettings[0];

    const productsWithImages = (productsForImages || []).map(p => {
        let imgSrc = null;
        if (Array.isArray(p.images)) {
            imgSrc = p.images[0];
        } else if (typeof p.images === 'string' && p.images.startsWith('[')) {
            try {
                const parsed = JSON.parse(p.images);
                if (Array.isArray(parsed)) imgSrc = parsed[0];
            } catch (e) { /* ignore */ }
        } else if (typeof p.images === 'string') {
            imgSrc = p.images;
        }
        return {
            name: p.name,
            imageUrl: imgSrc,
            sold: p.sales_count || 0,
            change: '+0%',
            positive: true,
            color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
        };
    }).filter(p => !!p.imageUrl);

    const topProducts = productsWithImages.length > 0 ? productsWithImages.slice(0, 5) : topProductsMock;

    // Use mockup recent orders for styling if none exist, limited to 5
    const displayOrders = (recentOrders?.length > 0 ? recentOrders : [
        { id: 92627, order_number: '#92627', status: 'Paid', created_at: '2022-07-09T00:00:00Z', customer_name: 'Tara Fletcher', total: 279.00 },
        { id: 92509, order_number: '#92509', status: 'Pending', created_at: '2022-06-26T00:00:00Z', customer_name: 'Joyce Freeman', total: 831.00 },
        { id: 91631, order_number: '#91631', status: 'Paid', created_at: '2022-06-18T00:00:00Z', customer_name: 'Brittany Hale', total: 142.00 },
        { id: 90963, order_number: '#90963', status: 'Paid', created_at: '2022-06-11T00:00:00Z', customer_name: 'Luke Cook', total: 232.00 },
        { id: 89332, order_number: '#89332', status: 'Pending', created_at: '2022-06-02T00:00:00Z', customer_name: 'Eileen Horton', total: 597.00 },
        { id: 89107, order_number: '#89107', status: 'Failed', created_at: '2022-04-17T00:00:00Z', customer_name: 'Frederick Adams', total: 72.00 },
        { id: 89021, order_number: '#89021', status: 'Paid', created_at: '2022-04-13T00:00:00Z', customer_name: 'Lee Wheeler', total: 110.00 },
    ]).slice(0, 5);

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Store Dashboard</h2>

                {/* Store Selector */}
                <div className="flex items-center gap-3">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">Managing Store:</p>
                    <StoreDropdown stores={storeSettings} selectedId={selectedStoreId} onSelect={setSelectedStoreId} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {/* Total Revenue */}
                <div className="card p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <DollarSign className="w-6 h-6 text-gray-900 dark:text-white" />
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">+0%</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${parseFloat(stats.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </h3>
                </div>
                {/* Total Orders */}
                <div className="card p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <ShoppingCart className="w-6 h-6 text-gray-900 dark:text-white" />
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">+0%</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Orders</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.orders}</h3>
                </div>
                {/* Total Products */}
                <div className="card p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <Package className="w-6 h-6 text-gray-900 dark:text-white" />
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">+0%</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Products</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.products}</h3>
                </div>
                {/* Shipped Out */}
                <div className="card p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <Truck className="w-6 h-6 text-gray-900 dark:text-white" />
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">+0%</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Shipped Out</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.shippedOut || 0}</h3>
                </div>
                {/* Pending */}
                <div className="card p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <Clock className="w-6 h-6 text-gray-900 dark:text-white" />
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">+0%</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Pending</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending || 0}</h3>
                </div>
                {/* Returns */}
                <div className="card p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <RotateCcw className="w-6 h-6 text-gray-900 dark:text-white" />
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">+0%</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Returns</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.returned || 0}</h3>
                </div>
                {/* Avg Order Value */}
                <div className="card p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <DollarSign className="w-6 h-6 text-gray-900 dark:text-white" />
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">+0%</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Avg Order Value</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${(() => {
                            const orders = parseFloat(stats.orders || 0);
                            const revenue = parseFloat(stats.revenue || 0);
                            const aov = orders > 0 ? revenue / orders : 0;
                            return aov.toFixed(2);
                        })()}
                    </h3>
                </div>
                {/* Paid Orders (Recent) */}
                <div className="card p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <ShoppingCart className="w-6 h-6 text-gray-900 dark:text-white" />
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">+0%</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Paid Orders (Recent)</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {Array.isArray(displayOrders) ? displayOrders.filter(o => (o.status || '').toLowerCase() === 'paid').length : 0}
                    </h3>
                </div>
                {/* Failed/Cancelled (Recent) */}
                <div className="card p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <AlertTriangle className="w-6 h-6 text-gray-900 dark:text-white" />
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">+0%</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Failed/Cancelled (Recent)</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {Array.isArray(displayOrders) ? displayOrders.filter(o => {
                            const s = (o.status || '').toLowerCase();
                            return s === 'failed' || s === 'cancelled';
                        }).length : 0}
                    </h3>
                </div>
                {/* Orders Today (Recent) */}
                <div className="card p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <Clock className="w-6 h-6 text-gray-900 dark:text-white" />
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">+0%</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Orders Today (Recent)</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {Array.isArray(displayOrders) ? displayOrders.filter(o => {
                            const d = new Date(o.created_at);
                            const t = new Date();
                            return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
                        }).length : 0}
                    </h3>
                </div>
            </div>

            {/* Row 1: Sales Overview & Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                {/* Sales Area Chart */}
                <div className="lg:col-span-2 card p-8 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Sales Overview</h3>
                        <div className="relative">
                            <select
                                className="appearance-none pl-4 pr-10 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-white outline-none cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
                                defaultValue="Monthly"
                            >
                                <option>Monthly</option>
                                <option>Weekly</option>
                                <option>Annually</option>
                            </select>
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                                <ChevronDown size={18} />
                            </div>
                        </div>
                    </div>
                    <div className="h-[300px] w-full mt-auto">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSeries1" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorSeries2" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#93c5fd" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#93c5fd" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="series1" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorSeries1)" />
                                <Area type="monotone" dataKey="series2" stroke="#93c5fd" strokeWidth={3} fillOpacity={1} fill="url(#colorSeries2)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Products */}
                <div className="card p-8 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Top product</h3>
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>
                    <div className="space-y-5 flex-grow">
                        {topProducts.map((item, i) => (
                            <div key={i} className="flex justify-between items-center group">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-600 flex-shrink-0 overflow-hidden">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs ring-1 ring-blue-200 dark:ring-blue-800">
                                                    {item.name.charAt(0)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-[15px] group-hover:text-blue-600 transition-colors">{item.name}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold mt-0.5">Sold: {item.sold?.toLocaleString?.() || item.sold}</p>
                                    </div>
                                </div>
                                <div className={`px-3 py-1.5 rounded-xl text-xs font-black tracking-tight ${item.color}`}>
                                    {item.change}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Row 2: Recent Orders & Category Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                {/* Recent Orders Table */}
                <div className="lg:col-span-2 card p-8 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Orders</h3>
                        <Link
                            to="/addon/Online-Store/orders"
                            className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                        >
                            View Orders
                        </Link>
                    </div>
                    <div className="overflow-x-auto flex-grow">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left py-4 border-b border-gray-100 dark:border-gray-700">
                                    <th className="pb-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Order</th>
                                    <th className="pb-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Status</th>
                                    <th className="pb-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Date</th>
                                    <th className="pb-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Customer</th>
                                    <th className="pb-4 text-right text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Amount Spent</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                {displayOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        onClick={() => navigate(`/addon/Online-Store/orders/${order.id}`)}
                                        className="group hover:bg-gray-100/50 dark:hover:bg-gray-700/20 transition-colors cursor-pointer"
                                    >
                                        <td className="py-4 text-sm font-medium text-gray-600 dark:text-gray-400">{order.order_number}</td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${order.status === 'Paid' ? 'bg-blue-700' : order.status === 'Pending' ? 'bg-gray-400' : order.status === 'Failed' ? 'bg-gray-300' : 'bg-gray-400'}`} />
                                                <span className="text-sm font-bold dark:text-white">{order.status}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-sm font-medium text-gray-500 dark:text-gray-500">{new Date(order.created_at).toLocaleDateString('en-GB')}</td>
                                        <td className="py-4 text-sm font-bold text-gray-700 dark:text-gray-300">{order.customer_name}</td>
                                        <td className="py-4 text-right text-sm font-black text-gray-900 dark:text-white">${parseFloat(order.total).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Category Distribution Pie Chart */}
                <div className="card p-8 flex flex-col h-full">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Category Distribution</h3>
                    <div className="flex-grow flex flex-col justify-center items-center">
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={95}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        formatter={(value) => <span className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {alerts && alerts.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 p-6 rounded-3xl mt-6">
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-lg font-bold text-red-800 dark:text-red-400">Low Inventory Alerts</h3>
                            <div className="text-sm text-red-700 dark:text-red-300 font-medium">
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 list-none">
                                    {alerts.map(prod => (
                                        <li key={prod.id} className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                            {prod.name} <span className="font-bold bg-white dark:bg-red-900/20 px-2 py-0.5 rounded-lg text-xs ml-auto">Only {prod.inventory} left</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
