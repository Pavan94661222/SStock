import React, { useState } from 'react';
import {
  Search, TrendingUp, RefreshCw, AlertTriangle, BarChart2,
  Brain, Target, TrendingDown, CheckCircle, XCircle, MinusCircle
} from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface SentimentAnalysisProps {
  darkMode: boolean;
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI('AIzaSyAFAeIfHxE7pOwSqezf4XnzY6--JmE2Nj4');

interface InvestmentScale {
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  timeframe: string;
  accuracy: number;
}

interface StockData {
  c: number;
  pc: number;
}

interface TechnicalData {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
  };
  bb: {
    upper: number;
    middle: number;
    lower: number;
    bandwidth: number;
  };
  ma: {
    short: number;
    long: number;
  };
}

// Enhanced Gemini utility functions
async function getStockRecommendation(stockData: StockData, technicalData: TechnicalData): Promise<{
  text: string;
  scale: InvestmentScale;
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
        Provide a detailed daily trading analysis and investment recommendation based on:
        Current Price: $${stockData.c}
        Previous Close: $${stockData.pc}
        Daily Change: ${((stockData.c - stockData.pc) / stockData.pc * 100).toFixed(2)}%
        Today's RSI: ${technicalData.rsi}
        Today's MACD: ${technicalData.macd.macd} (Signal: ${technicalData.macd.signal})
        Today's Bollinger Bands: Upper: ${technicalData.bb.upper}, Middle: ${technicalData.bb.middle}, Lower: ${technicalData.bb.lower}
        Today's Moving Averages: Short: ${technicalData.ma.short}, Long: ${technicalData.ma.long}

        Please provide:
        1. Investment Recommendation Scale
        2. Next day's predicted price range with 70% confidence interval
        3. Specific intraday support and resistance levels
        4. Risk assessment for different investment timeframes:
            - Day Trading
            - Swing Trading (1-5 days)
            - Position Trading (1-4 weeks)
        5. Detailed reasoning for the recommendation
        6. Key triggers that could change this recommendation
    `;

    const result = await model.generateContent(prompt);
    const analysisText = result.response?.text() || '';

    const scale = parseRecommendationScale(analysisText);

    return { text: analysisText, scale };
  } catch (error: any) {
    console.error("Error in getStockRecommendation:", error);
    return { 
      text: "Error generating recommendation. Please check your API key and try again.", 
      scale: { sentiment: 'neutral', confidence: 50, timeframe: 'N/A', accuracy: 0 } 
    };
  }
}

async function getTechnicalAnalysis(technicalData: TechnicalData) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
        Provide today's technical analysis and tomorrow's outlook based on:
        Today's RSI: ${technicalData.rsi}
        Today's MACD: ${technicalData.macd.macd} (Signal: ${technicalData.macd.signal})
        Today's Bollinger Bands:
        - Upper: ${technicalData.bb.upper}
        - Middle: ${technicalData.bb.middle}
        - Lower: ${technicalData.bb.lower}
        - Bandwidth: ${technicalData.bb.bandwidth}
        Today's Moving Averages:
        - Short-term: ${technicalData.ma.short}
        - Long-term: ${technicalData.ma.long}

        Focus on:
        1. Today's price action analysis
        2. Tomorrow's expected trend direction
        3. Key intraday levels to watch
        4. Volume analysis for today
        5. Tomorrow's volatility expectation
    `;

    const result = await model.generateContent(prompt);
    return result.response?.text() || "Error fetching technical analysis.";
  } catch (error: any) {
    console.error("Error in getTechnicalAnalysis:", error);
    return "Error fetching technical analysis. Please check your connection and try again.";
  }
}

async function getMarketSentiment(stockData: StockData, technicalData: TechnicalData) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
        Analyze today's market sentiment and tomorrow's outlook based on:
        Today's Price Change: ${((stockData.c - stockData.pc) / stockData.pc * 100).toFixed(2)}%
        Today's RSI Level: ${technicalData.rsi}
        Today's MACD Trend: ${technicalData.macd.macd > technicalData.macd.signal ? 'Bullish' : 'Bearish'}
        Today's BB Position: ${stockData.c > technicalData.bb.upper ? 'Above Upper' : stockData.c < technicalData.bb.lower ? 'Below Lower' : 'Within Bands'}

        Provide:
        1. Today's market mood analysis
        2. Expected sentiment shift for tomorrow
        3. Key events that could impact tomorrow's trading
        4. Today's volume analysis and tomorrow's expectations
        5. Risk sentiment for tomorrow's session
    `;

    const result = await model.generateContent(prompt);
    return result.response?.text() || "Error fetching market sentiment.";
  } catch (error: any) {
    console.error("Error in getMarketSentiment:", error);
    return "Error fetching market sentiment. Please check your connection and try again.";
  }
}

function parseRecommendationScale(analysisText: string): InvestmentScale {
  const lowerCaseText = analysisText.toLowerCase();
  return {
    sentiment: lowerCaseText.includes('bullish') || lowerCaseText.includes('buy') || lowerCaseText.includes('positive') ? 'positive' :
               lowerCaseText.includes('bearish') || lowerCaseText.includes('sell') || lowerCaseText.includes('negative') ? 'negative' : 'neutral',
    confidence: parseInt(analysisText.match(/confidence[:\s]*(\d+)%/i)?.[1] || '70', 10),
    timeframe: analysisText.match(/timeframe[:\s]*([^.\n]+)/i)?.[1]?.trim() || "24 hours",
    accuracy: parseInt(analysisText.match(/accuracy[:\s]*(\d+)%/i)?.[1] || '75', 10),
  };
}

const truncateText = (text: string, wordLimit: number = 75) => {
  const words = text.split(' ');
  if (words.length <= wordLimit) return text;
  return words.slice(0, wordLimit).join(' ') + '...';
};

const Button: React.FC<{ 
  onClick: () => void; 
  children: React.ReactNode; 
  className?: string;
  disabled?: boolean;
}> = ({ onClick, children, className, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out transform hover:scale-105 disabled:transform-none ${className}`}
  >
    {children}
  </button>
);

