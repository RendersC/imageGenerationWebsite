"use client";

import { GenerationHistory } from "@/lib/types";
import { Clock, Trash2, ImageIcon, RefreshCw } from "lucide-react";

interface Props {
  history: GenerationHistory[];
  onLoad: (entry: GenerationHistory) => void;
  onClear: () => void;
}

export function HistoryPanel({ history, onLoad, onClear }: Props) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
        <Clock size={26} className="text-white/15" />
        <p className="text-white/30 text-sm">No generation history yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <span className="text-[10px] font-semibold text-white/35 uppercase tracking-widest">
          History ({history.length})
        </span>
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-xs text-white/25 hover:text-red-400/80 transition-colors cursor-pointer"
        >
          <Trash2 size={11} />
          Clear
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {history.map((entry) => (
          <button
            key={entry.id}
            onClick={() => onLoad(entry)}
            className="w-full text-left p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-violet-500/30 transition-all duration-200 group cursor-pointer"
          >
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0 mt-0.5">
                <ImageIcon size={13} className="text-white/35" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/55 line-clamp-2 group-hover:text-white/85 transition-colors">
                  {entry.prompt}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-white/25">
                    {entry.imageCount} image{entry.imageCount > 1 ? "s" : ""}
                  </span>
                  <span className="text-[10px] text-white/15">·</span>
                  <span className="text-[10px] text-white/25">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="text-[10px] text-white/18 mt-0.5 truncate">
                  {entry.settings.model}
                </div>
              </div>
              <RefreshCw
                size={11}
                className="text-white/18 group-hover:text-violet-400/70 transition-colors flex-shrink-0 mt-1"
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
