import React, { useState, useEffect } from 'react';
import { LineChart, TrendingUp, BarChart, Loader2, RefreshCw, PieChart } from 'lucide-react';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ETFDashboardProps {
  darkMode: boolean;
}

interface FundData {
  isin: string;
  ticker: string;
  name: string;
  sector: string;
  openPrice: string;
  closePrice: string;
  changePercent: string;
  volume: string;
  timeSeries?: {
    date: string;
    price: number;
  }[];
  historicalData?: any[];
  nav?: number;
  totalAssets?: string;
  expenseRatio?: string;
}

const fundList = [
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', isin: 'US78462F1030', sector: 'Broad Market' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', isin: 'US46090E1038', sector: 'Technology' },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', isin: 'US9229087690', sector: 'Broad Market' },
  { symbol: 'EEM', name: 'iShares MSCI Emerging Markets ETF', isin: 'US4642872349', sector: 'Emerging Markets' },
  { symbol: 'EFA', name: 'iShares MSCI EAFE ETF', isin: 'US4642874659', sector: 'International' },
  { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', isin: 'US9229083631', sector: 'Broad Market' },
  { symbol: 'IVV', name: 'iShares Core S&P 500 ETF', isin: 'US4642872000', sector: 'Broad Market' },
  { symbol: 'DIA', name: 'SPDR Dow Jones Industrial Average ETF Trust', isin: 'US78467X1090', sector: 'Blue Chip' },
  { symbol: 'VIG', name: 'Vanguard Dividend Appreciation ETF', isin: 'US9219088443', sector: 'Dividends' },
  { symbol: 'AGG', name: 'iShares Core U.S. Aggregate Bond ETF', isin: 'US4642872265', sector: 'Bonds' },
  { symbol: 'ARKK', name: 'ARK Innovation ETF', isin: 'US00214Q1040', sector: 'Innovation' },
  { symbol: 'IWM', name: 'iShares Russell 2000 ETF', isin: 'US4642876555', sector: 'Small Cap' },
  { symbol: 'VUG', name: 'Vanguard Growth ETF', isin: 'US9229087369', sector: 'Growth' },
  { symbol: 'VTV', name: 'Vanguard Value ETF', isin: 'US9229087443', sector: 'Value' },
  { symbol: 'GLD', name: 'SPDR Gold Shares', isin: 'US78463V1070', sector: 'Commodities' },
  { symbol: 'URTH', name: 'iShares MSCI World ETF', isin: 'US46432F8420', sector: 'Global' },
  { symbol: 'VEA', name: 'Vanguard FTSE Developed Markets ETF', isin: 'US9219438584', sector: 'International' },
  { symbol: 'VWO', name: 'Vanguard FTSE Emerging Markets ETF', isin: 'US9220428588', sector: 'Emerging Markets' },
  { symbol: 'IYR', name: 'iShares U.S. Real Estate ETF', isin: 'US4642877397', sector: 'Real Estate' },
  { symbol: 'SCHX', name: 'Schwab U.S. Large-Cap ETF', isin: 'US8085242013', sector: 'Large Cap' },
  { symbol: 'VO', name: 'Vanguard Mid-Cap ETF', isin: 'US9229086296', sector: 'Mid Cap' },
  { symbol: 'SPYG', name: 'SPDR Portfolio S&P 500 Growth ETF', isin: 'US78464A4097', sector: 'Growth' },
  { symbol: 'VB', name: 'Vanguard Small-Cap ETF', isin: 'US9229087518', sector: 'Small Cap' },
];

const ALPHA_VANTAGE_KEY = 'JSFJNQ1UHFJSUWZC';

