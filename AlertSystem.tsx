import React, { useState, useEffect } from 'react';
import { Bell, X, Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

interface AlertSystemProps {
  darkMode: boolean;
}

interface Alert {
  id: string;
  symbol: string;
  type: 'price_above' | 'price_below' | 'percent_change';
  value: number;
  currentPrice?: number;
  isActive: boolean;
  createdAt: Date;
}

const AlertSystem: React.FC<AlertSystemProps> = ({ darkMode }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    type: 'price_above' as Alert['type'],
    value: ''
  });
  const [triggeredAlerts, setTriggeredAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(checkAlerts, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = () => {
    const saved = localStorage.getItem('stockverse-alerts');
    if (saved) {
      const alertsData = JSON.parse(saved).map((alert: any) => ({
        ...alert,
        createdAt: new Date(alert.createdAt)
      }));
      setAlerts(alertsData);
    }
  };

  const saveAlerts = (alertsData: Alert[]) => {
    localStorage.setItem('stockverse-alerts', JSON.stringify(alertsData));
    setAlerts(alertsData);
  };

  const checkAlerts = async () => {
    // Mock price checking - in real app, this would fetch actual prices
    const updatedAlerts = alerts.map(alert => {
      const mockPrice = 100 + Math.random() * 400; // Mock current price
      let triggered = false;

      switch (alert.type) {
        case 'price_above':
          triggered = mockPrice > alert.value;
          break;
        case 'price_below':
          triggered = mockPrice < alert.value;
          break;
        case 'percent_change':
          // Mock percent change calculation
          const mockChange = (Math.random() - 0.5) * 20;
          triggered = Math.abs(mockChange) > alert.value;
          break;
      }

      if (triggered && alert.isActive) {
        setTriggeredAlerts(prev => [...prev, { ...alert, currentPrice: mockPrice }]);
        return { ...alert, isActive: false };
      }

      return { ...alert, currentPrice: mockPrice };
    });

    if (JSON.stringify(updatedAlerts) !== JSON.stringify(alerts)) {
      saveAlerts(updatedAlerts);
    }
  };

  const addAlert = () => {
    if (!newAlert.symbol || !newAlert.value) {
      alert('Please fill in all fields');
      return;
    }

    const alertData: Alert = {
      id: Date.now().toString(),
      symbol: newAlert.symbol.toUpperCase(),
      type: newAlert.type,
      value: parseFloat(newAlert.value),
      isActive: true,
      createdAt: new Date()
    };

    const updatedAlerts = [...alerts, alertData];
    saveAlerts(updatedAlerts);

    setNewAlert({ symbol: '', type: 'price_above', value: '' });
    setShowAddForm(false);
  };

  const removeAlert = (id: string) => {
    const updatedAlerts = alerts.filter(alert => alert.id !== id);
    saveAlerts(updatedAlerts);
  };

  const dismissTriggeredAlert = (id: string) => {
    setTriggeredAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'price_above':
        return <TrendingUp size={16} className="text-green-500" />;
      case 'price_below':
        return <TrendingDown size={16} className="text-red-500" />;
      case 'percent_change':
        return <Bell size={16} className="text-blue-500" />;
      default:
        return <Bell size={16} />;
    }
  };

  const getAlertDescription = (alert: Alert) => {
    switch (alert.type) {
      case 'price_above':
        return `${alert.symbol} above $${alert.value}`;
      case 'price_below':
        return `${alert.symbol} below $${alert.value}`;
      case 'percent_change':
        return `${alert.symbol} changes by ${alert.value}%`;
      default:
        return '';
    }
  };

  return (
    <>
      {/* Floating Alert Button */}
      <button
        onClick={() => setShowAlerts(true)}
        className="fixed bottom-6 left-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white p-4 rounded-full shadow-lg transform hover:scale-110 transition-all duration-300 z-40"
      >
        <div className="relative">
          <Bell size={24} />
          {(alerts.filter(a => a.isActive).length > 0 || triggeredAlerts.length > 0) && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {alerts.filter(a => a.isActive).length + triggeredAlerts.length}
            </div>
          )}
        </div>
      </button>

      {/* Triggered Alerts Notifications */}
      {triggeredAlerts.map((alert, index) => (
        <div
          key={alert.id}
          className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 animate-bounce"
          style={{ top: `${1 + index * 5}rem` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell size={20} />
              <div>
                <p className="font-semibold">Alert Triggered!</p>
                <p className="text-sm">{getAlertDescription(alert)}</p>
                {alert.currentPrice && (
                  <p className="text-xs">Current: ${alert.currentPrice.toFixed(2)}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => dismissTriggeredAlert(alert.id)}
              className="ml-4 hover:bg-red-600 p-1 rounded"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}

      {/* Alerts Panel */}
      {showAlerts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col`}>
            {/* Header */}
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Price Alerts
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    <Plus size={16} />
                    <span>Add Alert</span>
                  </button>
                  <button
                    onClick={() => setShowAlerts(false)}
                    className={`p-2 rounded-lg ${
                      darkMode 
                        ? 'hover:bg-gray-700 text-gray-400' 
                        : 'hover:bg-gray-100 text-gray-600'
                    } transition-colors duration-200`}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Alerts List */}
            <div className="flex-1 overflow-y-auto p-6">
              {alerts.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} size={48} />
                  <p className={`text-lg font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No alerts set
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-4`}>
                    Create your first alert to get notified of price changes
                  </p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    <Plus size={16} />
                    <span>Create Alert</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getAlertIcon(alert.type)}
                          <div>
                            <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {getAlertDescription(alert)}
                            </p>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Created: {alert.createdAt.toLocaleDateString()}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className={`w-2 h-2 rounded-full ${
                                alert.isActive ? 'bg-green-500' : 'bg-gray-400'
                              }`}></div>
                              <span className={`text-xs ${
                                alert.isActive 
                                  ? 'text-green-600' 
                                  : darkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                {alert.isActive ? 'Active' : 'Triggered'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeAlert(alert.id)}
                          className="text-red-500 hover:text-red-700 transition-colors duration-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Alert Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl max-w-md w-full mx-4`}>
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Create Price Alert
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Stock Symbol
                </label>
                <input
                  type="text"
                  value={newAlert.symbol}
                  onChange={(e) => setNewAlert({ ...newAlert, symbol: e.target.value.toUpperCase() })}
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
                  Alert Type
                </label>
                <select
                  value={newAlert.type}
                  onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value as Alert['type'] })}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  <option value="price_above">Price Above</option>
                  <option value="price_below">Price Below</option>
                  <option value="percent_change">Percent Change</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  {newAlert.type === 'percent_change' ? 'Percentage (%)' : 'Price ($)'}
                </label>
                <input
                  type="number"
                  step={newAlert.type === 'percent_change' ? '0.1' : '0.01'}
                  value={newAlert.value}
                  onChange={(e) => setNewAlert({ ...newAlert, value: e.target.value })}
                  placeholder={newAlert.type === 'percent_change' ? '5.0' : '150.00'}
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
                onClick={addAlert}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Create Alert
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewAlert({ symbol: '', type: 'price_above', value: '' });
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
    </>
  );
};

export default AlertSystem;