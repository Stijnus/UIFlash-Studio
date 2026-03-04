import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles,
  History,
  Trash2,
  Plus,
  ImageIcon,
  RefreshCw,
  Search,
  Layout,
  Layers,
  Palette,
  Check,
  Wand2,
  AlertCircle,
} from "lucide-react";
import { VARIATION_PACKS } from "@/constants";
import { cn } from "@/utils/helpers";
import { useApp } from "@/contexts/AppContext";

export function AppSidebar() {
  const {
    sidebarTab,
    setSidebarTab,
    createNewSession,
    prompt,
    setPrompt,
    images,
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removeImage,
    fileInputRef,
    handleImageUpload,
    handleAnalyzeImage,
    isAnalyzing,
    assetPrompt,
    setAssetPrompt,
    handleGenerateAsset,
    isGeneratingAsset,
    generatedAsset,
    addAssetToReferences,
    sessions,
    activeSessionId,
    loadSession,
    deleteSession,
    activeGen,
    isGenerating,
    handleIterate,
    handleGenerate,
    selectedVariationPack,
    setSelectedVariationPack,
    handleGenerateVariations,
    error,
  } = useApp();

  return (
    <Sidebar className="border-r border-border/50 bg-background/95 backdrop-blur-xl">
      <SidebarHeader className="p-4 flex flex-row items-center justify-between border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center glow-border">
            <Sparkles className="w-6 h-6 text-primary glow-text" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tighter leading-none">
              UIFlash
            </span>
            <span className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] opacity-80">
              Studio
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={createNewSession}
          className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </SidebarHeader>

      <SidebarContent className="flex flex-col h-full overflow-hidden">
        <Tabs
          value={sidebarTab}
          onValueChange={(v: any) => setSidebarTab(v)}
          className="w-full h-full flex flex-col"
        >
          <div className="px-4 pt-4">
            <TabsList className="w-full bg-secondary/50 p-1 rounded-xl">
              <TabsTrigger
                value="controls"
                className="flex-1 gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Wand2 className="w-4 h-4" /> Controls
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="flex-1 gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <History className="w-4 h-4" /> History
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="controls"
            className="flex-1 overflow-y-auto px-5 pb-6 space-y-8 mt-6 custom-scrollbar"
          >
            {/* Prompt Input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] flex items-center gap-2 opacity-70">
                  <Layout className="w-3.5 h-3.5" /> UI Description
                </label>
              </div>
              <div className="relative group">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your interface (e.g., 'A modern analytics dashboard with glassmorphism...')"
                  className="w-full h-32 p-4 rounded-2xl bg-secondary/30 border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none text-sm placeholder:text-muted-foreground/60 scrollbar-thin"
                />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-foreground/5 pointer-events-none group-focus-within:ring-primary/30 transition-all" />
              </div>
            </div>

            {/* Reference Images */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] flex items-center gap-2 opacity-70">
                  <ImageIcon className="w-3.5 h-3.5" /> Reference Images
                </label>
                <span className="text-[10px] font-mono text-muted-foreground/60">
                  {images.length}/3
                </span>
              </div>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl transition-all cursor-pointer group",
                  isDragging
                    ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(var(--primary),0.1)] scale-[0.98]"
                    : "border-border/50 hover:border-primary/50 hover:bg-primary/5",
                )}
              >
                <input
                  type="file"
                  multiple
                  hidden
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                />
                <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Drop images or click to upload
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">
                  Supports JPG, PNG (Max 3)
                </p>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-3 p-2 rounded-xl bg-secondary/20">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square group rounded-lg overflow-hidden border border-border/50"
                    >
                      <img
                        src={img.url}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        alt={`Ref ${idx}`}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-6 w-6 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(idx);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator className="bg-border/30" />

            {/* Design Style */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] flex items-center gap-2 opacity-70">
                <Palette className="w-3.5 h-3.5" /> Aesthetic Style
              </label>
              <div className="grid grid-cols-1 gap-2">
                {VARIATION_PACKS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedVariationPack(p.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                      selectedVariationPack === p.id
                        ? "bg-primary/10 border-primary/50 ring-1 ring-primary/20"
                        : "bg-secondary/20 border-border/50 hover:bg-secondary/40",
                    )}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
                        selectedVariationPack === p.id
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/30",
                      )}
                    >
                      {selectedVariationPack === p.id && (
                        <Check className="w-2.5 h-2.5 text-primary-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{p.name}</div>
                      <div className="text-[10px] text-muted-foreground line-clamp-1">
                        {p.styles.map((s) => s.name).join(", ")}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Assets */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] flex items-center gap-2 opacity-70">
                  <Layers className="w-3.5 h-3.5" /> AI Asset Generator
                </label>
              </div>
              <div className="space-y-3 p-4 rounded-2xl bg-secondary/20 border border-border/50">
                <div className="relative">
                  <input
                    type="text"
                    value={assetPrompt}
                    onChange={(e) => setAssetPrompt(e.target.value)}
                    placeholder="e.g., 'Cyberpunk logo for a tech app'"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/50 pb-2 border-b border-border/50 focus:border-primary/50 transition-colors"
                  />
                </div>
                {generatedAsset ? (
                  <div className="space-y-3">
                    <div className="relative rounded-xl overflow-hidden border border-border/50 aspect-square group">
                      <img
                        src={generatedAsset.url}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        alt="Generated"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-7 text-[10px] rounded-full gap-1 shadow-lg bg-background/80"
                          onClick={addAssetToReferences}
                        >
                          <Plus className="w-3 h-3" /> Use as Reference
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full rounded-xl gap-2 font-medium bg-secondary/30 border-primary/20 hover:bg-primary/5 transition-all"
                    onClick={handleGenerateAsset}
                    disabled={isGeneratingAsset || !assetPrompt}
                  >
                    {isGeneratingAsset ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-primary" />
                    )}
                    Generate Asset
                  </Button>
                )}
              </div>
            </div>

            {/* Analysis Tool */}
            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full rounded-xl gap-2 h-11 font-medium border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all group"
                onClick={handleAnalyzeImage}
                disabled={isAnalyzing || images.length === 0}
              >
                <Search className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                Analyze Reference Design
              </Button>
            </div>
          </TabsContent>

          <TabsContent
            value="history"
            className="flex-1 overflow-y-auto scrollbar-thin mt-4"
          >
            <div className="px-4 space-y-4 pb-4">
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center">
                    <History className="w-6 h-6 text-muted-foreground/30" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">
                    No history yet
                  </p>
                  <p className="text-xs text-muted-foreground/60 max-w-[160px]">
                    Start generating to see your designs here.
                  </p>
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => loadSession(session)}
                    className={cn(
                      "group relative p-4 rounded-2xl border transition-all cursor-pointer",
                      activeSessionId === session.id
                        ? "bg-primary/5 border-primary/40 shadow-sm"
                        : "bg-secondary/10 border-border/30 hover:bg-secondary/20 hover:border-border/50",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-1 leading-tight mb-1">
                          {session.prompt || "Visual Prompt"}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1 font-mono uppercase tracking-tighter opacity-70">
                            {new Date(session.timestamp).toLocaleDateString()}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                          <span className="flex items-center gap-1">
                            <Layers className="w-2.5 h-2.5 opacity-50" />{" "}
                            {session.artifacts.length} versions
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                        onClick={(e) => deleteSession(session.id, e)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </SidebarContent>

      <SidebarFooter className="p-4 bg-background/50 border-t border-border/50">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-xs text-destructive font-medium line-clamp-2">
              {error}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {activeGen && (
            <Button
              variant="outline"
              className="w-full rounded-xl h-11 gap-2 font-semibold border-primary/20 hover:bg-primary/5 overflow-hidden group relative"
              disabled={isGenerating}
              onClick={handleIterate}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <RefreshCw
                className={cn("w-4 h-4", isGenerating && "animate-spin")}
              />
              Iterate on Design
            </Button>
          )}

          <div className="flex gap-2">
            <Button
              className="flex-1 rounded-xl h-12 gap-2 font-bold shadow-xl shadow-primary/20 active:scale-95 transition-all text-white bg-primary hover:bg-primary/90 hover:glow-border"
              disabled={isGenerating}
              onClick={handleGenerate}
            >
              {isGenerating ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 glow-text" />
                  <span className="tracking-tight">
                    {activeGen ? "REGENERATE" : "GENERATE UI"}
                  </span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="w-11 h-11 rounded-xl group hover:border-primary/50 transition-colors"
              disabled={isGenerating}
              onClick={handleGenerateVariations}
              title="Generate Style Variations"
            >
              <Layers className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
