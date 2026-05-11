import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Moon, Loader2 } from 'lucide-react';
import { interpretBaziStream } from '../lib/gemini';

export default function Bazi() {
  const [gender, setGender] = useState(() => localStorage.getItem('bazi_gender') || '男');
  const [date, setDate] = useState(() => localStorage.getItem('bazi_date') || '1990-01-01');
  const [time, setTime] = useState(() => localStorage.getItem('bazi_time') || '12:00');
  const [location, setLocation] = useState(() => localStorage.getItem('bazi_location') || '');
  
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('bazi_gender', gender);
    localStorage.setItem('bazi_date', date);
    localStorage.setItem('bazi_time', time);
    localStorage.setItem('bazi_location', location);
  }, [gender, date, time, location]);

  const generateReport = async () => {
    setLoading(true);
    setReport('');
    try {
      const stream = await interpretBaziStream(gender, date, time, location);
      for await (const text of stream) {
        setReport(prev => prev + text);
      }
    } catch (error) {
      console.error(error);
      setReport(prev => prev + '\n\n天机不可泄露，因缘此刻难明... 请稍后再试。');
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
        <h2 className="text-4xl font-serif gold-text mb-4 tracking-widest">八字命理</h2>
        <p className="text-white/60 font-serif">
          洞隐乾坤，顺应流年，照见一生的命格图谱。
        </p>
      </div>

      {!report && (
        <div className="glass-panel p-8 md:p-12 rounded-3xl max-w-2xl mx-auto border border-[#C5A059]/30">
          <div className="space-y-8">
            <div className="flex flex-col">
              <label className="text-[#C5A059] font-serif mb-2 flex items-center space-x-2">
                <span className="tracking-widest">性别</span>
              </label>
              <div className="flex gap-6">
                <label className="flex items-center space-x-2 cursor-pointer text-white/80 hover:text-white transition-colors">
                  <input type="radio" name="gender" value="男" checked={gender === '男'} onChange={(e) => setGender(e.target.value)} className="accent-[#C5A059] w-4 h-4" />
                  <span className="tracking-widest">男 (乾造)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer text-white/80 hover:text-white transition-colors">
                  <input type="radio" name="gender" value="女" checked={gender === '女'} onChange={(e) => setGender(e.target.value)} className="accent-[#C5A059] w-4 h-4" />
                  <span className="tracking-widest">女 (坤造)</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[#C5A059] font-serif mb-2 flex items-center space-x-2">
                <span className="tracking-widest">阳历出生日期</span>
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
                <span className="tracking-widest">出生时间 (时辰)</span>
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
                <span className="tracking-widest">出生地点 (城市/省份)</span>
              </label>
              <input
                type="text"
                placeholder="例如: 中国 浙江 杭州"
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
                  <span>算命推演中...</span>
                </>
              ) : (
                <>
                  <Moon className="w-5 h-5" />
                  <span>探寻真我命理</span>
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
          className="glass-panel p-8 md:p-12 rounded-3xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C5A059]/50 to-transparent" />
          
          <div className="text-center mb-8 text-[#C5A059]/60 font-serif border-b border-[#C5A059]/20 pb-8 tracking-widest uppercase">
            {date.replace(/-/g, '/')} {time} 生人
          </div>

          <div className="markdown-body">
            <ReactMarkdown>{report}</ReactMarkdown>
          </div>
          
          <div className="mt-12 pt-8 border-t border-[#C5A059]/20 flex justify-center">
            <button
              onClick={() => setReport('')}
              className="text-white/60 hover:text-[#C5A059] hover:underline underline-offset-4 transition-colors font-serif tracking-widest text-sm uppercase"
            >
              返回生辰重测
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
