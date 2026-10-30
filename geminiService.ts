import { 
  CarouselConfig, Slide, ChatMessage, DesignSpec, DEFAULT_BRANDING, 
  GroundingSource, Project, FormatPreset, Branding 
} from "./types";

/**
 * Service to interact with our backend AI Proxy
 */

// Gemini API key entered in the app UI, persisted locally in the browser only.
export const getApiKey = (): string => {
  try { return localStorage.getItem("cf_gemini_key") || ""; } catch { return ""; }
};
export const setApiKey = (key: string) => {
  try { key ? localStorage.setItem("cf_gemini_key", key) : localStorage.removeItem("cf_gemini_key"); } catch { /* noop */ }
};

export const analyzeDesignADN = async (images: string[]): Promise<DesignSpec> => {
  const response = await fetch("/api/analyze-design", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ images, apiKey: getApiKey() || undefined })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to analyze design");
  }

  const spec = await response.json();
  return { ...spec, id: `spec-${Date.now()}` };
};

export type LLMProvider = "gemini" | "ollama";
let currentProvider: LLMProvider = (typeof localStorage !== "undefined" && localStorage.getItem("cf_provider") as LLMProvider) || "gemini";

export const getProvider = () => currentProvider;
export const setProvider = (p: LLMProvider) => {
  currentProvider = p;
  try { localStorage.setItem("cf_provider", p); } catch { /* noop */ }
};

export const generateCarouselContent = async (
  topic: string, 
  history: ChatMessage[] = [],
  spec?: DesignSpec,
  targetSlideCount: number = 6,
  sourceText?: string,
  preset?: FormatPreset,
  branding?: Branding
): Promise<CarouselConfig> => {
  const response = await fetch("/api/generate-carousel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      topic, 
      history, 
      spec, 
      count: targetSlideCount, 
      sourceText,
      preset,
      provider: currentProvider, 
      apiKey: getApiKey() || undefined 
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to generate carousel");
  }

  const aiOutput = await response.json();
  
  // Post-process the AI output into a CarouselConfig
  const LAYOUTS = ['center', 'bottom-left', 'split-vertical', 'minimal', 'bold-title', 'comparison', 'card-glass', 'tweet-mockup', 'news-flash', 'soft-ui-card', 'gold-top-visual'];
  const FONTS = ['Outfit', 'Plus Jakarta Sans', 'Space Grotesk', 'Inter', 'Bebas Neue'];
  
  const activeBranding = branding || DEFAULT_BRANDING;

  const config: CarouselConfig = {
    id: `project-${Date.now()}`,
    title: aiOutput.title || topic,
    accentColor: aiOutput.accentColor || spec?.accentColor || "#1d4ed8",
    fontFamily: FONTS.includes(aiOutput.fontFamily) ? aiOutput.fontFamily : (spec?.fontFamily || "Plus Jakarta Sans"),
    aspectRatio: (aiOutput.aspectRatio as '1:1' | '4:5') || '4:5',
    theme: 'light',
    branding: activeBranding,
    customSpec: spec,
    formatPreset: preset,
    slides: (aiOutput.slides || []).map((s: any, idx: number) => ({ 
      ...s, 
      id: `slide-${idx}-${Date.now()}`,
      layout: LAYOUTS.includes(s.layout) ? s.layout : (idx === 0 ? 'soft-ui-card' : 'card-glass'),
      overlayOpacity: spec?.overlayOpacity ?? 0.85,
      headlineSize: spec?.headlineSize ?? 56,
      bodySize: spec?.bodySize ?? 20,
      textAlign: spec?.textAlign ?? (s.layout === 'center' ? 'center' : 'left'),
      contentPadding: (spec?.margins_mm ?? 12) * 4,
      badgeText: s.badgeText || (idx === 0 ? (preset === 'news-flash' ? '🔴 FLASH ACTU' : 'GUIDE') : `0${idx + 1}`),
      comparisonDo: s.comparisonDo,
      comparisonDont: s.comparisonDont
    }))
  };

  return config;
};

export const generateSlideImage = async (prompt: string, aspectRatio: string, vibe?: string): Promise<string> => {
  const response = await fetch("/api/generate-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, aspectRatio, vibe, apiKey: getApiKey() || undefined })
  });

  if (!response.ok) {
    throw new Error("Failed to generate image");
  }

  const data = await response.json();
  return data.imageUri;
};
