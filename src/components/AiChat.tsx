'use client';

import { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AiChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const AiChat: React.FC<AiChatProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hi! I can help you find happy hour spots in Austin. What are you looking for?',
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!input.trim() || isLoading || !API_KEY) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction:
          'You are a knowledgeable Austin guide focused on happy hours. ' +
          "Speak in a friendly, conversational tone that's helpful without being overly casual. " +
          "Avoid using expressions like 'howdy' or other regional slang. " +
          "Don't use asterisks or bullet points when sharing recommendations. " +
          'Provide information in a natural conversational flow using complete sentences. ' +
          'Keep responses brief and focused on the question asked. ' +
          'If asked about specific areas, suggest 2-3 relevant options with approximate price ranges. ' +
          'Be informative and approachable without overdoing the personality.',
      });

      const result = await model.generateContent(userMessage);
      const response = result.response.text();

      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I had trouble responding. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div id="chat-container" className="fixed bottom-0 right-0 sm:right-4 z-[1000] w-full sm:w-96">
      <div className="shadow-xl rounded-lg max-w-lg w-full" 
        style={{ 
          backgroundColor: 'var(--dark-bg-primary)',
          border: '1px solid var(--dark-border)' 
        }}>
        <div className="p-4 flex justify-between items-center rounded-t-lg" 
          style={{ 
            backgroundImage: 'linear-gradient(to right, #3D3FA7, #5D5FEF)',
            borderBottom: '1px solid var(--dark-border)'
          }}>
          <div className="flex items-center">
            <div className="flex space-x-1 mr-2">
              <div className="h-2 w-2 rounded-full animate-pulse" 
                style={{ 
                  backgroundColor: 'white', 
                  opacity: '0.7', 
                  animationDelay: '0ms' 
                }}></div>
              <div className="h-2 w-2 rounded-full animate-pulse" 
                style={{ 
                  backgroundColor: 'white', 
                  opacity: '0.7', 
                  animationDelay: '200ms' 
                }}></div>
              <div className="h-2 w-2 rounded-full animate-pulse" 
                style={{ 
                  backgroundColor: 'white', 
                  opacity: '0.7', 
                  animationDelay: '400ms' 
                }}></div>
            </div>
            <p className="text-lg font-semibold text-white">AI Assistant</p>
          </div>
          <button onClick={onClose} className="focus:outline-none transition-colors"
            style={{ color: 'rgba(255, 255, 255, 0.7)' }}
            onMouseOver={(e) => e.currentTarget.style.color = 'white'}
            onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div className="h-80 overflow-y-auto p-3 bg-gray-700 scrollbar-thin">
          {messages.map((message, index) => (
            <div key={index} className={`mb-3 ${
              message.role === 'user' ? 'text-right' : 'text-left'
            }`}>
              <div className={`inline-block rounded-lg p-2 max-w-[85%] ${
                message.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-600 text-gray-100'
              }`}>
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="text-left mb-3">
              <div className="inline-block rounded-lg p-2 bg-gray-600 text-gray-200">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 rounded-full bg-[#7879F1] opacity-80 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="h-2 w-2 rounded-full bg-[#7879F1] opacity-80 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="h-2 w-2 rounded-full bg-[#7879F1] opacity-80 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-3 border-t border-gray-600 bg-gray-800">
          <form className="flex" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-grow px-3 py-2 rounded-l-lg bg-gray-600 text-gray-100 placeholder-gray-300 focus:outline-none"
            />
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
              disabled={isLoading || !input.trim()}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AiChat;
