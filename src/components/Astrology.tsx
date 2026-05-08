import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Loader2, Sparkles } from 'lucide-react';
import { interpretAstrology } from '../lib/gemini';

export default function Astrology() {
  const [date, setDate] = useState(() => localStorage.getItem('astro_date') || '1990-01-01');
  const [time, setTime] = useState(() => localStorage.getItem('astro_time') || '12:00');
  const [location, setLocation] = useState(() => localStorage.getItem('astro_location') || '');
  
  const [result, setResult] = useState<{sun: string, moon: string, rising: string, report: string} | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('astro_date', date);
    localStorage.setItem('astro_time', time);
    localStorage.setItem('astro_location', location);
  }, [date, time, location]);

  const generateReport = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await interpretAstrology(date, time, location);
      setResult(res);
    } catch (error) {
      console.error(error);
      setResult({
        sun: '未知',
        moon: '未知',
        rising: '未知',
        report: '星空被乌云遮蔽，暂时无法解读星象... 请稍后再试。'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto w-full px-4 pb-20"
    >
      <div className="text-center mb-16">
        <h2 className="text-4xl font-serif gold-text mb-4 tracking-widest">星盘解读</h2>
        <p className="text-white/60 font-serif">
          输入核心配置，探寻宇宙赋予你的灵魂印记。
        </p>
      </div>

      {!result && (
        <div className="glass-panel p-8 md:p-12 rounded-3xl max-w-2xl mx-auto border border-[#C5A059]/30">
          <div className="space-y-8">
            <div className="flex flex-col">
              <label className="text-[#C5A059] font-serif mb-2 flex items-center space-x-2">
                <span className="tracking-widest">出生日期</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-black/40 border border-[#C5A059]/30 rounded-xl p-4 text-white font-sans focus:outline-none focus:border-[#C5A059] transition-colors [color-scheme:dark]"
              />
            </div>
            
            <div className="flex flex-col">
              <label className="text-[#C5A059] font-serif mb-2 flex items-center space-x-2">
                <span className="tracking-widest">出生时间</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-black/40 border border-[#C5A059]/30 rounded-xl p-4 text-white font-sans focus:outline-none focus:border-[#C5A059] transition-colors [color-scheme:dark]"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[#C5A059] font-serif mb-2 flex items-center space-x-2">
                <span className="tracking-widest">出生地点 (城市/国家)</span>
              </label>
              <input
                type="text"
                placeholder="例如: 中国 北京"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-black/40 border border-[#C5A059]/30 rounded-xl p-4 text-white font-sans focus:outline-none focus:border-[#C5A059] transition-colors"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="mt-12 flex justify-center">
            <button
              onClick={generateReport}
              disabled={loading}
              className="px-10 py-4 border border-[#C5A059] text-[#C5A059] rounded-full hover:bg-[#C5A059]/10 transition-all font-serif text-lg tracking-widest disabled:opacity-50 flex items-center space-x-3 w-full justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>星移斗转中...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>观象测命</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="glass-panel p-8 md:p-12 rounded-3xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C5A059]/50 to-transparent" />
          
          <div className="flex justify-center mb-8 gap-4 text-[#C5A059]/60 font-serif border-b border-[#C5A059]/20 pb-8">
            <div className="text-center">
              <div className="text-2xl mb-1">☀</div>
              <div className="text-sm tracking-widest">{result.sun}</div>
            </div>
            <div className="text-center px-8 border-x border-[#C5A059]/20">
              <div className="text-2xl mb-1">☾</div>
              <div className="text-sm tracking-widest">{result.moon}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">⇡</div>
              <div className="text-sm tracking-widest">{result.rising}</div>
            </div>
          </div>

          <div className="markdown-body">
            <ReactMarkdown>{result.report}</ReactMarkdown>
          </div>
          
          <div className="mt-12 pt-8 border-t border-[#C5A059]/20 flex justify-center">
            <button
              onClick={() => setResult(null)}
              className="text-white/60 hover:text-[#C5A059] hover:underline underline-offset-4 transition-colors font-serif tracking-widest text-sm uppercase"
            >
              返回星盘核心
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
