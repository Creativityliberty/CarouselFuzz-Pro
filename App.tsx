
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Sparkles, Settings, Image as ImageIcon, Download, Plus, Trash2, 
  ChevronLeft, ChevronRight, Cpu, Loader2, Zap, Camera, Upload, X, 
  CheckCircle2, Share2, Sun, Moon, Maximize2, FileJson, 
  MousePointer2, Layout as LayoutIcon, AlignLeft, AlignCenter, AlignRight,
  Building2, Send, RotateCw, Copy, Check, Grid, Briefcase, History,
  ArrowRight, Layers, Palette, Type as TypeIcon, Link as LinkIcon, Globe
} from 'lucide-react';
import { CarouselConfig, Slide, GenerationState, LayoutType, TextAlign, ChatMessage, Project, DesignSpec, DEFAULT_BRANDING } from './types';
import { generateCarouselContent, generateSlideImage, analyzeDesignADN } from './geminiService';
import JSZip from 'jszip';
import * as htmlToImage from 'html-to-image';

// --- UI Components ---

const Button: React.FC<{ 
  onClick?: () => void; 
  children: React.ReactNode; 
  variant?: 'primary' | 'glass' | 'danger' | 'white' | 'ghost' | 'neon';
  active?: boolean; 
  className?: string;
  disabled?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}> = ({ onClick, children, variant = 'glass', active, className, disabled, size = 'md' }) => {
  const base = "px-4 py-2 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 font-bold whitespace-nowrap active:scale-95";
  const styles = {
    primary: "bg-teal-500 text-white neon-glow hover:bg-teal-400 disabled:opacity-50 shadow-lg",
    white: "bg-white text-slate-900 shadow-xl hover:bg-slate-50 disabled:opacity-50",
    ghost: "text-slate-500 hover:text-white hover:bg-white/5",
    neon: "bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:bg-teal-500 hover:text-white neon-glow",
    glass: active 
      ? "bg-teal-500/20 text-teal-400 border border-teal-500/50" 
      : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 dark:bg-slate-900/40",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white"
  };
  const sizes = { 
    xs: "text-[9px] py-1 px-2", 
    sm: "text-[10px] py-1.5 px-3", 
    md: "text-sm", 
    lg: "text-base py-3 px-6",
    xl: "text-lg py-4 px-8 rounded-3xl"
  };

  return (
    <button disabled={disabled} onClick={onClick} className={`${base} ${styles[variant]} ${sizes[size]} ${className}`}>
      {children}
    </button>
  );
};

