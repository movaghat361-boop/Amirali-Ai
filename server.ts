import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

// Lazy-loaded Gemini client to handle missing API keys gracefully
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("کلید اختصاصی GEMINI_API_KEY یافت نشد. لطفاً آن را در بخش Settings > Secrets تعریف کنید.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// Helper function to handle robust content generation with model fallbacks and exponential backoff retries (e.g. to recover from temporary 503 errors)
async function generateContentWithRetry(ai: any, params: {
  modelCandidates: string[];
  contents: any[];
  config: any;
  maxRetriesPerModel?: number;
}) {
  const { modelCandidates, contents, config, maxRetriesPerModel = 2 } = params;
  let lastError = null;

  for (const model of modelCandidates) {
    for (let attempt = 1; attempt <= maxRetriesPerModel; attempt++) {
      try {
        console.log(`[AI Request] Attempting with model: ${model} (Attempt ${attempt}/${maxRetriesPerModel})`);
        const response = await ai.models.generateContent({
          model,
          contents,
          config,
        });
        if (response && response.text) {
          console.log(`[AI Request] Successfully generated response using model: ${model}`);
          return response;
        }
      } catch (err: any) {
        console.warn(`[AI Request] Model ${model} (attempt ${attempt}) failed or busy:`, err.message || err);
        lastError = err;
        
        if (attempt < maxRetriesPerModel) {
          const delay = attempt * 800; // 800ms, then 1600ms
          console.log(`[AI Request] Waiting ${delay}ms before retrying ${model}...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
  }
  
  throw lastError || new Error("تمامی تلاش‌ها برای برقراری ارتباط با هوش مصنوعی با خطا مواجه شد. لطفا دوباره تلاش کنید.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Configure JSON body parser with a large limit for image uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API endpoint for solving math problems
  app.post("/api/solve", async (req, res) => {
    try {
      const { prompt, image, mimeType, gradeLevel, responseStyle, responseFormat } = req.body;

      if (!prompt && !image) {
        res.status(400).json({ error: "لطفاً سوال یا تصویر مسئله را وارد کنید." });
        return;
      }

      const ai = getGeminiClient();

      // Configure a highly professional instruction set to return beautifully structured, mathematically precise answers
      const systemInstruction = `You are "Amirali Math AI" (هوش مصنوعی ریاضی امیرعلی), a world-class mathematics solver and elite computational intelligence created by "Amirali" (امیرعلی).
Your goal is to provide mathematically flawless, rigorous, and highly clear solutions strictly in Persian (فارسی).

CONTEXT SPECIFICATION:
- Student Grade Level: ${gradeLevel || "عمومی / دبیرستان"}
- Response Style Preference: ${responseStyle || "گام‌به‌گام به همراه جدول مشخصات"}
- Output Format Preference: ${responseFormat || "فارسی با فرمول‌های علمی شکیل"}

STRICT MATHEMATICAL SOLVING RULES:
1. NO CHATTY OR INTRODUCTORY FLUFF: Start the solution immediately with zero preamble or conversational greetings.
2. DIRECTNESS & BREVITY: Avoid long-winded paragraphs of text or unnecessary explanations. The user wants the exact mathematical answer clearly. Get straight to the formulas, calculations, and exact values.
3. IF IT IS A MULTIPLE-CHOICE QUESTION (سؤال تستی):
   - You MUST identify and state the CORRECT OPTION (گزینه صحیح) at the very top of your response in a highlighted, beautiful Markdown format.
   - Example: "**گزینه صحیح: گزینه ۳ (مقدار $x = 5$)**"
4. PROPER LATEX FORMULAS: You must wrap ALL mathematical equations, variables, operations, and numbers in standard LaTeX. Use $ ... $ for inline math (e.g. $f(x) = x^2$) and $$ ... $$ for separate line block equations. Never write raw equations without LaTeX markup.
5. EXQUISITE STRUCTURE:
   - **جدول مشخصات مسئله** (Brief Table of Given/Target Variables).
   - **مراحل حل ریاضی** (Step-by-step rigorous calculation steps using clean LaTeX).
   - **پاسخ نهایی** (Highlighted box containing only the final numerical/analytical answer in Persian).
6. GRADE ADAPTABILITY: Tailor your mathematical language and tools perfectly to "${gradeLevel}". If university level, use proper academic notations (integrals, matrices, limits). If primary school level, use clean, simplified step-by-step arithmetic without advanced algebra.`;

      const contents: any[] = [];

      // Add image if present
      if (image) {
        // Image comes as base64. Ensure we strip the data:image/...;base64, prefix if present
        let base64Data = image;
        let actualMime = mimeType || "image/png";

        if (image.includes(";base64,")) {
          const parts = image.split(";base64,");
          actualMime = parts[0].replace("data:", "");
          base64Data = parts[1];
        }

        contents.push({
          inlineData: {
            mimeType: actualMime,
            data: base64Data,
          },
        });
      }

      // Add text prompt (or default request if only image is sent)
      contents.push({
        text: prompt || "لطفاً این مسئله ریاضی را با جزئیات کامل و فرمول‌های زیبا حل کن.",
      });

      // Attempt to generate solution with candidate models in sequence and exponential backoff retries to prevent any 503 high demand outages
      const candidateModels = [
        "gemini-2.5-flash",
        "gemini-1.5-flash",
        "gemini-3.5-flash",
        "gemini-2.5-pro"
      ];

      const response = await generateContentWithRetry(ai, {
        modelCandidates: candidateModels,
        contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.1, // Keep lower temperature for stable calculations
        },
        maxRetriesPerModel: 2
      });

      const solution = response.text || "متأسفانه پاسخی تولید نشد. دوباره تلاش کنید.";
      res.json({ success: true, solution });
    } catch (error: any) {
      console.error("Error solving math problem:", error);
      res.status(500).json({
        success: false,
        error: error.message || "خطایی در برقراری ارتباط با هوش مصنوعی رخ داد.",
      });
    }
  });

  // Chatbot endpoint for answering questions about the app
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: "لیست پیام‌ها یافت نشد." });
        return;
      }

      const ai = getGeminiClient();

      // Setup specialized system instruction that ONLY answers questions about the app features and creator Amirali
      const chatbotInstruction = `You are "Amirali Math AI Assistant" (راهنمای هوش مصنوعی ریاضی امیرعلی).
Your absolute, strict, and ONLY purpose is to answer questions about this specific application, its features, and its creator "Amirali" (امیرعلی).

APP INFORMATION:
- Creator: Amirali (امیرعلی), a passionate and expert software developer.
- Primary Features:
  1. Solve math problems using 4 inputs: Typing mathematical expressions, Uploading practice sheets/exercise images, Taking direct camera shots of exercises, and Drawing/Writing directly on an interactive canvas.
  2. Multi-grade level adaptations (Elementary, Highschool, University, etc.).
  3. Formatted outputs with elegant LaTeX symbols, custom summary tables, and clear final steps.
  4. Fully responsive layout optimized for 6.9-inch mobile screens and desktop computers.
  5. Built-in instant-rendering LaTeX, formula library, and robust storage to track history without browser quota issues.

STRICT BEHAVIOR RULES:
1. ONLY answer questions regarding the app's features, how to use them, or its creator Amirali.
2. If the user asks you to solve a math problem, or write code, or do any general knowledge task in this chat, you MUST politely decline and tell them:
   "من دستیار راهنمای برنامه هستم و فقط می‌توانم به سوالات درباره ویژگی‌های این اپلیکیشن و نحوه کار با آن یا سازنده آن (امیرعلی) پاسخ دهم. برای حل مسائل ریاضی لطفا از بخش ورودی صفحه اصلی (تایپ، دوربین، نقاشی یا آپلود تصویر) استفاده فرمایید تا توسط موتور قدرتمند حل ریاضی پردازش شود."
3. Speak in warm, polite, and fluent Persian (فارسی). Avoid long intros. Keep responses useful and crisp.`;

      // Map messages to Gemini API format: contents: [{role: 'user'|'model', parts: [{text: ...}]}]
      const contents = messages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      // Attempt to generate chatbot response with candidate models in sequence and exponential backoff retries to prevent any 503 high demand outages
      const candidateModels = [
        "gemini-2.5-flash",
        "gemini-1.5-flash",
        "gemini-3.5-flash",
        "gemini-2.5-pro"
      ];

      const response = await generateContentWithRetry(ai, {
        modelCandidates: candidateModels,
        contents,
        config: {
          systemInstruction: chatbotInstruction,
          temperature: 0.2,
        },
        maxRetriesPerModel: 2
      });

      const reply = response.text || "متأسفانه پاسخی دریافت نشد. لطفاً مجدداً پیام خود را ارسال کنید.";
      res.json({ success: true, reply });
    } catch (error: any) {
      console.error("Error in app chatbot:", error);
      res.status(500).json({
        success: false,
        error: error.message || "خطایی در دریافت پاسخ از ربات راهنما رخ داد.",
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", time: new Date() });
  });

  // Set up Vite dev server or serve built assets based on NODE_ENV
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Amirali Math AI Server] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start the Express server:", err);
});
