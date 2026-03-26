"use client";

import { useState, useEffect, useCallback } from "react";
import {
  GenerationSettings,
  AspectRatio,
  SafetyLevel,
  PersonGeneration,
  getModelFamily,
} from "@/lib/types";
import { fetchAvailableImageModels, FetchedModel } from "@/lib/models";
import { cn } from "@/lib/utils";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Eye, EyeOff, Sparkles, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";

const SETTINGS_KEY = "imagen_settings";

const defaultSettings: GenerationSettings = {
  apiKey: "",
  model: "gemini-2.5-flash-image",
  prompt: "",
  negativePrompt: "",
  numberOfImages: 4,
  aspectRatio: "1:1",
  safetyFilterLevel: "BLOCK_MEDIUM_AND_ABOVE",
  personGeneration: "ALLOW_ADULT",
  seed: null,
  language: "auto",
};

const ASPECT_RATIOS: { value: AspectRatio; label: string }[] = [
  { value: "1:1", label: "1:1" },
  { value: "3:4", label: "3:4" },
  { value: "4:3", label: "4:3" },
  { value: "9:16", label: "9:16" },
  { value: "16:9", label: "16:9" },
];

const LANGUAGES = [
  { value: "auto", label: "Auto" },
  { value: "en", label: "English" },
  { value: "ru", label: "Русский" },
  { value: "de", label: "Deutsch" },
  { value: "fr", label: "Français" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
  { value: "zh", label: "中文" },
  { value: "es", label: "Español" },
  { value: "pt", label: "Português" },
];

interface Props {
  onGenerate: (settings: GenerationSettings) => void;
  loading: boolean;
  restoredSettings?: GenerationSettings | null;
  onRestoredSettingsConsumed?: () => void;
}

export function SettingsPanel({ onGenerate, loading, restoredSettings, onRestoredSettingsConsumed }: Props) {
  const [settings, setSettings] = useState<GenerationSettings>(defaultSettings);
  const [showApiKey, setShowApiKey] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [models, setModels] = useState<FetchedModel[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (restoredSettings) {
      setSettings((prev) => ({ ...restoredSettings, apiKey: prev.apiKey }));
      onRestoredSettingsConsumed?.();
    }
  }, [restoredSettings, onRestoredSettingsConsumed]);

  const loadModels = useCallback(async (apiKey: string) => {
    if (!apiKey.trim()) return;
    setModelsLoading(true);
    setModelsError(null);
    try {
      const fetched = await fetchAvailableImageModels(apiKey);
      setModels(fetched);
      // If current model not in list, switch to first available
      if (fetched.length > 0 && !fetched.find((m) => m.id === settings.model)) {
        update("model", fetched[0].id);
      }
    } catch (e) {
      setModelsError(e instanceof Error ? e.message : "Failed to load models");
    } finally {
      setModelsLoading(false);
    }
  }, [settings.model]);

  // Auto-load models when API key is set
  useEffect(() => {
    if (settings.apiKey && settings.apiKey.length > 10 && models.length === 0) {
      loadModels(settings.apiKey);
    }
  }, [settings.apiKey]);  // eslint-disable-line react-hooks/exhaustive-deps

  function update<K extends keyof GenerationSettings>(
    key: K,
    value: GenerationSettings[K]
  ) {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      const toSave = { ...next };
      delete (toSave as Record<string, unknown>).prompt;
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(toSave));
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!settings.apiKey.trim()) { alert("Enter your Google API key"); return; }
    if (!settings.prompt.trim()) { alert("Enter a prompt"); return; }
    onGenerate(settings);
  }

  const isGemini = getModelFamily(settings.model) === "gemini";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-5 h-full overflow-y-auto">
      {/* API Key */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">API Key</label>
        <div className="relative">
          <input
            type={showApiKey ? "text" : "password"}
            value={settings.apiKey}
            onChange={(e) => update("apiKey", e.target.value)}
            onBlur={() => loadModels(settings.apiKey)}
            placeholder="AIza..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white pr-10 focus:outline-none focus:border-violet-500 placeholder-zinc-600"
          />
          <button
            type="button"
            onClick={() => setShowApiKey((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
          >
            {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <p className="text-xs text-zinc-600">Stored locally, never sent to our server</p>
      </div>

      {/* Model */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Model</label>
          <button
            type="button"
            onClick={() => loadModels(settings.apiKey)}
            disabled={modelsLoading || !settings.apiKey}
            className="flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-300 disabled:opacity-40 transition-colors"
          >
            <RefreshCw size={11} className={modelsLoading ? "animate-spin" : ""} />
            {modelsLoading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {modelsError && (
          <p className="text-xs text-red-400">{modelsError}</p>
        )}

        {models.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {models.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => update("model", m.id)}
                className={cn(
                  "rounded-lg px-3 py-2 text-xs font-medium border transition-colors text-left",
                  settings.model === m.id
                    ? "bg-violet-600 border-violet-500 text-white"
                    : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500"
                )}
              >
                <div className="font-semibold truncate">{m.displayName}</div>
                <div className={cn(
                  "text-[10px] mt-0.5 truncate",
                  settings.model === m.id ? "text-violet-200" : "text-zinc-500"
                )}>
                  {m.id}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {/* Fallback while no API key entered yet */}
            {[
              { id: "gemini-2.5-flash-image", displayName: "Nano Banana" },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => update("model", m.id)}
                className={cn(
                  "rounded-lg px-3 py-2 text-xs font-medium border transition-colors text-left",
                  settings.model === m.id
                    ? "bg-violet-600 border-violet-500 text-white"
                    : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500"
                )}
              >
                <div className="font-semibold">{m.displayName}</div>
                <div className={cn("text-[10px] mt-0.5", settings.model === m.id ? "text-violet-200" : "text-zinc-500")}>
                  {m.id}
                </div>
              </button>
            ))}
            {!settings.apiKey && (
              <p className="text-xs text-zinc-600">Enter API key to load all available models</p>
            )}
          </div>
        )}

        {isGemini && (
          <p className="text-xs text-amber-500/80">
            Gemini models: aspect ratio & negative prompt are not supported
          </p>
        )}
      </div>

      {/* Prompt */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Prompt</label>
          <span className="text-xs text-zinc-600">{settings.prompt.length}/2000</span>
        </div>
        <textarea
          value={settings.prompt}
          onChange={(e) => update("prompt", e.target.value.slice(0, 2000))}
          placeholder="Describe the image you want to generate..."
          rows={4}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white resize-none focus:outline-none focus:border-violet-500 placeholder-zinc-600"
        />
      </div>

      {/* Negative Prompt — Imagen only */}
      {!isGemini && (
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Negative Prompt</label>
            <span className="text-xs text-zinc-600">{settings.negativePrompt.length}/2000</span>
          </div>
          <textarea
            value={settings.negativePrompt}
            onChange={(e) => update("negativePrompt", e.target.value.slice(0, 2000))}
            placeholder="What to avoid in the image..."
            rows={2}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white resize-none focus:outline-none focus:border-violet-500 placeholder-zinc-600"
          />
        </div>
      )}

      {/* Number of Images */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Number of Images</label>
          <span className="text-violet-400 font-bold text-lg">{settings.numberOfImages}</span>
        </div>
        <Slider
          value={settings.numberOfImages}
          min={1}
          max={20}
          onChange={(v) => update("numberOfImages", v)}
          marks={[1, 5, 10, 15, 20]}
        />
        {isGemini && settings.numberOfImages > 1 && (
          <p className="text-xs text-amber-500/80">
            Will make {settings.numberOfImages} separate API requests
          </p>
        )}
        {!isGemini && settings.numberOfImages > 4 && (
          <p className="text-xs text-amber-500/80">
            Will make {Math.ceil(settings.numberOfImages / 4)} API requests (max 4 per call)
          </p>
        )}
      </div>

      {/* Aspect Ratio — Imagen only */}
      {!isGemini && (
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Aspect Ratio</label>
          <div className="flex gap-2 flex-wrap">
            {ASPECT_RATIOS.map((ar) => (
              <button
                key={ar.value}
                type="button"
                onClick={() => update("aspectRatio", ar.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                  settings.aspectRatio === ar.value
                    ? "bg-violet-600 border-violet-500 text-white"
                    : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500"
                )}
              >
                {ar.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Settings */}
      <div className="rounded-lg border border-zinc-700">
        <button
          type="button"
          onClick={() => setAdvancedOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider hover:text-zinc-200 transition-colors"
        >
          <span>Advanced Settings</span>
          {advancedOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {advancedOpen && (
          <div className="border-t border-zinc-700 px-4 pt-4 pb-4 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Safety Filter</label>
              <Select
                value={settings.safetyFilterLevel}
                onChange={(v) => update("safetyFilterLevel", v as SafetyLevel)}
                options={[
                  { value: "BLOCK_NONE", label: "Block None" },
                  { value: "BLOCK_ONLY_HIGH", label: "Block Only High" },
                  { value: "BLOCK_MEDIUM_AND_ABOVE", label: "Block Medium and Above" },
                  { value: "BLOCK_LOW_AND_ABOVE", label: "Block Low and Above (Strictest)" },
                ]}
              />
            </div>

            {!isGemini && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Person Generation</label>
                <Select
                  value={settings.personGeneration}
                  onChange={(v) => update("personGeneration", v as PersonGeneration)}
                  options={[
                    { value: "ALLOW_ADULT", label: "Allow Adult" },
                    { value: "ALLOW_ALL", label: "Allow All" },
                    { value: "DONT_ALLOW", label: "Don't Allow" },
                  ]}
                />
              </div>
            )}

            {!isGemini && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Language</label>
                <Select
                  value={settings.language}
                  onChange={(v) => update("language", v)}
                  options={LANGUAGES}
                />
              </div>
            )}

            {!isGemini && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Seed</label>
                  <button type="button" onClick={() => update("seed", null)} className="text-xs text-zinc-500 hover:text-zinc-300">
                    Random
                  </button>
                </div>
                <input
                  type="number"
                  value={settings.seed ?? ""}
                  onChange={(e) => update("seed", e.target.value === "" ? null : Number(e.target.value))}
                  placeholder="Leave empty for random"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 placeholder-zinc-600"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Generate Button */}
      <button
        type="submit"
        disabled={loading}
        className={cn(
          "w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all",
          loading
            ? "bg-violet-800 text-violet-400 cursor-not-allowed"
            : "bg-violet-600 hover:bg-violet-500 text-white active:scale-95"
        )}
      >
        <Sparkles size={16} />
        {loading
          ? "Generating..."
          : `Generate ${settings.numberOfImages} Image${settings.numberOfImages > 1 ? "s" : ""}`}
      </button>
    </form>
  );
}
