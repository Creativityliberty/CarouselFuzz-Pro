
export type LayoutType = 'center' | 'bottom-left' | 'split-vertical' | 'minimal' | 'bold-title' | 'comparison';
export type ThemeMode = 'dark' | 'light';

export interface Slide {
  id: string;
  headline: string;
  body: string;
  visualPrompt: string;
  imageUri?: string;
  layout: LayoutType;
  overlayOpacity?: number;
}

export interface CarouselConfig {
  title: string;
  accentColor: string;
  fontFamily: string;
  aspectRatio: '1:1' | '4:5';
  theme: ThemeMode;
  slides: Slide[];
}

export interface GenerationState {
  isGeneratingContent: boolean;
  isGeneratingImages: boolean;
  progress: number;
}
