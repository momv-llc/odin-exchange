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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">KYC Submissions</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
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
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">User</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Status</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Level</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Submitted</th>
                    <th className="text-right py-4 px-6 text-slate-400 font-medium">Actions</th>
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
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-3xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">KYC Details</h2>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-400">User</div>
                  <div className="text-white">{selectedSubmission.user?.email}</div>
                  <div className="text-sm text-slate-400">
                    {selectedSubmission.user?.firstName} {selectedSubmission.user?.lastName}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Status</div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[selectedSubmission.status]}`}>
                    {selectedSubmission.status}
                  </span>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Date of birth</div>
                  <div className="text-white">
                    {selectedSubmission.dateOfBirth
                      ? new Date(selectedSubmission.dateOfBirth).toLocaleDateString()
                      : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Address</div>
                  <div className="text-white">{selectedSubmission.address || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Nationality</div>
                  <div className="text-white">{selectedSubmission.nationality || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Country of residence</div>
                  <div className="text-white">{selectedSubmission.countryOfResidence || 'N/A'}</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-400 mb-2">Documents</div>
                <div className="space-y-2">
                  {selectedSubmission.documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3">
                      <div>
                        <div className="text-white">{doc.type}</div>
                        <div className="text-xs text-slate-400">
                          {doc.isVerified ? 'Verified' : doc.rejectionReason || 'Pending verification'}
                        </div>
                      </div>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 text-sm hover:text-emerald-300"
                      >
                        View
                      </a>
                    </div>
                  ))}
                  {selectedSubmission.documents.length === 0 && (
                    <div className="text-sm text-slate-500">No documents uploaded</div>
                  )}
                </div>
              </div>

              {selectedSubmission.rejectionReason && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-200 rounded-lg p-4">
                  <div className="text-sm font-medium mb-1">Rejection reason</div>
                  <div className="text-sm">{selectedSubmission.rejectionReason}</div>
                </div>
              )}

              {selectedSubmission.status !== 'APPROVED' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400">Approval level</label>
                    <select
                      value={selectedLevel}
                      onChange={e => setSelectedLevel(e.target.value)}
                      className="mt-2 w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    >
                      {kycLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleApprove}
                      disabled={actionLoading === 'approve'}
                      className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-200 rounded-lg hover:bg-emerald-500/30 disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Reject reason</label>
                    <textarea
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      className="mt-2 w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white min-h-[96px]"
                      placeholder="Provide rejection reason"
                    />
                    <button
                      onClick={handleReject}
                      disabled={actionLoading === 'reject' || !rejectReason.trim()}
                      className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 text-red-200 rounded-lg hover:bg-red-500/30 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
