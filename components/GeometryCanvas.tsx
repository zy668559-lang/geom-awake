
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Point, Line } from "@/lib/geometry-models";

interface GeometryCanvasProps {
  points: Point[];
  lines: Line[];
  userLines?: Line[]; // Lines drawn by user
  onPointSelect?: (p: Point) => void;
  onLineDraw?: (p1: Point, p2: Point) => void;
  activePoints: string[]; // Labels of active points
  blinkingPoints?: string[]; // Labels of points that should blink
  ghostMode?: boolean; // New: Ghost Mode (10% opacity for lines)
}

export default function GeometryCanvas({ 
  points, 
  lines, 
  userLines = [], 
  onPointSelect, 
  onLineDraw, 
  activePoints, 
  blinkingPoints = [],
  ghostMode = false
}: GeometryCanvasProps) {
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  // Helper to find point by label
  const getP = (label: string) => points.find(p => p.label === label);

  // Helper to calculate smart label position
  const getLabelPos = (p: Point) => {
    // Default offset for isolated points
    const defaultOffset = { x: 15, y: -15 };
    
    if (!lines || lines.length === 0) return { x: p.x + defaultOffset.x, y: p.y + defaultOffset.y };

    const connectedLines = lines.filter(l => l.start === p.label || l.end === p.label);
    
    // If isolated point despite lines existing
    if (connectedLines.length === 0) return { x: p.x + defaultOffset.x, y: p.y + defaultOffset.y };

    let dxSum = 0;
    let dySum = 0;

    connectedLines.forEach(l => {
      const neighborLabel = l.start === p.label ? l.end : l.start;
      const neighbor = getP(neighborLabel);
      if (neighbor) {
        dxSum += (neighbor.x - p.x);
        dySum += (neighbor.y - p.y);
      }
    });
    
    // Safety check for zero length vector (e.g. symmetric neighbors canceling out)
    if (Math.abs(dxSum) < 0.01 && Math.abs(dySum) < 0.01) {
        // Fallback: push away from center of canvas (150,150)
        const dx = p.x - 150;
        const dy = p.y - 150;
        const len = Math.sqrt(dx*dx + dy*dy) || 1;
        return { x: p.x + (dx/len)*25, y: p.y + (dy/len)*25 };
    }

    // Invert direction to find empty space
    const length = Math.sqrt(dxSum * dxSum + dySum * dySum);
    
    // Increased offset for better readability
    const offset = 28;
    const nx = -(dxSum / length) * offset;
    const ny = -(dySum / length) * offset;

    return { x: p.x + nx, y: p.y + ny };
  };

  const handlePointClick = (p: Point) => {
    if (onPointSelect) onPointSelect(p);
  };

  if (!points || points.length === 0) {
    return (
        <div className="w-full h-full bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 text-sm">
            暂无模型图像
        </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-white rounded-2xl shadow-inner border border-slate-200 overflow-hidden select-none">
      <svg viewBox="0 0 300 300" className="w-full h-full">
        <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
            </marker>
        </defs>

        {/* Existing Lines */}
        {lines.map((line, idx) => {
          const p1 = getP(line.start);
          const p2 = getP(line.end);
          if (!p1 || !p2) return null;
          
          const opacity = ghostMode ? 0.1 : (line.role === "interference" ? 0.2 : 1);

          return (
            <motion.line
              key={`${line.start}-${line.end}-${idx}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={line.type === "dashed" ? "#94a3b8" : "#334155"}
              strokeWidth="2"
              strokeDasharray={line.type === "dashed" ? "5,5" : "none"}
              opacity={opacity}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1, opacity }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            />
          );
        })}

        {/* Dynamic Lines (User connections could be added here, but for MVP we rely on model lines or virtual lines) */}

        {/* Points */}
        {points.map((p) => {
          const isActive = activePoints.includes(p.label);
          const isBlinking = blinkingPoints.includes(p.label);
          
          return (
            <g key={p.label} onClick={() => handlePointClick(p)} 
               onMouseEnter={() => setHoveredPoint(p.label)}
               onMouseLeave={() => setHoveredPoint(null)}
               className="cursor-pointer">
              {/* Hit Area */}
              <circle cx={p.x} cy={p.y} r="15" fill="transparent" />
              {/* Visible Point */}
              <motion.circle
                cx={p.x}
                cy={p.y}
                r={isActive ? 6 : 4}
                fill={isActive ? "#3b82f6" : "#64748b"}
                stroke="white"
                strokeWidth="2"
                animate={
                    isBlinking 
                    ? { scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }
                    : { scale: isActive ? 1.2 : 1 }
                }
                transition={
                    isBlinking
                    ? { repeat: Infinity, duration: 1 }
                    : {}
                }
              />
              {/* Label */}
              {(() => {
                const labelPos = getLabelPos(p);
                // ALWAYS SHOW LABELS if not explicitly hidden (MVP requirement: "Custom Example Letters")
                // Use a subtle background for readability if lines cross
                return (
                  <g style={{ pointerEvents: "none" }}>
                      {/* Label Background for contrast - Larger radius */}
                      <circle cx={labelPos.x} cy={labelPos.y} r="10" fill="rgba(255,255,255,0.9)" stroke="rgba(255,255,255,1)" strokeWidth="2" />
                      <text 
                        x={labelPos.x} 
                        y={labelPos.y} 
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className={`text-sm font-bold transition-colors duration-200 ${isActive ? "fill-blue-600" : "fill-slate-600"}`}
                        style={{ fontSize: "16px", fontWeight: "bold" }}
                      >
                        {p.label}
                      </text>
                  </g>
                );
              })()}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
