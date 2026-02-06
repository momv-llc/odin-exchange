const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

const getErrorMessage = (payload: any) => {
  if (Array.isArray(payload?.message)) return payload.message.join(', ');
  return payload?.message || payload?.error || 'Request failed';
};

class AdminApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) localStorage.setItem('admin_token', token);
    else localStorage.removeItem('admin_token');
  }

  getToken() {
    if (!this.token) this.token = localStorage.getItem('admin_token');
    return this.token;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const token = this.getToken();
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    });

    if (response.status === 401) {
      this.setToken(null);
      throw new Error('Unauthorized');
    }

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(getErrorMessage(payload));

    return (payload?.data ?? payload) as T;
  }

  get<T>(endpoint: string) { return this.request<T>(endpoint); }
  post<T>(endpoint: string, body?: unknown) { return this.request<T>(endpoint, { method: 'POST', body }); }
  put<T>(endpoint: string, body?: unknown) { return this.request<T>(endpoint, { method: 'PUT', body }); }
  patch<T>(endpoint: string, body?: unknown) { return this.request<T>(endpoint, { method: 'PATCH', body }); }
  delete<T>(endpoint: string) { return this.request<T>(endpoint, { method: 'DELETE' }); }

  login(email: string, password: string) { return this.post<any>('/admin/auth/login', { email, password }); }
  verify2FA(tempToken: string, code: string) {
    return this.request<any>('/admin/auth/2fa/verify', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tempToken}` },
      body: { code },
    });
  }
  getProfile() { return this.get<any>('/admin/auth/me'); }

  getDashboard(period: string = '24h') { return this.get<any>(`/admin/dashboard?period=${period}`); }
  getDashboardStats(period: string = '24h') { return this.getDashboard(period); }

  getOrders(params: Record<string, any> = {}) { return this.get<any>(`/admin/orders?${new URLSearchParams(params).toString()}`); }
  approveOrder(id: string) { return this.patch<any>(`/admin/orders/${id}/approve`); }
  completeOrder(id: string) { return this.patch<any>(`/admin/orders/${id}/complete`); }
  rejectOrder(id: string, reason: string) { return this.patch<any>(`/admin/orders/${id}/reject`, { reason }); }

  getUsers(params: Record<string, any> = {}) { return this.get<any>(`/admin/users?${new URLSearchParams(params).toString()}`); }
  getUserStats() { return this.get<any>('/admin/users/stats'); }
  getUser(id: string) { return this.get<any>(`/admin/users/${id}`); }
  updateUserStatus(id: string, status: string) { return this.patch<any>(`/admin/users/${id}/status`, { status }); }

  getReviews(params: Record<string, any> = {}) { return this.get<any>(`/admin/reviews?${new URLSearchParams(params).toString()}`); }
  getReviewStats() { return this.get<any>('/admin/reviews/stats'); }
  approveReview(id: string) { return this.patch<any>(`/admin/reviews/${id}/approve`); }
  rejectReview(id: string, notes?: string) { return this.patch<any>(`/admin/reviews/${id}/reject`, { notes }); }

  getPromos(params: Record<string, any> = {}) { return this.get<any>(`/admin/promo?${new URLSearchParams(params).toString()}`); }
  getPromoStats() { return this.get<any>('/admin/promo/stats'); }
  createPromo(data: any) { return this.post<any>('/admin/promo', data); }
  updatePromo(id: string, data: any) { return this.put<any>(`/admin/promo/${id}`, data); }
  deletePromo(id: string) { return this.delete<any>(`/admin/promo/${id}`); }

  getAuditLogs(params: Record<string, any> = {}) { return this.get<any>(`/admin/audit?${new URLSearchParams(params).toString()}`); }
  getAuditAdmins() { return this.get<any>('/admin/audit/admins'); }
}

export const api = new AdminApiService();
export const adminApi = api;
