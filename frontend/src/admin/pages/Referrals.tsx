import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { adminApi } from '../services/api';

interface Referral {
  id: string;
  code: string;
  status: string;
  rewardPaid: boolean;
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
    void loadStats();
  }, []);

  useEffect(() => {
    void loadReferrals();
  }, [meta.page, status]);

  const loadStats = async () => {
    try {
      const data = await adminApi.getReferralStats();
      setStats(data || null);
    } catch (error) {
      console.error('Failed to load referral stats:', error);
    }
  };

  const loadReferrals = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(meta.page),
        limit: String(meta.limit),
      };

      if (status) {
        params.status = status;
      }

      const data = await adminApi.getReferrals(params);
      setReferrals(data.referrals || []);

      const nextLimit = Number(data.limit || meta.limit);
      const nextTotal = Number(data.total || 0);
      setMeta(prev => ({
        ...prev,
        page: Number(data.page || prev.page),
        limit: nextLimit,
        total: nextTotal,
        totalPages: Math.max(1, Math.ceil(nextTotal / nextLimit)),
      }));
    } catch (error) {
      console.error('Failed to load referrals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.max(1, meta.totalPages);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Referrals</h1>
        <select
          value={status}
          onChange={e => {
            setStatus(e.target.value);
            setMeta(prev => ({ ...prev, page: 1 }));
          }}
          className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-400"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="converted">Converted</option>
        </select>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-slate-800 rounded-xl p-4">
            <div className="text-slate-400 text-sm">Total Referrals</div>
            <div className="text-2xl font-bold text-white">{stats.totalReferrals}</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <div className="text-slate-400 text-sm">Converted</div>
            <div className="text-2xl font-bold text-emerald-400">{stats.convertedReferrals}</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <div className="text-slate-400 text-sm">Conversion Rate</div>
            <div className="text-2xl font-bold text-white">{stats.conversionRate}%</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <div className="text-slate-400 text-sm">Pending Rewards</div>
            <div className="text-2xl font-bold text-yellow-400">{Number(stats.totalRewardsPending).toLocaleString()}</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <div className="text-slate-400 text-sm">Paid Rewards</div>
            <div className="text-2xl font-bold text-emerald-400">{Number(stats.totalRewardsPaid).toLocaleString()}</div>
          </div>
        </div>
      )}

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
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Referrer</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Referred</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Code</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Status</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Reward Paid</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {referrals.map(referral => (
                    <tr key={referral.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="py-4 px-6 text-white">{referral.referrer?.email || '-'}</td>
                      <td className="py-4 px-6 text-white">{referral.referred?.email || '-'}</td>
                      <td className="py-4 px-6 text-slate-300 font-mono">{referral.code}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[referral.status] || 'bg-slate-500/10 text-slate-400'}`}>
                          {referral.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-300">{referral.rewardPaid ? 'Yes' : 'No'}</td>
                      <td className="py-4 px-6 text-slate-400">{new Date(referral.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {referrals.length === 0 && <div className="text-center py-12 text-slate-400">No referrals found</div>}

            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 text-sm text-slate-400">
                <span>
                  Page {meta.page} of {totalPages}
                </span>
                <div className="space-x-2">
                  <button
                    onClick={() => setMeta(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={meta.page === 1}
                    className="px-3 py-1 rounded-md bg-slate-700/40 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setMeta(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
                    disabled={meta.page === totalPages}
                    className="px-3 py-1 rounded-md bg-slate-700/40 disabled:opacity-50"
                  >
                    Next
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
