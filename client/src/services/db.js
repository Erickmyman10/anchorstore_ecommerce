// Lightweight localStorage collection manager.
// All data lives under namespaced keys: "anchorsoft:<collection>".
// Each collection is a JSON array. Reads are always fresh from storage.

const NS  = 'anchorsoft';
const key = (col) => `${NS}:${col}`;

const read = (col) => {
  try {
    return JSON.parse(localStorage.getItem(key(col)) ?? '[]');
  } catch {
    return [];
  }
};

const write = (col, rows) =>
  localStorage.setItem(key(col), JSON.stringify(rows));

const db = {
  // ── Read ────────────────────────────────────────────────────────────────
  getAll:   (col)       => read(col),
  getById:  (col, id)   => read(col).find((r) => r.id === id) ?? null,
  findOne:  (col, pred) => read(col).find(pred) ?? null,
  findMany: (col, pred) => read(col).filter(pred),

  // ── Write ────────────────────────────────────────────────────────────────
  insert: (col, record) => {
    const rows = read(col);
    rows.push(record);
    write(col, rows);
    return record;
  },

  update: (col, id, patch) => {
    const updated = { ...patch, updatedAt: new Date().toISOString() };
    const rows    = read(col).map((r) => (r.id === id ? { ...r, ...updated } : r));
    write(col, rows);
    return rows.find((r) => r.id === id) ?? null;
  },

  remove: (col, id) => write(col, read(col).filter((r) => r.id !== id)),

  clear: (col) => write(col, []),

  // ── Utility ─────────────────────────────────────────────────────────────
  // Wipe all anchorsoft data from localStorage (dev/test only)
  purge: () => {
    Object.values(COL).forEach((col) => localStorage.removeItem(key(col)));
  },
};

// ── Collection name constants ──────────────────────────────────────────────
// Use these everywhere instead of raw strings to avoid typos.
export const COL = {
  USERS:     'users',
  CUSTOMERS: 'customers',
  ORDERS:    'orders',
  PAYMENTS:  'payments',
  REVIEWS:   'reviews',
};

export default db;
