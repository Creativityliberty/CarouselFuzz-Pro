import { CarouselConfig, Slide, ChatMessage, DesignSpec, DEFAULT_BRANDING, GroundingSource, Project } from "./types";

/**
 * Service to interact with our backend AI Proxy
 */

export const analyzeDesignADN = async (images: string[]): Promise<DesignSpec> => {
  const response = await fetch("/api/analyze-design", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ images })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to analyze design");
  }

  const spec = await response.json();
  return { ...spec, id: `spec-${Date.now()}` };
};

export const generateCarouselContent = async (
  topic: string, 
  history: ChatMessage[] = [],
  spec?: DesignSpec,
  targetSlideCount: number = 7
): Promise<CarouselConfig> => {
  const response = await fetch("/api/generate-carousel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, history, spec, count: targetSlideCount })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to generate carousel");
  }

  const aiOutput = await response.json();
  
  // Post-process the AI output into a CarouselConfig
  const config: CarouselConfig = {
    id: `project-${Date.now()}`,
    title: aiOutput.title || topic,
    accentColor: aiOutput.accentColor || spec?.accentColor || "#2dd4bf",
    fontFamily: aiOutput.fontFamily || spec?.fontFamily || "Outfit",
    aspectRatio: (aiOutput.aspectRatio as '1:1' | '4:5') || '4:5',
    theme: 'dark',
    branding: DEFAULT_BRANDING,
    customSpec: spec,
    slides: (aiOutput.slides || []).map((s: any, idx: number) => ({ 
      ...s, 
      id: `slide-${idx}-${Date.now()}`,
      overlayOpacity: spec?.overlayOpacity ?? 0.8,
      headlineSize: spec?.headlineSize ?? 60,
      bodySize: spec?.bodySize ?? 20,
      textAlign: spec?.textAlign ?? (s.layout === 'center' ? 'center' : 'left'),
      contentPadding: (spec?.margins_mm ?? 12) * 4
    }))
  };

  return config;
};

export const generateSlideImage = async (prompt: string, aspectRatio: string, vibe?: string): Promise<string> => {
  const response = await fetch("/api/generate-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, aspectRatio, vibe })
  });

  if (!response.ok) {
    throw new Error("Failed to generate image");
  }

  const data = await response.json();
  return data.imageUri;
};
