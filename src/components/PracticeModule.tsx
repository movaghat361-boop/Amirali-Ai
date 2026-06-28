import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  GraduationCap,
  Sparkles,
  Zap,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  BookOpen,
} from "lucide-react";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export default function PracticeModule() {
  const [subject, setSubject] = useState<"algebra" | "calculus" | "trig" | "geometry" | "stats">("algebra");
  const [grade, setGrade] = useState<"primary" | "junior" | "high" | "university">("high");
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [streak, setStreak] = useState(0);

  // Dynamic question pool generator
  const generateQuestions = (sub: string, gr: string): Question[] => {
    const qList: Question[] = [];

    // Helper to generate random integers
    const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

    if (sub === "algebra") {
      if (gr === "primary") {
        for (let i = 0; i < 3; i++) {
          const x = rand(2, 15);
          const y = rand(3, 10);
          const ans = x * y;
          qList.push({
            id: `alg-p-${i}`,
            question: `اگر حاصل‌ضرب عدد $x$ در $${y}$ برابر با $${ans}$ باشد، مقدار مجهول $x$ چقدر است؟`,
            options: [`${x}`, `${x + 2}`, `${x - 1}`, `${Math.floor(ans / 2)}`],
            correctIndex: 0,
            explanation: `حل معادله خطی ساده: $${y}x = ${ans} \\implies x = \\frac{${ans}}{${y}} = ${x}$ است.`,
          });
        }
      } else if (gr === "junior") {
        for (let i = 0; i < 3; i++) {
          const x = rand(2, 6);
          const b = rand(1, 10);
          const c = rand(15, 30);
          const ans = x * b + c; // x*b + c = ans
          // equation is: b * x + c = ans
          qList.push({
            id: `alg-j-${i}`,
            question: `معادله خطی مقابل را حل کنید: $${b}x + ${c} = ${ans}$`,
            options: [`x = ${x}`, `x = ${x + 1}`, `x = ${x - 2}`, `x = ${Math.floor(ans / b)}`],
            correctIndex: 0,
            explanation: `روند حل: ابتدا عدد ثابت را انتقال می‌دهیم: $${b}x = ${ans} - ${c} \\implies ${b}x = ${ans - c} \\implies x = \\frac{${ans - c}}{${b}} = ${x}$`,
          });
        }
      } else {
        // High school & University algebra (Quadratic, logs, etc.)
        const r1 = rand(1, 4);
        const r2 = rand(2, 5);
        const b = -(r1 + r2);
        const c = r1 * r2;
        qList.push({
          id: "alg-h-1",
          question: `ریشه‌های حقیقی معادله درجه دوم $x^2 ${b >= 0 ? "+" + b : b}x + ${c} = 0$ کدامند؟`,
          options: [
            `x = ${r1} و x = ${r2}`,
            `x = ${-r1} و x = ${-r2}`,
            `x = ${r1 + 1} و x = ${r2 - 1}`,
            `معادله فاقد ریشه حقیقی است`,
          ],
          correctIndex: 0,
          explanation: `تجزیه جمله مشترک: معادله به صورت $(x - ${r1})(x - ${r2}) = 0$ تجزیه می‌شود. بنابراین ریشه‌ها $x = ${r1}$ و $x = ${r2}$ هستند.`,
        });

        qList.push({
          id: "alg-h-2",
          question: `حاصل عبارت لگاریتمی مقابل چیست؟ $\\log_2(32) + \\log_3(27)$`,
          options: [`8`, `5`, `9`, `15`],
          correctIndex: 0,
          explanation: `محاسبه تک‌تک لگاریتم‌ها: $\\log_2(32) = 5$ (چون $2^5 = 32$) و $\\log_3(27) = 3$ (چون $3^3 = 27$). حاصل‌جمع برابر است با $5 + 3 = 8$`,
        });

        qList.push({
          id: "alg-h-3",
          question: `اگر جمله سوم یک دنباله هندسی $12$ و جمله ششم آن $96$ باشد، قدر نسبت دنباله کدام است؟`,
          options: [`2`, `3`, `1.5`, `4`],
          correctIndex: 0,
          explanation: `فرمول دنباله هندسی: $a_6 = a_3 \\cdot q^3 \\implies 96 = 12 \\cdot q^3 \\implies q^3 = 8 \\implies q = 2$`,
        });
      }
    } else if (sub === "calculus") {
      qList.push({
        id: "calc-1",
        question: `حاصل حد مقابل در بی‌نهایت چقدر است؟ $\\lim_{x \\to \\infty} \\frac{3x^2 - 5x + 1}{2x^2 + 7}$`,
        options: [`3/2`, `무한대 (بی‌نهایت)`, `0`, `3`],
        correctIndex: 0,
        explanation: `در محاسبه حد در بی‌نهایت کسرهای چندجمله‌ای، نسبت بزرگترین توان‌های صورت و مخرج پاسخ نهایی است: $\\frac{3x^2}{2x^2} = \\frac{3}{2}$.`,
      });
      qList.push({
        id: "calc-2",
        question: `مشتق مرتبه اول تابع $f(x) = x^3 - 4x + 5$ در نقطه $x = 2$ چقدر است؟`,
        options: [`8`, `12`, `4`, `0`],
        correctIndex: 0,
        explanation: `فرمول مشتق: $f'(x) = 3x^2 - 4$. مقدار در نقطه $x = 2$ برابر است با $f'(2) = 3(2)^2 - 4 = 12 - 4 = 8$.`,
      });
      qList.push({
        id: "calc-3",
        question: `حاصل انتگرال معین مقابل چیست؟ $\\int_{1}^{3} (2x) dx$`,
        options: [`8`, `6`, `9`, `4`],
        correctIndex: 0,
        explanation: `پادمشتق $2x$ برابر است با $x^2$. طبق قضیه اساسی حساب دیفرانسیل: $[x^2]_1^3 = 3^2 - 1^2 = 9 - 1 = 8$.`,
      });
    } else if (sub === "trig") {
      qList.push({
        id: "trig-1",
        question: `ساده‌ترین مقدار عبارت مثلثاتی مقابل چیست؟ $\\sin^2(35^\\circ) + \\cos^2(35^\\circ)$`,
        options: [`1`, `0`, `2\\sin(35)`, `0.5`],
        correctIndex: 0,
        explanation: `طبق اتحاد اصلی مثلثات، برای هر زاویه ای مانند $\\theta$ همواره داریم: $\\sin^2(\\theta) + \\cos^2(\\theta) = 1$.`,
      });
      qList.push({
        id: "trig-2",
        question: `مقدار عددی دقیق $\\sin(150^\\circ)$ برابر کدام گزینه است؟`,
        options: [`1/2`, `-\\sqrt{3}/2`, `\\sqrt{2}/2`, `1`],
        correctIndex: 0,
        explanation: `کاهش زاویه به ربع اول: $\\sin(150^\\circ) = \\sin(180^\\circ - 30^\\circ) = \\sin(30^\\circ) = \\frac{1}{2}$ است.`,
      });
      qList.push({
        id: "trig-3",
        question: `اگر $\\tan(\\theta) = 3/4$ و زاویه در ربع اول باشد، مقدار $\\cos(\\theta)$ چقدر است؟`,
        options: [`4/5`, `3/5`, `5/4`, `3/4`],
        correctIndex: 0,
        explanation: `نسبت‌های مثلثاتی: در یک مثلث قائم‌الزاویه با اضلاع ۳ و ۴، وتر برابر ۵ است. بنابراین $\\cos(\\theta) = \\frac{\\text{مجاور}}{\\text{وتر}} = \\frac{4}{5}$ است.`,
      });
    } else if (sub === "geometry") {
      qList.push({
        id: "geom-1",
        question: `در یک مثلث قائم‌الزاویه، اگر طول اضلاع زاویه قائمه $6$ و $8$ سانتی‌متر باشند، طول وتر چقدر است؟`,
        options: [`10`, `12`, `14`, `11`],
        correctIndex: 0,
        explanation: `طبق رابطه فیثاغورس: $c^2 = a^2 + b^2 = 6^2 + 8^2 = 36 + 64 = 100 \\implies c = \\sqrt{100} = 10$ سانتی‌متر.`,
      });
      qList.push({
        id: "geom-2",
        question: `مجموع زوایای داخلی یک پنج‌ضلعی منتظم چند درجه است؟`,
        options: [`540`, `360`, `720`, `180`],
        correctIndex: 0,
        explanation: `فرمول مجموع زوایای داخلی: $(n - 2) \\times 180^\\circ$. برای $n = 5$ داریم: $(5 - 2) \\times 180 = 3 \\times 180 = 540^\\circ$.`,
      });
      qList.push({
        id: "geom-3",
        question: `اگر قطر یک دایره برابر با $10$ باشد، مساحت تقریبی آن چقدر است؟ (عدد پی را ۳ در نظر بگیرید)`,
        options: [`75`, `100`, `30`, `300`],
        correctIndex: 0,
        explanation: `مساحت دایره: شعاع برابر نصف قطر یعنی $r = 5$ است. مساحت $S = \\pi r^2 \\approx 3 \\times 5^2 = 75$ است.`,
      });
    } else {
      // stats
      qList.push({
        id: "stat-1",
        question: `میانگین داده‌های آماری $[10, 12, 14, 16, 18]$ چقدر است؟`,
        options: [`14`, `13`, `15`, `12`],
        correctIndex: 0,
        explanation: `محاسبه میانگین: مجموع داده‌ها برابر $70$ است. تقسیم بر تعداد کل یعنی $5$ پاسخ $14$ را می‌دهد.`,
      });
      qList.push({
        id: "stat-2",
        question: `در پرتاب یک تاس سالم، احتمال وقوع عددی زوج و بزرگتر از ۲ چقدر است؟`,
        options: [`1/3`, `1/2`, `2/3`, `1/6`],
        correctIndex: 0,
        explanation: `اعداد تاس $[1,2,3,4,5,6]$ هستند. اعداد زوج و بزرگتر از ۲ عبارتند از: $4$ و $6$ (۲ مورد). بنابراین احتمال برابر با $\\frac{2}{6} = \\frac{1}{3}$ است.`,
      });
      qList.push({
        id: "stat-3",
        question: `اگر انحراف معیار یک توزیع داده برابر با $5$ باشد، واریانس آن چقدر است؟`,
        options: [`25`, `5`, `10`, `50`],
        correctIndex: 0,
        explanation: `رابطه واریانس و انحراف معیار: واریانس مجذور انحراف معیار است: $\\sigma^2 = 5^2 = 25$`,
      });
    }

    // fallback fill
    if (qList.length === 0) {
      qList.push({
        id: "fallback",
        question: "آیا $2 + 2 \\times 2$ برابر با ۶ است؟",
        options: ["بله، تقدم ضرب رعایت می‌شود", "خیر، حاصل ۸ است", "بستگی دارد", "هیچکدام"],
        correctIndex: 0,
        explanation: "اول تقدم با ضرب است: $2 + (2 \\times 2) = 2 + 4 = 6$",
      });
    }

    return qList;
  };

  const startQuiz = () => {
    const generated = generateQuestions(subject, grade);
    setQuestions(generated);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsQuizActive(true);
  };

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
  };

  const checkAnswer = () => {
    if (selectedOption === null || isAnswered) return;
    
    setIsAnswered(true);
    const correct = selectedOption === questions[currentQuestionIndex].correctIndex;
    if (correct) {
      setScore(score + 1);
      setStreak(streak + 1);
    } else {
      setStreak(0);
    }
  };

  const nextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Quiz completed!
    }
  };

  const resetQuiz = () => {
    setIsQuizActive(false);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
  };

  return (
    <div className="space-y-4" dir="rtl">
      {!isQuizActive ? (
        <div className="space-y-4 text-right">
          {/* Practice Config Card */}
          <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-3xs space-y-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-3.5 rounded-xl text-white space-y-1">
              <h4 className="text-xs font-black flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-blue-200 animate-pulse" />
                <span>آزمون‌ساز تعاملی و تمرین خودارزیابی</span>
              </h4>
              <p className="text-[10px] text-blue-100 leading-normal font-medium">
                مبحث و پایه تحصیلی مورد نظر خود را انتخاب کرده تا آزمون تستی هوشمندی به همراه تحلیل بلافاصله آغاز شود.
              </p>
            </div>

            {/* Subject Selector */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-gray-400 block">انتخاب مبحث ریاضی:</span>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                {[
                  { id: "algebra", label: "جبر و معادله (ریاضی پایه)" },
                  { id: "calculus", label: "دیفرانسیل، حد و انتگرال" },
                  { id: "trig", label: "اتحادها و قوانین مثلثات" },
                  { id: "geometry", label: "هندسه، احجام و قضیه‌ها" },
                  { id: "stats", label: "آمار، احتمال و ترکیبیات" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSubject(item.id as any)}
                    className={`p-2.5 rounded-xl border text-right font-bold transition-all cursor-pointer ${
                      subject === item.id
                        ? "bg-blue-50 border-blue-400 text-blue-700 shadow-3xs"
                        : "bg-slate-50 border-slate-100 text-gray-600 hover:bg-slate-100"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grade level Selector */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <span className="text-[10px] font-black text-gray-400 block">پایه تحصیلی آزمون:</span>
              <div className="grid grid-cols-4 gap-1.5 text-[9px] font-black">
                {[
                  { id: "primary", label: "ابتدایی" },
                  { id: "junior", label: "متوسطه ۱" },
                  { id: "high", label: "دبیرستان" },
                  { id: "university", label: "دانشگاه" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setGrade(item.id as any)}
                    className={`py-2 rounded-lg border transition-all cursor-pointer ${
                      grade === item.id
                        ? "bg-blue-600 border-blue-600 text-white shadow-2xs"
                        : "bg-slate-50 border-slate-100 text-gray-500 hover:bg-slate-100"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startQuiz}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              <span>تولید آزمون تستی خودکار</span>
            </button>
          </div>

          {/* Streak tracker */}
          {streak > 0 && (
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5 text-amber-900">
                <Zap className="w-4.5 h-4.5 text-amber-500 fill-amber-500 animate-pulse" />
                <div>
                  <span className="text-xs font-black block">زنجیره پاسخ‌های درست: {streak}</span>
                  <span className="text-[9px] text-amber-700 font-bold">همینطور ادامه بده قهرمان! 🔥</span>
                </div>
              </div>
              <div className="bg-amber-100 px-2 py-1 rounded text-[10px] font-extrabold text-amber-800">AMIRALI STAR</div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 text-right">
          {/* Active Quiz Layout */}
          {currentQuestionIndex < questions.length ? (
            <div className="space-y-4">
              {/* Question Header Card */}
              <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-3xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-full">
                    سوال {currentQuestionIndex + 1} از {questions.length}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400">امتیاز شما: {score}</span>
                </div>

                {/* Question Text */}
                <h3 className="text-xs sm:text-sm font-black text-gray-800 leading-relaxed font-sans pt-1">
                  {questions[currentQuestionIndex].question}
                </h3>
              </div>

              {/* Options list */}
              <div className="space-y-2">
                {questions[currentQuestionIndex].options.map((opt, idx) => {
                  let optStyle = "bg-white border-gray-150 hover:bg-slate-50 text-gray-700";
                  let checkIcon = null;

                  if (selectedOption === idx) {
                    optStyle = "bg-blue-50 border-blue-400 text-blue-800 ring-2 ring-blue-500/20 font-black";
                  }

                  if (isAnswered) {
                    const isCorrect = idx === questions[currentQuestionIndex].correctIndex;
                    const isSelected = idx === selectedOption;

                    if (isCorrect) {
                      optStyle = "bg-emerald-50 border-emerald-400 text-emerald-800 ring-2 ring-emerald-500/20 font-black";
                      checkIcon = <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
                    } else if (isSelected) {
                      optStyle = "bg-rose-50 border-rose-400 text-rose-800 ring-2 ring-rose-500/20 font-black";
                      checkIcon = <XCircle className="w-4 h-4 text-rose-600" />;
                    } else {
                      optStyle = "bg-gray-50/50 border-gray-100 text-gray-400 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(idx)}
                      disabled={isAnswered}
                      className={`w-full p-3.5 rounded-2xl border text-right text-xs transition-all flex items-center justify-between cursor-pointer ${optStyle}`}
                    >
                      <span className="flex-1 font-bold">{opt}</span>
                      {checkIcon}
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                {!isAnswered ? (
                  <button
                    onClick={checkAnswer}
                    disabled={selectedOption === null}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-black text-xs rounded-xl shadow-sm cursor-pointer transition-all text-center justify-center flex"
                  >
                    ثبت و بررسی پاسخ
                  </button>
                ) : (
                  <button
                    onClick={nextQuestion}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-sm cursor-pointer transition-all flex items-center justify-center gap-1"
                  >
                    <span>{currentQuestionIndex === questions.length - 1 ? "مشاهده نتایج نهایی" : "سوال بعدی"}</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Answer Explanation Panel */}
              <AnimatePresence>
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-slate-50 border border-gray-150 rounded-2xl p-4 text-right space-y-1.5"
                  >
                    <div className="flex items-center gap-1.5 text-blue-800 text-[10px] font-black">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>تشریح گام‌به‌گام و فرمول حل:</span>
                    </div>
                    <p className="text-[10px] leading-relaxed text-gray-600 font-bold font-mono">
                      {questions[currentQuestionIndex].explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Quiz Score Summary Screen */
            <div className="bg-white rounded-2xl border border-blue-100 p-6 text-center space-y-4">
              <Award className="w-12 h-12 text-amber-500 mx-auto animate-bounce" />
              <div className="space-y-1">
                <h3 className="font-black text-sm text-gray-800">آزمون به پایان رسید!</h3>
                <p className="text-[11px] text-gray-400 font-bold">کارنامه عملکرد شما در آزمون خودارزیابی</p>
              </div>

              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl inline-block px-8">
                <div className="text-[10px] text-blue-700 font-bold">تعداد پاسخ‌های صحیح:</div>
                <div className="text-xl font-black text-blue-900 mt-1">{score} از {questions.length}</div>
              </div>

              <div className="text-[10px] leading-normal text-gray-500 font-medium max-w-[280px] mx-auto">
                {score === questions.length
                  ? "فوق‌العاده! شما تمام سوالات را به درستی پاسخ دادید. یک ریاضیدان واقعی هستید! 🌟"
                  : score >= questions.length / 2
                  ? "عملکرد بسیار خوبی داشتید! با تمرین بیشتر می‌توانید به نمره ۱۰۰٪ برسید. 👍"
                  : "با مرور فرمول‌ها و بخش حل مسائل دوباره تلاش کنید تا مهارت خود را بالا ببرید! 💪"}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={resetQuiz}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-gray-700 font-black text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all border border-gray-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>انصراف و خروج</span>
                </button>
                <button
                  onClick={startQuiz}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>شروع آزمون جدید</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
