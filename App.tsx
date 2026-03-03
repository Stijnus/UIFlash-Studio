import React, { useState, useRef, useEffect } from 'react';
import { generateUI, analyzeImages, analyzeImageForFeedback } from './src/services/geminiService';
import SideDrawer from './components/SideDrawer';
import { Settings, Image as ImageIcon, Code, Play, Smartphone, Monitor, Trash2, Layers, Loader2, Download, Copy, Check, Search, Camera } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { VARIATION_PACKS } from './constants';

export default function App() {
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

  const [generations, setGenerations] = useState<{
    id: string;
    styleName: string;
    html: string;
    streamingCode: string;
    isGenerating: boolean;
  }[]>([]);
  const [activeGenId, setActiveGenId] = useState<string>('');

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
    // Reset input value so the same file can be uploaded again if removed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
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

      if (imageFiles.length > 0) {
        processFiles(imageFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [images.length]);

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const runGeneration = async (genId: string, promptText: string, previousHtml?: string) => {
    try {
      const generator = generateUI(promptText, model, images, previousHtml, deviceMode);
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
                return { ...g, styleName: chunk.styleName || g.styleName, html: chunk.html || '' };
              }
            }
          }
          return g;
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

    if (isIteration) {
      setGenerations(prev => [...prev, newGen]);
    } else {
      setGenerations([newGen]);
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
      await runGeneration(newGenId, targetPrompt, previousHtml);
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
        const variationPrompt = `Design the following UI: "${finalPrompt}". 
        
        CRITICAL INSTRUCTION: You must strictly follow this specific aesthetic style:
        Style Name: ${style.name}
        Description: ${style.desc}
        
        Ensure the UI is fully functional, uses Tailwind CSS, and perfectly embodies the requested aesthetic.`;
        
        await runGeneration(gen.id, variationPrompt);
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
      for await (const chunk of generator) {
        setAnalysisResult(prev => prev + chunk);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setIsAnalyzing(false);
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
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      {/* Left Sidebar - Controls */}
      <div className="w-80 border-r border-zinc-800 bg-zinc-900/50 flex flex-col h-full backdrop-blur-xl z-10">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Code className="w-4 h-4 text-white" />
            </div>
            <h1 className="font-semibold tracking-tight text-lg">UI Generator</h1>
          </div>
          <button onClick={() => setIsDrawerOpen(true)} className="p-2 hover:bg-zinc-800 rounded-md transition-colors text-zinc-400 hover:text-zinc-100">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Describe your UI</label>
              <button 
                onClick={() => setPrompt('')}
                className="text-[10px] font-bold text-zinc-600 hover:text-zinc-400 uppercase tracking-widest transition-colors"
                disabled={!prompt}
              >
                Clear
              </button>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., A modern SaaS dashboard with a sidebar, header, and a grid of metric cards. Use glassmorphism."
              className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none resize-none transition-all placeholder:text-zinc-600"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Reference Images</label>
              <span className="text-xs text-zinc-600">{images.length}/3</span>
            </div>
            
            <div 
              className={`grid grid-cols-2 gap-3 p-1 rounded-xl transition-all ${isDragging ? 'bg-indigo-500/10 ring-2 ring-indigo-500 ring-dashed' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {images.map((img, idx) => (
                <div key={idx} className="relative group aspect-video rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950">
                  <img src={img.url} alt="Reference" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  <button 
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 p-1.5 bg-black/60 hover:bg-red-500/80 text-white rounded-md backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              {images.length < 3 && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className={`aspect-video rounded-lg border border-dashed flex flex-col items-center justify-center gap-2 transition-all ${
                    isDragging 
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' 
                      : 'border-zinc-700 hover:border-indigo-500 hover:bg-indigo-500/5 text-zinc-500 hover:text-indigo-400'
                  }`}
                >
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-xs font-medium">{isDragging ? 'Drop here' : 'Add Image'}</span>
                </button>
              )}
            </div>
            {images.length > 0 && (
              <button 
                onClick={handleAnalyzeImage}
                disabled={isAnalyzing}
                className="w-full py-2 px-3 mt-2 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-700/50 disabled:bg-zinc-900 disabled:text-zinc-600 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all"
              >
                {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Image for Feedback'}</span>
              </button>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              multiple 
              className="hidden" 
            />
          </div>
        </div>

        <div className="p-6 border-t border-zinc-800 bg-zinc-900/80 backdrop-blur-md flex flex-col gap-3">
          {activeGen?.html ? (
            <div className="flex gap-2">
              <button
                onClick={handleIterate}
                disabled={isGenerating || (!prompt && images.length === 0)}
                className="flex-1 py-3 px-4 bg-indigo-500 text-white hover:bg-indigo-600 disabled:bg-zinc-800 disabled:text-zinc-500 rounded-xl font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/20"
              >
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Play className="w-5 h-5 fill-current" />
                )}
                <span>Iterate</span>
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || (!prompt && images.length === 0)}
                className="flex-1 py-3 px-4 bg-white text-black hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-500 rounded-xl font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-white/5"
              >
                <span>New UI</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={isGenerating || (!prompt && images.length === 0)}
              className="w-full py-3 px-4 bg-white text-black hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-500 rounded-xl font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-white/5"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>Generate UI</span>
                </>
              )}
            </button>
          )}
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
               <label className="text-xs font-medium text-zinc-400">Variations Style Pack</label>
            </div>
            <select
              value={selectedVariationPack}
              onChange={(e) => setSelectedVariationPack(e.target.value)}
              disabled={isGenerating}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none text-zinc-300"
            >
              {VARIATION_PACKS.map(pack => (
                <option key={pack.id} value={pack.id}>{pack.name} ({pack.styles.map(s => s.name.split(' ')[0]).join('/')})</option>
              ))}
            </select>
            <button
              onClick={handleGenerateVariations}
              disabled={isGenerating || (!prompt && images.length === 0)}
              className="w-full py-3 px-4 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-700/50 disabled:bg-zinc-900 disabled:text-zinc-600 rounded-xl font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Layers className="w-4 h-4" />
              <span>Generate 3 Variations</span>
            </button>
          </div>

          {error && (
            <div className="mt-1 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-start gap-2">
              <span className="mt-0.5">⚠️</span>
              <p className="leading-relaxed">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Preview/Code */}
      <div className="flex-1 flex flex-col bg-zinc-950 relative">
        {/* Top Bar */}
        <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/30 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            {styleName && (
              <div className="px-3 py-1 bg-zinc-800/50 border border-zinc-700/50 rounded-full text-sm font-medium text-zinc-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {styleName}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {generatedHtml && (
              <div className="flex items-center gap-2 mr-4 border-r border-zinc-800 pr-4">
                <button onClick={copyCode} className="p-2 hover:bg-zinc-800 rounded-md transition-colors text-zinc-400 hover:text-zinc-100 tooltip-trigger" title="Copy Code">
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <button onClick={downloadCode} className="p-2 hover:bg-zinc-800 rounded-md transition-colors text-zinc-400 hover:text-zinc-100 tooltip-trigger" title="Download HTML">
                  <Download className="w-4 h-4" />
                </button>
                <button onClick={downloadImage} className="p-2 hover:bg-zinc-800 rounded-md transition-colors text-zinc-400 hover:text-zinc-100 tooltip-trigger" title="Export as Image">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
              <button
                onClick={() => setDeviceMode('desktop')}
                className={`p-1.5 rounded-md transition-all ${deviceMode === 'desktop' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeviceMode('mobile')}
                className={`p-1.5 rounded-md transition-all ${deviceMode === 'mobile' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'preview' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Preview
              </button>
              <button
                onClick={() => setViewMode('code')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'code' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Code
              </button>
              <button
                onClick={() => setViewMode('analysis')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'analysis' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Analysis
              </button>
            </div>
          </div>
        </div>

        {/* Tabs for Variations */}
        {generations.length > 1 && (
          <div className="flex items-center gap-2 px-6 py-2 bg-zinc-900/50 border-b border-zinc-800 overflow-x-auto">
            {generations.map((gen, idx) => (
              <button
                key={gen.id}
                onClick={() => setActiveGenId(gen.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeGenId === gen.id 
                    ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'
                }`}
              >
                {gen.isGenerating && <Loader2 className="w-3 h-3 animate-spin" />}
                Gen {idx + 1}: {gen.styleName}
              </button>
            ))}
          </div>
        )}

        {/* Workspace */}
        <div className="flex-1 overflow-hidden relative flex items-center justify-center p-6 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat opacity-[0.99]">
          {!generatedHtml && !activeGen?.isGenerating && viewMode !== 'analysis' ? (
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <Code className="w-8 h-8 text-zinc-600" />
              </div>
              <h2 className="text-2xl font-semibold mb-3 text-zinc-200">Ready to build</h2>
              <p className="text-zinc-500 leading-relaxed">
                Describe the UI you want to create, or upload a reference image. The AI will generate a complete, responsive HTML file with Tailwind CSS.
              </p>
            </div>
          ) : activeGen?.isGenerating ? (
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-zinc-800 border-t-indigo-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-indigo-500/20 rounded-full blur-xl"></div>
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-medium text-zinc-200">
                  {isAnalyzingImagesForPrompt 
                    ? 'Analyzing reference images...' 
                    : streamingCode 
                      ? 'Finalizing design...' 
                      : 'Crafting your design...'}
                </h3>
                <p className="text-sm text-zinc-500 animate-pulse">
                  {isAnalyzingImagesForPrompt 
                    ? 'Understanding your visual style' 
                    : streamingCode 
                      ? 'Parsing JSON response' 
                      : 'Writing HTML & Tailwind classes'}
                </p>
              </div>
            </div>
          ) : viewMode === 'analysis' ? (
            <div className="w-full h-full bg-[#0d1117] rounded-xl border border-zinc-800 overflow-hidden flex flex-col shadow-2xl">
              <div className="flex items-center px-6 py-4 border-b border-zinc-800 bg-[#161b22]">
                <h3 className="text-lg font-medium text-zinc-200 flex items-center gap-2">
                  <Search className="w-5 h-5 text-indigo-400" />
                  Design Analysis & Feedback
                </h3>
              </div>
              <div className="flex-1 overflow-auto p-8 custom-scrollbar">
                {isAnalyzing && !analysisResult ? (
                  <div className="flex flex-col items-center justify-center h-full gap-6">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-zinc-800 border-t-indigo-500 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Search className="w-6 h-6 text-indigo-400 animate-pulse" />
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-lg font-medium text-zinc-200">AI is reviewing your design</h3>
                      <p className="text-sm text-zinc-500 animate-pulse">Scanning layout, typography, and color harmony...</p>
                    </div>
                  </div>
                ) : analysisResult ? (
                  <div className="prose prose-invert prose-indigo max-w-none">
                    <ReactMarkdown>{analysisResult}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                    <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                    <p>Upload an image and click "Analyze Image" to get feedback.</p>
                  </div>
                )}
              </div>
            </div>
          ) : viewMode === 'preview' ? (
            <div className={`transition-all duration-500 ease-in-out ${deviceMode === 'mobile' ? 'w-[375px] h-[812px]' : 'w-full h-full'} bg-white rounded-xl shadow-2xl overflow-hidden border border-zinc-800/50 ring-1 ring-white/10`}>
              <iframe
                ref={iframeRef}
                title="Preview"
                className="w-full h-full bg-white"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          ) : (
            <div className="w-full h-full bg-[#0d1117] rounded-xl border border-zinc-800 overflow-hidden flex flex-col shadow-2xl">
              <div className="flex items-center px-4 py-2 bg-[#161b22] border-b border-zinc-800">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                </div>
                <span className="ml-4 text-xs font-mono text-zinc-500">index.html</span>
              </div>
              <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                <pre className="text-sm font-mono text-zinc-300 leading-relaxed">
                  <code>{generatedHtml || streamingCode}</code>
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Drawer */}
      <SideDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Settings">
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-400">AI Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none"
            >
              <option value="gemini-3-flash-preview">Gemini 3 Flash (Fast)</option>
              <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Advanced)</option>
            </select>
            <p className="text-xs text-zinc-500">Pro model is better at complex layouts but takes longer to generate.</p>
          </div>
        </div>
      </SideDrawer>
    </div>
  );
}