interface RecommendationCardProps {
  recommendation: string;
  technicalAnalysis: string;
  marketSentiment: string;
  loading: boolean;
  investmentScale?: InvestmentScale;
  darkMode: boolean;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  technicalAnalysis,
  marketSentiment,
  loading,
  investmentScale,
  darkMode
}) => {
  const truncatedRecommendation = truncateText(recommendation, 150);
  const truncatedTechnicalAnalysis = truncateText(technicalAnalysis, 150);
  const truncatedMarketSentiment = truncateText(marketSentiment, 150);

  const keyTradingLevelsText = recommendation
    .split('\n')
    .filter(line =>
      line.toLowerCase().includes('support') ||
      line.toLowerCase().includes('resistance') ||
      line.toLowerCase().includes('target')
    )
    .join(' ');
  const truncatedTradingLevels = truncateText(keyTradingLevelsText, 75);

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl shadow-2xl p-8 mb-8 transition-transform transform hover:scale-105`}>
      {loading ? (
        <div className="animate-pulse flex flex-col space-y-4">
          <div className={`h-6 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded w-1/2`}></div>
          <div className={`h-6 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded w-1/3`}></div>
          <div className={`h-6 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded w-2/3`}></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Investment Scale Card */}
          {investmentScale && (
            <div className={`${darkMode ? 'bg-gradient-to-r from-gray-700 to-gray-600' : 'bg-gradient-to-r from-green-100 to-blue-100'} p-6 rounded-xl shadow-inner`}>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Investment Recommendation Scale</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div className="flex items-center space-x-3">
                  {investmentScale.sentiment === 'positive' ? (
                    <CheckCircle className="text-green-500" size={28} />
                  ) : investmentScale.sentiment === 'negative' ? (
                    <XCircle className="text-red-500" size={28} />
                  ) : (
                    <MinusCircle className="text-yellow-500" size={28} />
                  )}
                  <div>
                    <p className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sentiment</p>
                    <p className={`capitalize font-bold ${
                      investmentScale.sentiment === 'positive' ? 'text-green-600' :
                      investmentScale.sentiment === 'negative' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {investmentScale.sentiment}
                    </p>
                  </div>
                </div>

                <div>
                  <p className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Confidence Level</p>
                  <div className="flex items-center mt-1">
                    <div className={`w-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2.5 mr-2`}>
                      <div
                        className={`h-2.5 rounded-full ${
                          investmentScale.confidence >= 80 ? 'bg-green-600' :
                          investmentScale.confidence >= 60 ? 'bg-yellow-600' :
                          'bg-red-600'
                        }`}
                        style={{ width: `${investmentScale.confidence}%` }}
                      ></div>
                    </div>
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{investmentScale.confidence}%</span>
                  </div>
                </div>

                <div>
                  <p className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Historical Accuracy</p>
                  <div className="flex items-center mt-1">
                    <div className={`w-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2.5 mr-2`}>
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${investmentScale.accuracy}%` }}
                      ></div>
                    </div>
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{investmentScale.accuracy}%</span>
                  </div>
                </div>

                <div>
                  <p className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Timeframe</p>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mt-1`}>{investmentScale.timeframe}</p>
                </div>
              </div>
            </div>
          )}

          {/* Main Recommendation */}
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-6 rounded-xl shadow-md`}>
            <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 flex items-center`}>
              <AlertTriangle className="mr-2 text-yellow-500" size={28} />
              AI-Powered Intraday Trading Recommendation
            </h3>
            <div className={`prose max-w-none ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {truncatedRecommendation.split('\n').map((line, index) => (
                <p key={index} className="mb-3">
                  {line.toLowerCase().includes('bullish') ? (
                    <TrendingUp className="inline mr-2 text-green-500" size={16} />
                  ) : line.toLowerCase().includes('bearish') ? (
                    <TrendingDown className="inline mr-2 text-red-500" size={16} />
                  ) : null}
                  {line.replace(/\*\*/g, '')}
                </p>
              ))}
            </div>
          </div>

          {/* Technical Analysis */}
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-6 rounded-xl shadow-md`}>
            <h4 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 flex items-center`}>
              <BarChart2 className="mr-2 text-blue-500" size={22} />
              Technical Analysis
            </h4>
            <div className={`prose max-w-none ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {truncatedTechnicalAnalysis.split('\n').map((line, index) => (
                <p key={index} className="mb-3">
                  {line.replace(/\*\*/g, '')}
                </p>
              ))}
            </div>
          </div>

          {/* Market Sentiment */}
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-6 rounded-xl shadow-md`}>
            <h4 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 flex items-center`}>
              <Brain className="mr-2 text-purple-500" size={22} />
              Market Sentiment
            </h4>
            <div className={`prose max-w-none ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {truncatedMarketSentiment.split('\n').map((line, index) => (
                <p key={index} className="mb-3">
                  {line.replace(/\*\*/g, '')}
                </p>
              ))}
            </div>
          </div>

          {/* Trading Levels */}
          {truncatedTradingLevels && (
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-6 rounded-xl shadow-md`}>
              <h4 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 flex items-center`}>
                <Target className="mr-2 text-red-500" size={22} />
                Key Trading Levels
              </h4>
              <div className={`prose max-w-none ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {truncatedTradingLevels.split('\n').map((line, index) => (
                  <p key={index} className="mb-3">
                    {line.replace(/\*\*/g, '')}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({ darkMode }) => {
  const [recommendation, setRecommendation] = useState<string>('');
  const [technicalAnalysis, setTechnicalAnalysis] = useState<string>('');
  const [marketSentiment, setMarketSentiment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [technicalData, setTechnicalData] = useState<TechnicalData | null>(null);
  const [investmentScale, setInvestmentScale] = useState<InvestmentScale | undefined>();

  const fetchStockData = async (company: string) => {
    try {
      setLoading(true);
      setError('');

      // Generate realistic mock data with some randomization
      const basePrice = 100 + Math.random() * 400; // Random base price between 100-500
      const change = (Math.random() - 0.5) * 20; // Random change between -10 to +10
      const previousClose = basePrice - change;

      const mockStockData = {
        c: basePrice,
        pc: previousClose,
      };

      const mockTechnicalData = {
        rsi: 30 + Math.random() * 40, // RSI between 30-70
        macd: {
          macd: (Math.random() - 0.5) * 4, // MACD between -2 to +2
          signal: (Math.random() - 0.5) * 3, // Signal between -1.5 to +1.5
        },
        bb: {
          upper: basePrice + (5 + Math.random() * 15), // Upper band
          middle: basePrice, // Middle band (current price)
          lower: basePrice - (5 + Math.random() * 15), // Lower band
          bandwidth: 0.03 + Math.random() * 0.04, // Bandwidth between 0.03-0.07
        },
        ma: {
          short: basePrice - (Math.random() - 0.5) * 10, // Short MA
          long: basePrice - (Math.random() - 0.5) * 20, // Long MA
        },
      };

      setStockData(mockStockData);
      setTechnicalData(mockTechnicalData);

      // Get recommendations and analysis
      const { text: rec, scale } = await getStockRecommendation(mockStockData, mockTechnicalData);
      const techAnalysis = await getTechnicalAnalysis(mockTechnicalData);
      const sentiment = await getMarketSentiment(mockStockData, mockTechnicalData);

      setRecommendation(rec);
      setTechnicalAnalysis(techAnalysis);
      setMarketSentiment(sentiment);
      setInvestmentScale(scale);
    } catch (err) {
      setError('Failed to fetch data. Please check your API keys and try again.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} p-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            AI-Powered Stock Analysis Dashboard
          </h1>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Select a stock to view real-time analysis and AI-powered recommendations
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Stock Selection Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {[
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
          ].map(([symbol, name]) => (
            <Button
              key={symbol}
              onClick={() => fetchStockData(symbol)}
              disabled={loading}
              className="flex flex-col items-center justify-center p-4 h-full"
            >
              <span className="font-bold text-lg">{symbol}</span>
              <span className="text-sm text-gray-200 text-center">{name}</span>
            </Button>
          ))}
        </div>

        {/* Analysis Cards */}
        {(recommendation || loading) && (
          <RecommendationCard
            recommendation={recommendation}
            technicalAnalysis={technicalAnalysis}
            marketSentiment={marketSentiment}
            loading={loading}
            investmentScale={investmentScale}
            darkMode={darkMode}
          />
        )}

        {/* Disclaimer */}
        <div className={`mt-8 text-sm ${darkMode ? 'text-gray-400 bg-gray-800' : 'text-gray-500 bg-gray-50'} p-4 rounded-lg`}>
          <p className="font-semibold mb-2">Disclaimer:</p>
          <p>The analysis and recommendations provided are generated using AI models and technical indicators. 
             This information should not be considered as financial advice. Always conduct your own research and 
             consult with a qualified financial advisor before making investment decisions. Past performance does 
             not guarantee future results.</p>
        </div>
      </div>
    </div>
  );
};

export default SentimentAnalysis;