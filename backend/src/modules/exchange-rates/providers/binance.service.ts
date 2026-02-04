import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

// Fixed interface - Binance 24hr ticker returns lastPrice, not price
interface BinanceTicker {
  symbol: string;
  lastPrice: string;        // <-- This is the correct field name
  priceChange: string;
  priceChangePercent: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
}

@Injectable()
export class BinanceService {
  private readonly logger = new Logger(BinanceService.name);
  private readonly baseUrl = 'https://api.binance.com/api/v3';

  private readonly pairs = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'SOLUSDT',
    'ADAUSDT', 'DOGEUSDT', 'TRXUSDT', 'DOTUSDT', 'MATICUSDT',
    'LTCUSDT', 'AVAXUSDT', 'LINKUSDT', 'XLMUSDT', 'ATOMUSDT',
    'XMRUSDT', 'ETCUSDT', 'TONUSDT', 'NEARUSDT', 'APTUSDT',
    'BTCEUR', 'ETHEUR', 'BNBEUR',
  ];

  constructor(private httpService: HttpService) {}

  async getRates(): Promise<Array<{
    baseCurrency: string;
    quoteCurrency: string;
    rate: number;
    change24h?: number;
    high24h?: number;
    low24h?: number;
    volume24h?: number;
  }>> {
    try {
      const symbols = JSON.stringify(this.pairs);
      const url = `${this.baseUrl}/ticker/24hr?symbols=${encodeURIComponent(symbols)}`;
      
      const response = await firstValueFrom(
        this.httpService.get<BinanceTicker[]>(url),
      );

      return response.data
        .map((ticker) => {
          const { base, quote } = this.parseSymbol(ticker.symbol);
          const rate = parseFloat(ticker.lastPrice);  // <-- Fixed: use lastPrice
          
          // Skip invalid rates
          if (isNaN(rate) || rate <= 0) {
            this.logger.warn(`Invalid rate for ${ticker.symbol}: ${ticker.lastPrice}`);
            return null;
          }

          return {
            baseCurrency: base,
            quoteCurrency: quote,
            rate,
            change24h: parseFloat(ticker.priceChangePercent) || 0,
            high24h: parseFloat(ticker.highPrice) || undefined,
            low24h: parseFloat(ticker.lowPrice) || undefined,
            volume24h: parseFloat(ticker.quoteVolume) || undefined,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);
    } catch (error) {
      this.logger.error('Binance API error:', error.message);
      return [];
    }
  }

  private parseSymbol(symbol: string): { base: string; quote: string } {
    const quoteAssets = ['USDT', 'USDC', 'BUSD', 'EUR', 'GBP', 'BTC', 'ETH'];
    for (const quote of quoteAssets) {
      if (symbol.endsWith(quote)) {
        return {
          base: symbol.slice(0, -quote.length),
          quote: quote === 'USDT' ? 'USD' : quote,
        };
      }
    }
    return { base: symbol.slice(0, 3), quote: symbol.slice(3) };
  }

  async getOrderBook(symbol: string, limit: number = 20) {
    try {
      const url = this.baseUrl + '/depth?symbol=' + symbol + '&limit=' + limit;
      const response = await firstValueFrom(
        this.httpService.get<Record<string, unknown>>(url),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get order book for ${symbol}:`, error.message);
      return null;
    }
  }

  async getKlines(symbol: string, interval: string = '1h', limit: number = 100) {
    try {
      const url = this.baseUrl + '/klines?symbol=' + symbol + '&interval=' + interval + '&limit=' + limit;
      const response = await firstValueFrom(
        this.httpService.get<any[]>(url),
      );
      return response.data.map((k) => ({
        openTime: k[0],
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5]),
        closeTime: k[6],
      }));
    } catch (error) {
      this.logger.error(`Failed to get klines for ${symbol}:`, error.message);
      return [];
    }
  }
}