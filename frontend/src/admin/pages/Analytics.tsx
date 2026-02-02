import { useState, useEffect } from 'react';
import axios from 'axios';

interface DashboardData {
  today: {
    orders: number;
    volume: number;
    activeUsers: number;
    pendingOrders: number;
  };
  totals: {
    users: number;
  };
  chartData: Array<{
    date: string;
    totalOrders: number;
    completedOrders: number;
    totalVolume: number;
    newUsers: number;
  }>;
}

export default function Analytics() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      const res = await axios.get('/api/admin/analytics/dashboard');
      setData(res.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Аналитика</h1>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="7d">7 дней</option>
          <option value="30d">30 дней</option>
          <option value="90d">90 дней</option>
        </select>
      </div>

      {/* Today Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Заказы сегодня</div>
          <div className="text-3xl font-bold text-blue-600">{data?.today.orders || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Объём сегодня</div>
          <div className="text-3xl font-bold text-green-600">${Number(data?.today.volume || 0).toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Активные пользователи</div>
          <div className="text-3xl font-bold text-purple-600">{data?.today.activeUsers || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Ожидают обработки</div>
          <div className="text-3xl font-bold text-yellow-600">{data?.today.pendingOrders || 0}</div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Динамика за период</h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          {data?.chartData && data.chartData.length > 0 ? (
            <div className="w-full px-4">
              <div className="flex items-end justify-between h-48 gap-1">
                {data.chartData.slice(-14).map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-blue-500 rounded-t"
                      style={{ height: `${Math.max(4, (day.totalOrders / Math.max(...data.chartData.map(d => d.totalOrders))) * 100)}%` }}
                    ></div>
                    <div className="text-xs text-gray-400 mt-1 transform -rotate-45 origin-left">
                      {new Date(day.date).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-gray-400">Нет данных для отображения</div>
          )}
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Данные по дням</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Дата</th>
                <th className="text-right p-4 text-sm font-medium text-gray-500">Заказы</th>
                <th className="text-right p-4 text-sm font-medium text-gray-500">Выполнено</th>
                <th className="text-right p-4 text-sm font-medium text-gray-500">Объём</th>
                <th className="text-right p-4 text-sm font-medium text-gray-500">Новые польз.</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data?.chartData?.slice(-7).reverse().map((day, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="p-4">{new Date(day.date).toLocaleDateString('ru')}</td>
                  <td className="p-4 text-right">{day.totalOrders}</td>
                  <td className="p-4 text-right text-green-600">{day.completedOrders}</td>
                  <td className="p-4 text-right">${Number(day.totalVolume).toLocaleString()}</td>
                  <td className="p-4 text-right">{day.newUsers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
