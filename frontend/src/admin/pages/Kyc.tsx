import { useEffect, useState } from 'react';
import { CheckCircle, ChevronLeft, ChevronRight, Eye, Loader2, XCircle } from 'lucide-react';
import { adminApi } from '../services/api';

interface KycDocument {
  id: string;
  type: string;
  fileUrl?: string;
}

interface KycSubmission {
  id: string;
  status: string;
  level: string;
  createdAt: string;
  rejectionReason?: string | null;
  user: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  };
  documents: KycDocument[];
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-400',
  IN_REVIEW: 'bg-blue-500/10 text-blue-400',
  APPROVED: 'bg-emerald-500/10 text-emerald-400',
  REJECTED: 'bg-red-500/10 text-red-400',
  NOT_STARTED: 'bg-slate-500/10 text-slate-400',
};

export function KycPage() {
  const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
  const [status, setStatus] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<KycSubmission | null>(null);
  const [actionLoading, setActionLoading] = useState<'approve' | 'reject' | ''>('');
  const [rejectReason, setRejectReason] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('BASIC');
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, [meta.page, status]);

  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('page', String(meta.page));
      params.append('limit', String(meta.limit));
      const data = await adminApi.get(`/admin/kyc?${params.toString()}`);
      const limit = data.limit || meta.limit;
      const total = data.total || 0;
      setSubmissions(data.submissions || []);
      setMeta((prev) => ({ ...prev, total, limit, totalPages: Math.max(1, Math.ceil(total / limit)) }));
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
      await adminApi.post(`/admin/kyc/${selectedSubmission.id}/approve`, { level: selectedLevel });
      setSelectedSubmission(null);
      await loadSubmissions();
    } finally {
      setActionLoading('');
    }
  };

  const handleReject = async () => {
    if (!selectedSubmission || !rejectReason.trim()) return;
    setActionLoading('reject');
    try {
      await adminApi.post(`/admin/kyc/${selectedSubmission.id}/reject`, { reason: rejectReason.trim() });
      setSelectedSubmission(null);
      setRejectReason('');
      await loadSubmissions();
    } finally {
      setActionLoading('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">KYC Submissions</h1>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setMeta((prev) => ({ ...prev, page: 1 }));
          }}
          className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white"
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_REVIEW">In review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="NOT_STARTED">Not started</option>
        </select>
      </div>

      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-400" /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/30">
                  <tr>
                    <th className="text-left py-4 px-6 text-slate-400">User</th>
                    <th className="text-left py-4 px-6 text-slate-400">Status</th>
                    <th className="text-left py-4 px-6 text-slate-400">Level</th>
                    <th className="text-left py-4 px-6 text-slate-400">Docs</th>
                    <th className="text-left py-4 px-6 text-slate-400">Created</th>
                    <th className="text-right py-4 px-6 text-slate-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-slate-700/20">
                      <td className="py-4 px-6 text-white">{submission.user.email}</td>
                      <td className="py-4 px-6"><span className={`px-2 py-1 rounded-full text-xs ${statusColors[submission.status] || statusColors.NOT_STARTED}`}>{submission.status}</span></td>
                      <td className="py-4 px-6 text-slate-300">{submission.level}</td>
                      <td className="py-4 px-6 text-slate-300">{submission.documents?.length ?? 0}</td>
                      <td className="py-4 px-6 text-slate-400">{new Date(submission.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-6 text-right">
                        <button onClick={() => setSelectedSubmission(submission)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {submissions.length === 0 && <div className="text-center py-10 text-slate-400">No submissions found</div>}

            {meta.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700/50">
                <span className="text-sm text-slate-400">Page {meta.page} of {meta.totalPages}</span>
                <div className="flex items-center space-x-2">
                  <button disabled={meta.page === 1} onClick={() => setMeta((prev) => ({ ...prev, page: prev.page - 1 }))} className="p-2 rounded-lg bg-slate-700/40 disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
                  <button disabled={meta.page === meta.totalPages} onClick={() => setMeta((prev) => ({ ...prev, page: prev.page + 1 }))} className="p-2 rounded-lg bg-slate-700/40 disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setSelectedSubmission(null)}>
          <div className="w-full max-w-xl bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Review submission</h3>
            <div className="text-slate-300">{selectedSubmission.user.email}</div>
            <div className="flex gap-3">
              <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white">
                <option value="BASIC">BASIC</option><option value="INTERMEDIATE">INTERMEDIATE</option><option value="ADVANCED">ADVANCED</option>
              </select>
              <button disabled={actionLoading !== ''} onClick={handleApprove} className="px-4 py-2 bg-emerald-600 rounded-lg flex items-center gap-2 disabled:opacity-50"><CheckCircle className="w-4 h-4" />Approve</button>
            </div>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" placeholder="Reject reason" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setSelectedSubmission(null)} className="px-4 py-2 bg-slate-700 rounded-lg">Close</button>
              <button disabled={actionLoading !== '' || !rejectReason.trim()} onClick={handleReject} className="px-4 py-2 bg-red-600 rounded-lg flex items-center gap-2 disabled:opacity-50"><XCircle className="w-4 h-4" />Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
