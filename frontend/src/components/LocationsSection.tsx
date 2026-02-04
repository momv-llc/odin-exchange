import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, ChevronRight, Clock, CheckCircle, Globe } from 'lucide-react';

interface City {
  id: string;
  nameEn: string;
  nameRu?: string;
  nameUa?: string;
  nameDe?: string;
  isFeatured?: boolean;
  lat?: number;
  lng?: number;
}

interface Country {
  id: string;
  code: string;
  nameEn: string;
  nameRu?: string;
  nameUa?: string;
  nameDe?: string;
  flagEmoji?: string;
  cities: City[];
}

const demoCountries: Country[] = [
  {
    id: '1',
    code: 'DE',
    nameEn: 'Germany',
    nameRu: 'Германия',
    nameDe: 'Deutschland',
    nameUa: 'Німеччина',
    flagEmoji: '🇩🇪',
    cities: [
      { id: '1', nameEn: 'Berlin', nameRu: 'Берлин', nameDe: 'Berlin', isFeatured: true, lat: 52.52, lng: 13.405 },
      { id: '2', nameEn: 'Munich', nameRu: 'Мюнхен', nameDe: 'München', isFeatured: true, lat: 48.135, lng: 11.582 },
      { id: '3', nameEn: 'Frankfurt', nameRu: 'Франкфурт', nameDe: 'Frankfurt', lat: 50.11, lng: 8.682 },
      { id: '4', nameEn: 'Hamburg', nameRu: 'Гамбург', nameDe: 'Hamburg', lat: 53.55, lng: 9.993 },
      { id: '5', nameEn: 'Cologne', nameRu: 'Кёльн', nameDe: 'Köln', lat: 50.938, lng: 6.96 },
      { id: '20', nameEn: 'Düsseldorf', nameRu: 'Дюссельдорф', nameDe: 'Düsseldorf', lat: 51.23, lng: 6.77 },
    ],
  },
  {
    id: '2',
    code: 'AT',
    nameEn: 'Austria',
    nameRu: 'Австрия',
    nameDe: 'Österreich',
    nameUa: 'Австрія',
    flagEmoji: '🇦🇹',
    cities: [
      { id: '6', nameEn: 'Vienna', nameRu: 'Вена', nameDe: 'Wien', isFeatured: true, lat: 48.208, lng: 16.373 },
      { id: '7', nameEn: 'Salzburg', nameRu: 'Зальцбург', nameDe: 'Salzburg', lat: 47.8, lng: 13.045 },
      { id: '8', nameEn: 'Innsbruck', nameRu: 'Инсбрук', nameDe: 'Innsbruck', lat: 47.26, lng: 11.394 },
    ],
  },
  {
    id: '3',
    code: 'CH',
    nameEn: 'Switzerland',
    nameRu: 'Швейцария',
    nameDe: 'Schweiz',
    nameUa: 'Швейцарія',
    flagEmoji: '🇨🇭',
    cities: [
      { id: '9', nameEn: 'Zurich', nameRu: 'Цюрих', nameDe: 'Zürich', isFeatured: true, lat: 47.376, lng: 8.541 },
      { id: '10', nameEn: 'Geneva', nameRu: 'Женева', nameDe: 'Genf', isFeatured: true, lat: 46.204, lng: 6.143 },
      { id: '11', nameEn: 'Basel', nameRu: 'Базель', nameDe: 'Basel', lat: 47.56, lng: 7.589 },
      { id: '12', nameEn: 'Bern', nameRu: 'Берн', nameDe: 'Bern', lat: 46.948, lng: 7.447 },
    ],
  },
  {
    id: '4',
    code: 'CZ',
    nameEn: 'Czech Republic',
    nameRu: 'Чехия',
    nameDe: 'Tschechien',
    nameUa: 'Чехія',
    flagEmoji: '🇨🇿',
    cities: [
      { id: '13', nameEn: 'Prague', nameRu: 'Прага', nameDe: 'Prag', isFeatured: true, lat: 50.075, lng: 14.437 },
      { id: '14', nameEn: 'Brno', nameRu: 'Брно', nameDe: 'Brünn', lat: 49.195, lng: 16.608 },
    ],
  },
  {
    id: '5',
    code: 'PL',
    nameEn: 'Poland',
    nameRu: 'Польша',
    nameDe: 'Polen',
    nameUa: 'Польща',
    flagEmoji: '🇵🇱',
    cities: [
      { id: '15', nameEn: 'Warsaw', nameRu: 'Варшава', nameDe: 'Warschau', isFeatured: true, lat: 52.23, lng: 21.012 },
      { id: '16', nameEn: 'Krakow', nameRu: 'Краков', nameDe: 'Krakau', lat: 50.064, lng: 19.945 },
      { id: '17', nameEn: 'Wroclaw', nameRu: 'Вроцлав', nameDe: 'Breslau', lat: 51.107, lng: 17.038 },
    ],
  },
  {
    id: '6',
    code: 'NL',
    nameEn: 'Netherlands',
    nameRu: 'Нидерланды',
    nameDe: 'Niederlande',
    nameUa: 'Нідерланди',
    flagEmoji: '🇳🇱',
    cities: [
      { id: '18', nameEn: 'Amsterdam', nameRu: 'Амстердам', nameDe: 'Amsterdam', isFeatured: true, lat: 52.37, lng: 4.895 },
      { id: '19', nameEn: 'Rotterdam', nameRu: 'Роттердам', nameDe: 'Rotterdam', lat: 51.924, lng: 4.477 },
    ],
  },
  {
    id: '7',
    code: 'BE',
    nameEn: 'Belgium',
    nameRu: 'Бельгия',
    nameDe: 'Belgien',
    nameUa: 'Бельгія',
    flagEmoji: '🇧🇪',
    cities: [
      { id: '21', nameEn: 'Brussels', nameRu: 'Брюссель', nameDe: 'Brüssel', isFeatured: true, lat: 50.85, lng: 4.35 },
      { id: '22', nameEn: 'Antwerp', nameRu: 'Антверпен', nameDe: 'Antwerpen', lat: 51.22, lng: 4.40 },
    ],
  },
  {
    id: '8',
    code: 'FR',
    nameEn: 'France',
    nameRu: 'Франция',
    nameDe: 'Frankreich',
    nameUa: 'Франція',
    flagEmoji: '🇫🇷',
    cities: [
      { id: '23', nameEn: 'Paris', nameRu: 'Париж', nameDe: 'Paris', isFeatured: true, lat: 48.856, lng: 2.352 },
      { id: '24', nameEn: 'Lyon', nameRu: 'Лион', nameDe: 'Lyon', lat: 45.764, lng: 4.835 },
    ],
  },
];

