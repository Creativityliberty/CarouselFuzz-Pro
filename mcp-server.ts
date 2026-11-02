import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";
import path from "path";

const API_BASE = process.env.CAROUSEL_API_URL || "http://localhost:3001";
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const PROJECTS_DIR = path.join(process.cwd(), "projects");

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(PROJECTS_DIR)) fs.mkdirSync(PROJECTS_DIR, { recursive: true });

const server = new Server(
  {
    name: "carouselfuzz-pro-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "create_carousel_project",
        description:
          "Crée et sauvegarde un projet de carrousel complet avec slides personnalisées, images, titres, et design.",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Titre du projet / carrousel",
            },
            theme: {
              type: "string",
              enum: ["light", "dark", "midnight-glass", "cream-editorial"],
              description: "Thème visuel (par défaut light porcelaine)",
            },
            accentColor: {
              type: "string",
              description: "Couleur d'accentuation hexadécimale (ex: #1d4ed8)",
            },
            fontFamily: {
              type: "string",
              description: "Police typographique (ex: 'Plus Jakarta Sans', 'Outfit', 'Montserrat')",
            },
            aspectRatio: {
              type: "string",
              enum: ["4:5", "1:1", "3:4", "9:16"],
              description: "Ratio du carrousel (4:5 par défaut pour LinkedIn / Instagram)",
            },
            slides: {
              type: "array",
              description: "Liste des slides du carrousel",
              items: {
                type: "object",
                properties: {
                  headline: {
                    type: "string",
                    description: "Titre principal de la slide (entourer {mot} pour colorer)",
                  },
                  body: {
                    type: "string",
                    description: "Texte explicatif ou liste de points",
                  },
                  badgeText: {
                    type: "string",
                    description: "Badge supérieur (ex: '01/05', 'LE CONSTAT', 'ASTUCE')",
                  },
                  imageUri: {
                    type: "string",
                    description: "URL de l'image de fond ou chemin relatif /uploads/...",
                  },
                  layout: {
                    type: "string",
                    enum: [
                      "center",
                      "bottom-left",
                      "split-vertical",
                      "minimal",
                      "bold-title",
                      "comparison",
                      "card-glass",
                      "news-flash",
                      "soft-ui-card"
                    ],
                    description: "Disposition visuelle de la slide",
                  },
                  comparisonDo: {
                    type: "string",
                    description: "Texte pour le bloc vert DO (si layout comparison)",
                  },
                  comparisonDont: {
                    type: "string",
                    description: "Texte pour le bloc rouge DON'T (si layout comparison)",
                  },
                },
                required: ["headline"],
              },
            },
          },
          required: ["title", "slides"],
        },
      },
      {
        name: "upload_image_to_carousel",
        description:
          "Télécharge une image distante (depuis une URL web) ou copie un fichier local dans la bibliothèque d'images de CarouselFuzz pour l'utiliser dans n'importe quelle slide.",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "URL publique de l'image (ex: https://site.com/image.png)",
            },
            localFilePath: {
              type: "string",
              description: "Chemin absolu vers un fichier image local sur le Mac",
            },
          },
        },
      },
      {
        name: "list_carousel_projects",
        description: "Liste tous les projets carrousels créés et sauvegardés localement.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_carousel_project",
        description: "Récupère les données complètes d'un projet de carrousel par son ID.",
        inputSchema: {
          type: "object",
          properties: {
            projectId: {
              type: "string",
              description: "L'identifiant du projet",
            },
          },
          required: ["projectId"],
        },
      },
      {
        name: "generate_ai_carousel",
        description:
          "Demande au moteur IA de CarouselFuzz (Gemini ou Ollama local) de concevoir et générer automatiquement un carrousel complet à partir d'un sujet ou texte brut.",
        inputSchema: {
          type: "object",
          properties: {
            text: {
              type: "string",
              description: "Le sujet, article, repo ou texte brut à synthétiser en carrousel",
            },
            format: {
              type: "string",
              enum: [
                "auto",
                "do-dont",
                "mistakes",
                "step-by-step",
                "case-study",
                "hot-take",
                "news-flash",
                "tool-stack",
                "mini-lesson"
              ],
              description: "Format viral désiré",
            },
            numSlides: {
              type: "number",
              description: "Nombre de slides souhaitées (par défaut 5)",
            },
            apiKey: {
              type: "string",
              description: "Clé API Gemini optionnelle",
            },
          },
          required: ["text"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "upload_image_to_carousel") {
      const { url, localFilePath } = args as { url?: string; localFilePath?: string };

      if (url) {
        const resp = await fetch(`${API_BASE}/api/upload-url`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const data = await resp.json();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      } else if (localFilePath) {
        if (!fs.existsSync(localFilePath)) {
          throw new Error(`Fichier introuvable : ${localFilePath}`);
        }
        const ext = path.extname(localFilePath) || ".png";
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
        const targetPath = path.join(UPLOADS_DIR, filename);
        fs.copyFileSync(localFilePath, targetPath);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ url: `/uploads/${filename}`, filename }, null, 2),
            },
          ],
        };
      }
      throw new Error("Veuillez fournir soit 'url' soit 'localFilePath'.");
    }

    if (name === "create_carousel_project") {
      const { title, theme, accentColor, fontFamily, aspectRatio, slides } = args as any;
      const projectId = `proj-${Date.now()}`;
      const project = {
        id: projectId,
        name: title,
        date: new Date().toISOString(),
        config: {
          themeMode: theme || "light",
          accentColor: accentColor || "#1d4ed8",
          fontFamily: fontFamily || "Plus Jakarta Sans",
          aspectRatio: aspectRatio || "4:5",
          branding: {
            companyName: "Numtema",
            companyWebsite: "numtemaagency.com",
            showBranding: true,
            displayMode: "all",
            handle: "@numtema",
            authorRole: "Studio",
          },
          slides: slides.map((s: any, idx: number) => ({
            id: `slide-${idx + 1}`,
            headline: s.headline,
            body: s.body || "",
            badgeText: s.badgeText || `0${idx + 1}/${String(slides.length).padStart(2, "0")}`,
            imageUri: s.imageUri,
            layout: s.layout || (idx === 0 ? "bold-title" : "soft-ui-card"),
            overlayOpacity: 0.85,
            headlineSize: idx === 0 ? 54 : 40,
            bodySize: 20,
            textAlign: "left",
            contentPadding: 48,
            comparisonDo: s.comparisonDo,
            comparisonDont: s.comparisonDont,
          })),
        },
      };

      const filePath = path.join(PROJECTS_DIR, `${projectId}.json`);
      fs.writeFileSync(filePath, JSON.stringify(project, null, 2));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                projectId,
                viewUrl: `${API_BASE}?project=${projectId}`,
                project,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    if (name === "list_carousel_projects") {
      const files = fs.readdirSync(PROJECTS_DIR).filter((f) => f.endsWith(".json"));
      const projects = files
        .map((f) => {
          try {
            return JSON.parse(fs.readFileSync(path.join(PROJECTS_DIR, f), "utf-8"));
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(projects, null, 2),
          },
        ],
      };
    }

    if (name === "get_carousel_project") {
      const { projectId } = args as { projectId: string };
      const filePath = path.join(PROJECTS_DIR, `${projectId}.json`);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Projet ${projectId} introuvable.`);
      }
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }

    if (name === "generate_ai_carousel") {
      const resp = await fetch(`${API_BASE}/api/generate-carousel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
      });
      const data = await resp.json();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }

    throw new Error(`Outil inconnu : ${name}`);
  } catch (error: any) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Erreur MCP : ${error?.message || String(error)}`,
        },
      ],
    };
  }
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("CarouselFuzz Pro MCP Server running on stdio");
}

run().catch((err) => {
  console.error("Fatal MCP error:", err);
  process.exit(1);
});
