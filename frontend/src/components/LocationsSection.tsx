import { useState } from 'react';
import { cn } from '../utils/cn';

interface City {
  id: string;
  nameEn: string;
  nameRu?: string;
  nameUa?: string;
  nameDe?: string;
  isFeatured?: boolean;
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

// Demo data - in production would come from API
const demoCountries: Country[] = [
  {
    id: '1',
    code: 'DE',
    nameEn: 'Germany',
    nameRu: 'Германия',
    flagEmoji: '🇩🇪',
    cities: [
      { id: '1', nameEn: 'Berlin', nameRu: 'Берлин', isFeatured: true },
      { id: '2', nameEn: 'Munich', nameRu: 'Мюнхен', isFeatured: true },
      { id: '3', nameEn: 'Frankfurt', nameRu: 'Франкфурт' },
      { id: '4', nameEn: 'Hamburg', nameRu: 'Гамбург' },
      { id: '5', nameEn: 'Cologne', nameRu: 'Кёльн' },
    ],
  },
  {
    id: '2',
    code: 'AT',
    nameEn: 'Austria',
    nameRu: 'Австрия',
    flagEmoji: '🇦🇹',
    cities: [
      { id: '6', nameEn: 'Vienna', nameRu: 'Вена', isFeatured: true },
      { id: '7', nameEn: 'Salzburg', nameRu: 'Зальцбург' },
      { id: '8', nameEn: 'Innsbruck', nameRu: 'Инсбрук' },
    ],
  },
  {
    id: '3',
    code: 'CH',
    nameEn: 'Switzerland',
    nameRu: 'Швейцария',
    flagEmoji: '🇨🇭',
    cities: [
      { id: '9', nameEn: 'Zurich', nameRu: 'Цюрих', isFeatured: true },
      { id: '10', nameEn: 'Geneva', nameRu: 'Женева', isFeatured: true },
      { id: '11', nameEn: 'Basel', nameRu: 'Базель' },
      { id: '12', nameEn: 'Bern', nameRu: 'Берн' },
    ],
  },
  {
    id: '4',
    code: 'CZ',
    nameEn: 'Czech Republic',
    nameRu: 'Чехия',
    flagEmoji: '🇨🇿',
    cities: [
      { id: '13', nameEn: 'Prague', nameRu: 'Прага', isFeatured: true },
      { id: '14', nameEn: 'Brno', nameRu: 'Брно' },
    ],
  },
  {
    id: '5',
    code: 'PL',
    nameEn: 'Poland',
    nameRu: 'Польша',
    flagEmoji: '🇵🇱',
    cities: [
      { id: '15', nameEn: 'Warsaw', nameRu: 'Варшава', isFeatured: true },
      { id: '16', nameEn: 'Krakow', nameRu: 'Краков' },
      { id: '17', nameEn: 'Wroclaw', nameRu: 'Вроцлав' },
    ],
  },
  {
    id: '6',
    code: 'NL',
    nameEn: 'Netherlands',
    nameRu: 'Нидерланды',
    flagEmoji: '🇳🇱',
    cities: [
      { id: '18', nameEn: 'Amsterdam', nameRu: 'Амстердам', isFeatured: true },
      { id: '19', nameEn: 'Rotterdam', nameRu: 'Роттердам' },
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
    allCities: 'All cities',
    cash: 'Cash Exchange',
    crypto: 'Crypto Exchange',
    available: 'Available',
  },
  de: {
    title: 'Wo wir arbeiten',
    subtitle: 'Bargeld- und Kryptowährungsservices an diesen Standorten verfügbar',
    allCities: 'Alle Städte',
    cash: 'Bargeldwechsel',
    crypto: 'Krypto-Austausch',
    available: 'Verfügbar',
  },
  ru: {
    title: 'Где мы работаем',
    subtitle: 'Обмен наличных и криптовалют доступен в этих локациях',
    allCities: 'Все города',
    cash: 'Обмен наличных',
    crypto: 'Обмен криптовалют',
    available: 'Доступно',
  },
  ua: {
    title: 'Де ми працюємо',
    subtitle: 'Обмін готівки та криптовалют доступний у цих локаціях',
    allCities: 'Усі міста',
    cash: 'Обмін готівки',
    crypto: 'Обмін криптовалют',
    available: 'Доступно',
  },
};

export function LocationsSection({ lang }: LocationsSectionProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const t = translations[lang];

  const getName = (item: { nameEn: string; nameRu?: string; nameUa?: string; nameDe?: string }) => {
    if (lang === 'ru' && item.nameRu) return item.nameRu;
    if (lang === 'ua' && item.nameUa) return item.nameUa;
    if (lang === 'de' && item.nameDe) return item.nameDe;
    return item.nameEn;
  };

  const featuredCities = demoCountries.flatMap(country =>
    country.cities
      .filter(city => city.isFeatured)
      .map(city => ({ ...city, country }))
  );

  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            {t.title}
          </span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto">{t.subtitle}</p>
      </div>

      {/* Featured Cities */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
        {featuredCities.map((city) => (
          <div
            key={city.id}
            className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50 hover:border-emerald-500/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">{city.country.flagEmoji}</span>
              <span className="text-sm text-slate-400">{city.country.code}</span>
            </div>
            <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
              {getName(city)}
            </h3>
            <div className="flex items-center mt-2 space-x-1">
              <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
              <span className="text-xs text-emerald-400">{t.available}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Countries List */}
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50">
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          <button
            onClick={() => setSelectedCountry(null)}
            className={cn(
              'px-4 py-2 rounded-xl font-medium transition-all',
              !selectedCountry
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
            )}
          >
            {t.allCities}
          </button>
          {demoCountries.map((country) => (
            <button
              key={country.id}
              onClick={() => setSelectedCountry(country)}
              className={cn(
                'px-4 py-2 rounded-xl font-medium transition-all flex items-center space-x-2',
                selectedCountry?.id === country.id
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              )}
            >
              <span>{country.flagEmoji}</span>
              <span>{getName(country)}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {(selectedCountry ? selectedCountry.cities : demoCountries.flatMap(c => c.cities.map(city => ({ ...city, country: c })))).map((city: any) => (
            <div
              key={city.id}
              className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-colors cursor-pointer"
            >
              {city.country && (
                <span className="text-lg">{city.country.flagEmoji}</span>
              )}
              <div>
                <div className="font-medium text-white">{getName(city)}</div>
                <div className="text-xs text-slate-400 flex items-center space-x-2">
                  <span className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1"></span>
                    {t.cash}
                  </span>
                  <span className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-1"></span>
                    {t.crypto}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LocationsSection;
