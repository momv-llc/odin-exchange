import { useEffect, useMemo, useState } from 'react';
import { CheckCircle, Eye, Loader2, X, XCircle } from 'lucide-react';
import { adminApi } from '../services/api';

interface KycDocument {
  id: string;
  type: string;
  fileUrl?: string;
  isVerified?: boolean;
  rejectionReason?: string | null;
}

interface KycSubmission {
  id: string;
  status: string;
  level?: string;
  firstName?: string | null;
  lastName?: string | null;
  createdAt: string;
  rejectionReason?: string | null;
  user?: {
    email?: string;
    firstName?: string | null;
    lastName?: string | null;
  };
  documents?: KycDocument[];
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

const approvalLevels = ['BASIC', 'INTERMEDIATE', 'ADVANCED'];

export function KycPage() {
  const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
  const [stats, setStats] = useState<KycStats | null>(null);
  const [status, setStatus] = useState('');
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const [selectedSubmission, setSelectedSubmission] = useState<KycSubmission | null>(null);
  const [selectedLevel, setSelectedLevel] = useState('BASIC');
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState<'approve' | 'reject' | ''>('');

  useEffect(() => {
    void loadStats();
  }, []);

  useEffect(() => {
    void loadSubmissions();
  }, [meta.page, status]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(meta.total / meta.limit)), [meta.total, meta.limit]);

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
      setMeta((prev) => ({
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

  const openSubmission = (submission: KycSubmission) => {
    setSelectedSubmission(submission);
    setSelectedLevel(submission.level === 'NONE' || !submission.level ? 'BASIC' : submission.level);
    setRejectReason(submission.rejectionReason || '');
  };

  const closeModal = () => {
    setSelectedSubmission(null);
    setRejectReason('');
    setActionLoading('');
  };

  const handleApprove = async () => {
    if (!selectedSubmission) return;
    setActionLoading('approve');
    try {
      await adminApi.post(`/admin/kyc/${selectedSubmission.id}/approve`, { level: selectedLevel });
      closeModal();
      await loadSubmissions();
      await loadStats();
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
      await adminApi.post(`/admin/kyc/${selectedSubmission.id}/reject`, { reason: rejectReason.trim() });
      closeModal();
      await loadSubmissions();
      await loadStats();
    } catch (error) {
      console.error('Failed to reject KYC:', error);
    } finally {
      setActionLoading('');
    }
  };

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
          onChange={(e) => {
            setStatus(e.target.value);
            setMeta((prev) => ({ ...prev, page: 1 }));
          }}
          className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-400"
        >
          <option value="">All statuses</option>
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
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">User</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Email</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Level</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Docs</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Status</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Created</th>
                    <th className="text-right py-4 px-6 text-slate-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {submissions.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="py-4 px-6 text-white">{[item.user?.firstName || item.firstName, item.user?.lastName || item.lastName].filter(Boolean).join(' ') || '-'}</td>
                      <td className="py-4 px-6 text-white">{item.user?.email || '-'}</td>
                      <td className="py-4 px-6 text-slate-300">{item.level || '-'}</td>
                      <td className="py-4 px-6 text-slate-300">{item.documents?.length ?? 0}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[item.status] || 'bg-slate-500/10 text-slate-400'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => openSubmission(item)}
                          className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {submissions.length === 0 && <div className="text-center py-12 text-slate-400">No submissions found</div>}

            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 text-sm text-slate-400">
                <span>Page {meta.page} of {totalPages}</span>
                <div className="space-x-2">
                  <button
                    onClick={() => setMeta((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={meta.page === 1}
                    className="px-3 py-1 rounded-md bg-slate-700/40 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setMeta((prev) => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
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

      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">KYC Submission</h2>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <Info label="User" value={[selectedSubmission.user?.firstName || selectedSubmission.firstName, selectedSubmission.user?.lastName || selectedSubmission.lastName].filter(Boolean).join(' ') || '-'} />
              <Info label="Email" value={selectedSubmission.user?.email || '-'} />
              <Info label="Status" value={selectedSubmission.status} />
              <Info label="Level" value={selectedSubmission.level || '-'} />
              <Info label="Documents" value={String(selectedSubmission.documents?.length ?? 0)} />
              <Info label="Created" value={new Date(selectedSubmission.createdAt).toLocaleString()} />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Approve level</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              >
                {approvalLevels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Reject reason</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div className="flex flex-wrap gap-3 justify-end">
              <button
                onClick={handleReject}
                disabled={actionLoading !== '' || !rejectReason.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" /> Reject
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading !== ''}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" /> Approve
              </button>
            </div>
          </div>
        </div>
      )}
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-3">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-sm text-white mt-1 break-all">{value}</div>
    </div>
  );
}
