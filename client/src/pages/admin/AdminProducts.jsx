import { useState, useEffect, useMemo } from 'react';
import {
  Package, ShieldCheck, Plus, Search, Pencil, Trash2,
  X, Check, AlertTriangle, ChevronUp, ChevronDown,
} from 'lucide-react';
import { getMergedProducts } from '../../services/api';

const fmt = (n) => `₦${Math.round(Number(n ?? 0)).toLocaleString('en-NG')}`;

const CATEGORIES = [
  'computing', 'official-store', 'phones-tablets', 'electronics',
  'appliances', 'fashion', 'health-beauty', 'home-office',
  'supermarket', 'gaming', 'baby-products',
];

const EMPTY_FORM = {
  title: '', category: 'electronics', brand: '', price: '',
  originalPrice: '', stock: '', badge: '', description: '', featured: false,
};

// ── Confirm delete dialog ─────────────────────────────────────────────────────
const ConfirmDialog = ({ name, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-red-50 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        <h3 className="font-bold text-gray-900">Delete Product?</h3>
      </div>
      <p className="text-sm text-gray-500 mb-5">
        Delete <span className="font-semibold text-gray-700">"{name}"</span>? This action cannot be undone.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel}  className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
        <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600">Delete</button>
      </div>
    </div>
  </div>
);

