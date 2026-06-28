import React from "react";

interface MathKeyboardProps {
  onSymbolClick: (symbol: string) => void;
}

export default function MathKeyboard({ onSymbolClick }: MathKeyboardProps) {
  const symbols = [
    { label: "x", value: "x" },
    { label: "y", value: "y" },
    { label: "توان ۲ (²)", value: "²" },
    { label: "توان ۳ (³)", value: "³" },
    { label: "توان n (^)", value: "^" },
    { label: "رادیکال (√)", value: "√" },
    { label: "پی (π)", value: "π" },
    { label: "بزرگتر (›)", value: ">" },
    { label: "کوچکتر (‹)", value: "<" },
    { label: "مساوی (=)", value: "=" },
    { label: "تقسیم (÷)", value: "/" },
    { label: "ضرب (×)", value: "*" },
    { label: "جمعبست (∑)", value: "∑" },
    { label: "انتگرال (∫)", value: "∫" },
    { label: "بیکران (∞)", value: "∞" },
    { label: "آلفا (α)", value: "α" },
    { label: "بتا (β)", value: "β" },
    { label: "تتا (θ)", value: "θ" },
    { label: "پرانتز باز ( )", value: "(" },
    { label: "پرانتز بسته ( )", value: ")" },
  ];

  return (
    <div className="bg-gray-50/70 rounded-2xl p-4 border border-gray-100 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-500">کیبورد ریاضی کمکی (جهت ورود سریع نمادها):</span>
      </div>
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
        {symbols.map((sym, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSymbolClick(sym.value)}
            className="h-10 text-sm font-mono font-semibold bg-white hover:bg-teal-50 active:bg-teal-100 text-gray-700 hover:text-teal-700 border border-gray-200 hover:border-teal-300 rounded-xl shadow-xs transition-all flex items-center justify-center cursor-pointer"
            title={sym.label}
          >
            {sym.value}
          </button>
        ))}
      </div>
    </div>
  );
}
