import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';

const timeAgo = (ts) => {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    return `${Math.floor(s / 3600)}h ago`;
};

export default function NotificationBell() {
    const { items, unread, markAllRead, clear } = useNotifications();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', onDoc);
        return () => document.removeEventListener('mousedown', onDoc);
    }, []);

    const toggle = () => setOpen((o) => { if (!o) markAllRead(); return !o; });

    return (
        <div className="relative" ref={ref}>
            <button onClick={toggle} title="Notifications" className="relative p-2 text-gray-600 hover:text-primary transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unread > 0 && (
                    <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unread > 9 ? '9+' : unread}</span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-[1200] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
                        <span className="font-bold text-sm text-gray-800">Notifications</span>
                        {items.length > 0 && <button onClick={clear} className="text-xs text-gray-400 hover:text-primary">Clear all</button>}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                        {items.length === 0 ? (
                            <p className="text-center text-sm text-gray-400 py-8">No notifications yet.</p>
                        ) : (
                            items.map((n) => (
                                <div key={n.id} className="px-4 py-2.5 border-b border-gray-50 last:border-0 flex gap-2.5">
                                    <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.type === 'success' ? 'bg-green-500' : n.type === 'error' ? 'bg-red-500' : 'bg-primary'}`}></span>
                                    <div className="min-w-0">
                                        <p className="text-sm text-gray-700">{n.message}</p>
                                        <p className="text-[11px] text-gray-400 mt-0.5">{timeAgo(n.at)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
