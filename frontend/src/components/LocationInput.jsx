import React, { useState, useEffect, useRef } from 'react';

// Debounced location autocomplete via Nominatim (OpenStreetMap).
// `onChange(text)` fires while typing; `onSelect({label, lat, lon})` on pick.
export default function LocationInput({ value, onChange, onSelect, placeholder, leftDot }) {
    const [suggestions, setSuggestions] = useState([]);
    const [open, setOpen] = useState(false);
    const boxRef = useRef(null);
    const skipNextFetch = useRef(false);

    useEffect(() => {
        const onDoc = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', onDoc);
        return () => document.removeEventListener('mousedown', onDoc);
    }, []);

    useEffect(() => {
        if (skipNextFetch.current) { skipNextFetch.current = false; return; }
        const q = (value || '').trim();
        if (q.length < 3) { setSuggestions([]); setOpen(false); return; }
        const handle = setTimeout(async () => {
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(q)}`);
                const data = await res.json();
                setSuggestions(Array.isArray(data) ? data : []);
                setOpen(true);
            } catch { setSuggestions([]); }
        }, 400);
        return () => clearTimeout(handle);
    }, [value]);

    const pick = (s) => {
        skipNextFetch.current = true; // don't re-search the text we just filled in
        onSelect({ label: s.display_name, lat: parseFloat(s.lat), lon: parseFloat(s.lon) });
        setOpen(false);
        setSuggestions([]);
    };

    return (
        <div className="relative" ref={boxRef}>
            {leftDot && <div className={`absolute left-3 top-3.5 z-10 ${leftDot}`}></div>}
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && setOpen(true)}
                autoComplete="off"
                className={`${leftDot ? 'pl-10' : 'pl-4'} w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary text-gray-800 font-medium placeholder-gray-400`}
                placeholder={placeholder}
            />
            {open && suggestions.length > 0 && (
                <ul className="absolute z-[1100] mt-1 w-full bg-white rounded-xl shadow-xl border border-gray-100 max-h-56 overflow-y-auto">
                    {suggestions.map((s) => (
                        <li key={s.place_id}>
                            <button type="button" onClick={() => pick(s)}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-pink-50 border-b border-gray-50 last:border-0">
                                {s.display_name}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
