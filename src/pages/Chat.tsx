import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

const API_URL = 'https://sih-crop-backend-3sjd.onrender.com/api/chat';

const Chat = () => {
  const [messages, setMessages] = useState<{ sender: 'user' | 'agent'; text: string; subtitle?: string; isInitial?: boolean }[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { logout } = useAuth();
  
  // State for speech recognition
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  // Add initial messages and set up speech recognition on component mount
  useEffect(() => {
    const initialMessages = [
      { sender: 'agent' as const, text: 'Hello there!', subtitle: 'Ask me anything about your crops, soil, or farming practices. I\'m here to help you make informed decisions for a successful harvest.', isInitial: true },
      { sender: 'agent' as const, text: 'For sandy soil in the rainy season, you should consider crops like sweet potatoes, peanuts, cowpeas, and certain varieties of maize. They are well-adapted to good drainage and can thrive in such conditions. Would you like me to elaborate on any of these?' }
    ];
    setMessages(initialMessages);

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.lang = 'en-IN';
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        sendMessage(transcript); // Send the transcribed text immediately
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const handleSpeechInput = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
        setIsListening(false);
      } else {
        recognition.start();
        setIsListening(true);
      }
    } else {
      alert('Your browser does not support the Web Speech API.');
    }
  };

  const sendMessage = async (messageText: string = input) => {
    if (messageText.trim() === '') return;
    
    // Add user message to state
    const userMessage = { sender: 'user' as const, text: messageText };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    setInput('');
    
    try {
      const response = await axios.post(API_URL, { message: messageText, sessionId });
      const agentMessage = { sender: 'agent' as const, text: response.data.response };
      setMessages(prevMessages => [...prevMessages, agentMessage]);
      setSessionId(response.data.sessionId);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { sender: 'agent' as const, text: 'An error occurred. Please try again.' };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="flex justify-between items-center p-4 bg-white shadow-sm border-b border-gray-100">
        <h1 className="text-xl font-semibold text-gray-800">Crop Chat</h1>
        <button 
          onClick={logout} 
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </header>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className="flex items-start space-x-4">
            {msg.sender === 'agent' && (
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🤖</span>
                </div>
              </div>
            )}
            
            <div className={`flex-1 ${msg.sender === 'user' ? 'ml-12' : ''}`}>
              {msg.sender === 'agent' && msg.isInitial && (
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{msg.text}</h2>
                  {msg.subtitle && (
                    <p className="text-gray-600 text-sm leading-relaxed max-w-2xl">
                      {msg.subtitle}
                    </p>
                  )}
                </div>
              )}
              
              {msg.sender === 'agent' && !msg.isInitial && (
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 max-w-2xl">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {msg.sender === 'user' && (
                <div className="flex justify-end">
                  <div className="bg-blue-500 text-white rounded-lg p-4 max-w-md shadow-sm">
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-white border-t border-gray-100">
        <div className="flex items-center space-x-4 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <input
              type="text"
              className="w-full p-4 pr-12 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400"
              placeholder="Ask another question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  sendMessage();
                }
              }}
            />
          </div>
          <button
            onClick={() => sendMessage()}
            className="w-12 h-12 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none flex items-center justify-center transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
          <button
            onClick={handleSpeechInput}
            className={`w-12 h-12 rounded-full focus:outline-none flex items-center justify-center transition-colors ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-400 hover:bg-gray-500'}`}
          >
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3.53-2.65 6.4-6.3 6.4S4.7 14.53 4.7 11H3c0 4.29 3.12 7.85 7.27 8.5v3.5h3.46v-3.5c4.15-.65 7.27-4.21 7.27-8.5h-1.66z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;