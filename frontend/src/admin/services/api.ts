const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiService {
  private token: string | null = localStorage.getItem('admin_token');

  setToken(token: string | null) {
    this.token = token;
    if (token) localStorage.setItem('admin_token', token);
    else localStorage.removeItem('admin_token');
  }

  getToken() {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        ...(options.headers || {}),
      },
      body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Request failed (${response.status})`);
    }

    if (response.status === 204) return {} as T;
    return response.json();
  }

  get<T>(endpoint: string) { return this.request<T>(endpoint); }
  post<T>(endpoint: string, body?: unknown) { return this.request<T>(endpoint, { method: 'POST', body: body as BodyInit }); }
  put<T>(endpoint: string, body?: unknown) { return this.request<T>(endpoint, { method: 'PUT', body: body as BodyInit }); }
  patch<T>(endpoint: string, body?: unknown) { return this.request<T>(endpoint, { method: 'PATCH', body: body as BodyInit }); }
  delete<T>(endpoint: string) { return this.request<T>(endpoint, { method: 'DELETE' }); }

  login(email: string, password: string) {
    return this.post<{ requires2FA?: boolean; tempToken?: string; accessToken?: string }>('/admin/auth/login', { email, password });
  }

  verify2FA(tempToken: string, code: string) {
    return this.post<{ accessToken: string }>('/admin/auth/verify-2fa', { tempToken, code });
  }

  getProfile() {
    return this.get<any>('/admin/auth/profile');
  }

  getDashboard(period = '7d') { return this.get<any>(`/admin/dashboard?period=${period}`); }
  getUserStats() { return this.get<any>('/admin/users/stats'); }
  getReviewStats() { return this.get<any>('/admin/reviews/stats'); }

  getOrders(params: Record<string, any>) {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return this.get<any>(`/admin/orders${q ? `?${q}` : ''}`);
  }
  approveOrder(id: string) { return this.post(`/admin/orders/${id}/approve`); }
  rejectOrder(id: string, reason: string) { return this.post(`/admin/orders/${id}/reject`, { reason }); }
  completeOrder(id: string) { return this.post(`/admin/orders/${id}/complete`); }

  getUsers(params: Record<string, any>) {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return this.get<any>(`/admin/users${q ? `?${q}` : ''}`);
  }
  getUser(id: string) { return this.get<any>(`/admin/users/${id}`); }
  updateUserStatus(id: string, status: string) { return this.patch(`/admin/users/${id}/status`, { status }); }

  getReviews(params: Record<string, any>) {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return this.get<any>(`/admin/reviews${q ? `?${q}` : ''}`);
  }
  approveReview(id: string) { return this.post(`/admin/reviews/${id}/approve`); }
  rejectReview(id: string, reason: string) { return this.post(`/admin/reviews/${id}/reject`, { reason }); }

  getPromos(params: Record<string, any>) {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return this.get<any>(`/admin/promo${q ? `?${q}` : ''}`);
  }
  getPromoStats() { return this.get<any>('/admin/promo/stats'); }
  createPromo(data: any) { return this.post('/admin/promo', data); }
  updatePromo(id: string, data: any) { return this.put(`/admin/promo/${id}`, data); }
  deletePromo(id: string) { return this.delete(`/admin/promo/${id}`); }

  getAuditLogs(params: Record<string, any>) {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return this.get<any>(`/admin/audit/logs${q ? `?${q}` : ''}`);
  }
  getAuditAdmins() { return this.get<any>('/admin/audit/admins'); }
}

export const api = new ApiService();
export const adminApi = api;
