import { useState } from 'react';
import { Star } from 'lucide-react';

const SIZES = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-7 h-7' };

// mode="display" — read-only, rounds to nearest star
// mode="input"   — interactive, hover preview, fires onChange(1-5)
const StarRating = ({ rating = 0, count, size = 'md', mode = 'display', onChange }) => {
  const [hovered, setHovered] = useState(null);
  const starClass = SIZES[size] ?? SIZES.md;

  if (mode === 'input') {
    const active = hovered ?? rating;
    return (
      <div
        className="flex items-center gap-1"
        onMouseLeave={() => setHovered(null)}
        role="group"
        aria-label="Select star rating"
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange?.(i + 1)}
            onMouseEnter={() => setHovered(i + 1)}
            aria-label={`${i + 1} star${i !== 0 ? 's' : ''}`}
            className="focus:outline-none transition-transform duration-100 hover:scale-110"
          >
            <Star
              className={`${starClass} transition-colors duration-100 ${
                i < active
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-gray-100 text-gray-300'
              }`}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm font-bold text-gray-500">{rating}/5</span>
        )}
      </div>
    );
  }

  const filled = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5 flex-wrap">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`${starClass} ${
              i < filled ? 'fill-amber-400 text-amber-400' : 'fill-gray-100 text-gray-200'
            }`}
          />
        ))}
      </div>
      {rating > 0 && (
        <span className={`font-bold text-gray-700 ml-1 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          {Number(rating).toFixed(1)}
        </span>
      )}
      {count != null && (
        <span className={`text-gray-400 ml-0.5 ${size === 'sm' ? 'text-[11px]' : 'text-sm'}`}>
          ({typeof count === 'number' ? count.toLocaleString() : count})
        </span>
      )}
    </div>
  );
};

export default StarRating;
