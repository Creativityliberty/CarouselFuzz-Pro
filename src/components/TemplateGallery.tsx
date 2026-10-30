import React from 'react';
import { PREBUILT_TEMPLATES, PrebuiltTemplate } from '../data/templates';
import { Layers, ArrowRight } from 'lucide-react';

interface TemplateGalleryProps {
  onSelectTemplate: (template: PrebuiltTemplate) => void;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onSelectTemplate }) => {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
            <Layers size={16} />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Partir d'un modèle signature
          </h3>
          <span className="text-xs bg-white text-slate-500 border border-slate-200/80 px-2.5 py-0.5 rounded-full font-mono shadow-sm">
            {PREBUILT_TEMPLATES.length} Formats
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {PREBUILT_TEMPLATES.map((tmpl) => (
          <div
            key={tmpl.id}
            onClick={() => onSelectTemplate(tmpl)}
            className="group relative overflow-hidden rounded-[2rem] p-5 bg-white border-2 border-white shadow-[0_18px_38px_-12px_rgba(15,23,42,0.06)] hover:shadow-[0_24px_48px_-12px_rgba(29,78,216,0.14)] hover:border-blue-500/40 transition-all duration-300 cursor-pointer flex flex-col justify-between h-60"
          >
            {/* Top row */}
            <div className="flex items-start justify-between">
              <span 
                className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border"
                style={{ 
                  backgroundColor: `${tmpl.config.accentColor || '#1d4ed8'}12`, 
                  color: tmpl.config.accentColor || '#1d4ed8',
                  borderColor: `${tmpl.config.accentColor || '#1d4ed8'}25`
                }}
              >
                {tmpl.category}
              </span>
              <span className="text-xs font-mono font-semibold text-slate-400">
                {tmpl.slideCount} slides
              </span>
            </div>

            {/* Visual Soft UI card stack representation */}
            <div className="relative my-2 h-16 flex items-center justify-center rounded-2xl bg-[#f8fafc] border border-dashed border-slate-200/80">
              <div className="absolute w-24 h-11 rounded-xl bg-white border border-slate-200/70 shadow-sm transform rotate-[-6deg] translate-y-1 opacity-60 group-hover:rotate-[-10deg] transition-transform" />
              <div className="absolute w-26 h-11 rounded-xl bg-white border border-slate-200/80 shadow-sm transform rotate-[5deg] opacity-80 group-hover:rotate-[8deg] transition-transform" />
              <div className="relative w-32 h-11 rounded-xl bg-white border border-slate-200/90 px-2.5 py-2 shadow-md flex items-center gap-2">
                <span 
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" 
                  style={{ backgroundColor: tmpl.config.accentColor || '#1d4ed8' }} 
                />
                <span className="text-[10px] font-bold text-slate-800 truncate">{tmpl.title}</span>
              </div>
            </div>

            {/* Bottom info */}
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center justify-between">
                <span className="truncate">{tmpl.title}</span>
                <ArrowRight size={14} className="text-blue-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0" />
              </h4>
              <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed font-medium">
                {tmpl.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
