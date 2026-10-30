import React, { useState } from 'react';
import { BrandProfile, BrandingDisplayMode } from '../types';
import { Building2, X, Plus, Trash2 } from 'lucide-react';
import { Button } from './CoreButton';

interface BrandManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: BrandProfile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onSaveProfiles: (profiles: BrandProfile[]) => void;
}

export const BrandManagerModal: React.FC<BrandManagerModalProps> = ({
  isOpen,
  onClose,
  profiles,
  activeProfileId,
  onSelectProfile,
  onSaveProfiles
}) => {
  if (!isOpen) return null;

  const [localProfiles, setLocalProfiles] = useState<BrandProfile[]>(profiles);
  const [selectedId, setSelectedId] = useState<string>(activeProfileId);

  const current = localProfiles.find(p => p.id === selectedId) || localProfiles[0];

  const updateCurrent = (patch: Partial<BrandProfile>) => {
    setLocalProfiles(prev => prev.map(p => p.id === current.id ? { ...p, ...patch } : p));
  };

  const updateBranding = (patch: Partial<BrandProfile['branding']>) => {
    updateCurrent({
      branding: {
        ...current.branding,
        ...patch
      }
    });
  };

  const handleCreateNew = () => {
    const newProfile: BrandProfile = {
      id: `profile-${Date.now()}`,
      name: 'Nouvel Espace',
      accentColor: '#1d4ed8',
      fontFamily: 'Plus Jakarta Sans',
      branding: {
        companyName: 'Mon Entreprise',
        companyWebsite: 'mon-site.com',
        handle: '@compte',
        showBranding: true,
        displayMode: 'all'
      }
    };
    const updated = [...localProfiles, newProfile];
    setLocalProfiles(updated);
    setSelectedId(newProfile.id);
  };

  const handleDelete = (id: string) => {
    if (localProfiles.length <= 1) return;
    const remaining = localProfiles.filter(p => p.id !== id);
    setLocalProfiles(remaining);
    if (selectedId === id) setSelectedId(remaining[0].id);
  };

  const handleSaveAndApply = () => {
    onSaveProfiles(localProfiles);
    onSelectProfile(selectedId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white border-2 border-white rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-[0_30px_70px_-15px_rgba(15,23,42,0.2)] flex flex-col max-h-[85vh] text-slate-900">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-[#f8fafc]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-sm">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Kit de Marque & Profils</h2>
              <p className="text-xs text-slate-500">Configurez votre identité (nom, logo, site) ou gérez plusieurs marques.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left List of Profiles */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-100 p-4 space-y-2 overflow-y-auto bg-[#f8fafc]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mes Profils</span>
              <button
                onClick={handleCreateNew}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-bold"
              >
                <Plus size={14} /> Nouveau
              </button>
            </div>

            {localProfiles.map(p => (
              <div
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`group p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  p.id === selectedId 
                    ? 'bg-white border-blue-500/40 text-slate-900 shadow-sm' 
                    : 'bg-white/60 border-slate-200/60 text-slate-600 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div 
                    className="w-4 h-4 rounded-full shrink-0 shadow-sm" 
                    style={{ backgroundColor: p.accentColor }} 
                  />
                  <span className="text-xs font-bold truncate">{p.name}</span>
                </div>
                {localProfiles.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-500 p-1 text-slate-400"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Right Edit Form */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Nom de l'Espace / Marque</label>
                <input
                  type="text"
                  value={current.name}
                  onChange={e => updateCurrent({ name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Nom affiché sur les slides</label>
                <input
                  type="text"
                  value={current.branding.companyName}
                  onChange={e => updateBranding({ companyName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Identifiant Réseau (ex: @numtema)</label>
                <input
                  type="text"
                  value={current.branding.handle || ''}
                  onChange={e => updateBranding({ handle: e.target.value })}
                  placeholder="@votrecompte"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Site Web</label>
                <input
                  type="text"
                  value={current.branding.companyWebsite}
                  onChange={e => updateBranding({ companyWebsite: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Logo / Avatar URI ou Upload Local */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Logo ou Photo de Profil</label>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 shadow-sm">
                  {current.branding.iconUri ? (
                    <img src={current.branding.iconUri} className="w-full h-full object-contain p-1" alt="" crossOrigin="anonymous" />
                  ) : (
                    <span className="text-xl font-black text-slate-400">{(current.branding.companyName || "N")[0]}</span>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={current.branding.iconUri || ''}
                    onChange={e => updateBranding({ iconUri: e.target.value })}
                    placeholder="Collez une URL d'image (https://...)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      id="brand-logo-file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => updateBranding({ iconUri: reader.result as string });
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('brand-logo-file')?.click()}
                      className="text-xs bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1 rounded-full text-slate-700 font-bold transition-all"
                    >
                      Choisir une image sur mon PC
                    </button>
                    {current.branding.iconUri && (
                      <button
                        type="button"
                        onClick={() => updateBranding({ iconUri: '' })}
                        className="text-[11px] text-red-500 font-semibold hover:underline"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Mode d'affichage du branding */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Visibilité du Logo & Marque sur le Carrousel</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { mode: 'all' as BrandingDisplayMode, label: 'Tous les slides', desc: 'Présent partout' },
                  { mode: 'first-last' as BrandingDisplayMode, label: 'Début & Fin', desc: 'Slide 1 et final' },
                  { mode: 'none' as BrandingDisplayMode, label: 'Masqué', desc: '100% minimal' }
                ].map(opt => (
                  <button
                    key={opt.mode}
                    type="button"
                    onClick={() => updateBranding({ 
                      displayMode: opt.mode,
                      showBranding: opt.mode !== 'none'
                    })}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      (current.branding.displayMode || 'all') === opt.mode
                        ? 'bg-blue-50/70 border-blue-500 text-blue-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200/70 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-extrabold">{opt.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Couleurs et Typo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Couleur d'accentuation</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={current.accentColor}
                    onChange={e => updateCurrent({ accentColor: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                  />
                  <span className="font-mono text-sm font-semibold text-slate-700">{current.accentColor}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Typographie Signature</label>
                <select
                  value={current.fontFamily}
                  onChange={e => updateCurrent({ fontFamily: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans (SaaS & Soft UI)</option>
                  <option value="Outfit">Outfit (Moderne & Équilibré)</option>
                  <option value="Space Grotesk">Space Grotesk (Tech & Editorial)</option>
                  <option value="Inter">Inter (Minimaliste & Pro)</option>
                  <option value="Bebas Neue">Bebas Neue (Titres Chocs)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f8fafc] border-t border-slate-100 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button variant="primary" onClick={handleSaveAndApply}>
            Appliquer au Studio
          </Button>
        </div>
      </div>
    </div>
  );
};
