import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Calculator,
  ChevronLeft,
  RotateCcw,
  Sliders,
  Sparkles,
  Zap,
  HelpCircle,
  Layers,
  Award,
} from "lucide-react";

export default function OfflineSolver() {
  const [activeTool, setActiveTool] = useState<"quadratic" | "system" | "geometry" | "stats">("quadratic");

  // 1. Quadratic state
  const [quadA, setQuadA] = useState("1");
  const [quadB, setQuadB] = useState("-5");
  const [quadC, setQuadC] = useState("6");
  const [quadResult, setQuadResult] = useState<any>(null);

  const solveQuadratic = () => {
    const a = parseFloat(quadA);
    const b = parseFloat(quadB);
    const c = parseFloat(quadC);

    if (isNaN(a) || isNaN(b) || isNaN(c)) {
      alert("لطفاً همه ضرایب را به صورت عدد وارد کنید.");
      return;
    }

    if (a === 0) {
      // Linear equation bx + c = 0
      const x = -c / b;
      setQuadResult({
        type: "linear",
        steps: [
          `ضریب $a$ صفر است، بنابراین معادله به صورت خطی $bx + c = 0$ در می‌آید:`,
          `$${b}x + (${c}) = 0$`,
          `$${b}x = ${-c}$`,
          `$x = \\frac{${-c}}{${b}} = ${x.toFixed(3)}$`,
        ],
        roots: [`x = ${x.toFixed(3)}`],
      });
      return;
    }

    const delta = b * b - 4 * a * c;
    const steps = [
      `شکل کلی معادله: $ax^2 + bx + c = 0$`,
      `مقادیر: $a = ${a}$, $b = ${b}$, $c = ${c}$`,
      `محاسبه دلتا (مبین): $\\Delta = b^2 - 4ac$`,
      `$\\Delta = (${b})^2 - 4(${a})(${c}) = ${b * b} - ${4 * a * c} = ${delta}$`,
    ];

    if (delta > 0) {
      const sqrtDelta = Math.sqrt(delta);
      const x1 = (-b + sqrtDelta) / (2 * a);
      const x2 = (-b - sqrtDelta) / (2 * a);
      steps.push(
        `چون $\\Delta > 0$ است، معادله دارای دو ریشه حقیقی متمایز است:`,
        `$x_{1,2} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$`,
        `$x_1 = \\frac{-(${b}) + \\sqrt{${delta}}}{2(${a})} = \\frac{${-b} + ${sqrtDelta.toFixed(3)}}{${2 * a}} = ${x1.toFixed(3)}$`,
        `$x_2 = \\frac{-(${b}) - \\sqrt{${delta}}}{2(${a})} = \\frac{${-b} - ${sqrtDelta.toFixed(3)}}{${2 * a}} = ${x2.toFixed(3)}$`
      );
      setQuadResult({
        type: "two_roots",
        delta,
        roots: [`x_1 = ${x1.toFixed(3)}`, `x_2 = ${x2.toFixed(3)}`],
        steps,
      });
    } else if (delta === 0) {
      const x = -b / (2 * a);
      steps.push(
        `چون $\\Delta = 0$ است، معادله دارای یک ریشه مضاعف است:`,
        `$x = \\frac{-b}{2a}$`,
        `$x = \\frac{-(${b})}{2(${a})} = ${x.toFixed(3)}$`
      );
      setQuadResult({
        type: "double_root",
        delta,
        roots: [`x = ${x.toFixed(3)}`],
        steps,
      });
    } else {
      const realPart = -b / (2 * a);
      const imagPart = Math.sqrt(-delta) / (2 * a);
      steps.push(
        `چون $\\Delta < 0$ است، معادله ریشه حقیقی ندارد و دارای ریشه‌های مختلط است:`,
        `$x_{1,2} = \\frac{-b \\pm i\\sqrt{-\\Delta}}{2a}$`,
        `$x_1 = ${realPart.toFixed(3)} + ${imagPart.toFixed(3)}i$`,
        `$x_2 = ${realPart.toFixed(3)} - ${imagPart.toFixed(3)}i$`
      );
      setQuadResult({
        type: "complex_roots",
        delta,
        roots: [
          `x_1 = ${realPart.toFixed(3)} + ${imagPart.toFixed(3)}i`,
          `x_2 = ${realPart.toFixed(3)} - ${imagPart.toFixed(3)}i`,
        ],
        steps,
      });
    }
  };

  // 2. System of equations state
  const [sysA1, setSysA1] = useState("2");
  const [sysB1, setSysB1] = useState("3");
  const [sysC1, setSysC1] = useState("12");
  const [sysA2, setSysA2] = useState("1");
  const [sysB2, setSysB2] = useState("-1");
  const [sysC2, setSysC2] = useState("1");
  const [sysResult, setSysResult] = useState<any>(null);

  const solveSystem = () => {
    const a1 = parseFloat(sysA1);
    const b1 = parseFloat(sysB1);
    const c1 = parseFloat(sysC1);
    const a2 = parseFloat(sysA2);
    const b2 = parseFloat(sysB2);
    const c2 = parseFloat(sysC2);

    if ([a1, b1, c1, a2, b2, c2].some(isNaN)) {
      alert("لطفاً همه ضرایب دستگاه را به صورت عدد وارد کنید.");
      return;
    }

    // Cramer's rule
    // D = a1*b2 - a2*b1
    // Dx = c1*b2 - c2*b1
    // Dy = a1*c2 - a2*c1
    const d = a1 * b2 - a2 * b1;
    const dx = c1 * b2 - c2 * b1;
    const dy = a1 * c2 - a2 * c1;

    const steps = [
      `شکل کلی دستگاه:`,
      `$\\begin{cases} a_1x + b_1y = c_1 \\\\ a_2x + b_2y = c_2 \\end{cases}$`,
      `مقادیر:`,
      `$a_1 = ${a1}, b_1 = ${b1}, c_1 = ${c1}$`,
      `$a_2 = ${a2}, b_2 = ${b2}, c_2 = ${c2}$`,
      `روش دترمینان (کرامر):`,
      `دترمینان اصلی: $D = a_1b_2 - a_2b_1$`,
      `$D = (${a1})(${b2}) - (${a2})(${b1}) = ${a1 * b2} - ${a2 * b1} = ${d}$`,
    ];

    if (d === 0) {
      if (dx === 0 && dy === 0) {
        steps.push(
          `چون $D = 0$ و $D_x = D_y = 0$ است، دستگاه دارای بی‌شمار جواب است (دو خط منطبق هستند).`
        );
        setSysResult({ type: "infinite", steps, x: "بی‌شمار", y: "بی‌شمار" });
      } else {
        steps.push(
          `چون $D = 0$ اما دترمینان‌های دیگر صفر نیستند، دستگاه جواب ندارد (دو خط موازی غیرمنطبق هستند).`
        );
        setSysResult({ type: "no_solution", steps, x: "فاقد جواب", y: "فاقد جواب" });
      }
    } else {
      const x = dx / d;
      const y = dy / d;
      steps.push(
        `دترمینان $x$: $D_x = c_1b_2 - c_2b_1$`,
        `$D_x = (${c1})(${b2}) - (${c2})(${b1}) = ${c1 * b2} - ${c2 * b1} = ${dx}$`,
        `دترمینان $y$: $D_y = a_1c_2 - a_2c_1$`,
        `$D_y = (${a1})(${c2}) - (${a2})(${c1}) = ${a1 * c2} - ${a2 * c1} = ${dy}$`,
        `محاسبه جواب‌ها:`,
        `$x = \\frac{D_x}{D} = \\frac{${dx}}{${d}} = ${x.toFixed(3)}$`,
        `$y = \\frac{D_y}{D} = \\frac{${dy}}{${d}} = ${y.toFixed(3)}$`
      );
      setSysResult({
        type: "unique",
        x: x.toFixed(3),
        y: y.toFixed(3),
        steps,
      });
    }
  };

  // 3. Geometry state
  const [geomShape, setGeomShape] = useState<"circle" | "rectangle" | "triangle" | "sphere">("circle");
  const [geomVal1, setGeomVal1] = useState("5"); // radius or width or base
  const [geomVal2, setGeomVal2] = useState("10"); // height or length
  const [geomResult, setGeomResult] = useState<any>(null);

  const solveGeometry = () => {
    const val1 = parseFloat(geomVal1);
    const val2 = parseFloat(geomVal2);

    if (isNaN(val1) || (geomShape !== "circle" && geomShape !== "sphere" && isNaN(val2))) {
      alert("لطفاً ابعاد را به درستی وارد کنید.");
      return;
    }

    const steps = [];
    let area = 0;
    let perimeter = 0;
    let volume = 0;

    if (geomShape === "circle") {
      const r = val1;
      area = Math.PI * r * r;
      perimeter = 2 * Math.PI * r;
      steps.push(
        `فرمول مساحت دایره: $S = \\pi r^2$`,
        `$S = \\pi \\times ${r}^2 \\approx 3.1415 \\times ${r * r} \\approx ${area.toFixed(3)}$`,
        `فرمول محیط دایره: $P = 2\\pi r$`,
        `$P = 2 \\times \\pi \\times ${r} \\approx 6.283 \\times ${r} \\approx ${perimeter.toFixed(3)}$`
      );
      setGeomResult({ shape: "دایره", area: area.toFixed(3), perimeter: perimeter.toFixed(3), steps });
    } else if (geomShape === "rectangle") {
      const w = val1;
      const h = val2;
      area = w * h;
      perimeter = 2 * (w + h);
      steps.push(
        `فرمول مساحت مستطیل: $S = w \\times h$`,
        `$S = ${w} \\times ${h} = ${area}$`,
        `فرمول محیط مستطیل: $P = 2(w + h)$`,
        `$P = 2(${w} + ${h}) = 2 \\times ${w + h} = ${perimeter}$`
      );
      setGeomResult({ shape: "مستطیل", area: area.toFixed(2), perimeter: perimeter.toFixed(2), steps });
    } else if (geomShape === "triangle") {
      const base = val1;
      const height = val2;
      area = 0.5 * base * height;
      steps.push(
        `فرمول مساحت مثلث: $S = \\frac{1}{2} \\times \\text{قاعده} \\times \\text{ارتفاع}$`,
        `$S = 0.5 \\times ${base} \\times ${height} = ${area}$`
      );
      setGeomResult({ shape: "مثلث", area: area.toFixed(2), steps });
    } else if (geomShape === "sphere") {
      const r = val1;
      area = 4 * Math.PI * r * r;
      volume = (4 / 3) * Math.PI * r * r * r;
      steps.push(
        `فرمول مساحت رویه کره: $S = 4\\pi r^2$`,
        `$S = 4 \\times \\pi \\times ${r}^2 \\approx 12.566 \\times ${r * r} \\approx ${area.toFixed(3)}$`,
        `فرمول حجم کره: $V = \\frac{4}{3}\\pi r^3$`,
        `$V = \\frac{4}{3} \\times \\pi \\times ${r}^3 \\approx 4.188 \\times ${r * r * r} \\approx ${volume.toFixed(3)}$`
      );
      setGeomResult({ shape: "کره", area: area.toFixed(3), volume: volume.toFixed(3), steps });
    }
  };

  // 4. Statistics state
  const [statsInput, setStatsInput] = useState("10, 15, 12, 18, 14, 20, 15");
  const [statsResult, setStatsResult] = useState<any>(null);

  const solveStats = () => {
    const nums = statsInput
      .split(",")
      .map((x) => parseFloat(x.trim()))
      .filter((x) => !isNaN(x));

    if (nums.length === 0) {
      alert("لطفاً اعدادی را به صورت جدا شده با کاما وارد کنید.");
      return;
    }

    // Sort numbers
    const sorted = [...nums].sort((a, b) => a - b);
    const count = nums.length;
    
    // Sum & Mean
    const sum = nums.reduce((acc, x) => acc + x, 0);
    const mean = sum / count;

    // Median
    let median = 0;
    const mid = Math.floor(count / 2);
    if (count % 2 === 0) {
      median = (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
      median = sorted[mid];
    }

    // Min, Max, Range
    const min = sorted[0];
    const max = sorted[count - 1];
    const range = max - min;

    // Variance & StdDev
    const sqDiffSum = nums.reduce((acc, x) => acc + Math.pow(x - mean, 2), 0);
    const variance = sqDiffSum / count;
    const stdDev = Math.sqrt(variance);

    // Mode finding
    const freqs: any = {};
    nums.forEach((x) => {
      freqs[x] = (freqs[x] || 0) + 1;
    });
    let maxFreq = 0;
    let modes: number[] = [];
    Object.keys(freqs).forEach((key) => {
      const f = freqs[key];
      if (f > maxFreq) {
        maxFreq = f;
        modes = [parseFloat(key)];
      } else if (f === maxFreq && maxFreq > 1) {
        modes.push(parseFloat(key));
      }
    });

    const steps = [
      `لیست مرتب شده داده‌ها: [${sorted.join(", ")}]`,
      `تعداد کل داده‌ها ($n$): $${count}$`,
      `مجموع داده‌ها ($\\sum x$): $${sum}$`,
      `میانگین ($\\bar{x}$): $\\bar{x} = \\frac{\\sum x}{n} = \\frac{${sum}}{${count}} = ${mean.toFixed(3)}$`,
      `میانه: مقدار میانی بعد از مرتب‌سازی برابر است با: $${median}$`,
      `دامنه تغییرات: $R = \\text{Max} - \\text{Min} = ${max} - ${min} = ${range}$`,
      `واریانس ($\\sigma^2$): مجموع مربعات انحراف از میانگین تقسیم بر تعداد: $\\sigma^2 = ${variance.toFixed(3)}$`,
      `انحراف معیار ($\\sigma$): جذر واریانس: $\\sigma = ${stdDev.toFixed(3)}$`,
    ];

    setStatsResult({
      count,
      mean: mean.toFixed(2),
      median,
      mode: maxFreq > 1 ? modes.join(", ") : "فاقد مد تکراری",
      min,
      max,
      range,
      variance: variance.toFixed(3),
      stdDev: stdDev.toFixed(3),
      steps,
    });
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Tab Selectors */}
      <div className="bg-white rounded-2xl border border-blue-50 p-1 flex gap-1 shadow-3xs overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTool("quadratic")}
          className={`flex-1 py-2.5 px-1 rounded-xl text-[10px] font-black cursor-pointer transition-all ${
            activeTool === "quadratic"
              ? "bg-blue-600 text-white shadow-2xs"
              : "text-gray-500 hover:bg-slate-50 hover:text-gray-900"
          }`}
        >
          معادله درجه ۲
        </button>

        <button
          onClick={() => setActiveTool("system")}
          className={`flex-1 py-2.5 px-1 rounded-xl text-[10px] font-black cursor-pointer transition-all ${
            activeTool === "system"
              ? "bg-blue-600 text-white shadow-2xs"
              : "text-gray-500 hover:bg-slate-50 hover:text-gray-900"
          }`}
        >
          دستگاه خطی
        </button>

        <button
          onClick={() => setActiveTool("geometry")}
          className={`flex-1 py-2.5 px-1 rounded-xl text-[10px] font-black cursor-pointer transition-all ${
            activeTool === "geometry"
              ? "bg-blue-600 text-white shadow-2xs"
              : "text-gray-500 hover:bg-slate-50 hover:text-gray-900"
          }`}
        >
          هندسه و ابعاد
        </button>

        <button
          onClick={() => setActiveTool("stats")}
          className={`flex-1 py-2.5 px-1 rounded-xl text-[10px] font-black cursor-pointer transition-all ${
            activeTool === "stats"
              ? "bg-blue-600 text-white shadow-2xs"
              : "text-gray-500 hover:bg-slate-50 hover:text-gray-900"
          }`}
        >
          آمار و داده‌ها
        </button>
      </div>

      {/* Tool Content Panels */}
      <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-3xs space-y-4">
        
        {/* QUADRATIC TOOL */}
        {activeTool === "quadratic" && (
          <div className="space-y-3">
            <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-[10px] text-blue-900 leading-relaxed font-semibold">
              🎯 حل فوری معادله درجه دوم با مبین دلتا $\Delta = b^2 - 4ac$ کاملاً آفلاین و سریع.
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400">ضریب a:</span>
                <input
                  type="number"
                  value={quadA}
                  onChange={(e) => setQuadA(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 p-2 rounded-xl text-center font-bold text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400">ضریب b:</span>
                <input
                  type="number"
                  value={quadB}
                  onChange={(e) => setQuadB(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 p-2 rounded-xl text-center font-bold text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400">ضریب c:</span>
                <input
                  type="number"
                  value={quadC}
                  onChange={(e) => setQuadC(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 p-2 rounded-xl text-center font-bold text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <button
              onClick={solveQuadratic}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>محاسبه و ترسیم گام‌ها</span>
            </button>

            {quadResult && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-3 border-t border-gray-100 space-y-3 text-right"
              >
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-900 p-3 rounded-xl">
                  <div className="text-[10px] font-bold">ریشه‌های نهایی معادله:</div>
                  <div className="text-xs font-black mt-1 font-mono flex flex-wrap gap-2 justify-start">
                    {quadResult.roots.map((r: string, idx: number) => (
                      <span key={idx} className="bg-white px-2 py-1 rounded border border-emerald-200">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-black text-gray-400 block">مراحل تفکیکی حل مسئله:</span>
                  <div className="bg-slate-50 p-3 rounded-xl border border-gray-100 text-[10px] text-gray-700 leading-normal font-mono space-y-2">
                    {quadResult.steps.map((step: string, idx: number) => (
                      <div key={idx} className="border-b border-dashed border-gray-200/50 pb-1.5 last:border-none last:pb-0">
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* SYSTEM OF EQUATIONS */}
        {activeTool === "system" && (
          <div className="space-y-3">
            <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-[10px] text-blue-900 leading-relaxed font-semibold">
              🎯 حل فوری دستگاه دو معادله دو مجهول با استفاده از روش زیبای کرامر و دترمینان‌ها.
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black text-gray-500 block">معادله اول: $a_1x + b_1y = c_1$</span>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  placeholder="a1"
                  value={sysA1}
                  onChange={(e) => setSysA1(e.target.value)}
                  className="bg-slate-50 border border-gray-200 p-2 rounded-xl text-center font-bold text-xs"
                />
                <input
                  type="number"
                  placeholder="b1"
                  value={sysB1}
                  onChange={(e) => setSysB1(e.target.value)}
                  className="bg-slate-50 border border-gray-200 p-2 rounded-xl text-center font-bold text-xs"
                />
                <input
                  type="number"
                  placeholder="c1"
                  value={sysC1}
                  onChange={(e) => setSysC1(e.target.value)}
                  className="bg-slate-50 border border-gray-200 p-2 rounded-xl text-center font-bold text-xs"
                />
              </div>

              <span className="text-[10px] font-black text-gray-500 block">معادله دوم: $a_2x + b_2y = c_2$</span>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  placeholder="a2"
                  value={sysA2}
                  onChange={(e) => setSysA2(e.target.value)}
                  className="bg-slate-50 border border-gray-200 p-2 rounded-xl text-center font-bold text-xs"
                />
                <input
                  type="number"
                  placeholder="b2"
                  value={sysB2}
                  onChange={(e) => setSysB2(e.target.value)}
                  className="bg-slate-50 border border-gray-200 p-2 rounded-xl text-center font-bold text-xs"
                />
                <input
                  type="number"
                  placeholder="c2"
                  value={sysC2}
                  onChange={(e) => setSysC2(e.target.value)}
                  className="bg-slate-50 border border-gray-200 p-2 rounded-xl text-center font-bold text-xs"
                />
              </div>
            </div>

            <button
              onClick={solveSystem}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>محاسبه دستگاه معادله</span>
            </button>

            {sysResult && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-3 border-t border-gray-100 space-y-3 text-right"
              >
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-900 p-3 rounded-xl flex justify-between">
                  <div>
                    <span className="text-[10px] font-bold block">مقدار y:</span>
                    <span className="font-mono text-xs font-black">{sysResult.y}</span>
                  </div>
                  <div className="border-r border-emerald-200 h-8 self-center" />
                  <div>
                    <span className="text-[10px] font-bold block">مقدار x:</span>
                    <span className="font-mono text-xs font-black">{sysResult.x}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-black text-gray-400 block">مراحل تفکیکی حل مسئله:</span>
                  <div className="bg-slate-50 p-3 rounded-xl border border-gray-100 text-[10px] text-gray-700 leading-normal font-mono space-y-2">
                    {sysResult.steps.map((step: string, idx: number) => (
                      <div key={idx} className="border-b border-dashed border-gray-200/50 pb-1.5 last:border-none last:pb-0">
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* GEOMETRY TOOL */}
        {activeTool === "geometry" && (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl">
              {["circle", "rectangle", "triangle", "sphere"].map((shape) => (
                <button
                  key={shape}
                  onClick={() => setGeomShape(shape as any)}
                  className={`py-1.5 rounded-lg text-[9px] font-black cursor-pointer transition-all capitalize ${
                    geomShape === shape
                      ? "bg-white text-blue-700 shadow-3xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {shape === "circle" ? "دایره" : shape === "rectangle" ? "مستطیل" : shape === "triangle" ? "مثلث" : "کره"}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400">
                  {geomShape === "circle" || geomShape === "sphere" ? "شعاع (r):" : geomShape === "rectangle" ? "عرض (w):" : "قاعده (b):"}
                </span>
                <input
                  type="number"
                  value={geomVal1}
                  onChange={(e) => setGeomVal1(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 p-2 rounded-xl text-center font-bold text-xs"
                />
              </div>

              {geomShape !== "circle" && geomShape !== "sphere" && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400">
                    {geomShape === "rectangle" ? "طول (l):" : "ارتفاع (h):"}
                  </span>
                  <input
                    type="number"
                    value={geomVal2}
                    onChange={(e) => setGeomVal2(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 p-2 rounded-xl text-center font-bold text-xs"
                  />
                </div>
              )}
            </div>

            <button
              onClick={solveGeometry}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>محاسبه ابعاد هندسی</span>
            </button>

            {geomResult && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-3 border-t border-gray-100 space-y-3 text-right"
              >
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-900 p-3 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs font-black">
                    <span>مساحت (S):</span>
                    <span className="font-mono">{geomResult.area}</span>
                  </div>
                  {geomResult.perimeter && (
                    <div className="flex justify-between text-xs font-black border-t border-emerald-200/50 pt-2">
                      <span>محیط (P):</span>
                      <span className="font-mono">{geomResult.perimeter}</span>
                    </div>
                  )}
                  {geomResult.volume && (
                    <div className="flex justify-between text-xs font-black border-t border-emerald-200/50 pt-2">
                      <span>حجم (V):</span>
                      <span className="font-mono">{geomResult.volume}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-black text-gray-400 block">توضیح فرمول‌های مربوطه:</span>
                  <div className="bg-slate-50 p-3 rounded-xl border border-gray-100 text-[10px] text-gray-700 leading-normal font-mono space-y-2">
                    {geomResult.steps.map((step: string, idx: number) => (
                      <div key={idx} className="border-b border-dashed border-gray-200/50 pb-1.5 last:border-none last:pb-0">
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* STATISTICS TOOL */}
        {activeTool === "stats" && (
          <div className="space-y-3">
            <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-[10px] text-blue-900 leading-relaxed font-semibold">
              🎯 تحلیل جامع و سریع آماری شامل میانگین، میانه، انحراف معیار، واریانس، داده‌های ماکزیمم و مینیمم به صورت لحظه‌ای.
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400">ورودی داده‌ها (جدا شده با کاما ,):</span>
              <input
                type="text"
                value={statsInput}
                onChange={(e) => setStatsInput(e.target.value)}
                placeholder="مثال: 12, 18, 15, 20, 14"
                className="w-full bg-slate-50 border border-gray-200 p-2.5 rounded-xl text-left font-mono font-bold text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                dir="ltr"
              />
            </div>

            <button
              onClick={solveStats}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>تحلیل آماری داده‌ها</span>
            </button>

            {statsResult && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-3 border-t border-gray-100 space-y-3 text-right"
              >
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-emerald-50/60 p-2 rounded-xl border border-emerald-100">
                    <span className="text-gray-400 block font-bold">میانگین:</span>
                    <span className="font-mono text-xs font-black text-emerald-900">{statsResult.mean}</span>
                  </div>
                  <div className="bg-emerald-50/60 p-2 rounded-xl border border-emerald-100">
                    <span className="text-gray-400 block font-bold">میانه:</span>
                    <span className="font-mono text-xs font-black text-emerald-900">{statsResult.median}</span>
                  </div>
                  <div className="bg-emerald-50/60 p-2 rounded-xl border border-emerald-100">
                    <span className="text-gray-400 block font-bold">مد (مکررترین):</span>
                    <span className="font-mono text-xs font-black text-emerald-900">{statsResult.mode}</span>
                  </div>
                  <div className="bg-emerald-50/60 p-2 rounded-xl border border-emerald-100">
                    <span className="text-gray-400 block font-bold">انحراف معیار (σ):</span>
                    <span className="font-mono text-xs font-black text-emerald-900">{statsResult.stdDev}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-black text-gray-400 block">روند گام‌به‌گام تحلیل آمار:</span>
                  <div className="bg-slate-50 p-3 rounded-xl border border-gray-100 text-[10px] text-gray-700 leading-normal font-mono space-y-2">
                    {statsResult.steps.map((step: string, idx: number) => (
                      <div key={idx} className="border-b border-dashed border-gray-200/50 pb-1.5 last:border-none last:pb-0">
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
