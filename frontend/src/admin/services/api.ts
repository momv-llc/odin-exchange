const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

interface RequestOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

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

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<any>('/admin/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  }

  async verify2FA(tempToken: string, code: string) {
    this.setToken(tempToken);
    return this.request<any>('/admin/auth/2fa/verify', {
      method: 'POST',
      body: { code },
    });
  }

  async getProfile() {
    return this.request<any>('/admin/auth/me');
  }

  // Dashboard
  async getDashboard(period: string = '24h') {
    return this.request<any>(`/admin/dashboard?period=${period}`);
  }

  // Orders
  async getOrders(params: Record<string, any> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/admin/orders?${query}`);
  }

  async getOrder(id: string) {
    return this.request<any>(`/admin/orders/${id}`);
  }

  async approveOrder(id: string) {
    return this.request<any>(`/admin/orders/${id}/approve`, { method: 'PATCH' });
  }

  async rejectOrder(id: string, reason: string) {
    return this.request<any>(`/admin/orders/${id}/reject`, {
      method: 'PATCH',
      body: { reason },
    });
  }

  async completeOrder(id: string) {
    return this.request<any>(`/admin/orders/${id}/complete`, { method: 'PATCH' });
  }

  // Users
  async getUsers(params: Record<string, any> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/admin/users?${query}`);
  }

  async getUser(id: string) {
    return this.request<any>(`/admin/users/${id}`);
  }

  async getUserStats() {
    return this.request<any>('/admin/users/stats');
  }

  async updateUserStatus(id: string, status: string, reason?: string) {
    return this.request<any>(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: { status, reason },
    });
  }

  // Reviews
  async getReviews(params: Record<string, any> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/admin/reviews?${query}`);
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

  async rejectReview(id: string, notes: string) {
    return this.request<any>(`/admin/reviews/${id}/reject`, {
      method: 'PATCH',
      body: { notes },
    });
  }

  // Promo
  async getPromos(params: Record<string, any> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/admin/promo?${query}`);
  }

  async getPromoStats() {
    return this.request<any>('/admin/promo/stats');
  }

  async createPromo(data: any) {
    return this.request<any>('/admin/promo', {
      method: 'POST',
      body: data,
    });
  }

  async updatePromo(id: string, data: any) {
    return this.request<any>(`/admin/promo/${id}`, {
      method: 'PATCH',
      body: data,
    });
  }

  async deletePromo(id: string) {
    return this.request<any>(`/admin/promo/${id}`, { method: 'DELETE' });
  }
}

export const api = new ApiService();
