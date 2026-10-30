import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
app.use(express.json({ limit: "15mb" }));

const PORT = 3000;

// --- LLM Providers ---
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:3b";

type Provider = "gemini" | "ollama";

interface LLMRequest {
  provider?: Provider;
  ollamaModel?: string;
  system?: string;
  schema?: any;
  apiKey?: string;
  contents: any[];
}

/** Compact human-readable JSON instruction from a Gemini-style schema (for local models). */
function schemaToPrompt(schema: any): string {
  const walk = (s: any): string => {
    if (!s || !s.properties) return "";
    const parts = Object.entries<any>(s.properties).map(([k, v]) => {
      const t = String(v.type || "").toLowerCase();
      if (t === "array") {
        const item = v.items ? walk(v.items) : "";
        return `${k}: [${item ? `{${item}}` : "value"}, ...]`;
      }
      return t === "object" ? `${k}: {${walk(v)}}` : `${k}: (string${v.description ? ` - ${v.description}` : ""})`;
    });
    return parts.join(", ");
  };
  return `Return ONLY valid JSON with exactly this shape (no markdown, no extra keys): {${walk(schema)}}. All required. Respect enum-like instructions inside descriptions.`;
}

/** Contents -> flat prompt text for local chat models. */
function contentsToPrompt(contents: any[]): string {
  return contents
    .map((c) => {
      const texts = (c.parts || [])
        .map((p: any) => p.text || "")
        .filter(Boolean)
        .join("\n");
      return `${c.role === "user" ? "User" : "Assistant"}: ${texts}`;
    })
    .join("\n\n");
}

