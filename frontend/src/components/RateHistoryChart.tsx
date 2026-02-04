import { useEffect, useMemo, useState } from 'react';

type RateHistoryPoint = {
  rate: number;
  timestamp: string;
};

type RateHistoryChartProps = {
  baseCurrency: string;
  quoteCurrency: string;
  interval?: string;
  limit?: number;
};

const DEFAULT_LIMIT = 48;

const formatCurrency = (value: number) =>
  value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });

const formatTimestamp = (value: string) =>
  new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

export const RateHistoryChart = ({
  baseCurrency,
  quoteCurrency,
  interval = '1h',
  limit = DEFAULT_LIMIT,
}: RateHistoryChartProps) => {
  const [history, setHistory] = useState<RateHistoryPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const fetchHistory = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch(
          `/api/exchange-rates/history/${baseCurrency}/${quoteCurrency}?interval=${interval}&limit=${limit}`,
        );

        if (!response.ok) {
          throw new Error(`Failed to load history (${response.status})`);
        }

        const data = (await response.json()) as Array<{
          rate: number | string;
          timestamp: string;
        }>;

        const sorted = data
          .map((item) => ({
            rate: Number(item.rate),
            timestamp: item.timestamp,
          }))
          .filter((item) => !Number.isNaN(item.rate))
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        if (isActive) {
          setHistory(sorted);
        }
      } catch (error) {
        if (isActive) {
          const message = error instanceof Error ? error.message : 'Failed to load rate history';
          setErrorMessage(message);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      isActive = false;
    };
  }, [baseCurrency, quoteCurrency, interval, limit]);

  const chartData = useMemo(() => {
    if (history.length === 0) {
      return { path: '', areaPath: '', minRate: 0, maxRate: 0 };
    }

    const rates = history.map((item) => item.rate);
    const minRate = Math.min(...rates);
    const maxRate = Math.max(...rates);
    const range = maxRate - minRate || 1;

    const points = history.map((item, index) => {
      const x = history.length === 1 ? 50 : (index / (history.length - 1)) * 100;
      const y = 100 - ((item.rate - minRate) / range) * 100;
      return { x, y };
    });

    const path = points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');

    const areaPath = `${path} L 100 100 L 0 100 Z`;

    return { path, areaPath, minRate, maxRate };
  }, [history]);

  const latest = history[history.length - 1];
  const earliest = history[0];
  const change = latest && earliest ? latest.rate - earliest.rate : 0;
  const changePercent = earliest ? (change / earliest.rate) * 100 : 0;

  return (
    <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-sm uppercase tracking-[0.2em] text-emerald-400/80">
            {baseCurrency}/{quoteCurrency} History
          </div>
          <h3 className="text-2xl font-semibold mt-2">Rate trend overview</h3>
          <p className="text-slate-400 text-sm mt-1">
            Latest rate updates over the selected interval ({interval}).
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 px-4 py-3">
            <div className="text-slate-400">Latest</div>
            <div className="text-lg font-semibold">{latest ? formatCurrency(latest.rate) : '—'}</div>
          </div>
          <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 px-4 py-3">
            <div className="text-slate-400">Change</div>
            <div
              className={`text-lg font-semibold ${
                change >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {history.length ? `${change >= 0 ? '+' : ''}${formatCurrency(change)} (${changePercent.toFixed(2)}%)` : '—'}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="h-48 rounded-xl bg-slate-800/50 animate-pulse" />
        ) : errorMessage ? (
          <div className="h-48 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
            {errorMessage}
          </div>
        ) : history.length < 2 ? (
          <div className="h-48 rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 text-sm text-slate-300">
            Not enough history points yet. Try again later.
          </div>
        ) : (
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-4">
            <svg viewBox="0 0 100 100" className="w-full h-48" preserveAspectRatio="none">
              <defs>
                <linearGradient id="rateFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              <path d={chartData.areaPath} fill="url(#rateFill)" />
              <path d={chartData.path} fill="none" stroke="#34d399" strokeWidth="2" />
            </svg>
            <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-400">
              <span>{earliest ? formatTimestamp(earliest.timestamp) : '—'}</span>
              <span>
                Range: {formatCurrency(chartData.minRate)} - {formatCurrency(chartData.maxRate)}
              </span>
              <span>{latest ? formatTimestamp(latest.timestamp) : '—'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
