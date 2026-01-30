
// --- Geometry Model Definitions V2 ---

export type Point = { x: number; y: number; label: string };
export type Line = { 
    start: string; 
    end: string; 
    type?: "solid" | "dashed";
    role?: "core" | "interference"; // V2: New role for Visual Gym
};

export type GeometryModel = {
  id: string;
  name: string;
  points: Point[];
  lines: Line[];
  initialHint: string;
  target: string; 
  relations: string[]; 
  proofSteps: string[];
  // V2: Gym Specifics
  rotationTarget?: number; // Target angle for Soul Rotation
};

// Helper to generate random offset
const r = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// 1. Hand-in-Hand (手拉手)
export const generateHandInHand = (): GeometryModel => {
  const C = { x: 150, y: 150, label: "C" };
  const A = { x: 100 + r(-5, 5), y: 80 + r(-5, 5), label: "A" };
  const B = { x: 60 + r(-5, 5), y: 180 + r(-5, 5), label: "B" };
  const D = { x: 200 + r(-5, 5), y: 90 + r(-5, 5), label: "D" };
  const E = { x: 240 + r(-5, 5), y: 190 + r(-5, 5), label: "E" };

  // Interference points
  const F = { x: 150 + r(-20, 20), y: 50 + r(-20, 20), label: "F" };

  return {
    id: "hand-in-hand",
    name: "手拉手模型",
    points: [A, B, C, D, E, F],
    lines: [
      { start: "A", end: "C", role: "core" }, { start: "B", end: "C", role: "core" }, { start: "A", end: "B", role: "core" },
      { start: "D", end: "C", role: "core" }, { start: "E", end: "C", role: "core" }, { start: "D", end: "E", role: "core" },
      { start: "A", end: "D", type: "dashed", role: "core" }, { start: "B", end: "E", type: "dashed", role: "core" },
      // Interference Lines
      { start: "A", end: "F", role: "interference" }, { start: "D", end: "F", role: "interference" }
    ],
    initialHint: "观察公共顶点C，找找旋转关系？",
    target: "求证 AD = BE",
    relations: ["AC=BC", "DC=EC", "∠ACD=∠BCE", "SAS全等"],
    proofSteps: [
      "∵ △ABC和△DEC是等边三角形",
      "∴ AC=BC, DC=EC, ∠ACB=∠DCE=60°",
      "∴ ∠ACB+∠BCD = ∠DCE+∠BCD",
      "即 ∠ACD = ∠BCE",
      "在△ACD和△BCE中...",
      "∴ △ACD ≅ △BCE (SAS)",
      "∴ AD = BE"
    ],
    rotationTarget: 60
  };
};

// 2. One-Line-Three-Angles (一线三等角)
export const generateKModel = (): GeometryModel => {
  return {
    id: "k-model",
    name: "一线三等角 (K字模型)",
    points: [
      { x: 50, y: 200, label: "B" },
      { x: 150, y: 200, label: "C" },
      { x: 250, y: 200, label: "D" },
      { x: 50, y: 100, label: "A" },
      { x: 250, y: 120, label: "E" },
      { x: 150, y: 100, label: "F" } // Interference
    ],
    lines: [
      { start: "B", end: "D", role: "core" },
      { start: "A", end: "B", role: "core" },
      { start: "E", end: "D", role: "core" },
      { start: "A", end: "C", role: "core" },
      { start: "C", end: "E", role: "core" },
      // Interference
      { start: "A", end: "F", role: "interference" }, { start: "C", end: "F", role: "interference" }
    ],
    initialHint: "看到直角和直线，能不能凑出互余？",
    target: "已知AB⊥BD, ED⊥BD, AC⊥CE。求证 △ABC ∽ △CDE",
    relations: ["∠B=∠D=90°", "∠ACB+∠DCE=90°", "∠A+∠ACB=90°", "∠A=∠DCE"],
    proofSteps: [
      "∵ AB⊥BD, ED⊥BD",
      "∴ ∠B = ∠D = 90°",
      "∵ AC⊥CE",
      "∴ ∠ACE = 90°",
      "∴ ∠ACB + ∠DCE = 90°",
      "又 ∵ ∠A + ∠ACB = 90°",
      "∴ ∠A = ∠DCE",
      "∴ △ABC ∽ △CDE"
    ],
    rotationTarget: 90
  };
};

// 3. Angle Bisector (角平分线)
export const generateAngleBisector = (): GeometryModel => {
  return {
    id: "angle-bisector",
    name: "角平分线模型",
    points: [
      { x: 50, y: 50, label: "A" },
      { x: 250, y: 50, label: "B" },
      { x: 50, y: 250, label: "C" },
      { x: 120, y: 120, label: "P" }, 
      { x: 120, y: 50, label: "D" }, 
      { x: 50, y: 120, label: "E" },
      { x: 200, y: 200, label: "M" } // Interference
    ],
    lines: [
      { start: "A", end: "B", role: "core" },
      { start: "A", end: "C", role: "core" },
      { start: "A", end: "P", type: "dashed", role: "core" },
      { start: "P", end: "D", role: "core" },
      { start: "P", end: "E", role: "core" },
      // Interference
      { start: "B", end: "M", role: "interference" }, { start: "C", end: "M", role: "interference" }
    ],
    initialHint: "角平分线上的点，到两边距离...",
    target: "已知AP平分∠BAC，PD⊥AB，PE⊥AC。求证 PD=PE",
    relations: ["AP平分∠BAC", "PD⊥AB", "PE⊥AC", "AAS全等"],
    proofSteps: [
      "∵ AP平分∠BAC",
      "∴ ∠DAP = ∠EAP",
      "∵ PD⊥AB, PE⊥AC",
      "∴ ∠ADP = ∠AEP = 90°",
      "在△ADP和△AEP中",
      "∠DAP=∠EAP, ∠ADP=∠AEP, AP=AP",
      "∴ △ADP ≅ △AEP (AAS)",
      "∴ PD = PE"
    ],
    rotationTarget: 0 // No rotation really needed, but can simulate fold
  };
};

export const MODELS = [
  generateHandInHand,
  generateKModel,
  generateAngleBisector
];

export function getRandomModel(): GeometryModel {
  const idx = Math.floor(Math.random() * MODELS.length);
  return MODELS[idx]();
}
