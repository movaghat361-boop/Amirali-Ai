import React, { useRef, useState, useEffect } from "react";
import { Trash2, RotateCcw, Paintbrush, Eraser, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface MathCanvasProps {
  onSolve: (imageBase64: string) => void;
  isLoading: boolean;
}

export default function MathCanvas({ onSolve, isLoading }: MathCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#0d9488"); // Default teal
  const [brushSize, setBrushSize] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Initialize canvas with correct pixel ratio
  useEffect(() => {
    initCanvas();
  }, []);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions based on client size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height || 300;

    // Set clean background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save initial state to history
    const initialState = canvas.toDataURL();
    setHistory([initialState]);
    setHistoryIndex(0);
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const state = canvas.toDataURL();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(state);
    
    // Limit history size to 20
    if (newHistory.length > 20) {
      newHistory.shift();
    }

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    if ("clientX" in e) {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    } else if ("touches" in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }

    return { x: 0, y: 0 };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = isEraser ? "#ffffff" : color;
    ctx.lineWidth = brushSize;

    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      restoreState(history[prevIndex]);
    }
  };

  const restoreState = (dataUrl: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  };

  const handleSubmit = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Export as Base64 image
    const imageBase64 = canvas.toDataURL("image/png");
    onSolve(imageBase64);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
        
        {/* Colors */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 ml-1">رنگ قلم:</span>
          {[
            { value: "#0d9488", label: "سبز آبی" },
            { value: "#1e40af", label: "سرمه‌ای" },
            { value: "#dc2626", label: "قرمز" },
            { value: "#111827", label: "مشکی" },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => {
                setColor(item.value);
                setIsEraser(false);
              }}
              style={{ backgroundColor: item.value }}
              className={`w-7 h-7 rounded-full cursor-pointer transition-all ${
                color === item.value && !isEraser
                  ? "ring-2 ring-offset-2 ring-teal-500 scale-110"
                  : "hover:scale-105"
              }`}
              title={item.label}
            />
          ))}
        </div>

        {/* Thickness */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 ml-1">ضخامت:</span>
          {[2, 4, 8, 12].map((size) => (
            <button
              key={size}
              onClick={() => setBrushSize(size)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                brushSize === size
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {size === 2 ? "نازک" : size === 4 ? "متوسط" : size === 8 ? "پهن" : "خیلی پهن"}
            </button>
          ))}
        </div>

        {/* Tools */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsEraser(false)}
            className={`p-2 rounded-xl cursor-pointer transition-all ${
              !isEraser ? "bg-teal-100 text-teal-800" : "bg-white hover:bg-gray-100 text-gray-600"
            }`}
            title="قلم معمولی"
          >
            <Paintbrush className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsEraser(true)}
            className={`p-2 rounded-xl cursor-pointer transition-all ${
              isEraser ? "bg-teal-100 text-teal-800" : "bg-white hover:bg-gray-100 text-gray-600"
            }`}
            title="پاک‌کن"
          >
            <Eraser className="w-5 h-5" />
          </button>
          <div className="w-[1px] h-6 bg-gray-200 mx-1" />
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className={`p-2 rounded-xl transition-all ${
              historyIndex > 0 ? "bg-white hover:bg-gray-100 text-gray-600 cursor-pointer" : "text-gray-300 cursor-not-allowed"
            }`}
            title="مرحله قبل"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={handleClear}
            className="p-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-100 cursor-pointer transition-all"
            title="پاک کردن همه"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Drawing Canvas */}
      <div className="relative border-2 border-dashed border-teal-100 rounded-3xl bg-white overflow-hidden shadow-inner flex flex-col justify-between">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-[320px] cursor-crosshair block touch-none"
        />

        {/* Watermark Chalk Guide */}
        <div className="absolute top-3 left-4 text-[10px] text-gray-400 font-medium select-none pointer-events-none">
          تخته رسم هوشمند امیرعلی
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end mt-1">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full md:w-auto px-8 py-3.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-2xl font-bold shadow-md shadow-teal-500/15 flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <Sparkles className="w-5 h-5 text-teal-100" />
          <span>اسکن و حل فرمول‌های رسم شده</span>
        </motion.button>
      </div>
    </div>
  );
}
