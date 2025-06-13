import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  BarChart3, TrendingUp, Brain, PieChart, Calendar,
  MessageSquare, Bell, Settings, Moon, Sun, LogOut,
  DollarSign, Menu, X, User
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Portfolio from './components/Portfolio';
import TechnicalAnalysis from './components/TechnicalAnalysis';
import SentimentAnalysis from './components/SentimentAnalysis';
import Predictions from './components/Predictions';
import EconomicCalendar from './components/EconomicCalendar';
import ETFDashboard from './components/ETFDashboard';
import AIChat from './components/AIChat';
import AlertSystem from './components/AlertSystem';
import { useAuth } from './components/AuthContext';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3 },
    { name: 'Portfolio', href: '/portfolio', icon: PieChart },
    { name: 'Technical Analysis', href: '/technical', icon: TrendingUp },
    { name: 'AI Sentiment', href: '/sentiment', icon: Brain },
    { name: 'Price Predictions', href: '/predictions', icon: Brain },
    { name: 'Economic Calendar', href: '/calendar', icon: Calendar },
    { name: 'ETF Dashboard', href: '/etf', icon: BarChart3 },
    { name: 'AI Chat', href: '/chat', icon: MessageSquare },
  ];

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-8 w-8 text-blue-600" />
            <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              StockVerse
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    window.location.pathname === item.href
                      ? darkMode
                        ? 'bg-blue-900 text-blue-200'
                        : 'bg-blue-50 text-blue-700'
                      : darkMode
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    window.history.pushState({}, '', item.href);
                    window.dispatchEvent(new PopStateEvent('popstate'));
                    setSidebarOpen(false);
                  }}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </a>
              );
            })}
          </div>
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {user?.name}
              </p>
              <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
              darkMode
                ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className={`sticky top-0 z-30 flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border-b`}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                darkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Dashboard darkMode={darkMode} />} />
            <Route path="/portfolio" element={<Portfolio darkMode={darkMode} />} />
            <Route path="/technical" element={<TechnicalAnalysis darkMode={darkMode} />} />
            <Route path="/sentiment" element={<SentimentAnalysis darkMode={darkMode} />} />
            <Route path="/predictions" element={<Predictions darkMode={darkMode} />} />
            <Route path="/calendar" element={<EconomicCalendar darkMode={darkMode} />} />
            <Route path="/etf" element={<ETFDashboard darkMode={darkMode} />} />
            <Route path="/chat" element={<AIChat darkMode={darkMode} />} />
          </Routes>
        </main>
      </div>

      {/* Alert System */}
      <AlertSystem darkMode={darkMode} />
    </div>
  );
};

export default App;