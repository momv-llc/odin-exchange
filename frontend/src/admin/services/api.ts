const normalizeApiBase = (base: string) =>
  base.replace('api.odineco.online', 'api.odineco.pro');
const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL || '/api/v1');

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

interface ApiErrorPayload {
  message?: string | string[];
  error?: string;
}

const unwrap = <T>(payload: unknown): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

const getErrorMessage = (payload: ApiErrorPayload) => {
  if (Array.isArray(payload?.message)) {
    return payload.message.join(', ');
  }
  return payload?.message || payload?.error || 'Request failed';
};

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('admin_token', token);
    } else {
      localStorage.removeItem('admin_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('admin_token');
    }
    return this.token;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;
    const token = this.getToken();

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
      },
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, config);

    if (response.status === 401) {
      this.setToken(null);
      window.location.href = '/admin/login';
      throw new Error('Unauthorized');
    }

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(getErrorMessage(payload));
    }

    return unwrap<T>(payload);
  }


  async get<T = any>(endpoint: string) {
    return this.request<T>(endpoint);
  }

  async post<T = any>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  async put<T = any>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  async patch<T = any>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, { method: 'PATCH', body });
  }

  async delete<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
  async login(email: string, password: string) {
    return this.request<any>('/admin/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  }

  async verify2FA(tempToken: string, code: string) {
    return this.request<any>('/admin/auth/2fa/verify', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tempToken}` },
      body: { code },
    });
  }

  async getProfile() {
    return this.request<any>('/admin/auth/me');
  }

  async setup2FA() {
    return this.request<any>('/admin/auth/2fa/setup', { method: 'POST' });
  }

  async confirm2FA(code: string) {
    return this.request<any>('/admin/auth/2fa/confirm', {
      method: 'POST',
      body: { code },
    });
  }

  async getDashboardStats(period = '24h') {
    return this.request<any>(`/admin/dashboard?period=${period}`);
  }

  async getOrders(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/admin/orders${query ? `?${query}` : ''}`);
  }

  async getOrder(id: string) {
    return this.request<any>(`/admin/orders/${id}`);
  }

  async approveOrder(id: string) {
    return this.request<any>(`/admin/orders/${id}/approve`, { method: 'PATCH' });
  }

  async completeOrder(id: string) {
    return this.request<any>(`/admin/orders/${id}/complete`, { method: 'PATCH' });
  }

  async rejectOrder(id: string, reason: string) {
    return this.request<any>(`/admin/orders/${id}/reject`, {
      method: 'PATCH',
      body: { reason },
    });
  }

  async getUsers(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/admin/users${query ? `?${query}` : ''}`);
  }

  async getUserStats() {
    return this.request<any>('/admin/users/stats');
  }

  async getUser(id: string) {
    return this.request<any>(`/admin/users/${id}`);
  }

  async updateUserStatus(id: string, status: string) {
    return this.request<any>(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
  }

  async getReviews(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/admin/reviews${query ? `?${query}` : ''}`);
  }

  async getReviewStats() {
    return this.request<any>('/admin/reviews/stats');
  }

  async approveReview(id: string, notes?: string) {
    return this.request<any>(`/admin/reviews/${id}/approve`, {
      method: 'PATCH',
      body: { notes },
    });
  }

  async rejectReview(id: string, notes?: string) {
    return this.request<any>(`/admin/reviews/${id}/reject`, {
      method: 'PATCH',
      body: { notes },
    });
  }

  async getPromos(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/admin/promo${query ? `?${query}` : ''}`);
  }

  async getPromoStats() {
    return this.request<any>('/admin/promo/stats');
  }

  async createPromo(data: unknown) {
    return this.request<any>('/admin/promo', {
      method: 'POST',
      body: data,
    });
  }

  async updatePromo(id: string, data: unknown) {
    return this.request<any>(`/admin/promo/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deletePromo(id: string) {
    return this.request<any>(`/admin/promo/${id}`, { method: 'DELETE' });
  }

  async getKycSubmissions(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/admin/kyc${query ? `?${query}` : ''}`);
  }

  async getKycStats() {
    return this.request<any>('/admin/kyc/stats');
  }

  async getReferrals(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/admin/referrals${query ? `?${query}` : ''}`);
  }

  async getReferralStats() {
    return this.request<any>('/admin/referrals/stats');
  }

  async getLocations(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/admin/locations${query ? `?${query}` : ''}`);
  }

  async createLocation(data: unknown) {
    return this.request<any>('/admin/locations', {
      method: 'POST',
      body: data,
    });
  }

  async updateLocation(id: string, data: unknown) {
    return this.request<any>(`/admin/locations/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteLocation(id: string) {
    return this.request<any>(`/admin/locations/${id}`, { method: 'DELETE' });
  }

  async getPaymentMethods(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/admin/payment-methods${query ? `?${query}` : ''}`);
  }

  async createPaymentMethod(data: unknown) {
    return this.request<any>('/admin/payment-methods', {
      method: 'POST',
      body: data,
    });
  }

  async updatePaymentMethod(id: string, data: unknown) {
    return this.request<any>(`/admin/payment-methods/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deletePaymentMethod(id: string) {
    return this.request<any>(`/admin/payment-methods/${id}`, { method: 'DELETE' });
  }

  async getTransfers(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/admin/transfers${query ? `?${query}` : ''}`);
  }

  async updateTransferStatus(id: string, data: unknown) {
    return this.request<any>(`/admin/transfers/${id}/status`, {
      method: 'PATCH',
      body: data,
    });
  }

  async getAuditLogs(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/admin/audit/logs${query ? `?${query}` : ''}`);
  }

  async getAuditAdmins() {
    return this.request<any>('/admin/audit/admins');
  }
}

export const api = new ApiService();
export const adminApi = api;
