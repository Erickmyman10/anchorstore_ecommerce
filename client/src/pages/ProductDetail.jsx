import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Minus, Plus, ShoppingCart, Heart,
  Truck, Shield, RotateCcw, Flame, Clock, Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useCartStore from '../store/useCartStore';
import useReviewStore from '../store/useReviewStore';
import { getProductById, formatNaira, toPsychPrice } from '../services/api';
import StarRating from '../components/StarRating';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';

// ── Urgency message pools (deterministic per product) ──────────────────────
const STOCK_MSGS = [
  (n) => `Only ${n} left in stock!`,
  (n) => `Hurry — just ${n} remaining`,
  (n) => `Low stock: ${n} units left`,
  (n) => `Almost sold out — ${n} left`,
];
const VIEWER_MSGS = [
  (n) => `${n} people viewing now`,
  (n) => `${n} shoppers are watching`,
  (n) => `${n} people have this open`,
  (n) => `${n} others looking at this`,
];

// ── Loading skeleton ───────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="aspect-square skeleton rounded-2xl" />
      <div className="space-y-4 pt-4">
        <div className="h-4 skeleton rounded-full w-1/4" />
        <div className="h-8 skeleton rounded-xl w-5/6" />
        <div className="h-6 skeleton rounded-xl w-3/4" />
        <div className="h-5 skeleton rounded-full w-1/3 mt-2" />
        <div className="h-14 skeleton rounded-xl mt-4" />
        <div className="h-12 skeleton rounded-xl" />
        <div className="h-12 skeleton rounded-xl" />
      </div>
    </div>
  </div>
);