const ETFDashboard: React.FC<ETFDashboardProps> = ({ darkMode }) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('SPY');
  const [fundData, setFundData] = useState<FundData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sectorAllocation, setSectorAllocation] = useState<any[]>([]);

  const getMockData = (symbol: string): FundData => {
    const selectedFund = fundList.find(fund => fund.symbol === symbol) || fundList[0];
    const basePrice = 100 + Math.random() * 200;
    const changePercent = (Math.random() * 5 - 2.5).toFixed(2);
    
    return {
      isin: selectedFund.isin,
      ticker: symbol,
      name: selectedFund.name,
      sector: selectedFund.sector,
      openPrice: `$${basePrice.toFixed(2)}`,
      closePrice: `$${(basePrice * (1 + parseFloat(changePercent)/100)).toFixed(2)}`,
      changePercent: `${changePercent}%`,
      volume: Math.floor(Math.random() * 10000000).toLocaleString(),
      nav: basePrice * (1 + parseFloat(changePercent)/100),
      totalAssets: `$${(Math.random() * 500 + 50).toFixed(1)}B`,
      expenseRatio: `${(Math.random() * 0.5 + 0.03).toFixed(2)}%`,
      timeSeries: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        price: basePrice * (1 + (Math.random() * 0.1 - 0.05))
      })),
      historicalData: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        open: basePrice * (1 + (Math.random() * 0.1 - 0.05)),
        close: basePrice * (1 + (Math.random() * 0.1 - 0.05)),
        percentChange: parseFloat((Math.random() * 5 - 2.5).toFixed(2)),
        volume: Math.floor(Math.random() * 10000000)
      }))
    };
  };

  const generateSectorAllocation = (symbol: string) => {
    const sectors = [
      'Technology', 'Healthcare', 'Financial Services', 'Consumer Cyclical',
      'Communication Services', 'Industrials', 'Consumer Defensive', 'Energy',
      'Utilities', 'Real Estate', 'Basic Materials'
    ];

    return sectors.map(sector => ({
      sector,
      percentage: Math.random() * 25 + 2,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    })).sort((a, b) => b.percentage - a.percentage).slice(0, 8);
  };

  const fetchData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      setFundData(null);

      // For demo purposes, using mock data
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockData = getMockData(selectedSymbol);
      setFundData(mockData);
      setSectorAllocation(generateSectorAllocation(selectedSymbol));

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      const mockData = getMockData(selectedSymbol);
      setFundData(mockData);
      setSectorAllocation(generateSectorAllocation(selectedSymbol));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSymbol]);

  const FundCard: React.FC<{ data: FundData }> = ({ data }) => {
    const openPrice = parseFloat(data.openPrice.replace(/[^0-9.-]/g, ''));
    const closePrice = parseFloat(data.closePrice.replace(/[^0-9.-]/g, ''));
    const changePercent = parseFloat(data.changePercent.replace('%', ''));
    const isPositive = changePercent >= 0;

    return (
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 mb-6`}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{data.name}</h2>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{data.ticker} | {data.isin}</p>
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>Sector: {data.sector}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`${darkMode ? 'bg-blue-900' : 'bg-blue-50'} p-4 rounded-lg`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`${darkMode ? 'text-blue-300' : 'text-blue-600'} font-semibold`}>NAV</span>
            </div>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              ${data.nav?.toFixed(2)}
            </p>
          </div>

          <div className={`${isPositive ? (darkMode ? 'bg-green-900' : 'bg-green-50') : (darkMode ? 'bg-red-900' : 'bg-red-50')} p-4 rounded-lg`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`${isPositive ? (darkMode ? 'text-green-300' : 'text-green-600') : (darkMode ? 'text-red-300' : 'text-red-600')} font-semibold`}>
                Change
              </span>
            </div>
            <p className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {data.changePercent}
            </p>
          </div>

          <div className={`${darkMode ? 'bg-purple-900' : 'bg-purple-50'} p-4 rounded-lg`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`${darkMode ? 'text-purple-300' : 'text-purple-600'} font-semibold`}>Assets</span>
            </div>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{data.totalAssets}</p>
          </div>

          <div className={`${darkMode ? 'bg-orange-900' : 'bg-orange-50'} p-4 rounded-lg`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`${darkMode ? 'text-orange-300' : 'text-orange-600'} font-semibold`}>Expense Ratio</span>
            </div>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{data.expenseRatio}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            ETF & Mutual Fund Dashboard
          </h1>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Comprehensive analysis of exchange-traded funds and mutual funds
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

      {/* Fund Selection */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
          Select ETF/Fund:
        </label>
        <select
          value={selectedSymbol}
          onChange={(e) => setSelectedSymbol(e.target.value)}
          className={`w-full p-3 border rounded-lg ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          disabled={loading}
        >
          {fundList.map((fund) => (
            <option key={fund.symbol} value={fund.symbol}>
              {fund.symbol} - {fund.name}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="animate-spin mx-auto mb-4" size={48} />
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Loading fund data...
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className={`${darkMode ? 'bg-red-900 border-red-700' : 'bg-red-50 border-red-200'} border rounded-lg p-6`}>
          <div className="flex items-center">
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${darkMode ? 'text-red-300' : 'text-red-800'}`}>Error fetching data</h3>
              <div className={`mt-2 text-sm ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {fundData && (
        <>
          <FundCard data={fundData} />

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Price Chart */}
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Price History (30 Days)
              </h3>
              <div className="h-80">
                <Line
                  data={{
                    labels: fundData.timeSeries?.map(item => item.date) || [],
                    datasets: [{
                      label: 'NAV',
                      data: fundData.timeSeries?.map(item => item.price) || [],
                      borderColor: '#3b82f6',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      tension: 0.3,
                      fill: true
                    }]
                  }}
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        labels: {
                          color: darkMode ? '#ffffff' : '#000000'
                        }
                      }
                    },
                    scales: {
                      x: {
                        ticks: {
                          color: darkMode ? '#9ca3af' : '#6b7280'
                        },
                        grid: {
                          color: darkMode ? '#374151' : '#e5e7eb'
                        }
                      },
                      y: {
                        ticks: {
                          color: darkMode ? '#9ca3af' : '#6b7280'
                        },
                        grid: {
                          color: darkMode ? '#374151' : '#e5e7eb'
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Sector Allocation */}
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Sector Allocation
              </h3>
              <div className="h-80">
                <Pie
                  data={{
                    labels: sectorAllocation.map(item => item.sector),
                    datasets: [{
                      data: sectorAllocation.map(item => item.percentage),
                      backgroundColor: sectorAllocation.map(item => item.color),
                      borderWidth: 2,
                      borderColor: darkMode ? '#1f2937' : '#ffffff'
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: {
                          color: darkMode ? '#ffffff' : '#000000',
                          usePointStyle: true,
                          padding: 15
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            return `${context.label}: ${context.parsed.toFixed(1)}%`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Historical Data Table */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Historical Performance
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className={`text-left py-3 px-2 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Date</th>
                    <th className={`text-right py-3 px-2 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Open</th>
                    <th className={`text-right py-3 px-2 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Close</th>
                    <th className={`text-right py-3 px-2 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Change %</th>
                    <th className={`text-right py-3 px-2 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {fundData.historicalData?.slice(0, 10).map((item, index) => (
                    <tr key={index} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} hover:${darkMode ? 'bg-gray-750' : 'bg-gray-50'}`}>
                      <td className={`py-3 px-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.date}
                      </td>
                      <td className={`py-3 px-2 text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        ${item.open.toFixed(2)}
                      </td>
                      <td className={`py-3 px-2 text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        ${item.close.toFixed(2)}
                      </td>
                      <td className={`py-3 px-2 text-right font-semibold ${
                        item.percentChange >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.percentChange >= 0 ? '+' : ''}{item.percentChange.toFixed(2)}%
                      </td>
                      <td className={`py-3 px-2 text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {item.volume.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fund Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Performance Metrics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>YTD Return:</span>
                  <span className={`font-semibold text-green-600`}>+12.4%</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>1Y Return:</span>
                  <span className={`font-semibold text-green-600`}>+18.7%</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>3Y Return:</span>
                  <span className={`font-semibold text-green-600`}>+9.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Volatility:</span>
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>14.2%</span>
                </div>
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Fund Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Inception Date:</span>
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Jan 22, 1993</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Holdings:</span>
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>503</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Dividend Yield:</span>
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>1.32%</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>P/E Ratio:</span>
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>24.1</span>
                </div>
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Risk Metrics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Beta:</span>
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>1.00</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sharpe Ratio:</span>
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>0.89</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Max Drawdown:</span>
                  <span className={`font-semibold text-red-600`}>-19.6%</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Alpha:</span>
                  <span className={`font-semibold text-green-600`}>+0.12</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <footer className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'} py-4 text-sm`}>
        Financial Data Powered by Alpha Vantage API
      </footer>
    </div>
  );
};

export default ETFDashboard;