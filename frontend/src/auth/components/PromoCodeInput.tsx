import { useState } from 'react';
import { userApi } from '../services/api';
import { Tag, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface PromoCodeInputProps {
  amount: number;
  onApply: (discount: number, promoCode: string) => void;
  onClear: () => void;
}

export function PromoCodeInput({ amount, onApply, onClear }: PromoCodeInputProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [applied, setApplied] = useState<{ code: string; discount: number } | null>(null);

  const handleApply = async () => {
    if (!code.trim()) return;

    setError('');
    setIsLoading(true);

    try {
      const result = await userApi.validatePromo(code, amount);
      setApplied({ code: result.promo.code, discount: result.discount });
      onApply(result.discount, result.promo.code);
    } catch (err: any) {
      setError(err.message || 'Invalid promo code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setCode('');
    setApplied(null);
    setError('');
    onClear();
  };

  if (applied) {
    return (
      <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-emerald-400 font-medium">{applied.code}</span>
          <span className="text-slate-400">-${applied.discount.toFixed(2)}</span>
        </div>
        <button
          onClick={handleClear}
          className="p-1 text-slate-400 hover:text-white"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={code}
            onChange={e => {
              setCode(e.target.value.toUpperCase());
              setError('');
            }}
            placeholder="Promo code"
            className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 text-sm"
          />
        </div>
        <button
          onClick={handleApply}
          disabled={isLoading || !code.trim()}
          className="px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-300 hover:text-white hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
        </button>
      </div>
      {error && (
        <p className="text-red-400 text-xs">{error}</p>
      )}
    </div>
  );
}
