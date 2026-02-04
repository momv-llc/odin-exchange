import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Loader2 } from 'lucide-react';

interface KycSubmission {
  id: string;
  status: string;
  level: string;
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
            setPage(1);
          }}
          className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-400"
        >
          <option value="">Все статусы</option>
          <option value="NOT_STARTED">Not started</option>
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
