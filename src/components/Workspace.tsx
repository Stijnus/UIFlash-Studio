import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Search, Camera, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/utils/helpers";
import { DEVICE_PRESETS } from "@/constants";
import { ArtifactCard } from "./ArtifactCard";
import { Button } from "@/components/ui/button";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-css";

export function Workspace() {
  const {
    activeGen,
    activeGenId,
    setActiveGenId,
    activeSession,
    generations,
    isGenerating,
    viewMode,
    isAnalyzingImagesForPrompt,
    isAnalyzing,
    analysisResult,
    deviceMode,
    iframeRef,
  } = useApp();

  // When a card is opened in full-screen mode, we store its id here
  const [expandedGenId, setExpandedGenId] = useState<string | null>(null);

  const expandedGen = expandedGenId
    ? (generations.find((g) => g.id === expandedGenId) ??
      activeSession?.artifacts.find((a) => a.id === expandedGenId))
    : null;

  const generatedHtml = activeGen?.html || "";
  const streamingCode = activeGen?.streamingCode || "";

  // Clear expanded view when new generations start
  useEffect(() => {
    if (isGenerating) setExpandedGenId(null);
  }, [isGenerating]);

  // Highlight code whenever viewMode switches to code or content changes
  useEffect(() => {
    if (viewMode === "code") {
      Prism.highlightAll();
    }
  }, [viewMode, generatedHtml, streamingCode]);

  // Update iframe content manually to prevent flicker and unnecessary reloads
  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc && generatedHtml) {
        if (doc.documentElement.innerHTML.length !== generatedHtml.length) {
          doc.open();
          doc.write(generatedHtml);
          doc.close();
        }
      }
    }
  }, [generatedHtml, iframeRef]);

  // Show expanded single-card full-screen view
  if (expandedGen) {
    const html = expandedGen.html || "";
    return (
      <div className="flex-1 w-full flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-3 border-b border-border/50 bg-background/80 backdrop-blur-md shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-xs"
            onClick={() => setExpandedGenId(null)}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to grid
          </Button>
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {expandedGen.styleName}
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 overflow-hidden bg-secondary/5">
          <div
            className={cn(
              "transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] rounded-[2rem] shadow-[0_80px_160px_-20px_rgba(0,0,0,0.8)] overflow-hidden border border-white/10 ring-1 ring-white/5 shrink-0 bg-white",
              deviceMode !== "mobile" && "max-w-[95%] aspect-video",
            )}
            style={{
              width: DEVICE_PRESETS[deviceMode].width,
              height: `${DEVICE_PRESETS[deviceMode].height}px`,
            }}
          >
            <iframe
              ref={iframeRef}
              srcDoc={html}
              title={expandedGen.styleName}
              className="w-full h-full bg-white"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      </div>
    );
  }

  const showGrid =
    generations.length > 1 &&
    (isGenerating ||
      (activeSession?.artifacts && activeSession.artifacts.length > 1));

  return (
    <div className="flex-1 w-full p-4 md:p-8 flex items-center justify-center relative overflow-hidden">
      {/* When multiple generations exist (variations), show them all in the grid */}
      {showGrid ? (
        <div className="w-full h-full flex flex-col items-center justify-start overflow-y-auto custom-scrollbar gap-8 py-8">
          <div className="artifact-grid animate-in fade-in slide-in-from-bottom-4 duration-700">
            {generations.map((gen) => (
              <ArtifactCard
                key={gen.id}
                artifact={gen}
                isFocused={gen.id === activeGenId}
                onClick={() => setActiveGenId(gen.id)}
                onOpen={() => {
                  setActiveGenId(gen.id);
                  setExpandedGenId(gen.id);
                }}
              />
            ))}
          </div>
        </div>
      ) : !generatedHtml &&
        !activeGen?.isGenerating &&
        viewMode !== "analysis" ? (
        <div className="text-center max-w-sm animate-in fade-in zoom-in-95 duration-1000 relative z-10">
          <div className="w-24 h-24 bg-primary/5 border border-primary/20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl backdrop-blur-3xl glow-border relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Sparkles className="w-12 h-12 text-primary/60 group-hover:text-primary group-hover:scale-110 transition-all duration-500 glow-text" />
          </div>
          <h2 className="text-3xl font-bold mb-4 tracking-tighter glow-text">
            Studio is ready.
          </h2>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.3em] leading-loose opacity-60">
            Describe your vision or drop a reference image to begin the
            generation sequence.
          </p>
        </div>
      ) : activeGen?.isGenerating ? (
        <div className="w-full max-w-2xl space-y-12 animate-in fade-in zoom-in-95 duration-1000">
          <div className="flex flex-col items-center gap-8">
            <div className="relative">
              <div className="w-32 h-32 border-2 border-primary/10 border-t-primary rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
                <Sparkles className="w-8 h-8 text-primary animate-bounce" />
              </div>
            </div>
            <div className="text-center space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-primary/80 glow-text animate-pulse">
                {isAnalyzingImagesForPrompt
                  ? "Analyzing Visual Context"
                  : (activeGen.streamingProgress ?? 0) > 80
                    ? "Finalizing Component Bundle"
                    : "Synthesizing Architecture"}
              </h3>
              <div className="relative w-72 mx-auto">
                <Progress
                  value={
                    isAnalyzingImagesForPrompt
                      ? 15
                      : (activeGen.streamingProgress ?? 0)
                  }
                  className="h-1.5 bg-primary/10"
                />
                <div className="absolute -inset-1 bg-primary/20 blur-xl -z-10 opacity-50" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-[12px] text-foreground font-mono tabular-nums font-bold tracking-widest">
                  {isAnalyzingImagesForPrompt
                    ? "---"
                    : `${activeGen.streamingProgress ?? 0}%`}
                </span>
                <span className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-[0.2em] animate-pulse">
                  {isAnalyzingImagesForPrompt
                    ? "EXTRACTING VISUAL PATTERNS..."
                    : (activeGen.streamingProgress ?? 0) < 20
                      ? "INITIALIZING GENERATION PIPELINE..."
                      : (activeGen.streamingProgress ?? 0) < 50
                        ? "STREAMING COMPONENT MARKUP..."
                        : (activeGen.streamingProgress ?? 0) < 80
                          ? "BUILDING STYLE & INTERACTIVITY..."
                          : "ASSEMBLING FINAL OUTPUT..."}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 opacity-40">
            <div className="space-y-3">
              <Skeleton className="h-4 w-[250px] bg-primary/5" />
              <Skeleton className="h-4 w-[200px] bg-primary/5" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-[250px] bg-primary/5" />
              <Skeleton className="h-4 w-[200px] bg-primary/5" />
            </div>
          </div>
        </div>
      ) : viewMode === "analysis" ? (
        <Card className="w-full h-full max-w-5xl glass-panel border-none shadow-2xl overflow-hidden flex flex-col rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center px-8 py-5 border-b border-border/50 bg-secondary/20">
            <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Design Audit & Intelligence
            </h3>
          </div>
          <div className="flex-1 overflow-auto p-10 custom-scrollbar">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-full gap-6">
                <div className="w-12 h-12 border-2 border-border border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : analysisResult ? (
              <div className="prose prose-invert prose-xs max-w-none prose-headings:uppercase prose-headings:tracking-widest prose-headings:text-primary">
                <ReactMarkdown>{analysisResult}</ReactMarkdown>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
                <Camera className="w-12 h-12 opacity-10" />
                <p className="text-[10px] font-bold uppercase tracking-widest">
                  No context analyzed yet
                </p>
              </div>
            )}
          </div>
        </Card>
      ) : viewMode === "preview" ? (
        <div className="w-full h-full flex flex-col items-center justify-start overflow-y-auto custom-scrollbar gap-8 py-8">
          {activeSession?.artifacts && activeSession.artifacts.length > 1 ? (
            <div className="artifact-grid animate-in fade-in slide-in-from-bottom-4 duration-700">
              {activeSession.artifacts.map((art) => (
                <ArtifactCard
                  key={art.id}
                  artifact={art}
                  isFocused={art.id === activeGenId}
                  onClick={() => setActiveGenId(art.id)}
                />
              ))}
            </div>
          ) : (
            <div
              className={cn(
                "transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] rounded-[2rem] shadow-[0_80px_160px_-20px_rgba(0,0,0,0.8)] overflow-hidden border border-white/10 ring-1 ring-white/5 shrink-0 bg-white",
                deviceMode !== "mobile" && "max-w-[95%] aspect-video",
              )}
              style={{
                width: DEVICE_PRESETS[deviceMode].width,
                height: `${DEVICE_PRESETS[deviceMode].height}px`,
              }}
            >
              <iframe
                ref={iframeRef}
                srcDoc={generatedHtml}
                title="Preview"
                className="w-full h-full bg-white"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          )}
        </div>
      ) : (
        <Card className="w-full h-full max-w-5xl glass-panel border-none shadow-2xl overflow-hidden flex flex-col rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center px-6 py-3 bg-secondary/20 border-b border-border/50 justify-between">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-destructive/20 border border-destructive/40"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40"></div>
            </div>
            <span className="text-[9px] font-mono text-muted-foreground font-bold tracking-widest uppercase">
              Artifact Source
            </span>
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar bg-[#1d1f21]">
            <pre className="text-[11px] leading-relaxed m-0 p-8 h-full">
              <code className="language-markup font-mono">
                {generatedHtml || streamingCode}
              </code>
            </pre>
          </div>
        </Card>
      )}
    </div>
  );
}
