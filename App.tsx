import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Sparkles, Settings, Image as ImageIcon, Download, Plus, Trash2, 
  ChevronLeft, ChevronRight, Loader2, X, 
  Sun, Moon, Maximize2, 
  Layout as LayoutIcon, AlignLeft, AlignCenter, AlignRight,
  Copy, Check, History,
  ArrowRight, Layers, Palette, Type as TypeIcon
} from 'lucide-react';
import { 
  CarouselConfig, Slide, GenerationState, 
  ChatMessage, Project, DesignSpec, BrandProfile, FormatPreset 
} from './types';
import { 
  generateCarouselContent, generateSlideImage, analyzeDesignADN, 
  getProvider, setProvider as setProviderState, type LLMProvider 
} from './geminiService';
import { DEFAULT_BRAND_PROFILES, PrebuiltTemplate } from './src/data/templates';
import JSZip from 'jszip';
import * as htmlToImage from 'html-to-image';

// Components
import { Button } from './src/components/CoreButton';
import { SlidePreview } from './src/components/SlidePreview';
import { ProjectExplorer } from './src/components/ProjectExplorer';
import { SettingsModal } from './src/components/SettingsModal';
import { BrandManagerModal } from './src/components/BrandManagerModal';

export default function App() {
  // Mobile drawer controls
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'preview' | 'edit'>('preview');

  // Profiles Management
  const [profiles, setProfiles] = useState<BrandProfile[]>(() => {
    try {
      const saved = localStorage.getItem('cf_brand_profiles');
      return saved ? JSON.parse(saved) : DEFAULT_BRAND_PROFILES;
    } catch {
      return DEFAULT_BRAND_PROFILES;
    }
  });

  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    try {
      return localStorage.getItem('cf_active_profile_id') || profiles[0].id;
    } catch {
      return profiles[0].id;
    }
  });

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  const [isBrandManagerOpen, setIsBrandManagerOpen] = useState(false);

  // Projects Management
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
  const [isPresenting, setIsPresenting] = useState(false);
  const [copiedSlideStyle, setCopiedSlideStyle] = useState<Partial<Slide> | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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

  const exportRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [provider, setProviderUI] = useState<LLMProvider>(getProvider());
  const setProviderLocal = (p: LLMProvider) => {
    setProviderUI(p);
    setProviderState(p);
  };

  // Persistence
  useEffect(() => {
    localStorage.setItem('carouselfuzz_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('cf_brand_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('cf_active_profile_id', activeProfileId);
  }, [activeProfileId]);

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
    setCurrentIdx(0);
  }, []);

  // Quick generation from AiCreationHero (avec presets aiCarousels & actualités)
  const handleGenerateQuick = async (
    topic: string, 
    sourceText: string, 
    preset: FormatPreset, 
    slideCount: number
  ) => {
    setGenState(p => ({ ...p, isGeneratingContent: true }));
    try {
      const config = await generateCarouselContent(
        topic,
        [],
        undefined,
        slideCount,
        sourceText,
        preset,
        activeProfile.branding
      );
      // Synchroniser avec les paramètres du profil actif et définir le mode Soft UI Clair par défaut
      config.accentColor = activeProfile.accentColor || '#1d4ed8';
      config.fontFamily = activeProfile.fontFamily || 'Plus Jakarta Sans';
      config.branding = activeProfile.branding;
      config.theme = 'light';

      saveProject(config, [{ role: 'user', text: topic }]);
    } catch (e: any) {
      alert(`Erreur de génération : ${e?.message || e}`);
    } finally {
      setGenState(p => ({ ...p, isGeneratingContent: false }));
    }
  };

  // Instantiate from prebuilt template
  const handleSelectTemplate = (template: PrebuiltTemplate) => {
    const newConfig: CarouselConfig = {
      id: `project-${Date.now()}`,
      title: template.title,
      accentColor: template.config.accentColor || activeProfile.accentColor || '#1d4ed8',
      fontFamily: template.config.fontFamily || activeProfile.fontFamily || 'Plus Jakarta Sans',
      aspectRatio: template.config.aspectRatio || '4:5',
      theme: template.config.theme || 'light',
      branding: activeProfile.branding,
      slides: (template.config.slides || []).map((s, idx) => ({
        ...s,
        id: `slide-${idx}-${Date.now()}`
      }))
    };

    saveProject(newConfig, []);
  };

  const handleCreateNew = (type: 'flash' | 'architect') => {
    setChatHistory([]);
    setCustomSpec(undefined);
    setArchitectImages([]);
    setIsArchitectFlow(type === 'architect');
    setIsAgentOpen(true);
  };

  const handleExport = async () => {
    if (!currentProject) return;
    setIsExporting(true);
    await new Promise(r => setTimeout(r, 450));
    try {
      const zip = new JSZip();
      const folder = zip.folder(currentProject.name.replace(/\s+/g, '_'));

      for (let i = 0; i < currentProject.config.slides.length; i++) {
        const el = exportRefs.current[i];
        if (el) {
          const dataUrl: string = await htmlToImage.toPng(el, {
            quality: 1,
            pixelRatio: 1,
            width: 1080,
            height: currentProject.config.aspectRatio === '4:5' ? 1350 : 
                    currentProject.config.aspectRatio === '3:4' ? 1440 :
                    currentProject.config.aspectRatio === '9:16' ? 1920 : 1080,
          });
          folder?.file(`slide-${i + 1}.png`, dataUrl.split(',')[1], { base64: true });
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentProject.name}_carousel_1080p.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error("Export failed:", e);
      alert(`Erreur d'export : ${e?.message || e}`);
    } finally {
      setIsExporting(false);
      exportRefs.current = [];
    }
  };

  const [applyAll, setApplyAll] = useState(false);

  const DESIGN_KEYS = ['headlineSize', 'bodySize', 'contentPadding', 'layout', 'visualPrompt', 'overlayOpacity', 'textAlign'];

  const getSlideDesign = (slide: Slide): Partial<Slide> => ({
    headlineSize: slide.headlineSize,
    bodySize: slide.bodySize,
    contentPadding: slide.contentPadding,
    layout: slide.layout,
    visualPrompt: slide.visualPrompt,
    overlayOpacity: slide.overlayOpacity,
    textAlign: slide.textAlign,
  });

  const toggleApplyAll = () => {
    if (!currentProject) return;
    setApplyAll(previous => {
      const next = !previous;
      if (next) {
        const sourceStyle = getSlideDesign(currentProject.config.slides[currentIdx]);
        const slides = currentProject.config.slides.map((slide, index) => (
          index === currentIdx ? slide : { ...slide, ...sourceStyle }
        ));
        setCurrentProject({ ...currentProject, config: { ...currentProject.config, slides } });
      }
      return next;
    });
  };

  const updateSlide = (updates: Partial<Slide>) => {
    if (!currentProject) return;
    const slides = [...currentProject.config.slides].map((s, i) => {
      if (i === currentIdx) return { ...s, ...updates };
      if (applyAll) {
        const scoped: Partial<Slide> = {};
        Object.keys(updates).forEach(k => {
          if (DESIGN_KEYS.includes(k)) (scoped as any)[k] = (updates as any)[k];
        });
        return { ...s, ...scoped };
      }
      return s;
    });
    setCurrentProject({ ...currentProject, config: { ...currentProject.config, slides } });
  };

  const handleCopyStyle = () => {
    if (!currentProject) return;
    setCopiedSlideStyle(getSlideDesign(currentProject.config.slides[currentIdx]));
  };

  const handlePasteStyle = () => {
    if (!copiedSlideStyle) return;
    updateSlide(copiedSlideStyle);
  };

  const handleAddSlide = () => {
    if (!currentProject) return;
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      headline: 'Nouvelle idée {clé}',
      body: 'Détaillez ici votre point d\'argumentation pour vos lecteurs.',
      visualPrompt: 'minimal modern graphic',
      layout: 'soft-ui-card',
      overlayOpacity: 0.85,
      headlineSize: 56,
      bodySize: 20,
      textAlign: 'left',
      contentPadding: 48,
      badgeText: `0${currentProject.config.slides.length + 1}`
    };
    setCurrentProject({
      ...currentProject,
      config: {
        ...currentProject.config,
        slides: [...currentProject.config.slides, newSlide]
      }
    });
    setCurrentIdx(currentProject.config.slides.length);
  };

  const handleDeleteSlide = (idx: number) => {
    if (!currentProject || currentProject.config.slides.length <= 1) return;
    const filtered = currentProject.config.slides.filter((_, i) => i !== idx);
    setCurrentProject({
      ...currentProject,
      config: { ...currentProject.config, slides: filtered }
    });
    setCurrentIdx(Math.max(0, idx - 1));
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

  const handleSelectProfile = (profile: BrandProfile) => {
    setActiveProfileId(profile.id);
    if (currentProject) {
      setCurrentProject({
        ...currentProject,
        config: {
          ...currentProject.config,
          accentColor: profile.accentColor,
          fontFamily: profile.fontFamily,
          branding: profile.branding
        }
      });
    }
  };

  const handleSaveProfiles = (updatedProfiles: BrandProfile[]) => {
    setProfiles(updatedProfiles);
    const updatedActive = updatedProfiles.find(p => p.id === activeProfileId) || updatedProfiles[0];
    if (currentProject) {
      setCurrentProject({
        ...currentProject,
        config: {
          ...currentProject.config,
          accentColor: updatedActive.accentColor,
          fontFamily: updatedActive.fontFamily,
          branding: updatedActive.branding
        }
      });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f4f6f9] text-slate-900 transition-all font-sans overflow-hidden select-none">
      
      {/* 1. PROJECT EXPLORER & AI HOME (Style Iconly Soft UI Blanc) */}
      {!currentProject ? (
        <ProjectExplorer 
          projects={projects} 
          onSelect={p => { setCurrentProject(p); setChatHistory(p.chatHistory || []); }}
          onDelete={id => setProjects(prev => prev.filter(p => p.id !== id))}
          onCreateNew={handleCreateNew}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onGenerateQuick={handleGenerateQuick}
          onSelectTemplate={handleSelectTemplate}
          isGenerating={genState.isGeneratingContent}
          profiles={profiles}
          activeProfile={activeProfile}
          onSelectProfile={handleSelectProfile}
          onOpenBrandManager={() => setIsBrandManagerOpen(true)}
        />
      ) : (
        /* 2. STUDIO D'ÉDITION AVANCÉ (100% SOFT UI CLAIR & BLANC) */
        <div className="flex flex-col lg:flex-row h-screen w-full relative bg-[#f4f6f9]">
          
          {/* Mobile top overlay backdrop when sidebar is open */}
          {isMobileSidebarOpen && (
            <div 
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          )}

          {/* ASIDE GAUCHE: SLIDES LIST & BRAND QUICK VIEW (Carte Blanche Pure) */}
          <aside className={`fixed inset-y-0 left-0 z-50 w-72 md:w-80 border-r border-slate-200/80 flex flex-col p-5 md:p-6 bg-white/95 backdrop-blur-xl overflow-y-auto transition-transform duration-300 lg:static lg:translate-x-0 shadow-sm ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <header className="flex items-center justify-between mb-7">
              <div className="flex items-center gap-3">
                 <div 
                   className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md border-2 border-white"
                   style={{ backgroundColor: currentProject.config.accentColor || '#1d4ed8' }}
                 >
                    <Sparkles size={18} className="text-white" />
                 </div>
                 <div>
                   <h1 className="text-sm font-extrabold tracking-tight text-slate-900 truncate max-w-[130px]">
                     {currentProject.name}
                   </h1>
                   <p className="text-[10px] text-slate-400 font-mono">
                     {currentProject.config.slides.length} slides • {currentProject.config.aspectRatio}
                   </p>
                 </div>
              </div>
              <div className="flex items-center gap-1">
                 <button 
                   onClick={() => setCurrentProject(null)} 
                   className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/70 rounded-xl text-slate-600 hover:text-slate-900 transition-colors" 
                   title="Retour à l'accueil"
                 >
                   <History size={16} />
                 </button>
                 <button 
                   onClick={() => setIsMobileSidebarOpen(false)} 
                   className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-900 lg:hidden"
                 >
                   <X size={16} />
                 </button>
              </div>
            </header>

            <nav className="flex-1 space-y-4">
               <div className="flex items-center justify-between">
                  <h2 className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Séquence Slides</h2>
                  <button
                    onClick={handleAddSlide}
                    className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-full"
                  >
                    <Plus size={13} /> Slide
                  </button>
               </div>

               <div className="space-y-2">
                  {currentProject.config.slides.map((s, idx) => (
                    <div 
                      key={s.id} 
                      onClick={() => setCurrentIdx(idx)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between group ${
                        currentIdx === idx 
                          ? 'border-blue-500/50 bg-blue-50/70 text-slate-900 shadow-sm' 
                          : 'border-slate-200/60 bg-slate-50/60 hover:bg-slate-100/80 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className={`w-6 h-6 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center shrink-0 ${
                          currentIdx === idx ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-500'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold truncate">
                          {s.headline.replace(/[{}]/g, '') || `Slide ${idx+1}`}
                        </span>
                      </div>
                      
                      {currentProject.config.slides.length > 1 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteSlide(idx); }}
                          className="opacity-0 group-hover:opacity-100 hover:text-red-500 p-1 text-slate-400"
                          title="Supprimer cette slide"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
               </div>
            </nav>

            {/* BRAND KIT QUICK SWITCH IN STUDIO */}
            <div className="pt-5 border-t border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Kit de Marque</span>
                <button
                  onClick={() => setIsBrandManagerOpen(true)}
                  className="text-[11px] text-blue-600 font-bold hover:underline"
                >
                  Modifier
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div className="flex items-center gap-2.5 truncate">
                  {currentProject.config.branding?.iconUri && (
                    <img 
                      src={currentProject.config.branding.iconUri} 
                      className="w-8 h-8 rounded-lg object-contain bg-white border border-slate-200 p-0.5 shrink-0" 
                      alt="" 
                      crossOrigin="anonymous"
                    />
                  )}
                  <div className="truncate">
                    <div className="text-xs font-extrabold text-slate-900 truncate">{currentProject.config.branding?.companyName}</div>
                    <div className="text-[10px] text-slate-500 font-mono truncate">{currentProject.config.branding?.handle || currentProject.config.branding?.companyWebsite}</div>
                  </div>
                </div>
                <div 
                  className="w-4 h-4 rounded-full border border-white shadow-sm shrink-0" 
                  style={{ backgroundColor: currentProject.config.accentColor }} 
                />
              </div>

              <Button 
                variant="secondary" 
                size="sm" 
                className="w-full text-xs font-bold"
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings size={14} /> Clé API & Moteur
              </Button>
            </div>
          </aside>

          {/* MAIN CANVAS VIEW */}
          <main className="flex-1 flex flex-col bg-[#f4f6f9] overflow-hidden">
            {/* Responsive Top Bar */}
            <header className="min-h-16 py-3 px-4 md:px-8 flex flex-wrap items-center justify-between border-b border-slate-200/80 bg-white/90 backdrop-blur-xl z-30 gap-3 shadow-sm">
              <div className="flex items-center gap-2 md:gap-3">
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-700 lg:hidden"
                  title="Menu des slides"
                >
                  <Layers size={18} />
                </button>

                <button
                  onClick={() => setCurrentProject(null)}
                  className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  ← Accueil
                </button>

                <span className="px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] font-mono font-semibold text-slate-600">
                  {currentProject.config.aspectRatio === '4:5' ? '4:5 Portrait' : 
                   currentProject.config.aspectRatio === '3:4' ? '3:4 Haut IG' :
                   currentProject.config.aspectRatio === '9:16' ? '9:16 TikTok' : '1:1 Carré'}
                </span>
              </div>

              {/* Mobile Tab Toggle: Aperçu vs Édition */}
              <div className="flex lg:hidden bg-slate-100 p-1 rounded-full border border-slate-200">
                <button
                  onClick={() => setMobileTab('preview')}
                  className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all ${mobileTab === 'preview' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600'}`}
                >
                  Aperçu
                </button>
                <button
                  onClick={() => setMobileTab('edit')}
                  className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all ${mobileTab === 'edit' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600'}`}
                >
                  Éditeur
                </button>
              </div>

              <div className="flex items-center gap-2">
                 <Button variant="secondary" size="sm" onClick={handleBuildArt} disabled={genState.isGeneratingImages} className="hidden sm:flex">
                    {genState.isGeneratingImages ? (
                      <span className="flex items-center gap-1.5 text-blue-600 text-xs">
                        <Loader2 className="animate-spin" size={13} /> {genState.progress}%
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs">
                        <ImageIcon size={14} /> Générer Fond IA
                      </span>
                    )}
                 </Button>
                 
                 <Button variant="secondary" size="sm" onClick={() => setIsPresenting(true)} className="hidden sm:flex" title="Plein écran">
                    <Maximize2 size={14} />
                 </Button>

                 <Button 
                   variant="primary" 
                   size="sm" 
                   onClick={handleExport} 
                   disabled={isExporting}
                   className="font-bold flex items-center gap-1.5 text-xs"
                 >
                    {isExporting ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />} 
                    <span>Télécharger ZIP</span>
                 </Button>
              </div>
            </header>

            {/* ART GENERATION PROGRESS BAR */}
            {genState.isGeneratingImages && (
              <div className="w-full h-1 bg-slate-200 overflow-hidden relative">
                <div 
                  className="h-full bg-blue-600 transition-all duration-500 ease-out" 
                  style={{ width: `${genState.progress}%` }} 
                />
              </div>
            )}

            {/* WORKSPACE CENTER + RIGHT INSPECTOR (Responsive switch) */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
               
               {/* Center Slide View (Soft Alabaster Canvas) */}
               <div className={`flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden bg-gradient-to-b from-[#f4f6f9] to-[#e9edf4] ${
                 mobileTab === 'preview' ? 'flex' : 'hidden lg:flex'
               }`}>
                  
                  {/* Floating slide stepper (White Tactile Pill) */}
                  <div className="absolute top-4 md:top-6 flex items-center gap-2 md:gap-3 bg-white/95 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white shadow-[0_10px_25px_-5px_rgba(15,23,42,0.1)] z-40">
                    <button 
                      onClick={() => setCurrentIdx(p => Math.max(0, p - 1))} 
                      disabled={currentIdx === 0}
                      className="p-1 hover:bg-slate-100 disabled:opacity-30 rounded-full transition-colors text-slate-700"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    
                    <span className="text-[11px] md:text-xs font-mono font-extrabold tracking-widest uppercase text-slate-800">
                      {currentIdx + 1} / {currentProject.config.slides.length}
                    </span>
                    
                    <button 
                      onClick={() => setCurrentIdx(p => Math.min(currentProject.config.slides.length - 1, p + 1))} 
                      disabled={currentIdx === currentProject.config.slides.length - 1}
                      className="p-1 hover:bg-slate-100 disabled:opacity-30 rounded-full transition-colors text-slate-700"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* The Live Slide Preview */}
                  <div key={currentIdx} className="slide-enter transition-transform duration-300 w-full flex items-center justify-center pt-8 pb-4">
                    <SlidePreview 
                      slide={currentProject.config.slides[currentIdx]} 
                      config={currentProject.config} 
                    />
                  </div>
               </div>

               {/* Right Inspector: Pure White Soft UI Panel */}
               <div className={`w-full lg:w-[430px] border-t lg:border-t-0 lg:border-l border-slate-200/80 bg-white p-5 md:p-6 overflow-y-auto space-y-6 shadow-sm ${
                 mobileTab === 'edit' ? 'block flex-1' : 'hidden lg:block'
               }`}>
                  
                  {/* SLIDE CONTENT EDITING */}
                  <section className="space-y-4">
                     <div className="flex items-center justify-between">
                       <h3 className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-blue-600">
                          Contenu & Texte
                       </h3>
                       <span className="text-[10px] text-slate-400 font-medium">Astuce : {"{mot}"} pour colorer</span>
                     </div>

                     {/* Badge / Tag field */}
                     <div>
                       <label className="text-[11px] font-bold text-slate-700 block mb-1">
                         Badge supérieur (ex: FLASH ACTU, 01/05, ASTUCE)
                       </label>
                       <input
                         type="text"
                         value={currentProject.config.slides[currentIdx].badgeText || ''}
                         onChange={e => updateSlide({ badgeText: e.target.value })}
                         placeholder="Ex: 🔴 FLASH ACTU"
                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                       />
                     </div>

                     {/* Headline */}
                     <div>
                       <label className="text-[11px] font-bold text-slate-700 block mb-1">Titre Principal</label>
                       <textarea 
                         className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 focus:border-blue-500 outline-none" 
                         rows={2} 
                         value={currentProject.config.slides[currentIdx].headline} 
                         onChange={e => updateSlide({ headline: e.target.value })}
                         placeholder="Titre percutant avec {mot clé}"
                       />
                     </div>

                     {/* Body */}
                     <div>
                       <label className="text-[11px] font-bold text-slate-700 block mb-1">Texte d'explication</label>
                       <textarea 
                         className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium leading-relaxed text-slate-700 focus:border-blue-500 outline-none" 
                         rows={4} 
                         value={currentProject.config.slides[currentIdx].body} 
                         onChange={e => updateSlide({ body: e.target.value })}
                         placeholder="Corps de texte..."
                       />
                     </div>

                     {/* Layout Comparison options if applicable */}
                     {currentProject.config.slides[currentIdx].layout === 'comparison' && (
                       <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                         <span className="text-[11px] font-extrabold uppercase text-blue-600 block tracking-wider">
                           Contenu & Couleurs Comparatif
                         </span>
                         
                         {/* BLOC DON'T */}
                         <div className="space-y-1.5">
                           <div className="flex items-center justify-between">
                             <label className="text-[11px] font-bold text-red-600">Bloc « À Éviter »</label>
                             <div className="flex items-center gap-1.5">
                               <span className="text-[10px] text-slate-500">Couleur :</span>
                               <input
                                 type="color"
                                 value={currentProject.config.slides[currentIdx].comparisonDontColor || '#ef4444'}
                                 onChange={e => updateSlide({ comparisonDontColor: e.target.value })}
                                 className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                               />
                             </div>
                           </div>
                           <textarea
                             value={currentProject.config.slides[currentIdx].comparisonDont || ''}
                             onChange={e => updateSlide({ comparisonDont: e.target.value })}
                             rows={2}
                             placeholder="Ex: Bloquer 3 000 € et 3 mois..."
                             className="w-full bg-white border border-red-200 rounded-xl p-2.5 text-xs font-medium text-slate-900"
                           />
                         </div>

                         {/* BLOC DO */}
                         <div className="space-y-1.5">
                           <div className="flex items-center justify-between">
                             <label className="text-[11px] font-bold" style={{ color: currentProject.config.slides[currentIdx].comparisonDoColor || currentProject.config.accentColor || '#10b981' }}>
                               Bloc « À Faire »
                             </label>
                             <div className="flex items-center gap-1.5">
                               <span className="text-[10px] text-slate-500">Couleur :</span>
                               <input
                                 type="color"
                                 value={currentProject.config.slides[currentIdx].comparisonDoColor || currentProject.config.accentColor || '#10b981'}
                                 onChange={e => updateSlide({ comparisonDoColor: e.target.value })}
                                 className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                               />
                             </div>
                           </div>
                           <textarea
                             value={currentProject.config.slides[currentIdx].comparisonDo || ''}
                             onChange={e => updateSlide({ comparisonDo: e.target.value })}
                             rows={2}
                             placeholder="Ex: Créer une micro-vitrine en 10 min..."
                             className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-900"
                           />
                         </div>

                         {/* COULEUR DU TEXTE INTÉRIEUR */}
                         <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between">
                           <div>
                             <label className="text-[11px] font-bold text-slate-700 block">Couleur du Texte Intérieur</label>
                             <span className="text-[10px] text-slate-400">Choisissez noir ou blanc selon votre fond</span>
                           </div>
                           <div className="flex items-center gap-1.5">
                             <input
                               type="color"
                               value={currentProject.config.slides[currentIdx].comparisonTextColor || (currentProject.config.theme === 'midnight-glass' ? '#ffffff' : '#0f172a')}
                               onChange={e => updateSlide({ comparisonTextColor: e.target.value })}
                               className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                             />
                             <button
                               type="button"
                               onClick={() => updateSlide({ comparisonTextColor: '#ffffff' })}
                               className="text-[10px] px-2 py-1 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold"
                             >
                               Blanc
                             </button>
                             <button
                               type="button"
                               onClick={() => updateSlide({ comparisonTextColor: '#0f172a' })}
                               className="text-[10px] px-2 py-1 rounded-md bg-slate-900 text-white font-bold"
                             >
                               Noir
                             </button>
                           </div>
                         </div>
                       </div>
                     )}
                  </section>

                  {/* LAYOUT ARCHITECTURE */}
                  <section className="space-y-4 pt-4 border-t border-slate-100">
                     <h3 className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-slate-500 flex items-center gap-2">
                        <LayoutIcon size={14} className="text-blue-600" /> Disposition Visuelle
                     </h3>

                     <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1.5">Modèle de carte du Slide</label>
                        <select 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 cursor-pointer focus:border-blue-500 outline-none" 
                          value={currentProject.config.slides[currentIdx].layout} 
                          onChange={e => updateSlide({ layout: e.target.value as any })}
                        >
                           <option value="soft-ui-card">☁️ Soft UI Clean (Style Iconly / Carte Tactile)</option>
                           <option value="card-glass">💎 Carte Flottante Épurée</option>
                           <option value="comparison">⚖️ Comparatif À faire vs À éviter</option>
                           <option value="gold-top-visual">✨ Visuel Haut + Pillule Titre</option>
                           <option value="tweet-mockup">💬 Post Social / Microblog</option>
                           <option value="bold-title">📰 Grand Titre Éditorial Gauche</option>
                           <option value="center">🎯 Centré Minimaliste</option>
                           <option value="split-vertical">📐 Split Vertical</option>
                        </select>
                     </div>

                     <button
                       onClick={toggleApplyAll}
                       className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                         applyAll ? 'border-blue-500 bg-blue-50/70' : 'border-slate-200 bg-slate-50'
                       }`}
                     >
                        <span className={`text-xs font-bold ${applyAll ? 'text-blue-700' : 'text-slate-700'}`}>
                          Appliquer ce style à tous les slides
                        </span>
                        <span className={`w-9 h-5 rounded-full relative transition-all ${applyAll ? 'bg-blue-600' : 'bg-slate-300'}`}>
                           <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${applyAll ? 'left-4' : 'left-0.5'}`} />
                        </span>
                     </button>
                  </section>

                   {/* TYPOGRAPHY & SIZING */}
                  <section className="space-y-4 pt-4 border-t border-slate-100">
                     <div className="flex items-center justify-between">
                       <h3 className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-blue-600 flex items-center gap-2">
                          <TypeIcon size={14} /> Taille de Police & Marges
                       </h3>
                       <div className="flex items-center gap-1">
                         <button 
                           onClick={handleCopyStyle} 
                           className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600" 
                           title="Copier le style"
                         >
                           {copiedSlideStyle ? <Check size={13} className="text-blue-600" /> : <Copy size={13} />}
                         </button>
                         <button 
                           onClick={handlePasteStyle} 
                           disabled={!copiedSlideStyle} 
                           className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 disabled:opacity-30" 
                           title="Coller le style"
                         >
                           <ArrowRight size={13} />
                         </button>
                       </div>
                     </div>

                     <div className="space-y-3">
                        {/* Headline Size Slider */}
                        <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
                           <div className="flex justify-between items-center text-[11px] font-bold text-slate-700">
                              <span>Taille du Titre</span>
                              <span className="font-mono text-blue-600 font-bold">{currentProject.config.slides[currentIdx].headlineSize ?? 58}px</span>
                           </div>
                           <input 
                             type="range" 
                             min="24" 
                             max="120" 
                             value={currentProject.config.slides[currentIdx].headlineSize ?? 58} 
                             onChange={e => updateSlide({ headlineSize: parseInt(e.target.value) })} 
                             className="w-full accent-blue-600 cursor-pointer" 
                           />
                        </div>

                        {/* Body Size Slider */}
                        <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
                           <div className="flex justify-between items-center text-[11px] font-bold text-slate-700">
                              <span>Taille du Texte / Corps</span>
                              <span className="font-mono text-blue-600 font-bold">{currentProject.config.slides[currentIdx].bodySize ?? 20}px</span>
                           </div>
                           <input 
                             type="range" 
                             min="12" 
                             max="40" 
                             value={currentProject.config.slides[currentIdx].bodySize ?? 20} 
                             onChange={e => updateSlide({ bodySize: parseInt(e.target.value) })} 
                             className="w-full accent-blue-600 cursor-pointer" 
                           />
                        </div>

                        {/* Padding / Marges Slider */}
                        <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
                           <div className="flex justify-between items-center text-[11px] font-bold text-slate-700">
                              <span>Marges Intérieures</span>
                              <span className="font-mono text-blue-600 font-bold">{currentProject.config.slides[currentIdx].contentPadding ?? 52}px</span>
                           </div>
                           <input 
                             type="range" 
                             min="24" 
                             max="100" 
                             value={currentProject.config.slides[currentIdx].contentPadding ?? 52} 
                             onChange={e => updateSlide({ contentPadding: parseInt(e.target.value) })} 
                             className="w-full accent-blue-600 cursor-pointer" 
                           />
                        </div>

                        {/* Text Alignment */}
                        <div className="space-y-1.5 pt-1">
                           <label className="text-[11px] font-bold text-slate-700 block">Alignement du texte</label>
                           <div className="grid grid-cols-3 gap-2">
                              {([
                                ['left', AlignLeft, 'Gauche'],
                                ['center', AlignCenter, 'Centre'],
                                ['right', AlignRight, 'Droite'],
                              ] as const).map(([align, Icon, label]) => (
                                <button
                                  key={align}
                                  type="button"
                                  onClick={() => updateSlide({ textAlign: align })}
                                  className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition-all ${
                                    (currentProject.config.slides[currentIdx].textAlign || 'left') === align 
                                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' 
                                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  <Icon size={14} />
                                  <span>{label}</span>
                                </button>
                              ))}
                           </div>
                        </div>
                     </div>
                  </section>

                  {/* DESIGN SPECS & ACCENTS */}
                  <section className="space-y-4 pt-4 border-t border-slate-100">
                     <div className="flex items-center justify-between">
                       <h3 className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-slate-500 flex items-center gap-2">
                          <Palette size={14} className="text-blue-600" /> Couleurs & Police
                       </h3>

                       {/* Switch Thème Slide : Clair Soft UI vs Sombre Midnight */}
                       <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200">
                         <button
                           type="button"
                           onClick={() => setCurrentProject({ ...currentProject, config: { ...currentProject.config, theme: 'light' } })}
                           className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all ${
                             currentProject.config.theme !== 'midnight-glass' 
                               ? 'bg-white text-slate-900 shadow-sm' 
                               : 'text-slate-500 hover:text-slate-900'
                           }`}
                         >
                           <Sun size={12} className="text-amber-500" /> Blanc Soft
                         </button>
                         <button
                           type="button"
                           onClick={() => setCurrentProject({ ...currentProject, config: { ...currentProject.config, theme: 'midnight-glass' } })}
                           className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all ${
                             currentProject.config.theme === 'midnight-glass' 
                               ? 'bg-slate-900 text-white shadow-sm' 
                               : 'text-slate-500 hover:text-slate-900'
                           }`}
                         >
                           <Moon size={12} /> Sombre
                         </button>
                       </div>
                     </div>
                     
                     <div className="grid grid-cols-1 gap-3">
                        <div>
                           <label className="text-[11px] font-bold text-slate-700 block mb-1">Couleur d'Accentuation</label>
                           <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
                             <input 
                               type="color" 
                               className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0" 
                               value={currentProject.config.accentColor} 
                               onChange={e => setCurrentProject({ ...currentProject, config: { ...currentProject.config, accentColor: e.target.value } })} 
                             />
                             <span className="font-mono text-xs font-bold text-slate-700">{currentProject.config.accentColor}</span>
                             <div className="ml-auto flex items-center gap-1.5">
                               {['#1d4ed8', '#0ea5e9', '#10b981', '#f59e0b', '#e11d48', '#7c3aed'].map(c => (
                                 <button
                                   key={c}
                                   type="button"
                                   onClick={() => setCurrentProject({ ...currentProject, config: { ...currentProject.config, accentColor: c } })}
                                   className="w-5 h-5 rounded-full border border-white shadow-sm"
                                   style={{ backgroundColor: c }}
                                 />
                               ))}
                             </div>
                           </div>
                        </div>

                        <div>
                           <label className="text-[11px] font-bold text-slate-700 block mb-1">Police d'Écriture</label>
                           <select 
                             className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 mb-2 focus:border-blue-500 outline-none" 
                             value={currentProject.config.fontFamily} 
                             onChange={e => setCurrentProject({ ...currentProject, config: { ...currentProject.config, fontFamily: e.target.value } })}
                           >
                              {['Plus Jakarta Sans', 'Outfit', 'Space Grotesk', 'Inter', 'Bebas Neue'].map(f => (
                                <option key={f} value={f}>{f}</option>
                              ))}
                           </select>

                           {/* Lien Google Fonts Externe ou Sélecteur Rapide */}
                           <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
                             <div className="flex items-center justify-between">
                               <label className="text-[10px] text-blue-600 font-bold block">
                                 Polices Google Fonts en 1 clic :
                               </label>
                             </div>

                             {/* Puces de polices stars prêtes à l'emploi */}
                             <div className="flex flex-wrap gap-1.5">
                               {[
                                 { name: 'Playfair Display', url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&display=swap' },
                                 { name: 'Syne', url: 'https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap' },
                                 { name: 'Cinzel', url: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&display=swap' },
                                 { name: 'Montserrat', url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@800;900&display=swap' },
                                 { name: 'Cormorant', url: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,700;1,500&display=swap' }
                               ].map(presetFont => (
                                 <button
                                   key={presetFont.name}
                                   type="button"
                                   onClick={() => {
                                     setCurrentProject({
                                       ...currentProject,
                                       config: {
                                         ...currentProject.config,
                                         customGoogleFontUrl: presetFont.url,
                                         fontFamily: presetFont.name
                                       }
                                     });
                                   }}
                                   className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                                     currentProject.config.fontFamily === presetFont.name
                                       ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-sm'
                                       : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                                   }`}
                                 >
                                   {presetFont.name}
                                 </button>
                               ))}
                             </div>

                             <input
                               type="text"
                               value={currentProject.config.customGoogleFontUrl || ''}
                               onChange={e => {
                                 const url = e.target.value;
                                 let extractedFamily = currentProject.config.fontFamily;
                                 const match = url.match(/family=([^&:]+)/);
                                 if (match && match[1]) {
                                   extractedFamily = decodeURIComponent(match[1].replace(/\+/g, ' '));
                                 }
                                 setCurrentProject({
                                   ...currentProject,
                                   config: {
                                     ...currentProject.config,
                                     customGoogleFontUrl: url,
                                     fontFamily: extractedFamily
                                   }
                                 });
                               }}
                               placeholder="Ou collez un lien Google Fonts : https://fonts.googleapis.com/css2?family=..."
                               className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-[10px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono"
                             />
                           </div>
                        </div>
                     </div>

                     {/* Ratio & Plateformes */}
                     <div className="space-y-2 pt-2">
                       <div className="flex items-center justify-between">
                         <label className="text-[11px] font-bold text-slate-700">Format & Ratio Réseau</label>
                         
                         {/* Toggle Safe Zones */}
                         <button
                           type="button"
                           onClick={() => setCurrentProject({
                             ...currentProject,
                             config: {
                               ...currentProject.config,
                               showSafeZones: !currentProject.config.showSafeZones
                             }
                           })}
                           className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                             currentProject.config.showSafeZones 
                               ? 'bg-red-50 border-red-300 text-red-600' 
                               : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                           }`}
                         >
                           {currentProject.config.showSafeZones ? 'Zones sécurité ON' : 'Zones sécurité OFF'}
                         </button>
                       </div>

                       <div className="grid grid-cols-2 gap-2">
                         {[
                           { r: '4:5' as const, label: 'Portrait 4:5', desc: 'LinkedIn & IG' },
                           { r: '1:1' as const, label: 'Carré 1:1', desc: 'LinkedIn & X' },
                           { r: '3:4' as const, label: 'Haut 3:4', desc: 'Nouvel Instagram' },
                           { r: '9:16' as const, label: 'Vertical 9:16', desc: 'TikTok & Stories' },
                         ].map(opt => (
                           <button
                             key={opt.r}
                             type="button"
                             onClick={() => setCurrentProject({ ...currentProject, config: { ...currentProject.config, aspectRatio: opt.r } })}
                             className={`p-2.5 rounded-xl border text-left transition-all ${
                               (currentProject.config.aspectRatio || '4:5') === opt.r
                                 ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-sm'
                                 : 'bg-slate-50 border-slate-200/70 text-slate-600 hover:bg-slate-100'
                             }`}
                           >
                             <div className="text-xs font-extrabold leading-tight">{opt.label}</div>
                             <div className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</div>
                           </button>
                         ))}
                       </div>
                     </div>
                  </section>
               </div>
            </div>
          </main>
        </div>
      )}

      {/* Hidden 1080px export previews */}
      {isExporting && currentProject && (
        <div className="fixed top-0" style={{ left: -99999 }} aria-hidden="true">
          {currentProject.config.slides.map((s, i) => (
            <div key={s.id} ref={el => { exportRefs.current[i] = el; }}>
              <SlidePreview slide={s} config={currentProject.config} exportMode />
            </div>
          ))}
        </div>
      )}

      {/* Presentation Fullscreen Mode */}
      {isPresenting && currentProject && (
        <div
          className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-2xl flex flex-col items-center justify-center"
          onKeyDown={e => {
            if (e.key === 'ArrowRight') setCurrentIdx(p => Math.min(currentProject.config.slides.length - 1, p + 1));
            else if (e.key === 'ArrowLeft') setCurrentIdx(p => Math.max(0, p - 1));
            else if (e.key === 'Escape') setIsPresenting(false);
          }}
          tabIndex={-1}
          ref={el => el?.focus()}
        >
          <div key={currentIdx} className="slide-enter h-[85vh] aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl">
            <SlidePreview slide={currentProject.config.slides[currentIdx]} config={currentProject.config} />
          </div>
          <div className="flex items-center gap-6 mt-6 text-white">
            <button onClick={() => setCurrentIdx(p => Math.max(0, p - 1))} className="p-3 bg-white/20 rounded-full hover:bg-white/30 text-white"><ChevronLeft /></button>
            <span className="text-xs font-mono font-bold">{currentIdx + 1} / {currentProject.config.slides.length}</span>
            <button onClick={() => setCurrentIdx(p => Math.min(currentProject.config.slides.length - 1, p + 1))} className="p-3 bg-white/20 rounded-full hover:bg-white/30 text-white"><ChevronRight /></button>
            <button onClick={() => setIsPresenting(false)} className="p-3 bg-white/20 rounded-full hover:bg-red-500 text-white"><X /></button>
          </div>
        </div>
      )}

      {/* Modales */}
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
      
      <BrandManagerModal
        isOpen={isBrandManagerOpen}
        onClose={() => setIsBrandManagerOpen(false)}
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSelectProfile={id => {
          setActiveProfileId(id);
          const p = profiles.find(x => x.id === id);
          if (p && currentProject) {
            setCurrentProject({
              ...currentProject,
              config: {
                ...currentProject.config,
                accentColor: p.accentColor,
                fontFamily: p.fontFamily,
                branding: p.branding
              }
            });
          }
        }}
        onSaveProfiles={handleSaveProfiles}
      />
    </div>
  );
}
