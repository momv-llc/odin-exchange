import { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import { Loader2 } from 'lucide-react';

interface KycSubmission {
  id: string;
  status: string;
  level: string;
  createdAt: string;
  user: { email: string; firstName?: string | null; lastName?: string | null };
  documents: Array<{ id: string; type: string }>;
}

export function KycPage() {
  const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
  const [status, setStatus] = useState('');
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
      params.append('page', meta.page.toString());
      params.append('limit', meta.limit.toString());
      const data = await adminApi.get(`/admin/kyc?${params.toString()}`);
      const limit = data.limit || meta.limit;
      const total = data.total || 0;
      setSubmissions(data.submissions || []);
      setMeta((prev) => ({ ...prev, page: data.page || prev.page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) }));
    } catch (error) {
      console.error('Failed to load KYC submissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">KYC Submissions</h1>

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
          <option value="PENDING">Pending</option>
          <option value="IN_REVIEW">In review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-emerald-400 animate-spin" /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/30"><tr><th className="text-left py-4 px-6">User</th><th className="text-left py-4 px-6">Status</th><th className="text-left py-4 px-6">Level</th><th className="text-left py-4 px-6">Documents</th><th className="text-left py-4 px-6">Created</th></tr></thead>
                <tbody className="divide-y divide-slate-700/50">
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-slate-700/30">
                      <td className="py-4 px-6 text-white">{submission.user?.email}<div className="text-sm text-slate-400">{submission.user?.firstName} {submission.user?.lastName}</div></td>
                      <td className="py-4 px-6 text-slate-300">{submission.status}</td>
                      <td className="py-4 px-6 text-slate-300">{submission.level}</td>
                      <td className="py-4 px-6 text-slate-300">{submission.documents?.length || 0}</td>
                      <td className="py-4 px-6 text-slate-400">{new Date(submission.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 text-sm text-slate-400">Page {meta.page} of {meta.totalPages}</div>
          </>
        )}
      </div>
    </div>
  );
}
