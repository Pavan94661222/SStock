import React, { useState, useEffect } from 'react';
import {
  Plus, Trash2, TrendingUp, TrendingDown, DollarSign,
  PieChart, BarChart3, Download, RefreshCw
} from 'lucide-react';
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { fetchStockData } from '../services/api';

interface PortfolioProps {
  darkMode: boolean;
}

interface PortfolioItem {
  id: string;
  symbol: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  totalValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

interface PortfolioSummary {
  totalValue: number;
  totalInvestment: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
}

const Portfolio: React.FC<PortfolioProps> = ({ darkMode }) => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary>({
    totalValue: 0,
    totalInvestment: 0,
    totalProfitLoss: 0,
    totalProfitLossPercent: 0
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStock, setNewStock] = useState({
    symbol: '',
    quantity: '',
    buyPrice: ''
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPortfolio();
  }, []);

  useEffect(() => {
    calculateSummary();
  }, [portfolio]);

  const loadPortfolio = () => {
    const saved = localStorage.getItem('stockverse-portfolio');
    if (saved) {
      const portfolioData = JSON.parse(saved);
      setPortfolio(portfolioData);
      refreshPrices(portfolioData);
    }
  };

  const savePortfolio = (portfolioData: PortfolioItem[]) => {
    localStorage.setItem('stockverse-portfolio', JSON.stringify(portfolioData));
    setPortfolio(portfolioData);
  };

  const refreshPrices = async (portfolioData?: PortfolioItem[]) => {
    const currentPortfolio = portfolioData || portfolio;
    if (currentPortfolio.length === 0) return;

    setRefreshing(true);
    try {
      const updatedPortfolio = await Promise.all(
        currentPortfolio.map(async (item) => {
          try {
            const stockData = await fetchStockData(item.symbol);
            const currentPrice = stockData.c || item.currentPrice;
            const totalValue = item.quantity * currentPrice;
            const totalInvestment = item.quantity * item.buyPrice;
            const profitLoss = totalValue - totalInvestment;
            const profitLossPercent = (profitLoss / totalInvestment) * 100;

            return {
              ...item,
              currentPrice,
              totalValue,
              profitLoss,
              profitLossPercent
            };
          } catch (error) {
            console.error(`Error updating price for ${item.symbol}:`, error);
            return item;
          }
        })
      );

      savePortfolio(updatedPortfolio);
    } catch (error) {
      console.error('Error refreshing prices:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const calculateSummary = () => {
    const totalValue = portfolio.reduce((sum, item) => sum + item.totalValue, 0);
    const totalInvestment = portfolio.reduce((sum, item) => sum + (item.quantity * item.buyPrice), 0);
    const totalProfitLoss = totalValue - totalInvestment;
    const totalProfitLossPercent = totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0;

    setSummary({
      totalValue,
      totalInvestment,
      totalProfitLoss,
      totalProfitLossPercent
    });
  };

  const addStock = async () => {
    if (!newStock.symbol || !newStock.quantity || !newStock.buyPrice) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const stockData = await fetchStockData(newStock.symbol.toUpperCase());
      const currentPrice = stockData.c || parseFloat(newStock.buyPrice);
      const quantity = parseFloat(newStock.quantity);
      const buyPrice = parseFloat(newStock.buyPrice);
      const totalValue = quantity * currentPrice;
      const totalInvestment = quantity * buyPrice;
      const profitLoss = totalValue - totalInvestment;
      const profitLossPercent = (profitLoss / totalInvestment) * 100;

      const newItem: PortfolioItem = {
        id: Date.now().toString(),
        symbol: newStock.symbol.toUpperCase(),
        quantity,
        buyPrice,
        currentPrice,
        totalValue,
        profitLoss,
        profitLossPercent
      };

      const updatedPortfolio = [...portfolio, newItem];
      savePortfolio(updatedPortfolio);

      setNewStock({ symbol: '', quantity: '', buyPrice: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding stock:', error);
      alert('Error adding stock. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeStock = (id: string) => {
    const updatedPortfolio = portfolio.filter(item => item.id !== id);
    savePortfolio(updatedPortfolio);
  };

  const exportPortfolio = () => {
    const csvContent = [
      ['Symbol', 'Quantity', 'Buy Price', 'Current Price', 'Total Value', 'P/L', 'P/L %'],
      ...portfolio.map(item => [
        item.symbol,
        item.quantity.toString(),
        item.buyPrice.toFixed(2),
        item.currentPrice.toFixed(2),
        item.totalValue.toFixed(2),
        item.profitLoss.toFixed(2),
        item.profitLossPercent.toFixed(2) + '%'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'portfolio.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const pieChartData = portfolio.map(item => ({
    name: item.symbol,
    value: item.totalValue,
    percentage: summary.totalValue > 0 ? (item.totalValue / summary.totalValue * 100).toFixed(1) : '0'
  }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Portfolio Tracker
          </h1>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Track your investments and monitor performance
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => refreshPrices()}
            disabled={refreshing}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`${refreshing ? 'animate-spin' : ''}`} size={16} />
            <span>Refresh</span>
          </button>
          <button
            onClick={exportPortfolio}
            disabled={portfolio.length === 0}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            <Download size={16} />
            <span>Export</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <Plus size={16} />
            <span>Add Stock</span>
          </button>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Value
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                ${summary.totalValue.toFixed(2)}
              </p>
            </div>
            <DollarSign className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`} size={24} />
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Investment
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                ${summary.totalInvestment.toFixed(2)}
              </p>
            </div>
            <BarChart3 className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`} size={24} />
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total P/L
              </p>
              <p className={`text-2xl font-bold ${
                summary.totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ${summary.totalProfitLoss >= 0 ? '+' : ''}${summary.totalProfitLoss.toFixed(2)}
              </p>
            </div>
            {summary.totalProfitLoss >= 0 ? 
              <TrendingUp className="text-green-500" size={24} /> :
              <TrendingDown className="text-red-500" size={24} />
            }
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total P/L %
              </p>
              <p className={`text-2xl font-bold ${
                summary.totalProfitLossPercent >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {summary.totalProfitLossPercent >= 0 ? '+' : ''}{summary.totalProfitLossPercent.toFixed(2)}%
              </p>
            </div>
            <PieChart className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`} size={24} />
          </div>
        </div>
      </div>

      {/* Charts and Holdings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Allocation Chart */}
        {portfolio.length > 0 && (
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Portfolio Allocation
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <RechartsPieChart
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </RechartsPieChart>
                <Tooltip
                  formatter={(value: any) => [`$${value.toFixed(2)}`, 'Value']}
                  contentStyle={{
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    color: darkMode ? '#ffffff' : '#000000'
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {pieChartData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {item.name}
                    </span>
                  </div>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Holdings Table */}
        <div className={`${portfolio.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'} ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Your Holdings
          </h3>
          
          {portfolio.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} size={48} />
              <p className={`text-lg font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No stocks in your portfolio yet
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-4`}>
                Add your first stock to start tracking your investments
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <Plus size={16} />
                <span>Add Your First Stock</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className={`text-left py-3 px-2 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Symbol</th>
                    <th className={`text-right py-3 px-2 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Qty</th>
                    <th className={`text-right py-3 px-2 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Buy Price</th>
                    <th className={`text-right py-3 px-2 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Current</th>
                    <th className={`text-right py-3 px-2 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Value</th>
                    <th className={`text-right py-3 px-2 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>P/L</th>
                    <th className={`text-center py-3 px-2 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.map((item) => (
                    <tr key={item.id} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} hover:${darkMode ? 'bg-gray-750' : 'bg-gray-50'}`}>
                      <td className={`py-3 px-2 font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.symbol}
                      </td>
                      <td className={`py-3 px-2 text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {item.quantity}
                      </td>
                      <td className={`py-3 px-2 text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        ${item.buyPrice.toFixed(2)}
                      </td>
                      <td className={`py-3 px-2 text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        ${item.currentPrice.toFixed(2)}
                      </td>
                      <td className={`py-3 px-2 text-right font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        ${item.totalValue.toFixed(2)}
                      </td>
                      <td className={`py-3 px-2 text-right font-semibold ${
                        item.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${item.profitLoss >= 0 ? '+' : ''}{item.profitLoss.toFixed(2)}
                        <br />
                        <span className="text-xs">
                          ({item.profitLoss >= 0 ? '+' : ''}{item.profitLossPercent.toFixed(2)}%)
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <button
                          onClick={() => removeStock(item.id)}
                          className="text-red-500 hover:text-red-700 transition-colors duration-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Stock Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl max-w-md w-full mx-4`}>
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Add Stock to Portfolio
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Stock Symbol
                </label>
                <input
                  type="text"
                  value={newStock.symbol}
                  onChange={(e) => setNewStock({ ...newStock, symbol: e.target.value.toUpperCase() })}
                  placeholder="e.g., AAPL"
                  className={`w-full px-3 py-2 border rounded-lg ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Quantity
                </label>
                <input
                  type="number"
                  value={newStock.quantity}
                  onChange={(e) => setNewStock({ ...newStock, quantity: e.target.value })}
                  placeholder="Number of shares"
                  className={`w-full px-3 py-2 border rounded-lg ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Buy Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newStock.buyPrice}
                  onChange={(e) => setNewStock({ ...newStock, buyPrice: e.target.value })}
                  placeholder="Purchase price per share"
                  className={`w-full px-3 py-2 border rounded-lg ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={addStock}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Stock'}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewStock({ symbol: '', quantity: '', buyPrice: '' });
                }}
                className={`flex-1 ${
                  darkMode 
                    ? 'bg-gray-600 hover:bg-gray-700 text-gray-200' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                } py-2 px-4 rounded-lg transition-colors duration-200`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;