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


const normalizeProduct = (p) => ({
  ...p,
  price:    toPsychPrice(Math.round(p.price * 1600)),
  category: CATEGORY_MAP[p.category] ?? p.category,
});

// ── Internal API service ───────────────────────────────────────────────────
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  _token = null;

  setToken(token)  { this._token = token; }
  clearToken()     { this._token = null; }
  getToken()       { return this._token; }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (this._token) headers['Authorization'] = `Bearer ${this._token}`;
    const config = { headers, ...options };
    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        let errMsg = `HTTP error! status: ${response.status}`;
        try { const body = await response.json(); errMsg = body.error || body.message || errMsg; } catch {}
        const err = new Error(errMsg);
        err.status = response.status;
        throw err;
      }
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  getProducts()                  { return this.request('/products'); }
  getProduct(id)                 { return this.request(`/products/${id}`); }
  getCategories()                { return this.request('/categories'); }
  // Username-based login used by admin portal
  login(credentials)             { return this.request('/auth/login',   { method: 'POST', body: JSON.stringify(credentials) }); }
  // Email-based login used by customer-facing app
  loginWithEmail(credentials)    { return this.request('/users/login',  { method: 'POST', body: JSON.stringify(credentials) }); }
  register(data)                 { return this.request('/auth/register', { method: 'POST', body: JSON.stringify(data) }); }
  getMe()                        { return this.request('/auth/me'); }
  createOrder(orderData)         { return this.request('/orders', { method: 'POST', body: JSON.stringify(orderData) }); }
  getMyOrders()                  { return this.request('/orders/my-orders'); }

  // Verifies a Paystack payment reference server-side.
  // Returns { verified: true } only when Paystack confirms the payment succeeded
  // and the amount paid matches the expected total.
  updateProfile(data)  { return this.request('/profiles/my', { method: 'PUT', body: JSON.stringify(data) }); }
  changePassword(data) { return this.request('/users/change-password', { method: 'PUT', body: JSON.stringify(data) }); }
  getMyProfile()       { return this.request('/profiles/logged-in'); }

  verifyPayment(reference, amount) {
    return this.request('/payments/verify', {
      method: 'POST',
      body: JSON.stringify({ reference, amount }),
    });
  }
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

// ── Backend product normalizer ─────────────────────────────────────────────
// Converts { category: { id, name } } → slug string matching CATEGORY_CONFIG
const slugifyCategory = (cat) => {
  const name = cat?.name ?? (typeof cat === 'string' ? cat : '');
  return name
    .toLowerCase()
    .replace(/[&]/g, ' ')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
};

import imageRegistry from '../Images/products/imageRegistry';

const normalizeBackendProduct = (p) => ({
  ...p,
  image:         imageRegistry[p.image] || p.image,
  images:        (p.images || []).map(f => imageRegistry[f] || f),
  category:      slugifyCategory(p.category),
  // Prisma uses camelCase; guard against snake_case from raw queries or future changes
  stockQuantity: p.stockQuantity ?? p.stock_quantity ?? null,
});

// ── Real API product fetcher ───────────────────────────────────────────────
export const getMergedProducts = async () => {
  const products = await api.getProducts();
  return Array.isArray(products) ? products.map(normalizeBackendProduct) : [];
};

// ── Real API single-product lookup ────────────────────────────────────────
export const getProductById = async (id) => {
  const product = await api.getProduct(id);
  return normalizeBackendProduct(product);
};

// ── Display helpers — prices are ₦, no conversion needed ──────────────────
export const formatNaira = (nairaPrice) =>
  `₦${Math.round(nairaPrice).toLocaleString('en-NG')}`;

export const formatNairaPsych = (nairaPrice) =>
  `₦${toPsychPrice(Math.round(nairaPrice)).toLocaleString('en-NG')}`;

export default api;
