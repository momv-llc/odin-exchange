import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { adminApi } from '../services/api';

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
    loadStats();
  }, [meta.page, status]);

  const loadStats = async () => {
    try {
      const data = await adminApi.get('/admin/referrals/stats');
      setStats(data);
    } catch {
      setStats(null);
    }
  };

  const loadReferrals = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('page', String(meta.page));
      params.append('limit', String(meta.limit));
      const data = await adminApi.get(`/admin/referrals?${params.toString()}`);
      const limit = data.limit || meta.limit;
      const total = data.total || 0;
      setReferrals(data.referrals || []);
      setMeta((prev) => ({ ...prev, total, limit, totalPages: Math.max(1, Math.ceil(total / limit)) }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Referrals</h1>
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

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <StatCard label="Total Referrals" value={stats.totalReferrals} />
          <StatCard label="Converted" value={stats.convertedReferrals} className="text-emerald-400" />
          <StatCard label="Conversion Rate" value={`${stats.conversionRate}%`} className="text-blue-400" />
          <StatCard label="Pending Rewards" value={Number(stats.totalRewardsPending).toLocaleString()} className="text-yellow-400" />
          <StatCard label="Paid Rewards" value={Number(stats.totalRewardsPaid).toLocaleString()} className="text-emerald-400" />
        </div>
      )}

      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-400" /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/30">
                  <tr>
                    <th className="text-left py-4 px-6 text-slate-400">Referrer</th>
                    <th className="text-left py-4 px-6 text-slate-400">Referred</th>
                    <th className="text-left py-4 px-6 text-slate-400">Code</th>
                    <th className="text-left py-4 px-6 text-slate-400">Status</th>
                    <th className="text-left py-4 px-6 text-slate-400">Reward paid</th>
                    <th className="text-left py-4 px-6 text-slate-400">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {referrals.map((referral) => (
                    <tr key={referral.id} className="hover:bg-slate-700/20">
                      <td className="py-4 px-6 text-white">{referral.referrer?.email}</td>
                      <td className="py-4 px-6 text-white">{referral.referred?.email}</td>
                      <td className="py-4 px-6 text-slate-300 font-mono">{referral.code}</td>
                      <td className="py-4 px-6"><span className={`px-3 py-1 rounded-full text-xs ${statusColors[referral.status] || 'bg-slate-500/10 text-slate-400'}`}>{referral.status}</span></td>
                      <td className="py-4 px-6 text-slate-300">{referral.rewardPaid ? 'Yes' : 'No'}</td>
                      <td className="py-4 px-6 text-slate-400">{new Date(referral.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {referrals.length === 0 && <div className="text-center py-10 text-slate-400">No data</div>}
            {meta.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 text-sm text-slate-400">
                <span>Page {meta.page} of {meta.totalPages}</span>
                <div className="space-x-2">
                  <button onClick={() => setMeta((prev) => ({ ...prev, page: prev.page - 1 }))} disabled={meta.page === 1} className="px-3 py-1 rounded-md bg-slate-700/40 disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={() => setMeta((prev) => ({ ...prev, page: prev.page + 1 }))} disabled={meta.page === meta.totalPages} className="px-3 py-1 rounded-md bg-slate-700/40 disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, className = 'text-white' }: { label: string; value: string | number; className?: string }) {
  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <div className="text-slate-400 text-sm">{label}</div>
      <div className={`text-2xl font-bold ${className}`}>{value}</div>
    </div>
  );
}
