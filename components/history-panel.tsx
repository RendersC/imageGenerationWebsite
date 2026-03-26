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
      <div className="flex flex-col items-center justify-center h-full gap-2 p-8 text-center">
        <Clock size={28} className="text-zinc-600" />
        <p className="text-zinc-500 text-sm">No generation history yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          History ({history.length})
        </span>
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-xs text-zinc-600 hover:text-red-400 transition-colors"
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
            className="w-full text-left p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-violet-500/50 transition-all group"
          >
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-md bg-zinc-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ImageIcon size={14} className="text-zinc-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-300 line-clamp-2 group-hover:text-white transition-colors">
                  {entry.prompt}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-zinc-600">
                    {entry.imageCount} image{entry.imageCount > 1 ? "s" : ""}
                  </span>
                  <span className="text-[10px] text-zinc-700">·</span>
                  <span className="text-[10px] text-zinc-600">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="text-[10px] text-zinc-700 mt-0.5">
                  {entry.settings.model}
                </div>
              </div>
              <RefreshCw
                size={12}
                className="text-zinc-600 group-hover:text-violet-400 transition-colors flex-shrink-0 mt-1"
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
