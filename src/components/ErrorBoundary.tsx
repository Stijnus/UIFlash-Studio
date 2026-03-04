import { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-6">
          <div className="max-w-md w-full space-y-8 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-destructive" />
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-extrabold tracking-tight">
                Something went wrong
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                Studio encountered an unexpected error. Don't worry, your work
                might still be safe in history.
              </p>

              {this.state.error && (
                <div className="bg-secondary/50 rounded-xl p-4 text-xs font-mono text-left overflow-auto max-h-40 border border-border/50">
                  {this.state.error.toString()}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={this.handleReset}
                className="flex-1 h-12 rounded-xl gap-2 font-bold"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Application
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/")}
                className="flex-1 h-12 rounded-xl gap-2"
              >
                <Home className="w-4 h-4" />
                Return to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
