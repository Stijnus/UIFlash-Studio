import React, { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { Workspace } from "@/components/Workspace";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  Monitor,
  Tablet,
  Smartphone,
  Code2,
  Eye,
  Copy,
  Check,
  Image as ImageIcon,
  Settings2,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Info,
  Activity,
  X,
} from "lucide-react";
import { calculateCost, formatCost } from "@/utils/pricing";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SideDrawer } from "@/components/SideDrawer";
import { ModeToggle } from "@/components/mode-toggle";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/utils/helpers";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

const App: React.FC = () => {
  useKeyboardShortcuts();
  const {
    viewMode,
    setViewMode,
    deviceMode,
    setDeviceMode,
    copyCode,
    downloadCode,
    downloadImage,
    copied,
    activeGen,
    setIsDrawerOpen,
    createNewSession,
  } = useApp();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showStats, setShowStats] = useState(false);

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden font-sans selection:bg-primary/20 relative">
          <div className="grain-overlay" />
          <AppSidebar />

          <main className="flex-1 flex flex-col min-w-0 bg-secondary/5 relative">
            {/* Top Toolbar */}
            <header className="h-14 border-b border-border/50 bg-background/80 backdrop-blur-md flex items-center justify-between px-4 z-20 shrink-0">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                  {isSidebarOpen ? (
                    <PanelLeftClose className="w-4 h-4" />
                  ) : (
                    <PanelLeftOpen className="w-4 h-4" />
                  )}
                </Button>
                <Separator
                  orientation="vertical"
                  className="h-4 bg-border/50"
                />
                <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-lg">
                  <Button
                    variant={viewMode === "preview" ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-7 px-3 text-xs gap-1.5 rounded-md transition-all",
                      viewMode === "preview" && "bg-background shadow-sm",
                    )}
                    onClick={() => setViewMode("preview")}
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </Button>
                  <Button
                    variant={viewMode === "code" ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-7 px-3 text-xs gap-1.5 rounded-md transition-all",
                      viewMode === "code" && "bg-background shadow-sm",
                    )}
                    onClick={() => setViewMode("code")}
                  >
                    <Code2 className="w-3.5 h-3.5" /> Code
                  </Button>
                  <Button
                    variant={viewMode === "analysis" ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-7 px-3 text-xs gap-1.5 rounded-md transition-all",
                      viewMode === "analysis" && "bg-background shadow-sm",
                    )}
                    onClick={() => setViewMode("analysis")}
                  >
                    <Search className="w-3.5 h-3.5" /> Analysis
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-lg mr-2 shrink-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={
                          deviceMode === "desktop" ? "secondary" : "ghost"
                        }
                        size="icon"
                        className={cn(
                          "h-7 w-7 rounded-md",
                          deviceMode === "desktop" && "bg-background shadow-sm",
                        )}
                        onClick={() => setDeviceMode("desktop")}
                      >
                        <Monitor className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Desktop View</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={
                          deviceMode === "tablet" ? "secondary" : "ghost"
                        }
                        size="icon"
                        className={cn(
                          "h-7 w-7 rounded-md",
                          deviceMode === "tablet" && "bg-background shadow-sm",
                        )}
                        onClick={() => setDeviceMode("tablet")}
                      >
                        <Tablet className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Tablet View</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={
                          deviceMode === "mobile" ? "secondary" : "ghost"
                        }
                        size="icon"
                        className={cn(
                          "h-7 w-7 rounded-md",
                          deviceMode === "mobile" && "bg-background shadow-sm",
                        )}
                        onClick={() => setDeviceMode("mobile")}
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Mobile View</TooltipContent>
                  </Tooltip>
                </div>

                <div className="flex items-center gap-1">
                  {activeGen && (
                    <div className="relative">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors",
                              showStats && "bg-primary/10 text-primary",
                            )}
                            onClick={() => setShowStats(!showStats)}
                          >
                            <Info className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View AI Stats</TooltipContent>
                      </Tooltip>

                      {showStats && (
                        <div className="absolute top-10 right-0 z-50 w-72 p-4 bg-background/95 backdrop-blur-md rounded-xl border shadow-2xl flex flex-col gap-3 text-sm animate-in fade-in slide-in-from-top-2">
                          <div className="flex items-center justify-between pb-2 border-b">
                            <span className="font-semibold flex items-center gap-2">
                              <Activity size={14} className="text-primary" />{" "}
                              Generation Stats
                            </span>
                            <button
                              onClick={() => setShowStats(false)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <X size={12} />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="text-muted-foreground">Model</div>
                            <div className="text-right font-medium">
                              {activeGen.modelName || "gemini-3-flash-preview"}
                            </div>

                            <div className="text-muted-foreground">
                              Prompt Tokens
                            </div>
                            <div className="text-right font-medium">
                              {activeGen.usage?.promptTokenCount?.toLocaleString() ||
                                "-"}
                            </div>

                            <div className="text-muted-foreground">
                              Output Tokens
                            </div>
                            <div className="text-right font-medium">
                              {activeGen.usage?.candidatesTokenCount?.toLocaleString() ||
                                "-"}
                            </div>

                            <div className="text-muted-foreground tracking-tight">
                              Total Tokens
                            </div>
                            <div className="text-right font-medium font-semibold">
                              {activeGen.usage?.totalTokenCount?.toLocaleString() ||
                                "-"}
                            </div>
                          </div>

                          <div className="pt-2 border-t flex items-center justify-between font-medium">
                            <span className="text-muted-foreground tracking-tight">
                              Est. Cost
                            </span>
                            <span className="text-green-500 dark:text-green-400">
                              {activeGen.usage
                                ? formatCost(
                                    calculateCost(
                                      activeGen.modelName ||
                                        "gemini-3-flash-preview",
                                      activeGen.usage.promptTokenCount || 0,
                                      activeGen.usage.candidatesTokenCount || 0,
                                    ),
                                  )
                                : "-"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                        onClick={copyCode}
                        disabled={!activeGen}
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy Code</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                        onClick={downloadCode}
                        disabled={!activeGen}
                      >
                        <Code2 className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download HTML</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                        onClick={downloadImage}
                        disabled={!activeGen}
                      >
                        <ImageIcon className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Export Image</TooltipContent>
                  </Tooltip>

                  <Separator
                    orientation="vertical"
                    className="h-4 mx-1 bg-border/50"
                  />

                  <ModeToggle />

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                    onClick={() => setIsDrawerOpen(true)}
                  >
                    <Settings2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </header>

            {/* Workspace Area */}
            <Workspace />

            {/* Floating Action Menu (Mobile Friendly) */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-3 sm:hidden z-30">
              <Button
                size="icon"
                className="h-12 w-12 rounded-full shadow-xl bg-primary hover:bg-primary/90 text-white"
                onClick={createNewSession}
              >
                <Plus className="w-6 h-6" />
              </Button>
            </div>
          </main>

          <SideDrawer />
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
};

export default App;
