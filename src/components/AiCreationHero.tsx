import React, { useState } from 'react';
import { FormatPreset, BrandProfile } from '../types';
import { 
  Sparkles, Plus, HelpCircle, Zap, Flame, CheckSquare, Layers, Newspaper, Upload 
} from 'lucide-react';
import { Button } from './CoreButton';

interface AiCreationHeroProps {
  onGenerate: (topic: string, sourceText: string, preset: FormatPreset, slideCount: number) => void;
  isGenerating: boolean;
  activeProfile: BrandProfile;
}

export const AiCreationHero: React.FC<AiCreationHeroProps> = ({
  onGenerate,
  isGenerating,
  activeProfile
}) => {
  const [topic, setTopic] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [isSourceOpen, setIsSourceOpen] = useState(false);
  const [preset, setPreset] = useState<FormatPreset>('auto');
  const [slideCount, setSlideCount] = useState<number>(6);

  const PRESETS: Array<{ id: FormatPreset; label: string; icon: React.ReactNode; desc: string }> = [
    { id: 'auto', label: 'Ghostwriter Libre', icon: <Sparkles size={14} />, desc: 'L\'IA choisit la meilleure structure' },
    { id: 'news-flash', label: 'Actu Chaude', icon: <Newspaper size={14} />, desc: 'Breaking news & décryptage immédiat' },
    { id: 'do-dont', label: 'À faire / À éviter', icon: <CheckSquare size={14} />, desc: 'Comparatifs avant-après percutants' },
    { id: 'mistakes', label: 'Erreurs de débutant', icon: <HelpCircle size={14} />, desc: 'Pièges fréquents et solutions' },
    { id: 'step-by-step', label: 'Pas à pas', icon: <Layers size={14} />, desc: 'Tutoriel & framework numéroté' },
    { id: 'hot-take', label: 'Avis tranché', icon: <Flame size={14} />, desc: 'Déclaration audacieuse & débat' },
    { id: 'case-study', label: 'Étude de cas', icon: <Zap size={14} />, desc: 'Chiffres, problèmes et résultats' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onGenerate(topic, sourceText, preset, slideCount);
  };

  return (
    <div className="relative overflow-hidden rounded-[2.8rem] border border-white bg-white p-6 md:p-10 shadow-[0_30px_70px_-20px_rgba(15,23,42,0.08),inset_0_2px_6px_rgba(255,255,255,1)]">
      
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Top Dashed Dropzone Container (Exactement comme la carte Iconly !) */}
        <div className="rounded-[2.2rem] border-2 border-dashed border-slate-200 bg-[#f8fafc] p-6 md:p-8 flex flex-col items-center text-center space-y-4">
          
          {/* Tactile Blue Orb Icon */}
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center shadow-[0_18px_35px_-8px_rgba(29,78,216,0.35),inset_0_3px_8px_rgba(255,255,255,0.9)] border border-white transition-transform hover:scale-105"
            style={{ background: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #dbeafe 55%, #bfdbfe 100%)' }}
          >
            <Sparkles size={30} className="text-[#1d4ed8]" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Que voulez-vous publier aujourd'hui ?
            </h2>
            <p className="text-xs md:text-sm text-slate-500 max-w-lg mx-auto">
              Pour un résultat optimal, décrivez votre idée, collez une actu ou choisissez un format viral ci-dessous.
            </p>
          </div>

          {/* Input Box Pure White */}
          <form onSubmit={handleSubmit} className="w-full space-y-4 pt-2">
            <div className="rounded-3xl bg-white border border-slate-200/90 p-3 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.06)] focus-within:border-blue-500 transition-all">
              
              {/* Source toggle row */}
              <div className="flex items-center justify-between px-3 pt-1 pb-2 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSourceOpen(!isSourceOpen)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#1d4ed8] hover:text-blue-800 transition-colors cursor-pointer"
                >
                  <Plus size={15} />
                  <span>{sourceText ? "Source ajoutée (1 article/actu)" : "Ajouter une source ou actu à résumer"}</span>
                </button>

                <span className="text-[11px] font-medium text-slate-400">
                  Marque : <strong className="text-slate-700">{activeProfile.name}</strong>
                </span>
              </div>

              {/* Optional Collapsible Source input */}
              {isSourceOpen && (
                <div className="p-3 bg-slate-50 rounded-2xl mt-2 space-y-2 text-left border border-slate-200/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 font-semibold">Collez le texte d'une actualité ou de vos notes :</span>
                    {sourceText && (
                      <button 
                        type="button" 
                        onClick={() => setSourceText('')}
                        className="text-[11px] text-red-500 font-semibold hover:underline"
                      >
                        Effacer
                      </button>
                    )}
                  </div>
                  <textarea
                    value={sourceText}
                    onChange={e => setSourceText(e.target.value)}
                    placeholder="Collez ici une dépêche, un article ou un post que l'IA doit transformer en carrousel..."
                    rows={3}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              )}

              {/* Main topic input */}
              <div className="p-3">
                <input
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="Ex: 5 erreurs de tarification, ou L'impact des agents IA sur le business..."
                  className="w-full bg-transparent border-0 text-slate-900 placeholder-slate-400 text-base md:text-lg font-bold focus:outline-none text-center"
                />
              </div>
            </div>

            {/* Format Presets Pills */}
            <div className="flex items-center justify-center flex-wrap gap-2 pt-1">
              {PRESETS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPreset(p.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    preset === p.id 
                      ? 'bg-[#1d4ed8] text-white shadow-[0_8px_20px_-4px_rgba(29,78,216,0.4)]' 
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80 shadow-xs'
                  }`}
                  title={p.desc}
                >
                  {p.icon}
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </form>
        </div>

        {/* Bottom Dual Action Row (Style Iconly Cancel / Upload pill buttons) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Slide count selector in a soft pill */}
          <div className="flex items-center justify-between px-6 py-3.5 rounded-full bg-[#f8fafc] border border-slate-200/80 shadow-inner">
            <span className="text-xs font-bold text-slate-500">Nombre de slides :</span>
            <div className="flex items-center gap-1.5">
              {[5, 6, 7, 8].map(count => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setSlideCount(count)}
                  className={`w-8 h-8 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                    slideCount === count 
                      ? 'bg-slate-900 text-white shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-200/70'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Royal Blue Pill Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!topic.trim() || isGenerating}
            className="py-4 px-8 rounded-full bg-[#1d4ed8] hover:bg-[#1e40af] disabled:opacity-40 text-white font-extrabold text-sm md:text-base shadow-[0_14px_30px_-6px_rgba(29,78,216,0.45)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Sparkles size={18} />
            <span>{isGenerating ? "Génération en cours..." : "Générer le Carrousel"}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
