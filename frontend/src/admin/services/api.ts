<<<<<<< Updated upstream
// API Configuration
const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' || !import.meta.env.VITE_API_URL;

// Demo admin credentials
const DEMO_ADMINS = [
  { id: 'admin-1', email: 'admin@odin.exchange', password: 'admin123', role: 'SUPER_ADMIN', is2faEnabled: false },
  { id: 'admin-2', email: 'operator@odin.exchange', password: 'operator123', role: 'OPERATOR', is2faEnabled: false },
  { id: 'admin-3', email: 'demo@demo.com', password: 'demo', role: 'ADMIN', is2faEnabled: false },
];

// Demo data generators
const generateDemoOrders = () => {
  const statuses = ['PENDING', 'APPROVED', 'COMPLETED', 'REJECTED'];
  const currencies = ['BTC', 'ETH', 'USDT', 'EUR', 'USD'];
  return Array.from({ length: 50 }, (_, i) => ({
    id: `order-${i + 1}`,
    code: `OX${String(100000 + i).slice(1)}`,
    fromCurrency: currencies[Math.floor(Math.random() * currencies.length)],
    toCurrency: currencies[Math.floor(Math.random() * currencies.length)],
    fromAmount: (Math.random() * 10000).toFixed(2),
    toAmount: (Math.random() * 10000).toFixed(2),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    clientEmail: `client${i}@example.com`,
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  }));
};

const generateDemoUsers = () => {
  const statuses = ['ACTIVE', 'INACTIVE', 'BANNED'];
  return Array.from({ length: 100 }, (_, i) => ({
    id: `user-${i + 1}`,
    email: `user${i + 1}@example.com`,
    firstName: ['John', 'Jane', 'Alex', 'Maria', 'David'][Math.floor(Math.random() * 5)],
    lastName: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][Math.floor(Math.random() * 5)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    isVerified: Math.random() > 0.3,
    kycLevel: ['NONE', 'BASIC', 'INTERMEDIATE', 'ADVANCED'][Math.floor(Math.random() * 4)],
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastLoginAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  }));
};

