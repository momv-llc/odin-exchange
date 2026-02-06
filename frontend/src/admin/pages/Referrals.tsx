import { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

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
  pending: 'bg-yellow-500/10 text-yellow-400',
  converted: 'bg-emerald-500/10 text-emerald-400',
};

export function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReferrals();
  }, [meta.page, status]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await adminApi.get('/admin/referrals/stats');
      setStats(data);
    } catch (error) {
      console.error('Failed to load referral stats:', error);
    }
  };

  const loadReferrals = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('page', meta.page.toString());
      params.append('limit', meta.limit.toString());

      const data = await adminApi.get(`/admin/referrals?${params.toString()}`);
      const limit = data.limit || meta.limit;
      const total = data.total || 0;
      setReferrals(data.referrals || []);
      setMeta((prev) => ({ ...prev, page: data.page || prev.page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) }));
    } catch (error) {
      console.error('Failed to load referrals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Referrals</h1>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-slate-800 rounded-xl p-4"><div className="text-slate-400 text-sm">Total</div><div className="text-2xl font-bold text-white">{stats.totalReferrals}</div></div>
          <div className="bg-slate-800 rounded-xl p-4"><div className="text-slate-400 text-sm">Converted</div><div className="text-2xl font-bold text-emerald-400">{stats.convertedReferrals}</div></div>
          <div className="bg-slate-800 rounded-xl p-4"><div className="text-slate-400 text-sm">Conversion</div><div className="text-2xl font-bold text-white">{stats.conversionRate}%</div></div>
          <div className="bg-slate-800 rounded-xl p-4"><div className="text-slate-400 text-sm">Pending</div><div className="text-2xl font-bold text-yellow-400">{Number(stats.totalRewardsPending).toLocaleString()}</div></div>
          <div className="bg-slate-800 rounded-xl p-4"><div className="text-slate-400 text-sm">Paid</div><div className="text-2xl font-bold text-emerald-400">{Number(stats.totalRewardsPaid).toLocaleString()}</div></div>
        </div>
      )}

      <div className="flex justify-end">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setMeta((prev) => ({ ...prev, page: 1 }));
          }}
          className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="converted">Converted</option>
        </select>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-emerald-400 animate-spin" /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/30"><tr><th className="text-left py-4 px-6">Referrer</th><th className="text-left py-4 px-6">Referred</th><th className="text-left py-4 px-6">Code</th><th className="text-left py-4 px-6">Status</th><th className="text-left py-4 px-6">Reward Paid</th><th className="text-left py-4 px-6">Created</th></tr></thead>
                <tbody className="divide-y divide-slate-700/50">
                  {referrals.map((referral) => (
                    <tr key={referral.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="py-4 px-6 text-white">{referral.referrer?.email}</td>
                      <td className="py-4 px-6 text-white">{referral.referred?.email}</td>
                      <td className="py-4 px-6 text-slate-300 font-mono">{referral.code}</td>
                      <td className="py-4 px-6"><span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[referral.status] || 'bg-slate-500/10 text-slate-400'}`}>{referral.status}</span></td>
                      <td className="py-4 px-6 text-slate-300">{referral.rewardPaid ? 'Yes' : 'No'}</td>
                      <td className="py-4 px-6 text-slate-400">{new Date(referral.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between p-4 text-sm text-slate-400">
              <span>Page {meta.page} of {meta.totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => setMeta((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))} disabled={meta.page === 1} className="px-3 py-1 rounded-md bg-slate-700/40 disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={() => setMeta((prev) => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))} disabled={meta.page >= meta.totalPages} className="px-3 py-1 rounded-md bg-slate-700/40 disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
