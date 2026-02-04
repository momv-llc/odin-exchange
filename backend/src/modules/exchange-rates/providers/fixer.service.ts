import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

interface FixerResponse {
  success: boolean;
  timestamp: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

@Injectable()
export class FixerService {
  private readonly logger = new Logger(FixerService.name);
  private readonly baseUrl = 'http://data.fixer.io/api';
  private readonly apiKey: string;

  // Supported fiat currencies
  private readonly supportedCurrencies = [
    'USD', 'EUR', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD', 'NZD',
    'CNY', 'HKD', 'SGD', 'INR', 'KRW', 'RUB', 'UAH', 'PLN',
    'CZK', 'TRY', 'BRL', 'MXN', 'ZAR', 'AED', 'SAR', 'THB',
  ];

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('FIXER_API_KEY') || 'demo';
  }

  async getRates(): Promise<Array<{
    baseCurrency: string;
    quoteCurrency: string;
    rate: number;
  }>> {
    try {
      const symbols = this.supportedCurrencies.join(',');
      const url = `${this.baseUrl}/latest?access_key=${this.apiKey}&symbols=${symbols}`;
      
      const response = await firstValueFrom(
        this.httpService.get<FixerResponse>(url),
      );

      if (!response.data.success) {
        this.logger.error('Fixer API error:', response.data);
        return this.getFallbackRates();
      }

      const rates: Array<{
        baseCurrency: string;
        quoteCurrency: string;
        rate: number;
      }> = [];

      const baseRates = response.data.rates;
      const eurToUsd = baseRates['USD'] || 1.1;

      // Convert EUR-based rates to USD-based
      for (const [currency, eurRate] of Object.entries(baseRates)) {
        if (currency !== 'USD') {
          rates.push({
            baseCurrency: 'USD',
            quoteCurrency: currency,
            rate: eurRate / eurToUsd,
          });
        }
      }

      // Add EUR/USD pair
      rates.push({
        baseCurrency: 'EUR',
        quoteCurrency: 'USD',
        rate: eurToUsd,
      });

      return rates;
    } catch (error) {
      this.logger.error('Fixer API error:', error.message);
      return this.getFallbackRates();
    }
  }

  private getFallbackRates(): Array<{
    baseCurrency: string;
    quoteCurrency: string;
    rate: number;
  }> {
    // Fallback rates in case API is unavailable
    return [
      { baseCurrency: 'EUR', quoteCurrency: 'USD', rate: 1.08 },
      { baseCurrency: 'USD', quoteCurrency: 'EUR', rate: 0.926 },
      { baseCurrency: 'USD', quoteCurrency: 'GBP', rate: 0.79 },
      { baseCurrency: 'USD', quoteCurrency: 'CHF', rate: 0.88 },
      { baseCurrency: 'USD', quoteCurrency: 'JPY', rate: 149.5 },
      { baseCurrency: 'USD', quoteCurrency: 'CAD', rate: 1.36 },
      { baseCurrency: 'USD', quoteCurrency: 'AUD', rate: 1.53 },
      { baseCurrency: 'USD', quoteCurrency: 'CNY', rate: 7.24 },
      { baseCurrency: 'USD', quoteCurrency: 'RUB', rate: 92.5 },
      { baseCurrency: 'USD', quoteCurrency: 'UAH', rate: 41.2 },
    ];
  }

  async getHistoricalRate(date: string, base: string = 'EUR') {
    try {
      const url = `${this.baseUrl}/${date}?access_key=${this.apiKey}&base=${base}`;
      const response = await firstValueFrom(
        this.httpService.get<Record<string, unknown>>(url),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get historical rate for ${date}:`, error.message);
      return null;
    }
  }
}
