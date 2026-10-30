import React from 'react';
import { Project, BrandProfile, FormatPreset } from '../../types';
import { Button } from './CoreButton';
import { 
  Sparkles, Layers, History, Trash2, ArrowRight, Settings, Compass 
} from 'lucide-react';
import { AiCreationHero } from './AiCreationHero';
import { TemplateGallery } from './TemplateGallery';
import { PrebuiltTemplate } from '../data/templates';
import { BrandProfileSelector } from './BrandProfileSelector';

interface ProjectExplorerProps {
  projects: Project[];
  onSelect: (p: Project) => void;
  onDelete: (id: string) => void;
  onCreateNew: (type: 'flash' | 'architect') => void;
  onOpenSettings?: () => void;
  onGenerateQuick: (topic: string, sourceText: string, preset: FormatPreset, slideCount: number) => void;
  onSelectTemplate: (template: PrebuiltTemplate) => void;
  isGenerating: boolean;
  profiles: BrandProfile[];
  activeProfile: BrandProfile;
  onSelectProfile: (profile: BrandProfile) => void;
  onOpenBrandManager: () => void;
}

export const ProjectExplorer: React.FC<ProjectExplorerProps> = ({ 
  projects, 
  onSelect, 
  onDelete, 
  onCreateNew, 
  onOpenSettings,
  onGenerateQuick,
  onSelectTemplate,
  isGenerating,
  profiles,
  activeProfile,
  onSelectProfile,
  onOpenBrandManager
}) => {
  return (
    <div className="flex-1 min-h-screen p-5 md:p-10 lg:p-14 flex flex-col overflow-y-auto bg-[#f4f6f9] text-slate-900 relative selection:bg-blue-500/20">
      {/* Subtle Pastel Ambient Glows (Iconly Light Style) */}
      <div 
        className="orb w-[500px] h-[500px] -top-40 -left-40 opacity-15 pointer-events-none" 
        style={{ backgroundColor: activeProfile.accentColor }} 
      />
      <div className="orb w-[400px] h-[400px] bg-blue-400/15 top-1/3 right-0 opacity-20 pointer-events-none" style={{ animationDelay: "-7s" }} />

      {/* TOP NAVBAR (Iconly Soft UI Clean) */}
      <header className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between mb-10 pb-6 border-b border-slate-200/80 gap-5 z-20">
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-[0_12px_24px_-6px_rgba(29,78,216,0.3)] border-2 border-white"
            style={{ backgroundColor: activeProfile.accentColor || '#1d4ed8' }}
          >
            <Sparkles size={22} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Carousel<span style={{ color: activeProfile.accentColor || '#1d4ed8' }}>Fuzz</span>
              </h1>
              <span className="text-[10px] font-bold uppercase bg-white text-blue-600 px-2.5 py-0.5 rounded-full border border-slate-200/80 shadow-sm">
                SOFT UI STUDIO
              </span>
            </div>
            <p className="text-slate-500 font-medium text-xs mt-0.5">
              Créateur de carrousels LinkedIn & Instagram haut de gamme
            </p>
          </div>
        </div>

        {/* Right Action Cluster */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* Workspace / Brand Profile Selector */}
          <BrandProfileSelector
            profiles={profiles}
            activeProfile={activeProfile}
            onSelectProfile={onSelectProfile}
            onOpenBrandManager={onOpenBrandManager}
          />

          <button 
            onClick={onOpenSettings} 
            className="p-2.5 bg-white hover:bg-slate-50 rounded-full border border-slate-200/80 text-slate-600 hover:text-slate-900 transition-all shadow-sm" 
            title="Clé API & Paramètres IA"
          >
            <Settings size={18} />
          </button>

          <Button variant="glass" size="md" onClick={() => onCreateNew('architect')}>
            <Layers size={15} /> Cloner un style (ADN)
          </Button>
        </div>
      </header>

      <main className="flex-1 space-y-14 z-10 max-w-7xl mx-auto w-full">
        
        {/* 1. HERO HUB DE GÉNÉRATION D'ACTUS & CARROUSELS (Iconly Card) */}
        <section>
          <AiCreationHero
            onGenerate={onGenerateQuick}
            isGenerating={isGenerating}
            activeProfile={activeProfile}
          />
        </section>

        {/* 2. BIBLIOTHÈQUE DE MODÈLES SIGNATURE */}
        <section>
          <TemplateGallery onSelectTemplate={onSelectTemplate} />
        </section>

        {/* 3. PROJETS & CARROUSELS RÉCENTS */}
        <section className="space-y-5 pb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 shadow-sm">
                <History size={16} />
              </div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Vos Carrousels Récents
              </h2>
              <span className="text-xs bg-white text-slate-500 px-2.5 py-0.5 rounded-full border border-slate-200/80 font-mono shadow-sm">
                {projects.length}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {projects.map(p => (
              <div 
                key={p.id} 
                onClick={() => onSelect(p)}
                className="group relative bg-white border-2 border-white rounded-[2rem] p-6 cursor-pointer hover:border-blue-500/40 shadow-[0_18px_38px_-12px_rgba(15,23,42,0.06)] hover:shadow-[0_24px_48px_-12px_rgba(29,78,216,0.14)] transition-all duration-300 overflow-hidden flex flex-col justify-between h-56"
              >
                <div className="flex justify-between items-start">
                  <div 
                    className="w-11 h-11 rounded-2xl flex items-center justify-center border border-slate-100 font-bold text-xs shadow-sm"
                    style={{ backgroundColor: `${p.config.accentColor || '#1d4ed8'}15`, color: p.config.accentColor || '#1d4ed8' }}
                  >
                    <Layers size={18} />
                  </div>
                  <button 
                    onClick={e => { 
                      e.stopPropagation(); 
                      onDelete(p.id);
                    }} 
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-full text-red-500 transition-all"
                    title="Supprimer ce carrousel"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                
                <div>
                  <h3 className="text-base font-extrabold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 text-[11px] font-mono text-slate-400">
                    <span>{p.config?.slides?.length || 0} SLIDES</span>
                    <span>•</span>
                    <span>{new Date(p.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 group-hover:text-blue-600 transition-colors">
                    Ouvrir dans le studio
                  </span>
                  <ArrowRight size={16} className="text-blue-600 transform -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                </div>
              </div>
            ))}
            
            {projects.length === 0 && (
              <div className="col-span-full py-14 border-2 border-dashed border-slate-200/90 rounded-[2.2rem] flex flex-col items-center justify-center text-center p-6 bg-white/60">
                <div className="w-14 h-14 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center text-blue-600 mb-3">
                  <Compass size={26} />
                </div>
                <h4 className="text-sm font-extrabold text-slate-800">Aucun carrousel enregistré</h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Entrez un sujet dans la carte blanche ci-dessus ou cliquez sur l'un des modèles signature pour générer votre premier carrousel.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
