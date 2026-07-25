import { api } from './api';

export const fetchReviews = async (productId) =>
  api.request(`/reviews/${productId}`);

// Returns reviews the logged-in user wrote. Falls back to [] if not authenticated.
export const fetchUserReviews = async () => {
  try {
    return await api.request('/reviews/user/me');
  } catch {
    return [];
  }
};

export const createReview = async (productId, { name, title, rating, comment, verified }) =>
  api.request(`/reviews/${productId}`, {
    method: 'POST',
    body: JSON.stringify({ name, title, rating, comment, verified }),
  });

export const likeReview = async (reviewId) =>
  api.request(`/reviews/${reviewId}/like`, { method: 'POST' });

export const dislikeReview = async (reviewId) =>
  api.request(`/reviews/${reviewId}/dislike`, { method: 'POST' });

export const editReview = async (reviewId, { rating, title, comment }) =>
  api.request(`/reviews/${reviewId}`, {
    method: 'PATCH',
    body: JSON.stringify({ rating, title, comment }),
  });

export const deleteReview = async (reviewId) =>
  api.request(`/reviews/${reviewId}`, { method: 'DELETE' });
