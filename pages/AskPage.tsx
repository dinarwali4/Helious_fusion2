import React, { useState, useRef, useEffect } from 'react';
import { askFusionExpert } from '../services/gemini';
import { ChatMessage } from '../types';
import { Send, User, Bot, Sparkles, HelpCircle } from 'lucide-react';
import TutorialOverlay, { TutorialStep } from '../components/TutorialOverlay';

const AskPage: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Greetings. I am Helios AI, designed to answer your questions about nuclear fusion physics, engineering challenges, and the future of energy. What would you like to know?" }
  ]);
  const [loading, setLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check tutorial seen state
  useEffect(() => {
    const hasSeen = localStorage.getItem('tutorial_seen_ask');
    if (!hasSeen) {
      setTimeout(() => setShowTutorial(true), 500);
    }
  }, []);

  const tutorialSteps: TutorialStep[] = [
    {
      targetId: 'chat-input-area',
      title: 'Ask the Expert',
      content: 'Type any question about fusion here. Try asking about "Ignition", "Tritium Breeding", or "ITER progress".'
    },
    {
      targetId: 'chat-history',
      title: 'AI Reasoning',
      content: 'Helios uses advanced AI to explain complex physics simply. It can also browse the web for the latest news if you ask about current events.'
    },
    {
      targetId: 'expert-identity',
      title: 'Verified Knowledge',
      content: 'While AI is powerful, always verify critical data. Helios provides source links when it fetches data from the web.'
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    // Determine if we should use search grounding based on keywords
    const needsSearch = /news|recent|latest|company|startup|funding|breakthrough|who/i.test(userMsg);

    const response = await askFusionExpert(userMsg, needsSearch);

    setMessages(prev => [...prev, { 
      role: 'model', 
      text: response.text,
      sources: response.sources
    }]);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-64px)] flex flex-col relative">
      
      <TutorialOverlay 
        isOpen={showTutorial} 
        onClose={() => setShowTutorial(false)} 
        steps={tutorialSteps} 
        pageKey="ask"
      />

      {/* Header with Help */}
      <div className="flex justify-between items-center mb-4">
         <div id="expert-identity" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
                <h2 className="font-orbitron font-bold text-lg text-white leading-none">Helios AI</h2>
                <p className="text-xs text-gray-400">Fusion Physics Expert</p>
            </div>
         </div>
         <button
             onClick={() => setShowTutorial(true)}
             className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors border border-white/5"
             title="Start Tutorial"
          >
             <HelpCircle className="w-5 h-5" />
          </button>
      </div>

      <div className="flex-grow bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        
        {/* Chat History */}
        <div id="chat-history" className="flex-grow overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'
              }`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>

              <div className={`max-w-[80%] space-y-2`}>
                <div className={`p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
                
                {msg.sources && msg.sources.length > 0 && (
                  <div className="bg-black/20 rounded-lg p-3 text-xs space-y-2">
                    <p className="text-gray-500 uppercase tracking-wider font-bold">Sources</p>
                    <ul className="space-y-1">
                      {msg.sources.map((source, sIdx) => (
                        <li key={sIdx}>
                          <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate block">
                            {source.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

            </div>
          ))}
          
          {loading && (
            <div className="flex gap-4">
               <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                 <Bot className="w-5 h-5" />
               </div>
               <div className="bg-gray-800 p-4 rounded-2xl rounded-tl-none border border-gray-700 flex items-center gap-2">
                 <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
                 <span className="text-sm text-gray-400">Processing fusion data...</span>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div id="chat-input-area" className="p-4 bg-gray-900 border-t border-gray-800">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about magnetic confinement, ITER, or tritium breeding..."
              className="w-full bg-black/50 border border-gray-700 text-white rounded-xl pl-4 pr-12 py-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              disabled={loading}
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim()}
              className="absolute right-2 top-2 bottom-2 p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 rounded-lg transition-colors text-white"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AskPage;
