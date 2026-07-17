import React, { useEffect } from 'react';

const COLORS = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-gray-900',
};

// Lightweight, self-dismissing toast. Pass `notice = { type, message }` or null.
const Toast = ({ notice, onClose }) => {
    useEffect(() => {
        if (!notice) return;
        const t = setTimeout(onClose, 4500);
        return () => clearTimeout(t);
    }, [notice, onClose]);

    if (!notice) return null;

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[3000] w-[90%] max-w-md">
            <div className={`${COLORS[notice.type] || COLORS.info} text-white px-5 py-3 rounded-xl shadow-2xl flex items-start gap-3`}>
                <span className="flex-1 text-sm font-medium leading-snug">{notice.message}</span>
                <button onClick={onClose} aria-label="Dismiss" className="text-white/70 hover:text-white text-xl leading-none -mt-0.5">&times;</button>
            </div>
        </div>
    );
};

export default Toast;
