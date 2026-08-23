import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  RotateCcw, 
  ArrowRight, 
  Award,
  AlertTriangle,
  Home,
  Check,
  X,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateQuiz } from '../utils/quizGenerator';

export default function QuizView({ databaseData, onQuizComplete, onReturnHome, initialItemToPractice = null }) {
  // Quiz Setup State
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [questionCount, setQuestionCount] = useState(10);
  const [isInstantFeedback, setIsInstantFeedback] = useState(true);

  // Active Quiz State
  const [quizState, setQuizState] = useState('setup'); // 'setup', 'active', 'results'
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { qIndex: selectedOption }
  const [timeRemainingSeconds, setTimeLimitSeconds] = useState(600);
  const [quizTitle, setQuizName] = useState('সকল বিষয়');
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Handle auto practice from single item
  useEffect(() => {
    if (initialItemToPractice) {
      // Start a 5-question quiz centered on or containing this item
      startCustomQuiz('all', 5);
    }
  }, [initialItemToPractice]);

  // Timer Countdown Effect
  useEffect(() => {
    if (quizState === 'active') {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setTimeLimitSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            finishQuiz(userAnswers); // Auto submit on timer expire
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizState]);

  const startCustomQuiz = (catKey, countVal) => {
    const generated = generateQuiz(databaseData, {
      category: catKey,
      count: countVal,
      timeLimitMinutes: countVal // Time limit in minutes equal to question count!
    });

    if (generated.questions.length === 0) {
      alert('পরীক্ষার জন্য পর্যাপ্ত প্রশ্ন প্রস্তুত করা যায়নি।');
      return;
    }

    setQuestions(generated.questions);
    setTimeLimitSeconds(generated.timeLimitSeconds);
    setQuizName(generated.categoryName);
    setCurrentQuestionIdx(0);
    setUserAnswers({});
    setQuizState('active');
  };

  const handleOptionSelect = (option) => {
    const updated = { ...userAnswers, [currentQuestionIdx]: option };
    setUserAnswers(updated);
  };

  const handleNext = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      finishQuiz(userAnswers);
    }
  };

  const finishQuiz = (finalAnswers) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const timeSpent = Math.max(1, Math.floor((Date.now() - (startTimeRef.current || Date.now())) / 1000));
    
    let rightCount = 0;
    let wrongCount = 0;
    const categoryBreakdown = {};

    const details = questions.map((q, idx) => {
      const uAns = finalAnswers[idx];
      const isCorrect = uAns === q.correctAnswer;
      if (isCorrect) rightCount++;
      else wrongCount++;

      const catKey = q.category;
      if (!categoryBreakdown[catKey]) {
        categoryBreakdown[catKey] = { right: 0, wrong: 0 };
      }
      if (isCorrect) categoryBreakdown[catKey].right++;
      else categoryBreakdown[catKey].wrong++;

      return {
        prompt: q.prompt,
        userAnswer: uAns || null,
        correctAnswer: q.correctAnswer,
        isCorrect,
        category: q.category,
        categoryName: q.categoryName
      };
    });

    const accuracy = questions.length > 0 ? Math.round((rightCount / questions.length) * 100) : 0;

    const result = {
      totalQuestions: questions.length,
      rightCount,
      wrongCount,
      accuracy,
      timeSpentSeconds: timeSpent,
      categoryName: quizTitle,
      categoryBreakdown,
      details
    };

    // Save result to stats
    onQuizComplete(result);

    // Trigger celebration confetti if accuracy >= 70%
    if (accuracy >= 70) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    setQuizState('results');
  };

  const formatBnNumber = (num) => {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/\d/g, (d) => bnDigits[d]);
  };

  const formatTime = (totalSec) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${formatBnNumber(m)} মি ${formatBnNumber(s < 10 ? '০' + s : s)} সে`;
  };

  // 1. SETUP SCREEN
  if (quizState === 'setup') {
    return (
      <div className="space-y-6 pb-24 pt-4 px-4 max-w-2xl mx-auto">
        
        {/* Setup Banner */}
        <div className="bg-gradient-to-br from-peach-100 via-cream-100 to-mint-100 p-6 rounded-2xl border border-peach-200 shadow-retro text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-peach-300 text-white flex items-center justify-center mx-auto shadow-retro border border-peach-400">
            <Zap className="w-8 h-8 fill-current" />
          </div>
          <h2 className="text-2xl font-bold text-warmcharcoal-300">
            অনলাইন বিহীন কুইজ পরীক্ষা
          </h2>
          <p className="text-xs text-warmcharcoal-200 max-w-md mx-auto">
            আপনার সুবিধামত বিষয়, প্রশ্নের সংখ্যা এবং সময় সীমা নির্ধারণ করে অটো-জেনারেটেড পরীক্ষায় অংশগ্রহণ করুন।
          </p>
        </div>

        {/* Configuration Card */}
        <div className="bg-cream-100 p-5 rounded-2xl border border-peach-200 shadow-retro space-y-5">
          
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold text-warmcharcoal-300 mb-2">
              ১. বিষয় নির্বাচন করুন:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`p-3 rounded-xl border text-left font-bold text-xs transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-peach-300 text-white border-peach-400 shadow-retro-sm scale-[1.02]'
                    : 'bg-cream-50 text-warmcharcoal-200 border-cream-300 hover:bg-peach-50'
                }`}
              >
                <div>সকল বিষয় অন্তর্ভুক্ত</div>
                <div className="text-[10px] font-normal opacity-90 mt-0.5">{formatBnNumber((databaseData.totalCount || 0).toLocaleString('en-US'))} টি প্রশ্ন থেকে র্যান্ডম</div>
              </button>

              {Object.entries(databaseData.categories).map(([catKey, catInfo]) => (
                <button
                  key={catKey}
                  onClick={() => setSelectedCategory(catKey)}
                  className={`p-3 rounded-xl border text-left font-bold text-xs transition-all ${
                    selectedCategory === catKey
                      ? 'bg-peach-300 text-white border-peach-400 shadow-retro-sm scale-[1.02]'
                      : 'bg-cream-50 text-warmcharcoal-200 border-cream-300 hover:bg-peach-50'
                  }`}
                >
                  <div>{catInfo.name}</div>
                  <div className="text-[10px] font-normal opacity-90 mt-0.5">{formatBnNumber(catInfo.count)} টি শব্দ</div>
                </button>
              ))}
            </div>
          </div>

          {/* Question Count & Time Limit Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-warmcharcoal-300">
                ২. প্রশ্নের সংখ্যা ও সময় সীমা:
              </label>
              <span className="text-[11px] font-bold text-peach-500 bg-peach-100 px-2.5 py-0.5 rounded-full border border-peach-200">
                {formatBnNumber(questionCount)} প্রশ্ন = {formatBnNumber(questionCount)} মিনিট
              </span>
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[5, 10, 15, 20, 25, 30].map((num) => (
                <button
                  key={num}
                  onClick={() => setQuestionCount(num)}
                  className={`flex-1 min-w-[50px] py-2.5 rounded-xl border font-bold text-xs transition-all ${
                    questionCount === num
                      ? 'bg-mint-400 text-white border-mint-500 shadow-retro-sm scale-105'
                      : 'bg-cream-50 text-warmcharcoal-200 border-cream-300 hover:bg-cream-200'
                  }`}
                >
                  {formatBnNumber(num)} টি
                </button>
              ))}
            </div>
            <p className="text-[11px] text-warmcharcoal-100 mt-1">
              * প্রতি প্রশ্নের জন্য ১ মিনিট সময় বরাদ্দ রাখা হয় ( e.g. {formatBnNumber(questionCount)} টি প্রশ্ন = {formatBnNumber(questionCount)} মিনিট সময় )
            </p>
          </div>

          {/* Instant Feedback Toggle */}
          <div className="pt-3 border-t border-cream-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-warmcharcoal-300">তাতক্ষণিক সঠিক উত্তর প্রদর্শন</div>
              <div className="text-[11px] text-warmcharcoal-100">অপশন সিলেক্ট করার সাথে সাথেই সঠিক/ভুল দেখাবে</div>
            </div>
            <button
              onClick={() => setIsInstantFeedback(!isInstantFeedback)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                isInstantFeedback ? 'bg-mint-400' : 'bg-cream-300'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                isInstantFeedback ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Start Button */}
          <button
            onClick={() => startCustomQuiz(selectedCategory, questionCount)}
            className="w-full py-3.5 bg-peach-400 hover:bg-peach-500 text-white font-bold text-base rounded-xl shadow-retro transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 border border-peach-500"
          >
            <Zap className="w-5 h-5 fill-current" />
            পরীক্ষা শুরু করুন
          </button>

        </div>

      </div>
    );
  }

  // 2. ACTIVE QUIZ SCREEN
  if (quizState === 'active') {
    const currentQuestion = questions[currentQuestionIdx];
    const selectedOption = userAnswers[currentQuestionIdx];
    const isAnswered = selectedOption !== undefined;
    const progressPct = ((currentQuestionIdx + 1) / questions.length) * 100;
    const isLowTime = timeRemainingSeconds < 60;

    return (
      <div className="space-y-4 pb-24 pt-4 px-4 max-w-2xl mx-auto">
        
        {/* Active Quiz Sticky Header */}
        <div className="bg-cream-100 p-4 rounded-2xl border border-peach-200 shadow-retro space-y-3">
          
          <div className="flex items-center justify-between">
            {/* Category & Counter */}
            <div>
              <span className="text-xs font-bold text-warmcharcoal-200 bg-peach-100 px-2.5 py-1 rounded-lg border border-peach-200">
                {currentQuestion.categoryName}
              </span>
              <div className="text-sm font-bold text-warmcharcoal-300 mt-1">
                প্রশ্ন {formatBnNumber(currentQuestionIdx + 1)} / {formatBnNumber(questions.length)}
              </div>
            </div>

            {/* Countdown Timer */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs border ${
              isLowTime 
                ? 'bg-peach-100 text-retrorose border-peach-300 animate-bounce' 
                : 'bg-mint-100 text-mint-500 border-mint-200'
            }`}>
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeRemainingSeconds)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-cream-300 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-peach-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>

        </div>

        {/* Question Card */}
        <div className="bg-cream-100 p-6 rounded-2xl border border-peach-200 shadow-retro space-y-5">
          <div className="text-base sm:text-lg font-bold text-warmcharcoal-300 leading-relaxed font-bengali">
            {currentQuestion.prompt}
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === option;
              const isCorrectOption = option === currentQuestion.correctAnswer;
              
              let btnStyle = 'bg-cream-50 text-warmcharcoal-300 border-cream-300 hover:bg-peach-50';

              if (isInstantFeedback && isAnswered) {
                if (isCorrectOption) {
                  btnStyle = 'bg-mint-100 text-mint-500 border-mint-400 font-bold';
                } else if (isSelected && !isCorrectOption) {
                  btnStyle = 'bg-peach-100 text-retrorose border-peach-400 font-bold';
                }
              } else if (isSelected) {
                btnStyle = 'bg-peach-300 text-white border-peach-400 font-bold shadow-retro-sm';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(option)}
                  className={`w-full p-4 rounded-xl border text-left font-medium text-sm transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-cream-200 text-warmcharcoal-200 text-xs font-bold flex items-center justify-center border border-cream-300 flex-shrink-0">
                      {['ক', 'খ', 'গ', 'ঘ'][idx]}
                    </span>
                    <span className="leading-snug">{option}</span>
                  </div>

                  {isInstantFeedback && isAnswered && (
                    <div>
                      {isCorrectOption && <Check className="w-5 h-5 text-mint-500" />}
                      {isSelected && !isCorrectOption && <X className="w-5 h-5 text-retrorose" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Navigation / Submit Button */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              onClick={() => finishQuiz(userAnswers)}
              className="px-3.5 py-2 text-xs text-warmcharcoal-200 hover:bg-cream-200 rounded-xl transition-colors font-medium"
            >
              পরীক্ষা সম্পন্ন করুন
            </button>

            <button
              disabled={!isAnswered}
              onClick={handleNext}
              className="px-6 py-2.5 bg-peach-400 hover:bg-peach-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-retro transition-all flex items-center gap-2 border border-peach-500"
            >
              {currentQuestionIdx < questions.length - 1 ? 'পরবর্তী প্রশ্ন' : 'ফলাফল দেখুন'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    );
  }

  // 3. RESULTS SCREEN
  if (quizState === 'results') {
    const totalQ = questions.length;
    let rightC = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswer) rightC++;
    });
    const accuracyPct = totalQ > 0 ? Math.round((rightC / totalQ) * 100) : 0;

    return (
      <div className="space-y-6 pb-24 pt-4 px-4 max-w-2xl mx-auto animate-in fade-in duration-300">
        
        {/* Results Banner Header */}
        <div className="bg-gradient-to-br from-peach-100 via-cream-100 to-mint-100 p-6 rounded-2xl border border-peach-200 shadow-retro text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-peach-200 text-peach-500 border border-peach-300 flex items-center justify-center mx-auto shadow-retro">
            <Trophy className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-warmcharcoal-300">
              {accuracyPct >= 80 ? 'অসাধারণ পারফরম্যান্স! 🏆' : accuracyPct >= 50 ? 'চমৎকার প্রচেষ্টা! 👍' : 'আরও অনুশীলন প্রয়োজন! 📚'}
            </h2>
            <p className="text-xs text-warmcharcoal-200 mt-1">
              কুইজের ফলাফল আপনার অফলাইন ড্যাশবোর্ডে সংরক্ষিত হয়েছে
            </p>
          </div>

          <div className="inline-block bg-cream-100 px-6 py-2.5 rounded-2xl border border-peach-200 shadow-retro-sm">
            <span className="text-3xl font-black text-warmcharcoal-300">{formatBnNumber(accuracyPct)}%</span>
            <span className="text-xs text-warmcharcoal-200 block">সঠিকতার হার</span>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-mint-50 p-3.5 rounded-2xl border border-mint-200">
            <div className="text-2xl font-bold text-mint-500">{formatBnNumber(rightC)}</div>
            <div className="text-xs text-warmcharcoal-200 mt-0.5">সঠিক উত্তর</div>
          </div>
          <div className="bg-peach-50 p-3.5 rounded-2xl border border-peach-200">
            <div className="text-2xl font-bold text-retrorose">{formatBnNumber(totalQ - rightC)}</div>
            <div className="text-xs text-warmcharcoal-200 mt-0.5">ভুল উত্তর</div>
          </div>
          <div className="bg-babyblue-50 p-3.5 rounded-2xl border border-babyblue-200">
            <div className="text-2xl font-bold text-warmcharcoal-300">{formatBnNumber(totalQ)}</div>
            <div className="text-xs text-warmcharcoal-200 mt-0.5">মোট প্রশ্ন</div>
          </div>
        </div>

        {/* Detailed Review List */}
        <div className="bg-cream-100 p-5 rounded-2xl border border-peach-200 shadow-retro space-y-4">
          <h3 className="font-bold text-warmcharcoal-300 text-sm flex items-center justify-between">
            <span>প্রশ্নোত্তর পর্যালোচনা</span>
            <span className="text-xs text-warmcharcoal-100 font-normal">
              {formatBnNumber(totalQ)} টির উত্তর
            </span>
          </h3>

          <div className="space-y-3">
            {questions.map((q, idx) => {
              const uAns = userAnswers[idx];
              const isCorrect = uAns === q.correctAnswer;

              return (
                <div 
                  key={idx}
                  className={`p-3.5 rounded-xl border space-y-2 text-xs ${
                    isCorrect ? 'bg-mint-50/80 border-mint-200' : 'bg-peach-50/80 border-peach-200'
                  }`}
                >
                  <div className="font-bold text-warmcharcoal-300 flex items-start gap-2">
                    <span className="text-warmcharcoal-200 font-bold">{formatBnNumber(idx + 1)}.</span>
                    <span className="leading-snug">{q.prompt}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[11px] pt-1 border-t border-black/5">
                    <span className={`px-2.5 py-0.5 rounded font-semibold ${
                      isCorrect ? 'bg-mint-200 text-mint-500' : 'bg-peach-200 text-retrorose'
                    }`}>
                      আপনার দেওয়া উত্তর: {uAns || 'উত্তর দেওয়া হয়নি'}
                    </span>
                    {!isCorrect && (
                      <span className="bg-mint-200 text-mint-500 px-2.5 py-0.5 rounded font-semibold">
                        সঠিক উত্তর: {q.correctAnswer}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => setQuizState('setup')}
            className="flex-1 py-3 bg-cream-200 hover:bg-cream-300 text-warmcharcoal-300 font-bold text-xs rounded-xl border border-cream-400 transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            পুনরায় পরীক্ষা দিন
          </button>

          <button
            onClick={onReturnHome}
            className="flex-1 py-3 bg-peach-400 hover:bg-peach-500 text-white font-bold text-xs rounded-xl shadow-retro transition-all border border-peach-500 flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            পরিসংখ্যান পাতায় যান
          </button>
        </div>

      </div>
    );
  }

  return null;
}