const generateDemoReviews = () => {
  const statuses = ['PENDING', 'APPROVED', 'REJECTED'];
  const comments = [
    'Great service!', 'Fast and reliable', 'Best exchange ever',
    'Good rates', 'Excellent support', 'Quick transaction',
    'Very professional', 'Highly recommended', 'Amazing experience'
  ];
  return Array.from({ length: 200 }, (_, i) => ({
    id: `review-${i + 1}`,
    authorName: `User ${i + 1}`,
    authorEmail: `user${i + 1}@example.com`,
    rating: Math.floor(Math.random() * 3) + 3,
    content: comments[Math.floor(Math.random() * comments.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  }));
};

const generateDemoPromos = () => {
  const types = ['DISCOUNT_PERCENT', 'DISCOUNT_FIXED', 'BONUS'];
  return Array.from({ length: 15 }, (_, i) => ({
    id: `promo-${i + 1}`,
    code: `PROMO${i + 1}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
    type: types[Math.floor(Math.random() * types.length)],
    value: Math.floor(Math.random() * 20) + 5,
    description: `Promotional discount ${i + 1}`,
    usedCount: Math.floor(Math.random() * 100),
    maxUses: Math.floor(Math.random() * 200) + 50,
    isActive: Math.random() > 0.2,
    validFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  }));
};

const generateDemoDashboard = (period: string) => {
  const multiplier = period === '7d' ? 7 : period === '30d' ? 30 : 1;
  return {
    stats: {
      totalOrders: Math.floor(150 * multiplier),
      completedOrders: Math.floor(120 * multiplier),
      pendingOrders: Math.floor(25 * multiplier),
      totalVolume: (25000 * multiplier).toFixed(2),
      totalRevenue: (1250 * multiplier).toFixed(2),
      activeUsers: Math.floor(500 * Math.sqrt(multiplier)),
      newUsers: Math.floor(50 * multiplier),
      conversionRate: (3.5 + Math.random()).toFixed(2),
    },
    recentOrders: generateDemoOrders().slice(0, 10),
    chartData: Array.from({ length: multiplier }, (_, i) => ({
      date: new Date(Date.now() - (multiplier - i - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      orders: Math.floor(Math.random() * 50) + 20,
      volume: Math.floor(Math.random() * 10000) + 5000,
      users: Math.floor(Math.random() * 30) + 10,
    })),
    topCurrencies: [
      { currency: 'BTC', volume: '125000.00', percentage: 35 },
      { currency: 'ETH', volume: '85000.00', percentage: 24 },
      { currency: 'USDT', volume: '65000.00', percentage: 18 },
      { currency: 'EUR', volume: '45000.00', percentage: 13 },
      { currency: 'USD', volume: '35000.00', percentage: 10 },
    ],
  };
};

// Demo data cache
let demoOrders = generateDemoOrders();
let demoUsers = generateDemoUsers();
let demoReviews = generateDemoReviews();
let demoPromos = generateDemoPromos();
=======
const API_BASE = import.meta.env.VITE_API_URL;
if (!API_BASE) {
  throw new Error('VITE_API_URL is not defined');
}

>>>>>>> Stashed changes

interface RequestOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

class ApiService {
  private token: string | null = null;
  private currentAdmin: any = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('admin_token', token);
    } else {
      localStorage.removeItem('admin_token');
      this.currentAdmin = null;
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('admin_token');
    }
    return this.token;
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

    try {
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

    // Auth endpoints
    if (endpoint === '/admin/auth/login' && method === 'POST') {
      const { email, password } = body;
      const admin = DEMO_ADMINS.find(a => a.email === email && a.password === password);

      if (!admin) {
        throw new Error('Invalid email or password');
      }

      this.currentAdmin = admin;
      const token = `demo_token_${admin.id}_${Date.now()}`;

      if (admin.is2faEnabled) {
        return {
          requiresTwoFactor: true,
          tempToken: token,
        } as T;
      }

      return {
        accessToken: token,
        refreshToken: `refresh_${token}`,
        expiresIn: 900,
      } as T;
    }

    if (endpoint === '/admin/auth/2fa/verify' && method === 'POST') {
      const { code } = body;
      if (code === '123456') {
        return {
          accessToken: `verified_${this.getToken()}`,
          refreshToken: `refresh_verified_${this.getToken()}`,
          expiresIn: 900,
        } as T;
      }
      throw new Error('Invalid 2FA code');
    }

    if (endpoint === '/admin/auth/me') {
      const token = this.getToken();
      if (!token) throw new Error('Unauthorized');

      // Find admin from token
      const adminId = token.split('_')[2];
      const admin = DEMO_ADMINS.find(a => a.id === adminId) || this.currentAdmin || DEMO_ADMINS[0];

      return {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        is2faEnabled: admin.is2faEnabled,
        lastLoginAt: new Date().toISOString(),
      } as T;
    }

    // Dashboard
    if (endpoint.startsWith('/admin/dashboard')) {
      const period = new URLSearchParams(endpoint.split('?')[1] || '').get('period') || '24h';
      return generateDemoDashboard(period) as T;
    }

    // Orders
    if (endpoint.startsWith('/admin/orders') && method === 'GET') {
      const params = new URLSearchParams(endpoint.split('?')[1] || '');
      const page = parseInt(params.get('page') || '1');
      const limit = parseInt(params.get('limit') || '20');
      const status = params.get('status');

      let filtered = demoOrders;
      if (status) {
        filtered = filtered.filter(o => o.status === status);
      }

      const start = (page - 1) * limit;
      return {
        data: filtered.slice(start, start + limit),
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
      } as T;
    }

    if (endpoint.match(/\/admin\/orders\/[\w-]+$/) && method === 'GET') {
      const id = endpoint.split('/').pop();
      const order = demoOrders.find(o => o.id === id);
      if (!order) throw new Error('Order not found');
      return order as T;
    }

    if (endpoint.includes('/approve') && method === 'PATCH') {
      const id = endpoint.split('/')[3];
      const order = demoOrders.find(o => o.id === id);
      if (order) order.status = 'APPROVED';
      return { success: true, message: 'Order approved' } as T;
    }

    if (endpoint.includes('/complete') && method === 'PATCH') {
      const id = endpoint.split('/')[3];
      const order = demoOrders.find(o => o.id === id);
      if (order) order.status = 'COMPLETED';
      return { success: true, message: 'Order completed' } as T;
    }

    if (endpoint.includes('/reject') && method === 'PATCH') {
      const id = endpoint.split('/')[3];
      const order = demoOrders.find(o => o.id === id);
      if (order) order.status = 'REJECTED';
      return { success: true, message: 'Order rejected' } as T;
    }

    // Users
    if (endpoint.startsWith('/admin/users') && !endpoint.includes('/stats') && method === 'GET') {
      const params = new URLSearchParams(endpoint.split('?')[1] || '');
      const page = parseInt(params.get('page') || '1');
      const limit = parseInt(params.get('limit') || '20');
      const status = params.get('status');

      let filtered = demoUsers;
      if (status) {
        filtered = filtered.filter(u => u.status === status);
      }

      const start = (page - 1) * limit;
      return {
        data: filtered.slice(start, start + limit),
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
      } as T;
    }

    if (endpoint === '/admin/users/stats') {
      return {
        total: demoUsers.length,
        active: demoUsers.filter(u => u.status === 'ACTIVE').length,
        verified: demoUsers.filter(u => u.isVerified).length,
        newToday: 5,
        newThisWeek: 35,
      } as T;
    }

    // Reviews
    if (endpoint.startsWith('/admin/reviews') && !endpoint.includes('/stats') && method === 'GET') {
      const params = new URLSearchParams(endpoint.split('?')[1] || '');
      const page = parseInt(params.get('page') || '1');
      const limit = parseInt(params.get('limit') || '20');
      const status = params.get('status');

      let filtered = demoReviews;
      if (status) {
        filtered = filtered.filter(r => r.status === status);
      }

      const start = (page - 1) * limit;
      return {
        data: filtered.slice(start, start + limit),
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
      } as T;
    }

    if (endpoint === '/admin/reviews/stats') {
      return {
        total: demoReviews.length,
        pending: demoReviews.filter(r => r.status === 'PENDING').length,
        approved: demoReviews.filter(r => r.status === 'APPROVED').length,
        rejected: demoReviews.filter(r => r.status === 'REJECTED').length,
        averageRating: 4.5,
      } as T;
    }

    if (endpoint.includes('/reviews/') && endpoint.includes('/approve') && method === 'PATCH') {
      const id = endpoint.split('/')[3];
      const review = demoReviews.find(r => r.id === id);
      if (review) review.status = 'APPROVED';
      return { success: true } as T;
    }

    if (endpoint.includes('/reviews/') && endpoint.includes('/reject') && method === 'PATCH') {
      const id = endpoint.split('/')[3];
      const review = demoReviews.find(r => r.id === id);
      if (review) review.status = 'REJECTED';
      return { success: true } as T;
    }

    // Promo
    if (endpoint.startsWith('/admin/promo') && !endpoint.includes('/stats') && method === 'GET') {
      const params = new URLSearchParams(endpoint.split('?')[1] || '');
      const page = parseInt(params.get('page') || '1');
      const limit = parseInt(params.get('limit') || '20');

      const start = (page - 1) * limit;
      return {
        data: demoPromos.slice(start, start + limit),
        total: demoPromos.length,
        page,
        limit,
        totalPages: Math.ceil(demoPromos.length / limit),
      } as T;
    }

    if (endpoint === '/admin/promo/stats') {
      return {
        total: demoPromos.length,
        active: demoPromos.filter(p => p.isActive).length,
        totalUsed: demoPromos.reduce((acc, p) => acc + p.usedCount, 0),
        totalSavings: '12500.00',
      } as T;
    }

    if (endpoint === '/admin/promo' && method === 'POST') {
      const newPromo = {
        id: `promo-${Date.now()}`,
        ...body,
        usedCount: 0,
        createdAt: new Date().toISOString(),
      };
      demoPromos.unshift(newPromo);
      return newPromo as T;
    }

    if (endpoint.match(/\/admin\/promo\/[\w-]+$/) && method === 'PATCH') {
      const id = endpoint.split('/').pop();
      const index = demoPromos.findIndex(p => p.id === id);
      if (index !== -1) {
        demoPromos[index] = { ...demoPromos[index], ...body };
        return demoPromos[index] as T;
      }
      throw new Error('Promo not found');
    }

    if (endpoint.match(/\/admin\/promo\/[\w-]+$/) && method === 'DELETE') {
      const id = endpoint.split('/').pop();
      demoPromos = demoPromos.filter(p => p.id !== id);
      return { success: true } as T;
    }

    // Transfers
    if (endpoint.startsWith('/admin/transfers')) {
      return {
        data: Array.from({ length: 20 }, (_, i) => ({
          id: `transfer-${i + 1}`,
          code: `MT${100000 + i}`,
          senderName: `Sender ${i + 1}`,
          recipientName: `Recipient ${i + 1}`,
          amount: (Math.random() * 5000 + 100).toFixed(2),
          currency: 'EUR',
          status: ['PENDING', 'PROCESSING', 'COMPLETED'][Math.floor(Math.random() * 3)],
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        })),
        total: 50,
        page: 1,
        limit: 20,
      } as T;
    }

    // Locations
    if (endpoint.startsWith('/admin/locations')) {
      return {
        countries: [
          { id: 'de', code: 'DE', nameEn: 'Germany', isActive: true },
          { id: 'at', code: 'AT', nameEn: 'Austria', isActive: true },
          { id: 'ch', code: 'CH', nameEn: 'Switzerland', isActive: true },
        ],
        cities: [
          { id: 'berlin', nameEn: 'Berlin', countryId: 'de', isActive: true },
          { id: 'munich', nameEn: 'Munich', countryId: 'de', isActive: true },
          { id: 'vienna', nameEn: 'Vienna', countryId: 'at', isActive: true },
        ],
      } as T;
    }

    // Payment Methods
    if (endpoint.startsWith('/admin/payment-methods')) {
      return {
        data: [
          { id: 'cash', type: 'CASH', nameEn: 'Cash', isActive: true },
          { id: 'card', type: 'CARD', nameEn: 'Bank Card', isActive: true },
          { id: 'sepa', type: 'BANK_TRANSFER', nameEn: 'SEPA Transfer', isActive: true },
        ],
        total: 3,
      } as T;
    }

    // Default fallback
    console.warn('Unhandled demo endpoint:', endpoint);
    return {} as T;
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

  // Transfers
  async getTransfers(params: Record<string, any> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/admin/transfers?${query}`);
  }

  // Locations
  async getLocations() {
    return this.request<any>('/admin/locations');
  }

  // Payment Methods
  async getPaymentMethods(params: Record<string, any> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/admin/payment-methods?${query}`);
  }
}

export const api = new ApiService();
