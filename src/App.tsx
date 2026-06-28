import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  BookOpen,
  History,
  Trash2,
  Upload,
  Camera,
  Keyboard,
  Paintbrush,
  Image as ImageIcon,
  MessageSquare,
  ChevronLeft,
  X,
  HelpCircle,
  Calendar,
  Layers,
  Menu,
  Sliders,
  GraduationCap,
  FileText,
  Info,
  Zap,
  Award,
  Calculator,
} from "lucide-react";
import { HistoryItem } from "./types";
import MathResponse from "./components/MathResponse";
import MathCanvas from "./components/MathCanvas";
import MathCamera from "./components/MathCamera";
import MathKeyboard from "./components/MathKeyboard";
import FormulaLibrary from "./components/FormulaLibrary";
import OfflineSolver from "./components/OfflineSolver";
import PracticeModule from "./components/PracticeModule";

export default function App() {
  // Solved state
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [solution, setSolution] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Advanced AI Options requested by user
  const [gradeLevel, setGradeLevel] = useState("متوسطه دوم (دبیرستان)");
  const [responseStyle, setResponseStyle] = useState("گام‌به‌گام به همراه جدول مشخصات");
  const [responseFormat, setResponseFormat] = useState("فارسی با فرمول‌های علمی شکیل");

  // Drawer / Menu Toggles
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);
  const [activePhoneView, setActivePhoneView] = useState<"solver" | "chatbot" | "formulas" | "practice" | "offline_solver">("solver");

  // Chatbot states for app information & support
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content: "سلام! من دستیار هوشمند راهنمای ربات ریاضی امیرعلی هستم. بپرسید چطور می‌توانم درباره دکمه‌ها، امکانات حل مسئله، تخته رسم یا سازنده برنامه (امیرعلی) به شما کمک کنم؟ 😊"
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Send message to dedicated help chatbot
  const handleSendChatMessage = async (textToSend?: string) => {
    const activeText = textToSend || chatInput;
    if (!activeText.trim() || isChatLoading) return;

    const newMsg = { role: "user" as const, content: activeText };
    const updatedMessages = [...chatMessages, newMsg];
    setChatMessages(updatedMessages);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      const data = await res.json();
      if (data.success) {
        setChatMessages([...updatedMessages, { role: "assistant" as const, content: data.reply }]);
      } else {
        setChatMessages([
          ...updatedMessages,
          { role: "assistant" as const, content: "متأسفانه خطایی در دریافت پاسخ رخ داد. دوباره ارسال کنید." }
        ]);
      }
    } catch (err) {
      console.error("Error in chatbot response:", err);
      setChatMessages([
        ...updatedMessages,
        { role: "assistant" as const, content: "خطای شبکه: اتصال با سرور راهنما برقرار نشد." }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Controls & UX tabs
  const [activeInputTab, setActiveInputTab] = useState<"text" | "upload" | "camera" | "canvas">("text");
  const [isDragOver, setIsDragOver] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("amirali_math_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to parse math history:", err);
      }
    }
  }, []);

  // Save history to localStorage with robust protection against QuotaExceededError
  const saveHistory = (items: HistoryItem[]) => {
    setHistory(items);
    
    try {
      localStorage.setItem("amirali_math_history", JSON.stringify(items));
    } catch (err: any) {
      console.warn("Storage quota exceeded, attempting to optimize and save history...", err);
      
      // Attempt to preserve only the most recent images to free up space.
      // We keep the image for only the latest 2 items, and clear it for older ones.
      let imageCount = 0;
      const optimizedItems = items.map((item) => {
        if (item.image) {
          imageCount++;
          if (imageCount > 2) {
            // Keep prompt and solution, but drop the heavy base64 image data for older items
            return { ...item, image: undefined };
          }
        }
        return item;
      });

      try {
        localStorage.setItem("amirali_math_history", JSON.stringify(optimizedItems));
        setHistory(optimizedItems);
      } catch (innerErr) {
        console.warn("Optimizing latest images still exceeded quota, dropping all image assets from history...", innerErr);
        
        // Drop ALL images from history
        const noImageItems = items.map(item => ({ ...item, image: undefined }));
        try {
          localStorage.setItem("amirali_math_history", JSON.stringify(noImageItems));
          setHistory(noImageItems);
        } catch (finalErr) {
          console.error("Failed to save even text-only history to localStorage:", finalErr);
          // Fallback: keep only the most recent 5 items (text-only)
          const skeletonItems = noImageItems.slice(0, 5);
          try {
            localStorage.setItem("amirali_math_history", JSON.stringify(skeletonItems));
            setHistory(skeletonItems);
          } catch (ultraFinalErr) {
            console.error("Extremely critical: localStorage is completely full or disabled.", ultraFinalErr);
          }
        }
      }
    }
  };

  // Drag and drop events for file uploading
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    processUploadedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processUploadedFile(file);
  };

  const processUploadedFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("لطفاً فقط فایل‌های تصویری آپلود کنید.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImage(null);
  };

  const handleSymbolClick = (symbol: string) => {
    setPrompt((prev) => prev + symbol);
  };

  const handleInsertFormula = (formula: string) => {
    setPrompt((prev) => prev + " " + formula);
    setActiveInputTab("text"); // Switch back to text tab to review
  };

  // Solve request
  const handleSolve = async (
    customPrompt?: string,
    customImage?: string,
    sourceTypeOverride?: "text" | "upload" | "camera" | "canvas"
  ) => {
    setIsLoading(true);
    setErrorMessage("");
    setSolution("");

    const activePrompt = customPrompt !== undefined ? customPrompt : prompt;
    const activeImage = customImage !== undefined ? customImage : image;
    const finalSourceType = sourceTypeOverride || activeInputTab;

    try {
      const response = await fetch("/api/solve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: activePrompt,
          image: activeImage,
          gradeLevel,
          responseStyle,
          responseFormat,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSolution(data.solution);

        // Append to local history
        const newItem: HistoryItem = {
          id: Math.random().toString(36).substring(7),
          timestamp: Date.now(),
          prompt: activePrompt || "حل مسئله از طریق تصویر اسکن شده",
          image: activeImage || undefined,
          solution: data.solution,
          sourceType: finalSourceType,
        };

        const updatedHistory = [newItem, ...history].slice(0, 30); // Keep max 30 items
        saveHistory(updatedHistory);
      } else {
        setErrorMessage(data.error || "خطایی در تحلیل مسئله ریاضی رخ داد.");
      }
    } catch (err: any) {
      console.error("Error calling solver API:", err);
      setErrorMessage("اتصال با سرور برقرار نشد. لطفاً وضعیت اینترنت یا کلید API خود را بررسی کنید.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reload an item from history
  const handleSelectHistoryItem = (item: HistoryItem) => {
    setPrompt(item.prompt);
    setImage(item.image || null);
    setSolution(item.solution);
    setActiveInputTab(item.sourceType);
    setShowHistorySidebar(false); // Close on mobile for convenience

    // Scroll smoothly inside the phone frame
    setTimeout(() => {
      const respCard = document.getElementById("response-card");
      if (respCard) {
        respCard.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  // Clear single history item
  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter((item) => item.id !== id);
    saveHistory(updated);
  };

  // Clear entire history
  const handleClearAllHistory = () => {
    if (confirm("آیا از پاک کردن کامل تاریخچه حل مطمئن هستید؟")) {
      saveHistory([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex items-center justify-center p-0 sm:p-4 md:p-6 lg:p-8 font-sans relative overflow-hidden antialiased">
      {/* Blueprint grid and mathematical radial highlight backgrounds */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative desktop information panel on the left of the phone (only shown on md/lg screens) */}
      <div className="hidden xl:flex flex-col max-w-[320px] mr-12 space-y-6 text-right select-none" dir="rtl">
        <div className="space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">هوش ریاضی امیرعلی</h2>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            یک محیط کاربری همه‌جانبه و منحصربه‌فرد با طراحی شبیه‌سازی شده صفحه نمایش مدرن ۶.۹ اینچی گوشی‌های پرچمدار. پاسخگویی فوق‌سریع در کمتر از ۱۵ ثانیه با تلفیق مدل‌های برتر هوش مصنوعی.
          </p>
        </div>

        <div className="p-4 bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 space-y-3">
          <div className="text-xs font-black text-blue-400 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-blue-500 animate-bounce" />
            <span>امکانات بی‌پایان پلتفرم</span>
          </div>
          <ul className="text-[11px] text-slate-300 space-y-2 font-medium">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>پاسخگویی لحظه‌ای زیر ۵ ثانیه</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>چت‌بات راهنمای هوشمند برنامه</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>اسکن سریع تصویر و دوربین زنده</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>تخته رسم تعاملی و ریاضی نویسی</span>
            </li>
          </ul>
        </div>

        <div className="p-4 bg-slate-800/20 rounded-xl border border-slate-700/30 text-center">
          <div className="text-[10px] text-slate-500 font-bold">طراحی شده با استانداردهای نوین رابط کاربری</div>
          <div className="text-[11px] font-black text-slate-400 font-mono tracking-wider mt-1">DEVELOPED BY AMIRALI</div>
        </div>
      </div>

      {/* Main 6.9-inch Smartphone Frame wrapper */}
      <div className="w-full h-screen sm:h-[860px] sm:max-w-[430px] bg-slate-50 text-slate-800 sm:rounded-[54px] sm:border-[12px] sm:border-slate-950 flex flex-col overflow-hidden relative shadow-2xl transition-all duration-300 sm:ring-4 sm:ring-slate-800/10">
        
        {/* Mock Physical Camera Notch / Punch-hole Camera */}
        <div className="hidden sm:block absolute top-3.5 left-1/2 transform -translate-x-1/2 w-28 h-5.5 bg-slate-950 rounded-full z-50 flex items-center justify-between px-3.5 text-white select-none">
          <div className="w-2 h-2 rounded-full bg-blue-900 border border-blue-500/30 animate-pulse" />
          <div className="w-1 h-1 rounded-full bg-slate-800" />
        </div>

        {/* Live Device Status Bar */}
        <div className="bg-white/95 backdrop-blur-md px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-mono font-black text-gray-800 sticky top-0 z-40 select-none border-b border-gray-100" dir="ltr">
          <div className="flex items-center gap-1">
            <span>{new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 scale-95">6.9" Screen</span>
            {/* WiFi Icon */}
            <svg className="w-3 h-3 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8.5 14.5a5 5 0 017 0M5 11a10 10 0 0114 0" />
            </svg>
            {/* 5G Label */}
            <span className="text-[9px] font-extrabold text-blue-600 tracking-tighter">5G</span>
            {/* Battery Indicator */}
            <div className="w-5 h-2.5 border border-gray-700 rounded-sm p-0.5 flex items-center">
              <div className="w-full h-full bg-emerald-500 rounded-2xs" />
            </div>
          </div>
        </div>

        {/* Dynamic Frame Body with switchable views inside */}
        <div className="flex-1 overflow-y-auto bg-slate-50 flex flex-col" id="phone-scroll-container">
          
          {/* Main Top App Header inside the phone */}
          <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
            {/* Left controls: Menu button */}
            <button
              onClick={() => setShowMenuDrawer(true)}
              className="p-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl border border-gray-150 transition-all cursor-pointer"
              title="منوی برنامه"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Middle: Brand name */}
            <div className="text-center">
              <div className="text-[9px] font-mono font-black tracking-widest text-blue-600 flex items-center justify-center gap-1">
                <span>AMIRALI</span>
                <span className="text-gray-300">&amp;</span>
                <span>ME</span>
                <span className="bg-blue-50 px-1 rounded border border-blue-100 scale-75">AI</span>
              </div>
              <h1 className="text-xs font-black text-gray-900 mt-0.5">هوش ریاضی امیرعلی</h1>
            </div>

            {/* Right: History Toggle button */}
            <button
              onClick={() => setShowHistorySidebar(!showHistorySidebar)}
              className="p-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl border border-gray-150 transition-all cursor-pointer relative"
              title="تاریخچه مسائل"
            >
              <History className="w-4 h-4" />
              {history.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                  {history.length}
                </span>
              )}
            </button>
          </header>

          {/* ACTIVE VIEW RENDERING */}
          <div className="flex-1 p-4 space-y-5 pb-24">
            
            {/* 1. MATH SOLVER VIEW */}
            {activePhoneView === "solver" && (
              <>
                {/* Welcome & Banner */}
                <div className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="relative z-10 space-y-1.5 text-right" dir="rtl">
                    <span className="text-blue-300 text-[8px] font-black bg-blue-900/60 border border-blue-800 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <Zap className="w-2.5 h-2.5 text-blue-400 animate-pulse" />
                      پاسخگویی فوق‌سریع در ۱۵ ثانیه
                    </span>
                    <h2 className="text-xs sm:text-sm font-black">حل پیشرفته ریاضی امیرعلی</h2>
                    <p className="text-[10px] text-blue-100/80 leading-relaxed font-medium">
                      مسئله خود را تایپ کنید، بکشید، یا تصویر آن را آپلود یا اسکن کنید تا گام‌به‌گام با جداول شیک پاسخ داده شود.
                    </p>
                  </div>
                </div>

                {/* Main Input Control Panel Card */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-2xs overflow-hidden">
                  {/* Input Tabs Row */}
                  <div className="flex border-b border-blue-50 bg-slate-50/50 p-1.5 gap-1 overflow-x-auto scrollbar-none" dir="rtl">
                    <button
                      onClick={() => { setActiveInputTab("text"); setErrorMessage(""); }}
                      className={`flex-1 flex items-center justify-center gap-1 py-2 px-1.5 rounded-lg text-[10px] font-black whitespace-nowrap cursor-pointer transition-all ${
                        activeInputTab === "text"
                          ? "bg-white text-blue-700 shadow-2xs border border-blue-100/30"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      <Keyboard className="w-3.5 h-3.5 text-blue-500" />
                      <span>تایپ</span>
                    </button>

                    <button
                      onClick={() => { setActiveInputTab("upload"); setErrorMessage(""); }}
                      className={`flex-1 flex items-center justify-center gap-1 py-2 px-1.5 rounded-lg text-[10px] font-black whitespace-nowrap cursor-pointer transition-all ${
                        activeInputTab === "upload"
                          ? "bg-white text-blue-700 shadow-2xs border border-blue-100/30"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                      <span>آپلود</span>
                    </button>

                    <button
                      onClick={() => { setActiveInputTab("camera"); setErrorMessage(""); }}
                      className={`flex-1 flex items-center justify-center gap-1 py-2 px-1.5 rounded-lg text-[10px] font-black whitespace-nowrap cursor-pointer transition-all ${
                        activeInputTab === "camera"
                          ? "bg-white text-blue-700 shadow-2xs border border-blue-100/30"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5 text-blue-500" />
                      <span>دوربین</span>
                    </button>

                    <button
                      onClick={() => { setActiveInputTab("canvas"); setErrorMessage(""); }}
                      className={`flex-1 flex items-center justify-center gap-1 py-2 px-1.5 rounded-lg text-[10px] font-black whitespace-nowrap cursor-pointer transition-all ${
                        activeInputTab === "canvas"
                          ? "bg-white text-blue-700 shadow-2xs border border-blue-100/30"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      <Paintbrush className="w-3.5 h-3.5 text-blue-500" />
                      <span>رسم</span>
                    </button>
                  </div>

                  {/* Input Body */}
                  <div className="p-4" dir="rtl">
                    {activeInputTab === "text" && (
                      <div className="space-y-3">
                        <textarea
                          id="math-text-prompt"
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="مثال: ریشه‌های معادله x^2 - 5x + 6 = 0 چیست؟"
                          className="w-full h-24 p-3 text-xs bg-gray-50 border border-gray-150 focus:border-blue-500 focus:bg-white rounded-xl focus:outline-none transition-all resize-none text-right placeholder-gray-400 font-medium"
                        />
                        
                        {/* Math Virtual Keys */}
                        <MathKeyboard onSymbolClick={handleSymbolClick} />

                        {image && (
                          <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <img src={image} className="w-10 h-10 object-cover rounded border border-blue-200" alt="Attachment" referrerPolicy="no-referrer" />
                              <div className="text-[10px] text-right">
                                <span className="font-black text-blue-900 block">تصویر ضمیمه شد</span>
                              </div>
                            </div>
                            <button onClick={clearImage} className="p-1 hover:bg-rose-50 text-rose-600 rounded-lg border border-rose-100 cursor-pointer">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        <div className="pt-1 flex">
                          <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSolve()}
                            disabled={isLoading || (!prompt.trim() && !image)}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                            <span>شروع حل مسئله ریاضی</span>
                          </motion.button>
                        </div>
                      </div>
                    )}

                    {activeInputTab === "upload" && (
                      <div className="space-y-3">
                        {image ? (
                          <div className="space-y-3">
                            <div className="relative border border-gray-150 rounded-2xl bg-gray-50 overflow-hidden flex items-center justify-center h-48">
                              <img src={image} alt="Preview" className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                              <button onClick={clearImage} className="absolute top-2 right-2 bg-white/90 hover:bg-rose-50 text-rose-600 p-1.5 rounded-xl shadow-xs border border-rose-100 cursor-pointer">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <input
                              type="text"
                              value={prompt}
                              onChange={(e) => setPrompt(e.target.value)}
                              placeholder="توضیح اضافی یا صورت سوال (اختیاری)..."
                              className="w-full p-2.5 text-xs bg-gray-50 border border-gray-150 focus:border-blue-500 rounded-xl focus:outline-none transition-all text-right"
                            />
                            <button
                              onClick={() => handleSolve()}
                              disabled={isLoading}
                              className="w-full py-3 bg-blue-600 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>اسکن و حل مسئله تصویر</span>
                            </button>
                          </div>
                        ) : (
                          <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-2xl p-6 text-center flex flex-col items-center justify-center min-h-[160px] cursor-pointer transition-all ${
                              isDragOver ? "border-blue-500 bg-blue-50/40" : "border-gray-200 bg-gray-50/50 hover:border-blue-350"
                            }`}
                          >
                            <input id="file-upload-input" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                            <label htmlFor="file-upload-input" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 border border-gray-100 shadow-3xs">
                                <Upload className="w-5 h-5" />
                              </div>
                              <h4 className="text-gray-800 font-bold text-[11px]">انتخاب یا رها کردن عکس تمرین</h4>
                              <p className="text-gray-400 text-[9px] max-w-[200px] leading-tight">
                                فرمت‌های JPG یا PNG با نور کافی
                              </p>
                            </label>
                          </div>
                        )}
                      </div>
                    )}

                    {activeInputTab === "camera" && (
                      <div className="space-y-3">
                        <MathCamera
                          onCapture={(capturedBase64) => {
                            setImage(capturedBase64);
                            handleSolve(prompt || "لطفاً این مسئله ریاضی را حل کن.", capturedBase64, "camera");
                          }}
                          isLoading={isLoading}
                        />
                      </div>
                    )}

                    {activeInputTab === "canvas" && (
                      <div className="space-y-3">
                        <MathCanvas
                          onSolve={(drawnBase64) => {
                            setImage(drawnBase64);
                            handleSolve(prompt || "لطفاً این مسئله ریاضی که رسم شده است را حل کن.", drawnBase64, "canvas");
                          }}
                          isLoading={isLoading}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Advanced Options sheet styling for phone */}
                <div className="bg-white rounded-2xl border border-gray-150/80 p-4 space-y-3 text-right shadow-3xs" dir="rtl">
                  <h4 className="text-[11px] font-black text-gray-800 flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-blue-600" />
                    <span>تنظیمات پیشرفته هوش مصنوعی:</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="space-y-1">
                      <span className="text-gray-400 font-bold block">پایه تحصیلی:</span>
                      <select
                        value={gradeLevel}
                        onChange={(e) => setGradeLevel(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-150 p-1.5 rounded-lg text-[9px] font-black focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 cursor-pointer"
                      >
                        <option value="ابتدایی (پایه‌های اول تا ششم)">ابتدایی</option>
                        <option value="متوسطه اول (پایه‌های هفتم تا نهم)">متوسطه اول</option>
                        <option value="متوسطه دوم (دبیرستان و کنکور)">متوسطه دوم</option>
                        <option value="دانشگاهی (علوم پایه، مهندسی و پیشرفته)">دانشگاهی</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <span className="text-gray-400 font-bold block">عمق تحلیل:</span>
                      <select
                        value={responseStyle}
                        onChange={(e) => setResponseStyle(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-150 p-1.5 rounded-lg text-[9px] font-black focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 cursor-pointer"
                      >
                        <option value="گام‌به‌گام به همراه جدول مشخصات">گام‌به‌گام</option>
                        <option value="کامل و تفصیلی با جزئیات و تشریح">تفصیلی کامل</option>
                        <option value="خلاصه، تستی و کنکوری (فوق‌سریع)">تستی و خلاصه</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Errors */}
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl space-y-3 text-xs text-right"
                    dir="rtl"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 font-bold text-xs">!</div>
                      <div className="space-y-1">
                        <h5 className="font-black text-rose-900">بروز ترافیک در سرورهای ابری هوش مصنوعی</h5>
                        <p className="text-rose-600 leading-relaxed text-[10px]">{errorMessage}</p>
                      </div>
                    </div>

                    <div className="bg-white/80 p-3 rounded-xl border border-rose-100 space-y-2">
                      <p className="text-[10px] text-gray-600 font-bold leading-normal">
                        💡 ترافیک مدل‌های ابری هوش مصنوعی گوگل موقتاً بالاست. برای این که روند یادگیریتان متوقف نشود، همین حالا می‌توانید از <strong>فرمول‌حل‌کن هوشمند آفلاین</strong> یا <strong>آزمون‌ساز پیشرفته</strong> ما استفاده کنید:
                      </p>
                      <div className="flex gap-1.5 pt-1">
                        <button
                          onClick={() => { setActivePhoneView("offline_solver"); setErrorMessage(""); }}
                          className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-black rounded-lg cursor-pointer transition-all text-center"
                        >
                          حل فوری فرمول‌ها
                        </button>
                        <button
                          onClick={() => { setActivePhoneView("practice"); setErrorMessage(""); }}
                          className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-gray-700 text-[9px] font-black rounded-lg cursor-pointer transition-all text-center border border-gray-200"
                        >
                          آزمون خودارزیابی
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Math Solution output (rendered inside the mobile container!) */}
                <MathResponse solution={solution} isLoading={isLoading} />
              </>
            )}

            {/* 2. DEDICATED APP HELP CHATBOT VIEW */}
            {activePhoneView === "chatbot" && (
              <div className="bg-white rounded-2xl border border-blue-100 shadow-sm flex flex-col h-[520px] overflow-hidden" dir="rtl">
                {/* Chatbot Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-3 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white font-black animate-pulse">
                      <MessageSquare className="w-4.5 h-4.5 text-blue-200" />
                    </div>
                    <div className="text-right">
                      <h3 className="text-xs font-black">راهنمای هوشمند هوش ریاضی</h3>
                      <p className="text-[8px] text-blue-200 font-bold">پاسخگویی سریع اختصاصی درباره برنامه</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActivePhoneView("solver")}
                    className="p-1.5 hover:bg-white/10 text-white rounded-lg transition-all text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>بازگشت</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Welcome Warning Notice */}
                <div className="bg-blue-50/50 px-3 py-2 border-b border-blue-100 text-[10px] text-blue-800 text-right font-medium">
                  💡 من فقط به سوالات مربوط به <strong>امکانات این اپلیکیشن</strong> یا <strong>امیرعلی (سازنده برنامه)</strong> جواب می‌دهم.
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50 flex flex-col">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col max-w-[85%] ${
                        msg.role === "user" ? "self-end items-end" : "self-start items-start"
                      }`}
                    >
                      <div
                        className={`p-2.5 rounded-2xl text-[11px] leading-relaxed font-semibold text-right ${
                          msg.role === "user"
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-white text-gray-800 border border-gray-150 rounded-bl-none shadow-3xs"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[8px] text-gray-400 font-bold mt-1">
                        {msg.role === "user" ? "شما" : "دستیار راهنما"}
                      </span>
                    </div>
                  ))}

                  {isChatLoading && (
                    <div className="self-start flex items-center gap-2 bg-white border border-gray-100 px-3 py-2 rounded-2xl shadow-3xs">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                      <span className="text-[9px] text-gray-400 font-bold">در حال تایپ پاسخ...</span>
                    </div>
                  )}
                </div>

                {/* Suggestion Chips */}
                <div className="p-2 border-t border-gray-100 bg-white flex gap-1.5 overflow-x-auto scrollbar-none" dir="rtl">
                  <button
                    onClick={() => handleSendChatMessage("امکانات این برنامه ریاضی چیست؟")}
                    className="shrink-0 text-[9px] font-black bg-blue-50 text-blue-700 hover:bg-blue-100 px-2.5 py-1 rounded-full border border-blue-100 transition-all cursor-pointer"
                  >
                    امکانات برنامه؟
                  </button>
                  <button
                    onClick={() => handleSendChatMessage("سازنده این هوش مصنوعی کیست؟")}
                    className="shrink-0 text-[9px] font-black bg-blue-50 text-blue-700 hover:bg-blue-100 px-2.5 py-1 rounded-full border border-blue-100 transition-all cursor-pointer"
                  >
                    سازنده برنامه؟
                  </button>
                  <button
                    onClick={() => handleSendChatMessage("چطور از تخته رسم و دوربین استفاده کنم؟")}
                    className="shrink-0 text-[9px] font-black bg-blue-50 text-blue-700 hover:bg-blue-100 px-2.5 py-1 rounded-full border border-blue-100 transition-all cursor-pointer"
                  >
                    راهنمای ابزارها؟
                  </button>
                </div>

                {/* Input form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendChatMessage();
                  }}
                  className="p-2 border-t border-gray-150 bg-white flex gap-1.5 items-center"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="سوال خود درباره اپلیکیشن را بنویسید..."
                    className="flex-1 p-2 text-xs bg-slate-50 border border-gray-150 rounded-xl focus:outline-none focus:border-blue-500 font-bold text-gray-700"
                    disabled={isChatLoading}
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isChatLoading}
                    className="px-3 py-2 bg-blue-600 text-white font-extrabold text-xs rounded-xl hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-all cursor-pointer"
                  >
                    ارسال
                  </button>
                </form>
              </div>
            )}

            {/* 3. FORMULA REFERENCE LIBRARY VIEW */}
            {activePhoneView === "formulas" && (
              <div className="space-y-4" dir="rtl">
                <div className="bg-white rounded-2xl border border-gray-150 p-4 text-right">
                  <h3 className="text-xs font-black text-gray-800 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>کتابخانه جامع فرمول‌های ریاضی</span>
                  </h3>
                  <p className="text-[10px] text-gray-400 font-medium leading-relaxed mt-1">
                    برای کپی و درج سریع فرمول‌ها در کادر مسئله ریاضی، روی هر فرمول دلخواه کلیک کنید.
                  </p>
                </div>

                <FormulaLibrary
                  onInsertFormula={(formula) => {
                    handleInsertFormula(formula);
                    setActivePhoneView("solver"); // switch back to solve
                  }}
                />
              </div>
            )}

            {/* 4. PRACTICE / QUIZ MODULE VIEW */}
            {activePhoneView === "practice" && (
              <div className="space-y-4">
                <PracticeModule />
              </div>
            )}

            {/* 5. OFFLINE INSTANT SOLVER VIEW */}
            {activePhoneView === "offline_solver" && (
              <div className="space-y-4">
                <OfflineSolver />
              </div>
            )}

          </div>

          {/* BOTTOM DOCK NAVIGATION BAR inside the 6.9" phone layout */}
          <nav className="bg-white/95 backdrop-blur-md border-t border-gray-150 px-3 py-2 sticky bottom-0 z-35 flex items-center justify-between shadow-lg">
            {/* Nav Item 1: Solver */}
            <button
              onClick={() => setActivePhoneView("solver")}
              className={`flex-1 flex flex-col items-center gap-0.5 cursor-pointer transition-all ${
                activePhoneView === "solver" ? "text-blue-600 scale-105 font-black" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-[8px] font-black">حل مسائل</span>
            </button>

            {/* Nav Item 2: Offline Quick Solver */}
            <button
              onClick={() => setActivePhoneView("offline_solver")}
              className={`flex-1 flex flex-col items-center gap-0.5 cursor-pointer transition-all ${
                activePhoneView === "offline_solver" ? "text-blue-600 scale-105 font-black" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span className="text-[8px] font-black">فرمول فوری</span>
            </button>

            {/* Nav Item 3: Practice Module */}
            <button
              onClick={() => setActivePhoneView("practice")}
              className={`flex-1 flex flex-col items-center gap-0.5 cursor-pointer transition-all ${
                activePhoneView === "practice" ? "text-blue-600 scale-105 font-black" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span className="text-[8px] font-black">آزمون‌ساز</span>
            </button>

            {/* Nav Item 4: Formulas */}
            <button
              onClick={() => setActivePhoneView("formulas")}
              className={`flex-1 flex flex-col items-center gap-0.5 cursor-pointer transition-all ${
                activePhoneView === "formulas" ? "text-blue-600 scale-105 font-black" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="text-[8px] font-black">فرمول‌ها</span>
            </button>

            {/* Nav Item 5: App Chatbot */}
            <button
              onClick={() => setActivePhoneView("chatbot")}
              className={`flex-1 flex flex-col items-center gap-0.5 cursor-pointer transition-all ${
                activePhoneView === "chatbot" ? "text-blue-600 scale-105 font-black" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div className="relative">
                <MessageSquare className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 bg-blue-500 w-1 h-1 rounded-full animate-ping" />
              </div>
              <span className="text-[8px] font-black">راهنما</span>
            </button>
          </nav>

        </div>
      </div>

      {/* Slide-In History Sidebar Drawer */}
      <AnimatePresence>
        {showHistorySidebar && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistorySidebar(false)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />

            {/* Sidebar content */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white shadow-2xl z-50 border-l border-gray-100 flex flex-col justify-between text-right"
              dir="rtl"
            >
              {/* Header */}
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-600" />
                  <h3 className="font-extrabold text-gray-800 text-sm">تاریخچه حل مسائل ربات امیرعلی</h3>
                </div>
                <button
                  onClick={() => setShowHistorySidebar(false)}
                  className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-700 rounded-xl cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* List body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {history.length === 0 ? (
                  <div className="text-center py-20 text-gray-400 space-y-3">
                    <History className="w-12 h-12 mx-auto stroke-1 text-gray-300" />
                    <p className="text-xs font-bold">هیچ مسئله‌ای هنوز ذخیره نشده است.</p>
                    <p className="text-[10px] text-gray-400">سوالی بپرسید تا در اینجا بایگانی شود.</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectHistoryItem(item)}
                      className="p-4 bg-gray-50 hover:bg-blue-50/20 border border-gray-100 hover:border-blue-150 rounded-2xl cursor-pointer transition-all flex gap-3 relative group"
                    >
                      {/* Image Thumbnail inside History Item */}
                      {item.image ? (
                        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                          <img
                            src={item.image}
                            alt="Problem attachment"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100/50">
                          <MessageSquare className="w-5 h-5" />
                        </div>
                      )}

                      {/* Info text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-[9px] text-blue-600 font-bold mb-1">
                          <span className="capitalize">{item.sourceType === "text" ? "تایپ شده" : item.sourceType === "upload" ? "آپلود تصویر" : item.sourceType === "camera" ? "دوربین" : "تخته رسم"}</span>
                          <span>•</span>
                          <span>{new Date(item.timestamp).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <p className="text-xs font-bold text-gray-800 truncate mb-1 text-right">{item.prompt}</p>
                        <p className="text-[10px] text-gray-400 font-medium truncate leading-tight text-right">پاسخ ربات ذخیره شده است. کلیک کنید...</p>
                      </div>

                      {/* Trash Button */}
                      <button
                        onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                        className="absolute left-2 bottom-2 p-1.5 bg-white hover:bg-rose-50 text-gray-300 hover:text-rose-600 rounded-lg border border-gray-200/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="حذف از تاریخچه"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Clear History Footer button */}
              {history.length > 0 && (
                <div className="p-4 border-t border-gray-100">
                  <button
                    onClick={handleClearAllHistory}
                    className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer border border-rose-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>پاک کردن کامل تاریخچه حل</span>
                  </button>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Slide-In Menu & Guide Drawer */}
      <AnimatePresence>
        {showMenuDrawer && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenuDrawer(false)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />

            {/* Menu Drawer Content */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-full sm:w-[420px] bg-white shadow-2xl z-50 border-r border-blue-100 flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-5 border-b border-blue-50 flex items-center justify-between bg-blue-50/20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-800 text-sm">منوی کاربری و راهنما</h3>
                    <p className="text-[10px] text-blue-600 font-mono font-black">AMIRALI & ME MATH AI</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMenuDrawer(false)}
                  className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-700 rounded-xl cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Menu Body content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 text-right" dir="rtl">
                
                {/* Robot Bio Card */}
                <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-md space-y-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-200 animate-bounce" />
                    <h4 className="font-black text-xs">ابر دپارتمان حل مسئله ریاضی Amirali</h4>
                  </div>
                  <p className="text-[11px] text-blue-100 leading-relaxed font-medium">
                    این دستیار با قابلیت پاسخگویی برق‌آسا طراحی شده تا مسائل دشوار دیفرانسیل، هندسه، جبر، آمار و احتمال را ابتدا مدل‌سازی کند، مشخصات ورودی را جدول‌بندی نماید و سپس گام‌به‌گام تحلیل نهایی را ارائه دهد.
                  </p>
                </div>

                {/* Guide List */}
                <div className="space-y-3">
                  <h4 className="font-black text-gray-800 text-xs flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <span>امکانات و ابزارها</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="font-bold text-gray-800 text-[11px] mb-1">تخته رسم هوشمند</div>
                      <p className="text-[10px] text-gray-400 font-medium">امکان رسم شکل با قلم روی بوم</p>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="font-bold text-gray-800 text-[11px] mb-1">اسکن با دوربین</div>
                      <p className="text-[10px] text-gray-400 font-medium">عکس‌برداری زنده و تبدیل تصویر به متن</p>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="font-bold text-gray-800 text-[11px] mb-1">کیبورد ریاضی</div>
                      <p className="text-[10px] text-gray-400 font-medium">درج نمادهای تخصصی ریاضی</p>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="font-bold text-gray-800 text-[11px] mb-1">کتابخانه فرمول</div>
                      <p className="text-[10px] text-gray-400 font-medium">فرمول‌های آماده دبیرستان و کنکور</p>
                    </div>
                  </div>
                </div>

                {/* Step by Step Guide */}
                <div className="space-y-3">
                  <h4 className="font-black text-gray-800 text-xs flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span>چرا این هوش مصنوعی پیشرفته است؟</span>
                  </h4>
                  <ul className="text-[11px] text-gray-500 space-y-2.5 leading-relaxed font-medium mr-4 list-decimal">
                    <li><strong className="text-gray-800">تفکیک گام‌ها:</strong> فرمول‌های بکاررفته جزء به جزء باز شده و به ترتیب منطقی حل می‌شوند.</li>
                    <li><strong className="text-gray-800">جدول‌بندی نتایج:</strong> پارامترهای مجهول و مفروض مسئله در قالب جدول‌های زیبایی در خروجی رندر خواهند شد.</li>
                    <li><strong className="text-gray-800">نتیجه‌گیری پایانی:</strong> در انتهای پاسخ، خلاصه‌ای از جواب نهایی در یک باکس متمایز قرار می‌گیرد.</li>
                  </ul>
                </div>

                {/* Developer Credit */}
                <div className="p-4 bg-slate-50 rounded-xl border border-gray-150/60 text-center space-y-1">
                  <div className="text-[10px] text-gray-400 font-bold">صاحب امتیاز و طراحی ربات</div>
                  <div className="text-xs font-black text-blue-700 font-mono tracking-wider mt-1">DEVELOPED BY AMIRALI</div>
                </div>

              </div>

              {/* Close Footer button */}
              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={() => setShowMenuDrawer(false)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <span>بازگشت به تخته ریاضی</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
