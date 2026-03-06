import React, { useState } from 'react';
import {
    MessageSquare,
    Trash2,
    Edit,
    ThumbsUp,
    Star,
    Send,
    X,
    Smile,
    Paperclip,
    Maximize2
} from 'lucide-react';

interface ReplyProps {
    reply: any;
    isOwn?: boolean;
}

const ReplyItem: React.FC<ReplyProps> = ({ reply, isOwn }) => {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
            <div className="flex items-start justify-between">
                <div className="flex space-x-4">
                    <div className="flex-shrink-0 relative">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border-2 shadow-sm ${isOwn ? 'border-primary-500' : 'border-gray-500'}`}>
                            <img
                                src={`https://ui-avatars.com/api/?name=${reply.first_name || 'User'}&background=${isOwn ? '3b82f6' : 'random'}&color=fff`}
                                className="w-full h-full"
                                alt="avatar"
                            />
                        </div>
                        {isOwn && (
                            <div className="absolute -bottom-2 -left-2 bg-white dark:bg-gray-800 rounded-lg px-1.5 py-0.5 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-1 text-primary-500 scale-75 origin-top-left">
                                <ThumbsUp className="w-3 h-3 fill-current" />
                                <span className="text-[10px] font-bold uppercase tracking-tighter">4</span>
                            </div>
                        )}
                        {!isOwn && (
                            <div className="absolute -bottom-2 -left-2 bg-red-50 text-red-500 border border-red-100 rounded-lg px-1.5 py-0.5 scale-75 origin-top-left">
                                <span className="text-[10px] font-bold uppercase tracking-tighter italic">1 Ticket</span>
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center space-x-2">
                            <span className="font-bold text-gray-900 dark:text-white font-inter tracking-tight">
                                {isOwn ? 'You' : (reply.first_name + ' ' + reply.last_name)}
                            </span>
                            <span className="px-2 py-0.5 rounded-lg bg-gray-50 dark:bg-gray-800/60 text-[10px] text-gray-400 dark:text-gray-300 font-bold uppercase tracking-wider">
                                replied
                            </span>
                        </div>
                        <p className="text-[12px] text-gray-400 font-medium">1 day ago on Wednesday at 8:18am</p>
                    </div>
                </div>
                <div className="flex items-center space-x-1">
                    <button className="p-2 hover:bg-gray-50 rounded-xl text-gray-500 dark:text-gray-400 transition-colors"><Edit className="w-4 h-4" /></button>
                    <button className="p-2 hover:bg-red-50 rounded-xl text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
            </div>

            <div className="space-y-4 text-[14px] leading-relaxed text-gray-700 dark:text-gray-300 font-inter">
                <p className="font-bold">hello john doe,</p>
                <div className="space-y-4">
                    {reply.message.split('\n').map((para: string, i: number) => (
                        <p key={i}>{para}</p>
                    ))}
                </div>

                {reply.message.includes('code') && (
                    <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-2 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">css</span>
                        </div>
                        <pre className="p-6 bg-primary-50/20 dark:bg-gray-800/80 font-mono text-[13px] overflow-x-auto text-primary-800 dark:text-primary-300">
                            <code>{`p {\n    color: #1abc9c\n}`}</code>
                        </pre>
                    </div>
                )}

                {/* Image Grid Mock (as seen in user image) */}
                {!isOwn && (
                    <div className="grid grid-cols-5 gap-3 pt-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="aspect-square rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
                                <img src={`https://picsum.photos/seed/${i + 10}/200`} className="w-full h-full object-cover" alt="" />
                            </div>
                        ))}
                    </div>
                )}

                {!isOwn && (
                    <div className="pt-2">
                        <button className="px-4 py-1.5 rounded-xl bg-red-50 text-red-500 text-xs font-bold hover:bg-red-100 transition-all flex items-center space-x-2 border border-red-100">
                            <ThumbsUp className="w-3 h-3" />
                            <span>Like</span>
                        </button>
                    </div>
                )}

                <p className="font-bold pt-2">Thanks...</p>
            </div>
        </div>
    );
};

interface TicketConversationProps {
    ticket: any;
    onPostReply: (message: string) => void;
}

