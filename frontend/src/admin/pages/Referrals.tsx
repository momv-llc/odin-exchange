import { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import { Loader2 } from 'lucide-react';

interface ReferralEntry {
  id: string;
  inviterId: string;
  referredId: string;
  status: string;
  rewardAmount: number;
  createdAt: string;
}

interface ReferralStats {
  totalReferrals: number;
  convertedReferrals: number;
  conversionRate: number;
  totalRewards: number;
}

export function ReferralsPage() {
  const [items, setItems] = useState<ReferralEntry[]>([]);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, limit: 20 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [page]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [list, s] = await Promise.all([
        adminApi.getReferrals({ page, limit: meta.limit }),
        adminApi.getReferralStats(),
      ]);
      setItems(list.referrals || list.items || []);
      setMeta({ total: list.total || 0, limit: list.limit || meta.limit });
      setStats(s);
    } catch (error) {
      console.error('Failed to load referrals', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Referrals</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat label="Total" value={stats?.totalReferrals ?? 0} />
        <Stat label="Converted" value={stats?.convertedReferrals ?? 0} />
        <Stat label="Conversion" value={`${(stats?.conversionRate ?? 0).toFixed(1)}%`} />
        <Stat label="Rewards" value={`$${(stats?.totalRewards ?? 0).toFixed(2)}`} />
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-900/60">
              <tr>
                <th className="px-4 py-3 text-left text-slate-400 text-sm">ID</th>
                <th className="px-4 py-3 text-left text-slate-400 text-sm">Inviter</th>
                <th className="px-4 py-3 text-left text-slate-400 text-sm">Referred</th>
                <th className="px-4 py-3 text-left text-slate-400 text-sm">Status</th>
                <th className="px-4 py-3 text-left text-slate-400 text-sm">Reward</th>
                <th className="px-4 py-3 text-left text-slate-400 text-sm">Created</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-t border-slate-700/50">
                  <td className="px-4 py-3 text-white text-sm">{item.id.slice(0, 8)}...</td>
                  <td className="px-4 py-3 text-slate-300 text-sm">{item.inviterId?.slice(0, 8)}...</td>
                  <td className="px-4 py-3 text-slate-300 text-sm">{item.referredId?.slice(0, 8)}...</td>
                  <td className="px-4 py-3 text-slate-300 text-sm">{item.status}</td>
                  <td className="px-4 py-3 text-slate-300 text-sm">${item.rewardAmount ?? 0}</td>
                  <td className="px-4 py-3 text-slate-300 text-sm">{new Date(item.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-2 rounded bg-slate-800 border border-slate-700 disabled:opacity-50">Prev</button>
        <span className="text-slate-400 text-sm">Page {page} / {totalPages}</span>
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-2 rounded bg-slate-800 border border-slate-700 disabled:opacity-50">Next</button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="text-xl font-semibold text-white">{value}</div>
    </div>
  );
}
