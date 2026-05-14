import { lazy, Suspense, useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { askQuestionStream } from '../lib/gemini';

const MarkdownContent = lazy(() => import('./MarkdownContent'));

export default function Clarification({ context }: { context: string }) {
  const [history, setHistory] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [turns, setTurns] = useState(0);
  const MAX_TURNS = 3;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleAsk = async () => {
    if (!question.trim() || turns >= MAX_TURNS || loading) return;
    
    const userMessage = question.trim();
    setHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setQuestion('');
    setLoading(true);
    
    try {
      setHistory(prev => [...prev, { role: 'model', text: '' }]);
      
      const stream = await askQuestionStream(context, history, userMessage);
      
      for await (const chunk of stream) {
        setHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1].text += chunk;
          return newHistory;
        });
      }
      setTurns(t => t + 1);
    } catch (e: any) {
      console.error(e);
      setHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1].text += `\n\n迷雾遮蔽了视野，未能得到答案。${e.message || ''}`;
        return newHistory;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-[#C5A059]/20">
      <h3 className="text-xl font-serif text-[#C5A059] mb-6 tracking-widest text-center">命运解惑 ({turns}/{MAX_TURNS})</h3>
      
      <div className="space-y-6 mb-6">
        {history.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-[#C5A059]/20 text-[#C5A059] rounded-tr-sm' : 'bg-white/5 border border-white/10 text-white/80 rounded-tl-sm markdown-body'}`}>
              {msg.role === 'model' ? (
                <Suspense fallback={<span className="text-[#C5A059]/70">排版中...</span>}>
                  <MarkdownContent streaming={loading && i === history.length - 1}>{msg.text}</MarkdownContent>
                </Suspense>
              ) : msg.text}
            </div>
          </div>
        ))}
        {loading && history[history.length - 1]?.role !== 'model' && (
           <div className="flex justify-start">
             <div className="bg-white/5 border border-white/10 text-white/80 rounded-2xl rounded-tl-sm p-4">
                 <Loader2 className="w-4 h-4 animate-spin text-[#C5A059]" />
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {turns < MAX_TURNS ? (
        <div className="relative">
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAsk()}
            placeholder="探问命运的隐语..."
            className="w-full bg-black/40 border border-[#C5A059]/30 rounded-xl py-4 pl-4 pr-12 text-white placeholder-white/30 font-serif focus:outline-none focus:border-[#C5A059] transition-colors"
            disabled={loading}
          />
          <button 
            onClick={handleAsk}
            disabled={loading || !question.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C5A059]/60 hover:text-[#C5A059] disabled:opacity-50 transition-colors p-2"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="text-center text-white/40 font-serif text-sm">
          真理的馈赠已经圆满，因果的门扉暂时合上。
        </div>
      )}
    </div>
  )
}
