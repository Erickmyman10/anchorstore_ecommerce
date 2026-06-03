import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Heart, Flame } from 'lucide-react';
import useCartStore from '../store/useCartStore';
import { formatNaira, formatNairaPsych, toPsychPrice } from '../services/api';

// ── Star rating ────────────────────────────────────────────────────────────
const StarRating = ({ rate, count }) => {
  const filled = Math.round(rate ?? 0);
  return (
    <div className="flex items-center gap-0.5 flex-wrap">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${
              i < filled ? 'fill-amber-400 text-amber-400' : 'fill-gray-100 text-gray-200'
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-gray-500 font-semibold ml-1">
        {rate?.toFixed(1) ?? '—'}
      </span>
      {count && (
        <span className="text-[11px] text-gray-400 ml-0.5">({count})</span>
      )}
    </div>
  );
};

// ── ProductCard ────────────────────────────────────────────────────────────
const ProductCard = ({ product }) => {
  const [wishlisted, setWishlisted] = useState(false);
  const [justAdded,  setJustAdded]  = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);

  const title    = product.title || product.name;
  const image    = product.image ?? null;
  const price    = product.price;
  const category = product.category;
  const ratingVal =
    typeof product.rating === 'object'
      ? product.rating?.rate
      : Number(product.rating);
  const reviewCount =
    typeof product.rating === 'object' ? product.rating?.count : null;

  // ~75% of products show a discount (deterministic, not every card looks the same)
  const hasDiscount  = product.id % 4 !== 0;
  const discountPct  = hasDiscount ? [15, 20, 25, 30, 35][product.id % 5] : 0;
  const oldPrice     = hasDiscount ? price / (1 - discountPct / 100) : price;
  const isHotDeal    = discountPct >= 25;

  // price is already in ₦ — no conversion needed
  const psychNaira    = toPsychPrice(Math.round(price));
  const rawOldNaira   = Math.round(oldPrice);
  const savedNaira    = hasDiscount ? rawOldNaira - Math.round(price) : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart({ id: product.id, name: title, price, category, image });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="group bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden flex flex-col"
    >
      <Link to={`/product/${product.id}`} className="flex-1 flex flex-col">
        {/* ── Image ── */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-contain p-5 group-hover:scale-108 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart className="w-12 h-12 text-gray-200" />
            </div>
          )}

          {/* Wishlist */}
          <button
            onClick={(e) => { e.preventDefault(); setWishlisted(!wishlisted); }}
            aria-label="Wishlist"
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-soft opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <Heart
              className={`w-4 h-4 transition-colors duration-200 ${
                wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'
              }`}
            />
          </button>

          {/* Badges — only when discounted */}
          {hasDiscount && (
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {isHotDeal && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-extrabold rounded-full shadow-sm">
                  <Flame className="w-2.5 h-2.5" />
                  HOT DEAL
                </span>
              )}
              <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-extrabold rounded-full shadow-sm">
                -{discountPct}%
              </span>
            </div>
          )}
        </div>

        {/* ── Info ── */}
        <div className="p-4 flex-1 flex flex-col">
          <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider mb-1">
            {category}
          </span>

          <h3 className="font-bold text-sm text-gray-900 leading-snug mb-2 line-clamp-2 min-h-10 group-hover:text-brand-500 transition-colors duration-200">
            {title}
          </h3>

          <StarRating rate={ratingVal} count={reviewCount} />

          {/* Price hierarchy */}
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <p className="text-xl font-extrabold text-gray-900">
                ₦{psychNaira.toLocaleString('en-NG')}
              </p>
              {hasDiscount && (
                <p className="text-xs text-gray-400 line-through font-medium">
                  {formatNaira(oldPrice)}
                </p>
              )}
            </div>
            {hasDiscount && (
              <p className="text-[11px] font-bold text-green-600 mt-0.5">
                Save ₦{savedNaira.toLocaleString('en-NG')}
              </p>
            )}
          </div>
        </div>
      </Link>

      {/* ── Add to cart ── */}
      <div className="px-4 pb-4">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleAddToCart}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
            justAdded
              ? 'bg-green-500 text-white shadow-sm'
              : 'bg-brand-50 text-brand-500 hover:bg-brand-500 hover:text-white hover:shadow-brand'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          {justAdded ? 'Added ✓' : 'Add to Cart'}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
