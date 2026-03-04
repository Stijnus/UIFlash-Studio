import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import App from "../App";
import { AppProvider } from "@/contexts/AppContext";
import { ThemeProvider } from "@/components/theme-provider";

// Mocking dependencies
vi.mock("../src/services/geminiService", () => ({
  generateUI: vi.fn(),
  analyzeImages: vi.fn(),
  analyzeImageForFeedback: vi.fn(),
  generateImageAsset: vi.fn(),
}));

vi.mock("./SideDrawer", () => ({
  SideDrawer: () => <div data-testid="side-drawer" />,
}));

// Mocking shadcn components
vi.mock("@/components/ui/sidebar", () => ({
  Sidebar: ({ children }: any) => <div data-testid="sidebar">{children}</div>,
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

describe("Artifact Preview Integration", () => {
  it("renders preview area", () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="dark">
        <AppProvider>
          <App />
        </AppProvider>
      </ThemeProvider>,
    );
    expect(screen.getByText(/Studio is ready/i)).toBeInTheDocument();
  });

  // More specific tests would require complex state manipulation which is easier manually for UI layout
});
