import { Star, StarHalf } from 'lucide-react';

const Rating = ({ value = 0, numReviews, color = '#fbbf24', size = 20 }) => {
    return (
        <div className="flex items-center gap-1">
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="inline-block">
                        {value >= star ? (
                            <Star
                                size={size}
                                fill={color}
                                stroke={color}
                            />
                        ) : value >= star - 0.5 ? (
                            <StarHalf
                                size={size}
                                fill={color}
                                stroke={color}
                            />
                        ) : (
                            <Star
                                size={size}
                                stroke={color}
                                fill="none"
                            />
                        )}
                    </span>
                ))}
            </div>
            {numReviews !== undefined && (
                <span className="text-sm text-gray-600 ml-1">
                    ({numReviews} {numReviews === 1 ? 'reseña' : 'reseñas'})
                </span>
            )}
        </div>
    );
};

export default Rating;


