import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Monitor,
  Tablet,
  Smartphone,
  Check,
  Copy,
  Download,
  Camera,
  Settings,
} from "lucide-react";
import { ModeToggle } from "./mode-toggle";

interface TopNavProps {
  styleName: string;
  generatedHtml: string;
  copyCode: () => void;
  copied: boolean;
  downloadCode: () => void;
  downloadImage: () => void;
  deviceMode: "desktop" | "mobile" | "tablet";
  setDeviceMode: (v: "desktop" | "mobile" | "tablet") => void;
  viewMode: "preview" | "code" | "analysis";
  setViewMode: (v: "preview" | "code" | "analysis") => void;
  setIsDrawerOpen: (v: boolean) => void;
}

export function TopNav({
  styleName,
  generatedHtml,
  copyCode,
  copied,
  downloadCode,
  downloadImage,
  deviceMode,
  setDeviceMode,
  viewMode,
  setViewMode,
  setIsDrawerOpen,
}: TopNavProps) {
  return (
    <div className="h-16 w-full border-b border-border/50 flex items-center justify-between px-4 md:px-6 glass-panel z-20 shrink-0">
      <div className="flex items-center gap-2 md:gap-4">
        <SidebarTrigger className="h-9 w-9 rounded-lg border border-border" />
        <Separator
          orientation="vertical"
          className="h-4 bg-border/50 hidden md:block"
        />
        {styleName && (
          <div className="px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 md:gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            <span className="truncate max-w-[80px] md:max-w-none">
              {styleName}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {generatedHtml && (
          <div className="flex items-center gap-1 mr-1 md:mr-3 border-r border-border/50 pr-2 md:pr-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={copyCode}
              className="h-8 w-8 hover:bg-secondary/50"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={downloadCode}
              className="h-8 w-8 hover:bg-secondary/50 hidden sm:flex"
            >
              <Download className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={downloadImage}
              className="h-8 w-8 hover:bg-secondary/50 hidden sm:flex"
            >
              <Camera className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}

        <Tabs
          value={deviceMode}
          onValueChange={(v) => setDeviceMode(v as any)}
          className="bg-secondary/50 p-0.5 rounded-lg border border-border hidden sm:block"
        >
          <TabsList className="bg-transparent h-8 p-0">
            <TabsTrigger value="desktop" className="h-7 w-8 p-0">
              <Monitor className="w-3.5 h-3.5" />
            </TabsTrigger>
            <TabsTrigger value="tablet" className="h-7 w-8 p-0">
              <Tablet className="w-3.5 h-3.5" />
            </TabsTrigger>
            <TabsTrigger value="mobile" className="h-7 w-8 p-0">
              <Smartphone className="w-3.5 h-3.5" />
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs
          value={viewMode}
          onValueChange={(v) => setViewMode(v as any)}
          className="bg-secondary/50 p-0.5 rounded-lg border border-border"
        >
          <TabsList className="bg-transparent h-8 p-0">
            <TabsTrigger
              value="preview"
              className="h-7 px-2 md:px-3 text-[9px] md:text-[10px] font-bold uppercase"
            >
              View
            </TabsTrigger>
            <TabsTrigger
              value="code"
              className="h-7 px-2 md:px-3 text-[9px] md:text-[10px] font-bold uppercase"
            >
              Code
            </TabsTrigger>
            <TabsTrigger
              value="analysis"
              className="h-7 px-2 md:px-3 text-[9px] md:text-[10px] font-bold uppercase hidden md:flex"
            >
              Audit
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Separator orientation="vertical" className="h-4 bg-border/50" />
        <ModeToggle />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsDrawerOpen(true)}
          className="h-9 w-9 rounded-lg border border-border hidden sm:flex"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
