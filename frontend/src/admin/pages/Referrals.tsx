import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface Referral {
  id: string;
  code: string;
  status: string;
  rewardPaid: boolean;
  createdAt: string;
  referrer: { email: string };
  referred: { email: string };
}

interface ReferralStats {
  totalReferrals: number;
  convertedReferrals: number;
  conversionRate: number | string;
  totalRewardsPending: number;
  totalRewardsPaid: number;
}

const statusColors: Record<string, string> = {
  pending: 'text-yellow-400',
  converted: 'text-emerald-400',
};

export function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, limit: 20 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void loadStats();
  }, []);

  useEffect(() => {
    void loadReferrals();
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
      <h1 className="text-2xl font-bold text-white">Referrals</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          ['Total', stats?.totalReferrals ?? 0, 'text-white'],
          ['Converted', stats?.convertedReferrals ?? 0, 'text-emerald-400'],
          ['Conversion', `${stats?.conversionRate ?? 0}%`, 'text-blue-400'],
          ['Pending rewards', Number(stats?.totalRewardsPending ?? 0).toLocaleString(), 'text-yellow-400'],
          ['Paid rewards', Number(stats?.totalRewardsPaid ?? 0).toLocaleString(), 'text-emerald-400'],
        ].map(([label, value, color]) => (
          <div key={label as string} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="text-xs text-slate-400">{label}</div>
            <div className={`text-2xl font-semibold ${color}`}>{value as string | number}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <select
          value={status}
          onChange={e => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="converted">Converted</option>
        </select>
        <div className="text-sm text-slate-400">Total: {meta.total}</div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/40 text-slate-300">
              <tr>
                <th className="text-left px-4 py-3">Referrer</th>
                <th className="text-left px-4 py-3">Referred</th>
                <th className="text-left px-4 py-3">Code</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Reward paid</th>
                <th className="text-left px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    <Loader2 className="inline w-5 h-5 animate-spin mr-2" /> Loading...
                  </td>
                </tr>
              ) : referrals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">No referrals found</td>
                </tr>
              ) : (
                referrals.map(ref => (
                  <tr key={ref.id} className="border-t border-slate-700/40">
                    <td className="px-4 py-3 text-white">{ref.referrer?.email}</td>
                    <td className="px-4 py-3 text-white">{ref.referred?.email}</td>
                    <td className="px-4 py-3 text-slate-300 font-mono">{ref.code}</td>
                    <td className={`px-4 py-3 ${statusColors[ref.status] || 'text-slate-300'}`}>{ref.status}</td>
                    <td className="px-4 py-3 text-slate-300">{ref.rewardPaid ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3 text-slate-300">{new Date(ref.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm text-slate-300">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg disabled:opacity-50"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
