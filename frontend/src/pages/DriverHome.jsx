import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingService, driverService } from '../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Custom Icons
const greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const DriverHome = () => {
    const { user, logout } = useAuth();
    const [availableRides, setAvailableRides] = useState([]);
    const [activeRide, setActiveRide] = useState(null);
    const [otp, setOtp] = useState('');
    const [isOnline, setIsOnline] = useState(user?.isAvailable || false);
    const [currentLocation, setCurrentLocation] = useState(null);

    // Initial Location & Availability Sync
    useEffect(() => {
        if (user?.isAvailable) setIsOnline(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setCurrentLocation([latitude, longitude]);
                // Send initial location
                if (user?.id) {
                    driverService.updateLocation(user.id, latitude, longitude).catch(console.error);
                }
            },
            err => console.error(err)
        );
    }, [user]);

    // Poll for Rides & Update Location
    useEffect(() => {
        const interval = setInterval(() => {
            fetchRides();
            // Periodically update location if online
            if (isOnline && user?.id) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        driverService.updateLocation(user.id, pos.coords.latitude, pos.coords.longitude).catch(console.error);
                    },
                    err => console.error(err)
                );
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [isOnline]); // Depend on isOnline to toggle location updates? actually keep it simple

    const toggleOnline = async () => {
        try {
            const updatedUser = await driverService.toggleAvailability(user.id, isOnline);
            setIsOnline(updatedUser.isAvailable);
            alert(updatedUser.isAvailable ? 'You are now ONLINE' : 'You are now OFFLINE');
        } catch (error) {
            console.error(error);
            alert('Failed to toggle status');
        }
    };

    const fetchRides = async () => {
        if (!isOnline && !activeRide) {
            setAvailableRides([]);
            return;
        }
        try {
            const myRides = await bookingService.getMyRides(user.id, user.role);
            const ongoing = myRides.find(r =>
                ['DRIVER_ASSIGNED', 'STARTED'].includes(r.status)
            );

            if (ongoing) {
                setActiveRide(ongoing);
            } else {
                setActiveRide(null);
                // Only fetch new rides if online and no active ride
                if (isOnline) {
                    const available = await bookingService.getAvailableRides();
                    setAvailableRides(available);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleAccept = async (rideId) => {
        try {
            const ride = await bookingService.acceptRide(rideId, user.id);
            setActiveRide(ride);
            alert('Ride Accepted!');
            fetchRides(); // refresh
        } catch (error) {
            console.error(error);
            alert('Failed to accept ride');
        }
    };

    const handleStartRide = async () => {
        try {
            const ride = await bookingService.startRide(activeRide.id, otp);
            setActiveRide(ride);
            alert('Ride Started!');
        } catch (error) {
            console.error(error);
            alert('Failed to start ride. check OTP.');
        }
    };

    const handleCompleteRide = async () => {
        try {
            const ride = await bookingService.completeRide(activeRide.id);
            setActiveRide(null); // Clear active ride locally, though polling will confirm
            alert('Ride Completed!');
            fetchRides();
        } catch (error) {
            console.error(error);
            alert('Failed to complete ride');
        }
    };

    return (
        <div className="h-screen flex flex-col bg-background font-sans">
            <header className="bg-white shadow-sm p-5 flex justify-between items-center z-10">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold tracking-tight text-primary">HerWayCabs Driver</h1>
                    <button
                        onClick={toggleOnline}
                        className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${isOnline ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                    >
                        {isOnline ? 'Online' : 'Offline'}
                    </button>
                    {isOnline && <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>}
                </div>
                <div className="flex items-center gap-4">
                    <p className="font-medium text-gray-700">{user?.name}</p>
                    <button onClick={logout} className="text-accent font-semibold text-sm hover:underline">Logout</button>
                </div>
            </header>

            <div className="flex-1 p-8 max-w-6xl mx-auto w-full overflow-auto">
                {activeRide ? (
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-pink-100 max-w-3xl mx-auto">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-900">Current Trip</h2>
                            <span className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm tracking-wide">
                                #{activeRide.id}
                            </span>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-8">
                            {/* Map Visualization */}
                            <div className="h-64 w-full mb-6 rounded-lg overflow-hidden border border-gray-300 shadow-inner relative z-0">
                                <MapContainer
                                    center={[activeRide.pickupLatitude || 51.505, activeRide.pickupLongitude || -0.09]}
                                    zoom={13}
                                    scrollWheelZoom={false}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    {activeRide.pickupLatitude && (
                                        <Marker position={[activeRide.pickupLatitude, activeRide.pickupLongitude]} icon={greenIcon}>
                                            <Popup><strong>Pickup:</strong> {activeRide.pickupLocation}</Popup>
                                        </Marker>
                                    )}
                                    {activeRide.dropLatitude && (
                                        <Marker position={[activeRide.dropLatitude, activeRide.dropLongitude]} icon={redIcon}>
                                            <Popup><strong>Drop:</strong> {activeRide.dropLocation}</Popup>
                                        </Marker>
                                    )}
                                </MapContainer>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Pickup Location</p>
                                    <p className="text-lg font-semibold text-gray-900">{activeRide.pickupLocation}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Time Requested</p>
                                    <p className="text-lg font-semibold text-gray-900">Just now</p>
                                </div>
                                <div className="col-span-2 pt-4 border-t border-gray-200">
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Drop Location</p>
                                    <p className="text-xl font-bold text-gray-900">{activeRide.dropLocation}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div className="bg-green-50 p-4 rounded-xl">
                                <p className="text-sm font-bold text-green-700">Estimated Fare</p>
                                <p className="text-3xl font-extrabold text-green-800">₹{activeRide.fare}</p>
                            </div>
                            <div className="bg-pink-50 p-4 rounded-xl">
                                <p className="text-sm font-bold text-pink-700">Passenger</p>
                                <p className="text-2xl font-bold text-pink-800">{activeRide.rider?.name || 'Guest'}</p>
                            </div>
                        </div>

                        {activeRide.status === 'DRIVER_ASSIGNED' && (
                            <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                                <label className="block text-sm font-bold text-yellow-800 mb-2">Departing? Enter OTP</label>
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value)}
                                        className="block w-full text-center tracking-[1em] text-2xl font-bold bg-white border-2 border-yellow-300 rounded-lg shadow-sm p-4 focus:ring-4 focus:ring-yellow-200 focus:border-yellow-400 outline-none"
                                        placeholder="0000"
                                        maxLength={4}
                                    />
                                    <button onClick={handleStartRide} className="bg-primary text-white px-8 rounded-lg font-bold hover:bg-accent transition shadow-lg whitespace-nowrap shadow-pink-200">
                                        Start Ride
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeRide.status === 'STARTED' && (
                            <button onClick={handleCompleteRide} className="w-full bg-red-600 text-white py-6 rounded-xl hover:bg-red-700 font-extrabold text-2xl shadow-xl transition transform hover:scale-[1.01]">
                                End Trip
                            </button>
                        )}

                        {['COMPLETED', 'PAID'].includes(activeRide.status) && (
                            <div className="text-center py-8">
                                <p className="text-gray-500 font-medium">Waiting for payment/rating...</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">Available Requests</h2>
                                <p className="text-gray-500 mt-1">There are {availableRides.length} rides near you.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {availableRides.length === 0 ? (
                                <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                    </div>
                                    <p className="text-gray-500 font-medium">Searching for nearby riders...</p>
                                </div>
                            ) : (
                                availableRides.map(ride => (
                                    <div key={ride.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-black/5 transition duration-300 group">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">#{ride.id}</span>
                                            <span className="text-green-600 text-lg font-bold">₹{ride.fare}</span>
                                        </div>

                                        <div className="space-y-4 mb-6">
                                            <div>
                                                <p className="text-xs text-gray-400 font-bold uppercase">Pickup</p>
                                                <p className="font-semibold text-gray-900 truncate">{ride.pickupLocation}</p>
                                            </div>
                                            <div className="relative pl-3 border-l-2 border-gray-100">
                                                <p className="text-xs text-gray-400 font-bold uppercase">Drop</p>
                                                <p className="font-semibold text-gray-900 truncate">{ride.dropLocation}</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleAccept(ride.id)}
                                            className="w-full bg-white border-2 border-primary text-primary font-bold py-3 rounded-xl hover:bg-primary hover:text-white transition group-hover:bg-primary group-hover:text-white"
                                        >
                                            Accept Request
                                        </button>
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
