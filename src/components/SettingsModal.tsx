import React, { useState } from 'react';
import { getApiKey, setApiKey, getPollinationsKey, setPollinationsKey } from '../../geminiService';
import { Button } from './CoreButton';
import { X, KeyRound, CheckCircle2, Cloud, HardDrive, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [key, setKey] = useState<string>(getApiKey());
  const [polliKey, setPolliKey] = useState<string>(getPollinationsKey());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setApiKey(key.trim());
    setPollinationsKey(polliKey.trim());
    setSaved(true);
    setTimeout(onClose, 900);
  };

  const masked = key.trim()
    ? `${key.trim().slice(0, 6)}${'•'.repeat(Math.max(4, key.trim().length - 10))}${key.trim().slice(-4)}`
    : '';

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] border-2 border-white shadow-[0_30px_70px_-15px_rgba(15,23,42,0.2)] p-8 md:p-10 space-y-6 text-slate-900">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-[0_12px_24px_-6px_rgba(29,78,216,0.4)]">
              <KeyRound size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Paramètres Moteur IA</h2>
              <p className="text-xs font-semibold text-slate-400">Gemini (Texte) & Pollinations / Imagen (Visuels)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 bg-slate-50 rounded-full border border-slate-200/80 text-slate-500 hover:text-slate-800 transition-colors">
            <X size={18} />
          </button>
        </header>

        <section className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Clé API Google Gemini (Rédaction & Idées)</label>
            <input
              type="password"
              value={key}
              onChange={e => { setKey(e.target.value); setSaved(false); }}
              placeholder="AIza..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {masked && <p className="text-[11px] font-mono text-slate-500 mt-1">Clé active : {masked}</p>}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles size={14} className="text-blue-600" />
                Clé Pollinations.ai (Optionnelle / Images illimitées)
              </label>
              <a 
                href="https://enter.pollinations.ai/keys" 
                target="_blank" 
                rel="noreferrer" 
                className="text-[11px] text-blue-600 font-bold hover:underline"
              >
                Obtenir ma clé →
              </a>
            </div>
            <input
              type="password"
              value={polliKey}
              onChange={e => { setPolliKey(e.target.value); setSaved(false); }}
              placeholder="sk_... (Optionnel : fonctionne aussi sans clé)"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Sans clé, le générateur utilise le mode public instantané gratuit. Si vous avez une clé Pollinations, collez-la pour débloquer Flux.1 Schnell en priorité haute.
            </p>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-slate-500 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <Cloud size={15} className="text-blue-600 shrink-0 mt-0.5" />
            <span>Vos clés restent sécurisées localement dans votre navigateur (`localStorage`).</span>
          </div>
        </section>

        <footer className="flex gap-3 items-center pt-2">
          <Button variant="secondary" size="lg" onClick={onClose}>
            Fermer
          </Button>
          <Button variant="primary" size="lg" className="flex-1" onClick={handleSave}>
            Enregistrer
          </Button>
          {saved && <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold"><CheckCircle2 size={16} /> Enregistré</span>}
        </footer>
      </div>
    </div>
  );
};
