import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { adminApi } from '../services/api';

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

const statusClasses: Record<string, string> = {
  PENDING: 'text-yellow-400 bg-yellow-500/10',
  IN_REVIEW: 'text-blue-400 bg-blue-500/10',
  APPROVED: 'text-emerald-400 bg-emerald-500/10',
  REJECTED: 'text-red-400 bg-red-500/10',
};

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
      const result = await adminApi.getKycStats();
      setStats(result);
    } catch (error) {
      console.error('Failed to load KYC stats:', error);
    }
  };

  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      const result = await adminApi.getKycSubmissions({ page, limit: meta.limit, status });
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
          ['Всего', stats?.total ?? 0, 'text-white'],
          ['Не начато', stats?.notStarted ?? 0, 'text-slate-300'],
          ['Ожидают', stats?.pending ?? 0, 'text-yellow-400'],
          ['На проверке', stats?.inReview ?? 0, 'text-blue-400'],
          ['Одобрено', stats?.approved ?? 0, 'text-emerald-400'],
          ['Отклонено', stats?.rejected ?? 0, 'text-red-400'],
        ].map(([label, value, cls]) => (
          <div key={String(label)} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="text-sm text-slate-400">{label}</div>
            <div className={`text-2xl font-semibold ${cls}`}>{value}</div>
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
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
        >
          <option value="">Все статусы</option>
          <option value="PENDING">PENDING</option>
          <option value="IN_REVIEW">IN_REVIEW</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
        </select>

        <div className="text-sm text-slate-400">Всего: {meta.total}</div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-900/60">
              <tr>
                <th className="text-left px-4 py-3 text-slate-400 text-sm">ID</th>
                <th className="text-left px-4 py-3 text-slate-400 text-sm">Пользователь</th>
                <th className="text-left px-4 py-3 text-slate-400 text-sm">Статус</th>
                <th className="text-left px-4 py-3 text-slate-400 text-sm">Уровень</th>
                <th className="text-left px-4 py-3 text-slate-400 text-sm">Документы</th>
                <th className="text-left px-4 py-3 text-slate-400 text-sm">Дата</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(item => (
                <tr key={item.id} className="border-t border-slate-700/50">
                  <td className="px-4 py-3 text-white text-sm">{item.id.slice(0, 8)}...</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{item.user.email}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded ${statusClasses[item.status] || 'bg-slate-700 text-slate-300'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">{item.level}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{item.documents?.length || 0}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{new Date(item.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {!submissions.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Нет заявок
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 disabled:opacity-50"
        >
          Назад
        </button>
        <span className="text-sm text-slate-400">
          Страница {page} из {totalPages}
        </span>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 disabled:opacity-50"
        >
          Вперед
        </button>
      </div>
    </div>
  );
}
