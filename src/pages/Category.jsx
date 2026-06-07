import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Grid3X3, List, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { getMergedProducts } from '../services/api';

// ── Category metadata ──────────────────────────────────────────────────────
// Defines display label, icon and sort order for every known category.
// Any new category not listed here falls back to a generated label + 📦 icon.
const CATEGORY_CONFIG = {
  'all':            { label: 'All Products',    icon: '🛍️',  order: 0  },
  'official-store': { label: 'Official Store',  icon: '🏪',  order: 1  },
  'phones-tablets': { label: 'Phones & Tablets',icon: '📱',  order: 2  },
  'computing':      { label: 'Computing',       icon: '💻',  order: 3  },
  'electronics':    { label: 'Electronics',     icon: '🖥️',  order: 4  },
  'appliances':     { label: 'Appliances',      icon: '🏠',  order: 5  },
  'fashion':        { label: 'Fashion',         icon: '👗',  order: 6  },
  'health-beauty':  { label: 'Health & Beauty', icon: '💄',  order: 7  },
  'home-office':    { label: 'Home & Office',   icon: '🪑',  order: 8  },
  'supermarket':    { label: 'Supermarket',     icon: '🛒',  order: 9  },
  'gaming':         { label: 'Gaming',          icon: '🎮',  order: 10 },
  'baby-products':  { label: 'Baby Products',   icon: '🍼',  order: 11 },
};

const getCategoryMeta = (cat) =>
  CATEGORY_CONFIG[cat] ?? {
    label: cat.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' '),
    icon: '📦',
    order: 99,
  };

// ── Animation variants ─────────────────────────────────────────────────────
const cardAnim = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

// ── Skeleton ───────────────────────────────────────────────────────────────
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

// ── Category page ──────────────────────────────────────────────────────────
const Category = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode,     setViewMode]     = useState('grid');
  const [allProducts,  setAllProducts]  = useState([]);
  const [loading,      setLoading]      = useState(true);

  // Derive selected category from URL (any string works — no whitelist needed)
  const selectedCategory = useMemo(() => {
    const param = searchParams.get('category')?.toLowerCase();
    return param && param !== '' ? param : 'all';
  }, [searchParams]);

  const setSelectedCategory = (cat) => {
    if (cat === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  // Load ALL products once
  useEffect(() => {
    getMergedProducts(20)
      .then((data) => { setAllProducts(data); setLoading(false); })
      .catch(()    => setLoading(false));
  }, []);

  // ── Derive available categories from loaded product data ───────────────
  const availableCategories = useMemo(() => {
    if (!allProducts.length) return ['all'];
    const cats = [
      ...new Set(
        allProducts
          .map((p) => p.category?.toLowerCase())
          .filter(Boolean)
      ),
    ];
    cats.sort(
      (a, b) => (getCategoryMeta(a).order ?? 99) - (getCategoryMeta(b).order ?? 99)
    );
    return ['all', ...cats];
  }, [allProducts]);

  // ── Per-category product counts (auto-updates when products change) ────
  const categoryCounts = useMemo(() => {
    const counts = { all: allProducts.length };
    allProducts.forEach((p) => {
      const cat = p.category?.toLowerCase();
      if (cat) counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [allProducts]);

  // ── Filtered product list ──────────────────────────────────────────────
  const products = useMemo(
    () =>
      selectedCategory === 'all'
        ? allProducts
        : allProducts.filter(
            (p) => p.category?.toLowerCase() === selectedCategory
          ),
    [allProducts, selectedCategory]
  );

  const { label: pageTitle, icon: pageIcon } = getCategoryMeta(selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">

        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <aside className="w-full md:w-60 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
            <div className="flex items-center gap-2 mb-5">
              <SlidersHorizontal className="w-4 h-4 text-gray-400" />
              <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wider">
                Categories
              </h2>
            </div>

            {/* Scrollable category list */}
            <div className="space-y-0.5 max-h-[70vh] overflow-y-auto pr-1 scrollbar-thin">
              {availableCategories.map((cat) => {
                const { label, icon } = getCategoryMeta(cat);
                const count = categoryCounts[cat] ?? 0;
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-between gap-2 ${
                      active
                        ? 'bg-brand-500 text-white shadow-brand'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span>{icon}</span>
                      <span className="truncate">{label}</span>
                    </span>
                    {!loading && (
                      <span
                        className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                          active
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* ── Product grid ────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                <span>{pageIcon}</span>
                {pageTitle}
              </h1>
              {!loading && (
                <p className="text-sm text-gray-400 mt-0.5">
                  {products.length} product{products.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white shadow-sm text-brand-500'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-white shadow-sm text-brand-500'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Products */}
          <motion.div
            key={selectedCategory}
            initial="hidden"
            animate="visible"
            variants={stagger}
            className={`grid gap-5 ${
              viewMode === 'grid'
                ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}
          >
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <motion.div key={i} variants={cardAnim}>
                    <ProductSkeleton />
                  </motion.div>
                ))
              : products.map((product) => (
                  <motion.div key={product.id} variants={cardAnim}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
          </motion.div>

          {/* Empty state */}
          {!loading && products.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-4">{pageIcon}</p>
              <p className="text-lg font-extrabold text-gray-700 mb-1">{pageTitle}</p>
              <p className="text-sm font-medium">No products in this category yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Category;
