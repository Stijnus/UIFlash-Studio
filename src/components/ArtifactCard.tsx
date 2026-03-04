import React, { useEffect, useRef, useState } from "react";
import { Artifact, Generation } from "@/types";
import { XIcon } from "./Icons";
import { Maximize2, Info, Activity } from "lucide-react";
import { calculateCost, formatCost } from "@/utils/pricing";

interface ArtifactCardProps {
  artifact: Artifact | Generation;
  isFocused: boolean;
  onClick: () => void;
  onClose?: (e: React.MouseEvent) => void;
  onOpen?: () => void;
}

export const ArtifactCard = React.memo(
  ({ artifact, isFocused, onClick, onClose, onOpen }: ArtifactCardProps) => {
    const codeRef = useRef<HTMLPreElement>(null);
    const [showStats, setShowStats] = useState(false);

    // Auto-scroll logic for this specific card
    useEffect(() => {
      if (codeRef.current && artifact.isGenerating) {
        codeRef.current.scrollTop = codeRef.current.scrollHeight;
      }
    }, [artifact.streamingCode, artifact.isGenerating]);

    return (
      <div
        className={`artifact-card group ${isFocused ? "focused" : ""} ${artifact.isGenerating ? "generating" : ""}`}
        onClick={onClick}
      >
        {isFocused && onClose && (
          <button
            className="artifact-close-button"
            onClick={(e) => {
              e.stopPropagation();
              onClose(e);
            }}
            title="Close design"
          >
            <XIcon size={12} />
          </button>
        )}
        <div className="artifact-header">
          <div className="artifact-meta">
            <span className="artifact-style-tag">
              {artifact.styleName || "Variant"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {artifact.isGenerating && (
              <div className="streaming-indicator">
                <span className="dot"></span>
                Streaming
              </div>
            )}
            {!artifact.isGenerating && (
              <>
                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowStats(!showStats);
                  }}
                  title="View AI Stats"
                >
                  <Info size={12} />
                </button>
                {onOpen && (
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpen();
                    }}
                    title="Open full preview"
                  >
                    <Maximize2 size={12} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        <div className="artifact-card-inner relative">
          {showStats && !artifact.isGenerating && (
            <div
              className="absolute inset-x-2 top-2 z-10 p-4 bg-background/95 backdrop-blur-md rounded-xl border shadow-xl flex flex-col gap-3 text-sm animate-in fade-in slide-in-from-top-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b">
                <span className="font-semibold flex items-center gap-2">
                  <Activity size={14} className="text-primary" /> Generation
                  Stats
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowStats(false);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <XIcon size={12} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-muted-foreground">Model</div>
                <div className="text-right font-medium">
                  {artifact.modelName || "gemini-3-flash-preview"}
                </div>

                <div className="text-muted-foreground">Prompt Tokens</div>
                <div className="text-right font-medium">
                  {artifact.usage?.promptTokenCount?.toLocaleString() || "-"}
                </div>

                <div className="text-muted-foreground">Output Tokens</div>
                <div className="text-right font-medium">
                  {artifact.usage?.candidatesTokenCount?.toLocaleString() ||
                    "-"}
                </div>

                <div className="text-muted-foreground tracking-tight">
                  Total Tokens
                </div>
                <div className="text-right font-medium font-semibold">
                  {artifact.usage?.totalTokenCount?.toLocaleString() || "-"}
                </div>
              </div>

              <div className="pt-2 border-t flex items-center justify-between font-medium">
                <span className="text-muted-foreground tracking-tight">
                  Est. Cost
                </span>
                <span className="text-green-500 dark:text-green-400">
                  {artifact.usage
                    ? formatCost(
                        calculateCost(
                          artifact.modelName || "gemini-3-flash-preview",
                          artifact.usage.promptTokenCount || 0,
                          artifact.usage.candidatesTokenCount || 0,
                        ),
                      )
                    : "-"}
                </span>
              </div>
            </div>
          )}
          {artifact.isGenerating && (
            <div className="generating-overlay">
              <pre ref={codeRef} className="code-stream-preview">
                {artifact.streamingCode}
              </pre>
            </div>
          )}
          <iframe
            srcDoc={artifact.html}
            title={artifact.id}
            sandbox="allow-scripts allow-forms allow-modals allow-popups allow-presentation allow-same-origin"
            className="artifact-iframe"
          />
        </div>
      </div>
    );
  },
);
