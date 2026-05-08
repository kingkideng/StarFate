import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import Home from './components/Home';
import Tarot from './components/Tarot';
import Astrology from './components/Astrology';
import Bazi from './components/Bazi';
import { type ModuleType } from './types';

function App() {
  const [currentModule, setCurrentModule] = useState<ModuleType>('home');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen relative font-sans text-white font-light selection:bg-[#d4af37]/30">
      {/* Dynamic Background */}
      <div className="atmosphere-bg" />
      
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 w-full px-6 md:px-12 flex justify-between items-end border-b border-white/10 ${
          isScrolled ? 'bg-[#050508]/90 backdrop-blur-md pt-6 pb-4' : 'bg-transparent pt-10 pb-6'
        }`}
      >
        <div 
          className="flex flex-col cursor-pointer group"
          onClick={() => setCurrentModule('home')}
        >
          <span className="text-[#C5A059] text-xs tracking-[0.4em] uppercase mb-1 font-sans">宇宙神谕</span>
          <h1 className="text-3xl md:text-4xl tracking-tight flex items-center gap-3 font-serif">
            <span className="font-light text-white tracking-widest uppercase">STARFATE</span>
          </h1>
        </div>
        
        {currentModule !== 'home' ? (
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setCurrentModule('home')}
              className="flex items-center space-x-2 text-[#C5A059] border-b border-[#C5A059] pb-1 hover:text-white transition-colors font-sans tracking-[0.2em] text-[10px] uppercase"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>返回</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-6 md:gap-10">
            <nav className="hidden md:flex gap-10 pb-1 font-sans text-xs uppercase tracking-widest text-white/50">
              <span className="text-[#C5A059] border-b border-[#C5A059] pb-1 cursor-default">主页</span>
              <span className="hover:text-white transition-colors cursor-default">塔罗</span>
              <span className="hover:text-white transition-colors cursor-default">星盘</span>
              <span className="hover:text-white transition-colors cursor-default">八字</span>
            </nav>
          </div>
        )}
      </motion.nav>

      {/* Main Content */}
      <main className="pt-32 min-h-screen">
        <AnimatePresence mode="wait">
          {currentModule === 'home' && <Home key="home" setModule={setCurrentModule} />}
          {currentModule === 'tarot' && <Tarot key="tarot" />}
          {currentModule === 'astrology' && <Astrology key="astrology" />}
          {currentModule === 'bazi' && <Bazi key="bazi" />}
        </AnimatePresence>
      </main>
      
      {/* Footer */}
      <footer className="w-full py-8 px-6 md:px-12 flex justify-between items-center bg-[#08080C] border-t border-white/5 mt-auto relative z-10">
        <div className="flex gap-4 md:gap-8 text-[10px] font-sans uppercase tracking-[0.3em] text-white/30 hidden sm:flex">
          <span>上升：天蝎</span>
          <span>月相：亏凸月</span>
          <span>AI 核心：活跃</span>
        </div>
        <div className="flex items-center gap-4 ml-auto">
          <div className="w-2 h-2 rounded-full bg-[#C5A059] shadow-[0_0_8px_#C5A059]"></div>
          <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-white/60">系统已上线</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
