import { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  X,
  XCircle,
} from 'lucide-react';

interface KycDocument {
  id: string;
  type: string;
  fileUrl: string;
  isVerified: boolean;
  rejectionReason?: string | null;
}
import { api } from '../services/api';
import { Loader2 } from 'lucide-react';

interface KycSubmission {
  id: string;
  status: string;
  level: string;
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  dateOfBirth?: string | null;
  nationality?: string | null;
  countryOfResidence?: string | null;
  address?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
  user: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
  };
  documents: KycDocument[];
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-400',
  IN_REVIEW: 'bg-blue-500/10 text-blue-400',
  APPROVED: 'bg-emerald-500/10 text-emerald-400',
  REJECTED: 'bg-red-500/10 text-red-400',
  NOT_STARTED: 'bg-slate-500/10 text-slate-400',
  EXPIRED: 'bg-slate-500/10 text-slate-400',
};

const kycLevels = ['BASIC', 'INTERMEDIATE', 'ADVANCED'];

export function KycPage() {
  const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<KycSubmission | null>(null);
  const [actionLoading, setActionLoading] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('BASIC');

  useEffect(() => {
    loadSubmissions();
  }, [meta.page, status]);

  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('page', meta.page.toString());
      params.append('limit', meta.limit.toString());

      const data = await adminApi.get(`/admin/kyc?${params.toString()}`);
      setSubmissions(data.submissions || []);
      const limit = data.limit || meta.limit;
      const total = data.total || 0;
      setMeta(prev => ({
        ...prev,
        page: data.page || prev.page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      }));
    } catch (error) {
      console.error('Failed to load KYC submissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedSubmission) return;
    setActionLoading('approve');
    try {
      await adminApi.post(`/admin/kyc/${selectedSubmission.id}/approve`, {
        level: selectedLevel,
      });
      setSelectedSubmission(null);
      setSelectedLevel('BASIC');
      loadSubmissions();
    } catch (error) {
      console.error('Failed to approve KYC:', error);
    } finally {
      setActionLoading('');
    }
  };

  const handleReject = async () => {
    if (!selectedSubmission || !rejectReason.trim()) return;
    setActionLoading('reject');
    try {
      await adminApi.post(`/admin/kyc/${selectedSubmission.id}/reject`, {
        reason: rejectReason.trim(),
      });
      setSelectedSubmission(null);
      setRejectReason('');
      loadSubmissions();
    } catch (error) {
      console.error('Failed to reject KYC:', error);
    } finally {
      setActionLoading('');
    }
  };

  const openSubmission = (submission: KycSubmission) => {
    setSelectedSubmission(submission);
    setSelectedLevel(submission.level === 'NONE' ? 'BASIC' : submission.level);
    setRejectReason(submission.rejectionReason || '');
  };
  createdAt: string;
  documents: Array<{ id: string; type: string }>;
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

export function KycPage() {
  const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
  const [stats, setStats] = useState<KycStats | null>(null);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, limit: 20 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadSubmissions();
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">KYC Submissions</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <h1 className="text-2xl font-bold text-white">KYC</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="text-sm text-slate-400">Всего</div>
          <div className="text-2xl font-semibold text-white">{stats?.total ?? 0}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="text-sm text-slate-400">Не начато</div>
          <div className="text-2xl font-semibold text-white">{stats?.notStarted ?? 0}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="text-sm text-slate-400">Ожидают</div>
          <div className="text-2xl font-semibold text-yellow-400">{stats?.pending ?? 0}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="text-sm text-slate-400">На проверке</div>
          <div className="text-2xl font-semibold text-blue-400">{stats?.inReview ?? 0}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="text-sm text-slate-400">Одобрено</div>
          <div className="text-2xl font-semibold text-emerald-400">{stats?.approved ?? 0}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="text-sm text-slate-400">Отклонено</div>
          <div className="text-2xl font-semibold text-red-400">{stats?.rejected ?? 0}</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-400">Заявки</div>
        <select
          value={status}
          onChange={e => {
            setStatus(e.target.value);
            setMeta(prev => ({ ...prev, page: 1 }));
          }}
          className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-400"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_REVIEW">In review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="NOT_STARTED">Not started</option>
          <option value="EXPIRED">Expired</option>
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
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Пользователь</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Статус</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Уровень</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Документы</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Создано</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {submissions.map(submission => (
                    <tr key={submission.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="text-white">{submission.user?.email}</div>
                        <div className="text-sm text-slate-400">
                          {submission.user?.firstName} {submission.user?.lastName}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[submission.status]}`}>
                          {submission.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-300">{submission.level}</td>
                      <td className="py-4 px-6 text-slate-400">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openSubmission(submission)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-300">{submission.status}</td>
                      <td className="py-4 px-6 text-slate-300">{submission.level}</td>
                      <td className="py-4 px-6 text-slate-300">{submission.documents?.length ?? 0}</td>
                      <td className="py-4 px-6 text-slate-400">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {submissions.length === 0 && (
              <div className="text-center py-12 text-slate-400">No submissions found</div>
            )}

            {meta.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700/50">
                <div className="text-sm text-slate-400">
                  Showing {(meta.page - 1) * meta.limit + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setMeta(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={meta.page === 1}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-slate-400">Page {meta.page} of {meta.totalPages}</span>
                  <button
                    onClick={() => setMeta(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={meta.page === meta.totalPages}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg disabled:opacity-50"
                  >
                    <ChevronRight className="w-5 h-5" />
              <div className="text-center py-12 text-slate-400">Нет заявок для отображения</div>
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
