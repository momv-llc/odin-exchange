import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface KycSubmission {
  id: string;
  status: string;
  level: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

interface KycStats {
  total: number;
  notStarted: number;
  pending: number;
  inReview: number;
  approved: number;
  rejected: number;
}

const statusClass: Record<string, string> = {
  PENDING: 'text-yellow-400',
  IN_REVIEW: 'text-blue-400',
  APPROVED: 'text-emerald-400',
  REJECTED: 'text-red-400',
  NOT_STARTED: 'text-slate-400',
};

export function KycPage() {
  const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
  const [stats, setStats] = useState<KycStats | null>(null);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, limit: 20 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void loadStats();
  }, []);

  useEffect(() => {
    void loadSubmissions();
  }, [page, status]);

  const loadStats = async () => {
    try {
      const result = await api.getKycStats();
      setStats(result);
    } catch (error) {
      console.error('Failed to load KYC stats:', error);
    }
  };

  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      const result = await api.getKycSubmissions({ page, limit: meta.limit, status });
      setSubmissions(result.submissions || []);
      setMeta({ total: result.total || 0, limit: result.limit || meta.limit });
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

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          ['Total', stats?.total ?? 0, 'text-white'],
          ['Not started', stats?.notStarted ?? 0, 'text-slate-300'],
          ['Pending', stats?.pending ?? 0, 'text-yellow-400'],
          ['In review', stats?.inReview ?? 0, 'text-blue-400'],
          ['Approved', stats?.approved ?? 0, 'text-emerald-400'],
          ['Rejected', stats?.rejected ?? 0, 'text-red-400'],
        ].map(([label, value, color]) => (
          <div key={label as string} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="text-xs text-slate-400">{label}</div>
            <div className={`text-2xl font-semibold ${color}`}>{value as number}</div>
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
          className="bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_REVIEW">In review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <div className="text-sm text-slate-400">Total: {meta.total}</div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/40 text-slate-300">
              <tr>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Level</th>
                <th className="text-left px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    <Loader2 className="inline w-5 h-5 animate-spin mr-2" /> Loading...
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">No submissions found</td>
                </tr>
              ) : (
                submissions.map(submission => (
                  <tr key={submission.id} className="border-t border-slate-700/40">
                    <td className="px-4 py-3 text-white">
                      {[submission.user.firstName, submission.user.lastName].filter(Boolean).join(' ') || submission.user.id}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{submission.user.email}</td>
                    <td className={`px-4 py-3 font-medium ${statusClass[submission.status] || 'text-slate-300'}`}>
                      {submission.status}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{submission.level}</td>
                    <td className="px-4 py-3 text-slate-300">{new Date(submission.createdAt).toLocaleString()}</td>
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
