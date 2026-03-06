import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Search, Download, ExternalLink, Mail } from 'lucide-react';
const fetchOrders = async () => {
    const { data } = await axios.get('/api/addons/online-store/admin/orders');
    return data.orders || [];
};

export default function Invoices() {
    const [searchTerm, setSearchTerm] = useState('');

    const { data: orders = [], isLoading } = useQuery({
        queryKey: ['store-orders'], // we share the cache with Orders
        queryFn: fetchOrders
    });

    const handleSendEmail = (order) => {
        // Mock email sending
        setTimeout(() => {
            alert(`Invoice sent to ${order.customer_email}`);
        }, 1500);
    };

    const filteredInvoices = orders.filter(o =>
        o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Invoices</h2>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b flex items-center">
                    <div className="relative w-full max-w-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search invoices by order or customer..."
                            className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-500">Loading invoices...</div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice / Order#</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredInvoices.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                            INV-{order.order_number.replace('ORD-', '')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div>{order.customer_name}</div>
                                            <div className="text-xs text-gray-400">{order.customer_email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                            ${parseFloat(order.total).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <div className="flex justify-end space-x-3">
                                                <button onClick={() => handleSendEmail(order)} title="Email Invoice" className="text-gray-400 hover:text-blue-600">
                                                    <Mail className="w-5 h-5" />
                                                </button>
                                                <a href={`/store/${order.account_id}/invoice/${order.id}`} target="_blank" rel="noreferrer" title="Open Public Link" className="text-gray-400 hover:text-green-600">
                                                    <ExternalLink className="w-5 h-5" />
                                                </a>
                                                <a href={`/store/${order.account_id}/invoice/${order.id}`} target="_blank" rel="noreferrer" title="Download PDF" className="text-gray-400 hover:text-indigo-600">
                                                    <Download className="w-5 h-5" />
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredInvoices.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                                            No invoices found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
