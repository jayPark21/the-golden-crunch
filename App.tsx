
import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import Visualizer from './components/Visualizer';
import Section from './components/Section';
import { STORY_BEATS, COLORS } from './constants';
import './index.css';

const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 35,
    restDelta: 0.001
  });

  const [currentProgress, setCurrentProgress] = useState(0);

  useEffect(() => {
    return smoothProgress.onChange((latest) => {
      setCurrentProgress(latest);
    });
  }, [smoothProgress]);

  return (
    <div ref={containerRef} className="relative w-full" style={{ backgroundColor: COLORS.background }}>
      {/* Sticky Visualizer - 제품 이미지 시퀀스 엔진 */}
      <Visualizer scrollProgress={currentProgress} />

      {/* Scrollytelling Content Layers */}
      <div className="relative z-10">
        {STORY_BEATS.map((beat) => (
          <Section
            key={beat.id}
            headline={beat.headline}
            sub={beat.sub}
            progress={currentProgress}
            start={beat.range[0]}
            end={beat.range[1]}
          />
        ))}
      </div>

      {/* 최종 구매 버튼 */}
      {currentProgress > 0.9 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-12 left-0 right-0 z-50 flex justify-center"
        >
          <button
            className="group relative px-12 py-5 overflow-hidden rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
            onClick={() => alert("강원도 미식 상점으로 연결됩니다.")}
          >
            <div className="absolute inset-0 bg-[#FFB300] transition-transform duration-300 group-hover:scale-110" />
            <span className="relative text-black font-bold text-lg tracking-tight">갓 튀겨낸 배송 예약하기</span>
          </button>
        </motion.div>
      )}

      {/* 사이드 인디케이터 */}
      <div className="fixed right-10 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-50">
        {STORY_BEATS.map((beat, idx) => {
          const isActive = currentProgress >= beat.range[0] && currentProgress < beat.range[1];
          return (
            <div key={beat.id} className="flex items-center gap-4 group cursor-pointer">
              <span className={`text-[10px] uppercase tracking-[0.2em] font-bold transition-opacity duration-300 ${isActive ? 'opacity-100 text-[#FFB300]' : 'opacity-0'}`}>
                {String(idx + 1).padStart(2, '0')}
              </span>
              <div className={`w-1 transition-all duration-700 rounded-full ${isActive ? 'h-16 bg-[#FFB300]' : 'h-3 bg-white/10 group-hover:bg-white/30'}`} />
            </div>
          );
        })}
      </div>

      {/* 상단 네비게이션 */}
      <header className="fixed top-0 left-0 w-full p-10 flex justify-between items-end z-50 mix-blend-difference">
        <div className="flex flex-col">
          <h1 className="text-3xl font-premium tracking-tighter leading-none">GOLDEN CRUNCH</h1>
          <span className="text-[9px] uppercase tracking-[0.5em] text-[#FFB300] mt-1">Gangnaeng-i Engineering</span>
        </div>
        <nav className="hidden md:flex gap-12 text-[11px] uppercase tracking-[0.3em] font-bold">
          <a href="#" className="hover:text-[#FFB300] transition-colors">Origins</a>
          <a href="#" className="hover:text-[#FFB300] transition-colors">Process</a>
          <a href="#" className="hover:text-[#FFB300] transition-colors">Reserve</a>
        </nav>
      </header>

      {/* 스크롤 가이드 */}
      {currentProgress < 0.05 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4"
        >
          <span className="text-[10px] uppercase tracking-[0.5em] text-white/30 font-bold">스크롤하여 영상 탐험하기</span>
          <div className="w-[1px] h-16 bg-gradient-to-b from-[#FFB300] to-transparent animate-pulse" />
        </motion.div>
      )}
    </div>
  );
};

export default App;
