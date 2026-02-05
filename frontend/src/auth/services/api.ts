// Use the real API base URL for auth/profile flows (with local fallback).
const API_BASE = (import.meta.env.VITE_API_URL || '/api/v1').replace(
  'api.odineco.online',
  'api.odineco.pro'
);

interface RequestOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

interface ApiErrorPayload {
  message?: string | string[];
  error?: string;
}

const unwrap = <T>(payload: any): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data as T;
  }
  return payload as T;
};

const getErrorMessage = (payload: ApiErrorPayload) => {
  if (Array.isArray(payload?.message)) {
    return payload.message.join(', ');
  }
  return payload?.message || payload?.error || 'Request failed';
};

class UserApiService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.accessToken = localStorage.getItem('user_access_token');
    this.refreshToken = localStorage.getItem('user_refresh_token');
  }

  setTokens(access: string | null, refresh: string | null) {
    this.accessToken = access;
    this.refreshToken = refresh;
    if (access) {
      localStorage.setItem('user_access_token', access);
    } else {
      localStorage.removeItem('user_access_token');
    }
    if (refresh) {
      localStorage.setItem('user_refresh_token', refresh);
    } else {
      localStorage.removeItem('user_refresh_token');
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isLoggedIn(): boolean {
    return !!this.accessToken;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(this.accessToken && { Authorization: `Bearer ${this.accessToken}` }),
        ...headers,
      },
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    let response = await fetch(`${API_BASE}${endpoint}`, config);

    if (response.status === 401 && this.refreshToken) {
      const refreshed = await this.refreshTokens();
      if (refreshed) {
        config.headers = {
          ...config.headers as Record<string, string>,
          Authorization: `Bearer ${this.accessToken}`,
        };
        response = await fetch(`${API_BASE}${endpoint}`, config);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error: any) {
      throw error;
    }
    }

    if (response.status === 401) {
      this.setTokens(null, null);
      window.dispatchEvent(new Event('user-logout'));
      throw new Error('Unauthorized');
    }

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(getErrorMessage(payload));
    }

    return unwrap<T>(payload);
  }

  async refreshTokens(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE}/user/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      const payload = await response.json();

      if (!response.ok) {
        this.setTokens(null, null);
        return false;
      }

      const data = unwrap<{ accessToken: string; refreshToken: string }>(payload);
      this.setTokens(data.accessToken, data.refreshToken);
      return true;
    } catch {
      this.setTokens(null, null);
      return false;
    }
  }

  // Auth endpoints
  async register(data: { email: string; password: string; firstName?: string; lastName?: string; phone?: string }) {
    return this.request<any>('/user/auth/register', {
      method: 'POST',
      body: data,
    });
  }

  async login(email: string, password: string) {
    const result = await this.request<any>('/user/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    this.setTokens(result.accessToken, result.refreshToken);
    return result;
  }

  async logout() {
    if (this.refreshToken) {
      try {
        await this.request('/user/auth/logout', {
          method: 'POST',
          body: { refreshToken: this.refreshToken },
        });
      } catch {
        // Ignore logout errors
      }
    }
    this.setTokens(null, null);
  }

  async verifyEmail(token: string) {
    return this.request<any>('/user/auth/verify-email', {
      method: 'POST',
      body: { token },
    });
  }

  async forgotPassword(email: string) {
    return this.request<any>('/user/auth/forgot-password', {
      method: 'POST',
      body: { email },
    });
  }

  async resetPassword(token: string, password: string) {
    return this.request<any>('/user/auth/reset-password', {
      method: 'POST',
      body: { token, password },
    });
  }

  async getProfile() {
    return this.request<any>('/user/auth/me');
  }

  async updateProfile(data: { firstName?: string; lastName?: string; phone?: string; preferredLang?: string }) {
    const result = await this.request<any>('/user/auth/me', {
      method: 'PUT',
      body: data,
    });
    return result.user ?? result;
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request<any>('/user/auth/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword },
    });
  }

  async getSessions() {
    return this.request<any[]>('/user/auth/sessions');
  }

  async revokeSession(sessionId: string) {
    return this.request<any>(`/user/auth/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  // Promo
  async validatePromo(code: string, amount: number) {
    return this.request<any>('/promo/validate', {
      method: 'POST',
      body: { code, amount },
    });
  }

  // Reviews
  async submitReview(data: { rating: number; title?: string; content: string; orderId?: string }) {
    return this.request<any>('/reviews/user', {
      method: 'POST',
      body: { ...data, authorName: 'User' },
    });
  }
}

export const userApi = new UserApiService();
