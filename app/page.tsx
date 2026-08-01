'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import QuizCard from '@/components/QuizCard';
import { questionsData } from '@/data/questions';
import { resultsData } from '@/data/results';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';

export interface CalculatedResult {
  id: string;
  title: string;
  description: string;
  image?: string;
  score: number;
  percentage: number;
}

const pageVariants = {
  initial: { opacity: 0, scale: 0.98, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.98, y: -10 },
};

const pageTransition = {
  duration: 0.45,
  ease: [0.25, 0.8, 0.25, 1] as const,
};

export default function Home() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'promotion' | 'result'>('start');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [topResults, setTopResults] = useState<CalculatedResult[]>([]);
  const [shuffledQuestions, setShuffledQuestions] = useState(questionsData);
  const [showImageModal, setShowImageModal] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const resultCardRef = useRef<HTMLDivElement>(null);
  const websiteUrl = 'https://your-love-type.vercel.app';

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (gameState === 'promotion' && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [gameState, countdown]);

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#FFC0CB', '#87CEFA', '#FFFACD', '#D8BFD8'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#FFC0CB', '#87CEFA', '#FFFACD', '#D8BFD8'],
      });
    }, 250);
  };

  const startGame = () => {
    const randomQuestions = [...questionsData].sort(() => Math.random() - 0.5);
    setShuffledQuestions(randomQuestions);
    setGameState('playing');
    setCurrentQuestionIndex(0);
    setScores({});
    setTopResults([]);
    setShowImageModal(null);
    setCountdown(5);
  };

  const resetToHome = () => {
    setGameState('start');
    setCurrentQuestionIndex(0);
    setScores({});
    setTopResults([]);
    setShowImageModal(null);
  };

  const handleAnswer = (weights: string[]) => {
    const newScores = { ...scores };
    weights.forEach((weight) => {
      newScores[weight] = (newScores[weight] || 0) + 1;
    });
    setScores(newScores);

    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateResult(newScores);
    }
  };

  const calculateResult = (finalScores: Record<string, number>) => {
    const totalScore = Object.values(finalScores).reduce((sum, score) => sum + score, 0);
    if (totalScore === 0) return;

    let calculated = Object.entries(finalScores).map(([id, score]) => {
      const exactPct = (score / totalScore) * 100;
      return {
        id,
        score,
        exactPct,
        roundedPct: Math.floor(exactPct),
      };
    });

    const sumRounded = calculated.reduce((sum, item) => sum + item.roundedPct, 0);
    const remainder = 100 - sumRounded;

    calculated.sort((a, b) => (b.exactPct - b.roundedPct) - (a.exactPct - a.roundedPct));

    for (let i = 0; i < remainder; i++) {
      if (calculated[i]) {
        calculated[i].roundedPct += 1;
      }
    }

    const finalResultsList: CalculatedResult[] = calculated.map((item) => ({
      ...resultsData[item.id],
      score: item.score,
      percentage: item.roundedPct,
    }));

    finalResultsList.sort((a, b) => b.score - a.score);

    setTopResults(finalResultsList.slice(0, 3));
    setGameState('promotion');
  };

  const handleShowResult = () => {
    if (countdown > 0) return;
    setGameState('result');
    triggerConfetti();
  };

  const saveImageAndShareIG = useCallback(async () => {
  if (!resultCardRef.current) return;

  setIsGenerating(true);

  try {
    await document.fonts.ready;

    const images = Array.from(
      resultCardRef.current.querySelectorAll("img")
    );

    await Promise.all(
      images.map((img) => {
        if (img.complete && img.naturalWidth > 0) {
          return Promise.resolve();
        }

        return new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      })
    );

    const dataUrl = await toPng(resultCardRef.current, {
      cacheBust: true,
      pixelRatio: 3,
      backgroundColor: "#FFF0F5",
    });

    const link = document.createElement("a");
    link.download = `my-love-type-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();

  } catch (err) {
    console.error(err);
    alert("ไม่สามารถบันทึกรูปภาพได้");
  } finally {
    setIsGenerating(false);
  }
}, []);

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(websiteUrl)}`, '_blank');
  };

  const shareX = () => {
    if (topResults.length === 0) return;
    const text = `ลึก ๆ แล้วฉันแพ้คน Type: ${topResults[0].title} (${topResults[0].percentage}%)\nมาค้นหาสเปกที่ซ่อนอยู่ของคุณได้ที่นี่เลย!`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(websiteUrl)}`, '_blank');
  };

  const imageBackground =
    "min-h-screen bg-[url('/images/bg.png')] bg-cover bg-center bg-fixed bg-no-repeat flex flex-col items-center justify-center p-4 sm:p-6 font-mali overflow-hidden";

  return (
    <main className={imageBackground}>
      <AnimatePresence mode="wait">
        <motion.div
          key={gameState}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
          className="w-full flex flex-col items-center"
        >
         {gameState === 'start' && (
            <div className="flex items-center justify-center p-4 relative overflow-hidden w-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="bg-white/95 backdrop-blur-sm rounded-[32px] md:rounded-[40px] shadow-[0_15px_40px_rgba(255,182,193,0.3)] max-w-4xl w-full px-6 pt-10 pb-6 md:pt-16 md:pb-8 relative z-10 flex flex-col items-center border border-[#fff0f3]"
              >
                <h2 className="text-2xl sm:text-3xl md:text-5xl text-gray-700 font-bold mb-2 md:mb-4 tracking-wide text-center">
                  ลึก ๆ แล้ว...
                </h2>

                <h1 className="text-4xl sm:text-5xl md:text-6xl text-gray-700 font-bold mb-8 md:mb-10 tracking-wide text-center leading-tight">
                  คุณแพ้คน <span className="text-[#ff748e]">Type</span> ไหน?
                </h1>

                <div className="bg-[#fef0f3] text-[#ff748e] rounded-full px-5 py-2 md:px-8 md:py-3 flex items-center justify-center gap-2 mb-8 md:mb-12 text-sm sm:text-base md:text-xl font-medium text-center leading-relaxed w-[95%] md:w-auto">
                  <span>♥</span>
                  มาไขคำตอบเรื่องราวความรักของคุณได้ที่นี่
                  <span>♥</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-dashed divide-gray-300 w-full mb-8 md:mb-10 px-2 md:px-8 gap-y-4 md:gap-y-0">
                  <div className="flex flex-col items-center justify-center text-center gap-1 md:gap-2 px-4 py-3 md:py-0">
                    <p className="text-gray-500 text-sm md:text-lg font-medium">
                      คุณชอบคนแบบไหน
                    </p>
                    <p className="text-[#ff748e] font-semibold text-sm md:text-lg">
                      สเปคแบบไหนที่คุณถูกใจ
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center text-center gap-1 md:gap-2 px-4 py-3 md:py-0">
                    <p className="text-gray-500 text-sm md:text-lg font-medium">
                      หาคำตอบพร้อมกันได้ที่นี่
                    </p>
                    <p className="text-[#ff748e] font-semibold text-sm md:text-lg">
                      คำถามสั้น ๆ วัดใจคุณ
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center text-center gap-1 md:gap-2 px-4 py-3 md:py-0">
                    <p className="text-gray-500 text-sm md:text-lg font-medium">
                      แชร์ให้โลกรู้ว่า
                    </p>
                    <p className="text-[#ff748e] font-semibold text-sm md:text-lg">
                      คุณชอบคนแบบไหน
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="bg-[#ff8fa3] hover:bg-[#ff7e9a] transition-colors text-white rounded-[2rem] py-4 md:py-5 px-12 md:px-16 text-xl md:text-3xl font-bold shadow-[0_8px_20px_rgba(255,143,163,0.4)] flex items-center justify-center gap-2 w-[90%] sm:w-[80%] md:w-auto"
                >
                  เริ่มเล่นเลย
                  <span className="text-2xl md:text-3xl leading-none">›</span>
                </motion.button>

                <div className="flex items-center gap-2 mt-4 md:mt-5 text-gray-400 text-sm md:text-xl font-medium">
                  Presented By CupidBox
                </div>
              </motion.div>
            </div>
          )}

          {gameState === 'playing' && shuffledQuestions.length > 0 && (
            <motion.div
              key={`question-${currentQuestionIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full flex flex-col items-center px-4"
            >
              <div className="bg-white/90 backdrop-blur-sm px-5 py-2 rounded-full shadow-sm text-[#ff748e] font-bold text-sm md:text-base mb-4 border border-[#ffe0e8]">
                ข้อที่ {currentQuestionIndex + 1} / {shuffledQuestions.length}
              </div>

              <QuizCard
                question={shuffledQuestions[currentQuestionIndex]}
                options={(shuffledQuestions[currentQuestionIndex] as any).options}
                onAnswer={handleAnswer}
              />
            </motion.div>
          )}

          {gameState === 'promotion' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="w-full max-w-md px-4"
            >
              <div className="bg-white/95 backdrop-blur-sm p-2 rounded-[2rem] shadow-[0_20px_50px_rgba(255,192,203,0.4)] relative mt-6">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#ff748e] text-white px-5 py-1.5 rounded-full text-sm font-bold shadow-md flex items-center gap-2 whitespace-nowrap z-10">
                  ข้อความลับก่อนดูผลลัพธ์
                </div>

                <div className="border-2 border-dashed border-[#ffb6c1] rounded-[1.5rem] p-6 pt-10 flex flex-col items-center bg-gradient-to-b from-white/50 to-[#fff0f5]/80 relative overflow-hidden">
                  <h2 className="text-xl md:text-2xl font-extrabold text-[#2C3E50] mb-1 text-center leading-tight tracking-wide">
                    ก่อนจะไปรู้ใจตัวเอง...
                  </h2>
                  <h3 className="text-sm md:text-base text-[#ff748e] font-bold mb-6 text-center">
                    มีใครรอให้คุณบอกความในใจอยู่หรือเปล่า?
                  </h3>

                  <div className="w-full bg-white rounded-2xl p-5 shadow-sm border border-[#ffe0e8] mb-6 relative">
                    <p className="text-gray-600 text-center text-sm md:text-base leading-relaxed font-medium mb-4">
                      ส่งต่อความรู้สึกผ่าน <br />
                      <strong className="text-[#ff748e] text-lg">เว็บไซต์ส่วนตัว</strong> ที่มีชิ้นเดียวในโลก<br />
                    </p>

                    <div className="bg-[#fff9fa] rounded-xl p-3 md:p-4 border border-[#ffe0e8] mb-5">
                      <p className="text-center text-sm font-bold text-[#ff748e] mb-3">
                        ออกแบบความในใจได้ทุกโอกาส
                      </p>
                      
                      <div className="flex flex-wrap justify-center gap-2 mb-3">
                        {['ง้อแฟน', 'วันครบรอบ', 'สารภาพรัก', 'การ์ดวันเกิด', 'รวบรวมข้อความให้ศิลปิน', 'สมุด Friendship', 'Customize Website'].map((tag, idx) => (
                          <span key={idx} className="bg-white text-[#ff748e] text-[11px] md:text-xs font-bold px-3 py-1.5 rounded-lg border border-[#ffb6c1] shadow-sm">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="text-center mt-3 border-t border-[#ffe0e8] pt-3">
                        <p className="text-[10px] md:text-xs text-gray-600 font-medium leading-relaxed mb-1">
                          เพื่อน แฟน ครอบครัว ศิลปินที่คุณชอบ และคนสำคัญในชีวิตคุณ สามารถส่งเป็นของขวัญให้ได้ทุกโอกาส ข้อมูลทั้งหมดจะเป็นความลับ 
                        </p>
                        <p className="text-[10px] md:text-xs text-[#ff748e] font-bold">
                          สามารถเลือกแบบที่คุณชอบได้เอง Customize เฉพาะคุณ
                        </p>
                      </div>
                    </div>

                    <div className="text-center mt-2">
                      <span className="inline-block bg-[#ff748e] text-white text-lg font-black px-6 py-2 rounded-full transform -rotate-2 shadow-md">
                        เริ่มต้นเพียง 199 บาทเท่านั้น
                      </span>
                    </div>
                  </div>

                  <div className=" mt-2 mb-6 w-full">
                    <p className="text-center text-md text-[#ff748e] mb-3 font-bold">
                      ดูตัวอย่างผลงานและสามารถติดต่อเราได้ที่
                    </p>

                    <div className="text-left w-full rounded-2xl border border-[#ffb6c1] bg-white p-4 shadow-sm flex items-center gap-5">
                      <div className="w-16 h-16 shrink-0 rounded-xl border border-dashed border-[#ffb6c1] bg-[#fef0f3] flex items-center justify-center overflow-hidden">
                        <img 
                          src="/images/QRCode-line.png" 
                          alt="Line QR Code" 
                          className="w-full h-full object-contain p-1" 
                        />
                      </div>

                      <div className="flex flex-col gap-2 flex-1 text-[11px] md:text-xs font-bold text-[#000000]">
                        <a href="https://lin.ee/WTXE1mZ" className="hover:text-[#DD2A7B] transition-colors">
                          Line Official: @840rxoyq  (มี @ ทุกครั้ง)
                        </a>
                        <a href="https://www.instagram.com/cupidbox.official/" className="hover:text-[#DD2A7B] transition-colors">
                          IG : cupidbox.official
                        </a>
                        <a href="https://www.tiktok.com/@cupidbox.official" className="hover:text-[#DD2A7B] transition-colors">
                          TikTok : cupidbox official
                        </a>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    disabled={countdown > 0}
                    whileHover={countdown === 0 ? { scale: 1.02 } : {}}
                    whileTap={countdown === 0 ? { scale: 0.98 } : {}}
                    onClick={handleShowResult}
                    className={`w-full rounded-2xl py-4 text-base md:text-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                      countdown > 0
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-300'
                        : 'bg-[#ff748e] text-white shadow-[0_6px_0_#d85a72] active:shadow-[0_0px_0_#d85a72] active:translate-y-[6px]'
                    }`}
                  >
                    {countdown > 0 ? `กำลังประมวลผลลัพธ์... (${countdown})` : <>ดูผลลัพธ์สเปกของคุณ</>}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'result' && topResults.length > 0 && (() => {
            const top1 = topResults[0];
            const runnersUp = topResults.slice(1);

            return (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full flex justify-center"
                >
                  <div
                    ref={resultCardRef}
                    className="p-4 sm:p-6 w-full max-w-lg h-fit flex flex-col items-center bg-gradient-to-br from-[#ffe0e8] to-[#FFF0F5] rounded-[3rem] overflow-hidden"
                  >
                    <div className="bg-white rounded-[2.5rem] shadow-[0_0_0_4px_rgba(255,255,255,1),0_15px_30px_rgba(255,192,203,0.3)] p-5 md:p-6 w-full h-fit text-center overflow-hidden">
                      <h2 className="text-lg md:text-xl font-semibold text-slate-400 mb-2 tracking-wide">
                        สเปกที่คุณอาจไม่รู้ตัวคือ...
                      </h2>

                      <h1 className="text-4xl md:text-5xl font-extrabold text-[#ff748e] mb-4 drop-shadow-sm">
                        {top1.title}
                      </h1>

                      <div className="flex justify-center -mt-2 mb-6">
                        <div className="relative w-80 h-80 flex items-center justify-center">
                          <div
                            className="absolute w-72 h-72 rounded-full blur-[70px]"
                            style={{
                              background: `radial-gradient(circle,
                                ${top1.glowColor ?? "#DCEEFF"} 0%,
                                rgba(255,255,255,0.55) 55%,
                                rgba(255,255,255,0) 100%)`,
                            }}
                          />

                          <div
                            className="absolute w-56 h-56 rounded-full blur-3xl opacity-90"
                            style={{
                              background: `radial-gradient(circle,
                                rgba(255,255,255,0.95) 0%,
                                ${top1.glowColor ?? "#DCEEFF"}80 60%,
                                transparent 100%)`,
                            }}
                          />

                          {/* ลบขอบสีขาวออกโดยเอา border-4 border-white ออก */}
                          <img
                            src={top1.image}
                            alt={top1.title}
                            className="relative z-10 w-64 h-64 md:w-72 md:h-72 object-cover rounded-full drop-shadow-[0_15px_30px_rgba(0,0,0,0.15)]"
                          />
                        </div>
                      </div>

                      {(() => {
                        const parts = top1.description.split('\n\n');
                        const mainDesc = parts[0];
                        const tags = parts.length > 1 ? parts[1] : null;

                        return (
                          <div className="w-full flex flex-col items-center gap-3">
                            <div className="bg-gradient-to-br from-[#fff9fa] to-[#FFF0F5] rounded-[2rem] p-4 text-center border-2 border-dashed border-[#FFC0CB] flex flex-col items-center gap-3 w-full">
                              <p className="text-xs sm:text-sm md:text-base text-[#2C3E50] whitespace-pre-line leading-7 sm:leading-8 font-medium px-2">
                                {mainDesc}
                              </p>
                              {tags && (
                                <div className="bg-white px-5 py-1.5 rounded-full border border-[#FFC0CB] shadow-sm">
                                  <p className="text-[#ff748e] font-bold text-sm tracking-wide">
                                    {tags}
                                  </p>
                                </div>
                              )}
                            </div>

                            {runnersUp.length > 0 && (
                              <div className="w-full mt-2 flex flex-col items-center">
                                <hr className="w-full border-t border-gray-200 mb-3" />
                                <h3 className="text-sm md:text-base text-gray-500 font-bold mb-3 text-center">
                                  สเปกที่โดนใจรองลงมา
                                </h3>

                                <div className="flex justify-center items-start gap-8 md:gap-10">
                                  {runnersUp.map((res) => (
                                    <div key={res.id} className="flex flex-col items-center">
                                      {res.image ? (
                                        /* ลบขอบสีขาวออกจากรูปรองเช่นกันโดยเอา border-2 border-white ออก */
                                        <img
                                          src={res.image}
                                          alt={res.title}
                                          className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-full mb-2 drop-shadow-sm transition-transform hover:scale-105"
                                          onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                          }}
                                        />
                                      ) : (
                                        <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-50 border-2 border-dashed border-slate-300 rounded-full flex flex-col items-center justify-center mb-2 text-slate-400">
                                          <svg className="w-6 h-6 mb-1 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                          </svg>
                                          <span className="text-[10px] md:text-xs font-medium">รูปตรงนี้</span>
                                        </div>
                                      )}
                                      <span className="text-gray-700 font-bold text-xs md:text-sm text-center leading-tight">
                                        {res.title}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="mt-2 md:mt-3 w-full flex justify-center">
                              <img
                                src="/images/cupidbox-logo.png"
                                alt="Cupid Box"
                                className="w-[120px] md:w-[200px] h-auto opacity-80 object-contain"
                              />
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </motion.div>

                <div className="w-full max-w-lg flex flex-col gap-4 px-4 mt-4">
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={shareFacebook}
                      className="bg-[#1877F2] text-white font-bold py-3 md:py-4 rounded-2xl border-b-4 border-[#165BC0] active:border-b-0 active:translate-y-1 transition-all text-sm shadow-md"
                    >
                      FB Share
                    </button>
                    <button
                      onClick={shareX}
                      className="bg-slate-800 text-white font-bold py-3 md:py-4 rounded-2xl border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 transition-all text-sm shadow-md"
                    >
                      X Post
                    </button>
                    <button
                      onClick={saveImageAndShareIG}
                      disabled={isGenerating}
                      className={`${isGenerating ? 'opacity-70 cursor-not-allowed' : ''} bg-gradient-to-r from-[#F58529] via-[#ff748e] to-[#8134AF] text-white font-bold py-3 md:py-4 rounded-2xl border-b-4 border-[#8134AF] active:border-b-0 active:translate-y-1 transition-all text-sm shadow-md`}
                    >
                      {isGenerating ? 'กำลังโหลด...' : 'Save Image'}
                    </button>
                  </div>

                  <button
                    onClick={resetToHome}
                    className="w-full bg-white/95 backdrop-blur-sm text-[#ff748e] border-2 border-[#ff748e] border-b-4 active:border-b-2 active:translate-y-1 font-bold py-4 px-8 rounded-2xl text-xl transition-all mt-2 mb-8 md:mb-0 shadow-lg"
                  >
                    เล่นอีกครั้ง
                  </button>
                </div>

                {showImageModal && (
                  <div className="fixed inset-0 bg-black/60 z-50 flex flex-col items-center justify-center p-6 backdrop-blur-md">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="w-full max-w-md flex flex-col items-center"
                    >
                      <p className="text-white font-medium text-lg md:text-xl mb-6 text-center bg-black/40 px-6 py-2 rounded-full">
                        ดาวน์โหลดเรียบร้อย! <br />
                        <span className="text-sm">(หากไม่พบรูป แตะค้างที่รูปเพื่อบันทึก)</span>
                      </p>

                      <img
                        src={showImageModal}
                        alt="Your Result"
                        className="w-full rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] mb-8 pointer-events-auto border-4 border-white/20"
                      />

                      <button
                        onClick={() => setShowImageModal(null)}
                        className="bg-white text-[#2C3E50] font-bold py-4 px-12 rounded-full shadow-lg active:scale-95 transition-all text-lg"
                      >
                        ปิดหน้าต่าง
                      </button>
                    </motion.div>
                  </div>
                )}
              </>
            );
          })()}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}