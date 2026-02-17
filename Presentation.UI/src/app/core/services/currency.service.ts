import { Injectable, signal } from '@angular/core';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  public availableCurrencies: Currency[] = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' }
  ];

  // Exchange rates relative to USD (base currency)
  private exchangeRates: Record<string, number> = {
    'USD': 1.0,
    'BDT': 110.0,      // 1 USD = 110 BDT
    'EUR': 0.92,       // 1 USD = 0.92 EUR
    'INR': 83.0,       // 1 USD = 83 INR
    'GBP': 0.79,       // 1 USD = 0.79 GBP
    'JPY': 150.0,      // 1 USD = 150 JPY
    'CNY': 7.2,        // 1 USD = 7.2 CNY
    'AUD': 1.52,       // 1 USD = 1.52 AUD
    'CAD': 1.35,       // 1 USD = 1.35 CAD
    'SGD': 1.34,       // 1 USD = 1.34 SGD
    'PKR': 278.0,      // 1 USD = 278 PKR
    'SAR': 3.75,       // 1 USD = 3.75 SAR
    'AED': 3.67        // 1 USD = 3.67 AED
  };

  public selectedCurrency = signal<Currency>(this.availableCurrencies[0]);
  private baseCurrency = 'USD'; // Assume all amounts are stored in USD

  constructor() {
    // Load saved currency from localStorage
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency) {
      try {
        const currency = JSON.parse(savedCurrency);
        const foundCurrency = this.availableCurrencies.find(c => c.code === currency.code);
        if (foundCurrency) {
          this.selectedCurrency.set(foundCurrency);
        }
      } catch (e) {
        // If parsing fails, use default
        console.error('Failed to parse saved currency:', e);
      }
    }
  }

  setCurrency(currency: Currency): void {
    this.selectedCurrency.set(currency);
    // Save to localStorage
    localStorage.setItem('selectedCurrency', JSON.stringify(currency));
  }

  getCurrency(): Currency {
    return this.selectedCurrency();
  }

  getCurrencySymbol(): string {
    return this.selectedCurrency().symbol;
  }

  getCurrencyCode(): string {
    return this.selectedCurrency().code;
  }

  /**
   * Convert amount from base currency (USD) to selected currency
   * @param amount Amount in base currency (USD)
   * @returns Converted amount in selected currency
   */
  convertAmount(amount: number): number {
    const selectedCode = this.selectedCurrency().code;
    const rate = this.exchangeRates[selectedCode] || 1;
    return amount * rate;
  }

  /**
   * Format currency with symbol and proper formatting
   * @param value Amount in base currency (USD)
   * @returns Formatted string with symbol
   */
  formatCurrency(value: number): string {
    const converted = this.convertAmount(value);
    const symbol = this.getCurrencySymbol();
    const code = this.getCurrencyCode();
    
    // For currencies like JPY that don't use decimals
    const decimals = ['JPY'].includes(code) ? 0 : 2;
    
    const formatted = converted.toLocaleString('en-US', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
    
    // Place symbol based on currency convention
    if (['USD', 'BDT', 'INR', 'PKR', 'SAR', 'AED'].includes(code)) {
      return `${symbol}${formatted}`;
    } else {
      return `${symbol} ${formatted}`;
    }
  }

  /**
   * Get formatted currency value without symbol (just the number)
   */
  formatCurrencyValue(value: number): string {
    const converted = this.convertAmount(value);
    const code = this.getCurrencyCode();
    const decimals = ['JPY'].includes(code) ? 0 : 2;
    
    return converted.toLocaleString('en-US', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  }
}

