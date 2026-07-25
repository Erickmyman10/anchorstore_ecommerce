import { useState, useEffect, useMemo } from 'react';
import { Star, ShieldCheck, Trash2, Search, AlertTriangle, X } from 'lucide-react';
import db, { COL } from '../../services/db';

const ConfirmDialog = ({ review, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-red-50 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        <h3 className="font-bold text-gray-900">Delete Review?</h3>
      </div>
      <p className="text-sm text-gray-500 mb-5">
        Delete <span className="font-semibold text-gray-700">"{review?.title || 'this review'}"</span> by{' '}
        <span className="font-semibold text-gray-700">{review?.name}</span>? This cannot be undone.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">
          Cancel
        </button>
        <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600">
          Delete
        </button>
      </div>
    </div>
  </div>
);

const StarRating = ({ rating, size = 'sm' }) => {
  const w = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`${w} ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-100'}`} />
      ))}
    </div>
  );
};

const AdminReviews = () => {
  const [reviews,      setReviews]      = useState([]);
  const [search,       setSearch]       = useState('');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast,        setToast]        = useState('');

  useEffect(() => {
    const all = db.getAll(COL.REVIEWS)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setReviews(all);
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleDelete = () => {
    db.remove(COL.REVIEWS, deleteTarget.id);
    setReviews((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    showToast('Review deleted');
    setDeleteTarget(null);
  };

  const stats = useMemo(() => {
    if (!reviews.length) return { avg: 0, total: 0 };
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    return { avg: avg.toFixed(1), total: reviews.length };
  }, [reviews]);

  const filtered = useMemo(() => {
    let list = [...reviews];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) =>
        (r.name ?? '').toLowerCase().includes(q) ||
        (r.title ?? '').toLowerCase().includes(q) ||
        (r.comment ?? '').toLowerCase().includes(q) ||
        (r.productId ?? '').toLowerCase().includes(q)
      );
    }
    if (ratingFilter > 0) list = list.filter((r) => r.rating === ratingFilter);
    return list;
  }, [reviews, search, ratingFilter]);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-8">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-brand-500" />
            <span className="text-xs font-bold text-brand-500 uppercase tracking-widest">Admin Panel</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Review Management</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {stats.total} reviews · avg {stats.avg} ★
          </p>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-40 bg-gray-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {/* ── Star filter cards ── */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 mb-6 sm:mb-8">
        {[5, 4, 3, 2, 1].map((r) => {
          const count = reviews.filter((rv) => rv.rating === r).length;
          return (
            <button
              key={r}
              onClick={() => setRatingFilter(ratingFilter === r ? 0 : r)}
              className={`rounded-2xl border p-3 sm:p-4 text-left transition-all ${
                ratingFilter === r
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-white border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-center gap-0.5 mb-2">
                {[...Array(r)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-gray-900">{count}</p>
              <p className="text-xs text-gray-400 mt-0.5">{r} star{r !== 1 ? 's' : ''}</p>
            </button>
          );
        })}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, title, comment…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>
        {ratingFilter > 0 && (
          <button
            onClick={() => setRatingFilter(0)}
            className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg font-semibold hover:bg-amber-100 self-start sm:self-auto"
          >
            {ratingFilter} ★ filter <X className="w-3 h-3" />
          </button>
        )}
        <span className="text-xs text-gray-400 sm:ml-auto self-center">
          Showing {filtered.length} of {reviews.length}
        </span>
      </div>

      {/* ── Review list ── */}
      {reviews.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Star className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="font-semibold text-gray-500">No reviews yet</p>
          <p className="text-sm mt-1">Reviews will appear here once customers leave them</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="font-semibold text-gray-500">No reviews match your filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
              <div className="flex gap-3 sm:gap-4">
                {/* Avatar */}
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-extrabold text-sm sm:text-base shrink-0">
                  {(review.name ?? 'A')[0].toUpperCase()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Top row: name/rating + delete */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-gray-900">{review.name ?? 'Anonymous'}</p>
                        {review.verified && (
                          <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">Verified</span>
                        )}
                      </div>
                      <StarRating rating={review.rating} />
                    </div>
                    <button
                      onClick={() => setDeleteTarget(review)}
                      className="p-1.5 rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {review.title && (
                    <p className="text-sm font-semibold text-gray-700 mt-0.5">{review.title}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5 font-mono break-all">
                    Product: {review.productId} &middot;{' '}
                    {new Date(review.createdAt).toLocaleDateString('en-NG', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </p>

                  {review.comment && (
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{review.comment}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    {review.likes    > 0 && <span>👍 {review.likes} helpful</span>}
                    {review.dislikes > 0 && <span>👎 {review.dislikes}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          review={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default AdminReviews;
