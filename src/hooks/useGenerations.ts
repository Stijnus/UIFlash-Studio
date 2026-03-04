import { useState, useRef } from "react";
import { Generation, UploadedImage, UsageMetadata } from "@/types";
import { generateUI, parseGeneratedResponse } from "@/services/geminiService";

export function useGenerations(
  model: string,
  images: UploadedImage[],
  deviceMode: "desktop" | "mobile" | "tablet",
) {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [activeGenId, setActiveGenId] = useState<string>("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activeGen = generations.find((g) => g.id === activeGenId);

  /**
   * Run a single generation. Returns the final { styleName, html } once complete.
   * Callers are responsible for updating the session/artifacts (to avoid race conditions
   * when multiple generations run in parallel via Promise.all).
   */
  const runGeneration = async (
    id: string,
    prompt: string,
    previousHtml?: string,
    styleNameHint?: string,
  ): Promise<{
    styleName: string;
    html: string;
    modelName?: string;
    usage?: UsageMetadata;
  }> => {
    const generator = generateUI(
      prompt,
      model,
      images,
      previousHtml,
      deviceMode,
    );

    // Accumulate text deltas into a raw buffer
    let rawBuffer = "";
    let capturedUsage: UsageMetadata | undefined = undefined;
    const ESTIMATED_TOTAL_BYTES = 18_000;

    for await (const chunk of generator) {
      if (typeof chunk === "string") {
        rawBuffer += chunk;

        const rawProgress = Math.min(
          (rawBuffer.length / ESTIMATED_TOTAL_BYTES) * 100,
          95,
        );

        setGenerations((prev) =>
          prev.map((g) =>
            g.id === id
              ? {
                  ...g,
                  streamingCode: rawBuffer,
                  streamingProgress: Math.round(rawProgress),
                }
              : g,
          ),
        );
      } else if (chunk && typeof chunk === "object" && chunk.type === "usage") {
        capturedUsage = chunk.metadata as UsageMetadata;
        setGenerations((prev) =>
          prev.map((g) =>
            g.id === id
              ? {
                  ...g,
                  usage: capturedUsage,
                }
              : g,
          ),
        );
      }
    }

    console.debug("[UIFlash] runGeneration capturedUsage:", capturedUsage);

    // Stream complete — parse the accumulated JSON response to extract HTML
    const parsed = parseGeneratedResponse(rawBuffer);
    const finalStyleName = styleNameHint || parsed.styleName || "Custom";

    setGenerations((prev) =>
      prev.map((g) =>
        g.id === id
          ? {
              ...g,
              html: parsed.html,
              styleName: finalStyleName,
              streamingCode: "",
              isGenerating: false,
              streamingProgress: 100,
              modelName: model,
              // Explicitly carry usage so it is never overwritten by async batching
              usage: capturedUsage ?? g.usage,
            }
          : g,
      ),
    );

    return {
      styleName: finalStyleName,
      html: parsed.html,
      modelName: model,
      usage: capturedUsage,
    };
  };

  return {
    generations,
    setGenerations,
    activeGenId,
    setActiveGenId,
    activeGen,
    iframeRef,
    runGeneration,
  };
}
