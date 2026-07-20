import React, { useState } from 'react';

// Star rating — interactive when `onChange` is provided, else read-only display.
export default function StarRating({ value = 0, onChange, size = 'w-8 h-8' }) {
    const [hover, setHover] = useState(0);
    const interactive = typeof onChange === 'function';

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
                const filled = (hover || value) >= star;
                return (
                    <button
                        key={star}
                        type="button"
                        disabled={!interactive}
                        onClick={() => interactive && onChange(star)}
                        onMouseEnter={() => interactive && setHover(star)}
                        onMouseLeave={() => interactive && setHover(0)}
                        className={interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}
                        aria-label={`${star} star${star > 1 ? 's' : ''}`}
                    >
                        <svg className={`${size} ${filled ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.447a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.54 1.118l-3.367-2.446a1 1 0 00-1.176 0l-3.367 2.446c-.784.57-1.838-.196-1.539-1.118l1.286-3.957a1 1 0 00-.363-1.118L2.076 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
                        </svg>
                    </button>
                );
            })}
        </div>
    );
}
