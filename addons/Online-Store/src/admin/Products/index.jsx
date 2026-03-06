import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from '@/components/ui/Toast';
import Notification from '@/components/ui/Notification';
import {
    Plus,
    Pencil,
    Trash2,
    Search,
    Loader2,
    AlertTriangle,
    Download,
    Filter,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Image as ImageIcon, // Keep ImageIcon if used
    Bold,
    Italic,
    Strikethrough,
    Code,
    Quote,
    Type,
    List,
    ListOrdered,
    Link,
    Minus,
    X,
    UploadCloud,
    Tag, // New
    CheckCircle2, // New
    AlertCircle, // New
    Package,
    XCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/stores/auth';
import { StatsGrid, StatCard } from '@/components/ui/StatsGrid';

const fetchProducts = async (userId, storeId) => {
    const response = await api.get('/addons/online-store/admin/products', { accountId: userId, storeId });
    return response.data?.products || [];
};

export default function Products() {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [categorySearch, setCategorySearch] = useState('');
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [tagSearch, setTagSearch] = useState('');
    const [showTagDropdown, setShowTagDropdown] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);
    const fileInputRef = useRef(null);

    const [selectedStoreId, setSelectedStoreId] = useState(null);
    const { register, handleSubmit, reset, setValue, watch } = useForm();
    const currentCategory = watch('category');

    const { data: products = [], isLoading, error } = useQuery({
        queryKey: ['store-products', user?.id, selectedStoreId],
        queryFn: () => fetchProducts(user?.id, selectedStoreId),
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

    useEffect(() => {
        if (stores.length > 0 && !selectedStoreId) {
            setSelectedStoreId(stores[0].id);
        }
    }, [stores, selectedStoreId]);

    const { data: categories = [] } = useQuery({
        queryKey: ['store-categories', user?.id],
        queryFn: async () => {
            const res = await api.get('/addons/online-store/admin/products/categories', { accountId: user?.id });
            return res.data?.categories || [];
        },
        enabled: !!user?.id
    });

    const { data: availableTags = [] } = useQuery({
        queryKey: ['store-tags', user?.id],
        queryFn: async () => {
            const res = await api.get('/addons/online-store/admin/products/tags', { accountId: user?.id });
            return res.data?.tags || [];
        },
        enabled: !!user?.id
    });

    const createMutation = useMutation({
        mutationFn: (newProduct) => api.post('/addons/online-store/admin/products', newProduct),
        onSuccess: () => {
            queryClient.invalidateQueries(['store-products']);
            queryClient.invalidateQueries(['store-categories']);
            queryClient.invalidateQueries(['store-tags']);
            toast.push(<Notification title="Success" type="success">Product created successfully!</Notification>);
            handleCloseModal();
        },
        onError: (err) => {
            toast.push(<Notification title="Error" type="danger">Failed to create product: {err.message}</Notification>);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, ...data }) => api.put(`/addons/online-store/admin/products/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['store-products']);
            queryClient.invalidateQueries(['store-categories']);
            queryClient.invalidateQueries(['store-tags']);
            toast.push(<Notification title="Success" type="success">Product updated successfully!</Notification>);
            handleCloseModal();
        },
        onError: (err) => {
            toast.push(<Notification title="Error" type="danger">Failed to update product: {err.message}</Notification>);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/addons/online-store/admin/products/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['store-products']);
        }
    });

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setValue('name', product.name);
            setValue('productCode', product.product_code);
            setValue('description', product.description);
            setValue('price', product.price);
            setValue('costPrice', product.cost_price);
            setValue('bulkDiscountPrice', product.bulk_discount_price);
            setValue('taxRate', product.tax_rate);
            setValue('inventory', product.inventory);
            setValue('status', product.status);
            setValue('category', product.category);
            setValue('brand', product.brand);
            setCategorySearch(product.category || '');
            const productTags = Array.isArray(product.tags) ? product.tags : [];
            const allTagsForProduct = product.category ? [...productTags, product.category] : productTags;
            setSelectedTags(allTagsForProduct);

            // Handle images
            let imgs = [];
            if (typeof product.images === 'string') {
                try { imgs = JSON.parse(product.images); } catch (e) { }
            } else if (Array.isArray(product.images)) {
                imgs = product.images;
            }
            setUploadedImages(imgs);
        } else {
            setEditingProduct(null);
            reset();
            setUploadedImages([]);
            setCategorySearch('');
        }
        setShowForm(true);
    };

    const handleCloseModal = () => {
        setShowForm(false);
        reset();
        setEditingProduct(null);
        setUploadedImages([]);
        setCategorySearch('');
        setTagSearch('');
        setSelectedTags([]);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const res = await api.upload('/addons/online-store/admin/products/upload', file);
            if (res.success) {
                setUploadedImages(prev => [...prev.slice(-4), res.url]); // keep last 5
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const onSubmit = (data) => {
        const payload = {
            ...data,
            accountId: user?.id,
            storeId: selectedStoreId,
            images: uploadedImages,
            tags: selectedTags
        };
        if (editingProduct) {
            updateMutation.mutate({ id: editingProduct.id, ...payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const toggleSelectAll = () => {
        if (selectedProducts.length === products.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(products.map(p => p.id));
        }
    };

    const toggleSelect = (id) => {
        setSelectedProducts(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === '' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Helper for sales progress bar
    const getSalesData = (id) => {
        // Mocking sales data based on ID for visual representation
        const baseSales = (id * 123) % 1500;
        const percentage = Math.min((baseSales / 1500) * 100, 100);
        let color = 'bg-green-500';
        if (percentage < 30) color = 'bg-red-500';
        else if (percentage < 60) color = 'bg-orange-500';

        return { sales: baseSales.toLocaleString(), percentage, color };
    };

    if (error) {
        return (
            <div className="p-8 text-center bg-red-50 rounded-xl border border-red-200">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-red-800">Failed to load products</h3>
                <p className="text-red-600 mb-4">{error.message}</p>
                <button onClick={() => window.location.reload()} className="text-red-700 font-semibold underline">Retry</button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {!showForm ? (
                <>
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Products</h1>
                            {stores.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Current Store:</span>
                                    <select
                                        value={selectedStoreId || ''}
                                        onChange={(e) => setSelectedStoreId(parseInt(e.target.value))}
                                        className="bg-transparent border-none p-0 pr-6 text-xs font-bold text-gray-600 focus:ring-0 cursor-pointer appearance-none"
                                    >
                                        {stores.map(s => (
                                            <option key={s.id} value={s.id}>{s.name || s.store_name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={12} className="text-gray-400 -ml-5 pointer-events-none" />
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                                <Download size={18} />
                                Export
                            </button>
                            <button
                                onClick={() => handleOpenModal()}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                <Plus size={18} />
                                Add products
                            </button>
                        </div>
                    </div>

                    <StatsGrid cols={{ base: 1, md: 3, lg: 5 }}>
                        <StatCard title="Total Products" value={products.length} icon={<Package className="w-6 h-6" />} meta="+0%" />
                        <StatCard title="In Stock" value={products.filter(p => (p.inventory || 0) > 0).length} icon={<CheckCircle2 className="w-6 h-6" />} meta="+0%" />
                        <StatCard title="Low Stock" value={products.filter(p => (p.inventory || 0) > 0 && (p.inventory || 0) <= 5).length} icon={<AlertCircle className="w-6 h-6" />} meta="0%" />
                        <StatCard title="Categories" value={(new Set(products.map(p => p.category).filter(Boolean))).size} icon={<Tag className="w-6 h-6" />} meta="+0%" />
                        <StatCard title="Out of Stock" value={products.filter(p => (p.inventory || 0) <= 0).length} icon={<XCircle className="w-6 h-6" />} meta="0%" />
                    </StatsGrid>

                    {/* All Products Header with Search */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">All products</h2>
                        <div className="flex flex-wrap items-center gap-3">
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
                            {/* Category Filter */}
                            <div className="relative">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 pr-8 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">All</option>
                                    {categories.map((cat, i) => (
                                        <option key={i} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Content Card */}
                    <div className="card overflow-hidden">
                        {/* Table */}
                        <div className="overflow-x-auto px-4 pb-4">
                            <table className="w-full text-left border-separate border-spacing-y-3 border-spacing-x-0">
                                <thead>
                                    <tr className="dark:border-gray-800">
                                        <th className="p-4 w-12 text-center">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 dark:border-slate-700 dark:bg-slate-800 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                                                checked={products.length > 0 && selectedProducts.length === products.length}
                                                onChange={toggleSelectAll}
                                            />
                                        </th>
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            <div className="flex items-center gap-1 cursor-pointer hover:text-gray-600 transition-colors">
                                                Product <ChevronDown size={14} className="rotate-180" />
                                            </div>
                                        </th>
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            <div className="flex items-center gap-1 cursor-pointer hover:text-gray-600 transition-colors">
                                                Price <ChevronDown size={14} className="rotate-180" />
                                            </div>
                                        </th>
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            <div className="flex items-center gap-1 cursor-pointer hover:text-gray-600 transition-colors pointer-events-none">
                                                Quantity <ChevronDown size={14} className="rotate-180 opacity-0" />
                                            </div>
                                        </th>
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            <div className="flex items-center gap-1 cursor-pointer hover:text-gray-600 transition-colors">
                                                Sales <ChevronDown size={14} className="rotate-180" />
                                            </div>
                                        </th>
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {isLoading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td className="p-4"><div className="w-4 h-4 bg-gray-100 rounded mx-auto" /></td>
                                                <td className="p-4 flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-xl" />
                                                    <div className="space-y-2">
                                                        <div className="w-32 h-4 bg-gray-100 rounded" />
                                                        <div className="w-20 h-3 bg-gray-50 rounded" />
                                                    </div>
                                                </td>
                                                <td className="p-4"><div className="w-16 h-4 bg-gray-100 rounded" /></td>
                                                <td className="p-4"><div className="w-10 h-4 bg-gray-100 rounded" /></td>
                                                <td className="p-4"><div className="w-32 h-2 bg-gray-100 rounded-full" /></td>
                                                <td className="p-4"><div className="w-16 h-8 bg-gray-100 rounded-lg" /></td>
                                            </tr>
                                        ))
                                    ) : filteredProducts.length > 0 ? (
                                        filteredProducts.map((product) => {
                                            const sales = product.sales_count || 0;
                                            const percentage = Math.min((sales / 100) * 100, 100); // Using 100 as a base for visualization
                                            const color = sales > 50 ? 'bg-green-500' : sales > 10 ? 'bg-orange-500' : 'bg-blue-500';
                                            return (
                                                <tr
                                                    key={product.id}
                                                    className={`group hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-all duration-300 cursor-pointer ${selectedProducts.includes(product.id) ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}
                                                    onClick={() => navigate(`/addon/Online-Store/products/${product.id}`)}
                                                >
                                                    <td className="p-4 text-center rounded-l-2xl border-y border-l border-gray-100 dark:border-gray-700/50 group-hover:border-blue-400 dark:group-hover:border-blue-500">
                                                        <input
                                                            type="checkbox"
                                                            className="rounded border-gray-300 dark:border-slate-700 dark:bg-slate-800 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                                                            checked={selectedProducts.includes(product.id)}
                                                            onChange={() => toggleSelect(product.id)}
                                                        />
                                                    </td>
                                                    <td className="p-4 border-y border-gray-100 dark:border-gray-700/50 group-hover:border-blue-400 dark:group-hover:border-blue-500">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-14 h-14 bg-gray-100 dark:bg-slate-800 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-slate-700 shadow-sm">
                                                                {(() => {
                                                                    let imgSrc = null;
                                                                    if (Array.isArray(product.images)) {
                                                                        imgSrc = product.images[0];
                                                                    } else if (typeof product.images === 'string' && product.images.startsWith('[')) {
                                                                        try {
                                                                            const parsed = JSON.parse(product.images);
                                                                            if (Array.isArray(parsed)) imgSrc = parsed[0];
                                                                        } catch (e) { }
                                                                    } else if (typeof product.images === 'string') {
                                                                        imgSrc = product.images;
                                                                    }

                                                                    if (imgSrc) {
                                                                        return <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" />;
                                                                    }
                                                                    return <ImageIcon className="w-6 h-6 text-gray-300 dark:text-slate-600" />;
                                                                })()}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-gray-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">{product.name}</div>
                                                                <div className="text-xs font-semibold text-gray-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider">ID: 098{product.id}NT</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 border-y border-gray-100 dark:border-gray-700/50 group-hover:border-blue-400 dark:group-hover:border-blue-500">
                                                        <div className="font-bold text-gray-900 dark:text-slate-100 text-sm whitespace-nowrap">${parseFloat(product.price).toFixed(2)}</div>
                                                    </td>
                                                    <td className="p-4 border-y border-gray-100 dark:border-gray-700/50 group-hover:border-blue-400 dark:group-hover:border-blue-500">
                                                        <div className="font-bold text-gray-900 dark:text-slate-100 text-sm">{product.inventory}</div>
                                                    </td>
                                                    <td className="p-4 min-w-[180px] border-y border-gray-100 dark:border-gray-700/50 group-hover:border-blue-400 dark:group-hover:border-blue-500">
                                                        <div className="space-y-2">
                                                            <div className="text-xs font-bold text-gray-500 flex justify-between">
                                                                <span>{sales.toLocaleString()} Sales</span>
                                                            </div>
                                                            <div className="w-full h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h - full ${color} rounded - full transition - all duration - 1000`}
                                                                    style={{ width: `${percentage}% ` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right rounded-r-2xl border-y border-r border-gray-100 dark:border-gray-700/50 group-hover:border-blue-400 dark:group-hover:border-blue-500">
                                                        <div className="flex justify-end gap-1 transition-opacity">
                                                            <button
                                                                onClick={() => handleOpenModal(product)}
                                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                                                            >
                                                                <Pencil size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => { if (window.confirm('Delete this product?')) deleteMutation.mutate(product.id) }}
                                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="p-12 text-center text-gray-400 italic">
                                                No products found matches your search.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer / Pagination */}
                        <div className="p-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/50">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                    <button className="p-2 text-gray-400 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white transition-colors"><ChevronLeft size={18} /></button>
                                    <button className="w-8 h-8 flex items-center justify-center text-sm font-bold bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 rounded-lg shadow-sm">1</button>
                                    <button className="w-8 h-8 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-colors rounded-lg">2</button>
                                    <button className="p-2 text-gray-400 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white transition-colors"><ChevronRight size={18} /></button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <select className="appearance-none pl-3 pr-10 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-bold text-gray-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer">
                                        <option>10 / page</option>
                                        <option>20 / page</option>
                                        <option>50 / page</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                                </div>
                            </div>
                        </div>
                    </div>

                </>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Inline Form Header */}
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{editingProduct ? 'Edit product' : 'Create product'}</h3>
                        <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <X size={24} className="text-gray-400 dark:text-slate-500" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
                        {/* Left Column - 2/3 */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <div className="card p-6 space-y-6">
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white">Basic Information</h4>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-500 dark:text-slate-400 mb-2">Product name</label>
                                        <input
                                            {...register('name', { required: true })}
                                            placeholder="Product Name"
                                            className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-slate-500 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-500 dark:text-slate-400 mb-2">Product code</label>
                                        <input
                                            {...register('productCode')}
                                            placeholder="Product Code"
                                            className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-slate-500 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-500 dark:text-slate-400 mb-2">Description</label>
                                        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-1 p-3 border-b border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
                                                <button type="button" className="p-1.5 text-gray-500 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"><Bold size={18} /></button>
                                                <button type="button" className="p-1.5 text-gray-500 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"><Italic size={18} /></button>
                                                <button type="button" className="p-1.5 text-gray-500 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"><Strikethrough size={18} /></button>
                                                <div className="w-px h-4 bg-gray-200 dark:bg-slate-700 mx-1" />
                                                <button type="button" className="p-1.5 text-gray-500 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"><Code size={18} /></button>
                                                <button type="button" className="p-1.5 text-gray-500 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"><Quote size={18} /></button>
                                                <button type="button" className="p-1.5 text-gray-500 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"><Type size={18} /></button>
                                                <div className="w-px h-4 bg-gray-200 dark:bg-slate-700 mx-1" />
                                                <button type="button" className="p-1.5 text-gray-500 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"><List size={18} /></button>
                                                <button type="button" className="p-1.5 text-gray-500 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"><ListOrdered size={18} /></button>
                                                <div className="w-px h-4 bg-gray-200 dark:bg-slate-700 mx-1" />
                                                <button type="button" className="p-1.5 text-gray-500 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"><Link size={18} /></button>
                                                <button type="button" className="p-1.5 text-gray-500 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">(--)</button>
                                                <button type="button" className="p-1.5 text-gray-500 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"><Minus size={18} /></button>
                                            </div>
                                            <textarea
                                                {...register('description')}
                                                rows={6}
                                                className="w-full px-5 py-4 bg-transparent border-none focus:ring-0 outline-none transition-all resize-none dark:text-slate-100"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="card p-6 space-y-6">
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white">Pricing</h4>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-500 dark:text-slate-400 mb-2">Price</label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                {...register('price', { valueAsNumber: true })}
                                                placeholder="0.00"
                                                className="w-full pl-9 pr-5 py-3.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-slate-500 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-500 dark:text-slate-400 mb-2">Cost price</label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                {...register('costPrice', { valueAsNumber: true })}
                                                placeholder="0.00"
                                                className="w-full pl-9 pr-5 py-3.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-slate-500 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-500 dark:text-slate-400 mb-2">Bulk discount price</label>
                                            <div className="relative">
                                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    {...register('bulkDiscountPrice', { valueAsNumber: true })}
                                                    placeholder="0.00"
                                                    className="w-full pl-9 pr-5 py-3.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-slate-500 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-500 dark:text-slate-400 mb-2">Tax rate(%)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                {...register('taxRate', { valueAsNumber: true })}
                                                placeholder="0"
                                                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-slate-500 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-500 dark:text-slate-400 mb-2">Quantity (Inventory)</label>
                                        <input
                                            type="number"
                                            {...register('inventory', { valueAsNumber: true })}
                                            placeholder="0"
                                            className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-slate-500 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - 1/3 */}
                        <div className="space-y-6">
                            {/* Product Image */}
                            <div className="card p-6 space-y-4">
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white">Product Image</h4>
                                <p className="text-gray-400 dark:text-slate-500 text-[13px] leading-relaxed">Choose a product photo or simply drag and drop up to 5 photos here.</p>

                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-3 hover:border-blue-200 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all cursor-pointer group relative overflow-hidden"
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />

                                    {isUploading ? (
                                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                                    ) : uploadedImages.length > 0 ? (
                                        <div className="flex flex-wrap gap-2 justify-center">
                                            {uploadedImages.map((src, i) => (
                                                <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 shadow-sm group/img">
                                                    <img src={src} className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); setUploadedImages(prev => prev.filter((_, idx) => idx !== i)) }}
                                                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                                                    >
                                                        <X className="text-white w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            {uploadedImages.length < 5 && (
                                                <div className="w-16 h-16 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-300">
                                                    <Plus size={20} />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-gray-400 dark:text-slate-500 group-hover:text-blue-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-all">
                                                <UploadCloud size={32} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-semibold text-gray-600 dark:text-slate-400">Drop your image here, or</p>
                                                <p className="text-sm font-bold text-blue-600 dark:text-blue-400">Click to browse</p>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <p className="text-[11px] text-gray-300 dark:text-slate-600 leading-relaxed font-medium">Image formats: .jpg, .jpeg, .png, preferred size: 1:1, file size is restricted to a maximum of 500kb.</p>
                            </div>

                            {/* Attribute */}
                            <div className="card p-6 space-y-6">
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white">Attribute</h4>

                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-500 dark:text-slate-400 mb-2">Category</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={categorySearch}
                                                onChange={(e) => {
                                                    setCategorySearch(e.target.value);
                                                    setValue('category', e.target.value);
                                                    setShowCategoryDropdown(true);
                                                }}
                                                onFocus={() => setShowCategoryDropdown(true)}
                                                placeholder="Type or select category..."
                                                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 dark:text-white font-medium placeholder:text-gray-300 dark:placeholder:text-slate-500"
                                            />
                                            <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />

                                            {showCategoryDropdown && (
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 max-h-48 overflow-y-auto">
                                                    <div className="p-2 space-y-1">
                                                        {categories.length > 0 ? (
                                                            categories.filter(c => c?.toLowerCase().includes(categorySearch.toLowerCase())).map((cat, i) => (
                                                                <button
                                                                    key={i}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setCategorySearch(cat);
                                                                        setValue('category', cat);
                                                                        setShowCategoryDropdown(false);
                                                                    }}
                                                                    className="w-full text-left px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-300 rounded-xl transition-colors font-medium text-gray-700 dark:text-slate-300 text-sm"
                                                                >
                                                                    {cat}
                                                                </button>
                                                            ))
                                                        ) : (
                                                            <div className="px-4 py-3 text-xs text-gray-400 dark:text-slate-500 italic">No existing categories found</div>
                                                        )}
                                                        {categorySearch && !categories.includes(categorySearch) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowCategoryDropdown(false)}
                                                                className="w-full text-left px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-300 rounded-xl transition-colors font-bold text-blue-500 text-sm border-t border-gray-100 dark:border-slate-700 mt-1"
                                                            >
                                                                + Add "{categorySearch}"
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {/* Click away handler for dropdown */}
                                        {showCategoryDropdown && (
                                            <div className="fixed inset-0 z-40" onClick={() => setShowCategoryDropdown(false)} />
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-500 dark:text-slate-400 mb-2">Tags</label>
                                        <div className="relative">
                                            <div className="w-full px-5 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-blue-500 outline-none transition-all">
                                                {selectedTags.map((tag, i) => (
                                                    <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-bold">
                                                        {tag}
                                                        <button type="button" onClick={() => setSelectedTags(prev => prev.filter((_, idx) => idx !== i))}>
                                                            <X size={12} />
                                                        </button>
                                                    </span>
                                                ))}
                                                <input
                                                    type="text"
                                                    value={tagSearch}
                                                    onChange={(e) => {
                                                        setTagSearch(e.target.value);
                                                        setShowTagDropdown(true);
                                                    }}
                                                    onFocus={() => setShowTagDropdown(true)}
                                                    placeholder={selectedTags.length === 0 ? "Type to add tags..." : ""}
                                                    className="bg-transparent outline-none flex-1 min-w-[120px] text-gray-900 dark:text-white font-medium placeholder:text-gray-300 dark:placeholder:text-slate-500 text-sm"
                                                />
                                            </div>

                                            {showTagDropdown && (
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 max-h-48 overflow-y-auto">
                                                    <div className="p-2 space-y-1">
                                                        {([...new Set([...availableTags, ...categories])]).filter(t => t?.toLowerCase().includes(tagSearch.toLowerCase()) && !selectedTags.includes(t)).map((tag, i) => (
                                                            <button
                                                                key={i}
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedTags(prev => [...prev, tag]);
                                                                    setTagSearch('');
                                                                    setShowTagDropdown(false);
                                                                }}
                                                                className="w-full text-left px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-300 rounded-xl transition-colors font-medium text-gray-700 dark:text-slate-300 text-sm"
                                                            >
                                                                {tag}
                                                            </button>
                                                        ))
                                                        }
                                                        {tagSearch && !selectedTags.includes(tagSearch) && !availableTags.includes(tagSearch) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedTags(prev => [...prev, tagSearch]);
                                                                    setTagSearch('');
                                                                    setShowTagDropdown(false);
                                                                }}
                                                                className="w-full text-left px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-300 rounded-xl transition-colors font-bold text-blue-500 text-sm border-t border-gray-100 dark:border-slate-700 mt-1"
                                                            >
                                                                + Add "{tagSearch}"
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {showTagDropdown && (
                                            <div className="fixed inset-0 z-40" onClick={() => setShowTagDropdown(false)} />
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-500 dark:text-slate-400 mb-2">Brand</label>
                                        <input
                                            {...register('brand')}
                                            placeholder="Product brand"
                                            className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-slate-500 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Form Actions - Moved here and made more compact */}
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 font-medium text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 dark:shadow-none disabled:opacity-50"
                                    disabled={createMutation.isLoading || updateMutation.isLoading}
                                >
                                    {editingProduct ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
