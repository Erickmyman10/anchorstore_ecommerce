import { create } from 'zustand';
import * as reviewService from '../services/reviewService';

const useReviewStore = create((set, get) => ({
  reviews: [],
  userReviews: [],
  loading: false,
  // { [reviewId]: 'like' | 'dislike' } — session only, not persisted
  votedReviews: {},

  // ── Load reviews for a product ─────────────────────────────────────────
  loadReviews: async (productId) => {
    set({ loading: true });
    const reviews = await reviewService.fetchReviews(productId);
    set({ reviews, loading: false });
  },

  // ── Load all reviews by a customer ────────────────────────────────────
  loadUserReviews: async (customerId) => {
    const userReviews = await reviewService.fetchUserReviews(customerId);
    set({ userReviews });
  },

  // ── Submit a new review ────────────────────────────────────────────────
  // Throws if the customer has already reviewed this product.
  addReview: async (productId, reviewData) => {
    const review = await reviewService.createReview(productId, reviewData);
    set((s) => ({ reviews: [review, ...s.reviews] }));
    return review;
  },

  // ── Like / Dislike (one vote per session per review) ──────────────────
  likeReview: async (reviewId) => {
    if (get().votedReviews[reviewId]) return;
    const updated = await reviewService.likeReview(reviewId);
    set((s) => ({
      reviews: s.reviews.map((r) => (r.id === reviewId ? updated : r)),
      votedReviews: { ...s.votedReviews, [reviewId]: 'like' },
    }));
  },

  dislikeReview: async (reviewId) => {
    if (get().votedReviews[reviewId]) return;
    const updated = await reviewService.dislikeReview(reviewId);
    set((s) => ({
      reviews: s.reviews.map((r) => (r.id === reviewId ? updated : r)),
      votedReviews: { ...s.votedReviews, [reviewId]: 'dislike' },
    }));
  },

  // ── Edit an existing review ────────────────────────────────────────────
  editReview: async (reviewId, patch) => {
    const updated = await reviewService.editReview(reviewId, patch);
    if (!updated) return null;
    set((s) => ({
      reviews: s.reviews.map((r) => (r.id === reviewId ? updated : r)),
    }));
    return updated;
  },

  // ── Delete a review ────────────────────────────────────────────────────
  deleteReview: async (reviewId) => {
    await reviewService.deleteReview(reviewId);
    set((s) => ({ reviews: s.reviews.filter((r) => r.id !== reviewId) }));
  },

  clearReviews: () => set({ reviews: [], votedReviews: {} }),
}));

// ── Selectors ────────────────────────────────────────────────────────────────
export const selectAverageRating = (s) => {
  if (!s.reviews.length) return 0;
  return s.reviews.reduce((sum, r) => sum + r.rating, 0) / s.reviews.length;
};

export const selectRatingBreakdown = (s) => {
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  s.reviews.forEach((r) => { counts[r.rating] = (counts[r.rating] ?? 0) + 1; });
  return counts;
};

export default useReviewStore;
