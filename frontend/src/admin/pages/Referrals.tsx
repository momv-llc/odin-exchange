import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Loader2 } from 'lucide-react';

interface ReferralEntry {
  id: string;
  status: string;
  createdAt: string;
  referrer?: { email?: string };
  referred?: { email?: string };
}

interface ReferralStats {
  totalReferrals: number;
  convertedReferrals: number;
  conversionRate: number | string;
  totalRewardsPending: number;
  totalRewardsPaid: number;
}

export function ReferralsPage() {
  const [referrals, setReferrals] = useState<ReferralEntry[]>([]);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, limit: 20 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadReferrals();
  }, [page, status]);

  const loadStats = async () => {
    try {
      const result = await api.getReferralStats();
      setStats(result);
    } catch (error) {
      console.error('Failed to load referral stats:', error);
    }
  };

  const loadReferrals = async () => {
    setIsLoading(true);
    try {
      const result = await api.getReferrals({ page, limit: meta.limit, status });
      setReferrals(result.referrals || []);
      setMeta({ total: result.total || 0, limit: result.limit || meta.limit });
    } catch (error) {
      console.error('Failed to load referrals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Referrals</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="text-sm text-slate-400">Всего рефералов</div>
          <div className="text-2xl font-semibold text-white">{stats?.totalReferrals ?? 0}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="text-sm text-slate-400">Конвертировано</div>
          <div className="text-2xl font-semibold text-emerald-400">{stats?.convertedReferrals ?? 0}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="text-sm text-slate-400">Конверсия</div>
          <div className="text-2xl font-semibold text-blue-400">{stats?.conversionRate ?? 0}%</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="text-sm text-slate-400">Ожидают выплат</div>
          <div className="text-2xl font-semibold text-yellow-400">
            {Number(stats?.totalRewardsPending ?? 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="text-sm text-slate-400">Выплачено</div>
          <div className="text-2xl font-semibold text-emerald-400">
            {Number(stats?.totalRewardsPaid ?? 0).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-400">Список рефералов</div>
        <select
          value={status}
          onChange={e => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-400"
        >
          <option value="">Все статусы</option>
          <option value="pending">Pending</option>
          <option value="converted">Converted</option>
        </select>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/30">
                  <tr>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Реферер</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Приглашённый</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Статус</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Создано</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {referrals.map(referral => (
                    <tr key={referral.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="py-4 px-6 text-white">{referral.referrer?.email || '—'}</td>
                      <td className="py-4 px-6 text-white">{referral.referred?.email || '—'}</td>
                      <td className="py-4 px-6 text-slate-300">{referral.status}</td>
                      <td className="py-4 px-6 text-slate-400">
                        {new Date(referral.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {referrals.length === 0 && (
              <div className="text-center py-12 text-slate-400">Нет данных для отображения</div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 text-sm text-slate-400">
                <span>
                  Страница {page} из {totalPages}
                </span>
                <div className="space-x-2">
                  <button
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 rounded-md bg-slate-700/40 disabled:opacity-50"
                  >
                    Назад
                  </button>
                  <button
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 rounded-md bg-slate-700/40 disabled:opacity-50"
                  >
                    Вперёд
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
