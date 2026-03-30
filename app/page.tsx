"use client";

import { useState, useEffect } from "react";
import { SettingsPanel } from "@/components/settings-panel";
import { Gallery } from "@/components/gallery";
import { HistoryPanel } from "@/components/history-panel";
import { useGeneration } from "@/hooks/use-generation";
import { GenerationHistory, GenerationSettings } from "@/lib/types";
import { Clock, PanelLeftClose, PanelLeftOpen, Sparkles } from "lucide-react";
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
    <div className="flex h-screen bg-[#07070e] text-[#ededf5] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r border-white/[0.06] bg-[#0b0b14] transition-all duration-300 flex-shrink-0",
          sidebarOpen ? "w-80" : "w-0 overflow-hidden border-r-0"
        )}
      >
        {/* Sidebar tabs */}
        <div className="flex border-b border-white/[0.06] flex-shrink-0">
          <SidebarTab
            active={activeTab === "generate"}
            onClick={() => setActiveTab("generate")}
            icon={<Sparkles size={13} />}
            label="Generate"
          />
          <SidebarTab
            active={activeTab === "history"}
            onClick={() => setActiveTab("history")}
            icon={<Clock size={13} />}
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
        <header className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] flex-shrink-0">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-1.5 hover:bg-white/[0.06] rounded-lg text-white/25 hover:text-white/60 transition-all duration-200 cursor-pointer"
          >
            {sidebarOpen ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-[0_0_14px_rgba(124,58,237,0.5)]">
              <Sparkles size={13} className="text-white" />
            </div>
            <span className="font-semibold text-sm text-gradient-violet">Imagen Studio</span>
          </div>
          {loading && (
            <div className="ml-auto flex items-center gap-2 text-xs">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-violet-500/20 border-t-violet-400 animate-spin" />
              <span className="text-violet-400/70">Generating {progress.done}/{progress.total}</span>
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
        "flex-1 flex items-center justify-center gap-1.5 py-3.5 text-xs font-medium transition-all duration-200 border-b-2 cursor-pointer",
        active
          ? "border-violet-500 text-violet-400"
          : "border-transparent text-white/25 hover:text-white/60"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
