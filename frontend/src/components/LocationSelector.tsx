import { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, ChevronDown } from 'lucide-react';

interface Location {
  id: string;
  country: string;
  countryCode: string;
  city: string;
  address?: string;
  isAvailable: boolean;
  flag: string;
}

interface LocationSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: Location) => void;
  selectedLocation?: Location | null;
  title?: string;
  lang?: 'en' | 'de' | 'ru' | 'ua';
}

const locations: Location[] = [
  // Germany
  { id: 'de-berlin', country: 'Germany', countryCode: 'DE', city: 'Berlin', flag: '🇩🇪', isAvailable: true },
  { id: 'de-munich', country: 'Germany', countryCode: 'DE', city: 'Munich', flag: '🇩🇪', isAvailable: true },
  { id: 'de-frankfurt', country: 'Germany', countryCode: 'DE', city: 'Frankfurt', flag: '🇩🇪', isAvailable: true },
  { id: 'de-hamburg', country: 'Germany', countryCode: 'DE', city: 'Hamburg', flag: '🇩🇪', isAvailable: true },
  { id: 'de-cologne', country: 'Germany', countryCode: 'DE', city: 'Cologne', flag: '🇩🇪', isAvailable: true },
  { id: 'de-dusseldorf', country: 'Germany', countryCode: 'DE', city: 'Düsseldorf', flag: '🇩🇪', isAvailable: true },
  // Austria
  { id: 'at-vienna', country: 'Austria', countryCode: 'AT', city: 'Vienna', flag: '🇦🇹', isAvailable: true },
  { id: 'at-salzburg', country: 'Austria', countryCode: 'AT', city: 'Salzburg', flag: '🇦🇹', isAvailable: true },
  { id: 'at-innsbruck', country: 'Austria', countryCode: 'AT', city: 'Innsbruck', flag: '🇦🇹', isAvailable: true },
  // Switzerland
  { id: 'ch-zurich', country: 'Switzerland', countryCode: 'CH', city: 'Zurich', flag: '🇨🇭', isAvailable: true },
  { id: 'ch-geneva', country: 'Switzerland', countryCode: 'CH', city: 'Geneva', flag: '🇨🇭', isAvailable: true },
  { id: 'ch-basel', country: 'Switzerland', countryCode: 'CH', city: 'Basel', flag: '🇨🇭', isAvailable: true },
  { id: 'ch-bern', country: 'Switzerland', countryCode: 'CH', city: 'Bern', flag: '🇨🇭', isAvailable: true },
  // Czech Republic
  { id: 'cz-prague', country: 'Czech Republic', countryCode: 'CZ', city: 'Prague', flag: '🇨🇿', isAvailable: true },
  { id: 'cz-brno', country: 'Czech Republic', countryCode: 'CZ', city: 'Brno', flag: '🇨🇿', isAvailable: true },
  // Poland
  { id: 'pl-warsaw', country: 'Poland', countryCode: 'PL', city: 'Warsaw', flag: '🇵🇱', isAvailable: true },
  { id: 'pl-krakow', country: 'Poland', countryCode: 'PL', city: 'Krakow', flag: '🇵🇱', isAvailable: true },
  { id: 'pl-wroclaw', country: 'Poland', countryCode: 'PL', city: 'Wroclaw', flag: '🇵🇱', isAvailable: true },
  // Netherlands
  { id: 'nl-amsterdam', country: 'Netherlands', countryCode: 'NL', city: 'Amsterdam', flag: '🇳🇱', isAvailable: true },
  { id: 'nl-rotterdam', country: 'Netherlands', countryCode: 'NL', city: 'Rotterdam', flag: '🇳🇱', isAvailable: true },
  // Belgium
  { id: 'be-brussels', country: 'Belgium', countryCode: 'BE', city: 'Brussels', flag: '🇧🇪', isAvailable: true },
  { id: 'be-antwerp', country: 'Belgium', countryCode: 'BE', city: 'Antwerp', flag: '🇧🇪', isAvailable: true },
  // France
  { id: 'fr-paris', country: 'France', countryCode: 'FR', city: 'Paris', flag: '🇫🇷', isAvailable: true },
  { id: 'fr-lyon', country: 'France', countryCode: 'FR', city: 'Lyon', flag: '🇫🇷', isAvailable: true },
  // Italy
  { id: 'it-milan', country: 'Italy', countryCode: 'IT', city: 'Milan', flag: '🇮🇹', isAvailable: true },
  { id: 'it-rome', country: 'Italy', countryCode: 'IT', city: 'Rome', flag: '🇮🇹', isAvailable: true },
  // Spain
  { id: 'es-madrid', country: 'Spain', countryCode: 'ES', city: 'Madrid', flag: '🇪🇸', isAvailable: true },
  { id: 'es-barcelona', country: 'Spain', countryCode: 'ES', city: 'Barcelona', flag: '🇪🇸', isAvailable: true },
];

