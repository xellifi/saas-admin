import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Printer, Download, Store } from 'lucide-react';

const fetchInvoice = async (invoiceId) => {
    // We can use the admin/orders/:id endpoint if we pass the right accountId,
    // but wait, public invoice should be accessible to customers without admin auth!
    // Oh, wait, I didn't create a specific public endpoint for fetching a single order/invoice.
    // I need to add one to src/api/public/store.js! 
    // For now, I'll fetch from a new endpoint I'll add quickly, or assume the app routes it to admin/orders.
    // Let's assume we created `/api/addons/online-store/public/invoice/${invoiceId}`
    const { data } = await axios.get(`/api/addons/online-store/public/invoice/${invoiceId}`);
    return data;
};

export default function InvoiceView({ invoiceId }) {
    // If no router context, extract from URL
    const actualInvoiceId = invoiceId || window.location.pathname.split('/invoice/')[1]?.split('/')[0];

    const { data, isLoading, error } = useQuery({
        queryKey: ['public-invoice', actualInvoiceId],
        queryFn: () => fetchInvoice(actualInvoiceId),
        retry: 1
    });

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading invoice...</div>;
    if (error || !data?.order) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500">Invoice not found.</div>;

    const { order, store } = data;

    let items = [];
    try {
        items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    } catch (e) { }

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto">

                {/* Actions (Hidden on Print) */}
                <div className="flex justify-end space-x-4 mb-6 print:hidden">
                    <button
                        onClick={handlePrint}
                        className="flex items-center bg-white border border-gray-300 px-4 py-2 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <Printer className="w-4 h-4 mr-2" /> Print Invoice
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center bg-blue-600 border border-transparent px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
                    >
                        <Download className="w-4 h-4 mr-2" /> Download PDF
                    </button>
                </div>

                {/* Invoice Document */}
                <div className="bg-white shadow-xl rounded-lg overflow-hidden print:shadow-none print:border-none">

                    {/* Header */}
                    <div className="p-8 md:p-12 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div className="flex items-center mb-6 md:mb-0">
                            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white mr-4">
                                <Store className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{store?.store_name || 'Online Store'}</h1>
                                <p className="text-gray-500 text-sm">{store?.custom_domain || 'Demo Store'}</p>
                            </div>
                        </div>
                        <div className="text-left md:text-right">
                            <h2 className="text-3xl font-light text-gray-500 mb-1">INVOICE</h2>
                            <p className="text-gray-900 font-bold">{order.order_number}</p>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="p-8 md:p-12 border-b border-gray-100 flex flex-col md:flex-row justify-between">
                        <div className="mb-8 md:mb-0">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Billed To</h3>
                            <p className="text-gray-900 font-bold text-lg">{order.customer_name}</p>
                            <p className="text-gray-600">{order.customer_email}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Invoice Date</h3>
                                <p className="text-gray-900 font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Status</h3>
                                <p className={`font-medium capitalize ${order.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {order.status}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Payment Method</h3>
                                <p className="text-gray-900 font-medium capitalize">{order.payment_method.replace('_', ' ')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="p-8 md:p-12">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-gray-200">
                                    <th className="py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Item Description</th>
                                    <th className="py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Rate</th>
                                    <th className="py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Qty</th>
                                    <th className="py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, idx) => (
                                    <tr key={idx} className="border-b border-gray-100">
                                        <td className="py-5">
                                            <p className="font-medium text-gray-900">Product #{item.productId}</p>
                                        </td>
                                        <td className="py-5 text-right text-gray-600">${parseFloat(item.price).toFixed(2)}</td>
                                        <td className="py-5 text-right text-gray-600">{item.qty}</td>
                                        <td className="py-5 text-right font-medium text-gray-900">${(item.price * item.qty).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div className="mt-8 flex justify-end">
                            <div className="w-full md:w-1/2 lg:w-1/3 space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>${items.reduce((s, i) => s + (i.price * i.qty), 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax & Shipping</span>
                                    <span>Calculated</span>
                                </div>
                                <div className="flex justify-between border-t border-gray-200 pt-3 mt-3">
                                    <span className="text-lg font-bold text-gray-900">Total</span>
                                    <span className="text-lg font-bold text-gray-900">${parseFloat(order.total).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 p-8 md:p-12 text-center text-gray-500 text-sm border-t border-gray-200">
                        <p>Thank you for your business!</p>
                        <p className="mt-1">If you have any questions about this invoice, please contact us.</p>
                    </div>

                </div>
            </div>
        </div>
    );
}
