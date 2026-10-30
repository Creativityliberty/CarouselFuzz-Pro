import React, { useState } from 'react';
import { getApiKey, setApiKey } from '../../geminiService';
import { Button } from './CoreButton';
import { X, KeyRound, CheckCircle2, Cloud, HardDrive } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [key, setKey] = useState<string>(getApiKey());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setApiKey(key.trim());
    setSaved(true);
    setTimeout(onClose, 900);
  };

  const masked = key.trim()
    ? `${key.trim().slice(0, 6)}${'•'.repeat(Math.max(4, key.trim().length - 10))}${key.trim().slice(-4)}`
    : '';

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-slate-900 rounded-[2.5rem] border border-white/10 shadow-2xl p-10 space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500 flex items-center justify-center shadow-lg">
              <KeyRound size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black italic tracking-tighter uppercase">Settings</h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Secrets & Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 rounded-xl border border-white/10 hover:text-red-400 transition-colors"><X size={20} /></button>
        </header>

        <section className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Gemini API Key</label>
          <input
            type="password"
            value={key}
            onChange={e => { setKey(e.target.value); setSaved(false); }}
            placeholder="AIza..."
            className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-1 focus:ring-teal-500"
          />
          {masked && <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Saved: {masked}</p>}
          <div className="flex items-start gap-2 text-[10px] text-slate-500 leading-relaxed">
            <Cloud size={14} className="text-teal-500 shrink-0 mt-0.5" />
            <span>Stored in your browser (localStorage) only. Sent to your local server per request — never written to disk by the app.</span>
          </div>
          <div className="flex items-start gap-2 text-[10px] text-slate-500 leading-relaxed">
            <HardDrive size={14} className="text-slate-400 shrink-0 mt-0.5" />
            <span>Optional: a GEMINI_API_KEY env var on the server takes priority when this field is empty. Ollama Local needs no key.</span>
          </div>
        </section>

        <footer className="flex gap-3 items-center">
          <Button variant="primary" size="lg" className="flex-1" onClick={handleSave} disabled={!key.trim()}>
            Save Key
          </Button>
          {saved && <span className="flex items-center gap-1 text-teal-400 text-xs font-black uppercase tracking-widest"><CheckCircle2 size={16} /> Saved</span>}
        </footer>
      </div>
    </div>
  );
};
