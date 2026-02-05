import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { adminApi } from '../services/api';

interface KycSubmission {
  id: string;
  status: string;
  level?: string;
  createdAt: string;
  user?: {
    email?: string;
    firstName?: string | null;
    lastName?: string | null;
  };
}

interface KycStats {
  total?: number;
  notStarted?: number;
  pending?: number;
  inReview?: number;
  approved?: number;
  rejected?: number;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-400',
  IN_REVIEW: 'bg-blue-500/10 text-blue-400',
  APPROVED: 'bg-emerald-500/10 text-emerald-400',
  REJECTED: 'bg-red-500/10 text-red-400',
  NOT_STARTED: 'bg-slate-500/10 text-slate-400',
  EXPIRED: 'bg-slate-500/10 text-slate-400',
};

export function KycPage() {
  const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
  const [stats, setStats] = useState<KycStats | null>(null);
  const [status, setStatus] = useState('');
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void loadStats();
  }, []);

  useEffect(() => {
    void loadSubmissions();
  }, [meta.page, status]);

  const loadStats = async () => {
    try {
      const result = await adminApi.getKycStats();
      setStats(result || null);
    } catch (error) {
      console.error('Failed to load KYC stats:', error);
    }
  };

  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(meta.page),
        limit: String(meta.limit),
      };
      if (status) params.status = status;

      const result = await adminApi.getKycSubmissions(params);
      setSubmissions(result.submissions || []);
      setMeta(prev => ({
        ...prev,
        page: Number(result.page || prev.page),
        limit: Number(result.limit || prev.limit),
        total: Number(result.total || 0),
      }));
    } catch (error) {
      console.error('Failed to load KYC submissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">KYC</h1>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <StatCard label="Всего" value={stats?.total ?? 0} valueClass="text-white" />
        <StatCard label="Не начато" value={stats?.notStarted ?? 0} valueClass="text-white" />
        <StatCard label="Ожидают" value={stats?.pending ?? 0} valueClass="text-yellow-400" />
        <StatCard label="На проверке" value={stats?.inReview ?? 0} valueClass="text-blue-400" />
        <StatCard label="Одобрено" value={stats?.approved ?? 0} valueClass="text-emerald-400" />
        <StatCard label="Отклонено" value={stats?.rejected ?? 0} valueClass="text-red-400" />
      </div>

      <div className="flex justify-end">
        <select
          value={status}
          onChange={e => {
            setStatus(e.target.value);
            setMeta(prev => ({ ...prev, page: 1 }));
          }}
          className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-400"
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_REVIEW">In review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
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
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">User</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Email</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Level</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Status</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {submissions.map(item => (
                    <tr key={item.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="py-4 px-6 text-white">{[item.user?.firstName, item.user?.lastName].filter(Boolean).join(' ') || '-'}</td>
                      <td className="py-4 px-6 text-white">{item.user?.email || '-'}</td>
                      <td className="py-4 px-6 text-slate-300">{item.level || '-'}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[item.status] || 'bg-slate-500/10 text-slate-400'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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

function StatCard({ label, value, valueClass }: { label: string; value: number; valueClass: string }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
      <div className="text-sm text-slate-400">{label}</div>
      <div className={`text-2xl font-semibold ${valueClass}`}>{value}</div>
    </div>
  );
}
