import React, { createContext, useContext, useState } from "react";
import { useSessions } from "@/hooks/useSessions";
import { useImages } from "@/hooks/useImages";
import { useGenerations } from "@/hooks/useGenerations";
import { useAssetLab } from "@/hooks/useAssetLab";
import { useAnalysis } from "@/hooks/useAnalysis";
import { VARIATION_PACKS, DEVICE_PRESETS } from "@/constants";
import { Session, Generation, UploadedImage } from "@/types";
import { analyzeImages } from "@/services/geminiService";
import { MODELS } from "@/constants";

interface AppContextType {
  // Session State
  sessions: Session[];
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;
  loadSession: (session: Session) => void;
  createNewSession: () => void;
  deleteSession: (id: string, e: React.MouseEvent) => void;
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;

  // UI State
  sidebarTab: "controls" | "history";
  setSidebarTab: (tab: "controls" | "history") => void;
  prompt: string;
  setPrompt: (p: string) => void;
  viewMode: "preview" | "code" | "analysis";
  setViewMode: (mode: "preview" | "code" | "analysis") => void;
  deviceMode: "desktop" | "mobile" | "tablet";
  setDeviceMode: (mode: "desktop" | "mobile" | "tablet") => void;
  model: string;
  setModel: (m: string) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (o: boolean) => void;
  error: string;
  setError: (e: string) => void;

  // Image State
  images: UploadedImage[];
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  removeImage: (idx: number) => void;

  // Generation State
  generations: Generation[];
  activeGenId: string;
  setActiveGenId: (id: string) => void;
  activeGen: Generation | undefined;
  activeSession: Session | undefined;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  isGenerating: boolean;
  isAnalyzingImagesForPrompt: boolean;
  handleGenerate: () => void;
  handleIterate: () => void;
  selectedVariationPack: string;
  setSelectedVariationPack: (id: string) => void;
  handleGenerateVariations: () => void;

  // Asset State
  assetPrompt: string;
  setAssetPrompt: (p: string) => void;
  isGeneratingAsset: boolean;
  generatedAsset: UploadedImage | null;
  handleGenerateAsset: () => void;
  addAssetToReferences: () => void;

  // Analysis State
  analysisResult: string;
  isAnalyzing: boolean;
  handleAnalyzeImage: () => void;

