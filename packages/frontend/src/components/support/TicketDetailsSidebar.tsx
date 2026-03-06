import React from 'react';
import {
    User,
    Mail,
    Tag,
    UserCheck,
    Calendar,
    Clock,
    Trash2,
    Lock,
    CheckCircle,
    ChevronDown
} from 'lucide-react';

interface DetailItemProps {
    label: string;
    value: React.ReactNode;
    icon: React.ElementType;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, icon: Icon }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
        <div className="flex items-center space-x-3 text-gray-500">
            <Icon className="w-4 h-4" />
            <span className="text-sm">{label}</span>
        </div>
        <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center space-x-2">
            {value}
        </div>
    </div>
);

interface TicketDetailsSidebarProps {
    ticket: any;
    onUpdateStatus: (status: string) => void;
    onDelete: () => void;
}

const TicketDetailsSidebar: React.FC<TicketDetailsSidebarProps> = ({ ticket, onUpdateStatus, onDelete }) => {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 h-fit overflow-hidden font-inter">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h2 className="font-bold text-gray-900 dark:text-white tracking-tight">Ticket Details</h2>
            </div>

            <div className="p-6 space-y-6">
                {/* Verified Badge */}
                <div className="bg-transparent text-gray-700 dark:text-gray-300 p-3 rounded-xl flex items-center justify-center space-x-2 text-xs font-bold border border-gray-300 dark:border-gray-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="tracking-wide">VERIFIED PURCHASE</span>
                </div>

                {/* Status Selectors */}
                <div className="space-y-3">
                    <div className="relative">
                        <select
                            value={ticket.status}
                            onChange={(e) => onUpdateStatus(e.target.value)}
                            className="w-full appearance-none bg-gray-50/50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none pr-10 transition-all text-gray-700 dark:text-gray-200"
                        >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    <div className="relative">
                        <select className="w-full appearance-none bg-gray-50/50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none pr-10 transition-all text-gray-700 dark:text-gray-200">
                            <option>{ticket.first_name} {ticket.last_name}</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    <div className="relative">
                        <select className="w-full appearance-none bg-gray-50/50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none pr-10 transition-all text-gray-700 dark:text-gray-200">
                            <option>Able Admin</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Info Grid */}
                <div className="space-y-1 pt-2">
                    <DetailItem
                        label="Customer"
                        icon={User}
                        value={
                            <div className="flex items-center space-x-2">
                                <img src={`https://ui-avatars.com/api/?name=${ticket.first_name}+${ticket.last_name}&background=random`} className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-gray-800 shadow-sm" alt="" />
                                <span className="font-bold">{ticket.first_name} {ticket.last_name}</span>
                            </div>
                        }
                    />
                    <DetailItem
                        label="Contact"
                        icon={Mail}
                        value={<span className="font-medium text-gray-600 dark:text-gray-400">{ticket.email || 'mail@mail.com'}</span>}
                    />
                    <DetailItem
                        label="Category"
                        icon={Tag}
                        value={
                            <div className="flex items-center space-x-2">
                                <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center text-[10px] text-teal-600 font-bold border border-teal-200">A</div>
                                <span className="font-bold">Alpha pro</span>
                            </div>
                        }
                    />
                    <DetailItem
                        label="Assigned"
                        icon={UserCheck}
                        value={
                            <div className="flex items-center space-x-2">
                                <img src="https://ui-avatars.com/api/?name=Lina+Hop&background=00ff00&color=fff" className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-gray-800 shadow-sm" alt="" />
                                <span className="font-bold">Lina Hop</span>
                            </div>
                        }
                    />
                    <DetailItem
                        label="Created"
                        icon={Calendar}
                        value={<span className="font-bold">Date</span>}
                    />
                    <DetailItem
                        label="Response"
                        icon={Clock}
                        value={<span className="font-bold">Time</span>}
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <button className="flex-1 px-4 py-3 rounded-xl bg-orange-50 text-orange-500 text-[10px] font-bold uppercase tracking-wider hover:bg-orange-100 transition-all flex items-center justify-center space-x-2 border border-orange-200">
                        <Lock className="w-3 h-3" />
                        <span>Make Private</span>
                    </button>
                    <button
                        onClick={onDelete}
                        className="flex-1 px-4 py-3 rounded-xl bg-red-50 text-red-500 text-[10px] font-bold uppercase tracking-wider hover:bg-red-100 transition-all flex items-center justify-center space-x-2 border border-red-200"
                    >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TicketDetailsSidebar;
