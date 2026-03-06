import React from 'react';
import { Link } from 'react-router-dom';
import {
    MessageSquare,
    Trash2,
    Calendar,
    Hash,
    Heart
} from 'lucide-react';
import { SupportTicket } from '@/types';

interface SupportCardProps {
    ticket: SupportTicket;
    onDelete: (ticket: SupportTicket) => void;
}

const SupportCard: React.FC<SupportCardProps> = ({ ticket, onDelete }) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 24) {
            return `${diffInHours} hours ago`;
        }
        return date.toLocaleDateString();
    };

    const initials = `${(ticket.first_name || '').charAt(0)}${(ticket.last_name || '').charAt(0)}`.trim() || 'U';
    return (
        <div className="card hover:shadow-md transition-shadow duration-200 font-inter">
            <div className="p-5 flex flex-col md:flex-row md:items-center gap-6">
                {/* User Info & Avatar */}
                <div className="flex flex-col items-center min-w-[80px]">
                    <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-lg border border-gray-200 dark:border-gray-600">
                            {initials}
                        </div>
                    </div>
                    <div className="mt-2 text-center">
                        <span className="text-xs text-gray-400 block uppercase font-bold tracking-tighter">1 Ticket</span>
                        <div className="flex items-center justify-center space-x-1 text-blue-600 dark:text-blue-400">
                            <Heart className="w-3 h-3 fill-current" />
                            <span className="text-xs font-bold">3</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-3">
                        <h3 className="font-bold text-gray-900 dark:text-white">
                            {ticket.first_name} {ticket.last_name}
                        </h3>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-gray-100 text-gray-500 uppercase tracking-wider dark:bg-gray-800/60 dark:text-gray-300">
                            Replied
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                            <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[10px] text-gray-500 dark:text-gray-400 font-bold border border-gray-200 dark:border-gray-600">
                                A
                            </div>
                            <span className="font-medium text-gray-600 dark:text-gray-300">Piaf able</span>
                        </div>

                        <div className="flex items-center space-x-1">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                                RA
                            </div>
                            <span className="text-gray-400">Assigned to</span>
                            <span className="font-bold text-gray-700 dark:text-gray-300">Robert Alia</span>
                        </div>

                        <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">Updated {formatDate(ticket.updatedAt)}</span>
                        </div>

                        <div className="flex items-center space-x-1">
                            <MessageSquare className="w-4 h-4 text-gray-400" />
                            <span className="font-bold">9</span>
                        </div>
                    </div>

                    <div className="flex items-start space-x-2">
                        <Hash className="w-4 h-4 mt-1 text-gray-400" />
                        <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 line-clamp-1">
                            {ticket.subject}
                        </h4>
                    </div>

                    <div className="flex items-center space-x-3 pt-1">
                        <Link
                            to={`/support/${ticket.id}`}
                            className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-blue-500 dark:border-blue-400 rounded-xl text-sm font-bold text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all space-x-2"
                        >
                            <MessageSquare className="w-4 h-4" />
                            <span>View Ticket</span>
                        </Link>
                        <button
                            onClick={() => onDelete(ticket)}
                            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 text-sm font-bold hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-500 transition-all flex items-center space-x-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportCard;
