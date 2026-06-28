import React, { useRef, useState, useEffect } from "react";
import { Camera, RefreshCw, Sparkles, AlertCircle, Check, X } from "lucide-react";
import { motion } from "motion/react";

interface MathCameraProps {
  onCapture: (imageBase64: string) => void;
  isLoading: boolean;
}

export default function MathCamera({ onCapture, isLoading }: MathCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<"idle" | "granted" | "denied" | "loading">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stream]);

  const startCamera = async () => {
    setPermissionState("loading");
    setErrorMessage("");
    try {
      // Prioritize environment (rear-facing) camera on mobile
      const constraints = {
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setPermissionState("granted");

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(console.error);
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setPermissionState("denied");
      setErrorMessage(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "دسترسی به دوربین توسط شما رد شد. لطفاً دسترسی دوربین را در مرورگر خود فعال کنید."
          : "دوربین مناسبی پیدا نشد یا در حال استفاده توسط برنامه دیگری است."
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Use actual video resolution
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get Base64 image url
    const base64Data = canvas.toDataURL("image/jpeg");
    setCapturedImage(base64Data);
    stopCamera();
  };

  const resetPhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleSubmit = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Hidden canvas for drawing frame */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Viewport */}
      <div className="relative border-2 border-dashed border-teal-100 rounded-3xl bg-gray-900 overflow-hidden shadow-inner flex flex-col items-center justify-center min-h-[340px]">
        {capturedImage ? (
          /* Captured Preview */
          <div className="relative w-full h-[340px] flex items-center justify-center bg-black">
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-4 right-4 bg-teal-600/95 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-200" />
              <span>تصویر با موفقیت ثبت شد</span>
            </div>
          </div>
        ) : permissionState === "granted" ? (
          /* Camera Stream View */
          <div className="relative w-full h-[340px] flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Guide framing bracket overlay */}
            <div className="absolute inset-0 border-[35px] border-black/40 pointer-events-none flex items-center justify-center">
              <div className="w-64 h-48 border-2 border-dashed border-teal-400 rounded-xl relative shadow-[0_0_50px_rgba(13,148,136,0.2)]">
                <div className="absolute inset-x-0 -top-6 text-center text-xs text-teal-300 font-bold bg-black/70 px-2 py-0.5 rounded-full mx-auto w-fit">
                  مسئله را داخل این کادر قرار دهید
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Initial Screen / Trigger Button */
          <div className="p-8 text-center flex flex-col items-center gap-4 max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-teal-950/50 flex items-center justify-center text-teal-400 border border-teal-900 shadow-lg">
              <Camera className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-white font-bold text-lg mb-1.5">اسکن مستقیم با دوربین گوشی</h4>
              <p className="text-gray-400 text-xs leading-relaxed">
                برای تحلیل و حل سریع عکس تمرین‌های خود، دسترسی به دوربین را فعال کنید.
              </p>
            </div>
            
            {permissionState === "denied" && (
              <div className="bg-rose-950/40 border border-rose-900 text-rose-300 p-3 rounded-xl text-xs flex gap-2 items-start text-right">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              onClick={startCamera}
              disabled={permissionState === "loading"}
              className="mt-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-800 text-white font-bold rounded-xl cursor-pointer shadow-md shadow-teal-950/30 text-sm transition-all"
            >
              {permissionState === "loading" ? "در حال راه‌اندازی دوربین..." : "روشن کردن دوربین"}
            </button>
          </div>
        )}
      </div>

      {/* Action Controls */}
      {capturedImage ? (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={resetPhoto}
            className="flex-1 px-5 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer border border-gray-200 transition-all text-sm"
          >
            <RefreshCw className="w-4.5 h-4.5" />
            <span>عکس مجدد (تکرار)</span>
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-8 py-3.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-xl font-bold shadow-md shadow-teal-500/15 flex items-center justify-center gap-2 cursor-pointer transition-all text-sm"
          >
            <Sparkles className="w-4.5 h-4.5 text-teal-100" />
            <span>ارسال این عکس برای حل</span>
          </motion.button>
        </div>
      ) : permissionState === "granted" ? (
        <div className="flex gap-3">
          <button
            onClick={capturePhoto}
            className="flex-1 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-md shadow-teal-500/10 flex items-center justify-center gap-2 cursor-pointer transition-all text-sm"
          >
            <Camera className="w-5 h-5" />
            <span>ثبت عکس و فریز کردن</span>
          </button>
          <button
            onClick={stopCamera}
            className="p-4 bg-gray-100 hover:bg-rose-50 text-gray-500 hover:text-rose-600 border border-gray-200 rounded-2xl cursor-pointer transition-all"
            title="خروج و خاموش کردن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
