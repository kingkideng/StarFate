import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Loader2, Sparkles } from 'lucide-react';
import { interpretAstrologyStream } from '../lib/gemini';
import Clarification from './Clarification';

export default function Astrology() {
  const [gender, setGender] = useState(() => localStorage.getItem('user_profile_gender') || '男');
  const [date, setDate] = useState(() => localStorage.getItem('user_profile_date') || '1990-01-01');
  const [time, setTime] = useState(() => localStorage.getItem('user_profile_time') || '12:00');
  const [location, setLocation] = useState(() => localStorage.getItem('user_profile_location') || '');
  
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('user_profile_gender', gender);
    localStorage.setItem('user_profile_date', date);
    localStorage.setItem('user_profile_time', time);
    localStorage.setItem('user_profile_location', location);
  }, [gender, date, time, location]);

  const generateReport = async () => {
    setLoading(true);
    setReport('');
    try {
      const stream = await interpretAstrologyStream(gender, date, time, location);
      for await (const text of stream) {
        setReport(prev => prev + text);
      }
    } catch (error) {
      console.error(error);
      setReport(prev => prev + '\n\n星空被乌云遮蔽，暂时无法解读星象... 请稍后再试。');
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
      className="max-w-4xl mx-auto w-full pb-20"
    >
      <div className="text-center mb-16 relative">
        <h2 className="text-4xl font-serif gold-text mb-4 tracking-widest">星盘解读</h2>
        <p className="text-white/60 font-serif">
          输入核心配置，探寻宇宙赋予你的灵魂印记。
        </p>
      </div>

      {!report && (
        <div className="glass-panel w-full p-5 sm:p-8 md:p-12 rounded-3xl max-w-2xl mx-auto border border-[#C5A059]/30 box-border">
          <div className="space-y-8 w-full max-w-full">
            <div className="flex flex-col min-w-0">
              <label className="text-[#C5A059] font-serif mb-2 flex items-center space-x-2">
                <span className="tracking-widest">性别</span>
              </label>
              <div className="flex gap-4 sm:gap-6">
                <label className="flex items-center space-x-3 cursor-pointer py-2 pr-4 text-white/80 hover:text-white transition-colors">
                  <input type="radio" name="astro_gender" value="男" checked={gender === '男'} onChange={(e) => setGender(e.target.value)} className="accent-[#C5A059] w-5 h-5 md:w-4 md:h-4" />
                  <span className="tracking-widest">男</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer py-2 pl-2 pr-4 text-white/80 hover:text-white transition-colors">
                  <input type="radio" name="astro_gender" value="女" checked={gender === '女'} onChange={(e) => setGender(e.target.value)} className="accent-[#C5A059] w-5 h-5 md:w-4 md:h-4" />
                  <span className="tracking-widest">女</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col min-w-0">
              <label className="text-[#C5A059] font-serif mb-2 flex items-center space-x-2">
                <span className="tracking-widest">出生日期</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full min-w-0 bg-black/40 border border-[#C5A059]/30 rounded-xl p-4 text-white font-sans focus:outline-none focus:border-[#C5A059] transition-colors [color-scheme:dark]"
              />
            </div>
            
            <div className="flex flex-col min-w-0">
              <label className="text-[#C5A059] font-serif mb-2 flex items-center space-x-2">
                <span className="tracking-widest">出生时间</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full min-w-0 bg-black/40 border border-[#C5A059]/30 rounded-xl p-4 text-white font-sans focus:outline-none focus:border-[#C5A059] transition-colors [color-scheme:dark]"
              />
            </div>

            <div className="flex flex-col min-w-0">
              <label className="text-[#C5A059] font-serif mb-2 flex items-center space-x-2">
                <span className="tracking-widest">出生地点 (城市/国家)</span>
              </label>
              <input
                type="text"
                placeholder="例如: 中国 北京"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full min-w-0 bg-black/40 border border-[#C5A059]/30 rounded-xl p-4 text-white font-sans focus:outline-none focus:border-[#C5A059] transition-colors"
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

      {report && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="glass-panel p-6 sm:p-8 md:p-12 rounded-3xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C5A059]/50 to-transparent" />
          
          <div className="text-center mb-8 text-[#C5A059]/60 font-serif border-b border-[#C5A059]/20 pb-8 tracking-widest uppercase">
            {date.replace(/-/g, '/')} {time} 生人
          </div>

          <div className="markdown-body mt-8">
            <ReactMarkdown>{report}</ReactMarkdown>
          </div>
          
          <Clarification context={report} />

          <div className="mt-12 pt-8 border-t border-[#C5A059]/20 flex justify-center">
            <button
              onClick={() => setReport('')}
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
