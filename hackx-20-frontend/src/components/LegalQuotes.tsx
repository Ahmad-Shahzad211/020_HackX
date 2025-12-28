"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { quotes } from '@/data/constant';

export default function LegalQuotes() {
  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 10000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <div className="p-8 rounded-lg max-w-[80%]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuote}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-white text-xl font-serif mb-4 text-center">
              "{quotes[currentQuote].text}"
            </p>
            <p className="text-white text-lg font-serif text-center italic">
              - {quotes[currentQuote].author}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}