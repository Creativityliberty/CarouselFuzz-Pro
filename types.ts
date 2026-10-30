export type LayoutType = 
  | 'center' 
  | 'bottom-left' 
  | 'split-vertical' 
  | 'minimal' 
  | 'bold-title' 
  | 'comparison' 
  | 'card-glass' 
  | 'news-flash' 
  | 'tweet-mockup' 
  | 'gold-top-visual' 
  | 'soft-ui-card' 
  | 'custom-spec';

export type ThemeMode = 'dark' | 'light' | 'midnight-glass' | 'cream-editorial';
export type TextAlign = 'left' | 'center' | 'right';
export type BrandingDisplayMode = 'all' | 'first-last' | 'none';

export interface Branding {
  companyName: string;
  companyWebsite: string;
  iconUri?: string;
  showBranding: boolean;
  displayMode?: BrandingDisplayMode; // 'all' (default), 'first-last', 'none'
  handle?: string; // e.g. "@numtema"
  authorRole?: string; // e.g. "CEO & Founder"
}

export const DEFAULT_BRANDING: Branding = {
  companyName: "Numtema",
  companyWebsite: "numtemaagency.com",
  showBranding: true,
  displayMode: 'all',
  handle: "@numtema",
  authorRole: "Studio & Strategy",
  iconUri: "https://www.numtemaagency.com/images/logo-perle-lion.webp"
};

export interface BrandProfile {
  id: string;
  name: string;
  branding: Branding;
  accentColor: string;
  fontFamily: string;
}

export type FormatPreset = 
  | 'auto' 
  | 'do-dont' 
  | 'mistakes' 
  | 'step-by-step' 
  | 'case-study' 
  | 'hot-take' 
  | 'news-flash' 
  | 'tool-stack' 
  | 'mini-lesson';

export interface DesignSpec {
  id: string;
  name: string;
  fontFamily: string;
  accentColor: string;
  margins_mm: number;
  headlineSize: number;
  bodySize: number;
  textAlign: TextAlign;
  overlayOpacity: number;
  vibe: string;
}

export interface Slide {
  id: string;
  headline: string;
  body: string;
  visualPrompt: string;
  imageUri?: string;
  layout: LayoutType;
  overlayOpacity: number;
  headlineSize: number;
  bodySize: number;
  textAlign: TextAlign;
  contentPadding: number;
  // Nouveaux enrichissements Top Chef
  badgeText?: string; // e.g. "BREAKING", "MYTH vs FACT", "STEP 01", "01/05"
  subCardTitle?: string;
  subCardBody?: string;
  comparisonDo?: string;
  comparisonDont?: string;
  comparisonDoColor?: string; // couleur personnalisée pour le bloc DO
  comparisonDontColor?: string; // couleur personnalisée pour le bloc DON'T
  comparisonTextColor?: string; // couleur personnalisée pour le texte intérieur (par défaut blanc pur #ffffff)
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export type SocialAspectRatio = '1:1' | '4:5' | '3:4' | '9:16';

export interface CarouselConfig {
  id: string;
  title: string;
  accentColor: string;
  fontFamily: string;
  aspectRatio: SocialAspectRatio;
  theme: ThemeMode;
  branding: Branding;
  slides: Slide[];
  customSpec?: DesignSpec;
  groundingSources?: GroundingSource[];
  formatPreset?: FormatPreset;
  showSafeZones?: boolean;
  customGoogleFontUrl?: string; // Lien CSS Google Fonts externe (ex: https://fonts.googleapis.com/css2?family=Playfair+Display&display=swap)
}

export interface Project {
  id: string;
  name: string;
  updatedAt: number;
  config: CarouselConfig;
  chatHistory: ChatMessage[];
}

export interface GenerationState {
  isGeneratingContent: boolean;
  isGeneratingImages: boolean;
  isAnalyzingDesign: boolean;
  progress: number;
}
