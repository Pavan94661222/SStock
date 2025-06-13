import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface AIChatProps {
  darkMode: boolean;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const genAI = new GoogleGenerativeAI('AIzaSyAFAeIfHxE7pOwSqezf4XnzY6--JmE2Nj4');

const AIChat: React.FC<AIChatProps> = ({ darkMode }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI financial assistant. I can help you with stock analysis, market trends, investment strategies, and answer any questions about the financial markets. What would you like to know?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `
        You are a professional financial advisor and market analyst AI assistant for StockVerse, a comprehensive financial platform. 
        
        Context: The user is asking about: "${inputText}"
        
        Please provide helpful, accurate, and professional financial advice or information. Focus on:
        - Stock market analysis and trends
        - Investment strategies and recommendations
        - Risk assessment and portfolio management
        - Market news and economic indicators
        - Technical analysis insights
        - General financial education
        
        Always include appropriate disclaimers about financial advice and encourage users to do their own research.
        Keep responses informative but concise, and always maintain a professional yet friendly tone.
        
        If the question is not related to finance or investing, politely redirect the conversation back to financial topics.
      `;

      const result = await model.generateContent(prompt);
      const aiResponse = result.response?.text() || "I apologize, but I'm having trouble processing your request right now. Please try again.";

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm experiencing technical difficulties. Please check your connection and try again. In the meantime, you can explore other features of StockVerse or consult financial resources directly.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickPrompts = [
    "What are the current market trends?",
    "How should I diversify my portfolio?",
    "Explain technical analysis basics",
    "What's happening with tech stocks?",
    "Investment strategies for beginners",
    "How to analyze stock fundamentals?"
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-4`}>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
            <Bot className="text-white" size={24} />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              AI Financial Assistant
            </h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Get personalized financial insights and market analysis
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
              <div className={`p-2 rounded-full ${
                message.sender === 'user' 
                  ? 'bg-blue-600 ml-3' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 mr-3'
              }`}>
                {message.sender === 'user' ? (
                  <User className="text-white" size={16} />
                ) : (
                  <Bot className="text-white" size={16} />
                )}
              </div>
              <div className={`p-4 rounded-2xl shadow-lg ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : darkMode
                    ? 'bg-gray-800 text-gray-100 rounded-bl-sm border border-gray-700'
                    : 'bg-gray-100 text-gray-900 rounded-bl-sm'
              }`}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.text}
                </p>
                <p className={`text-xs mt-2 opacity-70`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                <Bot className="text-white" size={16} />
              </div>
              <div className={`p-4 rounded-2xl rounded-bl-sm shadow-lg ${
                darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100'
              }`}>
                <div className="flex items-center space-x-2">
                  <Loader className="animate-spin" size={16} />
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    AI is thinking...
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className={`px-4 pb-2 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Quick questions:
          </p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => setInputText(prompt)}
                className={`text-xs px-3 py-2 rounded-full border transition-colors duration-200 ${
                  darkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t p-4`}>
        <div className="flex space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about stocks, investments, market trends..."
            disabled={isLoading}
            className={`flex-1 px-4 py-3 rounded-xl border ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50`}
          />
          <button
            onClick={sendMessage}
            disabled={!inputText.trim() || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;