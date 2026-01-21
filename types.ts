
export type LayoutType = 'center' | 'bottom-left' | 'split-vertical' | 'minimal' | 'bold-title' | 'comparison';
export type ThemeMode = 'dark' | 'light';
export type TextAlign = 'left' | 'center' | 'right';

export interface Branding {
  companyName: string;
  companyWebsite: string;
  iconUri?: string;
  showBranding: boolean;
}

export interface Slide {
  id: string;
  headline: string;
  body: string;
  visualPrompt: string;
  imageUri?: string;
  layout: LayoutType;
  overlayOpacity?: number;
  // Millimeter-level control overrides
  headlineSize?: number; // In px or relative units
  bodySize?: number;
  textAlign?: TextAlign;
  contentPadding?: number;
}

export interface CarouselConfig {
  title: string;
  accentColor: string;
  fontFamily: string;
  aspectRatio: '1:1' | '4:5';
  theme: ThemeMode;
  branding: Branding;
  slides: Slide[];
}

export interface GenerationState {
  isGeneratingContent: boolean;
  isGeneratingImages: boolean;
  progress: number;
}
