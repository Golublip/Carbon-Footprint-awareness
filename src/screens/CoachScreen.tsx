import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../providers/AppContext';
import { Card, Button } from '../widgets/SharedUI';
import { aiCoachService } from '../services/aiCoachService';
import { Send, Sparkles, AlertTriangle, TrendingDown } from 'lucide-react';
import type { ChatMessage } from '../models/types';

export const CoachScreen: React.FC = () => {
  const { logs, profile } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Seed initial welcome message
  useEffect(() => {
    const defaultMsg: ChatMessage = {
      id: 'welcome-msg',
      sender: 'ai',
      text: `Hi ${profile.name}! I am EcoCoach, your personal AI sustainability assistant. I've analyzed your 14-day carbon history.

You can ask me:
- **"What is my biggest emitter?"** to analyze your carbon hotspots.
- **"How can I save carbon?"** to get tailored, actionable reduction checklists.
- **"Forecast my footprint"** to see your potential long-term climate savings.

How can I help you live more sustainably today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([defaultMsg]);
  }, [profile.name]);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setLoading(true);

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);

    try {
      const replyText = await aiCoachService.generateCoaching(userText, logs, profile);
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        sender: 'ai',
        text: "I am having trouble connecting to my knowledge base. Please try asking again shortly.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Helper stats for side panel
  const averages = aiCoachService.getCategoryAverages(logs);
  const topCategory = aiCoachService.getTopEmissionCategory(averages);
  const totalAvg = Object.values(averages).reduce((a, b) => a + b, 0);

  // Quick prompt templates
  const runQuickCommand = async (text: string) => {
    if (loading) return;
    setInput(text);
    // Submit programmatically in next microtask
    setTimeout(() => {
      const form = document.getElementById('chat-form') as HTMLFormElement;
      form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }, 50);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)] min-h-[500px]">
      {/* Chat Section */}
      <Card className="lg:col-span-2 flex flex-col h-full overflow-hidden p-0 border border-zinc-200 dark:border-zinc-800">
        {/* Chat Header */}
        <div className="flex items-center gap-2 p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
          <Sparkles className="w-5 h-5 text-blue-500" aria-hidden="true" />
          <h2 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">AI Sustainability Coach</h2>
          <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-label="Coach online"></span>
        </div>

        {/* Message Panel */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
          {messages.map(msg => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${isUser ? 'ml-auto items-end' : 'mr-auto items-start'}`}
              >
                <div
                  className={`px-4 py-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-tl-none border border-zinc-200/30 dark:border-zinc-800'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-zinc-400 font-medium mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            );
          })}
          {loading && (
            <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500 italic p-2">
              <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.4s]"></span>
              <span>EcoCoach is analyzing...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Form Input */}
        <form
          id="chat-form"
          onSubmit={handleSendMessage}
          className="p-3 border-t border-zinc-100 dark:border-zinc-800 flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ask EcoCoach how to reduce carbon footprint..."
            className="flex-1 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-zinc-950 dark:text-zinc-100 disabled:opacity-50"
            aria-label="Chat input message"
          />
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            ariaLabel="Send message to AI Coach"
            className="px-3 py-2"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </Card>

      {/* Analytics Panel */}
      <div className="space-y-4 flex flex-col h-full justify-between">
        {/* Contributor Card */}
        <Card className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 text-rose-500">
              <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden="true" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Hotspot Analysis</h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Based on your activity logs, your highest greenhouse gas contributor is:
            </p>
            <h4 className="text-2xl font-black text-zinc-950 dark:text-zinc-50 font-mono mt-3 uppercase tracking-tight">
              {topCategory.category}
            </h4>
            <div className="mt-3 p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/80 rounded-lg">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-500">Avg Daily Footprint:</span>
                <span className="font-mono text-zinc-900 dark:text-zinc-100">{totalAvg.toFixed(1)} kg CO₂e</span>
              </div>
              <div className="flex justify-between text-xs font-semibold mt-1">
                <span className="text-zinc-500">Category Share:</span>
                <span className="font-mono text-zinc-900 dark:text-zinc-100">
                  {totalAvg > 0 ? Math.round((topCategory.value / totalAvg) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => runQuickCommand('What is my biggest emitter?')}
            ariaLabel="Ask about biggest emitter"
            className="w-full text-xs py-2 mt-4"
          >
            Explain Major Contributors
          </Button>
        </Card>

        {/* Actions Cards */}
        <Card className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 text-blue-500">
              <TrendingDown className="w-5 h-5 shrink-0" aria-hidden="true" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Reduction Actions</h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Tailor realistic targets and forecast savings based on your active challenges.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <button
                onClick={() => runQuickCommand('How can I save carbon?')}
                className="text-left w-full text-xs font-semibold p-2 bg-blue-50/10 hover:bg-blue-50/20 dark:bg-blue-900/10 dark:hover:bg-blue-900/20 border border-blue-200/20 rounded-lg text-blue-600 dark:text-blue-400 cursor-pointer"
              >
                💡 Get Carbon Saving Tips
              </button>
              <button
                onClick={() => runQuickCommand('Forecast my footprint')}
                className="text-left w-full text-xs font-semibold p-2 bg-purple-50/10 hover:bg-purple-50/20 dark:bg-purple-900/10 dark:hover:bg-purple-900/20 border border-purple-200/20 rounded-lg text-purple-600 dark:text-purple-400 cursor-pointer"
              >
                🔮 Show 6-Month Forecast
              </button>
            </div>
          </div>
          <p className="text-[10px] text-zinc-400 mt-4 leading-normal">
            *Forecast calculates dynamic cumulative impacts compared to a Business-As-Usual baseline.
          </p>
        </Card>
      </div>
    </div>
  );
};
