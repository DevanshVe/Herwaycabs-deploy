import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { safetyService } from '../services/api';
import Logo from '../components/Logo';
import { pickupIcon as greenIcon, dropIcon as redIcon, driverIcon } from '../utils/mapIcons';

const STATUS_LABEL = {
    REQUESTED: 'Finding a driver',
    DRIVER_ASSIGNED: 'Driver on the way',
    STARTED: 'On the trip',
    COMPLETED: 'Trip completed',
    PAID: 'Trip completed',
    CANCELLED: 'Ride cancelled',
};

// Public, no-login live tracking page for a shared ride.
export default function TrackRide() {
    const { token } = useParams();
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        const load = () => {
            safetyService.getTrack(token)
                .then((d) => { if (active) { setData(d); setError(''); } })
                .catch(() => { if (active) setError('This tracking link is invalid or has expired.'); })
                .finally(() => { if (active) setLoading(false); });
        };
        load();
        const iv = setInterval(load, 5000);
        return () => { active = false; clearInterval(iv); };
    }, [token]);

    const center = data?.driverLatitude != null ? [data.driverLatitude, data.driverLongitude]
        : data?.pickupLatitude != null ? [data.pickupLatitude, data.pickupLongitude]
            : [20.5937, 78.9629];

    return (
        <div className="h-screen flex flex-col">
            <header className="bg-white shadow-sm p-4 flex items-center gap-2 z-10">
                <Logo className="w-8 h-8" />
                <div>
                    <h1 className="text-lg font-bold text-primary leading-tight">HerWayCabs</h1>
                    <p className="text-xs text-gray-500">Live ride tracking</p>
                </div>
            </header>

            {loading ? (
                <div className="flex-1 flex items-center justify-center text-gray-500">Loading…</div>
            ) : error ? (
                <div className="flex-1 flex items-center justify-center text-red-500 px-6 text-center">{error}</div>
            ) : (
                <div className="flex-1 relative">
                    <MapContainer center={center} zoom={14} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {data.pickupLatitude != null && <Marker position={[data.pickupLatitude, data.pickupLongitude]} icon={greenIcon}><Popup>Pickup</Popup></Marker>}
                        {data.dropLatitude != null && <Marker position={[data.dropLatitude, data.dropLongitude]} icon={redIcon}><Popup>Drop</Popup></Marker>}
                        {data.driverLatitude != null && <Marker position={[data.driverLatitude, data.driverLongitude]} icon={driverIcon}><Popup>Driver</Popup></Marker>}
                    </MapContainer>

                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur shadow-xl rounded-2xl px-5 py-3 z-[1000] w-[22rem] max-w-[92vw] border border-pink-100">
                        <p className="text-xs font-bold text-primary uppercase tracking-wide">{STATUS_LABEL[data.status] || data.status}</p>
                        {data.driverName && (
                            <p className="text-sm font-bold text-gray-900 mt-0.5">
                                {data.driverName}{data.driverVehicleModel ? ` · ${data.driverVehicleModel}` : ''}{data.driverVehicleNumber ? ` (${data.driverVehicleNumber})` : ''}
                            </p>
                        )}
                        <div className="mt-2 text-xs text-gray-600 space-y-0.5">
                            <p className="truncate"><span className="text-gray-400">From </span>{data.pickupLocation}</p>
                            <p className="truncate"><span className="text-gray-400">To </span>{data.dropLocation}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
