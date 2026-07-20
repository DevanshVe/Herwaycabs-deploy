import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { bookingService, driverService } from '../services/api';
import Toast from '../components/Toast';
import RideHistoryModal from '../components/RideHistoryModal';
import Logo from '../components/Logo';
import StarRating from '../components/StarRating';
import LocationInput from '../components/LocationInput';
import NotificationBell from '../components/NotificationBell';
import { pickupIcon as greenIcon, dropIcon as redIcon, driverIcon } from '../utils/mapIcons';

// Centers the map on the user's location: once automatically, then on each recenter click.
function MapController({ center, recenterSignal }) {
    const map = useMap();
    const didInit = useRef(false);
    useEffect(() => {
        if (center && !didInit.current) { map.setView(center, 15); didInit.current = true; }
    }, [center, map]);
    useEffect(() => {
        if (recenterSignal > 0 && center) map.setView(center, 15);
    }, [recenterSignal]); // eslint-disable-line react-hooks/exhaustive-deps
    return null;
}

// Great-circle distance in km between two [lat, lng] points.
function distanceKm(a, b) {
    if (!a || !b) return null;
    const R = 6371, toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(b[0] - a[0]), dLon = toRad(b[1] - a[1]);
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

const RiderHome = () => {
    const { user, logout } = useAuth();
    const { add: notify } = useNotifications();
    const [currentPosition, setCurrentPosition] = useState([51.505, -0.09]);
    const [locating, setLocating] = useState(true);
    const [pickup, setPickup] = useState('');
    const [drop, setDrop] = useState('');
    const [pickupCoords, setPickupCoords] = useState(null);
    const [dropCoords, setDropCoords] = useState(null);
    const [ride, setRide] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [recenterSignal, setRecenterSignal] = useState(0);
    const [notice, setNotice] = useState(null);
    const [assignedDriver, setAssignedDriver] = useState(null);
    const [driverLocation, setDriverLocation] = useState(null);
    const [driverRatingInfo, setDriverRatingInfo] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [ratingValue, setRatingValue] = useState(0);
    const [ratingFeedback, setRatingFeedback] = useState('');
    const [ratingSubmitting, setRatingSubmitting] = useState(false);
    const [cabType, setCabType] = useState('ECONOMY');
    const [routeLine, setRouteLine] = useState(null);
    const [routeInfo, setRouteInfo] = useState(null);
    const prevStatus = useRef(null);

    // Straight-line distance for the fare estimate (matches the backend formula).
    const estOrigin = pickupCoords || currentPosition;
    const estKm = (estOrigin && dropCoords) ? distanceKm(estOrigin, dropCoords) : null;

    // Fetch the assigned driver's details (position + rating) for the rider
    useEffect(() => {
        if (ride?.driverId) {
            driverService.getDriverById(ride.driverId).then((d) => {
                setAssignedDriver(d);
                if (d?.currentLatitude != null && d?.currentLongitude != null) {
                    setDriverLocation([d.currentLatitude, d.currentLongitude]);
                }
            }).catch(() => { });
            bookingService.getDriverRating(ride.driverId).then(setDriverRatingInfo).catch(() => { });
        } else {
            setAssignedDriver(null);
            setDriverLocation(null);
            setDriverRatingInfo(null);
        }
    }, [ride?.driverId]);

    // Notify on key ride-status transitions (driver assigned / trip started)
    useEffect(() => {
        const s = ride?.status;
        if (!ride) { prevStatus.current = null; return; }
        if (s && s !== prevStatus.current) {
            if (s === 'DRIVER_ASSIGNED') notify('A driver accepted your ride 🚗', 'success');
            else if (s === 'STARTED') notify('Your trip has started — enjoy the ride!', 'info');
            prevStatus.current = s;
        }
    }, [ride?.status]); // eslint-disable-line react-hooks/exhaustive-deps

    // Fetch a road route (OSRM) for the current origin → destination
    useEffect(() => {
        const o = ride ? [ride.pickupLatitude, ride.pickupLongitude] : pickupCoords;
        const d = ride ? [ride.dropLatitude, ride.dropLongitude] : dropCoords;
        if (!o || !d || o[0] == null || d[0] == null) { setRouteLine(null); setRouteInfo(null); return; }
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${o[1]},${o[0]};${d[1]},${d[0]}?overview=full&geometries=geojson`);
                const data = await res.json();
                const route = data?.routes?.[0];
                if (route && !cancelled) {
                    setRouteLine(route.geometry.coordinates.map(([lon, lat]) => [lat, lon]));
                    setRouteInfo({ km: route.distance / 1000, min: Math.round(route.duration / 60) });
                }
            } catch { if (!cancelled) { setRouteLine(null); setRouteInfo(null); } }
        })();
        return () => { cancelled = true; };
    }, [ride?.id, pickupCoords, dropCoords]); // eslint-disable-line react-hooks/exhaustive-deps

    const submitRating = async () => {
        if (ratingValue < 1) { setNotice({ type: 'error', message: 'Please pick a star rating first.' }); return; }
        setRatingSubmitting(true);
        try {
            const updated = await bookingService.rateRide(ride.id, ratingValue, ratingFeedback.trim());
            setRide(updated);
            setNotice({ type: 'success', message: 'Thanks for your feedback!' });
            notify('Thanks for rating your driver!', 'success');
        } catch (err) {
            setNotice({ type: 'error', message: err.response?.data?.message || 'Could not submit your rating. Please try again.' });
        } finally {
            setRatingSubmitting(false);
        }
    };

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = [position.coords.latitude, position.coords.longitude];
                setCurrentPosition(pos);
                setPickupCoords((prev) => prev || pos);
                setLocating(false);
            },
            () => { setLocating(false); setNotice({ type: 'info', message: 'Location access is off — drag the pins or type an address.' }); }
        );
    }, []);

    // Poll ride status while a ride is active
    useEffect(() => {
        let interval;
        if (ride && ride.status !== 'PAID' && ride.status !== 'CANCELLED') {
            interval = setInterval(async () => {
                try {
                    const myRides = await bookingService.getMyRides(user.id, user.role);
                    const updated = myRides.find(r => r.id === ride.id);
                    if (updated) setRide(updated);
                    // Live driver position while the driver is en route
                    if (ride.driverId && ['DRIVER_ASSIGNED', 'STARTED'].includes(ride.status)) {
                        try {
                            const d = await driverService.getDriverById(ride.driverId);
                            if (d?.currentLatitude != null && d?.currentLongitude != null) {
                                setDriverLocation([d.currentLatitude, d.currentLongitude]);
                            }
                        } catch { /* keep last known position */ }
                    }
                } catch (err) { console.error('Polling error', err); }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [ride]); // eslint-disable-line react-hooks/exhaustive-deps

    const getCoordinates = async (address) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
            const data = await res.json();
            if (data && data.length > 0) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
        } catch (e) { console.error('Geocoding failed', e); }
        return null;
    };

    const handleBookRide = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let pLat = pickupCoords ? pickupCoords[0] : currentPosition[0];
            let pLon = pickupCoords ? pickupCoords[1] : currentPosition[1];
            let dLat = dropCoords ? dropCoords[0] : currentPosition[0] + 0.01;
            let dLon = dropCoords ? dropCoords[1] : currentPosition[1] + 0.01;

            if (pickup && pickup !== 'Current Location' && !pickupCoords) {
                const pc = await getCoordinates(pickup);
                if (pc) { pLat = pc.lat; pLon = pc.lon; }
            }
            if (drop && !dropCoords) {
                const dc = await getCoordinates(drop);
                if (dc) { dLat = dc.lat; dLon = dc.lon; }
            }

            const data = await bookingService.bookRide({
                pickupLocation: pickup || 'Current Location',
                pickupLatitude: pLat, pickupLongitude: pLon,
                dropLocation: drop || 'Pinned drop', dropLatitude: dLat, dropLongitude: dLon,
                cabType
            }, user.id);
            setRide(data);
            setNotice({ type: 'success', message: `Ride requested — estimated fare ₹${Math.round(data.fare)}. Finding a driver…` });
            notify(`${cabType === 'LUXURY' ? 'Luxury' : 'Economy'} ride requested · ₹${Math.round(data.fare)}`, 'info');
        } catch (error) {
            const msg = error.response ? (error.response.data?.message || 'Could not request the ride. Please try again.') : 'Cannot reach the server right now — please try again in a moment.';
            setNotice({ type: 'error', message: msg });
        } finally {
            setSubmitting(false);
        }
    };

    const handlePayment = async () => {
        if (!ride) return;
        try {
            const updated = await bookingService.payRide(ride.id);
            setRide(updated);
            setNotice({ type: 'success', message: 'Payment successful — thank you for riding with us!' });
            notify('Payment successful 🎉', 'success');
        } catch (error) {
            setNotice({ type: 'error', message: 'Payment could not be completed. Please try again.' });
        }
    };

    // Clear the current ride and return to a fresh booking form.
    const startFresh = () => {
        setRide(null);
        setPickup(''); setDrop('');
        setPickupCoords(null); setDropCoords(null);
        setRatingValue(0); setRatingFeedback('');
        setRouteLine(null); setRouteInfo(null);
        prevStatus.current = null;
    };

    const handleCancelRide = async () => {
        if (!ride) return;
        if (!window.confirm('Cancel this ride request?')) return;
        try {
            await bookingService.cancelRide(ride.id);
            startFresh();
            setNotice({ type: 'info', message: 'Your ride request was cancelled.' });
            notify('Ride cancelled', 'info');
        } catch (error) {
            setNotice({ type: 'error', message: 'Could not cancel the ride. Please try again.' });
        }
    };

    return (
        <div className="h-screen flex flex-col font-sans">
            <Toast notice={notice} onClose={() => setNotice(null)} />

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md shadow-sm p-4 flex justify-between items-center z-10 absolute top-0 w-full">
                <div className="flex items-center gap-2">
                    <Logo className="w-9 h-9" />
                    <h1 className="text-xl font-bold text-primary tracking-tight">HerWayCabs</h1>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <NotificationBell />
                    <button onClick={() => setShowHistory(true)} className="text-gray-600 hover:text-primary px-3 py-2 rounded-full text-sm font-medium transition">
                        History
                    </button>
                    <Link to="/profile" title="Profile" className="flex items-center gap-2 hover:opacity-80 transition">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-gray-900 leading-tight">{user?.name}</p>
                            <p className="text-xs text-gray-500">Rider</p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-primary text-white flex items-center justify-center font-bold">
                            {user?.name?.charAt(0).toUpperCase() || 'R'}
                        </div>
                    </Link>
                    <button onClick={logout} className="bg-secondary hover:bg-pink-200 text-accent px-4 py-2 rounded-full text-sm font-medium transition">
                        Logout
                    </button>
                </div>
            </header>

            <RideHistoryModal open={showHistory} onClose={() => setShowHistory(false)} userId={user?.id} role={user?.role} />

            {/* Map */}
            <div className="flex-1 relative z-0">
                <MapContainer center={currentPosition} zoom={13} scrollWheelZoom={true} zoomControl={false} style={{ height: '100%', width: '100%' }}>
                    <MapController center={currentPosition} recenterSignal={recenterSignal} />
                    <ZoomControl position="bottomright" />
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {routeLine && <Polyline positions={routeLine} pathOptions={{ color: '#db2777', weight: 5, opacity: 0.75 }} />}

                    {!ride && (
                        <Marker position={pickupCoords || currentPosition} icon={greenIcon} draggable
                            eventHandlers={{ dragend: (e) => { const p = e.target.getLatLng(); setPickupCoords([p.lat, p.lng]); setPickup(`${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`); } }}>
                            <Popup>Pickup (drag to adjust)</Popup>
                        </Marker>
                    )}
                    {!ride && (
                        <Marker position={dropCoords || [currentPosition[0] + 0.01, currentPosition[1] + 0.01]} icon={redIcon} draggable
                            eventHandlers={{ dragend: (e) => { const p = e.target.getLatLng(); setDropCoords([p.lat, p.lng]); setDrop(`${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`); } }}>
                            <Popup>Drop (drag to adjust)</Popup>
                        </Marker>
                    )}
                    {ride && (
                        <>
                            <Marker position={[ride.pickupLatitude, ride.pickupLongitude]} icon={greenIcon}><Popup>Pickup: {ride.pickupLocation}</Popup></Marker>
                            <Marker position={[ride.dropLatitude, ride.dropLongitude]} icon={redIcon}><Popup>Drop: {ride.dropLocation}</Popup></Marker>
                            {driverLocation && ['DRIVER_ASSIGNED', 'STARTED'].includes(ride.status) && (
                                <Marker position={driverLocation} icon={driverIcon}><Popup>Your driver is here</Popup></Marker>
                            )}
                        </>
                    )}
                </MapContainer>

                {/* Recenter (locate me) button — sits above the zoom control */}
                <button onClick={() => setRecenterSignal((s) => s + 1)} title="Center on my location"
                    className="absolute bottom-28 right-3 z-[1000] w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-primary hover:shadow-xl transition">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                        <circle cx="12" cy="12" r="3" /><path strokeLinecap="round" d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                    </svg>
                </button>

                {/* Booking Panel */}
                <div className="absolute top-24 left-4 bg-white/95 backdrop-blur shadow-2xl rounded-2xl z-[1000] w-[22rem] max-w-[90vw] overflow-hidden border border-pink-100">
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-1 text-gray-900">{ride ? 'Your ride' : 'Where to?'}</h2>
                        {!ride && <p className="text-gray-500 mb-5 text-sm">{locating ? 'Finding your location…' : 'Set your pickup & destination.'}</p>}

                        {!ride ? (
                            <form onSubmit={handleBookRide} className="space-y-4">
                                <LocationInput value={pickup}
                                    onChange={(v) => { setPickup(v); setPickupCoords(null); }}
                                    onSelect={(s) => { setPickup(s.label); setPickupCoords([s.lat, s.lon]); }}
                                    placeholder="Pickup location" leftDot="w-3 h-3 bg-primary rounded-full ring-4 ring-pink-50" />
                                <LocationInput value={drop}
                                    onChange={(v) => { setDrop(v); setDropCoords(null); }}
                                    onSelect={(s) => { setDrop(s.label); setDropCoords([s.lat, s.lon]); }}
                                    placeholder="Enter destination" leftDot="w-3 h-3 bg-gray-400 rounded-sm" />

                                {/* Cab type */}
                                <div className="grid grid-cols-2 gap-2">
                                    {[{ key: 'ECONOMY', label: 'Economy', base: 50, rate: 15, emoji: '🚗' }, { key: 'LUXURY', label: 'Luxury', base: 100, rate: 28, emoji: '🚙' }].map((c) => {
                                        const est = estKm != null ? Math.round(Math.max(c.base, estKm * c.rate)) : null;
                                        const active = cabType === c.key;
                                        return (
                                            <button type="button" key={c.key} onClick={() => setCabType(c.key)}
                                                className={`text-left p-3 rounded-xl border-2 transition ${active ? 'border-primary bg-pink-50' : 'border-gray-100 bg-gray-50 hover:border-pink-200'}`}>
                                                <div className="text-lg leading-none mb-1">{c.emoji}</div>
                                                <div className="font-bold text-sm text-gray-900">{c.label}</div>
                                                <div className="text-xs text-gray-500">{est != null ? `~₹${est}` : `from ₹${c.base}`}</div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {routeInfo && (
                                    <p className="text-xs text-gray-500 text-center">Approx {routeInfo.km.toFixed(1)} km · {routeInfo.min} min by road</p>
                                )}

                                <button type="submit" disabled={submitting}
                                    className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-accent transition transform active:scale-95 shadow-lg shadow-pink-200 disabled:opacity-60 disabled:cursor-not-allowed">
                                    {submitting ? 'Requesting…' : 'Request Ride'}
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-5">
                                <div className={`flex items-center gap-3 p-3 rounded-xl border ${ride.status === 'REQUESTED' ? 'bg-yellow-50 border-yellow-100 text-yellow-800' :
                                    ride.status === 'DRIVER_ASSIGNED' ? 'bg-blue-50 border-blue-100 text-blue-800' :
                                        ride.status === 'STARTED' ? 'bg-indigo-50 border-indigo-100 text-indigo-800' :
                                            ride.status === 'COMPLETED' ? 'bg-green-50 border-green-100 text-green-800' : 'bg-gray-50 border-gray-100 text-gray-800'}`}>
                                    <div className="animate-pulse w-2 h-2 rounded-full bg-current"></div>
                                    <span className="font-bold tracking-wide text-sm uppercase">{ride.status.replace('_', ' ')}</span>
                                </div>

                                {assignedDriver && ['DRIVER_ASSIGNED', 'STARTED'].includes(ride.status) && (
                                    <div className="bg-pink-50 border border-pink-100 rounded-xl p-3 space-y-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">{assignedDriver.name?.charAt(0) || 'D'}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate">{assignedDriver.name}</p>
                                                <p className="text-xs text-gray-500">Your driver{assignedDriver.phoneNumber ? ` · ${assignedDriver.phoneNumber}` : ''}</p>
                                                {driverRatingInfo && (
                                                    <p className="text-xs font-bold text-yellow-600 mt-0.5">
                                                        {driverRatingInfo.count > 0 ? `★ ${driverRatingInfo.average} · ${driverRatingInfo.count} trip${driverRatingInfo.count === 1 ? '' : 's'}` : '★ New driver'}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {driverLocation && (() => {
                                            const target = ride.status === 'STARTED' ? [ride.dropLatitude, ride.dropLongitude] : [ride.pickupLatitude, ride.pickupLongitude];
                                            const km = distanceKm(driverLocation, target);
                                            if (km == null) return null;
                                            const min = Math.max(1, Math.round((km / 22) * 60)); // ~22 km/h city average
                                            return (
                                                <div className="flex items-center gap-2 text-xs font-bold text-primary bg-white rounded-lg px-2.5 py-1.5">
                                                    <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-primary opacity-60"></span><span className="relative rounded-full h-2 w-2 bg-primary"></span></span>
                                                    {ride.status === 'STARTED' ? `~${min} min to destination · ${km.toFixed(1)} km` : `Arriving in ~${min} min · ${km.toFixed(1)} km away`}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}

                                <div className="space-y-3 text-sm">
                                    <div><p className="text-xs text-gray-500 uppercase font-bold">From</p><p className="font-medium text-gray-900">{ride.pickupLocation}</p></div>
                                    <div><p className="text-xs text-gray-500 uppercase font-bold">To</p><p className="font-medium text-gray-900">{ride.dropLocation}</p></div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center">
                                    <div><p className="text-xs text-gray-500 uppercase font-bold">Fare · {ride.cabType === 'LUXURY' ? 'Luxury' : 'Economy'}</p><p className="text-xl font-bold text-gray-900">₹{Math.round(ride.fare)}</p></div>
                                    {ride.otp && !['COMPLETED', 'PAID', 'CANCELLED'].includes(ride.status) && <div className="text-right"><p className="text-xs text-gray-500 uppercase font-bold">OTP</p><p className="text-2xl font-mono font-bold tracking-widest text-black">{ride.otp}</p></div>}
                                </div>

                                {ride.status === 'REQUESTED' && (
                                    <button onClick={handleCancelRide}
                                        className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 py-3 rounded-xl font-bold hover:bg-red-600 hover:text-white transition">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                                        Cancel Request
                                    </button>
                                )}

                                {ride.status === 'COMPLETED' && (
                                    <button onClick={handlePayment} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 shadow-lg transition">Pay ₹{Math.round(ride.fare)}</button>
                                )}

                                {ride.status === 'PAID' && (
                                    <div className="text-center">
                                        <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <p className="text-gray-900 font-bold mb-4">You've arrived. Thank you!</p>

                                        {ride.driverRating ? (
                                            <div className="mb-4">
                                                <p className="text-xs text-gray-500 mb-1">You rated this trip</p>
                                                <div className="flex justify-center"><StarRating value={ride.driverRating} size="w-6 h-6" /></div>
                                            </div>
                                        ) : (
                                            <div className="mb-4 bg-gray-50 rounded-xl p-4">
                                                <p className="text-sm font-semibold text-gray-700 mb-2">Rate your driver</p>
                                                <div className="flex justify-center mb-3"><StarRating value={ratingValue} onChange={setRatingValue} /></div>
                                                <textarea value={ratingFeedback} onChange={(e) => setRatingFeedback(e.target.value)} rows={2} placeholder="Add a note (optional)"
                                                    className="w-full text-sm p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none mb-3" />
                                                <button onClick={submitRating} disabled={ratingSubmitting}
                                                    className="w-full bg-primary text-white py-2.5 rounded-lg font-bold hover:bg-accent transition disabled:opacity-60">
                                                    {ratingSubmitting ? 'Submitting…' : 'Submit rating'}
                                                </button>
                                            </div>
                                        )}

                                        <button onClick={startFresh} className="text-sm font-bold text-primary hover:underline">Book another ride</button>
                                    </div>
                                )}

                                {ride.status === 'CANCELLED' && (
                                    <div className="text-center">
                                        <div className="w-14 h-14 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </div>
                                        <p className="text-gray-900 font-bold mb-1">This ride was cancelled.</p>
                                        <p className="text-sm text-gray-500 mb-4">No charge was made.</p>
                                        <button onClick={startFresh} className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-accent transition">Book a new ride</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiderHome;
