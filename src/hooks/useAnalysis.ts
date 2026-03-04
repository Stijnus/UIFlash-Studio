import { useState } from "react";
import { UploadedImage } from "@/types";
import { analyzeImageForFeedback } from "@/services/geminiService";

export function useAnalysis(images: UploadedImage[]) {
  const [analysisResult, setAnalysisResult] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyzeImage = async (
    setViewMode: (mode: "preview" | "code" | "analysis") => void,
  ) => {
    if (images.length === 0) return;
    setIsAnalyzing(true);
    setAnalysisResult("");
    setViewMode("analysis");
    try {
      const generator = analyzeImageForFeedback(
        images as { data: string; mimeType: string }[],
      );
      for await (const chunk of generator) {
        setAnalysisResult((prev) => prev + chunk);
      }
    } catch (err: any) {
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analysisResult,
    isAnalyzing,
    handleAnalyzeImage,
  };
}
