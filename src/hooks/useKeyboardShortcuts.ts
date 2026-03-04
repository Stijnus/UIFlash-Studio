import { useEffect } from "react";
import { useApp } from "@/contexts/AppContext";

export function useKeyboardShortcuts() {
  const {
    handleGenerate,
    handleIterate,
    copyCode,
    setViewMode,
    isGenerating,
    prompt,
    images,
  } = useApp();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Meta (Cmd) on Mac or Control on others
      const isMod = e.metaKey || e.ctrlKey;
      const isShift = e.shiftKey;

      // Cmd+Enter: Generate UI
      if (isMod && e.key === "Enter" && !isShift) {
        if (!isGenerating && (prompt || images.length > 0)) {
          e.preventDefault();
          handleGenerate();
        }
      }

      // Cmd+Shift+Enter: Iterate
      if (isMod && isShift && e.key === "Enter") {
        if (!isGenerating) {
          e.preventDefault();
          handleIterate();
        }
      }

      // Cmd+Shift+C: Copy Code
      if (isMod && isShift && e.key === "c") {
        e.preventDefault();
        copyCode();
      }

      // View Mode Switches
      if (isMod && e.key === "1") {
        e.preventDefault();
        setViewMode("preview");
      }
      if (isMod && e.key === "2") {
        e.preventDefault();
        setViewMode("code");
      }
      if (isMod && e.key === "3") {
        e.preventDefault();
        setViewMode("analysis");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handleGenerate,
    handleIterate,
    copyCode,
    setViewMode,
    isGenerating,
    prompt,
    images.length,
  ]);
}
