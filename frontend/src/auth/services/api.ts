const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class UserApiService {
  private tokenKey = 'user_token';

  private get token() {
    return localStorage.getItem(this.tokenKey);
  }

  private set token(value: string | null) {
    if (value) localStorage.setItem(this.tokenKey, value);
    else localStorage.removeItem(this.tokenKey);
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

  isLoggedIn() {
    return !!this.token;
  }

  async login(email: string, password: string) {
    const result = await this.request<{ accessToken: string; user: any }>('/auth/login', { method: 'POST', body: { email, password } as any });
    this.token = result.accessToken;
    return result;
  }

  async register(data: { email: string; password: string; firstName?: string; lastName?: string }) {
    return this.request('/auth/register', { method: 'POST', body: data as any });
  }

  async logout() {
    this.token = null;
  }

  async getProfile() {
    return this.request<any>('/auth/profile');
  }

  async updateProfile(data: any) {
    return this.request<any>('/auth/profile', { method: 'PUT', body: data as any });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } as any });
  }

  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', { method: 'POST', body: { email } as any });
  }

  async getSessions() {
    return this.request<any[]>('/auth/sessions');
  }

  async revokeSession(sessionId: string) {
    return this.request(`/auth/sessions/${sessionId}`, { method: 'DELETE' });
  }

  async validatePromo(code: string, amount: number) {
    return this.request<{ isValid: boolean; discount: number; message?: string }>('/promo/validate', { method: 'POST', body: { code, amount } as any });
  }
}

export const userApi = new UserApiService();