const SlidePreview: React.FC<{ slide: Slide; config: CarouselConfig; exportMode?: boolean }> = ({ slide, config, exportMode }) => {
  if (!config || !slide) return null;
  const isVertical = config.aspectRatio === '4:5';
  const accent = config.accentColor || "#2dd4bf";
  const scale = exportMode ? 2 : 1;
  const headlineSize = (slide.headlineSize || 60) * scale;
  const bodySize = (slide.bodySize || 20) * scale;
  const textAlign = slide.textAlign || 'left';
  const padding = (slide.contentPadding || 64) * scale;
  
  const branding = config.branding || DEFAULT_BRANDING;

  return (
    <div 
      id={`capture-${slide.id}`}
      className={`relative overflow-hidden flex flex-col group ${exportMode ? (isVertical ? 'w-[1080px] h-[1350px]' : 'w-[1080px] h-[1080px]') : (isVertical ? 'h-[600px] aspect-[4/5]' : 'h-[600px] aspect-square')} ${!exportMode ? 'rounded-[2.5rem] slide-canvas' : ''}`}
      style={{ backgroundColor: '#0f172a', fontFamily: config.fontFamily || 'Outfit' }}
    >
      {slide.imageUri ? <img src={slide.imageUri} className="absolute inset-0 w-full h-full object-cover" alt="" crossOrigin="anonymous" /> : <div className="absolute inset-0 bg-slate-900" />}
      <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 20%, rgba(0,0,0,${slide.overlayOpacity || 0.8}) 100%)`, mixBlendMode: 'multiply' }} />
      {branding && branding.showBranding && (
        <div className="absolute top-10 left-12 flex items-center gap-3 z-20">
          <div className="w-12 h-12 rounded-2xl bg-teal-500 flex items-center justify-center neon-glow overflow-hidden">
            {branding.iconUri ? <img src={branding.iconUri} className="w-full h-full object-cover" alt="" /> : <Zap size={24} className="text-white fill-current" />}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black tracking-[0.4em] text-white/40 uppercase leading-none">{branding.companyWebsite || "forge.design"}</span>
            <span className="text-xl font-black tracking-tighter text-white">{branding.companyName || "Forge Studio"}</span>
          </div>
        </div>
      )}
      <div className="absolute inset-0 flex flex-col z-20" style={{ padding: `${padding}px` }}>
        <div className={`h-full flex flex-col ${slide.layout === 'center' ? 'justify-center items-center' : slide.layout === 'bottom-left' ? 'justify-end items-start' : slide.layout === 'split-vertical' ? 'justify-end items-start max-w-[70%]' : slide.layout === 'bold-title' ? 'justify-center items-start' : 'justify-start pt-24'}`} style={{ textAlign }}>
          <div className="space-y-6 w-full drop-shadow-2xl">
            <h1 className="font-black leading-[1.05] tracking-tight uppercase italic text-white" style={{ fontSize: `${headlineSize}px` }}>
              {(slide.headline || "").split('{').map((part, i) => part.includes('}') ? <React.Fragment key={i}><span style={{ color: accent }}>{part.split('}')[0]}</span>{part.split('}')[1]}</React.Fragment> : part)}
            </h1>
            <p className="text-slate-200/90 font-medium leading-relaxed" style={{ fontSize: `${bodySize}px` }}>
              {(slide.body || "").split('{').map((part, i) => part.includes('}') ? <React.Fragment key={i}><span className="underline decoration-teal-500/50 underline-offset-8">{part.split('}')[0]}</span>{part.split('}')[1]}</React.Fragment> : part)}
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
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('carouselfuzz_projects');
      const parsed = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed.map((p: any) => ({
        ...p,
        config: {
          branding: DEFAULT_BRANDING,
          theme: 'dark',
          aspectRatio: '4:5',
          slides: [],
          ...p.config
        }
      }));
    } catch (e) {
      console.error("Storage error:", e);
      return [];
    }
  });

  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isArchitectFlow, setIsArchitectFlow] = useState(false);
  const [architectImages, setArchitectImages] = useState<string[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [customSpec, setCustomSpec] = useState<DesignSpec | undefined>();
  const [genState, setGenState] = useState<GenerationState>({
    isGeneratingContent: false,
    isGeneratingImages: false,
    isAnalyzingDesign: false,
    progress: 0
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync projects state to local storage
  useEffect(() => {
    localStorage.setItem('carouselfuzz_projects', JSON.stringify(projects));
  }, [projects]);

  // Handle auto-saving the current project updates
  useEffect(() => {
    if (currentProject) {
      setProjects(prev => prev.map(p => p.id === currentProject.id ? currentProject : p));
    }
  }, [currentProject?.config, currentProject?.chatHistory]);

  // Scroll chat to bottom
  useEffect(() => {
    if (isAgentOpen) {
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [isAgentOpen, chatHistory]);

  const saveProject = useCallback((config: CarouselConfig, history: ChatMessage[]) => {
    const newProject: Project = { 
      id: config.id, 
      name: config.title, 
      updatedAt: Date.now(), 
      config, 
      chatHistory: history 
    };
    setProjects(prev => [newProject, ...prev.filter(p => p.id !== config.id)]);
    setCurrentProject(newProject);
  }, []);

  const handleCreateNew = (type: 'flash' | 'architect') => {
    setChatHistory([]);
    setCustomSpec(undefined);
    setArchitectImages([]);
    setIsArchitectFlow(type === 'architect');
    setIsAgentOpen(true);
  };

  const handleArchitectAnalysis = async () => {
    if (architectImages.length === 0) return;
    setGenState(p => ({ ...p, isAnalyzingDesign: true }));
    try {
      const spec = await analyzeDesignADN(architectImages);
      setChatHistory(prev => [...prev, { role: 'model', text: `Design DNA captured: "${spec.name}". Stylistic parameters synchronized.` }]);
      setCustomSpec(spec);
      setArchitectImages([]);
    } catch (e) { 
      console.error(e);
      alert("Analysis failed. Please try with different images."); 
    } finally { 
      setGenState(p => ({ ...p, isAnalyzingDesign: false })); 
    }
  };

  const handleGenerate = async () => {
    if (!currentPrompt.trim()) return;
    const history: ChatMessage[] = [...chatHistory, { role: 'user', text: currentPrompt }];
    setChatHistory(history);
    const topic = currentPrompt;
    setCurrentPrompt('');
    setGenState(p => ({ ...p, isGeneratingContent: true }));
    
    try {
      const config = await generateCarouselContent(topic, history, customSpec);
      saveProject(config, history);
      setIsAgentOpen(false);
    } catch (e) {
      console.error(e);
      setChatHistory(prev => [...prev, { role: 'model', text: "Critical error in generation sequence. Check API logs." }]);
    } finally {
      setGenState(p => ({ ...p, isGeneratingContent: false }));
    }
  };

  const handleExport = async () => {
    if (!currentProject) return;
    setIsExporting(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder(`${currentProject.name}-pack`);
      const originalIdx = currentIdx;
      
      for (let i = 0; i < currentProject.config.slides.length; i++) {
        setCurrentIdx(i);
        // Wait for rendering to settle
        await new Promise(r => setTimeout(r, 1000));
        const el = document.getElementById(`capture-${currentProject.config.slides[i].id}`);
        if (el) {
          const dataUrl = await htmlToImage.toPng(el, { 
            quality: 1, 
            pixelRatio: 2,
            cacheBust: true
          });
          folder?.file(`slide-${i+1}.png`, dataUrl.split(',')[1], { base64: true });
        }
      }
      
      setCurrentIdx(originalIdx);
      const blob = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      // Cast to any to avoid shadowing conflict between browser native Blob and SDK Blob
      a.href = URL.createObjectURL(blob as any);
      a.download = `${currentProject.name.replace(/\s+/g, '_')}_carousel.zip`;
      a.click();
      // Revoke to clean up memory
      setTimeout(() => URL.revokeObjectURL(a.href), 10000);
    } catch (e) { 
      console.error("Export Error:", e);
      alert("Failed to export pack. Ensure all images are loaded."); 
    } finally { 
      setIsExporting(false); 
    }
  };

  const updateSlide = (updates: Partial<Slide>) => {
    if (!currentProject) return;
    const slides = [...currentProject.config.slides];
    if (!slides[currentIdx]) return;
    slides[currentIdx] = { ...slides[currentIdx], ...updates };
    setCurrentProject({ ...currentProject, config: { ...currentProject.config, slides } });
  };

  const handleApplyToAll = (field: keyof Slide) => {
    if (!currentProject) return;
    const value = currentProject.config.slides[currentIdx][field];
    const newSlides = currentProject.config.slides.map(s => ({ ...s, [field]: value }));
    setCurrentProject({ ...currentProject, config: { ...currentProject.config, slides: newSlides } });
  };

  const handleMasterSyncStyles = () => {
    if (!currentProject) return;
    const currentSlide = currentProject.config.slides[currentIdx];
    if (!currentSlide) return;
    const newSlides = currentProject.config.slides.map(s => ({
      ...s,
      headlineSize: currentSlide.headlineSize || 60,
      bodySize: currentSlide.bodySize || 20,
      contentPadding: currentSlide.contentPadding || 64,
      textAlign: currentSlide.textAlign || 'left',
      overlayOpacity: currentSlide.overlayOpacity ?? 0.8,
      layout: currentSlide.layout || 'center'
    }));
    setCurrentProject({
      ...currentProject,
      config: { ...currentProject.config, slides: newSlides }
    });
  };

  const handleBrandIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentProject) {
      const reader = new FileReader();
      reader.onload = () => {
        setCurrentProject({
          ...currentProject,
          config: {
            ...currentProject.config,
            branding: {
              ...currentProject.config.branding,
              iconUri: reader.result as string
            }
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBuildArt = async () => {
    if (!currentProject) return;
    setGenState(p => ({ ...p, isGeneratingImages: true, progress: 0 }));
    try {
      const slides = [...currentProject.config.slides];
      for (let i = 0; i < slides.length; i++) {
        const uri = await generateSlideImage(
          slides[i].visualPrompt, 
          currentProject.config.aspectRatio, 
          currentProject.config.customSpec?.vibe
        );
        slides[i] = { ...slides[i], imageUri: uri };
        setCurrentProject(prev => prev ? { 
          ...prev, 
          config: { ...prev.config, slides: [...slides] } 
        } : null);
        setGenState(prev => ({ ...prev, progress: Math.round(((i+1)/slides.length)*100) }));
      }
    } catch (e) {
      console.error(e);
      alert("Bulk generation interrupted. Check prompt constraints.");
    } finally {
      setGenState(p => ({ ...p, isGeneratingImages: false }));
    }
  };

  return (
    <div className={`flex h-screen ${currentProject?.config?.theme === 'light' ? 'theme-white bg-[#f8fafc]' : 'bg-[#030712]'} transition-all font-['Outfit'] overflow-hidden`}>
      
      {!currentProject ? (
        <div className="flex-1 min-h-screen p-20 flex flex-col overflow-y-auto">
          <header className="flex items-center justify-between mb-20 animate-in fade-in slide-in-from-top-10 duration-700">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[1.5rem] bg-teal-500 flex items-center justify-center neon-glow">
                <Cpu size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Forge de Design</h1>
                <p className="text-slate-500 font-bold tracking-widest text-xs uppercase opacity-60">Architectural Content Forge v3.5</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Button variant="glass" size="lg" onClick={() => handleCreateNew('flash')}>
                <Zap size={20} className="text-teal-400" /> Flash Create
              </Button>
              <Button variant="primary" size="lg" onClick={() => handleCreateNew('architect')}>
                <Layers size={20} /> Design Architect
              </Button>
            </div>
          </header>

          <main className="flex-1">
            <section className="mb-20">
              <div className="flex items-center gap-3 mb-8">
                <History size={20} className="text-slate-500" />
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">Recent Masterpieces</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {projects.map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => {
                      setCurrentProject(p);
                      setChatHistory(p.chatHistory || []);
                    }}
                    className="group bg-white/5 border border-white/10 rounded-[2.5rem] p-8 cursor-pointer hover:border-teal-500/50 hover:bg-teal-500/5 transition-all relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 blur-2xl group-hover:bg-teal-500/20 transition-all" />
                    <div className="flex justify-between items-start mb-10">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-teal-500 group-hover:text-white transition-all text-white">
                        <FileJson size={20} />
                      </div>
                      <button 
                        onClick={e => { 
                          e.stopPropagation(); 
                          setProjects(prev => prev.filter(pr => pr.id !== p.id)); 
                        }} 
                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-lg text-red-500 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <h3 className="text-xl font-black tracking-tight mb-2 truncate text-white">{p.name}</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{p.config?.slides?.length || 0} SLIDES • {new Date(p.updatedAt).toLocaleDateString()}</p>
                    <div className="mt-8 flex justify-end">
                      <ArrowRight size={20} className="text-teal-400 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
                    </div>
                  </div>
                ))}
                {projects.length === 0 && (
                  <div className="col-span-full py-20 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center opacity-40 text-slate-400">
                    <Grid size={48} className="mb-4" />
                    <p className="text-sm font-bold uppercase tracking-widest">No Projects Found. Launch the Architect.</p>
                  </div>
                )}
              </div>
            </section>
          </main>
        </div>
      ) : (
        <>
          <aside className="w-80 border-r border-white/5 flex flex-col p-6 glass overflow-y-auto z-40">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500 flex items-center justify-center neon-glow">
                  <Cpu size={20} className="text-white" />
                </div>
                <h1 className="text-xl font-black uppercase tracking-tighter">Forge Studio</h1>
              </div>
              <button onClick={() => setCurrentProject(null)} className="p-2 hover:bg-white/5 rounded-xl text-slate-500"><History size={18} /></button>
            </div>

            <div className="space-y-10 flex-1 pr-1">
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
                    <Building2 size={12} /> Brand Identity
                  </h2>
                  <button 
                    onClick={() => currentProject && setCurrentProject({
                      ...currentProject,
                      config: {
                        ...currentProject.config,
                        branding: { ...currentProject.config.branding, showBranding: !currentProject.config.branding.showBranding }
                      }
                    })}
                    className={`p-1.5 rounded-lg transition-all ${currentProject.config.branding.showBranding ? 'bg-teal-500/20 text-teal-400' : 'bg-white/5 text-slate-600'}`}
                  >
                    <Check size={12} />
                  </button>
                </div>

                <div className="bg-white/5 p-4 rounded-3xl border border-white/10 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative group w-14 h-14 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden cursor-pointer hover:border-teal-500/50 transition-all">
                      {currentProject.config.branding.iconUri ? (
                        <img src={currentProject.config.branding.iconUri} className="w-full h-full object-cover" alt="Logo" />
                      ) : (
                        <Camera size={20} className="text-slate-600 group-hover:text-teal-400" />
                      )}
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleBrandIconUpload} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <input 
                        type="text" 
                        placeholder="Company Name" 
                        className="w-full bg-transparent text-xs font-black uppercase tracking-widest text-white focus:outline-none"
                        value={currentProject.config.branding.companyName}
                        onChange={e => currentProject && setCurrentProject({
                          ...currentProject,
                          config: { ...currentProject.config, branding: { ...currentProject.config.branding, companyName: e.target.value } }
                        })}
                      />
                      <input 
                        type="text" 
                        placeholder="Website" 
                        className="w-full bg-transparent text-[10px] font-bold text-slate-500 focus:outline-none"
                        value={currentProject.config.branding.companyWebsite}
                        onChange={e => currentProject && setCurrentProject({
                          ...currentProject,
                          config: { ...currentProject.config, branding: { ...currentProject.config.branding, companyWebsite: e.target.value } }
                        })}
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="flex flex-col">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Master Slides</h2>
                <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1">
                  {(currentProject.config.slides || []).map((s, idx) => (
                    <div key={s.id} onClick={() => setCurrentIdx(idx)} className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between group ${currentIdx === idx ? 'border-teal-500 bg-teal-500/10 text-teal-400 shadow-lg' : 'border-white/5 bg-white/5 text-slate-500 hover:bg-white/10'}`}>
                      <span className="text-xs font-bold truncate">0{idx+1} • {(s.headline || "").replace(/[{}]/g, '')}</span>
                      <button onClick={e => { e.stopPropagation(); if(currentProject.config.slides.length > 1) { setCurrentProject({...currentProject, config: {...currentProject.config, slides: currentProject.config.slides.filter((_, i) => i !== idx)}}); setCurrentIdx(0); } }} className="opacity-0 group-hover:opacity-100 hover:text-red-400"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              </section>

              {currentProject.config.groundingSources && currentProject.config.groundingSources.length > 0 && (
                <section>
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
                    <LinkIcon size={12} /> Strategic Sources
                  </h2>
                  <div className="space-y-2 max-h-[25vh] overflow-y-auto pr-1">
                    {currentProject.config.groundingSources.map((source, i) => (
                      <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-xl bg-white/5 border border-white/10 hover:border-teal-500/50 transition-all">
                        <p className="text-[10px] font-bold text-white truncate">{source.title}</p>
                        <p className="text-[9px] text-slate-500 truncate">{source.uri}</p>
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="pt-6 border-t border-white/5 flex gap-2">
              <Button className="flex-1" onClick={() => setIsAgentOpen(true)}><Sparkles size={16} /> Chat AI</Button>
              <Button variant="ghost" onClick={() => currentProject && setCurrentProject({...currentProject, config: {...currentProject.config, theme: currentProject.config.theme === 'dark' ? 'light' : 'dark'}})}>
                {currentProject.config.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </Button>
            </div>
          </aside>

          <main className="flex-1 flex flex-col relative overflow-hidden bg-[#070b14]">
            <header className="h-20 px-10 flex items-center justify-between border-b border-white/5 glass z-50">
              <div className="flex items-center gap-4 text-white">
                <Briefcase size={16} className="text-teal-400" />
                <span className="text-sm font-black uppercase tracking-widest">{currentProject.name}</span>
              </div>
              <div className="flex gap-4">
                <Button variant="glass" onClick={handleBuildArt} disabled={genState.isGeneratingImages}>
                  {genState.isGeneratingImages ? <Loader2 className="animate-spin" /> : <ImageIcon size={18} />} Build All Art
                </Button>
                <Button variant="white" onClick={handleExport} disabled={isExporting}>
                  {isExporting ? <Loader2 className="animate-spin" /> : <Download size={18} />} Export Pack
                </Button>
              </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 p-10 flex flex-col items-center justify-center relative bg-black/20">
                <div className="absolute top-8 flex gap-3 bg-black/60 backdrop-blur-2xl p-2 rounded-full border border-white/10 shadow-2xl z-50">
                  <button onClick={() => setCurrentIdx(p => Math.max(0, p-1))} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"><ChevronLeft /></button>
                  <span className="text-[10px] font-black self-center tracking-widest px-4 uppercase opacity-60 text-white">Slide {currentIdx+1} / {currentProject.config.slides.length}</span>
                  <button onClick={() => setCurrentIdx(p => Math.min(currentProject.config.slides.length-1, p+1))} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"><ChevronRight /></button>
                </div>

                <div className="relative group p-6 animate-in zoom-in-95 duration-500">
                  {currentProject.config.slides[currentIdx] && (
                    <SlidePreview slide={currentProject.config.slides[currentIdx]} config={currentProject.config} />
                  )}
                  <div className="absolute -right-24 top-1/2 -translate-y-1/2 flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                    <button 
                      onClick={async () => {
                        try {
                          const s = currentProject.config.slides[currentIdx];
                          if (!s) return;
                          const uri = await generateSlideImage(s.visualPrompt, currentProject.config.aspectRatio, currentProject.config.customSpec?.vibe);
                          updateSlide({ imageUri: uri });
                        } catch (e) {
                          alert("Failed to refresh art. Retry later.");
                        }
                      }}
                      className="w-16 h-16 bg-white/10 rounded-3xl border border-white/10 flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all shadow-2xl backdrop-blur-3xl text-white"
                    >
                      <RotateCw size={24} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="w-[480px] border-l border-white/5 p-10 flex flex-col gap-10 glass overflow-y-auto text-white">
                {currentProject.config.slides[currentIdx] ? (
                  <>
                    <section className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-2">
                          <Palette size={14} /> Global Forge
                        </h2>
                        <Button variant="neon" size="xs" onClick={handleMasterSyncStyles}>
                          <RotateCw size={10} /> Sync All Specs
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Accent</label>
                            <button onClick={() => {
                              const val = currentProject.config.accentColor;
                              setCurrentProject({ ...currentProject, config: { ...currentProject.config, accentColor: val } });
                            }} className="p-1 hover:text-teal-400 transition-all"><Copy size={10} /></button>
                          </div>
                          <div className="flex items-center gap-3">
                            <input type="color" className="w-8 h-8 rounded-lg bg-transparent border-none cursor-pointer" value={currentProject.config.accentColor} onChange={e => setCurrentProject({ ...currentProject, config: { ...currentProject.config, accentColor: e.target.value } })} />
                            <span className="text-[10px] font-mono font-bold uppercase">{currentProject.config.accentColor}</span>
                          </div>
                        </div>
                        <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Typeface</label>
                            <button onClick={() => {
                              const val = currentProject.config.fontFamily;
                              setCurrentProject({ ...currentProject, config: { ...currentProject.config, fontFamily: val } });
                            }} className="p-1 hover:text-teal-400 transition-all"><Copy size={10} /></button>
                          </div>
                          <select 
                            className="w-full bg-transparent text-[10px] font-bold text-white focus:outline-none"
                            value={currentProject.config.fontFamily}
                            onChange={e => setCurrentProject({ ...currentProject, config: { ...currentProject.config, fontFamily: e.target.value } })}
                          >
                            <option value="Outfit">Outfit</option>
                            <option value="Plus Jakarta Sans">Jakarta</option>
                            <option value="Space Grotesk">Space</option>
                            <option value="Inter">Inter</option>
                            <option value="Bebas Neue">Bebas</option>
                          </select>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-6 pt-6 border-t border-white/5">
                      <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-2">
                        <TypeIcon size={14} /> Slide Precision
                      </h2>
                      
                      {['headlineSize', 'bodySize', 'contentPadding', 'overlayOpacity'].map((field) => (
                        <div key={field} className="space-y-4">
                          <div className="flex justify-between items-end">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{field.replace(/([A-Z])/g, ' $1')}</label>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-2 py-1 rounded-lg">
                                {field === 'overlayOpacity' ? Math.round((currentProject.config.slides[currentIdx] as any)[field] * 100) + '%' : (currentProject.config.slides[currentIdx] as any)[field] + 'px'}
                              </span>
                              <button onClick={() => handleApplyToAll(field as keyof Slide)} className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-slate-500 hover:text-teal-400" title="Sync All Slides"><Copy size={12} /></button>
                            </div>
                          </div>
                          <input 
                            type="range" 
                            min={field === 'overlayOpacity' ? 0 : (field === 'bodySize' ? 12 : 20)} 
                            max={field === 'overlayOpacity' ? 1 : 150} 
                            step={field === 'overlayOpacity' ? 0.05 : 1}
                            value={(currentProject.config.slides[currentIdx] as any)[field]} 
                            onChange={e => updateSlide({ [field]: parseFloat(e.target.value) })}
                            className="w-full h-1 bg-white/10 rounded-full appearance-none accent-teal-500"
                          />
                        </div>
                      ))}
                    </section>

                    <section className="space-y-6 pt-6 border-t border-white/5">
                      <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-2">
                        <LayoutIcon size={14} /> Content Architecture
                      </h2>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Headline Text</label>
                          <textarea className="w-full bg-white/5 border border-white/10 rounded-3xl p-5 text-sm font-bold focus:border-teal-500/50 min-h-[80px] resize-none text-white transition-all" value={currentProject.config.slides[currentIdx].headline} onChange={e => updateSlide({ headline: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Body Copy</label>
                          <textarea className="w-full bg-white/5 border border-white/10 rounded-3xl p-5 text-xs leading-relaxed text-slate-300 focus:border-teal-500/50 min-h-[120px] resize-none transition-all" value={currentProject.config.slides[currentIdx].body} onChange={e => updateSlide({ body: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {['center', 'bottom-left', 'split-vertical', 'minimal', 'bold-title', 'comparison'].map(l => (
                            <button key={l} onClick={() => updateSlide({ layout: l as LayoutType })} className={`px-3 py-3 rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all ${currentProject.config.slides[currentIdx].layout === l ? 'bg-teal-500 border-teal-500 text-white shadow-xl neon-glow' : 'border-white/5 bg-white/5 text-slate-500 hover:bg-white/10'}`}>
                              {l.replace('-', ' ')}
                            </button>
                          ))}
                        </div>
                      </div>
                    </section>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 text-xs font-bold uppercase tracking-widest opacity-40">
                    Select a slide to edit
                  </div>
                )}
              </div>
            </div>
          </main>
        </>
      )}

      {/* SHARED AGENT MODAL */}
      {isAgentOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={() => !genState.isGeneratingContent && setIsAgentOpen(false)} />
          <div className="relative w-full max-w-5xl h-[85vh] bg-[#0c111d] rounded-[4rem] border border-white/10 shadow-[0_100px_200px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
            <header className="p-10 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-3xl bg-teal-500 flex items-center justify-center neon-glow text-white">
                  {isArchitectFlow ? <Layers size={32} /> : <Sparkles size={32} />}
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white">{isArchitectFlow ? 'Design Architect' : 'AI Architect'}</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Vortex Core Active • WebJSON v3</p>
                </div>
              </div>
              <button onClick={() => setIsAgentOpen(false)} className="p-4 bg-white/5 rounded-2xl border border-white/10 text-slate-400 hover:text-white transition-all"><X /></button>
            </header>

            <div className="flex-1 overflow-y-auto p-12 space-y-8 flex flex-col">
              {isArchitectFlow && architectImages.length === 0 && chatHistory.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-700">
                  <div className="w-24 h-24 bg-teal-500/10 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-teal-500/30">
                    <Camera size={40} className="text-teal-500" />
                  </div>
                  <div className="max-w-md">
                    <h3 className="text-2xl font-black mb-2 uppercase italic text-white">Capture DNA</h3>
                    <p className="text-sm text-slate-400 font-medium">Upload design samples for reverse-engineering.</p>
                  </div>
                  <input type="file" multiple id="architect-upload" className="hidden" accept="image/*" onChange={e => {
                    const files = Array.from(e.target.files || []);
                    files.forEach(f => {
                      const r = new FileReader();
                      r.onload = () => setArchitectImages(p => [...p, r.result as string]);
                      r.readAsDataURL(f);
                    });
                  }} />
                  <Button variant="primary" size="xl" onClick={() => document.getElementById('architect-upload')?.click()}>
                    <Upload size={24} /> Upload References
                  </Button>
                </div>
              )}

              {architectImages.length > 0 && (
                <div className="grid grid-cols-5 gap-4">
                  {architectImages.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                      <img src={img} className="w-full h-full object-cover" alt="" />
                      <button onClick={() => setArchitectImages(p => p.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 p-1 bg-black/60 rounded-lg text-white"><X size={12} /></button>
                    </div>
                  ))}
                  <div className="col-span-full flex justify-center pt-8">
                    <Button variant="neon" size="xl" onClick={handleArchitectAnalysis} disabled={genState.isAnalyzingDesign}>
                      {genState.isAnalyzingDesign ? <Loader2 className="animate-spin text-white" /> : <Zap size={24} fill="currentColor" />} 
                      {genState.isAnalyzingDesign ? 'Analyzing DNA...' : 'Forge Template DNA'}
                    </Button>
                  </div>
                </div>
              )}

              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-${msg.role === 'user' ? 'right' : 'left'}-10 duration-500`}>
                  <div className={`max-w-[80%] px-8 py-5 rounded-[2.5rem] text-sm leading-relaxed shadow-xl ${msg.role === 'user' ? 'bg-teal-600 text-white font-bold' : 'bg-white/5 border border-white/10 text-slate-300'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <footer className="p-12 pt-4 space-y-6">
              <div className="relative">
                <textarea 
                  placeholder={customSpec ? `Template DNA active. Describe your topic...` : "Define your strategy, topic, and audience..."}
                  className="w-full bg-white/5 border border-white/20 rounded-[3rem] pl-10 pr-20 py-8 text-xl font-bold focus:outline-none focus:border-teal-500 transition-all min-h-[100px] max-h-[250px] resize-none shadow-inner text-white"
                  value={currentPrompt}
                  onChange={e => setCurrentPrompt(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleGenerate())}
                />
                <button 
                  onClick={handleGenerate}
                  disabled={!currentPrompt.trim() || genState.isGeneratingContent}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 bg-teal-500 text-white rounded-full flex items-center justify-center shadow-2xl neon-glow disabled:opacity-20 active:scale-90 transition-all"
                >
                  {genState.isGeneratingContent ? <Loader2 className="animate-spin" /> : <Send size={28} />}
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
