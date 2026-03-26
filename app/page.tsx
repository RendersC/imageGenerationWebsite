"use client";

import { useState, useEffect } from "react";
import { SettingsPanel } from "@/components/settings-panel";
import { Gallery } from "@/components/gallery";
import { HistoryPanel } from "@/components/history-panel";
import { useGeneration } from "@/hooks/use-generation";
import { GenerationHistory, GenerationSettings } from "@/lib/types";
import { Clock, ImageIcon, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "generate" | "history";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("generate");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [restoredSettings, setRestoredSettings] = useState<GenerationSettings | null>(null);

  const {
    images,
    loading,
    progress,
    error,
    history,
    generate,
    regenerateSingle,
    toggleFavorite,
    loadFromHistory,
    clearHistory,
    loadHistoryFromStorage,
  } = useGeneration();

  useEffect(() => {
    loadHistoryFromStorage();
  }, [loadHistoryFromStorage]);

  function handleLoadHistory(entry: GenerationHistory) {
    const settings = loadFromHistory(entry);
    setRestoredSettings(settings);
    setActiveTab("generate");
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r border-zinc-800 bg-zinc-900 transition-all duration-300 flex-shrink-0",
          sidebarOpen ? "w-80" : "w-0 overflow-hidden border-r-0"
        )}
      >
        {/* Sidebar tabs */}
        <div className="flex border-b border-zinc-800 flex-shrink-0">
          <SidebarTab
            active={activeTab === "generate"}
            onClick={() => setActiveTab("generate")}
            icon={<ImageIcon size={14} />}
            label="Generate"
          />
          <SidebarTab
            active={activeTab === "history"}
            onClick={() => setActiveTab("history")}
            icon={<Clock size={14} />}
            label="History"
          />
        </div>

        {/* Sidebar content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "generate" && (
            <SettingsPanel
              onGenerate={generate}
              loading={loading}
              restoredSettings={restoredSettings}
              onRestoredSettingsConsumed={() => setRestoredSettings(null)}
            />
          )}
          {activeTab === "history" && (
            <HistoryPanel
              history={history}
              onLoad={handleLoadHistory}
              onClear={clearHistory}
            />
          )}
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center">
              <ImageIcon size={13} className="text-white" />
            </div>
            <span className="font-semibold text-sm">Imagen Generator</span>
          </div>
          {loading && (
            <div className="ml-auto flex items-center gap-2 text-xs text-zinc-500">
              <div className="w-3 h-3 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
              Generating {progress.done}/{progress.total}
            </div>
          )}
        </header>

        {/* Gallery */}
        <div className="flex-1 overflow-hidden">
          <Gallery
            images={images}
            loading={loading}
            progress={progress}
            error={error}
            onFavorite={toggleFavorite}
            onRegenerate={regenerateSingle}
          />
        </div>
      </div>
    </div>
  );
}

function SidebarTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors border-b-2",
        active
          ? "border-violet-500 text-violet-400"
          : "border-transparent text-zinc-500 hover:text-zinc-300"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
