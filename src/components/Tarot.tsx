import { lazy, Suspense, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Loader2 } from 'lucide-react';
import { TAROT_CARDS } from '../types';
import { interpretTarotStream } from '../lib/gemini';
import { cn } from '../lib/utils';
import Clarification from './Clarification';

const MarkdownContent = lazy(() => import('./MarkdownContent'));

export default function Tarot() {
  const [selectedCards, setSelectedCards] = useState<typeof TAROT_CARDS>([]);
  const [question, setQuestion] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);

  const drawCards = async () => {
    if (isDrawing || selectedCards.length === 3) return;
    setIsDrawing(true);
    
    // Pick 3 random unique cards
    const shuffled = [...TAROT_CARDS].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, 3);
    
    // Animate drawing one by one
    for (let i = 0; i < 3; i++) {
      await new Promise(r => setTimeout(r, 600));
      setSelectedCards(prev => [...prev, picked[i]]);
    }
    
    setIsDrawing(false);
  };

  const generateReport = async () => {
    if (selectedCards.length < 3) return;
    setLoading(true);
    setReport('');
    try {
      const past = `${selectedCards[0].zhName} (${selectedCards[0].name})`;
      const present = `${selectedCards[1].zhName} (${selectedCards[1].name})`;
      const future = `${selectedCards[2].zhName} (${selectedCards[2].name})`;
      const stream = await interpretTarotStream(past, present, future, question);
      
      for await (const text of stream) {
        setReport(prev => prev + text);
      }
    } catch (error: any) {
      console.error(error);
      setReport(prev => prev + `\n\n以太大气出现了扰动，命运的信号暂时中断... ${error.message || '请稍后再试。'}`);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSelectedCards([]);
    setReport('');
    setQuestion('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-5xl mx-auto w-full px-4 pb-20"
    >
      <div className="text-center mb-12">
        <h2 className="text-4xl font-serif gold-text mb-4 tracking-widest">塔罗指引</h2>
        <p className="text-white/60 font-serif">
          过去，现在，未来 —— 命运的轨迹在牌面浮现。
        </p>
      </div>

      {!report && (
        <div className="flex flex-col items-center max-w-2xl mx-auto mb-16">
          <textarea
            className="w-full bg-black/40 border border-[#C5A059]/30 rounded-xl p-4 text-white placeholder-white/30 font-serif focus:outline-none focus:border-[#C5A059] transition-colors resize-none disabled:opacity-50"
            rows={3}
            placeholder="在静默中凝视你的问题，或留空以寻求整体指引..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={selectedCards.length === 3 || isDrawing}
          />
          
          {selectedCards.length < 3 && (
            <button
              onClick={drawCards}
              disabled={isDrawing}
              className="mt-6 px-8 py-3 rounded-full border border-[#C5A059]/50 text-[#C5A059] hover:bg-[#C5A059]/10 transition-all font-serif flex items-center space-x-2 disabled:opacity-50 tracking-widest"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isDrawing ? '潜意识漫游中...' : '开启命运之门'}
              </span>
            </button>
          )}
        </div>
      )}

      {/* Cards Display */}
      <div className="flex flex-row justify-center gap-4 md:gap-8 mb-12">
        {[0, 1, 2].map((index) => {
          const card = selectedCards[index];
          const positions = ['过去', '现在', '未来'];
          
          return (
            <div key={index} className="flex flex-col items-center flex-1 max-w-[240px]">
              <div className="text-xs md:text-sm tracking-widest text-[#C5A059]/70 mb-3 md:mb-4 uppercase">{positions[index]}</div>
              <div className="w-full aspect-[1/1.7] relative perspective select-none">
                <motion.div
                  className="w-full h-full relative preserve-3d"
                  initial={false}
                  animate={{ rotateY: card ? 0 : 180 }}
                  transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                >
                  {/* Front of card */}
                  <div className={cn(
                    "absolute inset-0 backface-hidden border border-[#C5A059]/40 rounded-xl overflow-hidden glass-panel p-2",
                    !card && "opacity-0"
                  )}>
                    {card && (
                      <div className="w-full h-full relative">
                        <img 
                          src={card.image} 
                          alt={card.zhName}
                          width={475}
                          height={816}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover rounded shadow-[0_0_15px_rgba(197,160,89,0.2)]"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Back of card */}
                  <div className={cn(
                    "tarot-card-back absolute inset-0 backface-hidden rotate-y-180 border border-white/10 rounded-xl overflow-hidden glass-panel flex flex-col justify-center items-center",
                    card && "opacity-0 pointer-events-none"
                  )}>
                    <div className="w-16 h-16 border border-[#C5A059]/40 rounded-full flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-[#C5A059]/40" />
                    </div>
                  </div>
                </motion.div>
              </div>
              {card && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 text-center"
                >
                  <h3 className="text-sm md:text-xl font-serif text-[#C5A059] uppercase tracking-widest">{card.zhName}</h3>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {selectedCards.length === 3 && !report && (
        <div className="flex justify-center mb-12">
          <button
            onClick={generateReport}
            disabled={loading}
            className="px-10 py-4 glass-panel border border-[#C5A059] text-[#C5A059] rounded-full hover:bg-[#C5A059]/10 transition-all font-serif text-lg tracking-widest disabled:opacity-50 flex items-center space-x-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>倾听繁星的低语...</span>
              </>
            ) : (
              <span>解读命运轨迹</span>
            )}
          </button>
        </div>
      )}

      {report && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="glass-panel p-6 sm:p-8 md:p-12 rounded-3xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C5A059]/50 to-transparent" />
          <div className="markdown-body mt-8">
            <Suspense fallback={<div className="text-[#C5A059]/70 animate-pulse">星图排版中...</div>}>
              <MarkdownContent streaming={loading}>{report}</MarkdownContent>
            </Suspense>
          </div>
          
          <Clarification context={report} />

          <div className="mt-12 pt-8 border-t border-[#C5A059]/20 flex justify-center">
            <button
              onClick={reset}
              className="text-white/60 hover:text-[#C5A059] hover:underline underline-offset-4 transition-colors font-serif tracking-widest text-sm uppercase"
            >
              再度请示
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
