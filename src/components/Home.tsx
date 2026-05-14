import { motion } from 'motion/react';
import { type ModuleType } from '../types';

interface HomeProps {
  setModule: (m: ModuleType) => void;
}

export default function Home({ setModule }: HomeProps) {
  const cards = [
    {
      id: 'tarot',
      title: '塔罗牌',
      desc: '经典的韦特塔罗牌阵，探索你的直觉与精神指引。',
      btn: '探索塔罗',
      action: () => setModule('tarot'),
    },
    {
      id: 'astrology',
      title: '占星星盘',
      desc: '结合日月升核心配置，揭示你的宇宙烙印。',
      btn: '解析星盘',
      action: () => setModule('astrology'),
    },
    {
      id: 'bazi',
      title: '中国八字',
      desc: '通过四柱五行，推演命运的规律与轨迹。',
      btn: '计算命格',
      action: () => setModule('bazi'),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex flex-col justify-center min-h-[70vh] w-full max-w-6xl mx-auto"
    >
    <div className="max-w-3xl mb-10 md:mb-12 self-start">
        <h2 className="text-[18px] min-[375px]:text-[22px] md:text-3xl lg:text-5xl whitespace-nowrap font-light leading-tight mb-3 md:mb-4 text-white/90 font-serif tracking-widest">
          在星空与阴影中揭示宿命。
        </h2>
        <p className="text-sm md:text-lg font-sans text-white/40 max-w-xl font-light leading-relaxed">
          StarFate 融合了古老的神秘学传统与现代 AI。无需多言，一切早已在命运中书写。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full h-auto md:h-[340px]">
        {cards.map((card, idx) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 + idx * 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            onClick={card.action}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 flex flex-col justify-between cursor-pointer transition-all hover:bg-white/10 hover:border-[#C5A059]/40 min-h-[220px] md:min-h-[300px]"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 opacity-20 blur-3xl ${idx === 0 ? 'bg-[#3B2F63]' : idx === 1 ? 'bg-[#1A2A4E]' : 'bg-[#4E1A1A] opacity-10'}`}></div>
            
            <div className="z-10">
              {idx === 0 && (
                <div className="w-10 h-14 border-2 border-[#C5A059]/60 rounded-md mb-6 flex items-center justify-center">
                  <div className="w-6 h-10 border border-[#C5A059]/30 rounded-sm"></div>
                </div>
              )}
              {idx === 1 && (
                <div className="w-12 h-12 border-2 border-[#C5A059]/60 rounded-full mb-6 flex items-center justify-center">
                   <div className="w-8 h-[1px] bg-[#C5A059]/60 rotate-45"></div>
                   <div className="w-8 h-[1px] bg-[#C5A059]/60 -rotate-45 absolute"></div>
                </div>
              )}
              {idx === 2 && (
                <div className="w-12 h-12 flex flex-col gap-1 mb-6">
                  <div className="h-[2px] w-full bg-[#C5A059]/60"></div>
                  <div className="h-[2px] w-full bg-[#C5A059]/30"></div>
                  <div className="h-[2px] w-full bg-[#C5A059]/60"></div>
                </div>
              )}
              
              <h3 className="text-2xl font-serif font-medium mb-2">
                {card.title}
              </h3>
              <p className="font-sans text-sm text-white/40 font-light leading-relaxed">
                {card.desc}
              </p>
            </div>
            
            <div className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#C5A059] mt-8 group-hover:tracking-[0.3em] transition-all">
              {card.btn} &rarr;
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
