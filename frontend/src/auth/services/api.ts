const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' || !import.meta.env.VITE_API_URL;

// Demo users for testing
const DEMO_USERS: Record<string, { id: string; email: string; password: string; firstName: string; lastName: string; phone: string; isVerified: boolean; kycLevel: string; referralCode: string }> = {};

// Generate demo user ID
const generateUserId = () => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

interface RequestOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

class UserApiService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private currentUser: any = null;

  constructor() {
    this.accessToken = localStorage.getItem('user_access_token');
    this.refreshToken = localStorage.getItem('user_refresh_token');
    // Load demo users from localStorage
    const storedUsers = localStorage.getItem('demo_users');
    if (storedUsers) {
      Object.assign(DEMO_USERS, JSON.parse(storedUsers));
    }
    // Add default demo user
    if (!DEMO_USERS['demo@demo.com']) {
      DEMO_USERS['demo@demo.com'] = {
        id: 'demo-user-1',
        email: 'demo@demo.com',
        password: 'demo123',
        firstName: 'Demo',
        lastName: 'User',
        phone: '+1234567890',
        isVerified: true,
        kycLevel: 'BASIC',
        referralCode: 'DEMO123'
      };
    }
    // Add test user
    if (!DEMO_USERS['test@test.com']) {
      DEMO_USERS['test@test.com'] = {
        id: 'test-user-1',
        email: 'test@test.com',
        password: 'test123',
        firstName: 'Test',
        lastName: 'User',
        phone: '+0987654321',
        isVerified: true,
        kycLevel: 'NONE',
        referralCode: 'TEST456'
      };
    }
  }

  private saveDemoUsers() {
    localStorage.setItem('demo_users', JSON.stringify(DEMO_USERS));
  }

  setTokens(access: string | null, refresh: string | null) {
    this.accessToken = access;
    this.refreshToken = refresh;
    if (access) {
      localStorage.setItem('user_access_token', access);
    } else {
      localStorage.removeItem('user_access_token');
      this.currentUser = null;
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

  private isDemoMode(): boolean {
    return DEMO_MODE;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    // If in demo mode, use mock data
    if (this.isDemoMode()) {
      return this.handleDemoRequest<T>(endpoint, options);
    }

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

    try {
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
      }

      if (response.status === 401) {
        this.setTokens(null, null);
        window.dispatchEvent(new Event('user-logout'));
        throw new Error('Unauthorized');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error: any) {
      // If backend is not available, fallback to demo mode
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        console.warn('Backend not available, using demo mode');
        return this.handleDemoRequest<T>(endpoint, options);
      }
      throw error;
    }
  }

  private async handleDemoRequest<T>(endpoint: string, options: RequestOptions): Promise<T> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));

    const { method = 'GET', body } = options;

    // Registration
    if (endpoint === '/user/auth/register' && method === 'POST') {
      const { email, password, firstName = '', lastName = '', phone = '' } = body;

      if (DEMO_USERS[email]) {
        throw new Error('Email already registered');
      }

      const newUser = {
        id: generateUserId(),
        email,
        password,
        firstName,
        lastName,
        phone,
        isVerified: false,
        kycLevel: 'NONE',
        referralCode: Math.random().toString(36).substr(2, 8).toUpperCase()
      };

      DEMO_USERS[email] = newUser;
      this.saveDemoUsers();

      return {
        message: 'Registration successful. Please check your email to verify your account.',
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName
        }
      } as T;
    }

    // Login
    if (endpoint === '/user/auth/login' && method === 'POST') {
      const { email, password } = body;
      const user = DEMO_USERS[email];

      if (!user || user.password !== password) {
        throw new Error('Invalid email or password');
      }

      this.currentUser = user;
      const token = `demo_user_token_${user.id}_${Date.now()}`;

      return {
        accessToken: token,
        refreshToken: `refresh_${token}`,
        expiresIn: 3600,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isVerified: user.isVerified,
          kycLevel: user.kycLevel
        }
      } as T;
    }

    // Logout
    if (endpoint === '/user/auth/logout' && method === 'POST') {
      this.currentUser = null;
      return { message: 'Logged out successfully' } as T;
    }

    // Refresh tokens
    if (endpoint === '/user/auth/refresh' && method === 'POST') {
      const token = this.accessToken;
      if (token) {
        const userId = token.split('_')[3];
        const user = Object.values(DEMO_USERS).find(u => u.id === userId);
        if (user) {
          const newToken = `demo_user_token_${user.id}_${Date.now()}`;
          return {
            accessToken: newToken,
            refreshToken: `refresh_${newToken}`,
            expiresIn: 3600
          } as T;
        }
      }
      throw new Error('Invalid refresh token');
    }

    // Get profile
    if (endpoint === '/user/auth/me' && method === 'GET') {
      const token = this.accessToken;
      if (!token) throw new Error('Unauthorized');

      let user = this.currentUser;
      if (!user && token.includes('demo_user_token_')) {
        const userId = token.split('_')[3];
        user = Object.values(DEMO_USERS).find(u => u.id === userId);
      }

      if (!user) {
        user = DEMO_USERS['demo@demo.com'];
      }

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        isVerified: user.isVerified,
        kycLevel: user.kycLevel,
        referralCode: user.referralCode,
        createdAt: new Date().toISOString()
      } as T;
    }

    // Update profile
    if (endpoint === '/user/auth/me' && method === 'PUT') {
      const token = this.accessToken;
      if (!token) throw new Error('Unauthorized');

      let user = this.currentUser;
      if (!user && token.includes('demo_user_token_')) {
        const userId = token.split('_')[3];
        user = Object.values(DEMO_USERS).find(u => u.id === userId);
      }

      if (user && DEMO_USERS[user.email]) {
        Object.assign(DEMO_USERS[user.email], body);
        this.saveDemoUsers();
      }

      return {
        message: 'Profile updated successfully',
        user: { ...user, ...body }
      } as T;
    }

    // Change password
    if (endpoint === '/user/auth/change-password' && method === 'POST') {
      const { currentPassword, newPassword } = body;
      const token = this.accessToken;
      if (!token) throw new Error('Unauthorized');

      let user = this.currentUser;
      if (!user && token.includes('demo_user_token_')) {
        const userId = token.split('_')[3];
        user = Object.values(DEMO_USERS).find(u => u.id === userId);
      }

      if (user && DEMO_USERS[user.email]) {
        if (DEMO_USERS[user.email].password !== currentPassword) {
          throw new Error('Current password is incorrect');
        }
        DEMO_USERS[user.email].password = newPassword;
        this.saveDemoUsers();
      }

      return { message: 'Password changed successfully' } as T;
    }

    // Verify email
    if (endpoint === '/user/auth/verify-email' && method === 'POST') {
      return { message: 'Email verified successfully' } as T;
    }

    // Forgot password
    if (endpoint === '/user/auth/forgot-password' && method === 'POST') {
      return { message: 'Password reset link sent to your email' } as T;
    }

    // Reset password
    if (endpoint === '/user/auth/reset-password' && method === 'POST') {
      return { message: 'Password reset successfully' } as T;
    }

    // Sessions
    if (endpoint === '/user/auth/sessions' && method === 'GET') {
      return [
        {
          id: 'session-1',
          device: 'Chrome on Windows',
          ipAddress: '192.168.1.1',
          lastActive: new Date().toISOString(),
          isCurrent: true
        }
      ] as T;
    }

    // Revoke session
    if (endpoint.match(/\/user\/auth\/sessions\/[\w-]+$/) && method === 'DELETE') {
      return { message: 'Session revoked' } as T;
    }

    // My orders
    if (endpoint === '/orders/my' && method === 'GET') {
      return {
        data: Array.from({ length: 5 }, (_, i) => ({
          id: `order-${i + 1}`,
          code: `OX${100000 + i}`,
          fromCurrency: ['BTC', 'ETH', 'USDT'][Math.floor(Math.random() * 3)],
          toCurrency: ['EUR', 'USD', 'GBP'][Math.floor(Math.random() * 3)],
          fromAmount: (Math.random() * 1000).toFixed(2),
          toAmount: (Math.random() * 50000).toFixed(2),
          status: ['PENDING', 'APPROVED', 'COMPLETED'][Math.floor(Math.random() * 3)],
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        })),
        total: 5
      } as T;
    }

    // Validate promo
    if (endpoint === '/promo/validate' && method === 'POST') {
      const { code, amount } = body;
      const validCodes: Record<string, { type: string; value: number }> = {
        'WELCOME10': { type: 'DISCOUNT_PERCENT', value: 10 },
        'SAVE5': { type: 'DISCOUNT_PERCENT', value: 5 },
        'BONUS20': { type: 'BONUS', value: 20 },
        'ODIN15': { type: 'DISCOUNT_PERCENT', value: 15 }
      };

      const promo = validCodes[code.toUpperCase()];
      if (!promo) {
        throw new Error('Invalid promo code');
      }

      const discount = promo.type === 'DISCOUNT_PERCENT'
        ? amount * (promo.value / 100)
        : promo.value;

      return {
        valid: true,
        code: code.toUpperCase(),
        type: promo.type,
        value: promo.value,
        discount: discount.toFixed(2),
        message: `Promo code applied! You save ${discount.toFixed(2)}`
      } as T;
    }

    // Submit review
    if (endpoint === '/reviews/user' && method === 'POST') {
      return {
        id: `review-${Date.now()}`,
        ...body,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        message: 'Review submitted successfully and pending approval'
      } as T;
    }

    // Default fallback
    console.warn('Unhandled demo endpoint:', endpoint, method);
    return {} as T;
  }

  async refreshTokens(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE}/user/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (!response.ok) {
        this.setTokens(null, null);
        return false;
      }

      const data = await response.json();
      this.setTokens(data.accessToken, data.refreshToken);
      return true;
    } catch {
      // Try demo mode refresh
      if (this.isDemoMode()) {
        try {
          const result = await this.handleDemoRequest<any>('/user/auth/refresh', {
            method: 'POST',
            body: { refreshToken: this.refreshToken }
          });
          this.setTokens(result.accessToken, result.refreshToken);
          return true;
        } catch {
          this.setTokens(null, null);
          return false;
        }
      }
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
    return this.request<any>('/user/auth/me', {
      method: 'PUT',
      body: data,
    });
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

  // Orders
  async getMyOrders() {
    return this.request<any>('/orders/my');
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
