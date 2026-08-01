'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface OptionData {
  text: string;
  weights: string[];
}

interface QuestionData {
  id: number;
  text: string;
}

interface QuizCardProps {
  question: QuestionData;
  options: OptionData[];
  onAnswer: (weights: string[]) => void;
}

export default function QuizCard({ question, options, onAnswer }: QuizCardProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        // ปรับ padding ให้เล็กบนมือถือ (p-6)
        className="w-full max-w-md bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 md:p-8 text-center"
      >
        <h2 className="text-xl md:text-2xl font-bold text-cute-dark mb-6 md:mb-8 leading-relaxed">
          {question.text}
        </h2>
        
        <div className="space-y-3 md:space-y-4">
          {options.map((option, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
              onClick={() => onAnswer(option.weights)}
              // ปรับตัวหนังสือและช่องว่างให้กดง่ายบนมือถือ พร้อมแก้สี Hover เป็นสีชมพู
              className="w-full p-3 md:p-4 rounded-2xl bg-slate-50 text-cute-dark font-medium text-base md:text-lg border-2 border-transparent hover:bg-[#FFF0F5] hover:border-[#FFB6C1] hover:text-[#ff748e] transition-all duration-200"
            >
              {option.text}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}