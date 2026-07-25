import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Grid3X3, List, SlidersHorizontal, Search, X } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { getMergedProducts } from '../services/api';

// ── Category metadata ──────────────────────────────────────────────────────
const CATEGORY_CONFIG = {
  'all':            { label: 'All Products',     icon: '🛍️', order: 0  },
  'official-store': { label: 'Official Store',   icon: '🏪', order: 1  },
  'phones-tablets': { label: 'Phones & Tablets', icon: '📱', order: 2  },
  'computing':      { label: 'Computing',        icon: '💻', order: 3  },
  'electronics':    { label: 'Electronics',      icon: '🖥️', order: 4  },
  'appliances':     { label: 'Appliances',       icon: '🏠', order: 5  },
  'fashion':        { label: 'Fashion',          icon: '👗', order: 6  },
  'health-beauty':  { label: 'Health & Beauty',  icon: '💄', order: 7  },
  'home-office':    { label: 'Home & Office',    icon: '🪑', order: 8  },
  'supermarket':    { label: 'Supermarket',      icon: '🛒', order: 9  },
  'gaming':         { label: 'Gaming',           icon: '🎮', order: 10 },
  'baby-products':  { label: 'Baby Products',    icon: '🍼', order: 11 },
};

const getCategoryMeta = (cat) =>
  CATEGORY_CONFIG[cat] ?? {
    label: cat.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' '),
    icon: '📦', order: 99,
  };

const SORT_OPTIONS = [
  { value: 'relevance',  label: 'Relevance'        },
  { value: 'price-asc',  label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'rating',     label: 'Highest Rated'     },
];

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
  const [viewMode,    setViewMode]    = useState('grid');
  const [allProducts, setAllProducts] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [sort,        setSort]        = useState('relevance');

  const selectedCategory = useMemo(() => {
    const param = searchParams.get('category')?.toLowerCase();
    return param && param !== '' ? param : 'all';
  }, [searchParams]);

  const setSelectedCategory = (cat) => {
    setSearch('');
    setSort('relevance');
    if (cat === 'all') setSearchParams({});
    else setSearchParams({ category: cat });
  };

  useEffect(() => {
    getMergedProducts(20)
      .then((data) => { setAllProducts(data); setLoading(false); })
      .catch(()    => setLoading(false));
  }, []);

  const availableCategories = useMemo(() => {
    if (!allProducts.length) return ['all'];
    const cats = [...new Set(allProducts.map((p) => p.category?.toLowerCase()).filter(Boolean))];
    cats.sort((a, b) => (getCategoryMeta(a).order ?? 99) - (getCategoryMeta(b).order ?? 99));
    return ['all', ...cats];
  }, [allProducts]);

  const categoryCounts = useMemo(() => {
    const counts = { all: allProducts.length };
    allProducts.forEach((p) => {
      const cat = p.category?.toLowerCase();
      if (cat) counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [allProducts]);

  const products = useMemo(() => {
    // 1. Category filter
    let list = selectedCategory === 'all'
      ? [...allProducts]
      : allProducts.filter((p) => p.category?.toLowerCase() === selectedCategory);

    // 2. Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => (p.title || p.name || '').toLowerCase().includes(q));
    }

    // 3. Sort
    if (sort === 'price-asc')  list.sort((a, b) => (a.unitPrice ?? a.price ?? 0) - (b.unitPrice ?? b.price ?? 0));
    if (sort === 'price-desc') list.sort((a, b) => (b.unitPrice ?? b.price ?? 0) - (a.unitPrice ?? a.price ?? 0));
    if (sort === 'rating') {
      list.sort((a, b) => {
        const rA = typeof a.rating === 'object' ? (a.rating?.rate ?? 0) : Number(a.rating ?? 0);
        const rB = typeof b.rating === 'object' ? (b.rating?.rate ?? 0) : Number(b.rating ?? 0);
        return rB - rA;
      });
    }

    return list;
  }, [allProducts, selectedCategory, search, sort]);

  const { label: pageTitle, icon: pageIcon } = getCategoryMeta(selectedCategory);
  const hasActiveFilters = search.trim() || sort !== 'relevance';

  const clearFilters = () => { setSearch(''); setSort('relevance'); };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">

        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <aside className="w-full md:w-60 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24 space-y-6">

            {/* Categories */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Categories</h2>
              </div>
              <div className="space-y-0.5">
                {availableCategories.map((cat) => {
                  const { label, icon } = getCategoryMeta(cat);
                  const count  = categoryCounts[cat] ?? 0;
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
                        <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                          active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-red-500 font-semibold py-2 border border-red-100 rounded-xl hover:bg-red-50 transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Clear filters
              </button>
            )}
          </div>
        </aside>

        {/* ── Product grid ────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                <span>{pageIcon}</span>{pageTitle}
              </h1>
              {!loading && (
                <p className="text-sm text-gray-400 mt-0.5">
                  {products.length} product{products.length !== 1 ? 's' : ''}
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="ml-2 text-brand-500 font-semibold hover:underline">
                      Clear filters
                    </button>
                  )}
                </p>
              )}
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl shrink-0">
              <button onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-brand-500' : 'text-gray-400 hover:text-gray-600'}`}>
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-brand-500' : 'text-gray-400 hover:text-gray-600'}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search + Sort toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products by name…"
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Search result count */}
          {search.trim() && !loading && (
            <p className="text-sm text-gray-500 font-medium mb-4">
              {products.length === 0
                ? `No results for "${search}"`
                : `${products.length} result${products.length !== 1 ? 's' : ''} for "${search}"`}
            </p>
          )}

          {/* Products */}
          <motion.div
            key={`${selectedCategory}-${sort}`}
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
                  <motion.div key={i} variants={cardAnim}><ProductSkeleton /></motion.div>
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
              <p className="text-5xl mb-4">{search ? '🔍' : pageIcon}</p>
              <p className="text-lg font-extrabold text-gray-700 mb-1">
                {search ? `No results for "${search}"` : pageTitle}
              </p>
              <p className="text-sm font-medium mb-4">
                {search ? 'Try different keywords or remove filters.' : 'No products in this category yet.'}
              </p>
              {hasActiveFilters && (
                <button onClick={clearFilters}
                  className="text-brand-500 font-bold text-sm hover:underline">
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Category;
