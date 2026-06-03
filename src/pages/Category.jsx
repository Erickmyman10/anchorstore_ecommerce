import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Grid3X3, List, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { getMergedProducts } from '../services/api';

// Fixed category list — unified across local + FakeStore products
const CATEGORIES = ['all', 'electronics', 'fashion', 'accessories'];

const CATEGORY_LABELS = {
  all:         'All Products',
  electronics: 'Electronics',
  fashion:     'Fashion',
  accessories: 'Accessories',
};

const CATEGORY_ICONS = {
  all:         '🛍️',
  electronics: '🖥️',
  fashion:     '👗',
  accessories: '⌚',
};

const cardAnim = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };

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

const Category = () => {
  const [searchParams] = useSearchParams();
  const [viewMode,         setViewMode]         = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const param = searchParams.get('category');
    return CATEGORIES.includes(param) ? param : 'all';
  });
  const [allProducts, setAllProducts] = useState([]);
  const [loading,     setLoading]     = useState(true);

  // Load ALL merged products once — local + FakeStore (all 20)
  useEffect(() => {
    getMergedProducts(20)
      .then((data) => { setAllProducts(data); setLoading(false); })
      .catch(()    => setLoading(false));
  }, []);

  // Sync selectedCategory whenever the URL ?category= param changes
  // (covers browser back/forward and in-app Link navigation)
  useEffect(() => {
    const param = searchParams.get('category');
    setSelectedCategory(CATEGORIES.includes(param) ? param : 'all');
  }, [searchParams]);

  // Filter client-side — instant, no extra network request
  const products = useMemo(
    () =>
      selectedCategory === 'all'
        ? allProducts
        : allProducts.filter(
            (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
          ),
    [allProducts, selectedCategory]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* ── Sidebar ── */}
        <aside className="w-full md:w-56 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
            <div className="flex items-center gap-2 mb-5">
              <SlidersHorizontal className="w-4 h-4 text-gray-400" />
              <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Categories</h2>
            </div>
            <div className="space-y-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                    selectedCategory === cat
                      ? 'bg-brand-500 text-white shadow-brand'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span>{CATEGORY_ICONS[cat]}</span>
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Products ── */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">
                {CATEGORY_LABELS[selectedCategory]}
              </h1>
              {!loading && (
                <p className="text-sm text-gray-400 mt-0.5">
                  {products.length} product{products.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
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

          {!loading && products.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p className="text-4xl mb-3">📦</p>
              <p className="text-lg font-semibold">No products in this category</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Category;
