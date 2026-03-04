
interface AppDrawerContentProps {
  model: string;
  setModel: (v: string) => void;
}

export function AppDrawerContent({
  model,
  setModel
}: AppDrawerContentProps) {
  return (
    <div className="space-y-8 p-2">
      <div className="space-y-4">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Inference Model</label>
        <div className="grid grid-cols-1 gap-2">
          {[
            { id: 'gemini-3-flash-preview', name: 'Flash 3.0', desc: 'Lightning fast generation' },
            { id: 'gemini-3.1-pro-preview', name: 'Pro 3.1', desc: 'Complex reasoning & precise layouts' }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setModel(m.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                model === m.id ? 'bg-primary/5 border-primary ring-1 ring-primary/20' : 'bg-secondary/20 border-border hover:border-primary/30'
              }`}
            >
              <div className="font-bold text-xs">{m.name}</div>
              <div className="text-[10px] text-muted-foreground mt-1 leading-tight">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
        <p className="text-[10px] leading-relaxed text-muted-foreground italic">
          Note: Pro models offer higher fidelity but increased latency. Artifacts always use Tailwind 4 via CDN for portability.
        </p>
      </div>
    </div>
  );
}
