import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
    ChevronLeft,
    Printer,
    Edit,
    Mail,
    Phone,
    MapPin,
    Clock,
    CheckCircle2,
    Circle,
    Package
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth';

const fetchOrder = async (userId, orderId) => {
    const response = await api.get(`/addons/online-store/admin/orders/${orderId}`, { accountId: userId });
    return response.data?.order;
};

export default function OrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const { data: order, isLoading } = useQuery({
        queryKey: ['store-order', id, user?.id],
        queryFn: () => fetchOrder(user?.id, id),
        enabled: !!user?.id && !!id
    });

    // Mock data based on the image for visual representation
    const mockOrder = {
        order_number: '#95954',
        status: 'Paid',
        fulfillment_status: 'Fulfilled',
        created_at: '2022-03-06T10:00:00Z',
        items: [
            { id: '098359NT', name: 'Snövalla', price: 252.00, quantity: 2, image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?q=80&w=200&h=200&auto=format&fit=crop' },
            { id: '098336NT', name: 'Maneki Neko Poster', price: 389.00, quantity: 1, image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=200&h=200&auto=format&fit=crop' },
            { id: '098368NT', name: 'Ektöra', price: 869.00, quantity: 1, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=200&h=200&auto=format&fit=crop' }
        ],
        subtotal: 1762.00,
        shipping: 15.00,
        tax: 105.72,
        total: 1870.72,
        customer: {
            name: 'Steve Sutton',
            email: 'handsome-obrien@hotmail.com',
            phone: '+1 (541) 754-3010',
            previous_orders: 11,
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&h=100&auto=format&fit=crop'
        },
        shipping_address: '100 Main ST\nPO Box 1022\nSeattle WA 98104\nUnited States of America',
        billing_address: '1527 Pond Reef Rd\nKetchikan\nAlaska 99901\nUnited States of America',
        note: 'If there are any issues or delays with my order, please don\'t hesitate to contact me, I value clear communication and appreciate your attention to detail.',
        activity: [
            { status: 'Parcel has been delivered', recipient: 'Steve Sutton', time: '04:13 PM', date: 'SUNDAY, 06 MARCH', current: true },
            { status: 'Parcel is out for delivery', time: '11:32 AM', date: 'SUNDAY, 06 MARCH' },
            { status: 'Parcel has arrived at delivery station', time: '09:15 AM', date: 'SUNDAY, 06 MARCH' },
            { status: 'Parcel has been picked up by courier', time: '02:43 PM', date: 'SATURDAY, 05 MARCH' },
            { status: 'Seller is preparing to ship your parcel', time: '11:32 AM', date: 'SATURDAY, 05 MARCH' }
        ]
    };

    const displayOrder = order || mockOrder;

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
            {/* Breadcrumbs and Actions */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/addon/Online-Store/orders')}
                        className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">Order: {displayOrder.order_number}</h2>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                        <Printer size={18} />
                        Print
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-100 dark:shadow-none">
                        <Edit size={18} />
                        Edit
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Products Ordered */}
                    <div className="card p-8">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6">Products ordered</h3>
                        <div className="space-y-4">
                            {displayOrder.items.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-700/30 rounded-2xl border border-transparent dark:border-gray-700/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white">{item.name}</h4>
                                            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">ID: {item.id}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-gray-900 dark:text-white">${parseFloat(item.price).toFixed(2)}</p>
                                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="card p-8">
                        <div className="flex items-center gap-2 mb-8">
                            <h3 className="text-lg font-black text-gray-900 dark:text-white">Payment</h3>
                            <span
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                    (displayOrder.status || '').toLowerCase() === 'paid'
                                        ? 'text-blue-600 border border-blue-300 dark:text-blue-400 dark:border-blue-700'
                                        : (displayOrder.status || '').toLowerCase() === 'pending'
                                            ? 'text-gray-500 border border-gray-300 dark:text-gray-400 dark:border-gray-600'
                                            : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                                }`}
                            >
                                {displayOrder.status}
                            </span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm font-bold">
                                <span className="text-gray-400 dark:text-gray-500">Subtotal</span>
                                <span className="text-gray-900 dark:text-white">${parseFloat(displayOrder.subtotal).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold">
                                <span className="text-gray-400 dark:text-gray-500">Shipping</span>
                                <span className="text-gray-900 dark:text-white">${parseFloat(displayOrder.shipping).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold">
                                <span className="text-gray-400 dark:text-gray-500">Tax</span>
                                <span className="text-gray-900 dark:text-white">${parseFloat(displayOrder.tax).toFixed(2)}</span>
                            </div>
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <span className="font-black text-gray-900 dark:text-white">Total</span>
                                <span className="text-lg font-black text-gray-900 dark:text-white">${parseFloat(displayOrder.total).toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-400 dark:text-gray-500 font-medium">Customer payment</span>
                            <span className="text-lg font-black text-gray-900 dark:text-white">${parseFloat(displayOrder.total).toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Activity Timeline */}
                    <div className="card p-8">
                        <div className="flex items-center gap-2 mb-8">
                            <h3 className="text-lg font-black text-gray-900 dark:text-white">Activity</h3>
                            <span className="px-2.5 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-[10px] font-black uppercase tracking-wider">{displayOrder.fulfillment_status}</span>
                        </div>
                        <div className="space-y-8">
                            {/* Group activities by date */}
                            {(() => {
                                const dates = [...new Set(displayOrder.activity.map(a => a.date))];
                                return dates.map((date, dIdx) => (
                                    <div key={dIdx} className="space-y-6">
                                        <h4 className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-widest">{date}</h4>
                                        <div className="space-y-6 ml-1 border-l-2 border-gray-100 dark:border-gray-700">
                                            {displayOrder.activity.filter(a => a.date === date).map((act, i) => (
                                                <div key={i} className="relative pl-6">
                                                    <div className={`absolute top-0 left-[-7px] w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${act.current ? 'bg-green-500' : 'bg-blue-500'}`} />
                                                    <div className="space-y-1">
                                                        <p className={`text-sm font-black ${act.current ? 'text-green-600 dark:text-green-400 font-bold' : 'text-gray-900 dark:text-white font-bold'}`}>{act.status}</p>
                                                        {act.recipient && <p className="text-xs font-bold text-gray-400 dark:text-gray-500 font-medium">Recipient: {act.recipient}</p>}
                                                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 font-medium">{act.time}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="card p-8">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6">Customer</h3>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm">
                                <img src={displayOrder.customer.avatar} alt={displayOrder.customer.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h4 className="font-black text-gray-900 dark:text-white">{displayOrder.customer.name}</h4>
                                <p className="text-xs font-bold text-gray-400 dark:text-gray-500">{displayOrder.customer.previous_orders} previous orders</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 font-bold">
                                <Mail size={18} className="text-gray-300 dark:text-gray-600" />
                                <span className="font-medium truncate">{displayOrder.customer.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 font-bold">
                                <Phone size={18} className="text-gray-300 dark:text-gray-600" />
                                <span className="font-medium">{displayOrder.customer.phone}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="card p-8">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6">Shipping Address</h3>
                        <div className="text-sm font-bold text-gray-500 dark:text-gray-400 leading-relaxed font-black">
                            {displayOrder.shipping_address.split('\n').map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                        </div>
                    </div>

                    {/* Billing Address */}
                    <div className="card p-8">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6">Billing address</h3>
                        <div className="text-sm font-bold text-gray-500 dark:text-gray-400 leading-relaxed font-black">
                            {displayOrder.billing_address.split('\n').map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                        </div>
                    </div>

                    {/* Note */}
                    <div className="card p-8">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6">Note</h3>
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-transparent dark:border-gray-700 text-sm font-bold text-gray-500 dark:text-gray-400 leading-relaxed italic">
                            {displayOrder.note}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