// ── Product form modal ────────────────────────────────────────────────────────
const ProductForm = ({ initial, onSave, onClose }) => {
  const [form, setForm] = useState(initial ?? EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const patch = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.title.trim())      e.title = 'Title is required';
    if (!form.price)             e.price = 'Price is required';
    if (Number(form.price) < 1)  e.price = 'Price must be > 0';
    if (!form.stock && form.stock !== 0) e.stock = 'Stock is required';
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({
      ...form,
      price:         Number(form.price),
      unitPrice:     Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      stock:         Number(form.stock),
      rating:        form.rating ?? { rate: 0, count: 0 },
      featured:      Boolean(form.featured),
    });
  };

  const Field = ({ label, name, type = 'text', placeholder = '' }) => (
    <div>
      <label className="block text-xs font-bold text-gray-600 mb-1">{label}</label>
      <input
        type={type} value={form[name]} placeholder={placeholder}
        onChange={(e) => patch(name, e.target.value)}
        className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 transition-all ${
          errors[name] ? 'border-red-300 bg-red-50' : 'border-gray-200'
        }`}
      />
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full max-w-lg max-h-[92vh] sm:max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-extrabold text-gray-900">{initial?.id ? 'Edit Product' : 'Add New Product'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
        </div>

        <div className="overflow-y-auto p-6 space-y-4 flex-1">
          <Field label="Product Title *" name="title" placeholder="e.g. Samsung Galaxy S24" />
          {/* Stack on mobile, side-by-side on sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Category *</label>
              <select value={form.category} onChange={(e) => patch('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/-/g, ' ')}</option>)}
              </select>
            </div>
            <Field label="Brand" name="brand" placeholder="e.g. Samsung" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Price (₦) *"        name="price"         type="number" placeholder="e.g. 150000" />
            <Field label="Original Price (₦)" name="originalPrice" type="number" placeholder="e.g. 180000" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Stock *" name="stock" type="number" placeholder="e.g. 25" />
            <Field label="Badge"   name="badge"               placeholder="e.g. Hot Deal" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => patch('description', e.target.value)}
              rows={3} placeholder="Product description…"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <div onClick={() => patch('featured', !form.featured)}
              className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${
                form.featured ? 'bg-brand-500 border-brand-500' : 'border-gray-300'
              }`}>
              {form.featured && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-sm text-gray-700 font-medium">Mark as featured product</span>
          </label>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose}    className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} className="flex-1 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-bold hover:bg-brand-600 transition-colors">
            {initial?.id ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const AdminProducts = () => {
  const [products,     setProducts]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [catFilter,    setCatFilter]    = useState('all');
  const [sortField,    setSortField]    = useState('title');
  const [sortDir,      setSortDir]      = useState('asc');
  const [showForm,     setShowForm]     = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast,        setToast]        = useState('');

  useEffect(() => {
    getMergedProducts(100)
      .then((data) => { setProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }) =>
    sortField === field
      ? sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
      : <ChevronDown className="w-3.5 h-3.5 opacity-30" />;

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        (p.title || p.name || '').toLowerCase().includes(q) ||
        (p.brand ?? '').toLowerCase().includes(q)
      );
    }
    if (catFilter !== 'all') list = list.filter((p) => p.category?.toLowerCase() === catFilter);
    list.sort((a, b) => {
      let av = a[sortField] ?? '', bv = b[sortField] ?? '';
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      return sortDir === 'asc' ? (av < bv ? -1 : av > bv ? 1 : 0) : (av > bv ? -1 : av < bv ? 1 : 0);
    });
    return list;
  }, [products, search, catFilter, sortField, sortDir]);

  const handleSave = (data) => {
    if (editTarget?.id) {
      setProducts((prev) => prev.map((p) => p.id === editTarget.id ? { ...p, ...data } : p));
      showToast('Product updated');
    } else {
      setProducts((prev) => [{ ...data, id: Date.now() }, ...prev]);
      showToast('Product added');
    }
    setShowForm(false);
    setEditTarget(null);
  };

  const handleDelete = () => {
    setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    showToast('Product deleted');
    setDeleteTarget(null);
  };

  const availableCats = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category?.toLowerCase()).filter(Boolean))].sort();
    return ['all', ...cats];
  }, [products]);

  const ThHeader = ({ label, field }) => (
    <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wide cursor-pointer hover:text-gray-600 whitespace-nowrap select-none"
      onClick={() => toggleSort(field)}>
      <span className="flex items-center gap-1">{label}<SortIcon field={field} /></span>
    </th>
  );

  const stockColor = (stock) =>
    (stock ?? 0) === 0 ? 'text-red-500' : (stock ?? 0) < 5 ? 'text-orange-500' : 'text-green-600';

  return (
    <div className="max-w-7xl mx-auto px-0 sm:px-2 lg:px-4 py-4 sm:py-8">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6 gap-4 px-2 sm:px-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-brand-500" />
            <span className="text-xs font-bold text-brand-500 uppercase tracking-widest">Admin Panel</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Product Management</h1>
          <p className="text-sm text-gray-400 mt-0.5">{products.length} products in catalogue</p>
        </div>
        <button
          onClick={() => { setEditTarget(null); setShowForm(true); }}
          className="shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-brand-500 text-white font-bold text-sm rounded-xl hover:bg-brand-600 transition-colors shadow-brand"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Product</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {toast && (
        <div className="fixed top-5 right-5 z-40 bg-gray-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <Check className="w-4 h-4 text-green-400" /> {toast}
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3 mb-5 px-2 sm:px-0">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" />
        </div>
        {/* Horizontally scrollable category pills */}
        <div
          className="flex gap-2 overflow-x-auto pb-1 flex-nowrap"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {availableCats.slice(0, 9).map((c) => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-colors ${
                catFilter === c ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}>
              {c === 'all' ? `All (${products.length})` : c.replace(/-/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* ── Products content ── */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 mx-2 sm:mx-0">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading products…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-gray-500">No products found</p>
        </div>
      ) : (
        <>
          {/* ── Mobile card list (< md) ── */}
          <div className="md:hidden bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50 mx-2 sm:mx-0">
            {filtered.map((p) => (
              <div key={p.id} className="p-4 flex gap-3 items-start">
                {/* Thumbnail */}
                {p.image
                  ? <img src={p.image} alt="" className="w-14 h-14 object-contain bg-gray-50 rounded-xl border border-gray-100 shrink-0" />
                  : <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-gray-300" />
                    </div>
                }

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2" title={p.title || p.name}>
                    {p.title || p.name}
                  </p>
                  <p className="text-xs text-gray-400 capitalize mt-0.5">
                    {p.category?.replace(/-/g, ' ')}{p.brand ? ` · ${p.brand}` : ''}
                  </p>
                  <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
                    <div>
                      <span className="font-bold text-gray-900 text-sm">{fmt(p.unitPrice ?? p.price)}</span>
                      {p.originalPrice && (
                        <span className="text-xs text-gray-400 line-through ml-1.5">{fmt(p.originalPrice)}</span>
                      )}
                    </div>
                    <span className={`text-xs font-bold ${stockColor(p.stock)}`}>
                      {p.stock ?? '—'}{p.stock !== undefined ? ' in stock' : ''}
                    </span>
                  </div>
                  {p.badge && (
                    <span className="inline-block mt-1.5 text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                      {p.badge}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    onClick={() => { setEditTarget(p); setShowForm(true); }}
                    className="p-2 rounded-lg text-gray-400 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(p)}
                    className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-400">
              Showing {filtered.length} of {products.length} products
            </div>
          </div>

          {/* ── Desktop table (md+) ── */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80">
                    <ThHeader label="Title"    field="title"     />
                    <ThHeader label="Category" field="category"  />
                    <ThHeader label="Brand"    field="brand"     />
                    <ThHeader label="Price"    field="unitPrice" />
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wide">Stock</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wide">Badge</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {p.image
                            ? <img src={p.image} alt="" className="w-9 h-9 object-contain bg-gray-50 rounded-lg border border-gray-100 shrink-0" />
                            : <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                <Package className="w-4 h-4 text-gray-300" />
                              </div>
                          }
                          <span className="font-semibold text-gray-900 text-xs max-w-40 truncate" title={p.title || p.name}>
                            {p.title || p.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-500 capitalize">{p.category?.replace(/-/g, ' ')}</td>
                      <td className="px-4 py-3.5 text-xs text-gray-500">{p.brand ?? '—'}</td>
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-gray-900">{fmt(p.unitPrice ?? p.price)}</span>
                        {p.originalPrice && <span className="block text-xs text-gray-400 line-through">{fmt(p.originalPrice)}</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-bold ${stockColor(p.stock)}`}>{p.stock ?? '—'}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        {p.badge
                          ? <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">{p.badge}</span>
                          : <span className="text-gray-300 text-xs">—</span>
                        }
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => { setEditTarget(p); setShowForm(true); }}
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-brand-50 hover:text-brand-600 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteTarget(p)}
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-400">
              Showing {filtered.length} of {products.length} products
            </div>
          </div>
        </>
      )}

      {showForm && (
        <ProductForm
          initial={editTarget}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          name={deleteTarget.title || deleteTarget.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default AdminProducts;
