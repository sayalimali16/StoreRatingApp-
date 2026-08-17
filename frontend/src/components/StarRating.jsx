import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ 
  rating = 0, 
  interactive = false, 
  onRate = () => {}, 
  size = 18, 
  showValue = false 
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || rating || 0;

  if (interactive) {
    return (
      <div className="star-rating-interactive">
        {[1, 2, 3, 4, 5].map((starValue) => (
          <button
            key={starValue}
            type="button"
            className="star-button"
            onMouseEnter={() => setHoverRating(starValue)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => onRate(starValue)}
            title={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
          >
            <Star
              size={size}
              className={`star-icon ${starValue <= displayRating ? 'filled' : ''}`}
            />
          </button>
        ))}
        {showValue && (
          <span style={{ fontSize: '0.85rem', fontWeight: 600, marginLeft: 6, color: '#f59e0b' }}>
            {displayRating ? `${displayRating} / 5` : 'Select'}
          </span>
        )}
      </div>
    );
  }

  // Display-only read-only rating
  const numericRating = typeof rating === 'number' ? rating : parseFloat(rating) || 0;

  return (
    <div className="stars-wrapper">
      {[1, 2, 3, 4, 5].map((starValue) => {
        const isFilled = starValue <= Math.round(numericRating);
        return (
          <Star
            key={starValue}
            size={size}
            className={`star-icon ${isFilled ? 'filled' : ''}`}
          />
        );
      })}
      {showValue && (
        <span style={{ fontSize: '0.85rem', fontWeight: 700, marginLeft: 6, color: '#e2e8f0' }}>
          {numericRating > 0 ? numericRating.toFixed(2) : 'N/A'}
        </span>
      )}
    </div>
  );
};

export default StarRating;
