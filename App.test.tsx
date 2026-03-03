import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import * as storage from './src/utils/storage';

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
}));

describe('App Component Persistence Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders correctly', () => {
    render(<App />);
    expect(screen.getByText(/UI Generator/i)).toBeInTheDocument();
  });

  it('loads sessions from storage on mount', () => {
    const mockSessions = [
      { id: '1', prompt: 'Saved Prompt', timestamp: Date.now(), artifacts: [] }
    ];
    vi.spyOn(storage, 'loadSessions').mockReturnValue(mockSessions);
    
    render(<App />);
    
    expect(storage.loadSessions).toHaveBeenCalled();
  });
});