const translations = {
  en: {
    title: 'Select Location',
    search: 'Search city or country...',
    allCountries: 'All Countries',
    noResults: 'No locations found',
    popular: 'Popular Cities',
  },
  de: {
    title: 'Standort auswählen',
    search: 'Stadt oder Land suchen...',
    allCountries: 'Alle Länder',
    noResults: 'Keine Standorte gefunden',
    popular: 'Beliebte Städte',
  },
  ru: {
    title: 'Выберите локацию',
    search: 'Поиск города или страны...',
    allCountries: 'Все страны',
    noResults: 'Локации не найдены',
    popular: 'Популярные города',
  },
  ua: {
    title: 'Виберіть локацію',
    search: 'Пошук міста або країни...',
    allCountries: 'Всі країни',
    noResults: 'Локації не знайдено',
    popular: 'Популярні міста',
  },
};

export function LocationSelector({
  isOpen,
  onClose,
  onSelect,
  selectedLocation,
  title,
  lang = 'en',
}: LocationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang];

  const countries = [...new Set(locations.map((l) => l.country))];

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const filteredLocations = locations.filter((location) => {
    const matchesSearch =
      location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = !selectedCountry || location.country === selectedCountry;
    return matchesSearch && matchesCountry;
  });

  const handleSelect = (location: Location) => {
    onSelect(location);
    onClose();
    setSearchQuery('');
    setSelectedCountry(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl animate-modalSlideIn overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-semibold text-white">{title || t.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-700/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search}
              className="w-full bg-slate-700/50 text-white placeholder-slate-400 pl-10 pr-4 py-3 rounded-xl border border-slate-600/50 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Country Filter */}
        <div className="p-4 border-b border-slate-700/50">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCountry(null)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                !selectedCountry
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
              }`}
            >
              {t.allCountries}
            </button>
            {countries.map((country) => {
              const loc = locations.find((l) => l.country === country);
              return (
                <button
                  key={country}
                  onClick={() => setSelectedCountry(country)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-1 ${
                    selectedCountry === country
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                  }`}
                >
                  <span>{loc?.flag}</span>
                  <span>{country}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Location List */}
        <div className="max-h-80 overflow-y-auto p-4 space-y-2">
          {filteredLocations.length === 0 ? (
            <div className="text-center py-8 text-slate-400">{t.noResults}</div>
          ) : (
            filteredLocations.map((location) => (
              <button
                key={location.id}
                onClick={() => handleSelect(location)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                  selectedLocation?.id === location.id
                    ? 'bg-emerald-500/20 border border-emerald-500/50'
                    : 'bg-slate-700/30 hover:bg-slate-700/50 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{location.flag}</div>
                  <div className="text-left">
                    <div className="font-semibold text-white">{location.city}</div>
                    <div className="text-sm text-slate-400">{location.country}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {location.isAvailable && (
                    <span className="flex items-center text-xs text-emerald-400">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full mr-1 animate-pulse" />
                      Available
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Popular */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="text-xs text-slate-400 mb-2">{t.popular}</div>
          <div className="flex flex-wrap gap-2">
            {['Berlin', 'Vienna', 'Zurich', 'Prague', 'Amsterdam'].map((cityName) => {
              const location = locations.find((l) => l.city === cityName);
              if (!location) return null;
              return (
                <button
                  key={cityName}
                  onClick={() => handleSelect(location)}
                  className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center space-x-1"
                >
                  <span>{location.flag}</span>
                  <span>{cityName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocationSelector;