// ── Main page ──────────────────────────────────────────────────────────────
const ProductDetail = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { addToCart, buyNow, cartItems } = useCartStore();
  const { reviews, loading: reviewsLoading, loadReviews } = useReviewStore();

  const [product,    setProduct]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [quantity,   setQuantity]   = useState(1);
  const [justAdded,  setJustAdded]  = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    setLoading(true);
    getProductById(id)
      .then((data) => { setProduct(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (id) loadReviews(id);
  }, [id, loadReviews]);

  if (loading) return <Skeleton />;

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <p className="text-gray-400 text-lg mb-4">Product not found.</p>
        <button onClick={() => navigate(-1)} className="text-brand-500 font-bold">
          ← Go back
        </button>
      </div>
    );
  }

  // Derive a stable integer from string CUIDs so modulo-based display logic works
  const idNum = typeof product.id === 'number'
    ? product.id
    : String(product.id).split('').reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) >>> 0, 0);

  const hasDiscount  = idNum % 4 !== 0;
  const discountPct  = hasDiscount ? [15, 20, 25, 30, 35][idNum % 5] : 0;
  const oldPrice     = hasDiscount ? product.unitPrice / (1 - discountPct / 100) : product.unitPrice;
  const stockLeft    = ((idNum * 7) % 8) + 3;
  const viewers      = ((idNum * 13) % 30) + 12;
  const showUrgency  = idNum % 5 !== 0;

  const psychNaira   = toPsychPrice(Math.round(product.unitPrice));
  const savingsNaira = hasDiscount
    ? Math.round(oldPrice) - Math.round(product.unitPrice)
    : 0;

  const stockMsg  = STOCK_MSGS[idNum % STOCK_MSGS.length](stockLeft);
  const viewerMsg = VIEWER_MSGS[idNum % VIEWER_MSGS.length](viewers);

  const handleAddToCart = () => {
    const existing = cartItems.find((item) => item.id === product.id);
    const alreadyInCart = existing?.quantity ?? 0;
    if (alreadyInCart + quantity > stockLeft) {
      toast.error('You already have the maximum stock in your cart');
      return;
    }
    addToCart({
      id: product.id, name: product.name || product.title,
      price: product.unitPrice, category: product.category,
      image: product.image, quantity, stock: stockLeft,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  // Sets exact quantity in cart then goes straight to checkout
  const handleBuyNow = () => {
    buyNow(
      { id: product.id, name: product.name || product.title, price: product.unitPrice, category: product.category, image: product.image, stockQuantity: product.stockQuantity },
      quantity
    );
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-400 hover:text-gray-800 mb-6 font-semibold transition-colors inline-flex items-center gap-1"
      >
        ← Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* ── Product image ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative aspect-square bg-gray-50 rounded-2xl flex items-center justify-center p-10"
        >
          {hasDiscount && (
            <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-md">
              -{discountPct}% OFF
            </div>
          )}
          <img
            src={product.image}
            alt={product.name || product.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain"
          />
        </motion.div>

        {/* ── Product info ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="flex flex-col"
        >
          {/* Category */}
          <span className="text-xs font-extrabold text-brand-500 uppercase tracking-widest">
            {product.category}
          </span>

          {/* Title */}
          <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 mt-2 mb-3 leading-snug">
            {product.name || product.title}
          </h1>

          {/* Stars */}
          <StarRating rating={product.rating?.rate} count={product.rating?.count} size="md" />

          {/* ── Urgency bar ── */}
          {showUrgency && (
            <div className="mt-4 flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 bg-red-50 border border-red-100 text-red-600 text-xs font-bold px-3 py-1.5 rounded-full">
                <Flame className="w-3.5 h-3.5" />
                {stockMsg}
              </div>
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full">
                <Users className="w-3.5 h-3.5" />
                {viewerMsg}
              </div>
            </div>
          )}

          {/* ── Price block ── */}
          <div className="mt-5 mb-5 p-4 bg-gray-50 rounded-2xl">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-extrabold text-gray-900">
                ₦{psychNaira.toLocaleString('en-NG')}
              </span>
              {hasDiscount && (
                <span className="text-lg text-gray-400 line-through font-medium">
                  {formatNaira(oldPrice)}
                </span>
              )}
            </div>
            {hasDiscount && (
              <p className="text-sm font-bold text-green-600 mt-1.5 flex items-center gap-1">
                <span className="text-green-500">✓</span>
                You save ₦{savingsNaira.toLocaleString('en-NG')} ({discountPct}% off)
              </p>
            )}
          </div>

          {/* ── Delivery info ── */}
          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium mb-5">
            <Truck className="w-4 h-4 text-brand-500 shrink-0" />
            <span>
              <span className="font-bold text-gray-900">Free delivery</span> — Arrives in
              <span className="font-bold text-gray-900"> 3–5 business days</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium mb-6">
            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Order in the next <span className="font-bold text-amber-600">2 hrs 14 min</span> for same-day dispatch</span>
          </div>

          {/* ── Quantity ── */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm font-semibold text-gray-600 w-20">Quantity:</span>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-3 hover:bg-gray-50 transition-colors text-gray-600 hover:text-gray-900"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-extrabold text-gray-900 text-lg">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((prev) => Math.min(stockLeft, prev + 1))}
                disabled={quantity >= stockLeft}
                className={`px-4 py-3 transition-colors ${
                  quantity >= stockLeft
                    ? 'opacity-30 cursor-not-allowed'
                    : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                }`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <span className="text-xs text-gray-400 font-medium">{stockLeft} available</span>
          </div>
          {quantity >= stockLeft && (
            <p className="text-xs text-red-500 font-medium mt-1">
              Maximum available stock reached
            </p>
          )}

          {/* ── CTAs ── */}
          <div className="flex gap-3 mb-4">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAddToCart}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-extrabold text-base transition-all duration-200 ${
                justAdded
                  ? 'bg-green-500 text-white'
                  : 'bg-brand-500 text-white hover:bg-brand-600 shadow-brand'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {justAdded ? 'Added to Cart ✓' : 'Add to Cart'}
            </motion.button>

            <button
              onClick={() => setWishlisted(!wishlisted)}
              className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'
                }`}
              />
            </button>
          </div>

          {/* Buy Now — sets exact quantity and goes straight to checkout */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleBuyNow}
            className="w-full flex items-center justify-center py-4 rounded-xl font-extrabold text-base border-2 border-brand-500 text-brand-500 hover:bg-brand-50 transition-all duration-200 mb-6"
          >
            Buy Now
          </motion.button>

          {/* Description */}
          <p className="text-sm text-gray-500 leading-relaxed mb-6">{product.description}</p>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-5 border-t border-gray-100">
            {[
              { icon: Truck,     label: 'Free Delivery', sub: 'Over ₦50,000' },
              { icon: Shield,    label: '2-Yr Warranty',  sub: 'All products'  },
              { icon: RotateCcw, label: '30-Day Returns', sub: 'No questions'  },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center text-center gap-1">
                <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center mb-1">
                  <Icon className="w-4 h-4 text-brand-500" />
                </div>
                <p className="text-xs font-bold text-gray-800">{label}</p>
                <p className="text-[11px] text-gray-400">{sub}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Reviews section ─────────────────────────────────────────────── */}
      <div className="mt-16 pt-10 border-t border-gray-100 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <ReviewList reviews={reviews} loading={reviewsLoading} />
        </div>
        <div>
          <ReviewForm productId={id} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
