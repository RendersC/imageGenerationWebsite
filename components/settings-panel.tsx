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
import { ImageUpload } from "@/components/image-upload";
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
  uploadedImages: [],
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
      if (fetched.length > 0 && !fetched.find((m) => m.id === settings.model)) {
        update("model", fetched[0].id);
      }
    } catch (e) {
      setModelsError(e instanceof Error ? e.message : "Failed to load models");
    } finally {
      setModelsLoading(false);
    }
  }, [settings.model]);

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
      delete (toSave as Record<string, unknown>).uploadedImages;
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

  const fieldLabel = "text-[10px] font-semibold text-white/40 uppercase tracking-widest";
  const inputClass = "w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2.5 text-sm text-white/90 focus:outline-none focus:border-violet-500/60 focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)] placeholder-white/20 transition-all duration-200";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-5 h-full overflow-y-auto">

      {/* API Key */}
      <div className="space-y-1.5">
        <label className={fieldLabel}>API Key</label>
        <div className="relative">
          <input
            type={showApiKey ? "text" : "password"}
            value={settings.apiKey}
            onChange={(e) => update("apiKey", e.target.value)}
            onBlur={() => loadModels(settings.apiKey)}
            placeholder="AIza..."
            className={cn(inputClass, "pr-10")}
          />
          <button
            type="button"
            onClick={() => setShowApiKey((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors cursor-pointer"
          >
            {showApiKey ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        <p className="text-[10px] text-white/20">Stored locally, never sent to our server</p>
      </div>

      {/* Model */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className={fieldLabel}>Model</label>
          <button
            type="button"
            onClick={() => loadModels(settings.apiKey)}
            disabled={modelsLoading || !settings.apiKey}
            className="flex items-center gap-1 text-[10px] text-white/25 hover:text-white/60 disabled:opacity-30 transition-colors cursor-pointer"
          >
            <RefreshCw size={10} className={modelsLoading ? "animate-spin" : ""} />
            {modelsLoading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {modelsError && (
          <p className="text-xs text-red-400/80">{modelsError}</p>
        )}

        {models.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {models.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => update("model", m.id)}
                className={cn(
                  "rounded-xl px-3 py-2 text-xs font-medium border transition-all duration-200 text-left cursor-pointer",
                  settings.model === m.id
                    ? "bg-violet-600/80 border-violet-500/70 text-white shadow-[0_0_14px_rgba(124,58,237,0.3)]"
                    : "bg-white/[0.04] border-white/[0.08] text-white/55 hover:border-violet-500/30 hover:text-white/80"
                )}
              >
                <div className="font-semibold truncate">{m.displayName}</div>
                <div className={cn(
                  "text-[10px] mt-0.5 truncate",
                  settings.model === m.id ? "text-violet-200/80" : "text-white/25"
                )}>
                  {m.id}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: "gemini-2.5-flash-image", displayName: "Nano Banana" },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => update("model", m.id)}
                className={cn(
                  "rounded-xl px-3 py-2 text-xs font-medium border transition-all duration-200 text-left cursor-pointer",
                  settings.model === m.id
                    ? "bg-violet-600/80 border-violet-500/70 text-white shadow-[0_0_14px_rgba(124,58,237,0.3)]"
                    : "bg-white/[0.04] border-white/[0.08] text-white/55 hover:border-violet-500/30 hover:text-white/80"
                )}
              >
                <div className="font-semibold">{m.displayName}</div>
                <div className={cn("text-[10px] mt-0.5", settings.model === m.id ? "text-violet-200/80" : "text-white/25")}>
                  {m.id}
                </div>
              </button>
            ))}
            {!settings.apiKey && (
              <p className="text-[10px] text-white/20">Enter API key to load all available models</p>
            )}
          </div>
        )}

        {isGemini && (
          <p className="text-[10px] text-amber-400/70">
            Gemini models: aspect ratio & negative prompt are not supported
          </p>
        )}
      </div>

      {/* Image Upload */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className={fieldLabel}>Input Images</label>
          {settings.uploadedImages.length > 0 && (
            <button
              type="button"
              onClick={() => update("uploadedImages", [])}
              className="text-[10px] text-white/25 hover:text-red-400/80 transition-colors cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>
        <ImageUpload
          images={settings.uploadedImages}
          onChange={(imgs) => update("uploadedImages", imgs)}
        />
        {settings.uploadedImages.length > 0 && !isGemini && (
          <p className="text-[10px] text-amber-400/70">Image input works best with Gemini models</p>
        )}
      </div>

      {/* Prompt */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className={fieldLabel}>Prompt</label>
          <span className="text-[10px] text-white/20 tabular-nums">{settings.prompt.length}/2000</span>
        </div>
        <textarea
          value={settings.prompt}
          onChange={(e) => update("prompt", e.target.value.slice(0, 2000))}
          placeholder="Describe the image you want to generate..."
          rows={4}
          className={cn(inputClass, "resize-none")}
        />
      </div>

      {/* Negative Prompt — Imagen only */}
      {!isGemini && (
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className={fieldLabel}>Negative Prompt</label>
            <span className="text-[10px] text-white/20 tabular-nums">{settings.negativePrompt.length}/2000</span>
          </div>
          <textarea
            value={settings.negativePrompt}
            onChange={(e) => update("negativePrompt", e.target.value.slice(0, 2000))}
            placeholder="What to avoid in the image..."
            rows={2}
            className={cn(inputClass, "resize-none")}
          />
        </div>
      )}

      {/* Number of Images */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className={fieldLabel}>Number of Images</label>
          <span className="text-violet-400 font-semibold text-base tabular-nums">{settings.numberOfImages}</span>
        </div>
        <Slider
          value={settings.numberOfImages}
          min={1}
          max={20}
          onChange={(v) => update("numberOfImages", v)}
          marks={[1, 5, 10, 15, 20]}
        />
        {isGemini && settings.numberOfImages > 1 && (
          <p className="text-[10px] text-amber-400/70">
            Will make {settings.numberOfImages} separate API requests
          </p>
        )}
        {!isGemini && settings.numberOfImages > 4 && (
          <p className="text-[10px] text-amber-400/70">
            Will make {Math.ceil(settings.numberOfImages / 4)} API requests (max 4 per call)
          </p>
        )}
      </div>

      {/* Aspect Ratio — Imagen only */}
      {!isGemini && (
        <div className="space-y-1.5">
          <label className={fieldLabel}>Aspect Ratio</label>
          <div className="flex gap-2 flex-wrap">
            {ASPECT_RATIOS.map((ar) => (
              <button
                key={ar.value}
                type="button"
                onClick={() => update("aspectRatio", ar.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 cursor-pointer",
                  settings.aspectRatio === ar.value
                    ? "bg-violet-600/80 border-violet-500/70 text-white"
                    : "bg-white/[0.04] border-white/[0.08] text-white/55 hover:border-violet-500/30 hover:text-white/80"
                )}
              >
                {ar.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Settings */}
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        <button
          type="button"
          onClick={() => setAdvancedOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-[10px] font-semibold text-white/35 uppercase tracking-widest hover:text-white/60 transition-colors cursor-pointer"
        >
          <span>Advanced Settings</span>
          {advancedOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        {advancedOpen && (
          <div className="border-t border-white/[0.07] px-4 pt-4 pb-4 space-y-4">
            <div className="space-y-1.5">
              <label className={fieldLabel}>Safety Filter</label>
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
                <label className={fieldLabel}>Person Generation</label>
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
                <label className={fieldLabel}>Language</label>
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
                  <label className={fieldLabel}>Seed</label>
                  <button
                    type="button"
                    onClick={() => update("seed", null)}
                    className="text-[10px] text-white/25 hover:text-violet-400 transition-colors cursor-pointer"
                  >
                    Random
                  </button>
                </div>
                <input
                  type="number"
                  value={settings.seed ?? ""}
                  onChange={(e) => update("seed", e.target.value === "" ? null : Number(e.target.value))}
                  placeholder="Leave empty for random"
                  className={inputClass}
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
          "w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200",
          loading
            ? "bg-gradient-to-r from-violet-800/50 to-purple-800/50 text-violet-300/40 cursor-not-allowed"
            : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white glow-pulse cursor-pointer active:scale-[0.98]"
        )}
      >
        <Sparkles size={15} />
        {loading
          ? "Generating..."
          : `Generate ${settings.numberOfImages} Image${settings.numberOfImages > 1 ? "s" : ""}`}
      </button>
    </form>
  );
}
