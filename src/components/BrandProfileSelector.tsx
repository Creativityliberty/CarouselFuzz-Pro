import React from 'react';
import { BrandProfile } from '../types';

interface BrandProfileSelectorProps {
  profiles: BrandProfile[];
  activeProfile: BrandProfile;
  onSelectProfile: (profile: BrandProfile) => void;
  onOpenBrandManager: () => void;
}

export const BrandProfileSelector: React.FC<BrandProfileSelectorProps> = ({
  activeProfile,
  onOpenBrandManager
}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative group">
        <button
          onClick={onOpenBrandManager}
          className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 transition-all text-xs font-bold text-slate-800 shadow-[0_6px_16px_-4px_rgba(15,23,42,0.06)]"
        >
          <div 
            className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] text-white shrink-0 shadow-sm"
            style={{ backgroundColor: activeProfile.accentColor }}
          >
            {activeProfile.name.slice(0, 1)}
          </div>
          <span className="max-w-[120px] truncate">{activeProfile.name}</span>
          <span className="text-[10px] text-slate-500 uppercase font-mono bg-slate-100 px-2 py-0.5 rounded-full">
            {activeProfile.branding.displayMode === 'none' ? 'Sans logo' : 'Logo actif'}
          </span>
        </button>
      </div>
    </div>
  );
};
