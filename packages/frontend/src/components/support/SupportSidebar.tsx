import React from 'react';

interface SidebarItemProps {
    label: string;
    count: number;
    unreadCount?: number;
    icon?: string;
    initial?: string;
    active?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ label, count, unreadCount, icon, initial, active }) => (
    <div className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${active ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
        <div className="flex items-center space-x-3">
            {initial ? (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${active ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'}`}>
                    {initial}
                </div>
            ) : icon ? (
                <img src={icon} className="w-8 h-8 rounded-full" alt={label} />
            ) : null}
            <span className={`text-sm ${active ? 'font-bold' : 'text-gray-600 dark:text-gray-300'}`}>{label}</span>
        </div>
        <div className="flex items-center space-x-1.5">
            {unreadCount ? (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 text-[10px] font-bold">
                    {unreadCount}
                </span>
            ) : null}
            <span className="text-xs text-gray-400 font-medium">{count}</span>
        </div>
    </div>
);

interface SupportSidebarProps {
}

const SupportSidebar: React.FC<SupportSidebarProps> = () => {
    const categories = [
        { label: 'Piaf able', initial: 'A', count: 3, unread: 1 },
        { label: 'Pro able', initial: 'B', count: 3 },
        { label: 'CRM admin', initial: 'C', count: 3, unread: 1 },
        { label: 'Alpha pro', initial: 'D', count: 3 },
        { label: 'Carbon able', initial: 'E', count: 3 },
    ];

    const agents = [
        { label: 'Tom Cook', initial: 'TC', count: 3, unread: 1 },
        { label: 'Brad Larry', initial: 'BL', count: 3, unread: 1 },
        { label: 'Jhon White', initial: 'JW', count: 3 },
        { label: 'Mark Jobs', initial: 'MJ', count: 3 },
        { label: 'Robert Alia', initial: 'RA', count: 3 },
    ];

    return (
        <div className="space-y-6">
            {/* Categories */}
            <div className="card h-fit rounded-2xl">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">Ticket Categories</h2>
                </div>
                <div className="p-2 space-y-1">
                    {categories.map((cat, idx) => (
                        <SidebarItem
                            key={idx}
                            label={cat.label}
                            initial={cat.initial}
                            count={cat.count}
                            unreadCount={cat.unread}
                        />
                    ))}
                </div>
            </div>

            {/* Agents */}
            <div className="card h-fit rounded-2xl">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">Support Agent</h2>
                </div>
                <div className="p-2 space-y-1">
                    {agents.map((agent, idx) => (
                        <SidebarItem
                            key={idx}
                            label={agent.label}
                            initial={(agent as any).initial}
                            count={agent.count}
                            unreadCount={agent.unread}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SupportSidebar;
