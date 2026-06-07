import { create } from 'zustand';
import db, { COL } from '../services/db';
import { createReview } from '../models';

const useReviewStore = create((set) => ({
  // Reviews for the currently viewed product
  reviews: [],

  // ── Load reviews for a product ─────────────────────────────────────────
  loadReviews: (productId) => {
    const reviews = db
      .findMany(COL.REVIEWS, (r) => r.productId === productId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    set({ reviews });
  },

  // ── Submit a review ────────────────────────────────────────────────────
  // Returns the saved review or null if the customer already reviewed this product.
  addReview: ({ productId, customerId, rating, comment }) => {
    const existing = db.findOne(
      COL.REVIEWS,
      (r) => r.productId === productId && r.customerId === customerId
    );
    if (existing) return null;

    const review = db.insert(COL.REVIEWS, createReview({ productId, customerId, rating, comment }));
    set((s) => ({ reviews: [review, ...s.reviews] }));
    return review;
  },

  // ── Edit an existing review ────────────────────────────────────────────
  editReview: (reviewId, { rating, comment }) => {
    const updated = db.update(COL.REVIEWS, reviewId, { rating, comment });
    if (!updated) return null;
    set((s) => ({
      reviews: s.reviews.map((r) => (r.id === reviewId ? updated : r)),
    }));
    return updated;
  },

  // ── Delete a review ────────────────────────────────────────────────────
  deleteReview: (reviewId) => {
    db.remove(COL.REVIEWS, reviewId);
    set((s) => ({ reviews: s.reviews.filter((r) => r.id !== reviewId) }));
  },

  clearReviews: () => set({ reviews: [] }),
}));

// ── Selectors ────────────────────────────────────────────────────────────────
export const selectAverageRating = (s) => {
  if (!s.reviews.length) return 0;
  return s.reviews.reduce((sum, r) => sum + r.rating, 0) / s.reviews.length;
};

export default useReviewStore;
