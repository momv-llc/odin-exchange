import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

interface CoinGeckoPrice {
  [key: string]: {
    usd: number;
    usd_24h_change?: number;
    usd_24h_vol?: number;
    usd_market_cap?: number;
  };
}

@Injectable()
export class CoinGeckoService {
  private readonly logger = new Logger(CoinGeckoService.name);
  private readonly baseUrl = 'https://api.coingecko.com/api/v3';
  private readonly apiKey?: string;

  // CoinGecko ID mapping
  private readonly coinIds: Record<string, string> = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    USDT: 'tether',
    BNB: 'binancecoin',
    XRP: 'ripple',
    USDC: 'usd-coin',
    SOL: 'solana',
    ADA: 'cardano',
    DOGE: 'dogecoin',
    TRX: 'tron',
    TON: 'the-open-network',
    DOT: 'polkadot',
    MATIC: 'matic-network',
    LTC: 'litecoin',
    AVAX: 'avalanche-2',
    LINK: 'chainlink',
    XLM: 'stellar',
    ATOM: 'cosmos',
    XMR: 'monero',
    ETC: 'ethereum-classic',
  };

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('COINGECKO_API_KEY');
  }

  async getRates(): Promise<Array<{
    baseCurrency: string;
    quoteCurrency: string;
    rate: number;
    change24h?: number;
    volume24h?: number;
    marketCap?: number;
  }>> {
    try {
      const ids = Object.values(this.coinIds).join(',');
      const url = `${this.baseUrl}/simple/price?ids=${ids}&vs_currencies=usd,eur&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`;
      
      const headers: Record<string, string> = {};
      if (this.apiKey) {
        headers['x-cg-demo-api-key'] = this.apiKey;
      }

      const response = await firstValueFrom(
        this.httpService.get<CoinGeckoPrice>(url, { headers }),
      );

      const rates: Array<{
        baseCurrency: string;
        quoteCurrency: string;
        rate: number;
        change24h?: number;
        volume24h?: number;
        marketCap?: number;
      }> = [];

      for (const [symbol, coinId] of Object.entries(this.coinIds)) {
        const data = response.data[coinId];
        if (data) {
          rates.push({
            baseCurrency: symbol,
            quoteCurrency: 'USD',
            rate: data.usd,
            change24h: data.usd_24h_change,
            volume24h: data.usd_24h_vol,
            marketCap: data.usd_market_cap,
          });
        }
      }

      return rates;
    } catch (error) {
      this.logger.error('CoinGecko API error:', error.message);
      return [];
    }
  }

  async getCoinDetails(coinId: string) {
    try {
      const url = `${this.baseUrl}/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`;
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get coin details for ${coinId}:`, error.message);
      return null;
    }
  }

  async getHistoricalPrices(coinId: string, days: number = 30) {
    try {
      const url = `${this.baseUrl}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`;
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get historical prices for ${coinId}:`, error.message);
      return null;
    }
  }
}
