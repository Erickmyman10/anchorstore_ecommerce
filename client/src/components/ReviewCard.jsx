import { useCallback } from 'react';
import { ThumbsUp, ThumbsDown, CheckCircle2 } from 'lucide-react';
import StarRating from './StarRating';
import useReviewStore from '../store/useReviewStore';

const ReviewCard = ({ review }) => {
  const likeReview    = useReviewStore((s) => s.likeReview);
  const dislikeReview = useReviewStore((s) => s.dislikeReview);
  const vote          = useReviewStore((s) => s.votedReviews[review.id]);

  const handleLike    = useCallback(() => likeReview(review.id),    [review.id, likeReview]);
  const handleDislike = useCallback(() => dislikeReview(review.id), [review.id, dislikeReview]);

  const date = new Date(review.createdAt).toLocaleDateString('en-NG', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  const initials = review.name
    ?.split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card hover:shadow-card-hover transition-shadow duration-200">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 font-extrabold text-sm shrink-0 select-none">
            {initials}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-extrabold text-sm text-gray-900 truncate">{review.name}</p>
              {review.verified && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified Purchase
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">{date}</p>
          </div>
        </div>

        <StarRating rating={review.rating} size="sm" />
      </div>

      {/* ── Title + Comment ── */}
      {review.title && (
        <p className="font-bold text-sm text-gray-800 mb-1">{review.title}</p>
      )}
      <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>

      {/* ── Like / Dislike ── */}
      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-50">
        <span className="text-xs text-gray-400 font-medium">Helpful?</span>

        <button
          onClick={handleLike}
          disabled={!!vote}
          aria-label="Mark as helpful"
          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200 ${
            vote === 'like'
              ? 'bg-brand-50 text-brand-600 cursor-default'
              : vote
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          {review.likes ?? 0}
        </button>

        <button
          onClick={handleDislike}
          disabled={!!vote}
          aria-label="Mark as not helpful"
          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200 ${
            vote === 'dislike'
              ? 'bg-red-50 text-red-500 cursor-default'
              : vote
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <ThumbsDown className="w-3.5 h-3.5" />
          {review.dislikes ?? 0}
        </button>
      </div>
    </div>
  );
};

export default ReviewCard;
