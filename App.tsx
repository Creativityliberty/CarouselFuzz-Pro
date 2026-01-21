
import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Settings, Image as ImageIcon, Download, Plus, Trash2, 
  ChevronLeft, ChevronRight, Monitor, Smartphone, Layers, Palette, 
  Type as TypeIcon, Cpu, Loader2, Zap, Camera, Upload, X, 
  CheckCircle2, Share2, Sun, Moon, Maximize2, FileJson, 
  MousePointer2, Layout as LayoutIcon, AlignLeft, AlignCenter, AlignRight,
  Globe, Building2, Send, RotateCw, Copy, Check
} from 'lucide-react';
import { CarouselConfig, Slide, GenerationState, LayoutType, TextAlign, ChatMessage } from './types';
import { generateCarouselContent, generateSlideImage } from './geminiService';
import JSZip from 'jszip';
import * as htmlToImage from 'html-to-image';

// --- UI Components ---

const Button: React.FC<{ 
  onClick?: () => void; 
  children: React.ReactNode; 
  variant?: 'primary' | 'glass' | 'danger' | 'white' | 'ghost';
  active?: boolean; 
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}> = ({ onClick, children, variant = 'glass', active, className, disabled, size = 'md' }) => {
  const base = "px-4 py-2 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 font-bold whitespace-nowrap active:scale-95";
  const styles = {
    primary: "bg-teal-500 text-white neon-glow hover:bg-teal-400 disabled:opacity-50 shadow-lg",
    white: "bg-white text-slate-900 shadow-xl hover:bg-slate-50 disabled:opacity-50",
    ghost: "text-slate-500 hover:text-white hover:bg-white/5",
    glass: active 
      ? "bg-teal-500/20 text-teal-400 border border-teal-500/50" 
      : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 dark:bg-slate-900/40",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white"
  };
  const sizes = { sm: "text-[10px] py-1.5 px-3", md: "text-sm", lg: "text-base py-3 px-6" };

  return (
    <button disabled={disabled} onClick={onClick} className={`${base} ${styles[variant]} ${sizes[size]} ${className}`}>
      {children}
    </button>
  );
};

