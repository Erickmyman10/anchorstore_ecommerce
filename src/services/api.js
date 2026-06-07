import localProducts from '../data/localProducts';

// ── Session-level request cache ────────────────────────────────────────────
const _cache = new Map();
const _cached = (key, fn) =>
  _cache.has(key) ? Promise.resolve(_cache.get(key)) : fn().then((d) => { _cache.set(key, d); return d; });

// ── Psychological price rounding (must be defined before normalizeProduct) ─
// Rounds to the nearest psychological price point (ends in ...999)
export const toPsychPrice = (naira) => {
  if (naira >= 100_000) return Math.ceil(naira / 5_000) * 5_000 - 1;
  if (naira >= 10_000)  return Math.ceil(naira / 1_000) * 1_000 - 1;
  if (naira >= 1_000)   return Math.ceil(naira / 500)   * 500   - 1;
  return Math.ceil(naira / 100) * 100 - 1;
};

// Maps FakeStore category strings onto our unified category system.
const CATEGORY_MAP = {
  "jewelery":         "fashion",     // no standalone accessories category
  "men's clothing":   "fashion",
  "women's clothing": "fashion",
  "electronics":      "electronics",
};

// Converts a raw FakeStore product (USD price + FakeStore category) to our
// internal format. Called once at the API boundary — the rest of the app
// never deals with USD prices or FakeStore category names.
const normalizeProduct = (p) => ({
  ...p,
  price:    toPsychPrice(Math.round(p.price * 1600)),
  category: CATEGORY_MAP[p.category] ?? p.category,
});

// ── Internal API service ───────────────────────────────────────────────────
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    };
    try {
      const response = await fetch(url, config);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  getProducts()          { return this.request('/products'); }
  getProduct(id)         { return this.request(`/products/${id}`); }
  getCategories()        { return this.request('/categories'); }
  login(credentials)     { return this.request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }); }
  register(data)         { return this.request('/auth/register', { method: 'POST', body: JSON.stringify(data) }); }
  createOrder(orderData) { return this.request('/orders', { method: 'POST', body: JSON.stringify(orderData) }); }
}

export const api = new ApiService();

// ── FakeStore API — prices normalized to ₦ at the boundary ────────────────
const FAKESTORE = 'https://fakestoreapi.com';

export const fakeStoreApi = {
  getProducts: (limit = 8) =>
    _cached(`products:${limit}`, () =>
      fetch(`${FAKESTORE}/products?limit=${limit}`)
        .then((r) => { if (!r.ok) throw new Error('Failed to fetch products'); return r.json(); })
        .then((data) => data.map(normalizeProduct))
    ),

  getProduct: (id) =>
    _cached(`product:${id}`, () =>
      fetch(`${FAKESTORE}/products/${id}`)
        .then((r) => r.json())
        .then(normalizeProduct)
    ),

  getCategories: () =>
    _cached('categories', () =>
      fetch(`${FAKESTORE}/products/categories`).then((r) => r.json())
    ),

  getByCategory: (category) =>
    _cached(`category:${category}`, () =>
      fetch(`${FAKESTORE}/products/category/${encodeURIComponent(category)}`)
        .then((r) => r.json())
        .then((data) => data.map(normalizeProduct))
    ),
};

// ── Merged product fetcher — local Nigerian products + FakeStore ───────────
// Both sources now have price in ₦, so no further conversion is needed.
export const getMergedProducts = async (limit = 8) => {
  const apiProducts = await fakeStoreApi.getProducts(limit).catch(() => []);
  return [...localProducts, ...apiProducts];
};

// ── Universal product lookup — local catalog first, then FakeStore ─────────
export const getProductById = async (id) => {
  const numId = Number(id);
  const local = localProducts.find((p) => p.id === numId);
  if (local) return local;
  return fakeStoreApi.getProduct(id); // already normalized
};

// ── Display helpers — prices are ₦, no conversion needed ──────────────────
export const formatNaira = (nairaPrice) =>
  `₦${Math.round(nairaPrice).toLocaleString('en-NG')}`;

export const formatNairaPsych = (nairaPrice) =>
  `₦${toPsychPrice(Math.round(nairaPrice)).toLocaleString('en-NG')}`;

export default api;
