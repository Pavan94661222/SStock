import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, AlertCircle, Clock, Globe } from 'lucide-react';
import { fetchEconomicCalendar } from '../services/api';

interface EconomicCalendarProps {
  darkMode: boolean;
}

interface EconomicEvent {
  actual: number;
  country: string;
  estimate: number;
  event: string;
  impact: string;
  prev: number;
  time: string;
  unit: string;
}

const EconomicCalendar: React.FC<EconomicCalendarProps> = ({ darkMode }) => {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedImpact, setSelectedImpact] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await fetchEconomicCalendar();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching economic calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high':
        return <AlertCircle size={16} />;
      case 'medium':
        return <TrendingUp size={16} />;
      case 'low':
        return <Clock size={16} />;
      default:
        return <Globe size={16} />;
    }
  };

  const countries = ['all', ...Array.from(new Set(events.map(event => event.country)))];
  const impacts = ['all', 'high', 'medium', 'low'];

  const filteredEvents = events.filter(event => {
    const countryMatch = selectedCountry === 'all' || event.country === selectedCountry;
    const impactMatch = selectedImpact === 'all' || event.impact.toLowerCase() === selectedImpact;
    return countryMatch && impactMatch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Calendar className="animate-pulse mx-auto mb-4" size={48} />
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading economic events...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Economic Calendar
          </h1>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Track important economic events and their market impact
          </p>
        </div>
        <button
          onClick={fetchEvents}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <Calendar size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Filters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Country
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              {countries.map(country => (
                <option key={country} value={country}>
                  {country === 'all' ? 'All Countries' : country}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Impact Level
            </label>
            <select
              value={selectedImpact}
              onChange={(e) => setSelectedImpact(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              {impacts.map(impact => (
                <option key={impact} value={impact}>
                  {impact === 'all' ? 'All Impact Levels' : `${impact.charAt(0).toUpperCase() + impact.slice(1)} Impact`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid gap-4">
        {filteredEvents.length === 0 ? (
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-12 text-center`}>
            <Calendar className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} size={48} />
            <p className={`text-lg font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No events found
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Try adjusting your filters or check back later
            </p>
          </div>
        ) : (
          filteredEvents.map((event, index) => (
            <div
              key={index}
              className={`${darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'} border rounded-xl p-6 transition-all duration-200 hover:shadow-lg`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getImpactColor(event.impact)} ${
                      darkMode ? 'bg-opacity-20' : ''
                    }`}>
                      <div className="flex items-center space-x-1">
                        {getImpactIcon(event.impact)}
                        <span>{event.impact.toUpperCase()}</span>
                      </div>
                    </span>
                    <span className={`px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium ${
                      darkMode ? 'bg-blue-900 text-blue-200' : ''
                    }`}>
                      {event.country}
                    </span>
                  </div>
                  
                  <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {event.event}
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Previous:
                      </span>
                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                        {event.prev !== null ? `${event.prev}${event.unit}` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Estimate:
                      </span>
                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                        {event.estimate !== null ? `${event.estimate}${event.unit}` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Actual:
                      </span>
                      <p className={`font-semibold ${
                        event.actual !== null && event.estimate !== null
                          ? event.actual > event.estimate
                            ? 'text-green-600'
                            : event.actual < event.estimate
                              ? 'text-red-600'
                              : darkMode ? 'text-gray-300' : 'text-gray-800'
                          : darkMode ? 'text-gray-300' : 'text-gray-800'
                      }`}>
                        {event.actual !== null ? `${event.actual}${event.unit}` : 'Pending'}
                      </p>
                    </div>
                    <div>
                      <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Time:
                      </span>
                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                        {formatDate(event.time)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Legend */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Impact Legend
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 rounded-full text-xs font-medium text-red-600 bg-red-100 flex items-center space-x-1">
              <AlertCircle size={12} />
              <span>HIGH</span>
            </span>
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Major market impact expected
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 rounded-full text-xs font-medium text-yellow-600 bg-yellow-100 flex items-center space-x-1">
              <TrendingUp size={12} />
              <span>MEDIUM</span>
            </span>
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Moderate market reaction likely
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 rounded-full text-xs font-medium text-green-600 bg-green-100 flex items-center space-x-1">
              <Clock size={12} />
              <span>LOW</span>
            </span>
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Limited market impact expected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EconomicCalendar;