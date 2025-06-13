import axios from 'axios';

// API Keys
const FINNHUB_API_KEY = 'd15eev1r01qhqto5b3vgd15eev1r01qhqto5b400';
const ALPHA_VANTAGE_API_KEY = 'JSFJNQ1UHFJSUWZC';

// Base URLs
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

// Interfaces
export interface StockQuote {
  c: number;  // Current price
  d: number;  // Change
  dp: number; // Percent change
  h: number;  // High price of the day
  l: number;  // Low price of the day
  o: number;  // Open price of the day
  pc: number; // Previous close price
  v: number;  // Volume
}

export interface CompanyProfile {
  country: string;
  currency: string;
  exchange: string;
  finnhubIndustry: string;
  ipo: string;
  logo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
}

export interface MarketNews {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

export interface EconomicCalendarEvent {
  actual: number;
  country: string;
  estimate: number;
  event: string;
  impact: string;
  prev: number;
  time: string;
  unit: string;
}

// Finnhub API functions
export const fetchStockData = async (symbol: string): Promise<StockQuote> => {
  try {
    const response = await axios.get(`${FINNHUB_BASE_URL}/quote`, {
      params: {
        symbol: symbol,
        token: FINNHUB_API_KEY
      }
    });
    
    if (response.data && Object.keys(response.data).length > 0) {
      return response.data;
    } else {
      // Return mock data if API fails
      return generateMockStockData();
    }
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error);
    // Return mock data on error
    return generateMockStockData();
  }
};

export const fetchCompanyProfile = async (symbol: string): Promise<CompanyProfile> => {
  try {
    const response = await axios.get(`${FINNHUB_BASE_URL}/stock/profile2`, {
      params: {
        symbol: symbol,
        token: FINNHUB_API_KEY
      }
    });
    
    if (response.data && response.data.name) {
      return response.data;
    } else {
      return generateMockCompanyProfile(symbol);
    }
  } catch (error) {
    console.error(`Error fetching company profile for ${symbol}:`, error);
    return generateMockCompanyProfile(symbol);
  }
};

export const fetchMarketNews = async (category: string = 'general'): Promise<MarketNews[]> => {
  try {
    const response = await axios.get(`${FINNHUB_BASE_URL}/news`, {
      params: {
        category: category,
        token: FINNHUB_API_KEY
      }
    });
    
    if (response.data && Array.isArray(response.data)) {
      return response.data.slice(0, 10); // Return first 10 news items
    } else {
      return generateMockNews();
    }
  } catch (error) {
    console.error('Error fetching market news:', error);
    return generateMockNews();
  }
};

export const fetchEconomicCalendar = async (): Promise<EconomicCalendarEvent[]> => {
  try {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const response = await axios.get(`${FINNHUB_BASE_URL}/calendar/economic`, {
      params: {
        from: today.toISOString().split('T')[0],
        to: nextWeek.toISOString().split('T')[0],
        token: FINNHUB_API_KEY
      }
    });
    
    if (response.data && response.data.economicCalendar) {
      return response.data.economicCalendar;
    } else {
      return generateMockEconomicData();
    }
  } catch (error) {
    console.error('Error fetching economic calendar:', error);
    return generateMockEconomicData();
  }
};

export const searchStocks = async (query: string): Promise<any[]> => {
  try {
    const response = await axios.get(`${FINNHUB_BASE_URL}/search`, {
      params: {
        q: query,
        token: FINNHUB_API_KEY
      }
    });
    
    if (response.data && response.data.result) {
      return response.data.result.slice(0, 10);
    } else {
      return generateMockSearchResults(query);
    }
  } catch (error) {
    console.error('Error searching stocks:', error);
    return generateMockSearchResults(query);
  }
};

// Alpha Vantage API functions
export const fetchTimeSeriesData = async (symbol: string, interval: string = 'DAILY') => {
  try {
    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: interval === 'INTRADAY' ? 'TIME_SERIES_INTRADAY' : 'TIME_SERIES_DAILY',
        symbol: symbol,
        interval: interval === 'INTRADAY' ? '5min' : undefined,
        apikey: ALPHA_VANTAGE_API_KEY,
        outputsize: 'compact'
      }
    });
    
    if (response.data && !response.data['Error Message']) {
      return response.data;
    } else {
      return generateMockTimeSeriesData(symbol);
    }
  } catch (error) {
    console.error(`Error fetching time series data for ${symbol}:`, error);
    return generateMockTimeSeriesData(symbol);
  }
};

