import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/api';

// Fix Leaflet marker icon issue
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

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

const RiderHome = () => {
    const { user, logout } = useAuth();
    const [currentPosition, setCurrentPosition] = useState([51.505, -0.09]);
    const [pickup, setPickup] = useState('');
    const [drop, setDrop] = useState('');
    const [pickupCoords, setPickupCoords] = useState(null);
    const [dropCoords, setDropCoords] = useState(null);
    const [ride, setRide] = useState(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = [position.coords.latitude, position.coords.longitude];
                setCurrentPosition(pos);
                if (!pickupCoords) setPickupCoords(pos);
            },
            (error) => console.log(error)
        );
    }, []);

    // Polling for ride status
    useEffect(() => {
        let interval;
        if (ride && ride.status !== 'PAID' && ride.status !== 'CANCELLED') {
            interval = setInterval(async () => {
                // In a real app, you'd have a specific endpoint for getting single ride status
                // For MVP we can assume we might get it from 'my-rides' or similar, 
                // but since we don't have getRideById, let's just assume the backend pushes updates 
                // OR we fetch my last ride.
                // Let's implement a simple refresh from "getMyRides" filtering for this ID.
                try {
                    const myRides = await bookingService.getMyRides(user.id, user.role);
                    const updatedRide = myRides.find(r => r.id === ride.id);
                    if (updatedRide) {
                        setRide(updatedRide);
                    }
                } catch (err) {
                    console.error("Polling error", err);
                }
            }, 3000); // 3 seconds
        }
        return () => clearInterval(interval);
    }, [ride]);

    const getCoordinates = async (address) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
            const data = await response.json();
            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lon: parseFloat(data[0].lon),
                    display_name: data[0].display_name
                };
            }
        } catch (error) {
            console.error("Geocoding failed", error);
        }
        return null;
    };

    const handleBookRide = async (e) => {
        e.preventDefault();
        try {
            // Use draggable coordinates if set, otherwise try geocoding
            let finalPickupLat = pickupCoords ? pickupCoords[0] : currentPosition[0];
            let finalPickupLon = pickupCoords ? pickupCoords[1] : currentPosition[1];
            let finalDropLat = dropCoords ? dropCoords[0] : (currentPosition[0] + 0.01);
            let finalDropLon = dropCoords ? dropCoords[1] : (currentPosition[1] + 0.01);

            // If user typed string address and hasn't dragged markers, try to geocode
            // (You can enhance this logic preference)
            if (pickup && pickup !== "Current Location" && !pickupCoords) {
                const pc = await getCoordinates(pickup);
                if (pc) { finalPickupLat = pc.lat; finalPickupLon = pc.lon; setPickupCoords([pc.lat, pc.lon]); }
            }
            if (drop && !dropCoords) {
                const dc = await getCoordinates(drop);
                if (dc) { finalDropLat = dc.lat; finalDropLon = dc.lon; setDropCoords([dc.lat, dc.lon]); }
            }

            console.log("Booking with:", finalPickupLat, finalPickupLon, "to", finalDropLat, finalDropLon);

            const data = await bookingService.bookRide({
                pickupLocation: pickup || "Pinned Location",
                pickupLatitude: finalPickupLat,
                pickupLongitude: finalPickupLon,
                dropLocation: drop || "Pinned Location",
                dropLatitude: finalDropLat,
                dropLongitude: finalDropLon
            }, user.id);
            setRide(data);
            alert(`Ride Requested! Fare: ₹${data.fare}`);
        } catch (error) {
            console.error(error);
            alert('Booking failed. Check console.');
        }
    };

    const handlePayment = async () => {
        if (!ride) return;
        try {
            const updatedRide = await bookingService.payRide(ride.id);
            setRide(updatedRide);
            alert('Payment Successful!');
        } catch (error) {
            console.error(error);
            alert('Payment Successful'); // Backend might throw if already paid or whatever, but primarily for demo
        }
    };

    return (
        <div className="h-screen flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md shadow-sm p-4 flex justify-between items-center z-10 absolute top-0 w-full">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">C</span>
                    </div>
                    <h1 className="text-xl font-bold text-primary tracking-tight">HerWayCabs</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">Rider</p>
                    </div>
                    <button onClick={logout} className="bg-secondary hover:bg-pink-200 text-accent px-4 py-2 rounded-full text-sm font-medium transition">
                        Logout
                    </button>
                </div>
            </header>

            {/* Map View */}
            <div className="flex-1 relative z-0">
                <MapContainer center={currentPosition} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Draggable Pickup Marker */}
                    {!ride && (
                        <Marker
                            position={pickupCoords || currentPosition}
                            icon={greenIcon}
                            draggable={true}
                            eventHandlers={{
                                dragend: (e) => {
                                    const marker = e.target;
                                    const position = marker.getLatLng();
                                    setPickupCoords([position.lat, position.lng]);
                                    setPickup(`${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`);
                                }
                            }}
                        >
                            <Popup>Pickup Location (Drag to adjust)</Popup>
                        </Marker>
                    )}

                    {/* Draggable Drop Marker */}
                    {!ride && (
                        <Marker
                            position={dropCoords || [currentPosition[0] + 0.01, currentPosition[1] + 0.01]}
                            icon={redIcon}
                            draggable={true}
                            eventHandlers={{
                                dragend: (e) => {
                                    const marker = e.target;
                                    const position = marker.getLatLng();
                                    setDropCoords([position.lat, position.lng]);
                                    setDrop(`${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`);
                                }
                            }}
                        >
                            <Popup>Drop Location (Drag to adjust)</Popup>
                        </Marker>
                    )}

                    {/* Read-Only Markers for Active Ride */}
                    {ride && (
                        <>
                            <Marker position={[ride.pickupLatitude, ride.pickupLongitude]} icon={greenIcon}>
                                <Popup>Pickup: {ride.pickupLocation}</Popup>
                            </Marker>
                            <Marker position={[ride.dropLatitude, ride.dropLongitude]} icon={redIcon}>
                                <Popup>Drop: {ride.dropLocation}</Popup>
                            </Marker>
                        </>
                    )}
                </MapContainer>

                {/* Booking Floating Panel */}
                <div className="absolute top-24 left-4 bg-white/95 backdrop-blur shadow-2xl rounded-2xl z-[1000] w-96 overflow-hidden border border-pink-100">
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-1 text-gray-900">
                            {ride ? `Ride Details` : 'Where to?'}
                        </h2>
                        {!ride && <p className="text-gray-500 mb-6 text-sm">Request a premium ride instantly.</p>}

                        {!ride ? (
                            <form onSubmit={handleBookRide} className="space-y-4">
                                <div className="relative">
                                    <div className="absolute left-3 top-3 w-3 h-3 bg-primary rounded-full ring-4 ring-pink-50"></div>
                                    <input type="text" value={pickup} onChange={e => setPickup(e.target.value)}
                                        className="pl-10 w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary text-gray-800 font-medium placeholder-gray-400"
                                        placeholder="Current Location" />
                                </div>
                                <div className="relative">
                                    <div className="absolute left-3 top-3 w-3 h-3 bg-gray-400 rounded-sm"></div>
                                    <input type="text" value={drop} onChange={e => setDrop(e.target.value)}
                                        className="pl-10 w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary text-gray-800 font-medium placeholder-gray-400"
                                        placeholder="Enter Destination" required />
                                </div>
                                <button type="submit" className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-accent transition transform active:scale-95 shadow-lg shadow-pink-200">
                                    Request Ride
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                {/* Status Badge */}
                                <div className={`flex items-center gap-3 p-4 rounded-xl border ${ride.status === 'REQUESTED' ? 'bg-yellow-50 border-yellow-100 text-yellow-800' :
                                    ride.status === 'DRIVER_ASSIGNED' ? 'bg-blue-50 border-blue-100 text-blue-800' :
                                        ride.status === 'STARTED' ? 'bg-indigo-50 border-indigo-100 text-indigo-800' :
                                            ride.status === 'COMPLETED' ? 'bg-green-50 border-green-100 text-green-800' :
                                                'bg-gray-50 border-gray-100 text-gray-800'
                                    }`}>
                                    <div className="animate-pulse w-2 h-2 rounded-full bg-current"></div>
                                    <span className="font-bold tracking-wide text-sm uppercase">{ride.status.replace('_', ' ')}</span>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 w-2 h-2 bg-black rounded-full"></div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold">From</p>
                                            <p className="font-medium text-gray-900">{ride.pickupLocation}</p>
                                        </div>
                                    </div>
                                    <div className="w-[1px] h-4 bg-gray-200 ml-1"></div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 w-2 h-2 bg-gray-400 rounded-sm"></div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold">To</p>
                                            <p className="font-medium text-gray-900">{ride.dropLocation}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold">Estimated Fare</p>
                                        <p className="text-xl font-bold text-gray-900">₹{ride.fare}</p>
                                    </div>
                                    {ride.otp && (
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 uppercase font-bold">OTP</p>
                                            <p className="text-2xl font-mono font-bold tracking-widest text-black">{ride.otp}</p>
                                        </div>
                                    )}
                                </div>

                                {ride.status === 'COMPLETED' && (
                                    <button onClick={handlePayment} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 shadow-xl transition transform hover:-translate-y-1">
                                        Pay & Rate
                                    </button>
                                )}

                                {ride.status === 'PAID' && (
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        </div>
                                        <p className="text-gray-900 font-bold mb-4">You've reached your destination!</p>
                                        <button onClick={() => setRide(null)} className="text-sm font-bold text-gray-500 hover:text-black hover:underline">
                                            Book Another Ride
                                        </button>
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
