import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Activity, Target, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine } from 'recharts';
import { fetchStockData, fetchTimeSeriesData } from '../services/api';

interface TechnicalAnalysisProps {
  darkMode: boolean;
}

interface TechnicalIndicators {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
  sma: {
    sma20: number;
    sma50: number;
  };
}

interface ChartData {
  date: string;
  price: number;
  volume: number;
  rsi?: number;
  macd?: number;
  signal?: number;
  bb_upper?: number;
  bb_middle?: number;
  bb_lower?: number;
  sma20?: number;
  sma50?: number;
}

const TechnicalAnalysis: React.FC<TechnicalAnalysisProps> = ({ darkMode }) => {
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState('price');

  const stockSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX'];
  const indicatorOptions = [
    { value: 'price', label: 'Price & Moving Averages' },
    { value: 'bollinger', label: 'Bollinger Bands' },
    { value: 'rsi', label: 'RSI' },
    { value: 'macd', label: 'MACD' },
    { value: 'volume', label: 'Volume' }
  ];

  useEffect(() => {
    fetchData();
  }, [selectedStock]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Generate mock technical analysis data
      const data: ChartData[] = [];
      const basePrice = 100 + Math.random() * 400;
      
      for (let i = 30; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const price = basePrice + (Math.random() - 0.5) * 20;
        const volume = Math.floor(Math.random() * 10000000) + 1000000;
        
        // Calculate mock indicators
        const rsi = 30 + Math.random() * 40;
        const macd = (Math.random() - 0.5) * 4;
        const signal = (Math.random() - 0.5) * 3;
        const bb_upper = price + 5 + Math.random() * 10;
        const bb_middle = price;
        const bb_lower = price - 5 - Math.random() * 10;
        const sma20 = price + (Math.random() - 0.5) * 5;
        const sma50 = price + (Math.random() - 0.5) * 10;

        data.push({
          date: date.toISOString().split('T')[0],
          price: parseFloat(price.toFixed(2)),
          volume,
          rsi: parseFloat(rsi.toFixed(2)),
          macd: parseFloat(macd.toFixed(2)),
          signal: parseFloat(signal.toFixed(2)),
          bb_upper: parseFloat(bb_upper.toFixed(2)),
          bb_middle: parseFloat(bb_middle.toFixed(2)),
          bb_lower: parseFloat(bb_lower.toFixed(2)),
          sma20: parseFloat(sma20.toFixed(2)),
          sma50: parseFloat(sma50.toFixed(2))
        });
      }

      setChartData(data);

      // Set current indicators from latest data
      const latest = data[data.length - 1];
      setIndicators({
        rsi: latest.rsi || 0,
        macd: {
          macd: latest.macd || 0,
          signal: latest.signal || 0,
          histogram: (latest.macd || 0) - (latest.signal || 0)
        },
        bollinger: {
          upper: latest.bb_upper || 0,
          middle: latest.bb_middle || 0,
          lower: latest.bb_lower || 0
        },
        sma: {
          sma20: latest.sma20 || 0,
          sma50: latest.sma50 || 0
        }
      });

    } catch (error) {
      console.error('Error fetching technical data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderChart = () => {
    switch (selectedIndicator) {
      case 'price':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis 
                dataKey="date" 
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
              <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} name="Price" />
              <Line type="monotone" dataKey="sma20" stroke="#10b981" strokeWidth={1} dot={false} name="SMA 20" />
              <Line type="monotone" dataKey="sma50" stroke="#f59e0b" strokeWidth={1} dot={false} name="SMA 50" />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bollinger':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis 
                dataKey="date" 
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
              <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} name="Price" />
              <Line type="monotone" dataKey="bb_upper" stroke="#ef4444" strokeWidth={1} dot={false} name="Upper Band" />
              <Line type="monotone" dataKey="bb_middle" stroke="#6b7280" strokeWidth={1} dot={false} name="Middle Band" />
              <Line type="monotone" dataKey="bb_lower" stroke="#ef4444" strokeWidth={1} dot={false} name="Lower Band" />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'rsi':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis 
                dataKey="date" 
                stroke={darkMode ? '#9ca3af' : '#6b7280'}
                fontSize={12}
              />
              <YAxis 
                domain={[0, 100]}
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
              <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="5 5" />
              <ReferenceLine y={30} stroke="#10b981" strokeDasharray="5 5" />
              <Line type="monotone" dataKey="rsi" stroke="#8b5cf6" strokeWidth={2} dot={false} name="RSI" />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'macd':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis 
                dataKey="date" 
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
              <ReferenceLine y={0} stroke={darkMode ? '#6b7280' : '#9ca3af'} />
              <Line type="monotone" dataKey="macd" stroke="#3b82f6" strokeWidth={2} dot={false} name="MACD" />
              <Line type="monotone" dataKey="signal" stroke="#ef4444" strokeWidth={2} dot={false} name="Signal" />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'volume':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis 
                dataKey="date" 
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
              <Bar dataKey="volume" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const getSignalColor = (value: number, type: 'rsi' | 'macd') => {
    if (type === 'rsi') {
      if (value > 70) return 'text-red-600';
      if (value < 30) return 'text-green-600';
      return darkMode ? 'text-gray-300' : 'text-gray-700';
    } else {
      return value > 0 ? 'text-green-600' : 'text-red-600';
    }
  };

  const getSignalText = (value: number, type: 'rsi' | 'macd') => {
    if (type === 'rsi') {
      if (value > 70) return 'Overbought';
      if (value < 30) return 'Oversold';
      return 'Neutral';
    } else {
      return value > 0 ? 'Bullish' : 'Bearish';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Technical Analysis
          </h1>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Advanced charting and technical indicators
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
        >
          <RefreshCw className={`${loading ? 'animate-spin' : ''}`} size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Controls */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Stock Symbol
            </label>
            <select
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              {stockSymbols.map(symbol => (
                <option key={symbol} value={symbol}>{symbol}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Technical Indicator
            </label>
            <select
              value={selectedIndicator}
              onChange={(e) => setSelectedIndicator(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              {indicatorOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Technical Indicators Summary */}
      {indicators && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>RSI (14)</h3>
              <Activity size={20} className={getSignalColor(indicators.rsi, 'rsi')} />
            </div>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {indicators.rsi.toFixed(2)}
            </p>
            <p className={`text-sm font-medium ${getSignalColor(indicators.rsi, 'rsi')}`}>
              {getSignalText(indicators.rsi, 'rsi')}
            </p>
          </div>

          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>MACD</h3>
              <TrendingUp size={20} className={getSignalColor(indicators.macd.histogram, 'macd')} />
            </div>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {indicators.macd.macd.toFixed(3)}
            </p>
            <p className={`text-sm font-medium ${getSignalColor(indicators.macd.histogram, 'macd')}`}>
              {getSignalText(indicators.macd.histogram, 'macd')}
            </p>
          </div>

          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>BB Position</h3>
              <Target size={20} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
            </div>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {((indicators.bollinger.middle - indicators.bollinger.lower) / (indicators.bollinger.upper - indicators.bollinger.lower) * 100).toFixed(1)}%
            </p>
            <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Band Position
            </p>
          </div>

          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>MA Trend</h3>
              <BarChart3 size={20} className={
                indicators.sma.sma20 > indicators.sma.sma50 ? 'text-green-500' : 'text-red-500'
              } />
            </div>
            <p className={`text-2xl font-bold ${
              indicators.sma.sma20 > indicators.sma.sma50 ? 'text-green-600' : 'text-red-600'
            }`}>
              {indicators.sma.sma20 > indicators.sma.sma50 ? 'Bullish' : 'Bearish'}
            </p>
            <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              SMA 20 vs 50
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {selectedStock} - {indicatorOptions.find(opt => opt.value === selectedIndicator)?.label}
        </h3>
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <BarChart3 className="animate-pulse mx-auto mb-4" size={48} />
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Loading chart data...
              </p>
            </div>
          </div>
        ) : (
          renderChart()
        )}
      </div>

      {/* Technical Analysis Explanation */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Technical Indicators Guide
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>RSI (Relative Strength Index)</h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Measures momentum. Values above 70 suggest overbought conditions, below 30 suggest oversold.
            </p>
          </div>
          <div>
            <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>MACD</h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Shows relationship between two moving averages. Crossovers can signal trend changes.
            </p>
          </div>
          <div>
            <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Bollinger Bands</h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Price channels based on standard deviation. Prices touching bands may indicate reversal points.
            </p>
          </div>
          <div>
            <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Moving Averages</h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Smooth price data to identify trends. When short MA {'>'} long MA, it suggests an uptrend.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalAnalysis;