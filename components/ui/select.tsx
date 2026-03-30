"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
}

export function Select({ value, onChange, options, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 text-left cursor-pointer",
          "bg-white/[0.05] border",
          open
            ? "border-violet-500/60 shadow-[0_0_0_3px_rgba(124,58,237,0.1)] text-white"
            : "border-white/[0.1] text-white/60 hover:border-violet-500/30 hover:text-white/80"
        )}
      >
        <span className={cn(!selected && "text-white/25")}>
          {selected?.label ?? placeholder ?? "Select..."}
        </span>
        <ChevronDown
          size={13}
          className={cn(
            "text-white/25 flex-shrink-0 transition-transform duration-200",
            open && "rotate-180 text-violet-400/80"
          )}
        />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1.5 bg-[#0f0f1a] border border-white/[0.1] rounded-xl shadow-2xl shadow-black/80 overflow-hidden">
          <div className="p-1 space-y-0.5 max-h-56 overflow-y-auto">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={cn(
                    "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm text-left transition-all duration-150 cursor-pointer",
                    isSelected
                      ? "bg-violet-600/80 text-white"
                      : "text-white/60 hover:bg-white/[0.05] hover:text-white"
                  )}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check size={12} className="flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
