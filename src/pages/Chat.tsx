import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { Send, Sparkles } from 'lucide-react';

const API_URL = 'https://sih-crop-backend-3sjd.onrender.com/api/chat';

interface Message {
  sender: 'user' | 'agent';
  text: string;
  subtitle?: string;
  isInitial?: boolean;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { logout } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const initialMessages = [
      {
        sender: 'agent' as const,
        text: 'Hello there! 👋',
        subtitle: 'Ask me anything about your crops, soil, or farming practices. I\'m here to help you make informed decisions for a successful harvest.',
        isInitial: true
      }
    ];
    setMessages(initialMessages);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage = { sender: 'user' as const, text: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post(API_URL, {
        message: input,
        sessionId,
      });

      const agentMessage = { sender: 'agent' as const, text: response.data.response };
      setMessages(prevMessages => [...prevMessages, agentMessage]);
      setSessionId(response.data.sessionId);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { 
        sender: 'agent' as const, 
        text: 'I apologize, but I encountered an error. Please try again.' 
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        logout();
      }
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

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Farming Assistant</h1>
              <p className="text-xs text-gray-500">Your farming assistant</p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg, index) => (
            <div key={index}>
              {msg.sender === 'agent' && msg.isInitial ? (
                // Initial Welcome Message
                <div className="text-center py-8 px-4">
                  <div className="inline-block p-4 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-lg mb-4">
                    <Sparkles className="text-white" size={32} />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-3">{msg.text}</h2>
                  {msg.subtitle && (
                    <p className="text-gray-600 text-base leading-relaxed max-w-2xl mx-auto">
                      {msg.subtitle}
                    </p>
                  )}
                </div>
              ) : msg.sender === 'agent' ? (
                // Agent Messages
                <div className="flex items-start gap-3 animate-fadeIn">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-md">
                    <Sparkles className="text-white" size={14} />
                  </div>
                  <div className="flex-1 bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100 max-w-2xl">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ) : (
                // User Messages
                <div className="flex items-start gap-3 justify-end animate-fadeIn">
                  <div className="flex-1 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl rounded-tr-sm px-4 py-3 shadow-md max-w-2xl">
                    <p className="text-white leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-sm font-medium">You</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start gap-3 animate-fadeIn">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-md">
                <Sparkles className="text-white" size={14} />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 placeholder-gray-400 resize-none bg-gray-50 transition-all"
                placeholder="Type your question here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                rows={1}
                style={{
                  minHeight: '48px',
                  maxHeight: '120px',
                }}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md ${
                input.trim() && !isLoading
                  ? 'bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white shadow-lg hover:shadow-xl active:scale-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Press Enter to send • Shift + Enter for new line
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Chat;