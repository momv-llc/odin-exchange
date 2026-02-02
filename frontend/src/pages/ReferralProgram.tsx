import { useState, useEffect } from 'react';
import axios from 'axios';

interface ReferralStats {
  referralCode: string | null;
  totalReferrals: number;
  convertedReferrals: number;
  pendingRewards: number;
  paidRewards: number;
  referralLink: string | null;
}

export function ReferralProgram() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('/api/referrals/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async () => {
    try {
      const res = await axios.post('/api/referrals/generate-code');
      const code = res.data;
      setStats(prev => prev ? { 
        ...prev, 
        referralCode: code, 
        referralLink: window.location.origin + '?ref=' + code 
      } : null);
    } catch (error) {
      console.error('Failed to generate code:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-white">Реферальная программа</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="text-sm text-slate-400">Приглашено</div>
          <div className="text-2xl font-bold text-emerald-400">{stats?.totalReferrals || 0}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="text-sm text-slate-400">Активных</div>
          <div className="text-2xl font-bold text-green-400">{stats?.convertedReferrals || 0}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="text-sm text-slate-400">К выплате</div>
          <div className="text-2xl font-bold text-yellow-400">${stats?.pendingRewards || 0}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="text-sm text-slate-400">Выплачено</div>
          <div className="text-2xl font-bold text-slate-300">${stats?.paidRewards || 0}</div>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-lg p-6 mb-8 border border-slate-700">
        <h2 className="text-xl font-semibold mb-4 text-white">Ваша реферальная ссылка</h2>
        
        {stats?.referralCode ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={stats.referralLink || ''}
                className="flex-1 p-3 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white"
              />
              <button
                onClick={() => copyToClipboard(stats.referralLink || '')}
                className="px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                {copied ? 'Скопировано!' : 'Копировать'}
              </button>
            </div>
            <div className="text-sm text-slate-400">
              Код: <span className="font-mono font-bold text-emerald-400">{stats.referralCode}</span>
            </div>
          </div>
        ) : (
          <button
            onClick={generateCode}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            Получить реферальную ссылку
          </button>
        )}
      </div>

      <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-lg p-6 mb-8 text-white">
        <h2 className="text-xl font-semibold mb-4">Как это работает</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">1</div>
            <div>
              <div className="font-medium">Поделитесь ссылкой</div>
              <div className="text-sm text-white/80">Отправьте вашу реферальную ссылку друзьям</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">2</div>
            <div>
              <div className="font-medium">Они регистрируются</div>
              <div className="text-sm text-white/80">Друг создает аккаунт и совершает обмен</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">3</div>
            <div>
              <div className="font-medium">Получите награду</div>
              <div className="text-sm text-white/80">Вы получаете 5% от комиссии каждой их сделки</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
