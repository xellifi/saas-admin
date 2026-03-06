import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

export default function StoreSetupSimple({ onComplete }) {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    
    // Debug: Log user data to see what we're working with
    console.log('Current user data:', user);
    
    const [formData, setFormData] = useState({
        store_name: '',
        store_slug: '',
        currency: 'USD'
    });

    const createMutation = useMutation({
        mutationFn: (data) => {
            // Use user.id if available, otherwise fallback to 1 for testing
            const accountId = user?.id || 1;
            console.log('Creating store with accountId:', accountId, 'user:', user);
            return api.post('/addons/online-store/admin/stores', { ...data, accountId, enabled: true });
        },
        onSuccess: (response) => {
            console.log('Store created successfully:', response);
            queryClient.invalidateQueries(['online-store-list']);
            if (onComplete) onComplete();
        },
        onError: (error) => {
            console.error('Failed to create store:', error);
            alert('Failed to create store: ' + (error.message || 'Unknown error'));
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Submitting store data:', formData);
        createMutation.mutate(formData);
    };

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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4">Create New Store</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Store Name</label>
                        <input
                            type="text"
                            value={formData.store_name}
                            onChange={(e) => handleInputChange('store_name', e.target.value)}
                            placeholder="e.g. My Awesome Store"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Store URL</label>
                        <input
                            type="text"
                            value={formData.store_slug}
                            onChange={(e) => handleInputChange('store_slug', e.target.value)}
                            placeholder="my-awesome-store"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Currency</label>
                        <select
                            value={formData.currency}
                            onChange={(e) => handleInputChange('currency', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="PHP">PHP (₱)</option>
                        </select>
                    </div>
                    <div className="flex gap-4 mt-6">
                        <button
                            type="submit"
                            disabled={createMutation.isLoading}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {createMutation.isLoading ? 'Creating...' : 'Create Store'}
                        </button>
                        <button
                            type="button"
                            onClick={() => onComplete && onComplete()}
                            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
