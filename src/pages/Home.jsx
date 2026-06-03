import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import {
  Truck,
  RotateCcw,
  Shield,
  Headphones,
  ArrowRight,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import ProductCard from "../components/ProductCard";
import { getMergedProducts } from "../services/api";
import { categoryImages, bannerImages } from "../utils/imageMap";

// ── Animation variants ─────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardAnim = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// ── Static data ────────────────────────────────────────────────────────────
const heroSlides = [
  {
    id: 1,
    tag: "✨ New Arrivals",
    headline: "Style That",
    headlineAccent: "Speaks Louder",
    sub: "Explore premium fashion collections curated just for you.",
    cta: "Explore Fashion",
    bg: "from-orange-500 via-red-500 to-pink-600",
    accentColor: "#fed7aa",
    image: bannerImages[0],
  },
  {
    id: 2,
    tag: "🔥 Trending Now",
    headline: "Next-Gen Tech",
    headlineAccent: "For Every Need",
    sub: "Discover cutting-edge electronics at the best prices in Nigeria.",
    cta: "Shop Electronics",
    bg: "from-indigo-900 via-purple-900 to-violet-900",
    accentColor: "#a5b4fc",
    image: bannerImages[1],
  },
];

const categoryCards = [
  {
    id: "electronics",
    name: "Electronics",
    count: "120+ Products",
    gradient: "from-indigo-500 to-purple-600",
    // icon: '🖥️',
    image: categoryImages.electronics,
  },
  {
    id: "fashion",
    name: "Fashion",
    count: "200+ Styles",
    gradient: "from-brand-500 to-pink-500",
    // icon: '👗',
    image: categoryImages.fashion,
  },
  {
    id: "accessories",
    name: "Accessories",
    count: "80+ Pieces",
    gradient: "from-amber-500 to-orange-600",
    // icon: '⌚',
    image: categoryImages.accessories,
  },
];

const trustFeatures = [
  { icon: Truck, title: "Free Shipping", desc: "On orders over ₦50,000" },
  { icon: RotateCcw, title: "Easy Returns", desc: "30-day return policy" },
  { icon: Shield, title: "Secure Payment", desc: "100% safe checkout" },
  { icon: Headphones, title: "24/7 Support", desc: "Always here for you" },
];

// ── Skeleton card ──────────────────────────────────────────────────────────
const ProductSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-card">
    <div className="aspect-square skeleton" />
    <div className="p-4 space-y-3">
      <div className="h-3 skeleton rounded-full w-1/3" />
      <div className="h-4 skeleton rounded-full w-4/5" />
      <div className="h-4 skeleton rounded-full w-3/5" />
      <div className="h-10 skeleton rounded-xl mt-1" />
    </div>
  </div>
);

