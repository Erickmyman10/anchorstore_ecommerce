import { useState, useCallback } from 'react';
import { Send } from 'lucide-react';
import StarRating from './StarRating';
import useReviewStore from '../store/useReviewStore';
import useAuthStore from '../store/useAuthStore';

const ReviewForm = ({ productId }) => {
  const addReview = useReviewStore((s) => s.addReview);
  const customer  = useAuthStore((s) => s.customer);
  const user      = useAuthStore((s) => s.user);

  const [rating,     setRating]     = useState(0);
  const [name,       setName]       = useState(customer?.name ?? '');
  const [title,      setTitle]      = useState('');
  const [comment,    setComment]    = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState(false);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!rating)       { setError('Please select a star rating.');   return; }
    if (!name.trim())  { setError('Please enter your name.');        return; }
    if (!comment.trim()){ setError('Please write a comment.');       return; }

    setSubmitting(true);
    setError('');

    try {
      await addReview(productId, {
        customerId: user?.id ?? `guest-${Date.now()}`,
        name:       name.trim(),
        title:      title.trim(),
        comment:    comment.trim(),
        rating,
        verified:   !!user,
      });
      setSuccess(true);
      setRating(0);
      setTitle('');
      setComment('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err?.message ?? 'Could not submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [addReview, productId, rating, name, title, comment, user]);

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card"
      noValidate
    >
      <h3 className="text-lg font-extrabold text-gray-900 mb-5">Write a Review</h3>

      {/* Star input */}
      <div className="mb-5">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Your Rating <span className="text-red-400">*</span>
        </label>
        <StarRating rating={rating} size="lg" mode="input" onChange={setRating} />
      </div>

      {/* Name */}
      <div className="mb-4">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Tunde Lawal"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all"
        />
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Review Title <span className="text-gray-300 font-normal normal-case tracking-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Great value for money"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all"
        />
      </div>

      {/* Comment */}
      <div className="mb-5">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Your Review <span className="text-red-400">*</span>
        </label>
        <textarea
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your honest experience with this product..."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm placeholder:text-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all"
        />
      </div>

      {/* Error / Success feedback */}
      {error && (
        <p className="text-sm text-red-500 font-semibold mb-4 flex items-center gap-1.5">
          <span>⚠</span> {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-600 font-semibold mb-4 flex items-center gap-1.5">
          <span>✓</span> Review submitted successfully. Thank you!
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-500 text-white rounded-xl font-extrabold text-sm hover:bg-brand-600 active:scale-[0.97] transition-all duration-200 shadow-brand disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Send className="w-4 h-4" />
        {submitting ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  );
};

export default ReviewForm;
