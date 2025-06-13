import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, BarChart3, DollarSign,
  Users, Globe, Zap, AlertCircle, RefreshCw, Eye
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { fetchStockData, fetchMarketOverview } from '../services/api';

interface DashboardProps {
  darkMode: boolean;
}

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

interface ChartData {
  time: string;
  price: number;
  volume: number;
}

const Dashboard: React.FC<DashboardProps> = ({ darkMode }) => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const topStocks = [
    ['AAPL', 'Apple Inc.'],
    ['MSFT', 'Microsoft Corp.'],
    ['GOOGL', 'Alphabet Inc.'],
    ['AMZN', 'Amazon.com Inc.'],
    ['META', 'Meta Platforms Inc.'],
    ['NVDA', 'NVIDIA Corp.'],
    ['TSLA', 'Tesla Inc.'],
    ['NFLX', 'Netflix Inc.'],
    ['ADBE', 'Adobe Inc.'],
    ['CRM', 'Salesforce Inc.'],
    ['JPM', 'JPMorgan Chase & Co.'],
    ['GS', 'Goldman Sachs Group Inc.'],
    ['MS', 'Morgan Stanley'],
    ['BAC', 'Bank of America Corp.'],
    ['WFC', 'Wells Fargo & Co.'],
    ['F', 'Ford Motor Co.'],
    ['GM', 'General Motors Co.'],
    ['JNJ', 'Johnson & Johnson'],
    ['PFE', 'Pfizer Inc.'],
    ['MRNA', 'Moderna Inc.'],
    ['LLY', 'Eli Lilly and Co.'],
    ['XOM', 'ExxonMobil Corp.'],
    ['CVX', 'Chevron Corp.'],
    ['PG', 'Procter & Gamble Co.'],
    ['KO', 'Coca-Cola Co.'],
    ['PEP', 'PepsiCo Inc.'],
    ['MCD', "McDonald's Corp."],
    ['WMT', 'Walmart Inc.'],
    ['NKE', 'Nike Inc.'],
    ['DIS', 'The Walt Disney Co.']
  ];

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedStock) {
      fetchChartData(selectedStock);
    }
  }, [selectedStock]);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      const promises = topStocks.map(async ([symbol]) => {
        try {
          const data = await fetchStockData(symbol);
          return {
            symbol,
            price: data.c || 0,
            change: (data.c - data.pc) || 0,
            changePercent: ((data.c - data.pc) / data.pc * 100) || 0,
            volume: data.v || 0,
          };
        } catch (error) {
          console.error(`Error fetching ${symbol}:`, error);
          return {
            symbol,
            price: 0,
            change: 0,
            changePercent: 0,
            volume: 0,
          };
        }
      });

      const results = await Promise.all(promises);
      setMarketData(results);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async (symbol: string) => {
    try {
      // Generate mock intraday data for demonstration
      const data: ChartData[] = [];
      const basePrice = marketData.find(item => item.symbol === symbol)?.price || 150;
      
      for (let i = 0; i < 24; i++) {
        const variance = (Math.random() - 0.5) * 10;
        data.push({
          time: `${i.toString().padStart(2, '0')}:00`,
          price: basePrice + variance,
          volume: Math.floor(Math.random() * 1000000) + 500000,
        });
      }
      
      setChartData(data);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string;
    change?: string;
    icon: React.ReactNode;
    positive?: boolean;
  }> = ({ title, value, change, icon, positive }) => (
    <div className={`${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } border rounded-xl p-6 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {title}
          </p>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          {change && (
            <p className={`text-sm font-medium ${
              positive ? 'text-green-600' : 'text-red-600'
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className={`${
          positive === true ? 'text-green-500' :
          positive === false ? 'text-red-500' :
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const StockCard: React.FC<{ stock: MarketData; name: string }> = ({ stock, name }) => {
    const isPositive = stock.change >= 0;
    
    return (
      <div
        onClick={() => setSelectedStock(stock.symbol)}
        className={`${
          darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'
        } border rounded-lg p-4 cursor-pointer transition-all duration-200 transform hover:scale-105 ${
          selectedStock === stock.symbol ? 'ring-2 ring-blue-500' : ''
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {stock.symbol}
            </h3>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {name}
            </p>
          </div>
          {isPositive ? (
            <TrendingUp className="text-green-500" size={20} />
          ) : (
            <TrendingDown className="text-red-500" size={20} />
          )}
        </div>
        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          ${stock.price.toFixed(2)}
        </p>
        <div className="flex justify-between items-center mt-2">
          <span className={`text-sm font-medium ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
          </span>
          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Vol: {(stock.volume / 1000000).toFixed(1)}M
          </span>
        </div>
      </div>
    );
  };

  if (loading && marketData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={48} />
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading market data...
          </p>
        </div>
      </div>
    );
  }

  const totalMarketCap = marketData.reduce((sum, stock) => sum + (stock.price * stock.volume), 0);
  const avgChange = marketData.reduce((sum, stock) => sum + stock.changePercent, 0) / marketData.length;
  const gainers = marketData.filter(stock => stock.change > 0).length;
  const losers = marketData.filter(stock => stock.change < 0).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Market Overview
          </h1>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={fetchMarketData}
          disabled={loading}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
        >
          <RefreshCw className={`${loading ? 'animate-spin' : ''}`} size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Market Cap"
          value={`$${(totalMarketCap / 1e12).toFixed(2)}T`}
          icon={<DollarSign size={24} />}
        />
        <StatCard
          title="Average Change"
          value={`${avgChange.toFixed(2)}%`}
          change={avgChange >= 0 ? 'Bullish Market' : 'Bearish Market'}
          icon={avgChange >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
          positive={avgChange >= 0}
        />
        <StatCard
          title="Gainers"
          value={gainers.toString()}
          change={`${losers} Losers`}
          icon={<BarChart3 size={24} />}
          positive={gainers > losers}
        />
        <StatCard
          title="Active Stocks"
          value={marketData.length.toString()}
          icon={<Eye size={24} />}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stock Cards */}
        <div className="lg:col-span-1">
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Top Stocks
          </h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {marketData.map((stock) => {
              const stockInfo = topStocks.find(([symbol]) => symbol === stock.symbol);
              return (
                <StockCard 
                  key={stock.symbol} 
                  stock={stock} 
                  name={stockInfo ? stockInfo[1] : stock.symbol}
                />
              );
            })}
          </div>
        </div>

        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Price Chart */}
          <div className={`${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border rounded-xl p-6`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {selectedStock} - Intraday Price Movement
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                <XAxis 
                  dataKey="time" 
                  stroke={darkMode ? '#9ca3af' : '#6b7280'}
                  fontSize={12}
                />
                <YAxis 
                  stroke={darkMode ? '#9ca3af' : '#6b7280'}
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    color: darkMode ? '#ffffff' : '#000000'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Volume Chart */}
          <div className={`${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border rounded-xl p-6`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Volume Analysis
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                <XAxis 
                  dataKey="time" 
                  stroke={darkMode ? '#9ca3af' : '#6b7280'}
                  fontSize={12}
                />
                <YAxis 
                  stroke={darkMode ? '#9ca3af' : '#6b7280'}
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    color: darkMode ? '#ffffff' : '#000000'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Market Status */}
      <div className={`${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border rounded-xl p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Market Open
              </span>
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              NYSE: 9:30 AM - 4:00 PM EST
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Next Update: 30s
            </span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Live Data
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;