// ── Home page ──────────────────────────────────────────────────────────────
const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getMergedProducts(8)
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredProducts = searchQuery.trim()
    ? products.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : products;

  return (
    <div>
      {/* ── Hero Swiper ─────────────────────────────────────────────────── */}
      <section>
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          loop
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          className="hero-swiper"
        >
          {heroSlides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div
                className={`relative min-h-[520px] lg:min-h-[600px] flex items-center overflow-hidden ${
                  slide.image ? "" : `bg-gradient-to-br ${slide.bg}`
                }`}
              >
                {/* Banner image + light overlay (when image exists) */}
                {slide.image && (
                  <>
                    <img
                      src={slide.image}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                  </>
                )}

                {/* Decorative circles */}
                <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10" />
                <div className="absolute bottom-[-60px] right-[18%] w-56 h-56 rounded-full bg-white/5" />
                <div className="absolute top-[35%] right-[8%] w-28 h-28 rounded-full bg-white/5" />

                <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20 w-full">
                  <div className="max-w-xl">
                    {/* Tag */}
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/20 text-white text-sm font-semibold mb-6 backdrop-blur-sm">
                      {slide.tag}
                    </span>

                    {/* Headline */}
                    <h1 className="text-5xl lg:text-[4.5rem] font-extrabold text-white leading-[1.08] mb-5 tracking-tight">
                      {slide.headline}
                      <br />
                      <span style={{ color: slide.accentColor }}>
                        {slide.headlineAccent}
                      </span>
                    </h1>

                    {/* Sub */}
                    <p className="text-white/75 text-lg mb-9 leading-relaxed max-w-md">
                      {slide.sub}
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-wrap gap-3">
                      <Link to="/categories" className="btn-white">
                        {slide.cta}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        to="/categories"
                        className="inline-flex items-center gap-2 text-white font-bold border-2 border-white/40 px-6 py-3 rounded-full hover:bg-white/15 active:scale-95 transition-all duration-200"
                      >
                        View All
                      </Link>
                    </div>
                  </div>

                  {/* Big floating emoji decoration */}
                  <div className="absolute right-8 lg:right-24 top-1/2 -translate-y-1/2 text-[130px] lg:text-[180px] opacity-20 select-none hidden md:block animate-float pointer-events-none">
                    {slide.icon}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* ── Trust / Features Bar ────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustFeatures.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
                className="flex items-center gap-3"
              >
                <div className="p-2.5 bg-brand-50 rounded-xl flex-shrink-0">
                  <f.icon className="w-5 h-5 text-brand-500" />
                </div>
                <div>
                  <p className="font-extrabold text-sm text-gray-900">
                    {f.title}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ──────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="mb-10"
          >
            <h2 className="section-heading">Shop by Category</h2>
            <p className="section-sub">Find exactly what you're looking for</p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6"
          >
            {categoryCards.map((cat) => (
              <motion.div key={cat.id} variants={cardAnim}>
                <Link
                  to={`/categories?category=${cat.id}`}
                  className="block group"
                >
                  <div
                    className={`relative rounded-3xl p-8 overflow-hidden aspect-[4/3] flex flex-col justify-end group-hover:scale-[1.02] transition-transform duration-300 ${
                      cat.image
                        ? "bg-gray-900"
                        : `bg-gradient-to-br ${cat.gradient}`
                    }`}
                  >
                    {/* Category image + color tint overlay */}
                    {cat.image && (
                      <>
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30" />
                      </>
                    )}

                    {/* Decorative circles inside card */}
                    <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/10 rounded-full" />
                    <div className="absolute top-1/2 right-4 w-20 h-20 bg-white/5 rounded-full" />

                    {/* Big icon */}
                    <span className="absolute top-5 right-5 text-6xl opacity-25 group-hover:opacity-40 transition-opacity duration-300 select-none">
                      {cat.icon}
                    </span>

                    {/* Dark-to-transparent bottom overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent rounded-3xl" />

                    <div className="relative">
                      <p className="text-white/70 text-sm font-semibold">
                        {cat.count}
                      </p>
                      <h3 className="text-white text-2xl font-extrabold mt-0.5">
                        {cat.name}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-white/90 text-sm font-bold mt-2 group-hover:gap-2 transition-all duration-200">
                        Shop Now <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Featured Products ────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="flex items-end justify-between mb-6"
          >
            <div>
              <h2 className="section-heading">Featured Products</h2>
              <p className="section-sub">Hand-picked deals, just for you</p>
            </div>
            <Link
              to="/categories"
              className="hidden sm:inline-flex items-center gap-1.5 text-brand-500 font-extrabold text-sm hover:gap-3 transition-all duration-200"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* ── Search bar ── */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products by name…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Result count when searching */}
          {searchQuery.trim() && !loading && (
            <p className="text-sm text-gray-500 font-medium mb-5">
              {filteredProducts.length === 0
                ? `No results for "${searchQuery}"`
                : `${filteredProducts.length} result${filteredProducts.length !== 1 ? "s" : ""} for "${searchQuery}"`}
            </p>
          )}

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
          >
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <motion.div key={i} variants={cardAnim}>
                  <ProductSkeleton />
                </motion.div>
              ))
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <motion.div key={product.id} variants={cardAnim}>
                  <ProductCard product={product} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center">
                <p className="text-4xl mb-4">🔍</p>
                <p className="text-gray-500 font-semibold mb-2">
                  No products match "{searchQuery}"
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-brand-500 font-bold text-sm hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}
          </motion.div>

          {/* Mobile "View All" CTA */}
          <div className="sm:hidden mt-8 text-center">
            <Link to="/categories" className="btn-brand-outline">
              View All Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Promo Banner ────────────────────────────────────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
        className="py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-r from-brand-500 via-brand-600 to-pink-500 rounded-4xl overflow-hidden text-white text-center px-8 py-14 lg:py-20">
            {/* Decorative blobs */}
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full" />
            <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-white/10 rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full" />

            <div className="relative">
              <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold mb-5">
                🎉 Limited Time Offer
              </span>
              <h2 className="text-4xl lg:text-6xl font-extrabold mb-3 leading-tight tracking-tight">
                Summer Sale
                <br />
                <span className="opacity-90">Up to 40% Off</span>
              </h2>
              <p className="text-white/75 text-lg mb-9 max-w-md mx-auto font-medium">
                Free shipping on all orders above ₦50,000. No code needed.
              </p>
              <Link
                to="/categories"
                className="inline-flex items-center gap-2.5 bg-white text-brand-500 font-extrabold px-8 py-4 rounded-full hover:bg-brand-50 active:scale-95 transition-all duration-200 shadow-xl text-base"
              >
                Shop the Sale
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;
