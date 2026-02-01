import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  ShoppingCart,
  Users,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';

interface DashboardData {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  recentOrders: any[];
}

interface UserStats {
  total: number;
  active: number;
  verified: number;
}

interface ReviewStats {
  total: number;
  pending: number;
  averageRating: number;
}

export function DashboardPage() {
  const [period, setPeriod] = useState('24h');
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dashboardData, usersData, reviewsData] = await Promise.all([
        api.getDashboard(period),
        api.getUserStats(),
        api.getReviewStats(),
      ]);
      setDashboard(dashboardData);
      setUserStats(usersData);
      setReviewStats(reviewsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Orders',
      value: dashboard?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'emerald',
      link: '/admin/orders',
    },
    {
      label: 'Pending Orders',
      value: dashboard?.pendingOrders || 0,
      icon: Clock,
      color: 'yellow',
      link: '/admin/orders?status=PENDING',
    },
    {
      label: 'Total Users',
      value: userStats?.total || 0,
      icon: Users,
      color: 'blue',
      link: '/admin/users',
    },
    {
      label: 'Pending Reviews',
      value: reviewStats?.pending || 0,
      icon: MessageSquare,
      color: 'purple',
      link: '/admin/reviews?status=PENDING',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="flex items-center space-x-2">
          {['24h', '7d', '30d'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              to={stat.link}
              className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-slate-600/50 transition-colors group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-${stat.color}-500/10 rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-400`} />
                </div>
                <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value.toLocaleString()}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-emerald-400 hover:text-emerald-300">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {dashboard?.recentOrders?.slice(0, 5).map((order: any) => (
              <div
                key={order.id}
                className="flex items-center justify-between py-3 border-b border-slate-700/50 last:border-0"
              >
                <div>
                  <div className="font-medium text-white">{order.code}</div>
                  <div className="text-sm text-slate-400">
                    {order.fromAmount} {order.fromCurrency?.code} → {order.toCurrency?.code}
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.status === 'COMPLETED'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : order.status === 'PENDING'
                      ? 'bg-yellow-500/10 text-yellow-400'
                      : order.status === 'REJECTED'
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-blue-500/10 text-blue-400'
                  }`}
                >
                  {order.status}
                </span>
              </div>
            )) || (
              <div className="text-center text-slate-400 py-8">No recent orders</div>
            )}
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-slate-300">Completed Orders</span>
              </div>
              <span className="font-semibold text-white">{dashboard?.completedOrders || 0}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-slate-300">Verified Users</span>
              </div>
              <span className="font-semibold text-white">{userStats?.verified || 0}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span className="text-slate-300">Average Rating</span>
              </div>
              <span className="font-semibold text-white">
                {reviewStats?.averageRating?.toFixed(1) || '0.0'} / 5
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <span className="text-slate-300">Total Reviews</span>
              </div>
              <span className="font-semibold text-white">{reviewStats?.total || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
