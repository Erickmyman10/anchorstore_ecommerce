import { useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CATEGORIES } from '../data/categories';
import useCategoryStore from '../store/useCategoryStore';

// Improvement 3 — skeleton shown while parent data is loading
const CategorySkeleton = () => (
  <div className="flex overflow-x-auto gap-3 pb-1 md:grid md:grid-cols-8 md:overflow-visible scrollbar-none snap-x snap-mandatory">
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="snap-start shrink-0 w-28 md:w-auto h-20.5 rounded-xl bg-gray-100 animate-pulse"
      />
    ))}
  </div>
);

const Categories = ({ onSelect, counts = {}, loading = false }) => {
  const { selectedCategory, setCategory } = useCategoryStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Sync store from URL on every navigation (deep links + back/forward)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category') || 'all';
    setCategory(category);
  }, [location.search, setCategory]);

  const handleClick = useCallback((slug) => {
    setCategory(slug);
    onSelect?.(slug);
    navigate(slug === 'all' ? '/categories' : `/categories?category=${slug}`);
  }, [setCategory, onSelect, navigate]);

  if (loading) return (
    <div className="w-full px-4 py-6">
      <div className="h-6 w-28 bg-gray-100 animate-pulse rounded-full mb-4" />
      <CategorySkeleton />
    </div>
  );

  return (
    <div className="w-full px-4 py-6">
      <h2 className="text-lg font-extrabold text-gray-900 mb-4">Categories</h2>

      {/* Improvement 1 — snap-x for native mobile scroll feel */}
      <div className="flex overflow-x-auto gap-3 pb-1 md:grid md:grid-cols-8 md:overflow-visible scrollbar-none snap-x snap-mandatory">
        {CATEGORIES.map(({ name, slug, icon: Icon }) => {
          const isActive = selectedCategory === slug;
          const count = counts[slug];

          return (
            <button
              key={slug}
              onClick={() => handleClick(slug)}
              // Improvement 1 — snap-start per card
              className={`snap-start flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer shrink-0 w-28 md:w-auto
                transition-all duration-200 hover:shadow-md hover:-translate-y-0.5
                ${isActive
                  ? 'bg-black text-white border-black shadow-md scale-105'
                  : 'bg-white border-gray-100 text-gray-700 hover:border-gray-200'
                }`}
            >
              <Icon size={22} strokeWidth={1.8} />
              <p className="text-xs mt-2 font-semibold text-center leading-tight">{name}</p>
              {/* Improvement 4 — optional badge count from parent */}
              {count != null && (
                <span className={`text-[10px] font-bold mt-0.5 ${isActive ? 'opacity-70' : 'text-gray-400'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Categories;
