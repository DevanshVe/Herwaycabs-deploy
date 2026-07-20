import React, { useEffect, useState } from 'react';
import { bookingService } from '../services/api';

const STATUS_STYLES = {
    PAID: 'bg-green-100 text-green-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-gray-200 text-gray-600',
    STARTED: 'bg-indigo-100 text-indigo-700',
    DRIVER_ASSIGNED: 'bg-blue-100 text-blue-700',
    REQUESTED: 'bg-yellow-100 text-yellow-700',
};

const fmtDate = (s) => {
    if (!s) return '';
    try { return new Date(s).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }); }
    catch { return ''; }
};

// Shared ride-history overlay for riders and drivers.
export default function RideHistoryModal({ open, onClose, userId, role }) {
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!open) return;
        setLoading(true); setError('');
        bookingService.getMyRides(userId, role)
            .then((r) => setRides([...r].sort((a, b) => b.id - a.id)))
            .catch(() => setError('Could not load your ride history — please try again in a moment.'))
            .finally(() => setLoading(false));
    }, [open, userId, role]);

    if (!open) return null;

    const isDriver = role === 'DRIVER';

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
            <div className="bg-white w-full max-w-lg max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Ride History</h2>
                        <p className="text-xs text-gray-500">{isDriver ? 'Trips you have driven' : 'Your past rides'}</p>
                    </div>
                    <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-700 text-3xl leading-none">&times;</button>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                    {loading ? (
                        <p className="text-center text-gray-500 py-10">Loading…</p>
                    ) : error ? (
                        <p className="text-center text-red-500 py-10">{error}</p>
                    ) : rides.length === 0 ? (
                        <p className="text-center text-gray-500 py-10">No rides yet.</p>
                    ) : (
                        rides.map((r) => (
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
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
