import React, { useState, useRef, useEffect } from 'react';
import { chatWithTailorBot } from '../services/geminiService';
import { Send, Bot, User, Loader2 } from 'lucide-react';

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: 'Hello! I am StitchWizard, your tailoring assistant. Ask me about fabric types, stain removal, or draft a message for your customer.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare history for API (excluding the very first greeting if needed, or keeping it)
      const historyStrings = messages.map(m => m.text);
      const response = await chatWithTailorBot(historyStrings, userMsg);
      
      setMessages(prev => [...prev, { role: 'model', text: response || 'I could not generate a response.' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I am having trouble connecting to the AI service right now. Please check your API key.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
        <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
           <Bot size={24} />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">StitchWizard AI</h3>
          <p className="text-xs text-slate-500">Your virtual shop assistant</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              msg.role === 'user' 
                ? 'bg-brand-600 text-white rounded-br-none' 
                : 'bg-slate-100 text-slate-800 rounded-bl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-slate-100 p-3 rounded-2xl rounded-bl-none flex items-center gap-2 text-slate-500 text-sm">
                <Loader2 size={14} className="animate-spin" /> Thinking...
             </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="flex gap-2">
          <input 
            type="text"
            className="flex-1 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Type your question..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-brand-600 text-white p-3 rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};