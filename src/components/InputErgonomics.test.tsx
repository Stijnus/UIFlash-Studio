import { render, screen, fireEvent } from "@testing-library/react";
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

describe("Input Ergonomics Integration", () => {
  it("allows typing in the prompt area", () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="dark">
        <AppProvider>
          <App />
        </AppProvider>
      </ThemeProvider>,
    );
    const textarea = screen.getByPlaceholderText(/Describe your interface/i);
    fireEvent.change(textarea, { target: { value: "New Prompt" } });
    expect(textarea).toHaveValue("New Prompt");
  });

  it("renders asset lab input", () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="dark">
        <AppProvider>
          <App />
        </AppProvider>
      </ThemeProvider>,
    );
    expect(screen.getByPlaceholderText(/Cyberpunk logo/i)).toBeInTheDocument();
  });
});
