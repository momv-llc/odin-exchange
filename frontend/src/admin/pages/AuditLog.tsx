import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../services/api';
import { Download, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface AuditLogEntry {
  id: string;
  adminId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  ipAddress?: string;
  requestId?: string;
  createdAt: string;
  admin?: { email?: string } | null;
}

interface AdminOption {
  id: string;
  email: string;
  role: string;
}

export function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [admins, setAdmins] = useState<AdminOption[]>([]);
  const [adminId, setAdminId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 25, totalPages: 1 });

  useEffect(() => {
    const loadAdmins = async () => {
      try {
        const data = await adminApi.getAuditAdmins();
        setAdmins(data || []);
      } catch (error) {
        console.error('Failed to load admins:', error);
      }
    };

    loadAdmins();
  }, []);

  useEffect(() => {
    loadLogs();
  }, [meta.page, adminId, startDate, endDate]);

  const dateParams = useMemo(() => {
    const params: { startDate?: string; endDate?: string } = {};
    if (startDate) {
      params.startDate = new Date(`${startDate}T00:00:00`).toISOString();
    }
    if (endDate) {
      params.endDate = new Date(`${endDate}T23:59:59.999`).toISOString();
    }
    return params;
  }, [startDate, endDate]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const params: any = { page: meta.page, limit: meta.limit, ...dateParams };
      if (adminId) params.adminId = adminId;

      const result = await adminApi.getAuditLogs(params);
      setLogs(result.data || []);
      setMeta(result.meta || meta);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (!logs.length) return;

    const headers = ['Date', 'Admin', 'Action', 'Entity Type', 'Entity ID', 'IP', 'Request ID'];
    const escapeCsv = (value: string | undefined) => {
      if (!value) return '';
      const escaped = value.replace(/"/g, '""');
      return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
    };

    const rows = logs.map(log => [
      new Date(log.createdAt).toISOString(),
      log.admin?.email || 'System',
      log.action,
      log.entityType || '',
      log.entityId || '',
      log.ipAddress || '',
      log.requestId || '',
    ]);

    const csv = [headers.join(','), ...rows.map(row => row.map(value => escapeCsv(String(value))).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audit-log-${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Audit Log</h1>
        <button
          onClick={handleExport}
          disabled={!logs.length}
          className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm text-slate-400">Administrator</label>
          <select
            value={adminId}
            onChange={e => {
              setAdminId(e.target.value);
              setMeta(prev => ({ ...prev, page: 1 }));
            }}
            className="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2.5 text-white focus:border-emerald-400 focus:outline-none"
          >
            <option value="">All admins</option>
            {admins.map(admin => (
              <option key={admin.id} value={admin.id}>
                {admin.email} ({admin.role})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-400">Start date</label>
          <input
            type="date"
            value={startDate}
            onChange={e => {
              setStartDate(e.target.value);
              setMeta(prev => ({ ...prev, page: 1 }));
            }}
            className="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2.5 text-white focus:border-emerald-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-400">End date</label>
          <input
            type="date"
            value={endDate}
            onChange={e => {
              setEndDate(e.target.value);
              setMeta(prev => ({ ...prev, page: 1 }));
            }}
            className="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2.5 text-white focus:border-emerald-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-xl">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/30">
                  <tr>
                    <th className="px-6 py-4 text-left font-medium text-slate-400">Date</th>
                    <th className="px-6 py-4 text-left font-medium text-slate-400">Admin</th>
                    <th className="px-6 py-4 text-left font-medium text-slate-400">Action</th>
                    <th className="px-6 py-4 text-left font-medium text-slate-400">Entity</th>
                    <th className="px-6 py-4 text-left font-medium text-slate-400">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {logs.map(log => (
                    <tr key={log.id} className="transition-colors hover:bg-slate-700/30">
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white">{log.admin?.email || 'System'}</div>
                        {log.adminId && (
                          <div className="text-xs text-slate-500">{log.adminId}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-white">{log.action}</td>
                      <td className="px-6 py-4 text-slate-400">
                        <div>{log.entityType || '—'}</div>
                        {log.entityId && <div className="text-xs text-slate-500">{log.entityId}</div>}
                      </td>
                      <td className="px-6 py-4 text-slate-400">{log.ipAddress || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-slate-700/50 px-6 py-4 text-sm text-slate-400">
              <span>
                Page {meta.page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMeta(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={meta.page <= 1}
                  className="rounded-lg border border-slate-700/50 p-2 text-slate-400 hover:bg-slate-700/50 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setMeta(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
                  disabled={meta.page >= totalPages}
                  className="rounded-lg border border-slate-700/50 p-2 text-slate-400 hover:bg-slate-700/50 disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