interface LocationsSectionProps {
  lang: 'en' | 'de' | 'ru' | 'ua';
}

const translations = {
  en: {
    title: 'Where We Operate',
    subtitle: 'Cash exchange and cryptocurrency services available in these locations',
    allCities: 'All Countries',
    cash: 'Cash Exchange',
    crypto: 'Crypto Exchange',
    available: 'Available Now',
    cities: 'cities',
    viewOnMap: 'View on map',
    openNow: 'Open 24/7',
    featuredLocations: 'Featured Locations',
    allLocations: 'All Locations',
  },
  de: {
    title: 'Wo wir arbeiten',
    subtitle: 'Bargeld- und Kryptowährungsservices an diesen Standorten verfügbar',
    allCities: 'Alle Länder',
    cash: 'Bargeldwechsel',
    crypto: 'Krypto-Austausch',
    available: 'Jetzt verfügbar',
    cities: 'Städte',
    viewOnMap: 'Auf Karte anzeigen',
    openNow: '24/7 geöffnet',
    featuredLocations: 'Ausgewählte Standorte',
    allLocations: 'Alle Standorte',
  },
  ru: {
    title: 'Где мы работаем',
    subtitle: 'Обмен наличных и криптовалют доступен в этих локациях',
    allCities: 'Все страны',
    cash: 'Обмен наличных',
    crypto: 'Обмен криптовалют',
    available: 'Доступно сейчас',
    cities: 'городов',
    viewOnMap: 'Показать на карте',
    openNow: 'Открыто 24/7',
    featuredLocations: 'Популярные локации',
    allLocations: 'Все локации',
  },
  ua: {
    title: 'Де ми працюємо',
    subtitle: 'Обмін готівки та криптовалют доступний у цих локаціях',
    allCities: 'Усі країни',
    cash: 'Обмін готівки',
    crypto: 'Обмін криптовалют',
    available: 'Доступно зараз',
    cities: 'міст',
    viewOnMap: 'Показати на карті',
    openNow: 'Відкрито 24/7',
    featuredLocations: 'Популярні локації',
    allLocations: 'Всі локації',
  },
};

