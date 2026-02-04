
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionProps } from '../types';
import { COLORS } from '../constants';

const Section: React.FC<SectionProps> = ({ headline, sub, progress, start, end }) => {
  const isVisible = progress >= start && progress < end;

  return (
    <div className="h-screen w-full flex flex-col justify-center items-center px-6 text-center">
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -30, filter: 'blur(10px)' }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl"
          >
            <motion.h2 
              className="text-6xl md:text-9xl font-premium mb-8 leading-tight tracking-tight"
              style={{ 
                color: COLORS.white, 
                textShadow: `0 0 35px ${COLORS.primary}33, 0 0 70px ${COLORS.primary}11` 
              }}
            >
              {headline}
            </motion.h2>
            <motion.p 
              className="text-lg md:text-2xl font-light tracking-widest max-w-2xl mx-auto uppercase"
              style={{ color: COLORS.accent, opacity: 0.8 }}
            >
              {sub}
            </motion.p>
            
            {/* Elegant Accent Line */}
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="h-px w-24 bg-[#FFB300] mx-auto mt-12 opacity-50"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Section;
