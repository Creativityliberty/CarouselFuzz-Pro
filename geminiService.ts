
import { GoogleGenAI, Type } from "@google/genai";
import { CarouselConfig, Slide, ChatMessage, DesignSpec, Branding, DEFAULT_BRANDING, GroundingSource } from "./types";

const getAI = () => {
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : undefined;
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please ensure it is configured in the environment.");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeDesignADN = async (images: string[]): Promise<DesignSpec> => {
  const ai = getAI();
  const systemInstruction = `You are a System Architect & Design Analyst. 
  Scan the provided images and reverse-engineer their "Design DNA".
  Extract exact stylistic parameters for a carousel template.
  Output strictly JSON matching the DesignSpec schema.`;

  const parts = images.map(img => ({
    inlineData: { mimeType: "image/jpeg", data: img.split(',')[1] }
  }));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: { parts: [...parts, { text: "Analyze these designs and define a reusable DesignSpec." }] },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            fontFamily: { type: Type.STRING, enum: ["Plus Jakarta Sans", "Space Grotesk", "Bebas Neue", "Outfit"] },
            accentColor: { type: Type.STRING },
            margins_mm: { type: Type.NUMBER },
            headlineSize: { type: Type.NUMBER },
            bodySize: { type: Type.NUMBER },
            textAlign: { type: Type.STRING, enum: ["left", "center", "right"] },
            overlayOpacity: { type: Type.NUMBER },
            vibe: { type: Type.STRING }
          },
          required: ["name", "fontFamily", "accentColor", "margins_mm", "headlineSize", "bodySize", "textAlign", "overlayOpacity"]
        }
      }
    });

    let text = response.text || "{}";
    text = text.replace(/```json\n?|```/g, "").trim();
    const spec = JSON.parse(text) as DesignSpec;
    spec.id = `spec-${Date.now()}`;
    return spec;
  } catch (error) {
    console.error("Design DNA Analysis Error:", error);
    throw new Error("Failed to analyze design DNA. Ensure images are clear and API key is valid.");
  }
};

export const generateCarouselContent = async (
  topic: string, 
  history: ChatMessage[] = [],
  spec?: DesignSpec,
  targetSlideCount: number = 7
): Promise<CarouselConfig> => {
  const ai = getAI();
  
  const historyParts = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  const systemInstruction = `You are a world-class social media strategist.
  Use WebJSON to find real-time data for: ${topic}.
  Create exactly ${targetSlideCount} slides.
  ${spec ? `IMPORTANT: Follow this Design DNA: ${JSON.stringify(spec)}` : ""}
  Layout types: 'center', 'bottom-left', 'split-vertical', 'minimal', 'bold-title', 'comparison'.
  Output strictly JSON.`;

  const contents = [
    ...historyParts,
    { role: 'user', parts: [{ text: `Generate content for topic: ${topic}` }] }
  ];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: contents,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            accentColor: { type: Type.STRING },
            fontFamily: { type: Type.STRING },
            aspectRatio: { type: Type.STRING, enum: ["1:1", "4:5"] },
            slides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  headline: { type: Type.STRING },
                  body: { type: Type.STRING },
                  visualPrompt: { type: Type.STRING },
                  layout: { type: Type.STRING }
                },
                required: ["headline", "body", "visualPrompt", "layout"]
              }
            }
          },
          required: ["title", "accentColor", "slides"]
        }
      }
    });

    let text = response.text || "{}";
    text = text.replace(/```json\n?|```/g, "").trim();
    const aiOutput = JSON.parse(text);
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const groundingSources: GroundingSource[] = groundingChunks
      ?.map((chunk: any) => chunk.web ? { title: chunk.web.title, uri: chunk.web.uri } : null)
      .filter((s: any): s is GroundingSource => s !== null) || [];
    
    const config: CarouselConfig = {
      id: `project-${Date.now()}`,
      title: aiOutput.title || topic,
      accentColor: aiOutput.accentColor || spec?.accentColor || "#2dd4bf",
      fontFamily: aiOutput.fontFamily || spec?.fontFamily || "Outfit",
      aspectRatio: (aiOutput.aspectRatio as '1:1' | '4:5') || '4:5',
      theme: 'dark',
      branding: DEFAULT_BRANDING,
      customSpec: spec,
      groundingSources,
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
  } catch (error) {
    console.error("Content Generation Error:", error);
    throw new Error("Failed to generate carousel content. Try refining your prompt.");
  }
};

export const generateSlideImage = async (prompt: string, aspectRatio: string, vibe?: string): Promise<string> => {
  const ai = getAI();
  const ratio = aspectRatio === '4:5' ? '3:4' : '1:1';
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `${prompt}. ${vibe ? `Style: ${vibe}.` : ""} Professional studio photography, commercial aesthetic.` }],
      },
      config: { imageConfig: { aspectRatio: ratio as any } }
    });
    
    const part = response.candidates?.[0]?.content.parts.find(p => p.inlineData);
    if (!part?.inlineData) throw new Error("No image data returned from Gemini");
    return `data:image/png;base64,${part.inlineData.data}`;
  } catch (error) {
    console.error("Image Generation Error:", error);
    throw new Error("Failed to generate slide image.");
  }
};
