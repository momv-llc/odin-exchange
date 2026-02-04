import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const toggleVisibility = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;

      setScrollProgress(progress);
      setIsVisible(scrollTop > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed left-6 bottom-6 z-50 group transition-all duration-500 ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
      aria-label="Scroll to top"
    >
      {/* Progress ring */}
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 48 48">
          {/* Background circle */}
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="rgba(100, 116, 139, 0.3)"
            strokeWidth="3"
          />
          {/* Progress circle */}
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${scrollProgress * 1.256} 125.6`}
            className="transition-all duration-300"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>

        {/* Button center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-9 h-9 bg-slate-800/90 backdrop-blur-sm rounded-full flex items-center justify-center border border-slate-700/50 group-hover:border-emerald-500/50 transition-all duration-300 group-hover:scale-110">
            <ChevronUp className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition-colors group-hover:-translate-y-0.5 transform" />
          </div>
        </div>
      </div>

      {/* Tooltip */}
      <span className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-xs text-slate-300 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        Back to top
      </span>
    </button>
  );
}

export default ScrollToTop;