const SlidePreview: React.FC<{ 
  slide: Slide; 
  config: CarouselConfig;
  exportMode?: boolean;
}> = ({ slide, config, exportMode }) => {
  const isVertical = config.aspectRatio === '4:5';
  const accent = config.accentColor;
  const scale = exportMode ? 2 : 1;
  const headlineSize = (slide.headlineSize || 60) * scale;
  const bodySize = (slide.bodySize || 20) * scale;
  const textAlign = slide.textAlign || 'left';
  const padding = (slide.contentPadding || 64) * scale;

  return (
    <div 
      id={`capture-${slide.id}`}
      className={`relative overflow-hidden flex flex-col group
        ${exportMode ? (isVertical ? 'w-[1080px] h-[1350px]' : 'w-[1080px] h-[1080px]') : (isVertical ? 'h-[600px] aspect-[4/5]' : 'h-[600px] aspect-square')}
        ${!exportMode ? 'rounded-[2.5rem] slide-canvas' : ''}`}
      style={{ backgroundColor: '#0f172a', fontFamily: config.fontFamily }}
    >
      {slide.imageUri ? (
        <img src={slide.imageUri} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Background" crossOrigin="anonymous" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-black" />
      )}
      
      <div 
        className="absolute inset-0"
        style={{ background: `linear-gradient(to bottom, transparent 20%, rgba(0,0,0,${slide.overlayOpacity || 0.8}) 100%)`, mixBlendMode: 'multiply' }}
      />

      {config.branding.showBranding && (
        <div className="absolute top-10 left-12 flex items-center gap-3 z-20">
          <div className="w-12 h-12 rounded-2xl bg-teal-500 flex items-center justify-center shadow-2xl neon-glow overflow-hidden">
            {config.branding.iconUri ? (
               <img src={config.branding.iconUri} className="w-full h-full object-cover" alt="Brand" />
            ) : (
               <Zap size={24} className="text-white fill-current" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black tracking-[0.4em] text-white/40 uppercase leading-none">
              {config.branding.companyWebsite}
            </span>
            <span className="text-xl font-black tracking-tighter text-white">
              {config.branding.companyName}
            </span>
          </div>
        </div>
      )}

      <div className={`absolute inset-0 flex flex-col z-20 transition-all duration-500`}
           style={{ padding: `${padding}px` }}>
        <div className={`h-full flex flex-col 
          ${slide.layout === 'center' ? 'justify-center items-center' : 
            slide.layout === 'bottom-left' ? 'justify-end items-start' : 
            slide.layout === 'split-vertical' ? 'justify-end items-start max-w-[70%]' : 
            slide.layout === 'bold-title' ? 'justify-center items-start' : 'justify-start pt-24'}`}
          style={{ textAlign: textAlign }}
        >
          <div className="space-y-6 w-full drop-shadow-2xl">
            <h1 className="font-black leading-[1.05] tracking-tight uppercase italic" style={{ fontSize: `${headlineSize}px` }}>
              {slide.headline.split('{').map((part, i) => {
                if (part.includes('}')) {
                  const [hl, rest] = part.split('}');
                  return <React.Fragment key={i}><span style={{ color: accent }}>{hl}</span>{rest}</React.Fragment>;
                }
                return part;
              })}
            </h1>
            <p className="text-slate-200/90 font-medium leading-relaxed" style={{ fontSize: `${bodySize}px` }}>
              {slide.body.split('{').map((part, i) => {
                if (part.includes('}')) {
                  const [hl, rest] = part.split('}');
                  return <React.Fragment key={i}><span className="underline decoration-teal-500/50 underline-offset-8">{hl}</span>{rest}</React.Fragment>;
                }
                return part;
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 right-12 flex flex-col items-end z-20">
        <div className="text-4xl font-black italic tracking-tighter text-white/20">0{config.slides.indexOf(slide) + 1}</div>
        <div className="w-12 h-1 bg-teal-500 mt-2 rounded-full" style={{ width: `${((config.slides.indexOf(slide) + 1) / config.slides.length) * 100}%`, backgroundColor: accent }} />
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [config, setConfig] = useState<CarouselConfig>({
    title: 'Modern Marketing Strategy',
    accentColor: '#2dd4bf',
    fontFamily: 'Outfit',
    aspectRatio: '4:5',
    theme: 'dark',
    branding: {
      companyName: 'CarouselFuzz',
      companyWebsite: 'carouselfuzz.ai',
      showBranding: true
    },
    slides: [{
      id: 'init',
      headline: 'The {Ultimate} Carousel Gen',
      body: 'Launch the AI Agent to build a data-driven carousel in seconds.',
      visualPrompt: 'High quality 3D glass abstract sphere, neon lights',
      layout: 'center',
      overlayOpacity: 0.8,
      headlineSize: 60,
      bodySize: 20,
      textAlign: 'center',
      contentPadding: 64
    }]
  });

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [genState, setGenState] = useState<GenerationState>({
    isGeneratingContent: false,
    isGeneratingImages: false,
    progress: 0
  });

  const mainRef = useRef<HTMLElement>(null);
  const brandIconRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.className = config.theme === 'light' ? 'theme-white' : '';
  }, [config.theme]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleApplyStyleToAll = (field: keyof Slide) => {
    const value = config.slides[currentIdx][field];
    const newSlides = config.slides.map(s => ({ ...s, [field]: value }));
    setConfig({ ...config, slides: newSlides });
  };

  const handleGenerate = async () => {
    if (!currentPrompt) return;
    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', text: currentPrompt }];
    setChatHistory(newHistory);
    setCurrentPrompt('');
    setGenState(p => ({ ...p, isGeneratingContent: true }));
    
    try {
      const result = await generateCarouselContent(currentPrompt, newHistory, imageBase64 || undefined);
      setConfig(prev => ({ ...prev, ...result }));
      setChatHistory(prev => [...prev, { role: 'model', text: "Carousel architected successfully based on your request. Use the editor to refine." }]);
      setCurrentIdx(0);
      setIsAgentOpen(false);
    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'model', text: "Architectural error. Please check your API access." }]);
    } finally {
      setGenState(p => ({ ...p, isGeneratingContent: false }));
    }
  };

  const handleGenerateImages = async () => {
    setGenState(p => ({ ...p, isGeneratingImages: true, progress: 0 }));
    const slides = [...config.slides];
    for (let i = 0; i < slides.length; i++) {
      try {
        const uri = await generateSlideImage(slides[i].visualPrompt, config.aspectRatio);
        slides[i] = { ...slides[i], imageUri: uri };
        setConfig(prev => ({ ...prev, slides: [...slides] }));
        setGenState(prev => ({ ...prev, progress: Math.round(((i + 1) / slides.length) * 100) }));
      } catch (e) { console.error(e); }
    }
    setGenState(p => ({ ...p, isGeneratingImages: false }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    const zip = new JSZip();
    const folder = zip.folder("carousel-fuzz-pro-pack");
    try {
      for (let i = 0; i < config.slides.length; i++) {
        setCurrentIdx(i);
        await new Promise(r => setTimeout(r, 800));
        const el = document.getElementById(`capture-${config.slides[i].id}`);
        if (el) {
          const dataUrl = await htmlToImage.toPng(el, { quality: 1, pixelRatio: 2 });
          folder?.file(`slide-${i+1}.png`, dataUrl.split(',')[1], { base64: true });
        }
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${config.title.replace(/\s+/g, '-')}.zip`;
      a.click();
    } catch (e) { alert("Export failed."); }
    finally { setIsExporting(false); }
  };

  const handleBrandIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setConfig(prev => ({ ...prev, branding: { ...prev.branding, iconUri: reader.result as string } }));
      reader.readAsDataURL(file);
    }
  };

  const updateSlide = (updates: Partial<Slide>) => {
    const slides = [...config.slides];
    slides[currentIdx] = { ...slides[currentIdx], ...updates };
    setConfig({ ...config, slides });
  };

  const updateBranding = (updates: Partial<typeof config.branding>) => {
    setConfig(prev => ({ ...prev, branding: { ...prev.branding, ...updates } }));
  };

  return (
    <div className={`flex h-screen ${config.theme === 'light' ? 'bg-[#f1f5f9]' : 'bg-[#030712]'} transition-all font-['Outfit']`}>
      
      {/* SIDEBAR */}
      <aside className="w-80 border-r border-white/5 flex flex-col p-6 glass overflow-y-auto z-40">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-2xl bg-teal-500 flex items-center justify-center neon-glow">
            <Cpu size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter">CarouselFuzz</h1>
        </div>

        <div className="space-y-8 flex-1 pr-1">
          <section>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Project Settings</h2>
            <div className="space-y-3">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                 <label className="text-[10px] uppercase font-black text-slate-500 block mb-2">Accent Theme</label>
                 <div className="flex items-center gap-3">
                    <input type="color" value={config.accentColor} onChange={e => setConfig({...config, accentColor: e.target.value})} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent" />
                    <span className="text-xs font-mono font-bold">{config.accentColor}</span>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <Button active={config.aspectRatio === '4:5'} onClick={() => setConfig({...config, aspectRatio: '4:5'})} size="sm">4:5 PORTRAIT</Button>
                 <Button active={config.aspectRatio === '1:1'} onClick={() => setConfig({...config, aspectRatio: '1:1'})} size="sm">1:1 SQUARE</Button>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
               <Building2 size={12} /> Brand Identity
            </h2>
            <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
               <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-400">Show Branding</span>
                  <input type="checkbox" checked={config.branding.showBranding} onChange={e => updateBranding({ showBranding: e.target.checked })} className="accent-teal-500" />
               </div>
               <input placeholder="Company Name" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs font-bold" value={config.branding.companyName} onChange={e => updateBranding({ companyName: e.target.value })} />
               <input placeholder="Website" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs font-bold" value={config.branding.companyWebsite} onChange={e => updateBranding({ companyWebsite: e.target.value })} />
               <Button size="sm" className="w-full" onClick={() => brandIconRef.current?.click()}><Upload size={12} /> Icon</Button>
               <input type="file" ref={brandIconRef} className="hidden" accept="image/*" onChange={handleBrandIconUpload} />
            </div>
          </section>

          <section className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Slide Navigator</h2>
              <button onClick={() => {
                const s: Slide = { id: Date.now().toString(), headline: 'New {Slide}', body: 'Edit content...', visualPrompt: 'Abstract', layout: 'center', headlineSize: 60, bodySize: 20, textAlign: 'center', contentPadding: 64, overlayOpacity: 0.8 };
                setConfig({...config, slides: [...config.slides, s]});
                setCurrentIdx(config.slides.length);
              }} className="p-1 hover:text-teal-400"><Plus size={18} /></button>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {config.slides.map((s, idx) => (
                <div key={s.id} onClick={() => setCurrentIdx(idx)} className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${currentIdx === idx ? 'border-teal-500 bg-teal-500/10 text-teal-400 shadow-sm' : 'border-white/5 bg-white/5 text-slate-500 hover:bg-white/10'}`}>
                  <span className="text-xs font-bold truncate pr-4">Slide {idx+1}</span>
                  <button onClick={e => { e.stopPropagation(); if(config.slides.length > 1) { setConfig({...config, slides: config.slides.filter((_, i) => i !== idx)}); setCurrentIdx(0); } }} className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="pt-6 border-t border-white/5 flex gap-2">
           <Button onClick={() => setConfig({...config, theme: config.theme === 'dark' ? 'light' : 'dark'})} className="flex-1">
             {config.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />} Theme
           </Button>
        </div>
      </aside>

      {/* MAIN VIEW */}
      <main ref={mainRef} className="flex-1 flex flex-col relative overflow-hidden bg-[#070b14]">
        
        {/* HEADER */}
        <header className="h-20 px-10 flex items-center justify-between border-b border-white/5 glass z-50">
          <div className="flex items-center gap-4">
             <div className="bg-white/5 px-4 py-2 rounded-2xl flex items-center gap-3">
               <FileJson size={16} className="text-teal-400" />
               <span className="text-sm font-bold truncate max-w-[200px]">{config.title}</span>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             <Button variant="glass" onClick={() => setIsAgentOpen(true)}>
               <Sparkles size={18} className="text-teal-400" /> AI Architect
             </Button>
             <Button variant="glass" onClick={handleGenerateImages} disabled={genState.isGeneratingImages}>
               {genState.isGeneratingImages ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />} Build Art
             </Button>
             <div className="w-px h-8 bg-white/10 mx-2" />
             <Button variant="white" onClick={handleExport} disabled={isExporting}>
               {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} Export Pack
             </Button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          
          {/* CANVAS AREA */}
          <div className="flex-1 p-16 flex flex-col items-center justify-center relative overflow-auto pattern-grid">
            <div className="absolute top-10 flex gap-4 bg-[#030712]/80 backdrop-blur-3xl p-3 rounded-full border border-white/10 shadow-2xl z-50">
               <button onClick={() => setCurrentIdx(p => Math.max(0, p-1))} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft /></button>
               <span className="text-xs font-black self-center tracking-widest px-6 uppercase opacity-60">Slide {currentIdx+1} of {config.slides.length}</span>
               <button onClick={() => setCurrentIdx(p => Math.min(config.slides.length-1, p+1))} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronRight /></button>
            </div>

            <div className="relative group p-6 animate-in zoom-in-95 duration-500">
              <SlidePreview slide={config.slides[currentIdx]} config={config} />
              
              <div className="absolute -right-20 top-1/2 -translate-y-1/2 flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                 <button 
                   onClick={async () => {
                     const uri = await generateSlideImage(config.slides[currentIdx].visualPrompt, config.aspectRatio);
                     updateSlide({ imageUri: uri });
                   }} 
                   className="w-14 h-14 bg-white/10 rounded-[1.5rem] border border-white/10 flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all hover:scale-110 shadow-2xl backdrop-blur-xl"
                   title="Regenerate this Image"
                 >
                   <RotateCw size={24} />
                 </button>
              </div>
            </div>

            {(genState.isGeneratingImages || isExporting) && (
              <div className="absolute bottom-10 flex flex-col items-center gap-4">
                <div className="bg-teal-500 text-white px-8 py-4 rounded-3xl shadow-2xl neon-glow flex items-center gap-4 animate-bounce">
                  <Loader2 size={24} className="animate-spin" />
                  <span className="text-sm font-black tracking-widest uppercase">{isExporting ? 'Exporting hi-res pack...' : `Processing Assets: ${genState.progress}%`}</span>
                </div>
                <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-400 transition-all duration-500" style={{ width: `${isExporting ? 100 : genState.progress}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT EDITOR PANEL */}
          <div className="w-[450px] border-l border-white/5 p-8 flex flex-col gap-10 glass overflow-y-auto">
            
            <section className="space-y-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
                <TypeIcon size={14} /> Typography Precision
              </h2>
              
              <div className="space-y-6">
                 {['headlineSize', 'bodySize', 'contentPadding'].map((field) => (
                    <div key={field} className="space-y-3">
                        <div className="flex justify-between items-end">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{field.replace(/([A-Z])/g, ' $1')}</label>
                           <div className="flex items-center gap-3">
                              <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md">{(config.slides[currentIdx] as any)[field]}px</span>
                              <button 
                                onClick={() => handleApplyStyleToAll(field as keyof Slide)}
                                className="text-[10px] text-slate-500 hover:text-teal-400 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md border border-white/10"
                                title="Apply to all slides"
                              >
                                <Copy size={10} /> Sync All
                              </button>
                           </div>
                        </div>
                        <input 
                          type="range" 
                          min={field === 'bodySize' ? 12 : 20} 
                          max={field === 'headlineSize' ? 150 : 150} 
                          value={(config.slides[currentIdx] as any)[field]} 
                          onChange={e => updateSlide({ [field]: parseInt(e.target.value) })}
                          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-teal-500" 
                        />
                    </div>
                 ))}

                 <div className="flex justify-between items-center py-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alignment</label>
                    <div className="flex gap-2">
                       {(['left', 'center', 'right'] as TextAlign[]).map(t => (
                         <button key={t} onClick={() => updateSlide({ textAlign: t })} className={`p-2.5 rounded-xl border transition-all ${config.slides[currentIdx].textAlign === t ? 'border-teal-500 bg-teal-500 text-white shadow-lg' : 'border-white/10 bg-white/5 text-slate-500 hover:bg-white/10'}`}>
                            {t === 'left' && <AlignLeft size={16} />}
                            {t === 'center' && <AlignCenter size={16} />}
                            {t === 'right' && <AlignRight size={16} />}
                         </button>
                       ))}
                       <button onClick={() => handleApplyStyleToAll('textAlign')} className="ml-2 p-2.5 bg-white/5 rounded-xl border border-white/10 text-slate-500 hover:text-teal-400" title="Sync Alignment to All"><Copy size={16} /></button>
                    </div>
                 </div>
              </div>
            </section>

            <section className="space-y-6 pt-6 border-t border-white/5">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
                <LayoutIcon size={14} /> Slide Content
              </h2>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Headline Text</label>
                  <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-teal-500/50 min-h-[90px] resize-none" value={config.slides[currentIdx].headline} onChange={e => updateSlide({ headline: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Body Copy</label>
                  <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs leading-relaxed focus:border-teal-500/50 min-h-[120px] resize-none text-slate-300" value={config.slides[currentIdx].body} onChange={e => updateSlide({ body: e.target.value })} />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Layout Variant</label>
                    <button onClick={() => handleApplyStyleToAll('layout')} className="text-[10px] text-slate-500 hover:text-teal-400 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md border border-white/10"><Copy size={10} /> Sync Layout</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {['center', 'bottom-left', 'split-vertical', 'minimal', 'bold-title', 'comparison'].map(l => (
                      <button key={l} onClick={() => updateSlide({ layout: l as LayoutType })} className={`px-4 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${config.slides[currentIdx].layout === l ? 'bg-teal-500 border-teal-500 text-white shadow-lg neon-glow' : 'border-white/5 bg-white/5 text-slate-500 hover:bg-white/10'}`}>
                        {l.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* AI ARCHITECT MODAL (CONVERSATIONAL) */}
      {isAgentOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl animate-in fade-in" onClick={() => !genState.isGeneratingContent && setIsAgentOpen(false)} />
          
          <div className="relative w-full max-w-5xl h-[85vh] bg-[#0c111d] rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <header className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center shadow-2xl neon-glow">
                  <Sparkles size={32} className="text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">AI Architect <span className="text-teal-400 opacity-60">v3.0</span></h2>
                  <p className="text-slate-500 font-bold tracking-widest text-[10px] uppercase">WebJSON Grounding & Vision Enabled</p>
                </div>
              </div>
              <button onClick={() => setIsAgentOpen(false)} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-slate-400 hover:text-white transition-all"><X /></button>
            </header>

            {/* Chat Container */}
            <div className="flex-1 overflow-y-auto p-10 space-y-6 flex flex-col">
               {chatHistory.length === 0 ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 opacity-40">
                    <Layers size={64} className="text-teal-500" />
                    <div className="max-w-md">
                      <h3 className="text-xl font-bold text-white mb-2">Initialize Architectural Engine</h3>
                      <p className="text-sm">Describe the topic, audience, and style. I will use real-time data to build your carousel.</p>
                    </div>
                 </div>
               ) : (
                 chatHistory.map((msg, i) => (
                   <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-6 py-4 rounded-[1.5rem] text-sm leading-relaxed ${msg.role === 'user' ? 'bg-teal-600 text-white font-bold' : 'bg-white/5 border border-white/10 text-slate-300'}`}>
                        {msg.text}
                      </div>
                   </div>
                 ))
               )}
               <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <footer className="p-10 pt-2 border-t border-white/5 space-y-6">
               <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <textarea 
                      placeholder="What should we architect? e.g. 5 rules for AI startups in 2025..."
                      className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] pl-8 pr-16 py-6 text-lg font-bold focus:outline-none focus:border-teal-500 transition-all min-h-[90px] max-h-[200px] resize-none"
                      value={currentPrompt}
                      onChange={e => setCurrentPrompt(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleGenerate())}
                    />
                    <button 
                      onClick={handleGenerate}
                      disabled={!currentPrompt || genState.isGeneratingContent}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-teal-500 text-white rounded-full flex items-center justify-center shadow-lg neon-glow disabled:opacity-30 transition-all active:scale-90"
                    >
                      {genState.isGeneratingContent ? <Loader2 className="animate-spin" /> : <Send size={24} />}
                    </button>
                  </div>
               </div>
               
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                       <input type="file" id="vision- architect" className="hidden" onChange={e => {
                          const f = e.target.files?.[0];
                          if(f) { const r = new FileReader(); r.onload = () => setImageBase64(r.result as string); r.readAsDataURL(f); }
                       }} />
                       <button onClick={() => document.getElementById('vision- architect')?.click()} className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${imageBase64 ? 'text-teal-400' : 'text-slate-500 hover:text-white'}`}>
                          {imageBase64 ? <CheckCircle2 size={16} /> : <Camera size={16} />}
                          {imageBase64 ? 'Ref Analysis Ready' : 'Add Vision Ref'}
                       </button>
                       {imageBase64 && <button onClick={() => setImageBase64(null)} className="text-red-500"><X size={12} /></button>}
                    </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="flex items-center gap-2 opacity-30">
                        <Check size={12} className="text-teal-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Web Grounding</span>
                     </div>
                     <div className="flex items-center gap-2 opacity-30">
                        <Check size={12} className="text-teal-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Vision Logic</span>
                     </div>
                  </div>
               </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
