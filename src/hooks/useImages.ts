import { useState, useCallback, useRef, useEffect } from "react";
import { UploadedImage } from "@/types";
import { saveImageToDB } from "@/utils/imageDb";

export function useImages() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    (files: FileList | File[]) => {
      const remainingSlots = 3 - images.length;
      if (remainingSlots <= 0) return;
      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      filesToProcess.forEach((file) => {
        if (!file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = async (event) => {
          if (event.target?.result) {
            const base64Data = (event.target.result as string).split(",")[1];
            const mimeType = file.type;
            const url = event.target!.result as string;
            const id = crypto.randomUUID();

            try {
              await saveImageToDB(id, base64Data);
              setImages((prev) => {
                if (prev.length >= 3) return prev;
                return [
                  ...prev,
                  {
                    id,
                    mimeType,
                    url,
                    data: base64Data, // Keep in memory for current session
                  },
                ];
              });
            } catch (err) {
              console.error("Failed to save image to IndexedDB:", err);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    },
    [images.length],
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    processFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
    if (files && files.length > 0) processFiles(files);
  };

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          if (blob) imageFiles.push(blob);
        }
      }
      if (imageFiles.length > 0) processFiles(imageFiles);
    },
    [processFiles],
  );

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    images,
    setImages,
    isDragging,
    setIsDragging,
    fileInputRef,
    handleImageUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removeImage,
  };
}