  // Helpers
  copyCode: () => void;
  downloadCode: () => void;
  downloadImage: () => void;
  copied: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [sidebarTab, setSidebarTab] = useState<"controls" | "history">(
    "controls",
  );
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"preview" | "code" | "analysis">(
    "preview",
  );
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile" | "tablet">(
    "desktop",
  );
  const [model, setModel] = useState<string>(MODELS.FLASH);
  const [copied, setCopied] = useState(false);
  const [isAnalyzingImagesForPrompt, setIsAnalyzingImagesForPrompt] =
    useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedVariationPack, setSelectedVariationPack] = useState(
    VARIATION_PACKS[0].id,
  );

  const {
    sessions,
    setSessions,
    activeSessionId,
    setActiveSessionId,
    deleteSession,
  } = useSessions();
  const {
    images,
    setImages,
    isDragging,
    fileInputRef,
    handleImageUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removeImage,
  } = useImages();
  const {
    generations,
    setGenerations,
    activeGenId,
    setActiveGenId,
    activeGen,
    iframeRef,
    runGeneration,
  } = useGenerations(model, images, deviceMode);
  const {
    assetPrompt,
    setAssetPrompt,
    isGeneratingAsset,
    generatedAsset,
    handleGenerateAsset,
    addAssetToReferences,
  } = useAssetLab(setImages, images.length);
  const {
    analysisResult,
    isAnalyzing,
    handleAnalyzeImage: innerHandleAnalyzeImage,
  } = useAnalysis(images);

  const loadSession = async (session: Session) => {
    setActiveSessionId(session.id);
    setPrompt(session.prompt);

    // Hydrate images from IndexedDB
    const { getImageFromDB } = await import("@/utils/imageDb");
    const hydratedImages: UploadedImage[] = [];

    if (session.images) {
      const { saveImageToDB } = await import("@/utils/imageDb");
      const updatedImages = [...session.images];
      let needsStateUpdate = false;

      for (let i = 0; i < updatedImages.length; i++) {
        const img = updatedImages[i];
        if (img.id) {
          const data = await getImageFromDB(img.id);
          if (data) {
            hydratedImages.push({
              ...img,
              data,
              url: `data:${img.mimeType};base64,${data}`,
            });
          }
        } else if (img.data) {
          // Migration path: legacy image found in localStorage
          const id = crypto.randomUUID();
          await saveImageToDB(id, img.data);
          const newImg = {
            ...img,
            id,
            url: `data:${img.mimeType};base64,${img.data}`,
          };
          hydratedImages.push(newImg);
          updatedImages[i] = newImg;
          needsStateUpdate = true;
        }
      }

      // If we migrated images, update the session in the main sessions list
      if (needsStateUpdate) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === session.id ? { ...s, images: updatedImages } : s,
          ),
        );
      }
    }

    setImages(hydratedImages);
    setGenerations(
      session.artifacts.map((art) => ({
        ...art,
        streamingCode: "",
        isGenerating: false,
        streamingProgress: 0,
      })),
    );
    if (session.artifacts.length > 0) setActiveGenId(session.artifacts[0].id);
    setSidebarTab("controls");
    setViewMode("preview");
  };

  const createNewSession = () => {
    setActiveSessionId(null);
    setPrompt("");
    setImages([]);
    setGenerations([]);
    setActiveGenId("");
    setError("");
  };

  const copyCode = () => {
    navigator.clipboard.writeText(activeGen?.html || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const styleName = (activeGen?.styleName || "ui")
      .toLowerCase()
      .replace(/\s+/g, "-");
    const blob = new Blob([activeGen?.html || ""], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${styleName}-${deviceMode}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadImage = async () => {
    try {
      let iframe = iframeRef.current;

      // Fallback: If iframeRef is null (common in grid view or when switched quickly),
      // try to find the iframe specifically for the active generation
      if (!iframe || !iframe.contentDocument) {
        const allIframes = document.querySelectorAll("iframe");
        for (const f of Array.from(allIframes)) {
          // Check title or srcDoc to match activeGen
          if (
            f.title === activeGenId ||
            f.title === "Preview" ||
            f.title === activeGen?.styleName
          ) {
            iframe = f as HTMLIFrameElement;
            break;
          }
        }
      }

      if (!iframe || !iframe.contentDocument) {
        throw new Error(
          "Preview window not found. Try selecting the design again.",
        );
      }

      const styleName = (activeGen?.styleName || "design")
        .toLowerCase()
        .replace(/\s+/g, "-");

      const html2canvas = (await import("html2canvas")).default;

      // We capture the body of the iframe
      const canvas = await html2canvas(iframe.contentDocument.body, {
        useCORS: true,
        allowTaint: true,
        scale: DEVICE_PRESETS[deviceMode].scale || 2,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const url = canvas.toDataURL("image/png", 1.0);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${styleName}-${deviceMode}-preview.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      console.error("Screenshot failed", err);
      setError(`Export failed: ${err.message}`);
    }
  };

  const handleGenerate = async (
    customPrompt?: string,
    isIteration: boolean = false,
  ) => {
    if (!prompt && images.length === 0 && !customPrompt) {
      setError("Please provide a prompt or an image.");
      return;
    }
    setIsGenerating(true);
    setError("");
    setViewMode("preview");

    const newGenId = crypto.randomUUID();
    const newGen: Generation = {
      id: newGenId,
      styleName: "Custom",
      html: "",
      streamingCode: "",
      isGenerating: true,
      streamingProgress: 0,
    };
    setGenerations((prev) => [...prev, newGen]);

    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
      const newSession: Session = {
        id: crypto.randomUUID(),
        prompt: prompt,
        timestamp: Date.now(),
        artifacts: [],
        images: images.map((img) => ({
          id: img.id,
          data: img.data,
          mimeType: img.mimeType,
          url: img.url,
        })),
      };
      setSessions((prev) => [newSession, ...prev]);
      currentSessionId = newSession.id;
      setActiveSessionId(currentSessionId);
    }
    setActiveGenId(newGenId);

    try {
      let finalPrompt = prompt;
      if (!prompt && images.length > 0) {
        setIsAnalyzingImagesForPrompt(true);
        finalPrompt = await analyzeImages(
          images as { data: string; mimeType: string }[],
        );
        setPrompt(finalPrompt);
        setIsAnalyzingImagesForPrompt(false);
      }
      const targetPrompt = customPrompt || finalPrompt;
      const previousHtml =
        isIteration && activeGen ? activeGen.html : undefined;
      // runGeneration returns the parsed result; update session atomically
      const result = await runGeneration(newGenId, targetPrompt, previousHtml);
      const sid = currentSessionId!;
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== sid) return s;
          // Avoid duplicates if somehow already added
          const alreadyHas = s.artifacts.some((a) => a.id === newGenId);
          if (alreadyHas) return s;
          return {
            ...s,
            artifacts: [
              ...s.artifacts,
              {
                id: newGenId,
                styleName: result.styleName,
                html: result.html,
                status: "complete" as const,
                modelName: result.modelName,
                usage: result.usage,
              },
            ],
          };
        }),
      );
    } catch (err: any) {
      setError(err.message || "An error occurred during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleIterate = () => handleGenerate(undefined, true);

  const handleGenerateVariations = async () => {
    if (!prompt && images.length === 0) {
      setError("Please provide a prompt or an image.");
      return;
    }
    setIsGenerating(true);
    setError("");
    setViewMode("preview");
    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
      const newSession: Session = {
        id: crypto.randomUUID(),
        prompt: prompt,
        timestamp: Date.now(),
        artifacts: [],
        images: images.map((img) => ({
          id: img.id,
          data: img.data,
          mimeType: img.mimeType,
          url: img.url,
        })),
      };
      setSessions((prev) => [newSession, ...prev]);
      currentSessionId = newSession.id;
      setActiveSessionId(currentSessionId);
    }
    const pack =
      VARIATION_PACKS.find((p) => p.id === selectedVariationPack) ||
      VARIATION_PACKS[0];
    const newGenerations: Generation[] = pack.styles.map((style) => ({
      id: crypto.randomUUID(),
      styleName: style.name,
      html: "",
      streamingCode: "",
      isGenerating: true,
      streamingProgress: 0,
    }));
    setGenerations((prev) => [...prev, ...newGenerations]);
    setActiveGenId(newGenerations[0].id);
    try {
      let finalPrompt = prompt;
      if (!prompt && images.length > 0) {
        setIsAnalyzingImagesForPrompt(true);
        finalPrompt = await analyzeImages(
          images as { data: string; mimeType: string }[],
        );
        setPrompt(finalPrompt);
        setIsAnalyzingImagesForPrompt(false);
      }
      // Run all variations in parallel and collect results
      const settledResults = await Promise.allSettled(
        newGenerations.map((gen, i) => {
          const style = pack.styles[i];
          const variationPrompt = `Design the following UI: "${finalPrompt}". Strictly follow style: ${style.name} (${style.desc})`;
          return runGeneration(
            gen.id,
            variationPrompt,
            undefined,
            style.name,
          ).then((result) => ({ id: gen.id, ...result }));
        }),
      );

      // Collect only fulfilled results to add to the session
      const successfulResults = settledResults
        .filter(
          (
            r,
          ): r is PromiseFulfilledResult<{
            id: string;
            styleName: string;
            html: string;
            modelName: string;
            usage?: any;
          }> => r.status === "fulfilled",
        )
        .map((r) => r.value);

      // Handle individual failures in the generations state (optional, they already show as error on the card if runGeneration handled it)
      const failedCount = settledResults.length - successfulResults.length;
      if (failedCount > 0) {
        console.warn(`${failedCount} variations failed to generate.`);
      }

      // Atomically add all variation artifacts to the session (fixes race condition)
      const sid = currentSessionId!;
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== sid) return s;
          const existingIds = new Set(s.artifacts.map((a) => a.id));
          const newArtifacts = successfulResults
            .filter((r) => !existingIds.has(r.id))
            .map((r) => ({
              id: r.id,
              styleName: r.styleName,
              html: r.html,
              status: "complete" as const,
              modelName: r.modelName,
              usage: r.usage,
            }));
          return { ...s, artifacts: [...s.artifacts, ...newArtifacts] };
        }),
      );
    } catch (err: any) {
      setError(err.message || "An error occurred during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  const value = {
    sessions,
    activeSessionId,
    setActiveSessionId,
    loadSession,
    createNewSession,
    deleteSession,
    setSessions,
    activeGenId,
    setActiveGenId,
    sidebarTab,
    setSidebarTab,
    prompt,
    setPrompt,
    viewMode,
    setViewMode,
    deviceMode,
    setDeviceMode,
    model,
    setModel,
    isDrawerOpen,
    setIsDrawerOpen,
    error,
    setError,
    images,
    isDragging,
    fileInputRef,
    handleImageUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removeImage,
    generations,
    activeGen,
    activeSession,
    iframeRef,
    isGenerating,
    isAnalyzingImagesForPrompt,
    handleGenerate: () => handleGenerate(),
    handleIterate,
    selectedVariationPack,
    setSelectedVariationPack,
    handleGenerateVariations,
    assetPrompt,
    setAssetPrompt,
    isGeneratingAsset,
    generatedAsset,
    handleGenerateAsset,
    addAssetToReferences,
    analysisResult,
    isAnalyzing,
    handleAnalyzeImage: () => innerHandleAnalyzeImage(setViewMode),
    copyCode,
    downloadCode,
    downloadImage,
    copied,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
