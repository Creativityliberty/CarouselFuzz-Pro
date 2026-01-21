
import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Settings, Image as ImageIcon, Download, Plus, Trash2, 
  ChevronLeft, ChevronRight, Monitor, Smartphone, Layers, Palette, 
  Type as TypeIcon, Cpu, Loader2, Zap, Camera, Upload, X, 
  CheckCircle2, Share2, Sun, Moon, Maximize2, FileJson, 
  MousePointer2, Layout as LayoutIcon
} from 'lucide-react';
import { CarouselConfig, Slide, GenerationState, LayoutType } from './types';
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
  
  return (
    <div 
      id={`capture-${slide.id}`}
      className={`relative overflow-hidden flex flex-col group
        ${exportMode ? (isVertical ? 'w-[1080px] h-[1350px]' : 'w-[1080px] h-[1080px]') : (isVertical ? 'h-[600px] aspect-[4/5]' : 'h-[600px] aspect-square')}
        ${!exportMode ? 'rounded-[2.5rem] slide-canvas' : ''}`}
      style={{ backgroundColor: '#0f172a', fontFamily: config.fontFamily }}
    >
      {/* Visual Content */}
      {slide.imageUri ? (
        <img src={slide.imageUri} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Background" />
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

      {/* Branding Layer */}
      <div className="absolute top-10 left-12 flex items-center gap-3 z-20">
        <div className="w-12 h-12 rounded-2xl bg-teal-500 flex items-center justify-center shadow-2xl neon-glow">
          <Zap size={24} className="text-white fill-current" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black tracking-[0.4em] text-white/40 uppercase leading-none">Creative Lab</span>
          <span className="text-xl font-black tracking-tighter text-white">Carousel<span className="text-teal-400">Fuzz</span></span>
        </div>
      </div>

      {/* Dynamic Layout Engine */}
      <div className={`absolute inset-0 p-16 flex flex-col z-20 transition-all duration-500
        ${slide.layout === 'center' ? 'justify-center items-center text-center' : 
          slide.layout === 'bottom-left' ? 'justify-end' : 
          slide.layout === 'split-vertical' ? 'justify-end max-w-[60%]' : 
          slide.layout === 'bold-title' ? 'justify-center items-start' : 'justify-start pt-40'}`}>
        
        <div className="space-y-6 w-full drop-shadow-2xl">
          <h1 className={`${exportMode ? 'text-9xl' : 'text-6xl'} font-black text-white leading-[1.05] tracking-tight uppercase italic`}>
            {slide.headline.split('{').map((part, i) => {
              if (part.includes('}')) {
                const [hl, rest] = part.split('}');
                return <React.Fragment key={i}><span style={{ color: accent }}>{hl}</span>{rest}</React.Fragment>;
              }
              return part;
            })}
          </h1>
          <p className={`${exportMode ? 'text-4xl' : 'text-xl'} text-slate-200/90 font-medium leading-relaxed max-w-lg`}>
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

      {/* Decorative Elements */}
      <div className="absolute bottom-10 right-12 flex flex-col items-end z-20">
        <div className="text-4xl font-black italic tracking-tighter text-white/20">0{config.slides.indexOf(slide) + 1}</div>
        <div className="w-12 h-1 bg-teal-500 mt-2 rounded-full" style={{ width: `${((config.slides.indexOf(slide) + 1) / config.slides.length) * 100}%` }} />
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
    slides: [{
      id: 'init',
      headline: 'The {Ultimate} Carousel Gen',
      body: 'Launch the AI Agent to build a data-driven carousel in seconds.',
      visualPrompt: 'High quality 3D glass abstract sphere, neon lights',
      layout: 'center'
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
    const folder = zip.folder("carousel-fuzz-pack");

    try {
      for (let i = 0; i < config.slides.length; i++) {
        setCurrentIdx(i);
        await new Promise(r => setTimeout(r, 600)); // Render wait
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
      alert("Export failed. Make sure all images are loaded.");
    } finally {
      setIsExporting(false);
    }
  };

  const updateSlide = (updates: Partial<Slide>) => {
    const slides = [...config.slides];
    slides[currentIdx] = { ...slides[currentIdx], ...updates };
    setConfig({ ...config, slides });
  };

  return (
    <div className={`flex h-screen ${config.theme === 'light' ? 'bg-[#f1f5f9]' : 'bg-[#030712]'} transition-all`}>
      
      {/* Sidebar: Projects & Controls */}
      <aside className="w-80 border-r border-white/5 flex flex-col p-6 glass">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-2xl bg-teal-500 flex items-center justify-center neon-glow">
            <Cpu size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter">CarouselFuzz</h1>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-[10px] uppercase font-bold text-slate-500">Pro AI v3.0</span>
            </div>
          </div>
        </div>

        <div className="space-y-8 flex-1 overflow-y-auto pr-2">
          <section>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Project Settings</h2>
            <div className="space-y-4">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                 <label className="text-[10px] uppercase font-black text-slate-500 block mb-2">Accent Theme</label>
                 <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={config.accentColor} 
                      onChange={e => setConfig({...config, accentColor: e.target.value})}
                      className="w-10 h-10 rounded-lg bg-transparent border-none cursor-pointer"
                    />
                    <span className="text-xs font-mono font-bold">{config.accentColor}</span>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <Button active={config.aspectRatio === '4:5'} onClick={() => setConfig({...config, aspectRatio: '4:5'})} size="sm">4:5 PORTRAIT</Button>
                 <Button active={config.aspectRatio === '1:1'} onClick={() => setConfig({...config, aspectRatio: '1:1'})} size="sm">1:1 SQUARE</Button>
              </div>
            </div>
          </section>

          <section className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Slides</h2>
              <button 
                onClick={() => {
                  const newSlide: Slide = { id: Date.now().toString(), headline: 'New {Heading}', body: 'Edit me...', visualPrompt: 'Abstract art', layout: 'center' };
                  setConfig({...config, slides: [...config.slides, newSlide]});
                  setCurrentIdx(config.slides.length);
                }}
                className="p-1 hover:text-teal-400"
              ><Plus size={18} /></button>
            </div>
            <div className="space-y-2">
              {config.slides.map((s, idx) => (
                <div 
                  key={s.id} 
                  onClick={() => setCurrentIdx(idx)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between group
                    ${currentIdx === idx ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-white/5 bg-white/5 text-slate-500 hover:bg-white/10'}`}
                >
                  <span className="text-xs font-bold truncate pr-4">Slide {idx+1}: {s.headline.replace(/[{}]/g, '')}</span>
                  <button onClick={e => {
                    e.stopPropagation();
                    if(config.slides.length > 1) {
                      const slides = config.slides.filter((_, i) => i !== idx);
                      setConfig({...config, slides});
                      setCurrentIdx(0);
                    }
                  }} className="opacity-0 group-hover:opacity-100 hover:text-red-400"><Trash2 size={14} /></button>
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

      {/* Main Studio Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 px-10 flex items-center justify-between border-b border-white/5 glass">
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
               {genState.isGeneratingImages ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
               Build Visuals
             </Button>
             <div className="w-px h-8 bg-white/10 mx-2" />
             <Button variant="white" onClick={handleExport} disabled={isExporting}>
               {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
               Export Final ZIP
             </Button>
          </div>
        </header>

        {/* Canvas & Editor */}
        <div className="flex-1 flex">
          
          {/* Canvas Wrapper */}
          <div className="flex-1 p-16 flex flex-col items-center justify-center bg-black/10 relative">
            <div className="absolute top-10 flex gap-4 bg-white/5 p-3 rounded-3xl border border-white/10 shadow-2xl z-50 backdrop-blur-xl">
               <button onClick={() => setCurrentIdx(p => Math.max(0, p-1))} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft /></button>
               <span className="text-sm font-black self-center tracking-widest px-4">SLIDE {currentIdx+1} / {config.slides.length}</span>
               <button onClick={() => setCurrentIdx(p => Math.min(config.slides.length-1, p+1))} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronRight /></button>
            </div>

            <div className="relative group p-6">
              <SlidePreview slide={config.slides[currentIdx]} config={config} />
              
              {/* Quick Hover Controls */}
              <div className="absolute -right-20 top-1/2 -translate-y-1/2 flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-all translate-x-10 group-hover:translate-x-0">
                 <button className="w-12 h-12 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all hover:scale-110 shadow-2xl">
                   <Maximize2 size={20} />
                 </button>
                 <button 
                  onClick={async () => {
                    const uri = await generateSlideImage(config.slides[currentIdx].visualPrompt, config.aspectRatio);
                    updateSlide({ imageUri: uri });
                  }}
                  className="w-12 h-12 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all hover:scale-110 shadow-2xl"
                 >
                   <Zap size={20} />
                 </button>
              </div>
            </div>

            {/* Gen Status */}
            {(genState.isGeneratingImages || isExporting) && (
              <div className="absolute bottom-10 animate-bounce flex items-center gap-3 bg-teal-500 text-white px-6 py-3 rounded-2xl shadow-2xl">
                <Loader2 size={20} className="animate-spin" />
                <span className="text-sm font-black tracking-widest uppercase">
                  {isExporting ? 'Capturing Hi-Res...' : `Processing Art: ${genState.progress}%`}
                </span>
              </div>
            )}
          </div>

          {/* Right Editor Side */}
          <div className="w-[450px] border-l border-white/5 p-8 flex flex-col gap-10 glass overflow-y-auto">
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 flex items-center gap-2">
                <MousePointer2 size={14} /> Global Style
              </h2>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500">Typography</label>
                    <select 
                      value={config.fontFamily} 
                      onChange={e => setConfig({...config, fontFamily: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold focus:outline-none"
                    >
                      <option value="Outfit">Outfit</option>
                      <option value="Plus Jakarta Sans">Jakarta</option>
                      <option value="Space Grotesk">Grotesk</option>
                      <option value="Bebas Neue">Bebas Neue</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500">Overlay Depth</label>
                    <input 
                      type="range" min="0" max="1" step="0.1" 
                      value={config.slides[currentIdx].overlayOpacity || 0.8}
                      onChange={e => updateSlide({ overlayOpacity: parseFloat(e.target.value) })}
                      className="w-full accent-teal-500"
                    />
                 </div>
              </div>
            </div>

            <div className="space-y-6 flex-1">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
                <LayoutIcon size={14} /> Slide Editor
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-2 block uppercase tracking-widest">Headline</label>
                  <textarea 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-lg font-black italic focus:border-teal-500/50 min-h-[100px] transition-all"
                    value={config.slides[currentIdx].headline}
                    onChange={e => updateSlide({ headline: e.target.value })}
                  />
                  <p className="text-[10px] text-slate-500 mt-2">Wrap {'{text}'} to colorize.</p>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-2 block uppercase tracking-widest">Body Text</label>
                  <textarea 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-medium leading-relaxed focus:border-teal-500/50 min-h-[120px] text-slate-300"
                    value={config.slides[currentIdx].body}
                    onChange={e => updateSlide({ body: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-4 block uppercase tracking-widest">Layout Variant</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['center', 'bottom-left', 'split-vertical', 'minimal', 'bold-title', 'comparison'].map(l => (
                      <button 
                        key={l}
                        onClick={() => updateSlide({ layout: l as LayoutType })}
                        className={`p-3 rounded-xl border text-[9px] font-black uppercase tracking-tighter transition-all
                          ${config.slides[currentIdx].layout === l ? 'bg-teal-500 border-teal-500 text-white shadow-lg' : 'border-white/10 bg-white/5 text-slate-500 hover:bg-white/10'}`}
                      >
                        {l.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-auto flex items-center justify-between opacity-30">
               <span className="text-[10px] font-black uppercase tracking-widest">Studio Engine v3.0</span>
               <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal-500" />
                  <div className="w-2 h-2 rounded-full bg-teal-500" />
               </div>
            </div>
          </div>
        </div>
      </main>

      {/* AI Strategist Modal */}
      {isAgentOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-2xl transition-opacity animate-in fade-in" 
            onClick={() => !genState.isGeneratingContent && setIsAgentOpen(false)} 
          />
          <div className="relative w-full max-w-4xl bg-slate-900 rounded-[3rem] p-12 border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 blur-[150px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="flex flex-col md:flex-row gap-12 relative z-10">
              <div className="flex-1 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center shadow-2xl neon-glow">
                    <Sparkles size={40} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">Strategy Architect</h2>
                    <p className="text-slate-400 font-bold tracking-widest text-xs uppercase">Powered by Gemini WebJSON v3</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Describe your vision</label>
                    <textarea 
                      placeholder="e.g. 10 Rules for AI startups to scale in 2025 using Lean Methodology..."
                      className="w-full bg-black/40 border border-white/10 rounded-[2rem] p-8 text-xl font-bold focus:outline-none focus:border-teal-500 transition-all min-h-[220px] resize-none shadow-inner"
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex-1">
                       <label className="text-xs font-black uppercase text-slate-500 tracking-widest mb-3 block">Reference Context</label>
                       <div className="flex gap-4">
                          <button 
                            onClick={() => document.getElementById('vision-upload')?.click()}
                            className="flex-1 py-4 px-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
                          >
                             {imageBase64 ? <CheckCircle2 size={18} className="text-teal-400" /> : <Camera size={18} />}
                             <span className="text-sm font-bold">{imageBase64 ? 'Analysis Ready' : 'Upload Vision Ref'}</span>
                          </button>
                          <input 
                            type="file" id="vision-upload" className="hidden" accept="image/*"
                            onChange={e => {
                              const f = e.target.files?.[0];
                              if(f) {
                                const r = new FileReader();
                                r.onload = () => setImageBase64(r.result as string);
                                r.readAsDataURL(f);
                              }
                            }}
                          />
                          {imageBase64 && <button onClick={() => setImageBase64(null)} className="p-4 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20"><X size={18} /></button>}
                       </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button variant="danger" className="flex-1 py-5" onClick={() => setIsAgentOpen(false)}>Abort Mission</Button>
                  <Button 
                    variant="primary" 
                    className="flex-[2] py-5" 
                    onClick={handleGenerate} 
                    disabled={!topic || genState.isGeneratingContent}
                  >
                    {genState.isGeneratingContent ? (
                      <><Loader2 size={24} className="animate-spin" /> Synthesizing Strategy...</>
                    ) : (
                      <><Zap size={24} fill="currentColor" /> Generate Masterpiece</>
                    )}
                  </Button>
                </div>
              </div>

              {/* Right Preview/Details */}
              <div className="w-80 hidden lg:flex flex-col gap-6">
                 <div className="p-6 rounded-3xl bg-black/40 border border-white/10">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Tactical Grounding</h3>
                    <div className="space-y-4">
                       <div className="flex items-center gap-3 opacity-60">
                          <CheckCircle2 size={14} className="text-teal-400" />
                          <span className="text-xs font-bold">Web Research Active</span>
                       </div>
                       <div className="flex items-center gap-3 opacity-60">
                          <CheckCircle2 size={14} className="text-teal-400" />
                          <span className="text-xs font-bold">Vision Logic Enabled</span>
                       </div>
                       <div className="flex items-center gap-3 opacity-60">
                          <CheckCircle2 size={14} className="text-teal-400" />
                          <span className="text-xs font-bold">JSON Schema Enforced</span>
                       </div>
                    </div>
                 </div>
                 
                 <div className="flex-1 rounded-3xl bg-teal-500/5 border border-teal-500/10 flex items-center justify-center p-8 text-center">
                    <div className="space-y-4">
                       <Sparkles size={48} className="text-teal-500 mx-auto opacity-20" />
                       <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest">Ready to build your viral content loop.</p>
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
