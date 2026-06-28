import React, { useState } from "react";
import { BookOpen, Copy, Check, ChevronRight } from "lucide-react";

interface FormulaLibraryProps {
  onInsertFormula: (formula: string) => void;
}

export default function FormulaLibrary({ onInsertFormula }: FormulaLibraryProps) {
  const [activeTab, setActiveTab] = useState<string>("algebra");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: "algebra", name: "جبر و معادله" },
    { id: "trig", name: "مثلثات" },
    { id: "calculus", name: "حد و دیفرانسیل" },
    { id: "geometry", name: "هندسه و فضا" },
  ];

  const formulas: Record<string, Array<{ id: string; name: string; latex: string; description: string }>> = {
    algebra: [
      {
        id: "quad",
        name: "فرمول عمومی حل معادله درجه دو",
        latex: "ax^2 + bx + c = 0 \\implies x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
        description: "پیدا کردن ریشه‌های معادله درجه دو با استفاده از دلتا",
      },
      {
        id: "diff_squares",
        name: "اتحاد تفاضل مربعات (مزدوج)",
        latex: "a^2 - b^2 = (a-b)(a+b)",
        description: "تجزیه چندجمله‌ای درجه دو به عامل‌های خطی ساده",
      },
      {
        id: "binomial",
        name: "اتحاد مربع دو جمله‌ای",
        latex: "(a \\pm b)^2 = a^2 \\pm 2ab + b^2",
        description: "بسط مربع جمع یا تفاضل دو متغیر ریاضی",
      },
    ],
    trig: [
      {
        id: "pythagorean_identity",
        name: "فرمول اساسی مثلثات",
        latex: "\\sin^2(x) + \\cos^2(x) = 1",
        description: "رابطه بنیادین بین سینوس و کسینوس یک زاویه",
      },
      {
        id: "double_angle_sin",
        name: "سینوس دو برابر زاویه",
        latex: "\\sin(2x) = 2\\sin(x)\\cos(x)",
        description: "تبدیل زاویه مضاعف به زوایای ساده",
      },
      {
        id: "double_angle_cos",
        name: "کسینوس دو برابر زاویه",
        latex: "\\cos(2x) = \\cos^2(x) - \\sin^2(x)",
        description: "ساده‌سازی توابع مثلثاتی با توان دوم",
      },
    ],
    calculus: [
      {
        id: "power_rule",
        name: "قاعده مشتق توان",
        latex: "\\frac{d}{dx}[x^n] = n \\cdot x^{n-1}",
        description: "مشتق‌گیری سریع از متغیر با توان حقیقی ثابت",
      },
      {
        id: "ftc",
        name: "قضیه اساسی حساب دیفرانسیل و انتگرال",
        latex: "\\int_{a}^{b} f(x) \\, dx = F(b) - F(a)",
        description: "محاسبه مساحت زیر نمودار با استفاده از تابع پادمشتق",
      },
      {
        id: "derivative_sin",
        name: "مشتق توابع مثلثاتی سینوس",
        latex: "\\frac{d}{dx}[\\sin(x)] = \\cos(x)",
        description: "آهنگ تغییرات لحظه‌ای تابع سینوسی",
      },
    ],
    geometry: [
      {
        id: "pythagoras",
        name: "قضیه فیثاغورس",
        latex: "a^2 + b^2 = c^2",
        description: "رابطه اضلاع در مثلث قائم‌الزاویه",
      },
      {
        id: "circle_area",
        name: "مساحت دایره کامل",
        latex: "A = \\pi r^2",
        description: "محاسبه مساحت داخلی دایره با شعاع r",
      },
      {
        id: "sphere_vol",
        name: "حجم کره فضایی",
        latex: "V = \\frac{4}{3}\\pi r^3",
        description: "محاسبه گنجایش درونی کره سه بعدی",
      },
    ],
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white rounded-3xl border border-blue-50 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
        <BookOpen className="w-5 h-5 text-blue-600 animate-pulse" />
        <h4 className="font-bold text-gray-800 text-sm">کتابچه فرمول‌های ریاضی و مهندسی</h4>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 mb-4 overflow-x-auto gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`pb-2 px-3 text-xs font-bold whitespace-nowrap border-b-2 cursor-pointer transition-all ${
              activeTab === cat.id
                ? "border-blue-600 text-blue-700 font-extrabold"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Formula List */}
      <div className="space-y-3 max-h-[280px] overflow-y-auto scrollbar-thin">
        {formulas[activeTab]?.map((item) => (
          <div
            key={item.id}
            className="group p-3.5 bg-gray-50/50 hover:bg-blue-50/20 border border-gray-100 hover:border-blue-100 rounded-2xl flex flex-col gap-2 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-bold text-gray-800 text-xs">{item.name}</h5>
                <p className="text-[10px] text-gray-400 font-medium">{item.description}</p>
              </div>
              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleCopy(item.id, item.latex)}
                  className="p-1.5 rounded-lg hover:bg-gray-200/60 text-gray-400 hover:text-gray-700 transition-all cursor-pointer"
                  title="کپی فرمول LaTeX"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3.5 h-3.5 text-blue-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={() => onInsertFormula(item.latex)}
                  className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 flex items-center gap-1 text-[10px] font-bold cursor-pointer transition-all"
                  title="درج مستقیم در کادر سوال"
                >
                  <span>درج فرمول</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            {/* Display Equation Container */}
            <div className="bg-white/80 p-2.5 rounded-xl border border-gray-100 font-mono text-center text-xs text-blue-950 overflow-x-auto ltr shadow-2xs">
              {`$$ ${item.latex} $$`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
