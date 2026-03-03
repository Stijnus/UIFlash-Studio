import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import * as storage from './src/utils/storage';
import { ThemeProvider } from './components/theme-provider';

// Mock dependencies
vi.mock('./src/services/geminiService', () => ({
  generateUI: vi.fn(),
  analyzeImages: vi.fn(),
  analyzeImageForFeedback: vi.fn(),
  generateImageAsset: vi.fn(),
}));

vi.mock('./components/SideDrawer', () => ({
  default: ({ children, isOpen }: any) => isOpen ? <div>{children}</div> : null,
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Settings: () => <div data-testid="icon-settings" />,
  Image: () => <div data-testid="icon-image" />,
  Code: () => <div data-testid="icon-code" />,
  Play: () => <div data-testid="icon-play" />,
  Smartphone: () => <div data-testid="icon-smartphone" />,
  Monitor: () => <div data-testid="icon-monitor" />,
  Trash2: () => <div data-testid="icon-trash" />,
  Layers: () => <div data-testid="icon-layers" />,
  Loader2: () => <div data-testid="icon-loader" />,
  Download: () => <div data-testid="icon-download" />,
  Copy: () => <div data-testid="icon-copy" />,
  Check: () => <div data-testid="icon-check" />,
  Search: () => <div data-testid="icon-search" />,
  Camera: () => <div data-testid="icon-camera" />,
  Sparkles: () => <div data-testid="icon-sparkles" />,
  Plus: () => <div data-testid="icon-plus" />,
  History: () => <div data-testid="icon-history" />,
  Clock: () => <div data-testid="icon-clock" />,
  ChevronRight: () => <div data-testid="icon-chevron" />,
  LayoutPanelLeft: () => <div data-testid="icon-layout" />,
  Sun: () => <div data-testid="icon-sun" />,
  Moon: () => <div data-testid="icon-moon" />,
}));

// Mock shadcn components
vi.mock('@/components/ui/sidebar', () => ({
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

vi.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: any) => <div>{children}</div>,
}));

// Mock ScrollArea and other potential sub-components if needed
// For now, these basic mocks should suffice for basic rendering tests.

describe('App Component Redesign Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderApp = () => {
    return render(
      <ThemeProvider attribute="class" defaultTheme="dark">
        <App />
      </ThemeProvider>
    );
  };

  it('renders correctly', () => {
    renderApp();
    expect(screen.getByRole('heading', { name: /^Studio$/i })).toBeInTheDocument();
  });

  it('loads sessions from storage on mount', () => {
    const mockSessions = [
      { id: '1', prompt: 'Saved Prompt', timestamp: Date.now(), artifacts: [] }
    ];
    vi.spyOn(storage, 'loadSessions').mockReturnValue(mockSessions);
    
    renderApp();
    
    expect(storage.loadSessions).toHaveBeenCalled();
  });
});