const TicketConversation: React.FC<TicketConversationProps> = ({ ticket, onPostReply }) => {
    const [replyText, setReplyText] = useState('');
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (replyText.trim()) {
            onPostReply(replyText);
            setReplyText('');
            setIsReplyModalOpen(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-transparent font-inter">
            {/* Thread Header */}
            <div className="p-8 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center border border-primary-100 text-primary-600 shadow-sm">
                        <Lock className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tight">
                            Private Ticket #{ticket.ticketNumber || '1831786'}
                        </h2>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mt-1">
                            {ticket.subject}
                        </h1>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="px-4 py-2 rounded-xl border border-gray-500 text-gray-600 dark:text-gray-300 text-xs font-bold bg-transparent hover:bg-gray-100 transition-all shadow-sm">
                        Mark as unread
                    </button>
                    <button className="p-2 text-orange-400 hover:bg-orange-50 rounded-xl transition-colors"><Star className="w-6 h-6" /></button>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="px-8 py-4 flex items-center space-x-3 bg-white/30 dark:bg-gray-900/30 border-b border-gray-200 dark:border-gray-800 sticky top-[105px] z-10 backdrop-blur-sm">
                <button
                    onClick={() => setIsReplyModalOpen(true)}
                    className="px-6 py-2 rounded-xl bg-gray-900 dark:bg-gray-700 text-white text-xs font-bold flex items-center space-x-2 shadow-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-all"
                >
                    <MessageSquare className="w-4 h-4" />
                    <span>Post a reply</span>
                </button>
                <button className="px-6 py-2 rounded-xl bg-orange-50 text-orange-500 text-xs font-bold flex items-center space-x-2 border border-orange-100 hover:bg-orange-100 transition-all">
                    <Edit className="w-4 h-4" />
                    <span>Post a Note</span>
                </button>
                <button className="px-6 py-2 rounded-xl bg-red-50 text-red-500 text-xs font-bold flex items-center space-x-2 border border-red-100 hover:bg-red-100 transition-all">
                    <UserIcon className="w-4 h-4" />
                    <span>Customer Notes</span>
                </button>
            </div>

            {/* Thread */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50/30 dark:bg-gray-900/30">
                {/* Original Message */}
                <ReplyItem
                    reply={{
                        first_name: ticket.first_name,
                        last_name: ticket.last_name,
                        message: ticket.description
                    }}
                    isOwn={false}
                />

                {/* Replies */}
                {ticket.replies?.map((reply: any) => (
                    <ReplyItem
                        key={reply.id}
                        reply={reply}
                        isOwn={reply.role === 'superadmin'}
                    />
                ))}

                {/* Dummy repliy for layout matching */}
                <ReplyItem
                    reply={{
                        first_name: "You",
                        last_name: "",
                        message: "you need to create \"toolbar-options\" div only once in a page in your code, this div fill found every \"td\" tag in your page, just remove those things.\n\nand also, in option button add \"p-0\" class in \"i\" tag to"
                    }}
                    isOwn={true}
                />
            </div>

            {/* Reply Modal */}
            {isReplyModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                            <div className="flex items-center space-x-3 text-primary-600">
                                <MessageSquare className="w-6 h-6" />
                                <h2 className="text-xl font-bold tracking-tight">Post a Reply</h2>
                            </div>
                            <button
                                onClick={() => setIsReplyModalOpen(false)}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-6 space-y-4">
                            <div className="relative flex-1">
                                <textarea
                                    autoFocus
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Type your message here..."
                                    className="w-full h-64 p-6 bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700 rounded-3xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none dark:text-white resize-none shadow-inner text-lg"
                                />
                                <div className="absolute top-4 right-4 flex items-center space-x-2">
                                    <button type="button" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-gray-400">
                                        <Maximize2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center space-x-4 text-gray-400">
                                    <button type="button" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors flex items-center space-x-1.5">
                                        <Smile className="w-5 h-5" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Emoji</span>
                                    </button>
                                    <button type="button" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors flex items-center space-x-1.5">
                                        <Paperclip className="w-5 h-5" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Attach</span>
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!replyText.trim()}
                                    className="px-8 py-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-all disabled:opacity-50 shadow-xl shadow-primary-500/20 flex items-center space-x-3 font-bold text-lg"
                                >
                                    <span>Send Message</span>
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Internal icons
const Lock = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

export default TicketConversation;
