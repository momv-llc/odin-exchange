import { ComponentType, useMemo, useState } from 'react';
import { Language } from '../translations';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Star, Filter, Search, ChevronDown, TrendingUp, Users, MessageSquare } from 'lucide-react';
import { generateReviews } from '../reviewsData';

interface ReviewsProps {
  currentLang: Language;
  setCurrentLang: (lang: Language) => void;
  AuthButtons?: ComponentType;
}

export function Reviews({ currentLang, setCurrentLang, AuthButtons }: ReviewsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  
  const reviews = useMemo(() => generateReviews(), []);

  const filteredAndSortedReviews = useMemo(() => {
    let filtered = reviews;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(review => 
        review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply rating filter
    if (ratingFilter !== null) {
      filtered = filtered.filter(review => review.rating === ratingFilter);
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });
  }, [reviews, searchTerm, ratingFilter, sortBy]);

  const stats = useMemo(() => {
    const total = reviews.length;
    const positive = reviews.filter(r => r.isPositive).length;
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / total;
    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: reviews.filter(r => r.rating === rating).length,
      percentage: (reviews.filter(r => r.rating === rating).length / total) * 100
    }));

    return {
      total,
      positive,
      averageRating,
      ratingDistribution
    };
  }, [reviews]);

  const renderStars = (rating: number, size: 'sm' | 'md' = 'md') => {
    const starSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`${starSize} ${i < rating ? 'text-yellow-400 fill-current' : 'text-slate-600'}`} />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar currentLang={currentLang} setCurrentLang={setCurrentLang} AuthButtons={AuthButtons} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              User Reviews & Ratings
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Read what our users have to say about their experience with ODIN EXCHANGE
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <MessageSquare className="w-8 h-8 text-emerald-400" />
              <span className="text-3xl font-bold text-white">{stats.total.toLocaleString()}</span>
            </div>
            <div className="text-slate-400">Total Reviews</div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-emerald-400" />
              <span className="text-3xl font-bold text-emerald-400">
                {Math.round((stats.positive / stats.total) * 100)}%
              </span>
            </div>
            <div className="text-slate-400">Positive Reviews</div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <Star className="w-8 h-8 text-yellow-400 fill-current" />
              <span className="text-3xl font-bold text-white">{stats.averageRating.toFixed(1)}</span>
            </div>
            <div className="text-slate-400">Average Rating</div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-emerald-400" />
              <span className="text-3xl font-bold text-white">1.7M+</span>
            </div>
            <div className="text-slate-400">Happy Users</div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 mb-8">
          <h3 className="text-xl font-semibold mb-6">Rating Distribution</h3>
          <div className="space-y-3">
            {stats.ratingDistribution.reverse().map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 w-20">
                  <span className="text-slate-400">{rating}</span>
                  {renderStars(rating, 'sm')}
                </div>
                <div className="flex-1 bg-slate-700/50 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-slate-400 text-sm w-16 text-right">{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search reviews..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 rounded-xl border border-slate-600/50 focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-6 py-3 bg-slate-700/50 rounded-xl hover:bg-slate-600/50 transition-colors"
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'rating')}
                className="px-6 py-3 bg-slate-700/50 rounded-xl border border-slate-600/50 focus:outline-none focus:border-emerald-400"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="rating">Highest Rating</option>
              </select>
            </div>
          </div>
          
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setRatingFilter(null)}
                  className={`px-4 py-2 rounded-xl transition-colors ${
                    ratingFilter === null 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                  }`}
                >
                  All Ratings
                </button>
                {[5, 4, 3, 2, 1].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setRatingFilter(rating)}
                    className={`px-4 py-2 rounded-xl transition-colors flex items-center space-x-2 ${
                      ratingFilter === rating 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                    }`}
                  >
                    <span>{rating}</span>
                    <Star className="w-3 h-3" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredAndSortedReviews.slice(0, 50).map((review) => (
            <div key={review.id} className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-slate-600/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-white text-lg">{review.userName}</h3>
                    <div className="flex items-center space-x-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <div className="text-sm text-slate-400">{review.date}</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  review.isPositive 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : 'bg-yellow-500/10 text-yellow-400'
                }`}>
                  {review.isPositive ? 'Positive' : 'Neutral'}
                </div>
              </div>
              <p className={`text-sm leading-relaxed ${
                review.isPositive ? 'text-slate-300' : 'text-slate-400'
              }`}>
                {review.comment}
              </p>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="px-8 py-3 bg-slate-700/50 rounded-xl hover:bg-slate-600/50 transition-colors">
            Load More Reviews
          </button>
        </div>
      </main>

      <Footer currentLang={currentLang} />
    </div>
  );
}
