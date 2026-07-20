import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingService, driverService } from '../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Toast from '../components/Toast';
import RideHistoryModal from '../components/RideHistoryModal';
import { pickupIcon as greenIcon, dropIcon as redIcon } from '../utils/mapIcons';

const DriverHome = () => {
    const { user, logout } = useAuth();
    const [availableRides, setAvailableRides] = useState([]);
    const [activeRide, setActiveRide] = useState(null);
    const [otp, setOtp] = useState('');
    const [isOnline, setIsOnline] = useState(user?.isAvailable || false);
    const [notice, setNotice] = useState(null);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        if (!user?.id) return;
        // Self-heal: guarantee this driver has a record in driver-service. The
        // sign-up sync can fail if that service was cold. Idempotent (matches
        // by email), so it never overwrites an existing verified record.
        driverService.registerDriver({
            id: user.id, name: user.name, email: user.email,
            isVerified: false, isAvailable: false,
        }).catch(() => { });
        if (user?.isAvailable) setIsOnline(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => { driverService.updateLocation(user.id, pos.coords.latitude, pos.coords.longitude).catch(() => { }); },
            () => { }
        );
    }, [user]);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchRides();
            if (isOnline && user?.id) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => driverService.updateLocation(user.id, pos.coords.latitude, pos.coords.longitude).catch(() => { }), () => { }
                );
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [isOnline]); // eslint-disable-line react-hooks/exhaustive-deps

    const toggleOnline = async () => {
        try {
            const updated = await driverService.toggleAvailability(user.id, isOnline);
            setIsOnline(updated.isAvailable);
            setNotice({ type: 'success', message: updated.isAvailable ? "You're online — watching for nearby ride requests." : "You're offline. You won't receive new requests." });
        } catch (error) {
            const serverMsg = error.response?.data?.message;
            setNotice({
                type: 'error',
                message: serverMsg
                    || (error.response
                        ? "You can't go online yet — your driver account needs to be verified by an admin first."
                        : 'Cannot reach the server right now — please try again in a moment.')
            });
        }
    };

    const fetchRides = async () => {
        if (!isOnline && !activeRide) { setAvailableRides([]); return; }
        try {
            const myRides = await bookingService.getMyRides(user.id, user.role);
            const ongoing = myRides.find(r => ['DRIVER_ASSIGNED', 'STARTED'].includes(r.status));
            if (ongoing) { setActiveRide(ongoing); }
            else {
                setActiveRide(null);
                if (isOnline) setAvailableRides(await bookingService.getAvailableRides());
            }
        } catch (error) { console.error(error); }
    };

    const handleAccept = async (rideId) => {
        try {
            const ride = await bookingService.acceptRide(rideId, user.id);
            setActiveRide(ride);
            setNotice({ type: 'success', message: 'Ride accepted! Head to the pickup point.' });
            fetchRides();
        } catch (error) {
            setNotice({ type: 'error', message: error.response?.data?.message || 'This ride is no longer available.' });
        }
    };

    const handleStartRide = async () => {
        if (otp.length !== 4) { setNotice({ type: 'error', message: 'Enter the 4-digit OTP from the rider to start.' }); return; }
        try {
            const ride = await bookingService.startRide(activeRide.id, otp);
            setActiveRide(ride); setOtp('');
            setNotice({ type: 'success', message: 'Trip started. Drive safe!' });
        } catch (error) {
            setNotice({ type: 'error', message: 'Incorrect OTP. Please check with the rider and try again.' });
        }
    };

    const handleCompleteRide = async () => {
        try {
            await bookingService.completeRide(activeRide.id);
            setActiveRide(null);
            setNotice({ type: 'success', message: 'Trip completed. Waiting for the rider to pay.' });
            fetchRides();
        } catch (error) {
            setNotice({ type: 'error', message: 'Could not end the trip. Please try again.' });
        }
    };

    return (
        <div className="h-screen flex flex-col bg-background font-sans">
            <Toast notice={notice} onClose={() => setNotice(null)} />

            <header className="bg-white shadow-sm p-5 flex justify-between items-center z-10">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold tracking-tight text-primary">HerWayCabs Driver</h1>
                    <button onClick={toggleOnline}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${isOnline ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
                        {isOnline ? 'Online' : 'Go Online'}
                    </button>
                    {isOnline && <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>}
                </div>
                <div className="flex items-center gap-4">
                    <p className="font-medium text-gray-700 hidden sm:block">{user?.name}</p>
                    <button onClick={() => setShowHistory(true)} className="text-gray-600 font-semibold text-sm hover:text-primary transition">History</button>
                    <button onClick={logout} className="text-accent font-semibold text-sm hover:underline">Logout</button>
                </div>
            </header>

            <RideHistoryModal open={showHistory} onClose={() => setShowHistory(false)} userId={user?.id} role={user?.role} />

            <div className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full overflow-auto">
                {activeRide ? (
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-pink-100 max-w-3xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Current Trip</h2>
                            <span className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm">#{activeRide.id}</span>
                        </div>

                        <div className="h-56 w-full mb-6 rounded-xl overflow-hidden border border-gray-200 relative z-0">
                            <MapContainer center={[activeRide.pickupLatitude || 51.505, activeRide.pickupLongitude || -0.09]} zoom={14} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                                <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                {activeRide.pickupLatitude && <Marker position={[activeRide.pickupLatitude, activeRide.pickupLongitude]} icon={greenIcon}><Popup>Pickup</Popup></Marker>}
                                {activeRide.dropLatitude && <Marker position={[activeRide.dropLatitude, activeRide.dropLongitude]} icon={redIcon}><Popup>Drop</Popup></Marker>}
                            </MapContainer>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Pickup</p><p className="font-semibold text-gray-900">{activeRide.pickupLocation}</p></div>
                            <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Drop</p><p className="font-semibold text-gray-900">{activeRide.dropLocation}</p></div>
                            <div className="bg-green-50 p-4 rounded-xl"><p className="text-sm font-bold text-green-700">Fare</p><p className="text-2xl font-extrabold text-green-800">₹{Math.round(activeRide.fare)}</p></div>
                            <div className="bg-pink-50 p-4 rounded-xl"><p className="text-sm font-bold text-pink-700">Rider</p><p className="text-xl font-bold text-pink-800">#{activeRide.riderId}</p></div>
                        </div>

                        {activeRide.status === 'DRIVER_ASSIGNED' && (
                            <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-200">
                                <label className="block text-sm font-bold text-yellow-800 mb-2">Ask the rider for their OTP to start</label>
                                <div className="flex gap-3">
                                    <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} maxLength={4}
                                        className="block w-full text-center tracking-[0.75em] text-2xl font-bold bg-white border-2 border-yellow-300 rounded-lg p-3 focus:ring-4 focus:ring-yellow-200 outline-none" placeholder="0000" />
                                    <button onClick={handleStartRide} className="bg-primary text-white px-8 rounded-lg font-bold hover:bg-accent transition whitespace-nowrap">Start</button>
                                </div>
                            </div>
                        )}

                        {activeRide.status === 'STARTED' && (
                            <button onClick={handleCompleteRide} className="w-full bg-red-600 text-white py-5 rounded-xl hover:bg-red-700 font-extrabold text-xl transition">End Trip</button>
                        )}

                        {['COMPLETED', 'PAID'].includes(activeRide.status) && (
                            <div className="text-center py-6 text-gray-500 font-medium">Waiting for the rider to pay…</div>
                        )}
                    </div>
                ) : (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Available Requests</h2>
                            <p className="text-gray-500 mt-1">
                                {!isOnline ? 'You are offline — go online to receive ride requests.' : `${availableRides.length} ride${availableRides.length === 1 ? '' : 's'} waiting near you.`}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {availableRides.length === 0 ? (
                                <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    </div>
                                    <p className="text-gray-500 font-medium">{isOnline ? 'Waiting for ride requests…' : 'Go online to start earning.'}</p>
                                </div>
                            ) : (
                                availableRides.map(ride => (
                                    <div key={ride.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">#{ride.id}</span>
                                            <span className="text-green-600 text-lg font-bold">₹{Math.round(ride.fare)}</span>
                                        </div>
                                        <div className="space-y-3 mb-6 text-sm">
                                            <div><p className="text-xs text-gray-400 font-bold uppercase">Pickup</p><p className="font-semibold text-gray-900 truncate">{ride.pickupLocation}</p></div>
                                            <div><p className="text-xs text-gray-400 font-bold uppercase">Drop</p><p className="font-semibold text-gray-900 truncate">{ride.dropLocation}</p></div>
                                        </div>
                                        <button onClick={() => handleAccept(ride.id)} className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-accent transition">Accept Request</button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DriverHome;
