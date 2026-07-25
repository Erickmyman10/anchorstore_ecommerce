const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class AdminApiService {
  async request(endpoint, options = {}) {
    const adminToken = localStorage.getItem('adminToken');
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(adminToken && { Authorization: `Bearer ${adminToken}` }),
        ...options.headers,
      },
      ...options,
    };
    const response = await fetch(url, config);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Admin request failed');
    return data;
  }

  login(credentials)          { return this.request('/admin/auth/login',  { method: 'POST', body: JSON.stringify(credentials) }); }
  promote(data)                { return this.request('/admin/auth/promote', { method: 'POST', body: JSON.stringify(data) }); }
  getStats()                   { return this.request('/admin/stats'); }
  getAllOrders()                { return this.request('/admin/orders'); }
  getAllUsers()                 { return this.request('/admin/users'); }
  getAllProducts()              { return this.request('/admin/products'); }
  createProduct(data)          { return this.request('/admin/products',          { method: 'POST',   body: JSON.stringify(data) }); }
  updateProduct(id, data)      { return this.request(`/admin/products/${id}`,    { method: 'PUT',    body: JSON.stringify(data) }); }
  deleteProduct(id)            { return this.request(`/admin/products/${id}`,    { method: 'DELETE' }); }
  updateOrderStatus(id, status){ return this.request(`/admin/orders/${id}/status`, { method: 'PATCH',  body: JSON.stringify({ status }) }); }
  logout()                     { localStorage.removeItem('adminToken'); }
}

export const adminApi = new AdminApiService();
export default adminApi;
