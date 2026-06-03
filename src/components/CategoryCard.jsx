const CategoryCard = ({ category, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
      selected
        ? 'bg-indigo-50 text-indigo-600 font-medium'
        : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <span>{category.name}</span>
    <span className="text-xs text-gray-400">{category.count}</span>
  </button>
);

export default CategoryCard;
