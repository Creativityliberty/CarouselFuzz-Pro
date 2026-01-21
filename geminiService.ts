
import { GoogleGenAI, Type } from "@google/genai";
import { CarouselConfig, Slide, ChatMessage } from "./types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const generateCarouselContent = async (
  topic: string, 
  history: ChatMessage[] = [],
  imageBase64?: string,
  targetSlideCount: number = 7
): Promise<CarouselConfig> => {
  const ai = getAI();
  
  const historyParts = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  const systemInstruction = `You are a world-class social media strategist and visual designer.
  You use the WebJSON technique to find the latest trends and data.
  Create a carousel of exactly ${targetSlideCount} slides.
  - User topic: ${topic}
  - Highlight keywords with {text}.
  - Layout types: 'center', 'bottom-left', 'split-vertical', 'minimal', 'bold-title', 'comparison'.
  - Provide highly detailed visual prompts for image generation.
  ${imageBase64 ? "Analyze the attached image and replicate its aesthetic/layout style." : ""}
  Output strictly JSON matching the schema.`;

  const contents: any[] = [
    ...historyParts,
    {
      role: 'user',
      parts: [
        { text: `Topic: ${topic}. Generate the full carousel JSON.` },
        ...(imageBase64 ? [{ inlineData: { mimeType: "image/jpeg", data: imageBase64.split(',')[1] } }] : [])
      ]
    }
  ];

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
          fontFamily: { type: Type.STRING, enum: ["Plus Jakarta Sans", "Space Grotesk", "Bebas Neue", "Outfit"] },
          aspectRatio: { type: Type.STRING, enum: ["1:1", "4:5"] },
          slides: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                headline: { type: Type.STRING },
                body: { type: Type.STRING },
                visualPrompt: { type: Type.STRING },
                layout: { type: Type.STRING, enum: ['center', 'bottom-left', 'split-vertical', 'minimal', 'bold-title', 'comparison'] }
              },
              required: ["headline", "body", "visualPrompt", "layout"]
            }
          }
        },
        required: ["title", "accentColor", "slides"]
      }
    }
  });

  const config = JSON.parse(response.text) as CarouselConfig;
  config.slides = config.slides.map((s, idx) => ({ 
    ...s, 
    id: `slide-${idx}-${Date.now()}`,
    overlayOpacity: 0.8,
    headlineSize: 60,
    bodySize: 20,
    textAlign: s.layout === 'center' ? 'center' : 'left',
    contentPadding: 64
  }));
  return config;
};

export const generateSlideImage = async (prompt: string, aspectRatio: string): Promise<string> => {
  const ai = getAI();
  const ratio = aspectRatio === '4:5' ? '3:4' : '1:1';

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `${prompt}. Ultra-professional, modern aesthetic, studio lighting, highly detailed.` }],
    },
    config: {
      imageConfig: { aspectRatio: ratio as any }
    }
  });

  for (const part of response.candidates?.[0]?.content.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("Image Generation Failed");
};
