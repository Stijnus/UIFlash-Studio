import { useState } from "react";
import { UploadedImage } from "@/types";
import { generateImageAsset } from "@/services/geminiService";

export function useAssetLab(
  setImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>,
  imagesCount: number,
) {
  const [assetPrompt, setAssetPrompt] = useState("");
  const [isGeneratingAsset, setIsGeneratingAsset] = useState(false);
  const [generatedAsset, setGeneratedAsset] = useState<UploadedImage | null>(
    null,
  );

  const handleGenerateAsset = async () => {
    if (!assetPrompt) return;
    setIsGeneratingAsset(true);
    try {
      const asset = await generateImageAsset(assetPrompt);
      if (asset && asset.data && asset.mimeType) {
        setGeneratedAsset({
          id: crypto.randomUUID(),
          data: asset.data,
          mimeType: asset.mimeType,
          url: asset.url,
        });
      }
    } catch (err: any) {
      throw err;
    } finally {
      setIsGeneratingAsset(false);
    }
  };

  const addAssetToReferences = () => {
    if (generatedAsset && imagesCount < 3) {
      setImages((prev) => [...prev, generatedAsset]);
      setGeneratedAsset(null);
      setAssetPrompt("");
    }
  };

  return {
    assetPrompt,
    setAssetPrompt,
    isGeneratingAsset,
    generatedAsset,
    handleGenerateAsset,
    addAssetToReferences,
  };
}
