import { ComponentType, useMemo, useState } from 'react';
import { Language } from '../translations';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Star } from 'lucide-react';
import { generateReviews } from '../reviewsData';

interface ReviewsProps {
  currentLang: Language;
  setCurrentLang: (lang: Language) => void;
  AuthButtons?: ComponentType;
}

const REVIEWS_PER_PAGE = 15;
const COUNTRIES = ['Germany', 'France', 'Spain', 'Poland', 'Ukraine', 'USA', 'Canada', 'UAE', 'Turkey', 'Kazakhstan'];

export function Reviews({ currentLang, setCurrentLang, AuthButtons }: ReviewsProps) {
  const baseReviews = useMemo(() => generateReviews(), []);
  const [page, setPage] = useState(1);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [userReviews, setUserReviews] = useState(() => [] as ReturnType<typeof generateReviews>);

  const reviews = useMemo(() => [...userReviews, ...baseReviews], [baseReviews, userReviews]);
  const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
  const pageReviews = reviews.slice((page - 1) * REVIEWS_PER_PAGE, page * REVIEWS_PER_PAGE);

  const submitReview = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    setUserReviews((prev) => [
      {
        id: Date.now(),
        userName: name.trim(),
        rating,
        comment: comment.trim(),
        isPositive: rating >= 4,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      },
      ...prev,
    ]);

    setName('');
    setComment('');
    setRating(5);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar currentLang={currentLang} setCurrentLang={setCurrentLang} AuthButtons={AuthButtons} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <section className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
          <h1 className="text-3xl font-bold mb-4">User Reviews</h1>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={submitReview}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="bg-slate-700/50 rounded-xl px-4 py-3" />
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="bg-slate-700/50 rounded-xl px-4 py-3">
              {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} stars</option>)}
            </select>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience" className="md:col-span-2 bg-slate-700/50 rounded-xl px-4 py-3 min-h-24" />
            <button type="submit" className="md:col-span-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-medium">Add review</button>
          </form>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {pageReviews.map((review, index) => {
            const country = COUNTRIES[(review.id + index) % COUNTRIES.length];
            const initials = review.userName
              .split(' ')
              .map((part) => part[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            return (
              <article key={review.id} className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-semibold">{initials || 'U'}</div>
                    <div>
                      <div className="font-semibold">{review.userName}</div>
                      <div className="text-xs text-slate-400">{country} · {review.date}</div>
                    </div>
                  </div>
                  <div className="flex gap-1">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-slate-600'}`} />)}</div>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{review.comment}</p>
              </article>
            );
          })}
        </section>

        <section className="flex items-center justify-center gap-2 flex-wrap">
          {Array.from({ length: totalPages }).slice(0, 12).map((_, idx) => {
            const pageNumber = idx + 1;
            return (
              <button
                key={pageNumber}
                onClick={() => setPage(pageNumber)}
                className={`px-4 py-2 rounded-lg ${page === pageNumber ? 'bg-emerald-500 text-white' : 'bg-slate-700/50 hover:bg-slate-600/50'}`}
              >
                {pageNumber}
              </button>
            );
          })}
        </section>
      </main>

      <Footer currentLang={currentLang} />
    </div>
  );
}
