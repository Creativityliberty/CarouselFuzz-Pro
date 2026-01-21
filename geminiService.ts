
import { GoogleGenAI, Type } from "@google/genai";
import { CarouselConfig, Slide } from "./types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const generateCarouselContent = async (
  topic: string, 
  imageBase64?: string,
  targetSlideCount: number = 7
): Promise<CarouselConfig> => {
  const ai = getAI();
  
  const contents: any[] = [
    {
      text: `You are a world-class social media strategist for LinkedIn, Instagram, and Twitter.
      
      TOPIC/GOAL: ${topic}
      
      Your mission is to perform a Web Search (WebJSON technique) to find the absolute latest data, trends, or specific insights about this topic. 
      ${imageBase64 ? "The user provided an image. Analyze its layout and visual style and recreate a similar vibe in the content and prompts." : ""}
      
      REQUIRED STRUCTURE:
      Generate exactly ${targetSlideCount} slides.
      - Use {text} syntax for words that should be highlighted in the accent color.
      - The visuals prompts should be detailed (style: clean, premium, 3D, or minimalist flat).
      - Include layout types: 'center', 'bottom-left', 'split-vertical', 'minimal', 'bold-title', 'comparison'.
      
      Output ONLY valid JSON matching the provided schema.`
    }
  ];

  if (imageBase64) {
    contents.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64.split(',')[1]
      }
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: { parts: contents },
    config: {
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
    overlayOpacity: 0.8 
  }));
  return config;
};

export const generateSlideImage = async (prompt: string, aspectRatio: string): Promise<string> => {
  const ai = getAI();
  const ratio = aspectRatio === '4:5' ? '3:4' : '1:1';

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `${prompt}. Professional branding, studio lighting, depth of field, 4k, crisp, modern aesthetic.` }],
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
