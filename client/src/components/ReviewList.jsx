import { useMemo } from 'react';
import { Star } from 'lucide-react';
import StarRating from './StarRating';
import ReviewCard from './ReviewCard';

const RatingBar = ({ star, count, total }) => {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xs font-bold text-gray-600 w-2 shrink-0">{star}</span>
      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 font-medium w-5 text-right shrink-0">{count}</span>
    </div>
  );
};

const ReviewSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="h-36 bg-gray-100 rounded-2xl animate-pulse" />
    ))}
  </div>
);

const ReviewList = ({ reviews = [], loading = false }) => {
  const average = useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  }, [reviews]);

  const breakdown = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => { counts[r.rating] = (counts[r.rating] ?? 0) + 1; });
    return counts;
  }, [reviews]);

  if (loading) return <ReviewSkeleton />;

  return (
    <section>
      <h2 className="text-xl font-extrabold text-gray-900 mb-6">
        Customer Reviews
        {reviews.length > 0 && (
          <span className="ml-2 text-base font-semibold text-gray-400">
            ({reviews.length})
          </span>
        )}
      </h2>

      {reviews.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-4xl mb-3">⭐</p>
          <p className="font-bold text-gray-700 mb-1">No reviews yet</p>
          <p className="text-sm text-gray-400">Be the first to share your experience</p>
        </div>
      ) : (
        <>
          {/* ── Rating summary card ── */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div className="text-center sm:border-r sm:border-gray-200 sm:pr-6">
              <p className="text-6xl font-extrabold text-gray-900 leading-none">
                {average.toFixed(1)}
              </p>
              <div className="mt-2">
                <StarRating rating={average} size="md" />
              </div>
              <p className="text-sm text-gray-400 mt-2 font-medium">
                Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="space-y-2.5">
              {[5, 4, 3, 2, 1].map((star) => (
                <RatingBar
                  key={star}
                  star={star}
                  count={breakdown[star]}
                  total={reviews.length}
                />
              ))}
            </div>
          </div>

          {/* ── Review cards ── */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default ReviewList;
