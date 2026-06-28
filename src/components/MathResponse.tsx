import React, { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Check, Copy, Share2, Sparkles, AlertCircle, Award } from "lucide-react";

interface MathResponseProps {
  solution: string;
  isLoading: boolean;
}

export default function MathResponse({ solution, isLoading }: MathResponseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  // Animated loading percentage effect
  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      return;
    }

    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 99) return 99;
        
        let step = 0;
        if (prev < 35) {
          step = Math.floor(Math.random() * 6) + 3; // Fast start (3% to 8%)
        } else if (prev < 70) {
          step = Math.floor(Math.random() * 3) + 2; // Medium pace (2% to 4%)
        } else if (prev < 90) {
          step = Math.floor(Math.random() * 2) + 1; // Slow down (1% to 2%)
        } else {
          step = Math.random() < 0.35 ? 1 : 0; // Extremely slow near 99%
        }
        
        const next = prev + step;
        return next > 99 ? 99 : next;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Parse simple Markdown to HTML safely (including markdown tables)
  const parseMarkdown = (text: string) => {
    if (!text) return "";

    let html = text;

    // Code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/gm, (_match, _lang, code) => {
      return `<pre class="bg-gray-950 text-blue-200 p-4 rounded-2xl my-5 font-mono text-xs overflow-x-auto ltr border border-gray-800 shadow-inner">${code.trim()}</pre>`;
    });

    // Custom box for the final answer / conclusion
    html = html.replace(
      /(\*\*نتیجه‌گیری و پاسخ نهایی:\*\*|\*\*پاسخ نهایی:\*\*)\s*(\$\$[\s\S]*?\$\$|\$.*?\$|[\s\S]*?)(?=(?:$|<br \/>|<div))/gi,
      `<div class="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-500 rounded-3xl p-6 my-6 text-blue-950 shadow-md transform hover:scale-[1.01] transition-all duration-300">
         <div class="flex items-center gap-2 mb-3 text-blue-700 font-extrabold">
           <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="animate-bounce"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
           <span class="text-base font-black">نتیجه‌گیری نهایی ربات امیرعلی</span>
         </div>
         <div class="text-xl font-bold font-sans">$2</div>
       </div>`
    );

    // Markdown Table parsing
    const lines = html.split("\n");
    let inTable = false;
    let tableHtml = "";
    const newLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("|") && line.endsWith("|")) {
        if (!inTable) {
          inTable = true;
          tableHtml = '<div class="overflow-x-auto my-6 border border-blue-100 rounded-2xl shadow-xs"><table class="w-full text-right border-collapse text-sm text-gray-800">';
          // parse header
          const cols = line.split("|").map(c => c.trim()).filter((_c, idx, arr) => idx > 0 && idx < arr.length - 1);
          tableHtml += '<thead class="bg-blue-50 text-blue-900 border-b border-blue-100 font-bold"><tr>';
          cols.forEach(col => {
            tableHtml += `<th class="p-3.5 border-l border-blue-100 last:border-l-0">${col}</th>`;
          });
          tableHtml += "</tr></thead><tbody>";
        } else if (line.includes("---") || line.includes("===")) {
          // Skip divider rows
          continue;
        } else {
          // Normal table row
          const cols = line.split("|").map(c => c.trim()).filter((_c, idx, arr) => idx > 0 && idx < arr.length - 1);
          tableHtml += '<tr class="border-b border-gray-100 hover:bg-blue-50/15 last:border-b-0 transition-colors">';
          cols.forEach(col => {
            tableHtml += `<td class="p-3.5 border-l border-gray-100 last:border-l-0 font-medium">${col}</td>`;
          });
          tableHtml += "</tr>";
        }
      } else {
        if (inTable) {
          inTable = false;
          tableHtml += "</tbody></table></div>";
          newLines.push(tableHtml);
          tableHtml = "";
        }
        newLines.push(lines[i]);
      }
    }
    if (inTable) {
      tableHtml += "</tbody></table></div>";
      newLines.push(tableHtml);
    }
    html = newLines.join("\n");

    // Headings
    html = html.replace(/^### (.*$)/gim, '<h4 class="text-lg font-black text-blue-800 mt-6 mb-3 flex items-center gap-2"><span class="w-2 h-4 bg-blue-600 rounded-full animate-pulse"></span>$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h3 class="text-xl font-black text-blue-900 mt-8 mb-4 border-b pb-2 border-blue-100">$1</h3>');
    html = html.replace(/^# (.*$)/gim, '<h2 class="text-2xl font-black text-blue-950 mt-10 mb-5 border-b-2 pb-3 border-blue-200">$1</h2>');

    // Bold text
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-gray-900">$1</strong>');

    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote class="border-r-4 border-blue-500 bg-blue-50/40 px-4 py-3 my-5 rounded-l-xl italic text-gray-700">$1</blockquote>');

    // Lists (bullet points)
    html = html.replace(/^\s*[\-\*]\s+(.*$)/gim, '<li class="mr-5 list-disc text-gray-700 mb-2 font-medium">$1</li>');

    // Handle single newlines safely
    html = html.split("\n").map(line => {
      if (line.trim().startsWith("<") || line.trim().endsWith(">")) {
        return line;
      }
      return line + "<br />";
    }).join("");

    return html;
  };

  // Run KaTeX equations rendering
  useEffect(() => {
    if (containerRef.current && (window as any).renderMathInElement) {
      try {
        (window as any).renderMathInElement(containerRef.current, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true }
          ],
          throwOnError: false,
          ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"]
        });
      } catch (err) {
        console.error("KaTeX rendering error:", err);
      }
    }
  }, [solution]);

  const handleCopy = () => {
    navigator.clipboard.writeText(solution);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "پاسخ هوش مصنوعی ریاضی امیرعلی",
        text: solution,
      }).catch(console.error);
    } else {
      handleCopy();
      alert("متن پاسخ کپی شد. می‌توانید آن را به اشتراک بگذارید.");
    }
  };

  if (isLoading) {
    // Dynamic status text in Persian based on the progress range
    let progressStatus = "بارگذاری تصاویر و صورت مسئله...";
    if (progress > 30 && progress <= 60) {
      progressStatus = "مدل‌سازی پارامترها و فرمول‌های ریاضی...";
    } else if (progress > 60 && progress <= 85) {
      progressStatus = "محاسبه گام‌به‌گام و جدول‌بندی مشخصات...";
    } else if (progress > 85) {
      progressStatus = "رندرسازی کدهای LaTeX و نتیجه‌گیری نهایی...";
    }

    return (
      <div id="loading-panel" className="bg-white rounded-3xl p-10 border border-blue-150 shadow-lg flex flex-col items-center justify-center min-h-[350px] text-center relative overflow-hidden">
        {/* Subtle background dynamic pulses */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-2xl pointer-events-none" />

        {/* Circular Progress Indicator with Ring */}
        <div className="relative w-28 h-28 mb-6 flex items-center justify-center">
          {/* Base outer circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="56"
              cy="56"
              r="48"
              className="stroke-blue-50"
              strokeWidth="6"
              fill="transparent"
            />
            <motion.circle
              cx="56"
              cy="56"
              r="48"
              className="stroke-blue-600"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 48}
              strokeDashoffset={2 * Math.PI * 48 * (1 - progress / 100)}
              transition={{ ease: "easeOut", duration: 0.2 }}
            />
          </svg>
          {/* Center Content */}
          <div className="absolute inset-2 bg-gradient-to-tr from-blue-50 to-indigo-50/30 rounded-full flex flex-col items-center justify-center shadow-inner">
            <Sparkles className="w-5 h-5 text-blue-600 animate-pulse mb-1" />
            <span className="text-lg font-black text-blue-800 font-mono tracking-tight">{progress}%</span>
          </div>
        </div>

        {/* Main Heading & Dynamic Subtext */}
        <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-2 leading-tight">
          در حال حل مسئله با هوش مصنوعی ربات امیرعلی
        </h3>
        
        {/* Dynamic State Status Bar */}
        <p className="text-xs text-blue-600 font-black mb-6 animate-pulse" dir="rtl">
          {progressStatus}
        </p>

        {/* Custom Progress Bar Track */}
        <div className="w-full max-w-sm h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-150 p-0.5 shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-xs"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut", duration: 0.15 }}
          />
        </div>
        
        <p className="text-[10px] text-gray-400 font-bold mt-3" dir="rtl">
          سیستم با حداکثر توان پردازشی در حال مدل‌سازی مسئله شماست...
        </p>
      </div>
    );
  }

  if (!solution) {
    return (
      <div className="bg-gradient-to-br from-blue-50/40 via-white to-gray-50 rounded-3xl p-12 border border-blue-100/60 shadow-sm flex flex-col items-center justify-center min-h-[320px] text-center">
        <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-5 shadow-md border border-blue-100/60 animate-bounce">
          <Award className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-black text-gray-800 mb-2">آماده دریافت مسئله ریاضی شما!</h3>
        <p className="text-sm text-gray-500 max-w-lg leading-relaxed font-medium">
          یک سوال تایپ کنید، فرمولی بنویسید، یک عکس آپلود کنید، با دوربین عکس بگیرید یا در تخته هوشمند رسم کنید تا ربات فوق‌حرفه‌ای امیرعلی بلافاصله پاسخ گام‌به‌گام و جدول‌بندی شده را نمایش دهد.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring" }}
      id="response-card"
      className="bg-white rounded-3xl border border-blue-200 shadow-lg overflow-hidden"
    >
      {/* Card Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white p-6 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner animate-pulse">
            <Sparkles className="w-6 h-6 text-blue-50" />
          </div>
          <div>
            <h4 className="font-black text-lg leading-tight tracking-tight">پاسخ نهایی و تشریحی ربات</h4>
            <p className="text-xs text-blue-100 font-semibold mt-0.5">جدول‌بندی شده و بخش به بخش</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white flex items-center justify-center cursor-pointer hover:scale-105"
            title="کپی کردن کل متن"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-200 animate-pulse" /> : <Copy className="w-5 h-5" />}
          </button>
          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white flex items-center justify-center cursor-pointer hover:scale-105"
            title="اشتراک‌گذاری"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 md:p-10">
        <div
          ref={containerRef}
          className="math-content text-gray-800 leading-relaxed text-right text-base break-words space-y-5"
          dangerouslySetInnerHTML={{ __html: parseMarkdown(solution) }}
        />
      </div>

      {/* Card Footer Info */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <span className="flex items-center gap-1.5 font-medium">
          <AlertCircle className="w-4 h-4 text-blue-500 animate-pulse" />
          نتایج گام‌به‌گام و جدول‌بندی شده بر اساس تکنولوژی LaTeX پیاده‌سازی شده‌اند.
        </span>
        <span className="font-mono font-bold text-blue-600">AMIRALI AI v2.0</span>
      </div>
    </motion.div>
  );
}
