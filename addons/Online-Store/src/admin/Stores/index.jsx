import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import {
    Store,
    Plus,
    MoreHorizontal,
    ExternalLink,
    Settings,
    Trash2,
    Globe,
    Copy,
    Check,
    Loader2,
    Search,
    AlertCircle,
    Edit,
    Eye,
    EyeOff,
    Download,
    BarChart3,
    Package,
    DollarSign,
    Users,
    Filter,
    Grid,
    List,
    Star,
    TrendingUp,
    ChevronDown
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import Notification from '@/components/ui/Notification';
import StoreSetup from '../StoreSetupSimple';
import StoreEditor from './StoreEditor';

function CustomDropdown({ label, value, options, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedLabel = options.find(o => o.value === value)?.label || value;

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setIsOpen(o => !o)}
                className="flex items-center space-x-1 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
                <span>{selectedLabel}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
            {isOpen && (
                <div className="absolute z-50 top-full mt-1 left-0 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 min-w-[160px] py-1 overflow-hidden">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{label}</p>
                    </div>
                    {options.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => { onChange(opt.value); setIsOpen(false); }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${opt.value === value
                                ? 'bg-gray-50 dark:bg-gray-700/50 font-semibold text-gray-900 dark:text-white'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function StoresManager() {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    // Debug: Log user data
    console.log('StoresManager - Current user data:', user);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedStore, setSelectedStore] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');

    const { data: stores, isLoading, error } = useQuery({
        queryKey: ['online-store-list', user?.id],
        queryFn: async () => {
            const response = await api.get(`/addons/online-store/admin/stores?accountId=${user?.id}`);
            return response.data || [];
        },
        enabled: !!user?.id
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/addons/online-store/admin/stores/${id}?accountId=${user?.id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['online-store-list']);
            toast.push(
                <Notification type="success" title="Store Deleted">
                    The storefront has been permanently removed.
                </Notification>
            );
        },
        onError: (err) => {
            toast.push(<Notification type="danger" title="Error" message={err.message} />);
        }
    });

    const toggleStoreMutation = useMutation({
        mutationFn: ({ id, enabled }) => api.put(`/addons/online-store/admin/stores/${id}`, { enabled, accountId: user?.id }),
        onSuccess: () => {
            queryClient.invalidateQueries(['online-store-list']);
            toast.push(
                <Notification type="success" title="Store Updated">
                    Store status has been updated successfully.
                </Notification>
            );
        },
        onError: (err) => {
            toast.push(<Notification type="danger" title="Error" message={err.message} />);
        }
    });

    const duplicateStoreMutation = useMutation({
        mutationFn: (id) => api.post(`/addons/online-store/admin/stores/${id}/duplicate`, { accountId: user?.id }),
        onSuccess: () => {
            queryClient.invalidateQueries(['online-store-list']);
            toast.push(
                <Notification type="success" title="Store Duplicated">
                    Store has been duplicated successfully.
                </Notification>
            );
        },
        onError: (err) => {
            toast.push(<Notification type="danger" title="Error" message={err.message} />);
        }
    });

    const copyToClipboard = (slug) => {
        const url = `${window.location.origin}/s/${slug}`;
        navigator.clipboard.writeText(url);
        toast.push(
            <Notification type="success" title="Link Copied">
                Store link copied to clipboard!
            </Notification>
        );
    };

    const filteredAndSortedStores = stores?.filter(store => {
        const matchesSearch = store.store_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            store.store_slug?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'enabled' && store.enabled) ||
            (filterStatus === 'disabled' && !store.enabled);
        return matchesSearch && matchesStatus;
    })?.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        if (sortBy === 'created_at') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        }

        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    }) || [];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading your stores...</p>
            </div>
        );
    }

    if (isEditModalOpen && selectedStore) {
        return (
            <div className="relative">
                <StoreEditor
                    store={selectedStore}
                    onComplete={() => {
                        setIsEditModalOpen(false);
                        setSelectedStore(null);
                        queryClient.invalidateQueries(['online-store-list']);
                    }}
                />
            </div>
        );
    }

    console.log('Rendering StoresManager, isCreateModalOpen:', isCreateModalOpen);

    if (isCreateModalOpen) {
        console.log('Modal should be opening now...');
        return (
            <div className="relative">
                <button
                    onClick={() => {
                        console.log('Close modal clicked');
                        setIsCreateModalOpen(false);
                    }}
                    className="absolute top-0 right-0 p-4 text-gray-400 hover:text-gray-600 z-10"
                >
                    <Plus className="rotate-45" size={32} />
                </button>
                <StoreSetup onComplete={() => {
                    console.log('StoreSetup completed');
                    setIsCreateModalOpen(false);
                    queryClient.invalidateQueries(['online-store-list']);
                }} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Store Management</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Create, manage, and monitor all your online storefronts.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-2xl p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
                        >
                            <Grid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                    <button
                        onClick={() => {
                            console.log('Create New Store button clicked!');
                            console.log('Current modal state:', isCreateModalOpen);
                            setIsCreateModalOpen(true);
                            console.log('Modal state set to true');
                        }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                    >
                        <Plus size={20} strokeWidth={3} />
                        Create
                    </button>
                </div>
            </div>

            {/* Enhanced Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="card p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <Store className="w-6 h-6 text-gray-900 dark:text-white" />
                        <TrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Stores</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stores?.length || 0}</h3>
                </div>

                <div className="card p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <Eye className="w-6 h-6 text-gray-900 dark:text-white" />
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">+12%</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Active Stores</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stores?.filter(s => s.enabled).length || 0}
                    </h3>
                </div>

                <div className="card p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <Package className="w-6 h-6 text-gray-900 dark:text-white" />
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">+8%</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Products</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">--</h3>
                </div>

                <div className="card p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <DollarSign className="w-6 h-6 text-gray-900 dark:text-white" />
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">+24%</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Revenue</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">$--</h3>
                </div>

                <div className="card p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <Users className="w-6 h-6 text-gray-900 dark:text-white" />
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">+18%</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Orders</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">--</h3>
                </div>
            </div>

            {/* All Stores Header with Search & Filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">All stores</h2>
                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none w-full md:w-64 transition-all"
                        />
                    </div>
                    {/* Status Filter */}
                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 pr-8 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All</option>
                            <option value="enabled">Active</option>
                            <option value="disabled">Inactive</option>
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    {/* Sort */}
                    <div className="relative">
                        <select
                            value={`${sortBy}-${sortOrder}`}
                            onChange={(e) => {
                                const [sort, order] = e.target.value.split('-');
                                setSortBy(sort);
                                setSortOrder(order);
                            }}
                            className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 pr-8 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="created_at-desc">Newest</option>
                            <option value="created_at-asc">Oldest</option>
                            <option value="store_name-asc">A-Z</option>
                            <option value="store_name-desc">Z-A</option>
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Store Grid/List */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredAndSortedStores.map((store) => (
                        <div key={store.id} className="card p-6 flex-grow flex flex-col hover:scale-[1.01] active:scale-[1.0] transition-all duration-300">
                            <div className="flex-grow">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-gray-900 dark:text-white">
                                            <Store size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{store.store_name}</h3>
                                            <div className="flex items-center gap-2 text-gray-400 font-bold text-xs mt-1">
                                                <Globe size={14} />
                                                <span>/s/{store.store_slug}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => copyToClipboard(store.store_slug)}
                                            className="p-2 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-90"
                                            title="Copy Store Link"
                                        >
                                            <Copy size={18} />
                                        </button>
                                        <a
                                            href={`/s/${store.store_slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-90"
                                            title="Visit Store"
                                        >
                                            <ExternalLink size={18} />
                                        </a>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Currency</p>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">{store.currency || 'USD'}</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Status</p>
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-2 h-2 rounded-full ${store.enabled ? 'bg-primary-500' : 'bg-gray-400'}`} />
                                            <p className="font-bold text-gray-900 dark:text-white text-xs">{store.enabled ? 'Live' : 'Hidden'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs text-gray-400">
                                    <span>Created {new Date(store.created_at).toLocaleDateString()}</span>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => {
                                                setSelectedStore(store);
                                                setIsEditModalOpen(true);
                                            }}
                                            className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
                                        >
                                            <Edit size={14} />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => toggleStoreMutation.mutate({ id: store.id, enabled: !store.enabled })}
                                            className="flex items-center gap-1 text-gray-400 hover:text-gray-600 font-medium"
                                        >
                                            {store.enabled ? <EyeOff size={14} /> : <Eye size={14} />}
                                            {store.enabled ? 'Disable' : 'Enable'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
                                <button
                                    onClick={() => window.location.href = `/addon/Online-Store/dashboard?storeId=${store.id}`}
                                    className="flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 border border-primary-500 dark:border-primary-400 transition-all active:scale-95"
                                >
                                    Manage Store
                                </button>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => duplicateStoreMutation.mutate(store.id)}
                                        className="p-2 rounded-xl bg-white dark:bg-gray-800 text-gray-400 hover:text-purple-600 border border-gray-100 dark:border-gray-700 shadow-sm transition-all active:scale-90"
                                        title="Duplicate Store"
                                    >
                                        <Copy size={16} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (window.confirm('Delete this store? This will NOT delete products but will unpublish the storefront.')) {
                                                deleteMutation.mutate(store.id);
                                            }
                                        }}
                                        className="p-2 rounded-xl bg-white dark:bg-gray-800 text-gray-300 hover:text-red-500 border border-gray-100 dark:border-gray-700 shadow-sm transition-all active:scale-90"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto px-4 pb-4">
                        <table className="w-full border-separate border-spacing-y-3 border-spacing-x-0">
                            <thead className="dark:border-gray-800">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-400">Store</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-400 text-center">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-400 text-center">Currency</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-400 text-center">Created</th>
                                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            {filteredAndSortedStores.map((store) => (
                                <tr
                                    key={store.id}
                                    className="group hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-all duration-300 cursor-pointer"
                                    onClick={() => window.location.href = `/addon/Online-Store/dashboard?storeId=${store.id}`}
                                >
                                    <td className="px-6 py-4 bg-white dark:bg-gray-800 first:rounded-l-2xl border-y border-l border-transparent group-hover:border-blue-400 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
                                                style={{ backgroundColor: store.theme_color || '#2563eb' }}
                                            >
                                                <Store size={20} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 dark:text-white">{store.store_name}</div>
                                                <div className="text-xs text-gray-400">/s/{store.store_slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 bg-white dark:bg-gray-800 border-y border-transparent group-hover:border-blue-400 transition-all text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${store.enabled ? 'bg-primary-500' : 'bg-gray-400'}`} />
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {store.enabled ? 'Live' : 'Hidden'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 bg-white dark:bg-gray-800 border-y border-transparent group-hover:border-blue-400 transition-all text-center text-sm font-medium text-gray-900 dark:text-white">
                                        {store.currency || 'USD'}
                                    </td>
                                    <td className="px-6 py-4 bg-white dark:bg-gray-800 border-y border-transparent group-hover:border-blue-400 transition-all text-center text-sm text-gray-400">
                                        {new Date(store.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 bg-white dark:bg-gray-800 last:rounded-r-2xl border-y border-r border-transparent group-hover:border-blue-400 transition-all">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => copyToClipboard(store.store_slug)}
                                                className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-400 hover:text-blue-600 transition-all"
                                                title="Copy Link"
                                            >
                                                <Copy size={14} />
                                            </button>
                                            <a
                                                href={`/s/${store.store_slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-400 hover:text-blue-600 transition-all"
                                                title="Visit Store"
                                            >
                                                <ExternalLink size={14} />
                                            </a>
                                            <button
                                                onClick={() => {
                                                    setSelectedStore(store);
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-400 hover:text-blue-600 transition-all"
                                                title="Edit Store"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                onClick={() => toggleStoreMutation.mutate({ id: store.id, enabled: !store.enabled })}
                                                className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-400 hover:text-amber-600 transition-all"
                                                title={store.enabled ? 'Disable Store' : 'Enable Store'}
                                            >
                                                {store.enabled ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Delete this store? This will NOT delete products but will unpublish the storefront.')) {
                                                        deleteMutation.mutate(store.id);
                                                    }
                                                }}
                                                className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-400 hover:text-red-500 transition-all"
                                                title="Delete Store"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </table>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {
                filteredAndSortedStores.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-20 bg-gray-50/50 dark:bg-gray-900/30 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <div className="w-20 h-20 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-300 mb-6 shadow-sm">
                            <Store size={40} />
                        </div>
                        <h3 className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white mb-2">No Stores Found</h3>
                        <p className="text-gray-500 font-medium mb-8">
                            {searchTerm || filterStatus !== 'all'
                                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                                : 'Ready to expand? Create your first or next storefront now.'
                            }
                        </p>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-10 py-4 rounded-3xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl dark:shadow-none"
                        >
                            Get Started
                        </button>
                    </div>
                )
            }
        </div>
    );
}
