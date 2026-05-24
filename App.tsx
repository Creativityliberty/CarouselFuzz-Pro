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

// Components
import { Button } from './src/components/CoreButton';
import { SlidePreview } from './src/components/SlidePreview';
import { ProjectExplorer } from './src/components/ProjectExplorer';

export default function App() {
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('carouselfuzz_projects');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
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

  // Persistence
  useEffect(() => {
    localStorage.setItem('carouselfuzz_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    if (currentProject) {
      setProjects(prev => prev.map(p => p.id === currentProject.id ? currentProject : p));
    }
  }, [currentProject?.config, currentProject?.chatHistory]);

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
    } catch (e: any) { 
      const errMsg = e?.message || e?.toString() || "Unknown analysis error.";
      setChatHistory(prev => [...prev, { role: 'model', text: `Analysis failed: ${errMsg}. Please ensure images are valid and your GEMINI_API_KEY is configured in Settings.` }]);
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
    } catch (e: any) {
      const errMsg = e?.message || e?.toString() || "Unknown error.";
      setChatHistory(prev => [...prev, { role: 'model', text: `Error in generation: ${errMsg}. Please check your GEMINI_API_KEY inside Settings > Secrets if this is an authentication issue.` }]);
    } finally {
      setGenState(p => ({ ...p, isGeneratingContent: false }));
    }
  };

  const handleExport = async () => {
    if (!currentProject) return;
    setIsExporting(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder(`${currentProject.name.replace(/\s+/g, '_')}`);
      const originalIdx = currentIdx;
      
      for (let i = 0; i < currentProject.config.slides.length; i++) {
        setCurrentIdx(i);
        await new Promise(r => setTimeout(r, 800));
        const el = document.getElementById(`capture-${currentProject.config.slides[i].id}`);
        if (el) {
          const dataUrl = await htmlToImage.toPng(el, { quality: 1, pixelRatio: 2 });
          folder?.file(`slide-${i+1}.png`, dataUrl.split(',')[1], { base64: true });
        }
      }
      
      setCurrentIdx(originalIdx);
      const blob = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${currentProject.name}_carousel.zip`;
      a.click();
    } catch (e: any) { 
      console.error("Export failed:", e);
    } finally { 
      setIsExporting(false); 
    }
  };

  const updateSlide = (updates: Partial<Slide>) => {
    if (!currentProject) return;
    const slides = [...currentProject.config.slides];
    slides[currentIdx] = { ...slides[currentIdx], ...updates };
    setCurrentProject({ ...currentProject, config: { ...currentProject.config, slides } });
  };

  const handleBuildArt = async () => {
    if (!currentProject) return;
    setGenState(p => ({ ...p, isGeneratingImages: true, progress: 0 }));
    try {
      const slides = [...currentProject.config.slides];
      for (let i = 0; i < slides.length; i++) {
        const uri = await generateSlideImage(slides[i].visualPrompt, currentProject.config.aspectRatio, currentProject.config.customSpec?.vibe);
        slides[i] = { ...slides[i], imageUri: uri };
        setCurrentProject(prev => prev ? { ...prev, config: { ...prev.config, slides: [...slides] } } : null);
        setGenState(prev => ({ ...prev, progress: Math.round(((i+1)/slides.length)*100) }));
      }
    } finally {
      setGenState(p => ({ ...p, isGeneratingImages: false }));
    }
  };

  return (
    <div className={`relative min-h-screen ${!currentProject ? 'bg-slate-950' : (currentProject.config.theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-50')} transition-all font-sans overflow-hidden`}>
      {!currentProject ? (
        <ProjectExplorer 
          projects={projects} 
          onSelect={p => { setCurrentProject(p); setChatHistory(p.chatHistory || []); }}
          onDelete={id => setProjects(prev => prev.filter(p => p.id !== id))}
          onCreateNew={handleCreateNew}
        />
      ) : (
        <div className="flex h-screen w-full">
          {/* Editor Layout */}
          <aside className="w-80 border-r border-white/5 flex flex-col p-6 glass-panel z-40 overflow-y-auto">
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-teal-500 flex items-center justify-center shadow-lg">
                <Cpu size={20} className="text-white" />
             </div>
             <h1 className="text-xl font-black uppercase italic tracking-tighter">Forge</h1>
          </div>
          <button onClick={() => setCurrentProject(null)} className="p-2 hover:bg-white/5 rounded-xl text-slate-500"><History size={18} /></button>
        </header>

        <nav className="flex-1 space-y-8">
           <section className="space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Master Slides</h2>
              <div className="space-y-2">
                 {currentProject.config.slides.map((s, idx) => (
                    <div 
                      key={s.id} 
                      onClick={() => setCurrentIdx(idx)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${currentIdx === idx ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-white/5 hover:bg-white/5 text-slate-500'}`}
                    >
                      <span className="text-[11px] font-bold truncate">Slide {idx+1}</span>
                      <ChevronRight size={14} className={currentIdx === idx ? 'opacity-100' : 'opacity-0'} />
                    </div>
                 ))}
              </div>
           </section>
        </nav>

        <footer className="pt-6 border-t border-white/5 flex gap-2">
           <Button className="flex-1" onClick={() => setIsAgentOpen(true)}><Sparkles size={16} /> Strategy</Button>
           <Button variant="ghost" onClick={() => setCurrentProject({...currentProject, config: {...currentProject.config, theme: currentProject.config.theme === 'dark' ? 'light' : 'dark'}})}>
              {currentProject.config.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
           </Button>
        </footer>
      </aside>

      <main className="flex-1 flex flex-col bg-slate-900/50">
        <header className="h-20 px-10 flex items-center justify-between border-b border-white/5 glass-panel z-30">
          <div className="flex items-center gap-4">
            <Briefcase size={16} className="text-teal-400" />
            <span className="text-sm font-black uppercase italic tracking-widest">{currentProject.name}</span>
          </div>
          <div className="flex gap-4">
             <Button variant="glass" onClick={handleBuildArt} disabled={genState.isGeneratingImages}>
                {genState.isGeneratingImages ? <span className="flex items-center gap-2 text-teal-400"><Loader2 className="animate-spin" size={14} /> Generating {genState.progress}%</span> : <span className="flex items-center gap-2"><ImageIcon size={18} /> Build Visuals</span>}
             </Button>
             <Button variant="white" onClick={handleExport} disabled={isExporting}>
                {isExporting ? <Loader2 className="animate-spin" /> : <Download size={18} />} Export Pack
             </Button>
          </div>
        </header>

        {genState.isGeneratingImages && (
          <div className="w-full h-1 bg-slate-900 overflow-hidden relative">
            <div 
              className="h-full bg-gradient-to-r from-teal-500 to-teal-300 transition-all duration-500 ease-out" 
              style={{ width: `${genState.progress}%` }} 
            />
          </div>
        )}

        <div className="flex-1 flex overflow-hidden">
           <div className="flex-1 flex flex-col items-center justify-center p-10 relative">
              <div className="absolute top-8 flex gap-3 bg-black/40 backdrop-blur-xl p-1.5 rounded-full border border-white/10 z-50">
                <button onClick={() => setCurrentIdx(p => Math.max(0, p-1))} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft /></button>
                <div className="flex items-center px-4">
                  <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">{currentIdx+1} / {currentProject.config.slides.length}</span>
                </div>
                <button onClick={() => setCurrentIdx(p => Math.min(currentProject.config.slides.length-1, p+1))} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronRight /></button>
              </div>

              <div className="animate-in zoom-in-95 duration-500 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] rounded-[2.5rem] overflow-hidden">
                <SlidePreview slide={currentProject.config.slides[currentIdx]} config={currentProject.config} />
              </div>
           </div>

           <div className="w-[450px] border-l border-white/5 glass-panel p-8 overflow-y-auto space-y-10">
              <section className="space-y-6">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-2">
                    <Palette size={14} /> Design Specs
                 </h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Accent</label>
                       <input type="color" className="w-full h-10 bg-transparent border-none cursor-pointer" value={currentProject.config.accentColor} onChange={e => setCurrentProject({ ...currentProject, config: { ...currentProject.config, accentColor: e.target.value } })} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Typeface</label>
                       <select className="w-full bg-slate-800 rounded-lg p-2 text-xs font-bold" value={currentProject.config.fontFamily} onChange={e => setCurrentProject({ ...currentProject, config: { ...currentProject.config, fontFamily: e.target.value } })}>
                          {['Outfit', 'Plus Jakarta Sans', 'Space Grotesk', 'Inter', 'Bebas Neue'].map(f => <option key={f} value={f}>{f}</option>)}
                       </select>
                    </div>
                 </div>
              </section>

              <section className="space-y-6">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-2">
                    <TypeIcon size={14} /> Typography
                 </h3>
                 <div className="space-y-4">
                    {['headlineSize', 'bodySize', 'contentPadding'].map(key => (
                       <div key={key} className="space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                             <span>{key.replace(/([A-Z])/g, ' $1')}</span>
                             <span className="text-teal-400">{(currentProject.config.slides[currentIdx] as any)[key]}px</span>
                          </div>
                          <input type="range" min="10" max="150" value={(currentProject.config.slides[currentIdx] as any)[key]} onChange={e => updateSlide({ [key]: parseInt(e.target.value) })} className="w-full accent-teal-500" />
                       </div>
                    ))}
                 </div>
              </section>

              <section className="space-y-6">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-2">
                    <LayoutIcon size={14} /> Architecture
                 </h3>
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Layout Preset</label>
                       <select 
                         className="w-full bg-slate-800 border border-white/10 rounded-xl p-2.5 text-xs font-bold focus:ring-1 focus:ring-teal-500 outline-none text-white cursor-pointer select-element" 
                         value={currentProject.config.slides[currentIdx].layout} 
                         onChange={e => updateSlide({ layout: e.target.value as any })}
                       >
                          <option value="center">Center Focus</option>
                          <option value="bottom-left">Bottom Left Focus</option>
                          <option value="split-vertical">Split Vertical</option>
                          <option value="minimal">Minimalist</option>
                          <option value="bold-title">Bold Title Left</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Visual Background Prompt</label>
                       <textarea 
                         className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[11px] leading-relaxed text-slate-400 outline-none" 
                         rows={2} 
                         value={currentProject.config.slides[currentIdx].visualPrompt || ""} 
                         onChange={e => updateSlide({ visualPrompt: e.target.value })}
                         placeholder="Visual backdrop design concept..."
                       />
                    </div>
                    <textarea 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold focus:ring-1 focus:ring-teal-500 outline-none" 
                      rows={3} 
                      value={currentProject.config.slides[currentIdx].headline} 
                      onChange={e => updateSlide({ headline: e.target.value })}
                      placeholder="Headline"
                    />
                    <textarea 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[11px] leading-relaxed text-slate-400 outline-none" 
                      rows={5} 
                      value={currentProject.config.slides[currentIdx].body} 
                      onChange={e => updateSlide({ body: e.target.value })}
                      placeholder="Body copy..."
                    />
                 </div>
              </section>
           </div>
        </div>
      </main>
        </div>
      )}

      {/* Agent Overlay */}
      {isAgentOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => !genState.isGeneratingContent && setIsAgentOpen(false)} />
          <div className="relative w-full max-w-4xl h-[80vh] bg-slate-900 rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col">
            <header className="p-8 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-500 flex items-center justify-center shadow-lg">
                   {isArchitectFlow ? <Layers size={24} className="text-white" /> : <Sparkles size={24} className="text-white" />}
                </div>
                <div>
                   <h2 className="text-2xl font-black italic tracking-tighter uppercase">{isArchitectFlow ? 'Architect Mode' : 'Instant Strategy'}</h2>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Powered by Gemini WebJSON v4</p>
                </div>
              </div>
              <button onClick={() => setIsAgentOpen(false)} className="p-3 bg-white/5 rounded-xl border border-white/10 hover:text-red-400 transition-colors"><X size={20} /></button>
            </header>

            <div className="flex-1 overflow-y-auto p-10 space-y-6">
               {isArchitectFlow && architectImages.length === 0 && chatHistory.length === 0 && (
                 <div className="h-full flex flex-col items-center justify-center space-y-6">
                    <div className="w-20 h-20 bg-teal-500/10 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-teal-500/20">
                       <Camera className="text-teal-500" size={32} />
                    </div>
                    <div className="text-center">
                       <h3 className="text-xl font-bold italic uppercase">Sync Design DNA</h3>
                       <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">Upload screenshots of designs you love and we'll reverse-engineer the style.</p>
                    </div>
                    <input type="file" multiple id="architect-upload" className="hidden" accept="image/*" onChange={e => {
                        Array.from(e.target.files || []).forEach(f => {
                          const r = new FileReader();
                          r.onload = () => setArchitectImages(p => [...p, r.result as string]);
                          r.readAsDataURL(f);
                        });
                    }} />
                    <Button variant="primary" size="lg" onClick={() => document.getElementById('architect-upload')?.click()}>
                       <Upload size={18} /> Upload References
                    </Button>
                 </div>
               )}

               {architectImages.length > 0 && !genState.isAnalyzingDesign && (
                  <div className="grid grid-cols-4 gap-4">
                     {architectImages.map((img, i) => (
                        <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10">
                           <img src={img} className="w-full h-full object-cover" />
                           <button onClick={() => setArchitectImages(p => p.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 p-1 bg-black/60 rounded-lg"><X size={12} /></button>
                        </div>
                     ))}
                     <div className="col-span-full flex justify-center py-6">
                        <Button variant="neon" size="lg" onClick={handleArchitectAnalysis}>Analyze DNA</Button>
                     </div>
                  </div>
               )}

               {chatHistory.map((msg, i) => (
                 <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-${msg.role === 'user' ? 'right' : 'left'}-5`}>
                   <div className={`max-w-[85%] px-6 py-4 rounded-[2rem] text-sm ${msg.role === 'user' ? 'bg-teal-600 font-bold' : 'bg-white/5 border border-white/5 text-slate-300'}`}>
                      {msg.text}
                   </div>
                 </div>
               ))}
               <div ref={chatEndRef} />
            </div>

            <footer className="p-10 pt-0">
               <div className="relative">
                  <textarea 
                    className="w-full bg-slate-950/50 border border-white/10 rounded-[2.5rem] px-8 py-6 text-lg font-bold focus:ring-1 focus:ring-teal-500 outline-none pr-24 resize-none"
                    placeholder="Enter your topic or request..."
                    rows={2}
                    value={currentPrompt}
                    onChange={e => setCurrentPrompt(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleGenerate())}
                  />
                  <button 
                    disabled={!currentPrompt.trim() || genState.isGeneratingContent}
                    onClick={handleGenerate}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-14 h-14 bg-teal-500 rounded-full flex items-center justify-center shadow-lg shadow-teal-500/20 disabled:opacity-20 transition-all hover:scale-105 active:scale-95"
                  >
                     {genState.isGeneratingContent ? <Loader2 className="animate-spin" /> : <Send size={24} />}
                  </button>
               </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
