import { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle,
  XCircle,
  Star,
  X,
} from 'lucide-react';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-400',
  APPROVED: 'bg-emerald-500/10 text-emerald-400',
  REJECTED: 'bg-red-500/10 text-red-400',
};

export function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState('PENDING');
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [rejectNotes, setRejectNotes] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    loadReviews();
    loadStats();
  }, [meta.page, status]);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const params: any = { page: meta.page, limit: meta.limit };
      if (status) params.status = status;

      const result = await api.getReviews(params);
      setReviews(result.data || []);
      setMeta(result.meta || meta);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await api.getReviewStats();
      setStats(result);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await api.approveReview(id);
      loadReviews();
      loadStats();
      setSelectedReview(null);
    } catch (error) {
      console.error('Failed to approve review:', error);
    } finally {
      setActionLoading('');
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectNotes.trim()) return;
    setActionLoading(id);
    try {
      await api.rejectReview(id, rejectNotes);
      loadReviews();
      loadStats();
      setSelectedReview(null);
      setRejectNotes('');
    } catch (error) {
      console.error('Failed to reject review:', error);
    } finally {
      setActionLoading('');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-slate-600'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Reviews Moderation</h1>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-slate-400">Total Reviews</div>
          </div>
          <div className="bg-yellow-500/10 rounded-xl border border-yellow-500/20 p-4">
            <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
            <div className="text-sm text-slate-400">Pending</div>
          </div>
          <div className="bg-emerald-500/10 rounded-xl border border-emerald-500/20 p-4">
            <div className="text-2xl font-bold text-emerald-400">{stats.approved}</div>
            <div className="text-sm text-slate-400">Approved</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
            <div className="text-2xl font-bold text-white flex items-center">
              {stats.averageRating?.toFixed(1) || '0.0'}
              <Star className="w-5 h-5 text-yellow-400 fill-current ml-1" />
            </div>
            <div className="text-sm text-slate-400">Avg Rating</div>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-4">
        {['PENDING', 'APPROVED', 'REJECTED', ''].map(s => (
          <button
            key={s || 'all'}
            onClick={() => {
              setStatus(s);
              setMeta(prev => ({ ...prev, page: 1 }));
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              status === s
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-700/50">
              {reviews.map(review => (
                <div key={review.id} className="p-6 hover:bg-slate-700/20 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-medium text-white">{review.authorName}</span>
                        <div className="flex">{renderStars(review.rating)}</div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[review.status]}`}>
                          {review.status}
                        </span>
                      </div>
                      {review.title && (
                        <div className="font-medium text-white mb-1">{review.title}</div>
                      )}
                      <p className="text-slate-300 text-sm mb-2">{review.content}</p>
                      <div className="text-xs text-slate-500">
                        {new Date(review.createdAt).toLocaleString()}
                        {review.authorEmail && ` • ${review.authorEmail}`}
                      </div>
                    </div>
                    {review.status === 'PENDING' && (
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleApprove(review.id)}
                          disabled={actionLoading === review.id}
                          className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg disabled:opacity-50"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setSelectedReview(review)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {reviews.length === 0 && (
              <div className="text-center py-12 text-slate-400">No reviews found</div>
            )}

            {meta.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700/50">
                <div className="text-sm text-slate-400">
                  Page {meta.page} of {meta.totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setMeta(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={meta.page === 1}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
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

      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">Reject Review</h2>
              <button
                onClick={() => {
                  setSelectedReview(null);
                  setRejectNotes('');
                }}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4 p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium text-white">{selectedReview.authorName}</span>
                  <div className="flex">{renderStars(selectedReview.rating)}</div>
                </div>
                <p className="text-slate-300 text-sm">{selectedReview.content}</p>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Rejection Notes</label>
                <textarea
                  value={rejectNotes}
                  onChange={e => setRejectNotes(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                  rows={3}
                  placeholder="Enter reason for rejection..."
                />
              </div>
              <button
                onClick={() => handleReject(selectedReview.id)}
                disabled={!rejectNotes.trim() || actionLoading === selectedReview.id}
                className="mt-4 w-full py-2.5 bg-red-500/10 text-red-400 rounded-lg font-medium hover:bg-red-500/20 disabled:opacity-50"
              >
                {actionLoading === selectedReview.id ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  'Reject Review'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
