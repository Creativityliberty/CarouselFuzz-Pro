import React from 'react';
import { Slide, CarouselConfig, DEFAULT_BRANDING } from '../../types';
import { Zap, AlertCircle, CheckCircle, XCircle, ArrowRight, Bookmark, Share2, Upload } from 'lucide-react';

interface SlidePreviewProps {
  slide: Slide;
  config: CarouselConfig;
  exportMode?: boolean;
}

export const SlidePreview: React.FC<SlidePreviewProps> = ({ slide, config, exportMode }) => {
  if (!config || !slide) return null;
  const ratio = config.aspectRatio || '4:5';
  const accent = config.accentColor || "#1d4ed8";
  const scale = exportMode ? 2 : 1;
  const headlineSize = (slide.headlineSize ?? 58) * scale;
  const bodySize = (slide.bodySize ?? 20) * scale;
  const textAlign = slide.textAlign || 'left';
  const padding = (slide.contentPadding ?? 52) * scale;
  
  const branding = config.branding || DEFAULT_BRANDING;
  const slideIndex = config.slides ? config.slides.indexOf(slide) : 0;
  const totalSlides = config.slides?.length || 1;
  const isFirstSlide = slideIndex === 0;
  const isLastSlide = slideIndex === totalSlides - 1;

  // Déterminer dimensions CSS selon le ratio (1:1, 4:5, 3:4, 9:16)
  const getDimensions = () => {
    if (exportMode) {
      switch (ratio) {
        case '1:1': return 'w-[1080px] h-[1080px]';
        case '3:4': return 'w-[1080px] h-[1440px]';
        case '9:16': return 'w-[1080px] h-[1920px]';
        case '4:5':
        default:
          return 'w-[1080px] h-[1350px]';
      }
    } else {
      switch (ratio) {
        case '1:1': return 'w-full max-w-[480px] md:max-w-[540px] aspect-square max-h-[70vh]';
        case '3:4': return 'w-full max-w-[420px] md:max-w-[480px] aspect-[3/4] max-h-[72vh]';
        case '9:16': return 'w-full max-w-[340px] md:max-w-[380px] aspect-[9/16] max-h-[76vh]';
        case '4:5':
        default:
          return 'w-full max-w-[440px] md:max-w-[500px] aspect-[4/5] max-h-[72vh]';
      }
    }
  };

  // Déterminer si le branding doit s'afficher selon le displayMode choisi
  const shouldShowBranding = branding.showBranding && (
    !branding.displayMode || 
    branding.displayMode === 'all' || 
    (branding.displayMode === 'first-last' && (isFirstSlide || isLastSlide))
  );

  const renderRichText = (text: string, color: string, underline: boolean = false) => {
    // Rendu avec support du saut de ligne propre (\n ou \n\n)
    const renderParagraph = (paragraph: string, keyPrefix: string) => {
      return paragraph.split('{').map((part, i) => {
        if (part.includes('}')) {
          const [highlight, rest] = part.split('}');
          return (
            <React.Fragment key={`${keyPrefix}-${i}`}>
              <span 
                style={{ color }} 
                className={underline ? "underline decoration-current underline-offset-8" : "font-extrabold"}
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

    const paragraphs = text.split('\n');
    return paragraphs.map((p, pIdx) => (
      <React.Fragment key={pIdx}>
        {renderParagraph(p, `p-${pIdx}`)}
        {pIdx < paragraphs.length - 1 && <br className="my-1.5" />}
      </React.Fragment>
    ));
  };

  // Par défaut le slide est en mode CLAIR BLANC (Soft UI Iconly) sauf si l'utilisateur a explicitement choisi 'midnight-glass'
  const isLightSlide = config.theme !== 'midnight-glass' || slide.layout === 'soft-ui-card';

  return (
    <div 
      id={`capture-${slide.id}`}
      className={`relative overflow-hidden flex flex-col group select-none ${getDimensions()} ${
        !exportMode 
          ? isLightSlide 
            ? 'rounded-[2.8rem] shadow-[0_30px_70px_-15px_rgba(15,23,42,0.12)] border-2 border-white' 
            : 'rounded-[2.8rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border border-white/10' 
          : ''
      }`}
      style={{ 
        backgroundColor: isLightSlide ? '#f4f6f9' : '#070b14', 
        fontFamily: config.fontFamily || 'Plus Jakarta Sans' 
      }}
    >
      {/* SAFE ZONES OVERLAY (toggleable like in aiCarousels) */}
      {config.showSafeZones && !exportMode && (
        <div className="absolute inset-0 z-50 pointer-events-none border-2 border-dashed border-red-500/40">
          <div className="absolute top-0 left-0 right-0 h-16 bg-red-500/10 border-b border-red-500/30 flex items-center justify-center text-[10px] font-mono text-red-500 font-bold">
            Zone masquée / Entête Réseau
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-red-500/10 border-t border-red-500/30 flex items-center justify-center text-[10px] font-mono text-red-500 font-bold">
            Zone masquée / Légende & Audio
          </div>
          {ratio === '9:16' && (
            <div className="absolute top-16 bottom-20 right-0 w-16 bg-red-500/10 border-l border-red-500/30 flex items-center justify-center text-[9px] font-mono text-red-500 font-bold text-center px-1">
              Actions
            </div>
          )}
        </div>
      )}

      {/* Custom Google Font Link Injection */}
      {config.customGoogleFontUrl && (
        <link rel="stylesheet" href={config.customGoogleFontUrl} />
      )}

      {/* Visual Background */}
      {slide.imageUri ? (
        <img src={slide.imageUri} className="absolute inset-0 w-full h-full object-cover" alt="" crossOrigin="anonymous" />
      ) : isLightSlide ? (
        /* FOND CLAIR PORCELAINE SOFT UI (Exactement comme la référence Iconly) */
        <div className="absolute inset-0 bg-gradient-to-b from-[#f8f9fc] via-[#f2f4f8] to-[#eaedf3]">
          <div 
            className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-[90px] opacity-20 pointer-events-none"
            style={{ backgroundColor: accent }}
          />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-[80px] opacity-20 pointer-events-none bg-blue-300" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0a0f1d] to-[#050811]">
          <div 
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-[120px] opacity-25 pointer-events-none"
            style={{ backgroundColor: accent }}
          />
          <div 
            className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full blur-[100px] opacity-15 pointer-events-none"
            style={{ backgroundColor: '#3b82f6' }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
        </div>
      )}
      
      {/* Multi-layered filter for contrast when dark or when image is present */}
      {(!isLightSlide || slide.imageUri) && (
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{ 
            background: isLightSlide 
              ? `linear-gradient(to bottom, rgba(255,255,255,0.75) 0%, rgba(244,246,249,${slide.overlayOpacity ?? 0.9}) 100%)`
              : `linear-gradient(to bottom, rgba(5,8,17,0.4) 0%, rgba(5,8,17,${slide.overlayOpacity ?? 0.85}) 100%)` 
          }} 
        />
      )}

      {/* TOP HEADER: NUMÉROTATION HORIZONTALE (01 02 03 ... 10) */}
      <div className="absolute top-4 left-8 right-8 flex items-center justify-between z-30 pointer-events-none">
        <div className="flex items-center justify-between w-full max-w-sm mx-auto px-4 py-1">
          {Array.from({ length: Math.min(totalSlides, 10) }).map((_, i) => (
            <span 
              key={i} 
              className={`text-[10px] md:text-xs font-mono font-bold transition-colors ${
                i === slideIndex 
                  ? (isLightSlide ? 'text-slate-900 scale-110' : 'text-white scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]')
                  : i < slideIndex 
                  ? (isLightSlide ? 'text-slate-500' : 'text-white/60') 
                  : (isLightSlide ? 'text-slate-300' : 'text-white/20')
              }`}
              style={{ color: i === slideIndex ? accent : undefined }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
          ))}
        </div>
      </div>

      {/* TOP HEADER: BRANDING (Style Iconly / Studio Pro) */}
      {shouldShowBranding && (
        <div className="absolute top-11 left-9 flex items-center gap-3 z-30">
          <div 
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md border overflow-hidden shrink-0 ${
              isLightSlide 
                ? 'bg-white border-white shadow-[0_8px_20px_-4px_rgba(15,23,42,0.1)]' 
                : 'bg-white/5 border-white/20 backdrop-blur-md'
            }`}
          >
            {branding.iconUri ? (
              <img 
                src={branding.iconUri} 
                className="w-full h-full object-contain p-1" 
                alt="" 
                crossOrigin="anonymous"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-sm font-black" style={{ color: accent }}>
                {(branding.companyName || "N")[0]}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <span className={`text-[10px] font-bold tracking-[0.15em] uppercase leading-none ${isLightSlide ? 'text-slate-400' : 'text-white/50'}`}>
              {branding.handle || branding.companyWebsite || "@numtema"}
            </span>
            <span className={`text-sm font-extrabold tracking-tight mt-0.5 ${isLightSlide ? 'text-slate-900' : 'text-white/95'}`}>
              {branding.companyName || "Numtema"}
            </span>
          </div>
        </div>
      )}

      {/* TOP RIGHT: BADGE / TAG */}
      {slide.badgeText && (
        <div className="absolute top-11 right-9 z-30">
          <div className={`px-3.5 py-1.5 rounded-full backdrop-blur-xl border flex items-center gap-2 ${
            isLightSlide 
              ? 'bg-white border-white text-slate-600 shadow-[0_6px_16px_-4px_rgba(15,23,42,0.08)]' 
              : 'bg-white/[0.08] border-white/15 text-white/90 shadow-lg'
          }`}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
            <span className="text-[10px] font-extrabold tracking-wider uppercase">
              {slide.badgeText}
            </span>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div 
        className="absolute inset-0 flex flex-col justify-center z-20 pt-20 pb-16 overflow-hidden" 
        style={{ paddingLeft: `${padding}px`, paddingRight: `${padding}px` }}
      >
        
        {/* LAYOUT: COMPARISON (DO VS DON'T) - Compatible Clair & Sombre */}
        {slide.layout === 'comparison' ? (
          <div className="flex flex-col h-full justify-center space-y-4 pt-4">
            <h1 
              className={`font-black leading-[1.15] tracking-tight uppercase ${isLightSlide ? 'text-slate-900' : 'text-white drop-shadow-md'}`}
              style={{ fontSize: `${headlineSize * 0.72}px`, textAlign }}
            >
              {renderRichText(slide.headline || "", accent)}
            </h1>

            {slide.body && (
              <p 
                className={`font-medium leading-relaxed text-xs md:text-sm -mt-1 ${isLightSlide ? 'text-slate-500' : 'text-slate-300'}`}
                style={{ textAlign }}
              >
                {renderRichText(slide.body, accent)}
              </p>
            )}

            <div className="grid grid-cols-1 gap-3.5 w-full">
              {/* DONT CARD */}
              <div 
                className={`rounded-[1.6rem] border p-5 flex items-start gap-4 transition-colors ${
                  isLightSlide 
                    ? 'bg-white shadow-[0_15px_35px_-10px_rgba(239,68,68,0.12)] border-red-100' 
                    : 'backdrop-blur-xl shadow-xl'
                }`}
                style={!isLightSlide ? { 
                  backgroundColor: `${slide.comparisonDontColor || '#ef4444'}18`, 
                  borderColor: `${slide.comparisonDontColor || '#ef4444'}40` 
                } : {
                  borderColor: `${slide.comparisonDontColor || '#ef4444'}35`
                }}
              >
                <div 
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                  style={{ 
                    backgroundColor: `${slide.comparisonDontColor || '#ef4444'}18`, 
                    color: slide.comparisonDontColor || '#ef4444' 
                  }}
                >
                  <XCircle size={22} />
                </div>
                <div className="flex flex-col flex-1">
                  <span 
                    className="text-xs font-black tracking-wider uppercase mb-1"
                    style={{ color: slide.comparisonDontColor || '#ef4444' }}
                  >
                    À ÉVITER
                  </span>
                  <p 
                    className="font-semibold text-sm md:text-base leading-relaxed"
                    style={{ color: slide.comparisonTextColor || (isLightSlide ? '#1e293b' : '#ffffff') }}
                  >
                    {slide.comparisonDont || "Continuer les formats fades et génériques qui ne convertissent pas."}
                  </p>
                </div>
              </div>

              {/* DO CARD */}
              <div 
                className={`rounded-[1.6rem] border p-5 flex items-start gap-4 transition-colors ${
                  isLightSlide 
                    ? 'bg-white shadow-[0_15px_35px_-10px_rgba(37,99,235,0.12)] border-blue-100' 
                    : 'backdrop-blur-xl shadow-xl'
                }`}
                style={!isLightSlide ? { 
                  backgroundColor: `${slide.comparisonDoColor || accent}18`, 
                  borderColor: `${slide.comparisonDoColor || accent}40` 
                } : {
                  borderColor: `${slide.comparisonDoColor || accent}35`
                }}
              >
                <div 
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                  style={{ 
                    backgroundColor: `${slide.comparisonDoColor || accent}18`, 
                    color: slide.comparisonDoColor || accent 
                  }}
                >
                  <CheckCircle size={22} />
                </div>
                <div className="flex flex-col flex-1">
                  <span 
                    className="text-xs font-black tracking-wider uppercase mb-1" 
                    style={{ color: slide.comparisonDoColor || accent }}
                  >
                    À FAIRE
                  </span>
                  <p 
                    className="font-semibold text-sm md:text-base leading-relaxed"
                    style={{ color: slide.comparisonTextColor || (isLightSlide ? '#0f172a' : '#ffffff') }}
                  >
                    {slide.comparisonDo || "Adopter une approche Soft UI propre avec une proposition claire."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : slide.layout === 'tweet-mockup' ? (
          /* LAYOUT: TWEET / MICROBLOG POST - Compatible Clair & Sombre */
          <div className="flex flex-col h-full justify-center pt-8">
            <div className={`rounded-[2.2rem] p-7 space-y-5 ${
              isLightSlide 
                ? 'bg-white border-2 border-white shadow-[0_25px_50px_-12px_rgba(15,23,42,0.1)]' 
                : 'bg-white/[0.06] backdrop-blur-2xl border border-white/15 shadow-2xl'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center border ${
                  isLightSlide ? 'bg-slate-50 border-slate-200/80' : 'bg-white/10 border-white/20'
                }`}>
                  {branding.iconUri ? (
                    <img src={branding.iconUri} className="w-full h-full object-contain p-1" alt="" crossOrigin="anonymous" />
                  ) : (
                    <span className={`font-black text-base ${isLightSlide ? 'text-slate-800' : 'text-white'}`}>
                      {(branding.companyName || "S")[0]}
                    </span>
                  )}
                </div>
                <div>
                  <div className={`font-extrabold text-base leading-tight ${isLightSlide ? 'text-slate-900' : 'text-white'}`}>
                    {branding.companyName || "Auteur"}
                  </div>
                  <div className={`text-xs font-mono ${isLightSlide ? 'text-slate-400' : 'text-white/40'}`}>
                    {branding.handle || "@numtema"}
                  </div>
                </div>
              </div>

              <h1 
                className={`font-extrabold leading-[1.15] tracking-tight ${isLightSlide ? 'text-slate-900' : 'text-white'}`}
                style={{ fontSize: `${headlineSize * 0.75}px` }}
              >
                {renderRichText(slide.headline || "", accent)}
              </h1>

              <p className={`text-base md:text-lg font-medium leading-relaxed border-t pt-4 ${
                isLightSlide ? 'text-slate-600 border-slate-100' : 'text-slate-300 border-white/10'
              }`}>
                {renderRichText(slide.body || "", accent)}
              </p>
            </div>
          </div>
        ) : slide.layout === 'gold-top-visual' ? (
          /* LAYOUT OPENBOT / VISUEL HAUT + PILL TITRE + TEXTE STRUCTURÉ */
          <div className="flex flex-col h-full justify-start pt-12 space-y-4">
            <div className={`w-full h-44 rounded-3xl overflow-hidden relative border shadow-lg shrink-0 ${
              isLightSlide ? 'bg-white border-white shadow-slate-200/70' : 'bg-slate-900/60 border-white/10'
            }`}>
              {slide.imageUri ? (
                <img src={slide.imageUri} className="w-full h-full object-cover" alt="" />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center relative overflow-hidden"
                  style={{ background: isLightSlide ? `linear-gradient(135deg, #ffffff 0%, ${accent}15 100%)` : undefined }}
                >
                  <div 
                    className="w-14 h-14 rounded-full border-2 border-white shadow-lg flex items-center justify-center font-black text-sm"
                    style={{ backgroundColor: `${accent}20`, color: accent }}
                  >
                    AI
                  </div>
                </div>
              )}
            </div>

            {/* Pillule Titre Centrée */}
            <div className="flex justify-center -mt-2">
              <div className={`px-5 py-2 rounded-full border shadow-md text-center ${
                isLightSlide 
                  ? 'bg-white border-slate-200/80 text-slate-900' 
                  : 'bg-white/[0.08] backdrop-blur-xl border-white/20 text-white'
              }`}>
                <span className="text-xs md:text-sm font-extrabold tracking-tight">
                  {renderRichText(slide.headline || "", accent)}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col justify-start pt-2">
              <p 
                className={`font-medium leading-relaxed whitespace-pre-line ${isLightSlide ? 'text-slate-600' : 'text-slate-200/90'}`} 
                style={{ fontSize: `${bodySize}px`, textAlign }}
              >
                {renderRichText(slide.body || "", accent)}
              </p>
            </div>
          </div>
        ) : slide.layout === 'soft-ui-card' ? (
          /* LAYOUT SIGNATURE ICONLY SOFT UI CLEAN (Carte Blanche Tactile, Dropzone Pointillée, Bulle Bleue, Boutons Pillules) */
          <div className="flex flex-col h-full justify-center pt-2">
            <div className="rounded-[2.2rem] bg-white/95 backdrop-blur-2xl border-2 border-white p-5 md:p-6 shadow-[0_24px_50px_-12px_rgba(15,23,42,0.10),inset_0_2px_4px_rgba(255,255,255,1)] space-y-3.5 relative overflow-hidden">
              
              {/* Top dashed container (Dropzone Iconly) */}
              <div className="rounded-[1.6rem] border-2 border-dashed border-slate-200/90 bg-[#f8fafc] p-4 flex flex-col items-center text-center space-y-2.5">
                {/* Tactile Soft Orb Icon */}
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center shadow-[0_12px_24px_-4px_rgba(37,99,235,0.28),inset_0_2px_6px_rgba(255,255,255,1)] border-2 border-white shrink-0"
                  style={{ background: `radial-gradient(circle at 30% 30%, #ffffff, ${accent}30)` }}
                >
                  <Upload size={20} style={{ color: accent }} />
                </div>

                <h1 
                  className="font-extrabold leading-[1.15] tracking-tight text-slate-900" 
                  style={{ fontSize: `${headlineSize * 0.60}px` }}
                >
                  {renderRichText(slide.headline || "", accent)}
                </h1>
              </div>

              {/* Inner Sleek Row Card (façon Class meeting row) */}
              <div className="rounded-[1.4rem] bg-[#f8fafc] border border-slate-200/70 p-3.5 shadow-sm space-y-2.5">
                <p className="text-slate-600 font-medium leading-relaxed font-mono text-[11px] md:text-xs" style={{ textAlign }}>
                  {renderRichText(slide.body || "", accent)}
                </p>
                {/* Progress bar pill */}
                <div className="w-full h-1.5 rounded-full bg-slate-200/80 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, ((slideIndex + 1) / totalSlides) * 100)}%`, backgroundColor: accent }}
                  />
                </div>
              </div>

              {/* Dual Soft Pill Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                <div className="py-2 px-3 rounded-full bg-[#f1f5f9] border border-slate-200/80 text-slate-800 font-bold text-[11px] text-center shadow-sm">
                  {branding.companyName || "Studio"}
                </div>
                <div 
                  className="py-2 px-3 rounded-full text-white font-bold text-[11px] text-center shadow-[0_10px_22px_-5px_rgba(29,78,216,0.45)]"
                  style={{ backgroundColor: accent }}
                >
                  {isLastSlide ? "Terminer" : "Continuer →"}
                </div>
              </div>
            </div>
          </div>
        ) : slide.layout === 'card-glass' ? (
          /* LAYOUT: CARTE FLOTTANTE (Blanche Soft UI en mode clair, Verre Sombre en mode sombre) */
          <div className="flex flex-col h-full justify-center pt-8">
            <div className={`rounded-[2.4rem] p-8 space-y-6 relative overflow-hidden ${
              isLightSlide 
                ? 'bg-white border-2 border-white shadow-[0_24px_50px_-12px_rgba(15,23,42,0.10)]' 
                : 'bg-white/[0.05] backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.6)]'
            }`}>
              <div 
                className="absolute top-0 left-0 right-0 h-1.5" 
                style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} 
              />
              <h1 
                className={`font-extrabold leading-[1.08] tracking-tight ${isLightSlide ? 'text-slate-900' : 'text-white drop-shadow-lg'}`}
                style={{ fontSize: `${headlineSize * 0.88}px`, textAlign }}
              >
                {renderRichText(slide.headline || "", accent)}
              </h1>
              <p 
                className={`font-medium leading-relaxed ${isLightSlide ? 'text-slate-600' : 'text-slate-200/90 drop-shadow-sm'}`} 
                style={{ fontSize: `${bodySize}px`, textAlign }}
              >
                {renderRichText(slide.body || "", accent, true)}
              </p>
            </div>
          </div>
        ) : (
          /* STANDARD & BOLD LAYOUTS (Adaptés Clair & Sombre) */
          <div 
            className={`h-full flex flex-col ${
              slide.layout === 'center' ? 'justify-center items-center text-center' : 
              slide.layout === 'bottom-left' ? 'justify-end items-start' : 
              slide.layout === 'split-vertical' ? 'justify-end items-start max-w-[85%]' : 
              slide.layout === 'bold-title' ? 'justify-center items-start' : 
              'justify-start pt-24'
            }`} 
            style={{ textAlign }}
          >
            <div className="space-y-6 w-full">
              <h1 
                className={`font-extrabold leading-[1.06] tracking-tight ${isLightSlide ? 'text-slate-900' : 'text-white drop-shadow-2xl'}`}
                style={{ fontSize: `${headlineSize}px` }}
              >
                {renderRichText(slide.headline || "", accent)}
              </h1>
              <p 
                className={`font-medium leading-relaxed ${isLightSlide ? 'text-slate-600' : 'text-slate-200/90'}`} 
                style={{ fontSize: `${bodySize}px` }}
              >
                {renderRichText(slide.body || "", accent, true)}
              </p>
            </div>
          </div>
        )}

      </div>

      {/* FOOTER: PROGRESSION & SWIPE INDICATOR */}
      <div className="absolute bottom-6 left-10 right-10 flex items-center justify-between z-30">
        <div className="flex items-center gap-1.5">
          {config.slides?.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === slideIndex ? 'w-8' : (isLightSlide ? 'w-2 bg-slate-300' : 'w-2 bg-white/20')
              }`}
              style={{ backgroundColor: idx === slideIndex ? accent : undefined }}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono font-bold tracking-wider ${isLightSlide ? 'text-slate-400' : 'text-white/40'}`}>
            {String(slideIndex + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
          </span>
          {!isLastSlide && (
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-sm ${
              isLightSlide ? 'bg-white border border-slate-200/80 text-slate-700' : 'bg-white/10 text-white/60'
            }`}>
              <ArrowRight size={13} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
