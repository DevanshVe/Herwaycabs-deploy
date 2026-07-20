import React, { useEffect, useState, useMemo } from 'react';
import { bookingService } from '../services/api';
import StarRating from './StarRating';

const STATUS_STYLES = {
    PAID: 'bg-green-100 text-green-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-gray-200 text-gray-600',
    STARTED: 'bg-indigo-100 text-indigo-700',
    DRIVER_ASSIGNED: 'bg-blue-100 text-blue-700',
    REQUESTED: 'bg-yellow-100 text-yellow-700',
};

const STATUS_OPTIONS = ['ALL', 'REQUESTED', 'DRIVER_ASSIGNED', 'STARTED', 'COMPLETED', 'PAID', 'CANCELLED'];
const PAGE_SIZE = 5;

const fmtDate = (s) => {
    if (!s) return '';
    try { return new Date(s).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }); }
    catch { return ''; }
};

// Shared ride-history overlay for riders and drivers (search + status filter).
export default function RideHistoryModal({ open, onClose, userId, role }) {
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('ALL');
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (!open) return;
        setLoading(true); setError('');
        setQuery(''); setStatus('ALL'); setPage(1);
        bookingService.getMyRides(userId, role)
            .then((r) => setRides([...r].sort((a, b) => b.id - a.id)))
            .catch(() => setError('Could not load your ride history — please try again in a moment.'))
            .finally(() => setLoading(false));
    }, [open, userId, role]);

    useEffect(() => { setPage(1); }, [query, status]);

    const isDriver = role === 'DRIVER';

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return rides.filter((r) => {
            if (status !== 'ALL' && r.status !== status) return false;
            if (!q) return true;
            const hay = `#${r.id} ${r.pickupLocation || ''} ${r.dropLocation || ''} ${r.riderId || ''} ${r.driverId || ''}`.toLowerCase();
            return hay.includes(q);
        });
    }, [rides, query, status]);

    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, pageCount);
    const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
            <div className="bg-white w-full max-w-lg max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Ride History</h2>
                        <p className="text-xs text-gray-500">{isDriver ? 'Trips you have driven' : 'Your past rides'}</p>
                    </div>
                    <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-700 text-3xl leading-none">&times;</button>
                </div>

                {!loading && !error && rides.length > 0 && (
                    <div className="flex gap-2 p-4 border-b border-gray-100 bg-gray-50">
                        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search location or id…"
                            className="flex-1 min-w-0 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                        <select value={status} onChange={(e) => setStatus(e.target.value)}
                            className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none">
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{s === 'ALL' ? 'All statuses' : s.replace('_', ' ')}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                    {loading ? (
                        <p className="text-center text-gray-500 py-10">Loading…</p>
                    ) : error ? (
                        <p className="text-center text-red-500 py-10">{error}</p>
                    ) : rides.length === 0 ? (
                        <p className="text-center text-gray-500 py-10">No rides yet.</p>
                    ) : filtered.length === 0 ? (
                        <p className="text-center text-gray-500 py-10">No rides match your search.</p>
                    ) : (
                        pageItems.map((r) => (
                            <div key={r.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold text-gray-400">#{r.id} · {fmtDate(r.requestTime)}</span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[r.status] || 'bg-gray-100 text-gray-600'}`}>
                                        {r.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                                    <span className="truncate flex-1">{r.pickupLocation}</span>
                                    <span className="text-gray-300">→</span>
                                    <span className="truncate flex-1 text-right">{r.dropLocation}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">{isDriver ? `Rider #${r.riderId}` : (r.driverId ? `Driver #${r.driverId}` : 'No driver')}</span>
                                    <span className="font-bold text-gray-900">₹{Math.round(r.fare)}</span>
                                </div>
                                {r.driverRating ? (
                                    <div className="mt-2 flex items-center gap-2">
                                        <StarRating value={r.driverRating} size="w-3.5 h-3.5" />
                                        {r.driverFeedback && <span className="text-xs text-gray-400 truncate">"{r.driverFeedback}"</span>}
                                    </div>
                                ) : null}
                            </div>
                        ))
                    )}
                </div>

                {!loading && !error && filtered.length > PAGE_SIZE && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
                        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1}
                            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white disabled:opacity-40 hover:border-primary transition">Prev</button>
                        <span className="text-xs text-gray-500">Page {safePage} of {pageCount}</span>
                        <button onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={safePage >= pageCount}
                            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white disabled:opacity-40 hover:border-primary transition">Next</button>
                    </div>
                )}
            </div>
        </div>
    );
}
