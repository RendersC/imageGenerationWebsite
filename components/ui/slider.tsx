"use client";

import { useRef } from "react";

interface Props {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  marks?: number[];
}

export function Slider({ value, min, max, onChange, marks }: Props) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-3">
      <div className="relative h-6 flex items-center">
        {/* Track background */}
        <div className="absolute inset-x-0 h-1 rounded-full bg-white/[0.08]" />

        {/* Filled track */}
        <div
          className="absolute h-1 rounded-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all"
          style={{ width: `${percent}%` }}
        />

        {/* Native input (transparent, over everything) */}
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-x-0 w-full h-full opacity-0 cursor-pointer z-10"
          style={{ margin: 0 }}
        />

        {/* Custom thumb */}
        <div
          className="absolute w-4 h-4 rounded-full bg-white shadow-lg shadow-violet-500/40 border-2 border-violet-500 pointer-events-none transition-all"
          style={{ left: `calc(${percent}% - 8px)` }}
        />
      </div>

      {marks && (
        <div className="flex justify-between">
          {marks.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onChange(m)}
              className="text-[10px] text-white/25 hover:text-white/55 transition-colors tabular-nums cursor-pointer"
            >
              {m}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