export const fetchMarketOverview = async () => {
  try {
    // Fetch data for major indices
    const symbols = ['SPY', 'QQQ', 'DIA', 'IWM'];
    const promises = symbols.map(symbol => fetchStockData(symbol));
    const results = await Promise.all(promises);
    
    return symbols.map((symbol, index) => ({
      symbol,
      data: results[index]
    }));
  } catch (error) {
    console.error('Error fetching market overview:', error);
    return generateMockMarketOverview();
  }
};

// Mock data generators for fallback
const generateMockStockData = (): StockQuote => {
  const basePrice = 100 + Math.random() * 400;
  const change = (Math.random() - 0.5) * 20;
  const percentChange = (change / basePrice) * 100;
  
  return {
    c: parseFloat(basePrice.toFixed(2)),
    d: parseFloat(change.toFixed(2)),
    dp: parseFloat(percentChange.toFixed(2)),
    h: parseFloat((basePrice + Math.random() * 10).toFixed(2)),
    l: parseFloat((basePrice - Math.random() * 10).toFixed(2)),
    o: parseFloat((basePrice + (Math.random() - 0.5) * 5).toFixed(2)),
    pc: parseFloat((basePrice - change).toFixed(2)),
    v: Math.floor(Math.random() * 10000000) + 1000000
  };
};

const generateMockCompanyProfile = (symbol: string): CompanyProfile => ({
  country: 'US',
  currency: 'USD',
  exchange: 'NASDAQ',
  finnhubIndustry: 'Technology',
  ipo: '2020-01-01',
  logo: 'https://via.placeholder.com/100',
  marketCapitalization: Math.floor(Math.random() * 1000000) + 100000,
  name: `${symbol} Corporation`,
  phone: '+1-555-0123',
  shareOutstanding: Math.floor(Math.random() * 1000000000) + 100000000,
  ticker: symbol,
  weburl: `https://www.${symbol.toLowerCase()}.com`
});

const generateMockNews = (): MarketNews[] => [
  {
    category: 'general',
    datetime: Date.now(),
    headline: 'Markets Show Strong Performance Amid Economic Uncertainty',
    id: 1,
    image: 'https://images.pexels.com/photos/159888/pexels-photo-159888.jpeg',
    related: 'AAPL,MSFT,GOOGL',
    source: 'Financial Times',
    summary: 'Stock markets continue to show resilience despite ongoing economic challenges...',
    url: '#'
  },
  {
    category: 'general',
    datetime: Date.now(),
    headline: 'Tech Stocks Rally on AI Optimism',
    id: 2,
    image: 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg',
    related: 'NVDA,META,TSLA',
    source: 'Reuters',
    summary: 'Technology companies see significant gains as AI adoption accelerates...',
    url: '#'
  }
];

const generateMockEconomicData = (): EconomicCalendarEvent[] => [
  {
    actual: 3.2,
    country: 'US',
    estimate: 3.1,
    event: 'GDP Growth Rate',
    impact: 'high',
    prev: 3.0,
    time: new Date().toISOString(),
    unit: '%'
  },
  {
    actual: 0.25,
    country: 'US',
    estimate: 0.25,
    event: 'Federal Funds Rate',
    impact: 'high',
    prev: 0.25,
    time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    unit: '%'
  }
];

const generateMockSearchResults = (query: string): any[] => [
  {
    description: `${query} Corporation`,
    displaySymbol: query.toUpperCase(),
    symbol: query.toUpperCase(),
    type: 'Common Stock'
  }
];

const generateMockTimeSeriesData = (symbol: string) => {
  const data: any = {};
  const timeSeriesKey = 'Time Series (Daily)';
  data[timeSeriesKey] = {};
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const basePrice = 100 + Math.random() * 400;
    
    data[timeSeriesKey][date] = {
      '1. open': (basePrice + (Math.random() - 0.5) * 5).toFixed(2),
      '2. high': (basePrice + Math.random() * 10).toFixed(2),
      '3. low': (basePrice - Math.random() * 10).toFixed(2),
      '4. close': basePrice.toFixed(2),
      '5. volume': Math.floor(Math.random() * 10000000) + 1000000
    };
  }
  
  return data;
};

const generateMockMarketOverview = () => [
  { symbol: 'SPY', data: generateMockStockData() },
  { symbol: 'QQQ', data: generateMockStockData() },
  { symbol: 'DIA', data: generateMockStockData() },
  { symbol: 'IWM', data: generateMockStockData() }
];

// Error handling wrapper
export const withErrorHandling = async <T>(
  apiCall: () => Promise<T>,
  fallback: T
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error) {
    console.error('API call failed:', error);
    return fallback;
  }
};