/** Local Ollama generation with JSON output. */
async function ollamaGenerate({ ollamaModel, system, schema, contents }: LLMRequest): Promise<any> {
  const messages: any[] = [];
  if (system || schema) {
    messages.push({
      role: "system",
      content: [system, schema ? schemaToPrompt(schema) : null].filter(Boolean).join("\n\n")
    });
  }
  messages.push({ role: "user", content: contentsToPrompt(contents) });

  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: ollamaModel || OLLAMA_MODEL,
      messages,
      stream: false,
      format: "json",
      options: { temperature: 0.9, num_ctx: 8192 }
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Ollama error ${response.status}: ${detail.slice(0, 300)}`);
  }

  const data = await response.json();
  const text = data?.message?.content;
  if (!text) throw new Error("Ollama returned no content.");
  return JSON.parse(text);
}

/** Unified text generation: Gemini with retry, then fallback to local Ollama. */
async function generateText({ provider = "gemini", ollamaModel, system, schema, apiKey, contents }: LLMRequest): Promise<any> {
  if (provider === "ollama") {
    return ollamaGenerate({ ollamaModel, system, schema, contents });
  }

  // Default: Gemini with native responseSchema, retried on transient 429/503 overload
  const callGemini = async () => {
    const ai = getAI(apiKey);
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: system,
        responseMimeType: schema ? "application/json" : "text/plain",
        responseSchema: schema
      }
    });
    const text = response.text;
    if (!text) throw new Error("No response output content was received from the model.");
    return schema ? JSON.parse(text) : text;
  };

  const delays = [2000, 6000, 12000];
  let lastError: any;
  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      return await callGemini();
    } catch (e: any) {
      lastError = e;
      const transient = [429, 500, 503].includes(e?.status) || /429|503|UNAVAILABLE|overload|high demand/i.test(e?.message || "");
      if (!transient) break;
      console.warn(`Gemini transient failure (attempt ${attempt + 1}), retrying:`, e?.message);
      if (attempt < delays.length) await new Promise(r => setTimeout(r, delays[attempt]));
    }
  }

  // Fallback: local Ollama, so the app keeps working when the cloud model is down
  if (process.env.OLLAMA_FALLBACK !== "0") {
    console.warn("Gemini unavailable after retries, falling back to local Ollama.");
    try {
      return await ollamaGenerate({ ollamaModel, system, schema, contents });
    } catch (e: any) {
      console.error("Ollama fallback also failed:", e?.message);
    }
  }
  throw lastError;
}

// Gemini client initialization helper
const getAI = (overrideKey?: string) => {
  const apiKey = overrideKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Open Settings in the app to paste your key (saved locally in your browser only).");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// --- API Routes ---

/**
 * DNA Design Spec extraction helper
 */
app.post("/api/analyze-design", async (req, res) => {
  try {
    const { images, provider, apiKey } = req.body;
    if (provider === "ollama") {
      return res.status(400).json({ error: "Design DNA analysis needs a vision model. Switch to Gemini for image analysis (Ollama local models are text-only here)." });
    }
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: "Missing images. Please upload one or more references." });
    }

    const ai = getAI(apiKey);

    // Prepare visual and text parts for the multimodel request
    const parts = images.map((img: string) => {
      const split = img.split(",");
      const data = split.length > 1 ? split[1] : split[0];
      const mimeType = img.match(/data:(.*?);base64/)?.[1] || "image/jpeg";
      return {
        inlineData: { mimeType, data }
      };
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        ...parts,
        { text: "Analyze the uploaded visual references and extract the stylistic design DNA for the carousel template. Determine their exact typography theme, color palettes, spacing, and image generation style." }
      ],
      config: {
        systemInstruction: "You are an expert digital design and typography analyst. Your task is to output style configs corresponding to visual reference examples in perfect JSON format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Elegant human name for this custom style preset." },
            fontFamily: { type: Type.STRING, description: "Master typography font. Choose from 'Outfit', 'Plus Jakarta Sans', 'Space Grotesk', 'Inter', 'Bebas Neue' or similar system standard sans-serif fonts corresponding to the image." },
            accentColor: { type: Type.STRING, description: "The vibrant dominant HEX accent color extracted from references." },
            margins_mm: { type: Type.NUMBER, description: "Padding/margins layout value. Range between 12 to 24." },
            headlineSize: { type: Type.NUMBER, description: "Calculated headline pixel size. Standard range: 50 to 90." },
            bodySize: { type: Type.NUMBER, description: "Calculated body pixel size. Standard range: 16 to 24." },
            textAlign: { type: Type.STRING, description: "Natural alignment of the text content inside slides. Options: 'left', 'center', 'right'." },
            overlayOpacity: { type: Type.NUMBER, description: "Target base overlay dark filter range for legibility: 0.1 to 0.9." },
            vibe: { type: Type.STRING, description: "Dynamic style descriptor of images (e.g., 'minimalist tech gradients', 'modern 3D illustration', 'dark grunge, grain noise')." }
          },
          required: ["name", "fontFamily", "accentColor"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No analysis response content was received from the model.");
    }

    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Analysis Error in Design DNA service:", error);
    res.status(500).json({ error: error.message || "Design analysis failed." });
  }
});

/**
 * Safely sanitizes prompt history for Gemini models to prevent role validation exceptions.
 * It removes any leading model responses and merges consecutive identical-role messages.
 */
function sanitizeContents(historyList: any[]): any[] {
  const result: any[] = [];
  for (const m of historyList) {
    if (!m.text) continue;
    const role = m.role === "user" ? "user" : "model";
    
    if (result.length === 0) {
      if (role === "user") {
        result.push({ role, parts: [{ text: m.text }] });
      }
    } else {
      const last = result[result.length - 1];
      if (last.role === role) {
        last.parts[0].text += "\n" + m.text;
      } else {
        result.push({ role, parts: [{ text: m.text }] });
      }
    }
  }
  return result;
}

/**
 * Slide Carousel Content generation helper
 */
app.post("/api/generate-carousel", async (req, res) => {
  try {
    const { topic, history, spec, count = 6, sourceText, preset = "auto", provider, ollamaModel, apiKey } = req.body;

    // Perform clean, robust sanitization on history
    const contents = sanitizeContents(history || []);

    // Format prompt instructions based on preset and optional source
    let presetGuidance = "";
    if (preset === "news-flash") {
      presetGuidance = `This is a BREAKING NEWS / ACTU CHAUDE carousel format.
Slide 1: High-impact urgent headline with badge '🔴 FLASH ACTU', setting the scene.
Slide 2: The exact facts/timeline of what happened.
Slide 3: Why it matters and the direct business/market consequence.
Slide 4: Key figures or quote from experts.
Final slides: The takeaway and call to save/share.`;
    } else if (preset === "do-dont") {
      presetGuidance = `This is a 'DO THIS, NOT THAT' (À FAIRE / À ÉVITER) comparison carousel format.
Slides 2-5 must compare a bad common practice (comparisonDont) with a smart high-yield replacement (comparisonDo). Set layout to 'comparison'.`;
    } else if (preset === "mistakes") {
      presetGuidance = `This is a 'ROOKIE MISTAKES' format. One major mistake per slide with immediate concrete fix.`;
    } else if (preset === "step-by-step") {
      presetGuidance = `This is a 'STEP-BY-STEP / FRAMEWORK' format. Slide 1 introduces the system. Subsequent slides are numbered Step 1 to Step N with actionable tactics.`;
    } else if (preset === "hot-take") {
      presetGuidance = `This is a 'HOT TAKE / AVIS TRANCHÉ' microblog format. Unpopular opinion that sparks discussion. Layout can use 'tweet-mockup' or 'bold-title'.`;
    } else if (preset === "case-study") {
      presetGuidance = `This is a 'CASE STUDY' format: The initial painful problem, what failed first, the breakthrough, and final metrics/numbers.`;
    }

    const sourceContext = sourceText && sourceText.trim().length > 0 
      ? `\n\nACTUALITY / SOURCE MATERIAL TO CONDENSE INTO THE CAROUSEL:\n"""\n${sourceText.trim()}\n"""\nExtract the core lessons and factual elements strictly from this source.`
      : "";

    // Add immediate request part
    const promptMessage = `Create exactly ${count} social media slides for a high-converting carousel about: "${topic}".
${presetGuidance}
${sourceContext}
${spec ? `Adhere strictly to this Design DNA spec: ${JSON.stringify(spec)}` : ""}
Ensure punchy, elite copywriting without generic AI fluff. One central idea per slide.`;

    if (contents.length > 0 && contents[contents.length - 1].role === "user") {
      contents[contents.length - 1].parts[0].text += "\n" + promptMessage;
    } else {
      contents.push({
        role: "user",
        parts: [{ text: promptMessage }]
      });
    }

    const schema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Catchy title for the deck." },
        accentColor: { type: Type.STRING, description: "HEX accent color (e.g., #2dd4bf, #f59e0b, #10b981, #38bdf8)." },
        fontFamily: { type: Type.STRING, description: "Font name: 'Outfit', 'Plus Jakarta Sans', 'Space Grotesk', 'Inter', or 'Bebas Neue'." },
        aspectRatio: { type: Type.STRING, description: "Must be '4:5' or '1:1'." },
        slides: {
          type: Type.ARRAY,
          description: `Array of exactly ${count} slides.`,
          items: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING, description: "Bold statement. Wrap ONE punchline word in curly braces {like this} for accent color styling." },
              body: { type: Type.STRING, description: "Clear, crisp supporting text." },
              visualPrompt: { type: Type.STRING, description: "Under 15 words image description." },
              layout: { type: Type.STRING, description: "Layout choice: 'bold-title', 'card-glass', 'comparison', 'tweet-mockup', 'center', 'bottom-left', 'minimal'." },
              badgeText: { type: Type.STRING, description: "Short badge tag (e.g., '🔴 FLASH ACTU', 'SWAP 01', 'ÉTAPE 1', 'ASTUCE')." },
              comparisonDont: { type: Type.STRING, description: "Only if layout is 'comparison': what to avoid." },
              comparisonDo: { type: Type.STRING, description: "Only if layout is 'comparison': what to do instead." }
            },
            required: ["headline", "body", "visualPrompt", "layout"]
          }
        }
      },
      required: ["title", "accentColor", "fontFamily", "aspectRatio", "slides"]
    };

    const aiOutput = await generateText({
      provider,
      ollamaModel,
      apiKey,
      system: "You are an elite ghostwriter and viral carousel designer for LinkedIn and Instagram. You write concise, high-value, scroll-stopping decks.",
      schema,
      contents
    });

    res.json(aiOutput);
  } catch (error: any) {
    console.error("Carousel generation failed:", error);
    res.status(500).json({ error: error.message || "Failed to generate carousel contents." });
  }
});

/**
 * Runtime Slide Visual Arts Image generation proxy
 * Uses Gemini Imagen if valid paid quota is present, with seamless automatic fallback to Pollinations.ai (Flux.1 Schnell / Sana)
 */
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, aspectRatio, vibe, apiKey, pollinationsKey } = req.body;
    
    // Mapping dimensions for slide ratios
    let width = 1080;
    let height = 1350;
    let imageRatio = "3:4";

    if (aspectRatio === "1:1") {
      width = 1080;
      height = 1080;
      imageRatio = "1:1";
    } else if (aspectRatio === "3:4") {
      width = 1080;
      height = 1440;
      imageRatio = "3:4";
    } else if (aspectRatio === "9:16") {
      width = 1080;
      height = 1920;
      imageRatio = "9:16";
    }

    const enhancedPrompt = `${prompt}, ${vibe || "modern clean soft ui minimalist 3d visual digital art"}`;

    // 1. Priorité Pollinations si clé fournie OU si pas de Gemini valide
    const polliApiKey = pollinationsKey || process.env.POLLINATIONS_API_KEY;

    // Tentative Pollinations direct (très haute qualité, Flux.1 Schnell / Sana)
    try {
      let polliUrl = "";
      if (polliApiKey) {
        polliUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(enhancedPrompt)}?model=black-forest-labs/flux.1-schnell&width=${width}&height=${height}&key=${polliApiKey}`;
      } else {
        // Mode public sans clé (Sana / Flux fast)
        polliUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${width}&height=${height}&nologo=true`;
      }

      const imgRes = await fetch(polliUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" }
      });

      if (imgRes.ok) {
        const arrayBuffer = await imgRes.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const contentType = imgRes.headers.get("content-type") || "image/jpeg";
        const imageUri = `data:${contentType};base64,${base64}`;
        return res.json({ imageUri, source: "pollinations" });
      }
    } catch (polliErr: any) {
      console.warn("Pollinations attempt failed, trying Gemini Imagen fallback:", polliErr?.message);
    }

    // 2. Si Pollinations n'a pas répondu, tentative via Google Gemini Imagen
    try {
      const ai = getAI(apiKey);
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: {
          parts: [{ text: `A professional, premium digital illustration, background or visual asset suitable for a high-quality presentation slide: ${prompt}. Esthetic style vibe: ${vibe || "modern gradient clean tech vector art style"}` }]
        },
        config: {
          imageConfig: {
            aspectRatio: imageRatio as any,
            imageSize: "1K"
          }
        }
      });

      const candidates = response.candidates;
      if (candidates && candidates.length > 0) {
        const parts = candidates[0].content?.parts;
        if (parts) {
          for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
              const imageUri = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
              return res.json({ imageUri, source: "gemini" });
            }
          }
        }
      }
    } catch (geminiErr: any) {
      console.warn("Gemini Imagen failed (likely quota 429):", geminiErr?.message);
    }

    // 3. Dernier fallback garanti
    const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&nologo=true`;
    return res.json({ imageUri: fallbackUrl, source: "pollinations-url" });

  } catch (error: any) {
    console.error("AI Slide Image draw failed:", error);
    res.json({ imageUri: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop" });
  }
});

// --- Start express and Vite Server ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server fully running on http://localhost:${PORT}`);
  });
}

startServer();
