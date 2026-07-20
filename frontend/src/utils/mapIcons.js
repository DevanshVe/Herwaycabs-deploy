import L from 'leaflet';

// Self-contained SVG pin markers — no external image URLs (previously loaded
// green/red PNGs from a third-party GitHub repo + CDN, which could fail/be slow).
const pin = (color) =>
    L.divIcon({
        className: 'hwc-pin',
        html: `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="42" viewBox="0 0 24 34">
            <path fill="${color}" stroke="#ffffff" stroke-width="1.5"
                d="M12 .75C6 .75 1.5 5.4 1.5 11.25c0 7.9 10.5 22 10.5 22s10.5-14.1 10.5-22C22.5 5.4 18 .75 12 .75z"/>
            <circle cx="12" cy="11.5" r="4" fill="#ffffff"/></svg>`,
        iconSize: [30, 42],
        iconAnchor: [15, 42],
        popupAnchor: [0, -38],
    });

export const pickupIcon = pin('#16a34a'); // green
export const dropIcon = pin('#dc2626');   // red
export const driverIcon = pin('#db2777'); // pink
