import { useApp } from "@/contexts/AppContext";
import { Bot, Zap, Cpu, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { MODELS } from "@/constants";

export const SideDrawer = () => {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    model,
    setModel,
    deviceMode,
    setDeviceMode,
  } = useApp();

  const models = [
    {
      id: MODELS.FLASH,
      name: "Gemini 3.1 Flash",
      desc: "Fast & efficient",
      icon: Zap,
    },
    {
      id: MODELS.PRO,
      name: "Gemini 3.1 Pro",
      desc: "Advanced reasoning",
      icon: Bot,
    },
    {
      id: MODELS.IMAGE,
      name: "Gemini 3.1 Image",
      desc: "Asset generation",
      icon: Cpu,
    },
  ];

  return (
    <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <SheetContent className="flex flex-col h-full sm:max-w-sm p-0 gap-0">
        <SheetHeader className="p-6 text-left border-b border-border/50">
          <SheetTitle className="text-xl font-bold tracking-tight">
            Studio Settings
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground mt-1">
            Configure your AI engine and environment
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
          {/* Model Selection */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              AI Model
            </h3>
            <div className="space-y-2">
              {models.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setModel(m.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group ${
                      model === m.id
                        ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20"
                        : "bg-secondary/10 border-border/30 hover:bg-secondary/20"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        model === m.id
                          ? "bg-primary text-white"
                          : "bg-background text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold">{m.name}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {m.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <Separator className="bg-border/30" />

          {/* Viewport Settings */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Default Viewport
            </h3>
            <div className="flex bg-secondary/30 p-1 rounded-xl">
              <Button
                variant={deviceMode === "desktop" ? "secondary" : "ghost"}
                className={`flex-1 rounded-lg text-xs gap-2 ${deviceMode === "desktop" ? "bg-background shadow-sm" : ""}`}
                onClick={() => setDeviceMode("desktop")}
              >
                Desktop
              </Button>
              <Button
                variant={deviceMode === "tablet" ? "secondary" : "ghost"}
                className={`flex-1 rounded-lg text-xs gap-2 ${deviceMode === "tablet" ? "bg-background shadow-sm" : ""}`}
                onClick={() => setDeviceMode("tablet")}
              >
                Tablet
              </Button>
              <Button
                variant={deviceMode === "mobile" ? "secondary" : "ghost"}
                className={`flex-1 rounded-lg text-xs gap-2 ${deviceMode === "mobile" ? "bg-background shadow-sm" : ""}`}
                onClick={() => setDeviceMode("mobile")}
              >
                Mobile
              </Button>
            </div>
          </section>

          <Separator className="bg-border/30" />

          {/* Info Card */}
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex gap-3">
            <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-primary">
                Experimental Feature
              </p>
              <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                Gemini 3.1 Pro is currently in preview. Performance and rate
                limits may vary during the beta period.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border/50 bg-secondary/5 mt-auto">
          <Button
            className="w-full rounded-xl h-11 font-bold"
            onClick={() => setIsDrawerOpen(false)}
          >
            Done
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
