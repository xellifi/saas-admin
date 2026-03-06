import React, { useEffect, useState, useMemo, Suspense } from 'react'
import { useLocation } from 'react-router-dom'
import { useAddonsStore } from '@/stores/addons'
import api from '@/lib/api'
import {
    Plus,
    Search,
    Loader2
} from 'lucide-react'

// Preload all possible addon admin components using Vite glob import
// This tells Vite to make these files available for dynamic import
const addonComponents = import.meta.glob('../../../../addons/*/src/admin/**/*.jsx');

const AddonContent: React.FC = () => {
    const location = useLocation()
    const { activeAddons, loading: storeLoading } = useAddonsStore()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any[]>([])

    const decodedPath = decodeURIComponent(location.pathname).replace(/\/$/, '');

    // Find current addon based on path — check both direct and nested manifest
    const addon = activeAddons.find(a => {
        const manifest = a.manifest as any
        const frontend = manifest?.frontend || manifest?.['saas-dashboard']?.frontend
        return frontend?.routes?.some((r: any) => {
            const routePath = r.path?.replace(/\/$/, '');
            return decodedPath.toLowerCase() === routePath?.toLowerCase() ||
                decodedPath.toLowerCase().startsWith(routePath?.toLowerCase() + '/');
        });
    })

    const currentRoute = useMemo(() => {
        if (!addon) return null;
        const manifest = addon.manifest as any
        const frontend = manifest?.frontend || manifest?.['saas-dashboard']?.frontend
        return frontend?.routes?.find((r: any) => {
            const routePath = r.path?.replace(/\/$/, '');
            return decodedPath.toLowerCase() === routePath?.toLowerCase() ||
                decodedPath.toLowerCase().startsWith(routePath?.toLowerCase() + '/');
        })
    }, [addon, decodedPath]);

    // Check if it has a custom component mapped in addon.json
    const DynamicComponent = useMemo(() => {
        if (!addon || !currentRoute || !currentRoute.componentPath) return null;

        // Backend might return folder_name (snake_case) or name.
        // Casing must match the physical folder name for Vite glob matching.
        const folderName = (addon as any).folder_name || (addon as any).folderName || addon.name;
        // The relative path stored in the glob map
        const targetPath = `../../../../addons/${folderName}/src/admin/${currentRoute.componentPath}`;

        const importFn = addonComponents[targetPath];
        if (importFn) {
            return React.lazy(importFn as any);
        }

        console.warn(`Addon component not found for path: ${targetPath}. Check folder name casing: ${folderName}`);
        return null;
    }, [addon, currentRoute]);

    // Legacy fallback logic for fetching data if no custom component exists
    useEffect(() => {
        if (DynamicComponent) {
            setLoading(false);
            return;
        }

        if (addon && currentRoute) {
            const manifest = addon.manifest as any
            const routes = manifest?.routes || manifest?.['saas-dashboard']?.routes || []
            const apiRoute = routes.find((r: any) => {
                const routePath = typeof r === 'string' ? r : r.path
                return routePath?.startsWith('/api/')
            })
            const routePath = typeof apiRoute === 'string' ? apiRoute : apiRoute?.path

            if (routePath) {
                fetchData(routePath)
            } else {
                setLoading(false)
            }
        } else {
            setLoading(false)
        }
    }, [addon, currentRoute, DynamicComponent])

    const fetchData = async (route: string) => {
        try {
            setLoading(true)
            const response = await api.get<any[]>(route)
            if (response.success) {
                setData(response.data || [])
            }
        } catch (error) {
            console.error('Failed to fetch addon data:', error)
        } finally {
            setLoading(false)
        }
    }

    // Show persistent loader while store is fetching (prevents "Addon not found" flash)
    if (storeLoading && activeAddons.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
                <p className="ml-2 text-gray-500 font-medium">Loading addons...</p>
            </div>
        )
    }

    if (!addon) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Addon not found or disabled.</p>
            </div>
        )
    }

    // If a custom React component exists for this route, render it!
    if (DynamicComponent) {
        return (
            <div key={location.pathname}>
                <Suspense fallback={
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="animate-spin text-indigo-600" size={40} />
                    </div>
                }>
                    <DynamicComponent />
                </Suspense>
            </div>
        );
    }

    // Otherwise render the generic table
    return (
        <div className="p-6 space-y-6" key={location.pathname}>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{(addon.manifest as any)?.['saas-dashboard']?.displayName || (addon.manifest as any).displayName || addon.name}</h1>
                    <p className="text-gray-500">{addon.description}</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                    <Plus size={20} />
                    Add New
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="animate-spin text-indigo-600" size={40} />
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 text-sm uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Name / Info</th>
                                    <th className="px-6 py-4">Price / Total</th>
                                    <th className="px-6 py-4">Status / Stock</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {data.length > 0 ? data.map((item: any) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors text-gray-700">
                                        <td className="px-6 py-4 font-medium">#{item.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">{item.name || item.customer_name}</div>
                                            <div className="text-sm text-gray-500 line-clamp-1">{item.description || 'Order details...'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.price ? `$${item.price}` : `$${item.total_amount}`}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.stock > 0 || item.status === 'completed'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {item.status || `${item.stock} in stock`}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-indigo-600 hover:text-indigo-900 font-medium">View</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500 italic">
                                            No data found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AddonContent
