export interface HistoryItem {
  id: string;
  timestamp: number;
  prompt: string;
  image?: string; // base64 encoded image
  solution: string;
  sourceType: "text" | "upload" | "camera" | "canvas";
}

export interface MathFormula {
  name: string;
  latex: string;
  description: string;
}

export interface SubjectCategory {
  id: string;
  name: string;
  icon: string;
  formulas: MathFormula[];
}
