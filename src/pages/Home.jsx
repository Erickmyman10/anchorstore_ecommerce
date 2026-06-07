import { useState, useEffect, useMemo } from "react";
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
import { categoryImages, bannerImages, hotPicksBanner } from "../utils/imageMap";

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
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardAnim = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// ── Category config (label, icon, gradient — mirrors Category.jsx) ────────
const CATEGORY_CONFIG = {
  "official-store": {
    label: "Official Store",
    icon: "",
    gradient: "from-violet-600 to-indigo-700",
  },
  "phones-tablets": {
    label: "Phones & Tablets",
    icon: "",
    gradient: "from-sky-500 to-blue-700",
  },
  computing: {
    label: "Computing",
    icon: "",
    gradient: "from-indigo-500 to-purple-700",
  },
  electronics: {
    label: "Electronics",
    icon: "",
    gradient: "from-slate-600 to-gray-800",
  },
  appliances: {
    label: "Appliances",
    icon: "",
    gradient: "from-teal-500 to-emerald-700",
  },
  fashion: {
    label: "Fashion",
    icon: "",
    gradient: "from-brand-500 to-pink-500",
  },
  "health-beauty": {
    label: "Health & Beauty",
    icon: "",
    gradient: "from-rose-400 to-pink-600",
  },
  "home-office": {
    label: "Home & Office",
    icon: "",
    gradient: "from-amber-500 to-orange-600",
  },
  supermarket: {
    label: "Supermarket",
    icon: "",
    gradient: "from-green-500 to-emerald-600",
  },
  gaming: { label: "Gaming", icon: "", gradient: "from-red-500 to-rose-700" },
  "baby-products": {
    label: "Baby Products",
    icon: "",
    gradient: "from-pink-300 to-purple-400",
  },
};

// Featured categories shown on the homepage (first 8 in desired order)
const FEATURED_CATEGORY_KEYS = [
  "official-store",
  "phones-tablets",
  "computing",
  "electronics",
  "appliances",
  "fashion",
  "health-beauty",
  "home-office",
];

// ── Hero slides ────────────────────────────────────────────────────────────
const heroSlides = [
  {
    id: 1,
    tag: "✨ New Arrivals",
    headline: "Style That",
    headlineAccent: "Speaks Louder",
    sub: "Explore premium fashion collections curated just for you.",
    cta: "Explore Fashion",
    ctaLink: "/categories?category=fashion",
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
    ctaLink: "/categories?category=electronics",
    bg: "from-indigo-900 via-purple-900 to-violet-900",
    accentColor: "#a5b4fc",
    image: bannerImages[1],
  },
];

// ── Trust features ─────────────────────────────────────────────────────────
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
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getMergedProducts(8)
      .then((data) => {
        setAllProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Featured products: marked featured:true first, then fill up to 16
  const featuredProducts = useMemo(() => {
    const marked = allProducts.filter((p) => p.featured);
    if (marked.length >= 8) return marked.slice(0, 16);
    const rest = allProducts.filter((p) => !p.featured);
    return [...marked, ...rest].slice(0, 16);
  }, [allProducts]);

  const filteredProducts = useMemo(
    () =>
      searchQuery.trim()
        ? allProducts.filter((p) =>
            (p.title || p.name)
              .toLowerCase()
              .includes(searchQuery.toLowerCase()),
          )
        : featuredProducts,
    [allProducts, featuredProducts, searchQuery],
  );

  // Per-category product counts for the category cards
  const categoryCounts = useMemo(() => {
    const counts = {};
    allProducts.forEach((p) => {
      const cat = p.category?.toLowerCase();
      if (cat) counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [allProducts]);

  return (
    <div>
      {/* ── Hero Swiper ─────────────────────────────────────────────── */}
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
                className={`relative min-h-130 lg:min-h-150 flex items-center overflow-hidden ${
                  slide.image ? "" : `bg-linear-to-br ${slide.bg}`
                }`}
              >
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
                <div className="absolute -bottom-15 right-[18%] w-56 h-56 rounded-full bg-white/5" />
                <div className="absolute top-[35%] right-[8%] w-28 h-28 rounded-full bg-white/5" />

                <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20 w-full">
                  <div className="max-w-xl">
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/20 text-white text-sm font-semibold mb-6 backdrop-blur-sm">
                      {slide.tag}
                    </span>
                    <h1 className="text-5xl lg:text-[4.5rem] font-extrabold text-white leading-[1.08] mb-5 tracking-tight">
                      {slide.headline}
                      <br />
                      <span style={{ color: slide.accentColor }}>
                        {slide.headlineAccent}
                      </span>
                    </h1>
                    <p className="text-white/75 text-lg mb-9 leading-relaxed max-w-md">
                      {slide.sub}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Link to={slide.ctaLink} className="btn-white">
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
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* ── Trust / Features Bar ────────────────────────────────────── */}
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
                <div className="p-2.5 bg-brand-50 rounded-xl shrink-0">
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

      {/* ── Shop by Category ────────────────────────────────────────── */}
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
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {FEATURED_CATEGORY_KEYS.map((catKey) => {
              const { label, icon, gradient } = CATEGORY_CONFIG[catKey];
              const image = categoryImages[catKey] ?? null;
              const count = categoryCounts[catKey];
              return (
                <motion.div key={catKey} variants={cardAnim}>
                  <Link
                    to={`/categories?category=${catKey}`}
                    className="block group"
                  >
                    <div
                      className={`relative rounded-2xl p-6 overflow-hidden aspect-4/3 flex flex-col justify-end group-hover:scale-[1.02] transition-transform duration-300 ${
                        image ? "bg-gray-900" : `bg-linear-to-br ${gradient}`
                      }`}
                    >
                      {image && (
                        <>
                          <img
                            src={image}
                            alt={label}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/35" />
                        </>
                      )}

                      {/* Decorative circles */}
                      <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
                      <div className="absolute top-1/2 right-3 w-14 h-14 bg-white/5 rounded-full" />

                      {/* Bottom gradient overlay */}
                      <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent rounded-2xl" />

                      <div className="relative">
                        <span className="text-3xl mb-2 block">{icon}</span>
                        {!loading && count != null && (
                          <p className="text-white/70 text-xs font-semibold mb-0.5">
                            {count}+ Products
                          </p>
                        )}
                        <h3 className="text-white text-base font-extrabold leading-tight">
                          {label}
                        </h3>
                        <span className="inline-flex items-center gap-1 text-white/80 text-xs font-bold mt-1.5 group-hover:gap-2 transition-all duration-200">
                          Shop Now <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Show all categories link */}
          <div className="mt-8 text-center">
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 text-brand-500 font-extrabold text-sm hover:gap-3 transition-all duration-200"
            >
              Browse all 11 categories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured Products ────────────────────────────────────────── */}
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

          {/* Search bar */}
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

          <div className="sm:hidden mt-8 text-center">
            <Link to="/categories" className="btn-brand-outline">
              View All Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Promo Banner ─────────────────────────────────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
        className="py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="relative rounded-4xl overflow-hidden text-white text-center px-8 py-14 lg:py-20"
            style={{
              backgroundImage: `url(${hotPicksBanner})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10">
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