// City Ticker Component
function CityTicker({ cities, lang }: { cities: Array<{ city: City; country: Country }>; lang: string }) {
  const getName = (item: { nameEn: string; nameRu?: string; nameUa?: string; nameDe?: string }) => {
    if (lang === 'ru' && item.nameRu) return item.nameRu;
    if (lang === 'ua' && item.nameUa) return item.nameUa;
    if (lang === 'de' && item.nameDe) return item.nameDe;
    return item.nameEn;
  };

  const tickerContent = [...cities, ...cities]; // Duplicate for seamless loop

  return (
    <div className="overflow-hidden py-4 bg-gradient-to-r from-slate-800/50 via-slate-700/30 to-slate-800/50 rounded-2xl mb-8">
      <div className="marquee">
        <div className="marquee-content flex space-x-8">
          {tickerContent.map((item, index) => (
            <div
              key={`${item.city.id}-${index}`}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-700/30 rounded-xl whitespace-nowrap hover:bg-slate-600/30 transition-colors cursor-pointer"
            >
              <span className="text-lg">{item.country.flagEmoji}</span>
              <span className="text-white font-medium">{getName(item.city)}</span>
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Europe Map Visualization Component
function EuropeMapVisualization({ countries, selectedCountry, onSelectCountry, lang }: {
  countries: Country[];
  selectedCountry: Country | null;
  onSelectCountry: (country: Country | null) => void;
  lang: string;
}) {
  const getName = (item: { nameEn: string; nameRu?: string; nameUa?: string; nameDe?: string }) => {
    if (lang === 'ru' && item.nameRu) return item.nameRu;
    if (lang === 'ua' && item.nameUa) return item.nameUa;
    if (lang === 'de' && item.nameDe) return item.nameDe;
    return item.nameEn;
  };

  // Simplified map positions for European countries
  const countryPositions: Record<string, { x: number; y: number }> = {
    'DE': { x: 50, y: 45 },
    'AT': { x: 55, y: 55 },
    'CH': { x: 45, y: 58 },
    'CZ': { x: 58, y: 48 },
    'PL': { x: 65, y: 42 },
    'NL': { x: 42, y: 38 },
    'BE': { x: 38, y: 42 },
    'FR': { x: 32, y: 52 },
  };

  return (
    <div className="relative w-full h-80 bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl overflow-hidden border border-slate-700/50">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" className="text-slate-600" />
        </svg>
      </div>

      {/* Connection lines */}
      <svg className="absolute inset-0" style={{ zIndex: 1 }}>
        {countries.map((country, i) => {
          const pos = countryPositions[country.code];
          if (!pos) return null;
          return countries.slice(i + 1).map((other) => {
            const otherPos = countryPositions[other.code];
            if (!otherPos) return null;
            return (
              <line
                key={`${country.code}-${other.code}`}
                x1={`${pos.x}%`}
                y1={`${pos.y}%`}
                x2={`${otherPos.x}%`}
                y2={`${otherPos.y}%`}
                stroke="rgba(16, 185, 129, 0.15)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            );
          });
        })}
      </svg>

      {/* Country markers */}
      {countries.map((country) => {
        const pos = countryPositions[country.code];
        if (!pos) return null;
        const isSelected = selectedCountry?.id === country.id;

        return (
          <button
            key={country.code}
            onClick={() => onSelectCountry(isSelected ? null : country)}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-10 group ${
              isSelected ? 'scale-125' : 'hover:scale-110'
            }`}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            {/* Pulse ring for selected */}
            {isSelected && (
              <div className="absolute inset-0 -m-3 bg-emerald-400/30 rounded-full animate-ping" />
            )}

            {/* Marker */}
            <div className={`relative flex flex-col items-center ${isSelected ? 'z-20' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${
                isSelected
                  ? 'bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/50'
                  : 'bg-slate-700/80 group-hover:bg-slate-600/80'
              }`}>
                {country.flagEmoji}
              </div>

              {/* Label */}
              <div className={`mt-1 px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-800/90 text-slate-300 group-hover:bg-slate-700/90'
              }`}>
                {getName(country)}
              </div>

              {/* City count badge */}
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                {country.cities.length}
              </div>
            </div>
          </button>
        );
      })}

      {/* Map title overlay */}
      <div className="absolute top-4 left-4 flex items-center space-x-2 text-slate-400 text-sm">
        <Globe className="w-4 h-4" />
        <span>Europe Network</span>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 flex items-center space-x-4 text-xs text-slate-400">
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
          <span>Active</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
          <span>Cities</span>
        </div>
      </div>
    </div>
  );
}

export function LocationsSection({ lang }: LocationsSectionProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const t = translations[lang];

  const getName = (item: { nameEn: string; nameRu?: string; nameUa?: string; nameDe?: string }) => {
    if (lang === 'ru' && item.nameRu) return item.nameRu;
    if (lang === 'ua' && item.nameUa) return item.nameUa;
    if (lang === 'de' && item.nameDe) return item.nameDe;
    return item.nameEn;
  };

  const allCities = demoCountries.flatMap(country =>
    country.cities.map(city => ({ city, country }))
  );

  const featuredCities = allCities.filter(item => item.city.isFeatured);

  const displayCities = selectedCountry
    ? selectedCountry.cities.map(city => ({ city, country: selectedCountry }))
    : allCities;

  return (
    <section className="py-16" id="locations">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            {t.title}
          </span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto">{t.subtitle}</p>
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-8 mb-8">
        <div className="text-center">
          <div className="text-3xl font-bold text-emerald-400">{demoCountries.length}</div>
          <div className="text-sm text-slate-400">Countries</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-cyan-400">{allCities.length}</div>
          <div className="text-sm text-slate-400">Cities</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-400">24/7</div>
          <div className="text-sm text-slate-400">Service</div>
        </div>
      </div>

      {/* City Ticker */}
      <CityTicker cities={featuredCities} lang={lang} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Map */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <MapPin className="w-5 h-5 text-emerald-400 mr-2" />
            {t.featuredLocations}
          </h3>
          <EuropeMapVisualization
            countries={demoCountries}
            selectedCountry={selectedCountry}
            onSelectCountry={setSelectedCountry}
            lang={lang}
          />
        </div>

        {/* City List */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Navigation className="w-5 h-5 text-cyan-400 mr-2" />
            {t.allLocations}
          </h3>

          {/* Country Filter Pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setSelectedCountry(null)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                !selectedCountry
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
              }`}
            >
              {t.allCities}
            </button>
            {demoCountries.map((country) => (
              <button
                key={country.id}
                onClick={() => setSelectedCountry(selectedCountry?.id === country.id ? null : country)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-1 ${
                  selectedCountry?.id === country.id
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                }`}
              >
                <span>{country.flagEmoji}</span>
                <span>{country.code}</span>
              </button>
            ))}
          </div>

          {/* Cities Grid */}
          <div className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700/50 max-h-[280px] overflow-y-auto scrollbar-thin">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {displayCities.map((item) => (
                <div
                  key={item.city.id}
                  className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{item.country.flagEmoji}</span>
                    <div>
                      <div className="font-medium text-white group-hover:text-emerald-400 transition-colors">
                        {getName(item.city)}
                      </div>
                      <div className="text-xs text-slate-400">{getName(item.country)}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex flex-col items-end">
                      <span className="flex items-center text-xs text-emerald-400">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {t.available}
                      </span>
                      <span className="flex items-center text-xs text-slate-500">
                        <Clock className="w-3 h-3 mr-1" />
                        24/7
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LocationsSection;
