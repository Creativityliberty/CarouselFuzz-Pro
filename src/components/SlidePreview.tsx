import React from 'react';
import { Slide, CarouselConfig, DEFAULT_BRANDING } from '../../types';
import { Zap } from 'lucide-react';

interface SlidePreviewProps {
  slide: Slide;
  config: CarouselConfig;
  exportMode?: boolean;
}

export const SlidePreview: React.FC<SlidePreviewProps> = ({ slide, config, exportMode }) => {
  if (!config || !slide) return null;
  const isVertical = config.aspectRatio === '4:5';
  const accent = config.accentColor || "#2dd4bf";
  const scale = exportMode ? 2 : 1;
  const headlineSize = (slide.headlineSize || 60) * scale;
  const bodySize = (slide.bodySize || 20) * scale;
  const textAlign = slide.textAlign || 'left';
  const padding = (slide.contentPadding || 64) * scale;
  
  const branding = config.branding || DEFAULT_BRANDING;

  const renderRichText = (text: string, color: string, underline: boolean = false) => {
    return text.split('{').map((part, i) => {
      if (part.includes('}')) {
        const [highlight, rest] = part.split('}');
        return (
          <React.Fragment key={i}>
            <span 
              style={{ color }} 
              className={underline ? "underline decoration-teal-500/50 underline-offset-8" : ""}
            >
              {highlight}
            </span>
            {rest}
          </React.Fragment>
        );
      }
      return part;
    });
  };

  return (
    <div 
      id={`capture-${slide.id}`}
      className={`relative overflow-hidden flex flex-col group ${
        exportMode 
          ? (isVertical ? 'w-[1080px] h-[1350px]' : 'w-[1080px] h-[1080px]') 
          : (isVertical ? 'h-[600px] aspect-[4/5]' : 'h-[600px] aspect-square')
      } ${!exportMode ? 'rounded-[2.5rem] shadow-2xl overflow-hidden' : ''}`}
      style={{ backgroundColor: '#0f172a', fontFamily: config.fontFamily || 'Outfit' }}
    >
      {slide.imageUri ? (
        <img src={slide.imageUri} className="absolute inset-0 w-full h-full object-cover" alt="" crossOrigin="anonymous" />
      ) : (
        <div className="absolute inset-0 bg-slate-900" />
      )}
      
      <div 
        className="absolute inset-0" 
        style={{ 
          background: `linear-gradient(to bottom, transparent 20%, rgba(0,0,0,${slide.overlayOpacity || 0.8}) 100%)`, 
          mixBlendMode: 'multiply' 
        }} 
      />

      {branding && branding.showBranding && (
        <div className="absolute top-10 left-12 flex items-center gap-3 z-20">
          <div className="w-12 h-12 rounded-2xl bg-teal-500 flex items-center justify-center shadow-lg overflow-hidden">
            {branding.iconUri ? (
              <img src={branding.iconUri} className="w-full h-full object-cover" alt="" />
            ) : (
              <Zap size={24} className="text-white fill-current" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black tracking-[0.4em] text-white/40 uppercase leading-none">{branding.companyWebsite || "forge.design"}</span>
            <span className="text-xl font-black tracking-tighter text-white">{branding.companyName || "Forge Studio"}</span>
          </div>
        </div>
      )}

      <div className="absolute inset-0 flex flex-col z-20" style={{ padding: `${padding}px` }}>
        <div 
          className={`h-full flex flex-col ${
            slide.layout === 'center' ? 'justify-center items-center' : 
            slide.layout === 'bottom-left' ? 'justify-end items-start' : 
            slide.layout === 'split-vertical' ? 'justify-end items-start max-w-[70%]' : 
            slide.layout === 'bold-title' ? 'justify-center items-start' : 
            'justify-start pt-24'
          }`} 
          style={{ textAlign }}
        >
          <div className="space-y-6 w-full drop-shadow-2xl">
            <h1 
              className="font-black leading-[1.05] tracking-tight uppercase italic text-white" 
              style={{ fontSize: `${headlineSize}px` }}
            >
              {renderRichText(slide.headline || "", accent)}
            </h1>
            <p className="text-slate-200/90 font-medium leading-relaxed" style={{ fontSize: `${bodySize}px` }}>
              {renderRichText(slide.body || "", accent, true)}
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 right-12 flex flex-col items-end z-20">
        <div className="text-4xl font-black italic tracking-tighter text-white/20">
          0{config.slides.indexOf(slide) + 1}
        </div>
        <div 
          className="w-12 h-1 bg-teal-500 mt-2 rounded-full" 
          style={{ 
            width: `${((config.slides.indexOf(slide) + 1) / config.slides.length) * 100}%`, 
            backgroundColor: accent 
          }} 
        />
      </div>
    </div>
  );
};
