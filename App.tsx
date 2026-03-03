import React, { useState, useRef, useEffect } from 'react';
import { generateUI, analyzeImages, analyzeImageForFeedback, generateImageAsset } from './src/services/geminiService';
import SideDrawer from './components/SideDrawer';
import { Settings, Image as ImageIcon, Code, Play, Smartphone, Monitor, Trash2, Layers, Loader2, Download, Copy, Check, Search, Camera, Sparkles, Plus, History, Clock, ChevronRight, LayoutPanelLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { VARIATION_PACKS } from './constants';
import { loadSessions, saveSessions } from './src/utils/storage';
import { Session, Artifact } from './types';

// shadcn UI components
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarProvider, 
  SidebarTrigger, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

import { ModeToggle } from './components/mode-toggle';

export default function App() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'controls' | 'history'>('controls');
  
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<{ data: string; mimeType: string; url: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'code' | 'analysis'>('preview');
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [model, setModel] = useState('gemini-3-flash-preview');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [analysisResult, setAnalysisResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzingImagesForPrompt, setIsAnalyzingImagesForPrompt] = useState(false);
  const [selectedVariationPack, setSelectedVariationPack] = useState(VARIATION_PACKS[0].id);

  const [assetPrompt, setAssetPrompt] = useState('');
  const [isGeneratingAsset, setIsGeneratingAsset] = useState(false);
  const [generatedAsset, setGeneratedAsset] = useState<{ data: string; mimeType: string; url: string } | null>(null);

  const [generations, setGenerations] = useState<{
    id: string;
    styleName: string;
    html: string;
    streamingCode: string;
    isGenerating: boolean;
  }[]>([]);
  const [activeGenId, setActiveGenId] = useState<string>('');

  // Load history on mount
  useEffect(() => {
    const loaded = loadSessions();
    if (loaded && loaded.length > 0) {
      setSessions(loaded);
    }
  }, []);

  // Save history whenever sessions change
  useEffect(() => {
    if (sessions.length > 0) {
      saveSessions(sessions);
    }
  }, [sessions]);

  const activeGen = generations.find(g => g.id === activeGenId);
  const generatedHtml = activeGen?.html || '';
  const styleName = activeGen?.styleName || '';
  const streamingCode = activeGen?.streamingCode || '';

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(generatedHtml || '');
        doc.close();
      }
    }
  }, [generatedHtml, viewMode, deviceMode, activeGenId]);

  const loadSession = (session: Session) => {
    setActiveSessionId(session.id);
    setPrompt(session.prompt);
    setImages(session.images?.map(img => ({ 
        data: img.data, 
        mimeType: img.mimeType, 
        url: `data:${img.mimeType};base64,${img.data}` 
    })) || []);
    setGenerations(session.artifacts.map(art => ({
      id: art.id,
      styleName: art.styleName,
      html: art.html,
      streamingCode: '',
      isGenerating: false
    })));
    if (session.artifacts.length > 0) {
      setActiveGenId(session.artifacts[0].id);
    }
    setSidebarTab('controls');
    setViewMode('preview');
  };

  const createNewSession = () => {
    setActiveSessionId(null);
    setPrompt('');
    setImages([]);
    setGenerations([]);
    setActiveGenId('');
    setError('');
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => {
        const updated = prev.filter(s => s.id !== id);
        saveSessions(updated);
        return updated;
    });
    if (activeSessionId === id) {
        createNewSession();
    }
  };

  const processFiles = (files: FileList | File[]) => {
    const remainingSlots = 3 - images.length;
    if (remainingSlots <= 0) return;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    filesToProcess.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64Data = (event.target.result as string).split(',')[1];
          setImages(prev => {
            if (prev.length >= 3) return prev;
            return [...prev, {
              data: base64Data,
              mimeType: file.type,
              url: event.target!.result as string
            }];
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    processFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const [isDragging, setIsDragging] = useState(false);
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) processFiles(files);
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) imageFiles.push(blob);
        }
      }
      if (imageFiles.length > 0) processFiles(imageFiles);
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [images.length]);

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const runGeneration = async (genId: string, promptText: string, sessionId: string, previousHtml?: string) => {
    try {
      const generator = generateUI(promptText, model, images, previousHtml, deviceMode);
      let lastArtifact: Artifact | null = null;
      for await (const chunk of generator) {
        setGenerations(prev => prev.map(g => {
          if (g.id === genId) {
            if (typeof chunk === 'string') {
              return { ...g, streamingCode: chunk };
            } else if (chunk && typeof chunk === 'object') {
              if (chunk.styleName === 'Error') {
                setError(chunk.html);
                return { ...g, isGenerating: false };
              } else {
                lastArtifact = {
                  id: genId,
                  styleName: chunk.styleName || g.styleName,
                  html: chunk.html || '',
                  status: 'complete'
                };
                return { ...g, styleName: chunk.styleName || g.styleName, html: chunk.html || '' };
              }
            }
          }
          return g;
        }));
      }
      if (lastArtifact) {
        setSessions(prev => prev.map(s => {
          if (s.id === sessionId) {
            const existingArtIdx = s.artifacts.findIndex(a => a.id === genId);
            const newArtifacts = [...s.artifacts];
            if (existingArtIdx >= 0) {
              newArtifacts[existingArtIdx] = lastArtifact!;
            } else {
              newArtifacts.push(lastArtifact!);
            }
            return { ...s, artifacts: newArtifacts, timestamp: Date.now() };
          }
          return s;
        }));
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during generation.');
    } finally {
      setGenerations(prev => prev.map(g => g.id === genId ? { ...g, isGenerating: false } : g));
    }
  };

  const generate = async (customPrompt?: string, isIteration: boolean = false) => {
    if (!prompt && images.length === 0) {
      setError('Please provide a prompt or an image.');
      return;
    }
    setIsGenerating(true);
    setError('');
    setViewMode('preview');
    const newGenId = Date.now().toString();
    const newGen = {
      id: newGenId,
      styleName: isIteration ? 'Iterating...' : 'Generating...',
      html: '',
      streamingCode: '',
      isGenerating: true
    };
    let currentSessionId = activeSessionId;
    if (isIteration && currentSessionId) {
      setGenerations(prev => [...prev, newGen]);
    } else {
      setGenerations([newGen]);
      const newSession: Session = {
        id: Date.now().toString(),
        prompt: prompt,
        timestamp: Date.now(),
        artifacts: [],
        images: images.map(img => ({ data: img.data, mimeType: img.mimeType }))
      };
      setSessions(prev => [newSession, ...prev]);
      currentSessionId = newSession.id;
      setActiveSessionId(currentSessionId);
    }
    setActiveGenId(newGenId);
    try {
      let finalPrompt = prompt;
      if (!prompt && images.length > 0) {
        setIsAnalyzingImagesForPrompt(true);
        finalPrompt = await analyzeImages(images);
        setPrompt(finalPrompt);
        setIsAnalyzingImagesForPrompt(false);
      }
      const targetPrompt = customPrompt || finalPrompt;
      const previousHtml = isIteration && activeGen ? activeGen.html : undefined;
      await runGeneration(newGenId, targetPrompt, currentSessionId!, previousHtml);
    } catch (err: any) {
      setError(err.message || 'An error occurred during generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = () => generate(undefined, false);
  const handleIterate = () => generate(undefined, true);

  const handleGenerateVariations = async () => {
    if (!prompt && images.length === 0) {
      setError('Please provide a prompt or an image.');
      return;
    }
    setIsGenerating(true);
    setError('');
    setViewMode('preview');
    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
        const newSession: Session = {
            id: Date.now().toString(),
            prompt: prompt,
            timestamp: Date.now(),
            artifacts: [],
            images: images.map(img => ({ data: img.data, mimeType: img.mimeType }))
        };
        setSessions(prev => [newSession, ...prev]);
        currentSessionId = newSession.id;
        setActiveSessionId(currentSessionId);
    }
    const pack = VARIATION_PACKS.find(p => p.id === selectedVariationPack) || VARIATION_PACKS[0];
    const newGenerations = pack.styles.map((style, index) => ({
      id: `var-${Date.now()}-${index}`,
      styleName: style.name,
      html: '',
      streamingCode: '',
      isGenerating: true
    }));
    setGenerations(prev => [...prev, ...newGenerations]);
    setActiveGenId(newGenerations[0].id);
    try {
      let finalPrompt = prompt;
      if (!prompt && images.length > 0) {
        setIsAnalyzingImagesForPrompt(true);
        finalPrompt = await analyzeImages(images);
        setPrompt(finalPrompt);
        setIsAnalyzingImagesForPrompt(false);
      }
      for (let i = 0; i < newGenerations.length; i++) {
        const gen = newGenerations[i];
        const style = pack.styles[i];
        const variationPrompt = `Design the following UI: "${finalPrompt}". Strictly follow style: ${style.name} (${style.desc})`;
        await runGeneration(gen.id, variationPrompt, currentSessionId!);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyzeImage = async () => {
    if (images.length === 0) return;
    setIsAnalyzing(true);
    setError('');
    setAnalysisResult('');
    setViewMode('analysis');
    try {
      const generator = analyzeImageForFeedback(images);
      for await (const chunk of generator) setAnalysisResult(prev => prev + chunk);
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateAsset = async () => {
    if (!assetPrompt) return;
    setIsGeneratingAsset(true);
    setError('');
    try {
      const asset = await generateImageAsset(assetPrompt);
      setGeneratedAsset(asset);
    } catch (err: any) {
      setError(err.message || 'Failed to generate asset.');
    } finally {
      setIsGeneratingAsset(false);
    }
  };

  const addAssetToReferences = () => {
    if (generatedAsset && images.length < 3) {
      setImages(prev => [...prev, generatedAsset]);
      setGeneratedAsset(null);
      setAssetPrompt('');
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const blob = new Blob([generatedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-ui.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadImage = async () => {
    if (!iframeRef.current || !iframeRef.current.contentDocument) return;
    try {
      const doc = iframeRef.current.contentDocument;
      const html2canvas = (await import('html2canvas')).default;
      const isMobile = deviceMode === 'mobile';
      const canvas = await html2canvas(doc.body, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        width: isMobile ? 375 : doc.body.scrollWidth,
        windowWidth: isMobile ? 375 : doc.defaultView?.innerWidth,
      });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-ui-${deviceMode}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to export image:', err);
      setError('Failed to export image. Please try again.');
    }
  };

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-screen bg-background text-foreground font-sans overflow-hidden">
          <div className="noise-overlay" />
          
          <Sidebar className="glass-panel border-r border-border">
            <SidebarHeader className="p-6 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Code className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-bold tracking-tight text-lg leading-none">Studio</h1>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">v3 Flash</p>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent className="p-0">
              <Tabs value={sidebarTab} onValueChange={(v) => setSidebarTab(v as any)} className="w-full">
                <div className="px-6 pt-4">
                  <TabsList className="w-full bg-secondary/50 p-1 rounded-lg">
                    <TabsTrigger value="controls" className="flex-1 gap-2 text-xs font-semibold">
                      <LayoutPanelLeft className="w-3.5 h-3.5" />
                      Design
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex-1 gap-2 text-xs font-semibold">
                      <History className="w-3.5 h-3.5" />
                      History
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="controls" className="p-6 space-y-6 animate-in fade-in duration-500">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Describe UI</label>
                      <button 
                        onClick={createNewSession}
                        className="text-[10px] font-bold text-primary hover:opacity-80 uppercase tracking-widest transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="E.g., A modern SaaS dashboard..."
                      className="w-full h-32 bg-input/50 border border-border rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none transition-all custom-scrollbar"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Visual Context</label>
                      <span className="text-[10px] text-muted-foreground font-mono">{images.length}/3</span>
                    </div>
                    <div 
                      className={`grid grid-cols-2 gap-3 p-1 rounded-xl transition-all ${isDragging ? 'bg-primary/5 ring-2 ring-primary ring-dashed' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      {images.map((img, idx) => (
                        <div key={idx} className="relative group aspect-video rounded-lg overflow-hidden border border-border bg-black">
                          <img src={img.url} alt="Reference" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                          <button 
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 p-1.5 bg-black/60 hover:bg-destructive/80 text-white rounded-md backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {images.length < 3 && (
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className={`aspect-video rounded-lg border border-dashed flex flex-col items-center justify-center gap-2 transition-all ${
                            isDragging ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary hover:bg-primary/5 text-muted-foreground hover:text-primary'
                          }`}
                        >
                          <Plus className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Add Image</span>
                        </button>
                      )}
                    </div>
                    {images.length > 0 && (
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="w-full h-9 gap-2 text-xs font-bold uppercase tracking-wider bg-secondary/50"
                        onClick={handleAnalyzeImage}
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                        Analyze Context
                      </Button>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" multiple className="hidden" />
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-primary" />
                      Asset Lab
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={assetPrompt}
                        onChange={(e) => setAssetPrompt(e.target.value)}
                        placeholder="Generate icon/logo..."
                        className="flex-1 bg-input/50 border border-border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary outline-none transition-all"
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerateAsset()}
                      />
                      <Button
                        size="icon"
                        onClick={handleGenerateAsset}
                        disabled={isGeneratingAsset || !assetPrompt}
                        className="h-8 w-8"
                      >
                        {isGeneratingAsset ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      </Button>
                    </div>
                    {generatedAsset && (
                      <div className="relative group aspect-square rounded-xl overflow-hidden border border-border bg-black mt-3 shadow-xl">
                        <img src={generatedAsset.url} alt="Generated Asset" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                          <Button 
                            variant="primary" 
                            size="sm" 
                            className="h-8 gap-1.5 text-[10px] font-bold uppercase tracking-tighter"
                            onClick={addAssetToReferences}
                            disabled={images.length >= 3}
                          >
                            <Plus className="w-3 h-3" />
                            Use Reference
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="history" className="p-6 space-y-4 animate-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Recent Sessions</label>
                    {sessions.length > 0 && (
                      <button 
                        onClick={() => confirm('Clear all history?') && (setSessions([]), saveSessions([]), createNewSession())}
                        className="text-[10px] font-bold text-destructive hover:opacity-80 uppercase tracking-widest transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {sessions.length === 0 ? (
                      <div className="text-center py-12">
                        <Clock className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">No History</p>
                      </div>
                    ) : (
                      sessions.map((session) => (
                        <div 
                            key={session.id}
                            onClick={() => loadSession(session)}
                            className={`group p-3 rounded-xl border transition-all cursor-pointer ${
                                activeSessionId === session.id 
                                ? 'bg-primary/5 border-primary/50' 
                                : 'bg-input/20 border-border hover:border-primary/30'
                            }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-[11px] font-medium leading-relaxed line-clamp-2">
                              {session.prompt || 'Untitled'}
                            </p>
                            <button 
                                onClick={(e) => deleteSession(session.id, e)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-all"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">
                            <span>{new Date(session.timestamp).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1">
                              {session.artifacts.length} versions <ChevronRight className="w-2.5 h-2.5" />
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </SidebarContent>

            <SidebarFooter className="p-6 border-t border-border/50 bg-background/50">
              <div className="space-y-3">
                {activeGen?.html ? (
                  <div className="flex gap-2">
                    <Button onClick={handleIterate} disabled={isGenerating} className="flex-1 h-11 font-bold uppercase tracking-wider text-xs">
                      {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                      Iterate
                    </Button>
                    <Button variant="secondary" onClick={handleGenerate} disabled={isGenerating} className="px-4 h-11">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button onClick={handleGenerate} disabled={isGenerating} className="w-full h-11 font-bold uppercase tracking-wider text-xs">
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 fill-current" />}
                    Generate UI
                  </Button>
                )}
                
                <div className="flex flex-col gap-2">
                  <select
                    value={selectedVariationPack}
                    onChange={(e) => setSelectedVariationPack(e.target.value)}
                    disabled={isGenerating}
                    className="w-full bg-secondary/50 border border-border rounded-lg h-9 px-3 text-[10px] font-bold uppercase tracking-wider outline-none"
                  >
                    {VARIATION_PACKS.map(pack => <option key={pack.id} value={pack.id}>{pack.name}</option>)}
                  </select>
                  <Button
                    variant="ghost"
                    onClick={handleGenerateVariations}
                    disabled={isGenerating}
                    className="w-full h-9 text-[10px] font-bold uppercase tracking-wider border border-border hover:bg-secondary/50"
                  >
                    <Layers className="w-3 h-3" />
                    Split Test (x3)
                  </Button>
                </div>
              </div>
              
              {error && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-[10px] font-medium leading-relaxed">
                  {error}
                </div>
              )}
            </SidebarFooter>
          </Sidebar>

          <main className="flex-1 flex flex-col relative immersive-app-container">
            {/* Top Navigation */}
            <div className="h-16 w-full border-b border-border/50 flex items-center justify-between px-6 glass-panel z-20">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="h-9 w-9 rounded-lg border border-border" />
                <Separator orientation="vertical" className="h-4 bg-border/50" />
                {styleName && (
                  <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                    {styleName}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {generatedHtml && (
                  <div className="flex items-center gap-1.5 mr-3 border-r border-border/50 pr-3">
                    <Button variant="ghost" size="icon" onClick={copyCode} className="h-8 w-8 hover:bg-secondary/50">
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={downloadCode} className="h-8 w-8 hover:bg-secondary/50">
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={downloadImage} className="h-8 w-8 hover:bg-secondary/50">
                      <Camera className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}

                <Tabs value={deviceMode} onValueChange={(v) => setDeviceMode(v as any)} className="bg-secondary/50 p-0.5 rounded-lg border border-border">
                  <TabsList className="bg-transparent h-8 p-0">
                    <TabsTrigger value="desktop" className="h-7 w-8 p-0"><Monitor className="w-3.5 h-3.5" /></TabsTrigger>
                    <TabsTrigger value="mobile" className="h-7 w-8 p-0"><Smartphone className="w-3.5 h-3.5" /></TabsTrigger>
                  </TabsList>
                </Tabs>

                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="bg-secondary/50 p-0.5 rounded-lg border border-border">
                  <TabsList className="bg-transparent h-8 p-0">
                    <TabsTrigger value="preview" className="h-7 px-3 text-[10px] font-bold uppercase">View</TabsTrigger>
                    <TabsTrigger value="code" className="h-7 px-3 text-[10px] font-bold uppercase">Code</TabsTrigger>
                    <TabsTrigger value="analysis" className="h-7 px-3 text-[10px] font-bold uppercase">Audit</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <Separator orientation="vertical" className="h-4 bg-border/50" />
                <ModeToggle />
                <Button variant="ghost" size="icon" onClick={() => setIsDrawerOpen(true)} className="h-9 w-9 rounded-lg border border-border">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Workspace Area */}
            <div className="flex-1 w-full p-8 flex items-center justify-center relative overflow-hidden">
              {!generatedHtml && !activeGen?.isGenerating && viewMode !== 'analysis' ? (
                <div className="text-center max-w-sm animate-in fade-in zoom-in-95 duration-1000">
                  <div className="w-20 h-20 bg-secondary/30 border border-border rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl backdrop-blur-3xl">
                    <Sparkles className="w-10 h-10 text-muted-foreground/40" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3 tracking-tight">Studio is ready.</h2>
                  <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-widest leading-loose">
                    Describe your vision or drop a reference image to begin the generation sequence.
                  </p>
                </div>
              ) : activeGen?.isGenerating ? (
                <div className="flex flex-col items-center gap-8">
                  <div className="relative">
                    <div className="w-24 h-24 border-2 border-border border-t-primary rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
                    </div>
                  </div>
                  <div className="text-center space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground/80">
                      {isAnalyzingImagesForPrompt ? 'Analyzing Context' : 'Synthesizing UI'}
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-mono animate-pulse">
                      {streamingCode ? 'FINALIZING BUNDLE...' : 'PROCESSING MODEL OUTPUT...'}
                    </p>
                  </div>
                </div>
              ) : viewMode === 'analysis' ? (
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
                        <p className="text-[10px] font-bold uppercase tracking-widest">No context analyzed yet</p>
                      </div>
                    )}
                  </div>
                </Card>
              ) : viewMode === 'preview' ? (
                <div className={`transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${deviceMode === 'mobile' ? 'w-[375px] h-[812px]' : 'w-full h-full'} bg-white rounded-[2rem] shadow-[0_80px_160px_-20px_rgba(0,0,0,0.8)] overflow-hidden border border-white/10 ring-1 ring-white/5`}>
                  <iframe ref={iframeRef} title="Preview" className="w-full h-full bg-white" sandbox="allow-scripts allow-same-origin" />
                </div>
              ) : (
                <Card className="w-full h-full max-w-5xl glass-panel border-none shadow-2xl overflow-hidden flex flex-col rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center px-6 py-3 bg-secondary/20 border-b border-border/50 justify-between">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-destructive/20 border border-destructive/40"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40"></div>
                    </div>
                    <span className="text-[9px] font-mono text-muted-foreground font-bold tracking-widest uppercase">Artifact Source</span>
                  </div>
                  <div className="flex-1 overflow-auto p-8 custom-scrollbar bg-black/40">
                    <pre className="text-[11px] font-mono text-emerald-500/90 leading-relaxed">
                      <code>{generatedHtml || streamingCode}</code>
                    </pre>
                  </div>
                </Card>
              )}
            </div>
          </main>

          <SideDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Engine Config">
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
          </SideDrawer>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
