import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies at the top to ensure hoisting/resolution
vi.mock("@/services/geminiService", () => ({
  generateUI: vi.fn(),
  generateImageAsset: vi.fn(),
}));

vi.mock("@/components/SideDrawer", () => ({
  SideDrawer: () => <div data-testid="side-drawer" />,
}));

vi.mock("@/components/ui/sidebar", () => ({
  Sidebar: ({ children }: any) => <div>{children}</div>,
  SidebarContent: ({ children }: any) => <div>{children}</div>,
  SidebarFooter: ({ children }: any) => <div>{children}</div>,
  SidebarHeader: ({ children }: any) => <div>{children}</div>,
  SidebarProvider: ({ children }: any) => <div>{children}</div>,
  SidebarTrigger: () => <button>Trigger</button>,
  SidebarMenu: ({ children }: any) => <div>{children}</div>,
  SidebarMenuItem: ({ children }: any) => <div>{children}</div>,
  SidebarMenuButton: ({ children }: any) => <button>{children}</button>,
}));

vi.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: any) => <div>{children}</div>,
  Tooltip: ({ children }: any) => <div>{children}</div>,
  TooltipTrigger: ({ children }: any) => <div>{children}</div>,
  TooltipContent: ({ children }: any) => <div>{children}</div>,
}));

import { render, screen } from "@testing-library/react";
import App from "./App";
import * as storage from "@/utils/storage";
import { ThemeProvider } from "@/components/theme-provider";
import { AppProvider } from "@/contexts/AppContext";

describe("App Component Redesign Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderApp = () => {
    return render(
      <ThemeProvider attribute="class" defaultTheme="dark">
        <AppProvider>
          <App />
        </AppProvider>
      </ThemeProvider>,
    );
  };

  it("renders correctly", () => {
    renderApp();
    expect(screen.getByText(/UIFlash/i)).toBeInTheDocument();
  });

  it("loads sessions from storage on mount", () => {
    const mockSessions = [
      { id: "1", prompt: "Saved Prompt", timestamp: Date.now(), artifacts: [] },
    ];
    vi.spyOn(storage, "loadSessions").mockReturnValue(mockSessions);

    renderApp();

    expect(storage.loadSessions).toHaveBeenCalled();
  });
});
