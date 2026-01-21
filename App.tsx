
import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Settings, Image as ImageIcon, Download, Plus, Trash2, 
  ChevronLeft, ChevronRight, Monitor, Smartphone, Layers, Palette, 
  Type as TypeIcon, Cpu, Loader2, Zap, Camera, Upload, X, 
  CheckCircle2, Share2, Sun, Moon, Maximize2, FileJson, 
  MousePointer2, Layout as LayoutIcon, AlignLeft, AlignCenter, AlignRight,
  Globe, Building2
} from 'lucide-react';
import { CarouselConfig, Slide, GenerationState, LayoutType, TextAlign } from './types';
import { generateCarouselContent, generateSlideImage } from './geminiService';
import JSZip from 'jszip';
import * as htmlToImage from 'html-to-image';

// --- UI Components ---

const Button: React.FC<{ 
  onClick?: () => void; 
  children: React.ReactNode; 
  variant?: 'primary' | 'glass' | 'danger' | 'white';
  active?: boolean; 
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}> = ({ onClick, children, variant = 'glass', active, className, disabled, size = 'md' }) => {
  const base = "px-4 py-2 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 font-bold whitespace-nowrap active:scale-95";
  const styles = {
    primary: "bg-teal-500 text-white neon-glow hover:bg-teal-400 disabled:opacity-50 shadow-lg",
    white: "bg-white text-slate-900 shadow-xl hover:bg-slate-50 disabled:opacity-50",
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
  
  // Dynamic scale factor for font sizes if export mode is high res
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
      style={{ 
        backgroundColor: '#0f172a', 
        fontFamily: config.fontFamily,
        padding: `${padding}px`
      }}
    >
      {/* Visual Content */}
      {slide.imageUri ? (
        <img src={slide.imageUri} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Background" crossOrigin="anonymous" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-black" />
      )}
      
      {/* Overlays */}
      <div 
        className="absolute inset-0"
        style={{ 
          background: `linear-gradient(to bottom, transparent 20%, rgba(0,0,0,${slide.overlayOpacity || 0.8}) 100%)`,
          mixBlendMode: 'multiply'
        }}
      />

      {/* Dynamic Branding Layer */}
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
              {config.branding.companyWebsite || "Creative Lab"}
            </span>
            <span className="text-xl font-black tracking-tighter text-white">
              {config.branding.companyName || "CarouselFuzz"}
            </span>
          </div>
        </div>
      )}

      {/* Dynamic Layout Engine */}
      <div className={`absolute inset-0 flex flex-col z-20 transition-all duration-500`}
           style={{ padding: `${padding}px` }}>
        <div className={`h-full flex flex-col 
          ${slide.layout === 'center' ? 'justify-center items-center' : 
            slide.layout === 'bottom-left' ? 'justify-end items-start' : 
            slide.layout === 'split-vertical' ? 'justify-end items-start max-w-[70%]' : 
            slide.layout === 'bold-title' ? 'justify-center items-start' : 'justify-start pt-24'}`}
          style={{ textAlign: textAlign }}
        >
          <div className={`space-y-6 w-full drop-shadow-2xl`}>
            <h1 
              className="font-black leading-[1.05] tracking-tight uppercase italic"
              style={{ fontSize: `${headlineSize}px` }}
            >
              {slide.headline.split('{').map((part, i) => {
                if (part.includes('}')) {
                  const [hl, rest] = part.split('}');
                  return <React.Fragment key={i}><span style={{ color: accent }}>{hl}</span>{rest}</React.Fragment>;
                }
                return part;
              })}
            </h1>
            <p 
              className="text-slate-200/90 font-medium leading-relaxed"
              style={{ fontSize: `${bodySize}px` }}
            >
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

      {/* Decorative Elements */}
      <div className="absolute bottom-10 right-12 flex flex-col items-end z-20">
        <div className="text-4xl font-black italic tracking-tighter text-white/20">0{config.slides.indexOf(slide) + 1}</div>
        <div className="w-12 h-1 bg-teal-500 mt-2 rounded-full" style={{ 
          width: `${((config.slides.indexOf(slide) + 1) / config.slides.length) * 100}%`,
          backgroundColor: accent
        }} />
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
  const [topic, setTopic] = useState('');
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [genState, setGenState] = useState<GenerationState>({
    isGeneratingContent: false,
    isGeneratingImages: false,
    progress: 0
  });

  const mainRef = useRef<HTMLElement>(null);
  const brandIconRef = useRef<HTMLInputElement>(null);

  // Apply Theme to Document Body
  useEffect(() => {
    document.documentElement.className = config.theme === 'light' ? 'theme-white' : '';
  }, [config.theme]);

  // Actions
  const handleGenerate = async () => {
    if (!topic) return;
    setGenState(p => ({ ...p, isGeneratingContent: true }));
    try {
      const result = await generateCarouselContent(topic, imageBase64 || undefined);
      // Initialize layout props for new slides
      result.slides = result.slides.map(s => ({
        ...s,
        headlineSize: 60,
        bodySize: 20,
        textAlign: s.layout === 'center' ? 'center' : 'left',
        contentPadding: 64
      }));
      setConfig(prev => ({ ...prev, ...result }));
      setCurrentIdx(0);
      setIsAgentOpen(false);
    } catch (e) {
      alert("Error generating masterpiece. Check API Key.");
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
        setGenState(p => ({ ...p, progress: Math.round(((i + 1) / slides.length) * 100) }));
      } catch (e) { console.error(e); }
    }
    setGenState(p => ({ ...p, isGeneratingImages: false }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    const zip = new JSZip();
    const folder = zip.folder("carousel-pack");

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
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.title.replace(/\s+/g, '-')}.zip`;
      a.click();
    } catch (e) {
      console.error(e);
      alert("Export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleBrandIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setConfig(prev => ({ 
        ...prev, 
        branding: { ...prev.branding, iconUri: reader.result as string } 
      }));
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
    <div className={`flex h-screen ${config.theme === 'light' ? 'bg-[#f1f5f9]' : 'bg-[#030712]'} transition-all`}>
      
      {/* Sidebar: Projects & Branding */}
      <aside className="w-80 border-r border-white/5 flex flex-col p-6 glass overflow-y-auto">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-2xl bg-teal-500 flex items-center justify-center neon-glow">
            <Cpu size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter">CarouselFuzz</h1>
        </div>

        <div className="space-y-8 flex-1 pr-2">
          {/* Global Visuals */}
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
                 <Button active={config.aspectRatio === '4:5'} onClick={() => setConfig({...config, aspectRatio: '4:5'})} size="sm">4:5</Button>
                 <Button active={config.aspectRatio === '1:1'} onClick={() => setConfig({...config, aspectRatio: '1:1'})} size="sm">1:1</Button>
              </div>
            </div>
          </section>

          {/* Branding Section */}
          <section>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
               <Building2 size={12} /> Brand Identity
            </h2>
            <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-400">Enable Branding</span>
                  <input 
                    type="checkbox" 
                    checked={config.branding.showBranding} 
                    onChange={e => updateBranding({ showBranding: e.target.checked })} 
                    className="accent-teal-500"
                  />
               </div>
               <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Company Name</label>
                  <input 
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs font-bold"
                    value={config.branding.companyName}
                    onChange={e => updateBranding({ companyName: e.target.value })}
                  />
               </div>
               <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Website URL</label>
                  <input 
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs font-bold"
                    value={config.branding.companyWebsite}
                    onChange={e => updateBranding({ companyWebsite: e.target.value })}
                  />
               </div>
               <div className="pt-2">
                  <Button size="sm" className="w-full" onClick={() => brandIconRef.current?.click()}>
                    <Upload size={12} /> Change Icon
                  </Button>
                  <input type="file" ref={brandIconRef} className="hidden" accept="image/*" onChange={handleBrandIconUpload} />
               </div>
            </div>
          </section>

          {/* Slides List */}
          <section className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Slides</h2>
              <button onClick={() => {
                const s: Slide = { id: Date.now().toString(), headline: 'New {Slide}', body: 'Edit content...', visualPrompt: 'Abstract', layout: 'center', headlineSize: 60, bodySize: 20, textAlign: 'center', contentPadding: 64 };
                setConfig({...config, slides: [...config.slides, s]});
                setCurrentIdx(config.slides.length);
              }} className="p-1 hover:text-teal-400"><Plus size={18} /></button>
            </div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {config.slides.map((s, idx) => (
                <div key={s.id} onClick={() => setCurrentIdx(idx)} className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${currentIdx === idx ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-white/5 bg-white/5 text-slate-500 hover:bg-white/10'}`}>
                  <span className="text-[11px] font-bold truncate pr-4">Slide {idx+1}</span>
                  <button onClick={e => {
                    e.stopPropagation();
                    if(config.slides.length > 1) {
                      const slides = config.slides.filter((_, i) => i !== idx);
                      setConfig({...config, slides});
                      setCurrentIdx(0);
                    }
                  }} className="opacity-0 group-hover:opacity-100 hover:text-red-400"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="pt-6 border-t border-white/5 flex gap-2">
           <Button onClick={() => setConfig({...config, theme: config.theme === 'dark' ? 'light' : 'dark'})} className="flex-1">
             {config.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />} Mode
           </Button>
        </div>
      </aside>

      {/* Main Studio Area */}
      <main ref={mainRef} className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 px-10 flex items-center justify-between border-b border-white/5 glass z-50">
          <div className="flex items-center gap-4">
             <div className="bg-white/5 px-4 py-2 rounded-2xl flex items-center gap-3">
               <FileJson size={16} className="text-teal-400" />
               <span className="text-sm font-bold truncate max-w-[200px]">{config.title}</span>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             <Button variant="glass" onClick={() => setIsAgentOpen(true)}>
               <Sparkles size={18} className="text-teal-400" /> Magic Agent
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

        {/* Canvas & Editor */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Canvas Wrapper */}
          <div className="flex-1 p-16 flex flex-col items-center justify-center bg-black/10 relative">
            <div className="absolute top-10 flex gap-4 bg-white/5 p-3 rounded-3xl border border-white/10 shadow-2xl z-50 backdrop-blur-xl">
               <button onClick={() => setCurrentIdx(p => Math.max(0, p-1))} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft /></button>
               <span className="text-sm font-black self-center tracking-widest px-4 uppercase">Slide {currentIdx+1} / {config.slides.length}</span>
               <button onClick={() => setCurrentIdx(p => Math.min(config.slides.length-1, p+1))} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronRight /></button>
            </div>

            <div className="relative group p-6">
              <SlidePreview slide={config.slides[currentIdx]} config={config} />
              
              <div className="absolute -right-20 top-1/2 -translate-y-1/2 flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-all">
                 <button onClick={async () => {
                   const uri = await generateSlideImage(config.slides[currentIdx].visualPrompt, config.aspectRatio);
                   updateSlide({ imageUri: uri });
                 }} className="w-12 h-12 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all hover:scale-110 shadow-2xl">
                   <Zap size={20} />
                 </button>
              </div>
            </div>
          </div>

          {/* Right Precision Editor */}
          <div className="w-[450px] border-l border-white/5 p-8 flex flex-col gap-8 glass overflow-y-auto">
            {/* Typography Controls */}
            <section className="space-y-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
                <TypeIcon size={14} /> Typography Precision
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <label className="text-[10px] font-bold text-slate-500">Headline size</label>
                      <span className="text-[10px] font-mono text-teal-400">{config.slides[currentIdx].headlineSize}px</span>
                    </div>
                    <input 
                      type="range" min="30" max="120" step="1" 
                      value={config.slides[currentIdx].headlineSize}
                      onChange={e => updateSlide({ headlineSize: parseInt(e.target.value) })}
                      className="w-full accent-teal-500"
                    />
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <label className="text-[10px] font-bold text-slate-500">Body size</label>
                      <span className="text-[10px] font-mono text-teal-400">{config.slides[currentIdx].bodySize}px</span>
                    </div>
                    <input 
                      type="range" min="12" max="40" step="1" 
                      value={config.slides[currentIdx].bodySize}
                      onChange={e => updateSlide({ bodySize: parseInt(e.target.value) })}
                      className="w-full accent-teal-500"
                    />
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-500">Alignment</label>
                    <div className="flex gap-1">
                       {(['left', 'center', 'right'] as TextAlign[]).map(t => (
                         <button 
                            key={t}
                            onClick={() => updateSlide({ textAlign: t })}
                            className={`p-2 rounded-lg border transition-all ${config.slides[currentIdx].textAlign === t ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-white/5 bg-white/5 text-slate-500'}`}
                         >
                            {t === 'left' && <AlignLeft size={14} />}
                            {t === 'center' && <AlignCenter size={14} />}
                            {t === 'right' && <AlignRight size={14} />}
                         </button>
                       ))}
                    </div>
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <label className="text-[10px] font-bold text-slate-500">Container Padding (mm-control)</label>
                      <span className="text-[10px] font-mono text-teal-400">{config.slides[currentIdx].contentPadding}px</span>
                    </div>
                    <input 
                      type="range" min="20" max="120" step="1" 
                      value={config.slides[currentIdx].contentPadding}
                      onChange={e => updateSlide({ contentPadding: parseInt(e.target.value) })}
                      className="w-full accent-teal-500"
                    />
                 </div>
              </div>
            </section>

            {/* Content Editor */}
            <section className="space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
                <MousePointer2 size={14} /> Slide Content
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-2 block">Headline (Use {'{text}'} for accent color)</label>
                  <textarea className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-bold focus:border-teal-500/50 min-h-[80px] resize-none" value={config.slides[currentIdx].headline} onChange={e => updateSlide({ headline: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-2 block">Body Text</label>
                  <textarea className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-medium focus:border-teal-500/50 min-h-[100px] resize-none text-slate-300" value={config.slides[currentIdx].body} onChange={e => updateSlide({ body: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-4 block uppercase tracking-widest">Layout Variant</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['center', 'bottom-left', 'split-vertical', 'minimal', 'bold-title', 'comparison'].map(l => (
                      <button key={l} onClick={() => updateSlide({ layout: l as LayoutType })} className={`p-2.5 rounded-xl border text-[9px] font-black uppercase tracking-tighter transition-all ${config.slides[currentIdx].layout === l ? 'bg-teal-500 border-teal-500 text-white shadow-lg' : 'border-white/10 bg-white/5 text-slate-500 hover:bg-white/10'}`}>
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

      {/* AI Strategist Modal */}
      {isAgentOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" onClick={() => !genState.isGeneratingContent && setIsAgentOpen(false)} />
          <div className="relative w-full max-w-4xl bg-slate-900 rounded-[3rem] p-12 border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 blur-[150px] -translate-y-1/2 translate-x-1/2" />
            <div className="flex flex-col md:flex-row gap-12 relative z-10">
              <div className="flex-1 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center shadow-2xl neon-glow">
                    <Sparkles size={40} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">Strategy Architect</h2>
                    <p className="text-slate-400 font-bold tracking-widest text-xs uppercase">WebJSON Analysis Active</p>
                  </div>
                </div>
                <div className="space-y-4">
                    <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Describe your topic</label>
                    <textarea 
                      placeholder="e.g. The psychology of colors in SaaS landing pages..."
                      className="w-full bg-black/40 border border-white/10 rounded-[2rem] p-8 text-xl font-bold focus:outline-none focus:border-teal-500 transition-all min-h-[200px] resize-none shadow-inner"
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                    />
                    <div className="flex gap-4">
                      <Button variant="danger" className="flex-1 py-5" onClick={() => setIsAgentOpen(false)}>Abort</Button>
                      <Button variant="primary" className="flex-[2] py-5" onClick={handleGenerate} disabled={!topic || genState.isGeneratingContent}>
                        {genState.isGeneratingContent ? <Loader2 size={24} className="animate-spin" /> : <><Zap size={24} fill="currentColor" /> Generate Masterpiece</>}
                      </Button>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
