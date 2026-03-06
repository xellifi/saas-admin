import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import {
    Search,
    Download,
    Plus,
    Filter,
    ChevronDown,
    Eye,
    Trash2,
    Loader2,
    AlertTriangle,
    RefreshCcw,
    CreditCard,
    Landmark,
    Truck,
    Wallet,
    DollarSign,
    Package,
    XCircle,
    Clock
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import Notification from '@/components/ui/Notification';
import { StatsGrid, StatCard } from '@/components/ui/StatsGrid';

const fetchOrders = async (userId, storeId) => {
    const response = await api.get('/addons/online-store/admin/orders', { accountId: userId, storeId });
    return response.data?.orders || [];
};

const PaymentIcon = ({ method }) => {
    const m = method?.toLowerCase();
    const wrapper = "flex items-center gap-2";
    const iconCircle = "w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center";
    const label = "text-sm font-medium text-gray-900 dark:text-white";
    if (m?.includes('gcash')) {
        return (
            <div className={wrapper}>
                <div className={iconCircle}>
                    <span className="text-[11px] font-black text-white">G</span>
                </div>
                <span className={label}>Gcash</span>
            </div>
        );
    }
    if (m?.includes('maya')) {
        return (
            <div className={wrapper}>
                <div className={iconCircle}>
                    <span className="text-[11px] font-black text-white">M</span>
                </div>
                <span className={label}>Maya</span>
            </div>
        );
    }
    if (m?.includes('cod') || m?.includes('cash on delivery')) {
        return (
            <div className={wrapper}>
                <div className={iconCircle}>
                    <Truck size={14} className="text-white" />
                </div>
                <span className={label}>COD</span>
            </div>
        );
    }
    if (m?.includes('bank') || m?.includes('transfer')) {
        return (
            <div className={wrapper}>
                <div className={iconCircle}>
                    <Landmark size={14} className="text-white" />
                </div>
                <span className={label}>Bank Transfer</span>
            </div>
        );
    }
    return (
        <div className={wrapper}>
            <div className={iconCircle}>
                <CreditCard size={14} className="text-white" />
            </div>
            <span className={label}>{method}</span>
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const s = status?.toLowerCase();
    let styles = "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400";
    if (s === 'paid') {
        styles = "text-blue-600 border border-blue-300 dark:text-blue-400 dark:border-blue-700";
    } else if (s === 'delivered' || s === 'completed') {
        styles = "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    } else if (s === 'pending' || s === 'processing' || s === 'failed') {
        styles = "text-gray-500 border border-gray-300 dark:text-gray-400 dark:border-gray-600";
    } else if (s === 'cancelled') {
        styles = "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    }

    return (
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${styles}`}>
            {status}
        </span>
    );
};

export default function Orders() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedStoreId, setSelectedStoreId] = useState(null);

    const { data: realOrders = [], isLoading, error, refetch } = useQuery({
        queryKey: ['store-orders', user?.id, selectedStoreId],
        queryFn: () => fetchOrders(user?.id, selectedStoreId),
        retry: 1,
        enabled: !!user?.id
    });

    const { data: stores = [] } = useQuery({
        queryKey: ['store-list', user?.id],
        queryFn: async () => {
            const res = await api.get('/addons/online-store/admin/stores', { accountId: user?.id });
            return res.data?.stores || [];
        },
        enabled: !!user?.id
    });

    React.useEffect(() => {
        if (stores.length > 0 && !selectedStoreId) {
            setSelectedStoreId(stores[0].id);
        }
    }, [stores, selectedStoreId]);

    // Mockup data as requested
    const mockupOrders = [
        { id: 95954, order_number: '#95954', created_at: '2022-08-10T10:00:00Z', customer_name: 'Ron Vargas', customer_email: 'ron.v@example.com', status: 'Paid', payment_method: 'Bank', total: 168.00 },
        { id: 95423, order_number: '#95423', created_at: '2022-07-30T10:00:00Z', customer_name: 'Carolyn Hanso', customer_email: 'carolyn@example.com', status: 'Paid', payment_method: 'Gcash', total: 523.00 },
        { id: 92903, order_number: '#92903', created_at: '2022-07-18T10:00:00Z', customer_name: 'Gabriella May', customer_email: 'gabriella@example.com', status: 'Paid', payment_method: 'Maya', total: 81.00 },
        { id: 92627, order_number: '#92627', created_at: '2022-07-09T10:00:00Z', customer_name: 'Tara Fletcher', customer_email: 'tara@example.com', status: 'Paid', payment_method: 'COD', total: 279.00 },
        { id: 92509, order_number: '#92509', created_at: '2022-06-26T10:00:00Z', customer_name: 'Joyce Freeman', customer_email: 'joyce@example.com', status: 'Pending', payment_method: 'Bank', total: 831.00 },
        { id: 91631, order_number: '#91631', created_at: '2022-06-18T10:00:00Z', customer_name: 'Brittany Hale', customer_email: 'brittany@example.com', status: 'Paid', payment_method: 'Gcash', total: 142.00 },
        { id: 90963, order_number: '#90963', created_at: '2022-06-11T10:00:00Z', customer_name: 'Luke Cook', customer_email: 'luke.c@example.com', status: 'Paid', payment_method: 'Maya', total: 232.00 },
        { id: 89332, order_number: '#89332', created_at: '2022-06-02T10:00:00Z', customer_name: 'Eileen Horton', customer_email: 'eileen@example.com', status: 'Pending', payment_method: 'Bank', total: 597.00 },
        { id: 89107, order_number: '#89107', created_at: '2022-04-17T10:00:00Z', customer_name: 'Frederick Adams', customer_email: 'frederick@example.com', status: 'Failed', payment_method: 'Gcash', total: 72.00 },
        { id: 89021, order_number: '#89021', created_at: '2022-04-13T10:00:00Z', customer_name: 'Lee Wheeler', customer_email: 'lee.w@example.com', status: 'Paid', payment_method: 'COD', total: 110.00 },
    ];

    const displayOrders = realOrders.length > 0 ? realOrders : mockupOrders;

    const statusMutation = useMutation({
        mutationFn: ({ id, status }) => api.put(`/addons/online-store/admin/orders/${id}/status`, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries(['store-orders']);
            toast.push(<Notification type="success" title="Order Updated">Order status updated successfully.</Notification>);
        }
    });

    const filteredOrders = displayOrders.filter(o => {
        const matchesSearch = (o.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (o.order_number || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatus === '' || (o.status || '').toLowerCase() === selectedStatus.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    const totalOrders = displayOrders.length;
    const paidOrders = displayOrders.filter(o => (o.status || '').toLowerCase() === 'paid').length;
    const pendingOrders = displayOrders.filter(o => {
        const s = (o.status || '').toLowerCase();
        return s === 'pending' || s === 'processing';
    }).length;
    const totalRevenue = displayOrders.reduce((sum, o) => {
        const t = parseFloat(o.total || 0);
        return sum + (isNaN(t) ? 0 : t);
    }, 0);
    const failedOrders = displayOrders.filter(o => {
        const s = (o.status || '').toLowerCase();
        return s === 'failed' || s === 'cancelled';
    }).length;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-gray-500 dark:text-slate-500 font-bold">Loading your orders...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Orders</h2>
                    {stores.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Current Store:</span>
                            <select
                                value={selectedStoreId || ''}
                                onChange={(e) => setSelectedStoreId(parseInt(e.target.value))}
                                className="bg-transparent border-none p-0 pr-6 text-xs font-bold text-gray-600 dark:text-gray-300 focus:ring-0 cursor-pointer appearance-none"
                            >
                                {stores.map(s => (
                                    <option key={s.id} value={s.id}>{s.name || s.store_name}</option>
                                ))}
                            </select>
                            <ChevronDown size={12} className="text-gray-400 -ml-5 pointer-events-none" />
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all border border-gray-200 dark:border-gray-700">
                        <Download size={18} />
                        Download
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-100 dark:shadow-none">
                        <Plus size={18} />
                        Add new
                    </button>
                </div>
            </div>

            <StatsGrid cols={{ base: 1, md: 3, lg: 5 }}>
                <StatCard title="Total Orders" value={totalOrders} icon={<Package className="w-6 h-6" />} meta="+0%" />
                <StatCard title="Paid Orders" value={paidOrders} icon={<CreditCard className="w-6 h-6" />} meta="+0%" />
                <StatCard title="Pending" value={pendingOrders} icon={<Clock className="w-6 h-6" />} meta="+0%" />
                <StatCard title="Revenue" value={`$${totalRevenue.toFixed(2)}`} icon={<DollarSign className="w-6 h-6" />} meta="+0%" />
                <StatCard title="Failed/Cancelled" value={failedOrders} icon={<XCircle className="w-6 h-6" />} meta="0%" />
            </StatsGrid>

            {/* All Orders Header with Search & Filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">All orders</h2>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none w-full md:w-64 transition-all"
                        />
                    </div>
                    {/* Status Filter */}
                    <div className="relative">
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 pr-8 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">All</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="failed">Failed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className="card px-8 pt-2 pb-8">
                <div className="overflow-x-auto scrollbar-hide px-4 pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <table className="min-w-full border-separate border-spacing-y-3 border-spacing-x-0">
                        <thead>
                            <tr className="dark:border-gray-800">
                                <th className="px-4 py-4 text-center text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest min-w-[100px]">
                                    <div className="flex items-center justify-center gap-1 cursor-pointer hover:text-gray-600 transition-colors">
                                        ORDER <ChevronDown size={14} />
                                    </div>
                                </th>
                                <th className="px-4 py-4 text-left text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                                    <div className="flex items-center gap-1 cursor-pointer hover:text-gray-600 transition-colors">
                                        DATE <ChevronDown size={14} />
                                    </div>
                                </th>
                                <th className="px-4 py-4 text-left text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                                    <div className="flex items-center gap-1 cursor-pointer hover:text-gray-600 transition-colors">
                                        CUSTOMER <ChevronDown size={14} />
                                    </div>
                                </th>
                                <th className="px-4 py-4 text-left text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                                    <div className="flex items-center gap-1 cursor-pointer hover:text-gray-600 transition-colors">
                                        STATUS <ChevronDown size={14} />
                                    </div>
                                </th>
                                <th className="px-4 py-4 text-left text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                                    <div className="flex items-center gap-1 cursor-pointer hover:text-gray-600 transition-colors">
                                        PAYMENT METHOD <ChevronDown size={14} />
                                    </div>
                                </th>
                                <th className="px-4 py-4 text-left text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                                    <div className="flex items-center gap-1 cursor-pointer hover:text-gray-600 transition-colors">
                                        TOTAL <ChevronDown size={14} />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                    ACTIONS
                                </th>
                            </tr>
                        </thead>
                        <tbody className="">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-20 text-gray-400 italic">No orders found.</td>
                                </tr>
                            ) : filteredOrders.map((order) => (
                                <tr
                                    key={order.id}
                                    className="group bg-white dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-all duration-300 cursor-pointer"
                                    onClick={(e) => {
                                        if (e.target.closest('button') || e.target.closest('a')) return;
                                        navigate(`/addon/Online-Store/orders/${order.id}`);
                                    }}
                                >
                                    <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white rounded-l-2xl border-y border-l border-gray-100 dark:border-gray-700/50 group-hover:border-blue-400 dark:group-hover:border-blue-500 text-center">
                                        {order.order_number}
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-medium border-y border-gray-100 dark:border-gray-700/50 group-hover:border-blue-400 dark:group-hover:border-blue-500">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap border-y border-gray-100 dark:border-gray-700/50 group-hover:border-blue-400 dark:group-hover:border-blue-500">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center text-gray-900 dark:text-gray-200 font-bold text-xs border border-gray-200 dark:border-gray-600">
                                                {(order.customer_name || 'U').charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{order.customer_name}</p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{order.customer_email || 'no-email@example.com'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap border-y border-gray-100 dark:border-gray-700/50 group-hover:border-blue-400 dark:group-hover:border-blue-500">
                                        <StatusBadge status={order.status} />
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap border-y border-gray-100 dark:border-gray-700/50 group-hover:border-blue-400 dark:group-hover:border-blue-500">
                                        <PaymentIcon method={order.payment_method} />
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-sm font-black text-gray-900 dark:text-white border-y border-gray-100 dark:border-gray-700/50 group-hover:border-blue-400 dark:group-hover:border-blue-500">
                                        ${parseFloat(order.total).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-right rounded-r-2xl border-y border-r border-gray-100 dark:border-gray-700/50 group-hover:border-blue-400 dark:group-hover:border-blue-500">
                                        <div className="flex justify-end gap-3">
                                            <Link
                                                to={`/addon/Online-Store/orders/${order.id}`}
                                                className="p-2.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all"
                                                title="View Order"
                                            >
                                                <Eye size={18} />
                                            </Link>
                                            <button className="p-2.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all" title="Delete Order">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-8 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><ChevronDown size={18} className="rotate-90" /></button>
                        <button className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-sm flex items-center justify-center border border-blue-100 dark:border-blue-800">1</button>
                        <button className="w-8 h-8 rounded-lg text-gray-400 dark:text-gray-500 font-bold text-sm flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">2</button>
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><ChevronDown size={18} className="-rotate-90" /></button>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="px-4 py-2 bg-transparent rounded-xl text-xs font-bold text-gray-500 dark:text-gray-400 border border-transparent dark:border-gray-700 flex items-center gap-4 cursor-pointer">
                            10 / page
                            <ChevronDown size={14} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
